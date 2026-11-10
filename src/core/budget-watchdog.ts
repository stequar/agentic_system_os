import {
  BudgetConfigSchema,
  BudgetStatusSchema,
  TokenUsageRecordSchema,
  type BudgetConfig,
  type BudgetStatus,
  type TokenUsageRecord,
  type ModelRate,
} from "../contracts/budget.js";
import { FinOpsEngine, type TokenUsageInput } from "./finops-engine.js";
import type { FinOpsSummary, MultiTierTokenUsageRecord } from "../contracts/finops.js";
import { CompanyEventBus } from "./event-bus.js";
import type { SteeringEngine } from "./steering-engine.js";

export const DEFAULT_MODEL_RATES: Record<string, ModelRate> = {
  "claude-3-5-sonnet": { inputCostPerMillion: 3.0, outputCostPerMillion: 15.0 },
  "claude-3-5-haiku": { inputCostPerMillion: 0.8, outputCostPerMillion: 4.0 },
  "gpt-4o": { inputCostPerMillion: 2.5, outputCostPerMillion: 10.0 },
  "gpt-4o-mini": { inputCostPerMillion: 0.15, outputCostPerMillion: 0.6 },
  "gemini-1.5-pro": { inputCostPerMillion: 1.25, outputCostPerMillion: 5.0 },
  "gemini-1.5-flash": { inputCostPerMillion: 0.075, outputCostPerMillion: 0.3 },
  default: { inputCostPerMillion: 2.0, outputCostPerMillion: 8.0 },
};

export class BudgetWatchdog {
  private config: BudgetConfig;
  private records: TokenUsageRecord[] = [];
  private eventBus: CompanyEventBus;
  private warned80: boolean = false;
  private customRates: Record<string, ModelRate>;
  // Tier-2 (growth cap): record vecchi ripiegati in un aggregato cumulativo (totali esatti).
  private static readonly MAX_RECORDS = 10_000;
  private foldedCostUsd = 0;
  private foldedCount = 0;

  /** Push limitato: oltre MAX_RECORDS il più vecchio viene ripiegato nell'aggregato. */
  private pushBounded(record: TokenUsageRecord): void {
    this.records.push(record);
    if (this.records.length > BudgetWatchdog.MAX_RECORDS) {
      const old = this.records.shift()!;
      this.foldedCostUsd += old.estimatedCostUsd;
      this.foldedCount += 1;
    }
  }

  constructor(
    config?: Partial<BudgetConfig>,
    options?: { eventBus?: CompanyEventBus; customRates?: Record<string, ModelRate> }
  ) {
    this.config = BudgetConfigSchema.parse(config || {});
    this.eventBus = options?.eventBus || CompanyEventBus.getInstance();
    this.customRates = { ...DEFAULT_MODEL_RATES, ...(options?.customRates || {}) };
  }

  /**
   * Calcola il costo stimato in USD per un'invocazione LLM
   */
  calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const rate = this.customRates[model.toLowerCase()] || this.customRates["default"];
    const inputCost = (promptTokens * rate.inputCostPerMillion) / 1_000_000;
    const outputCost = (completionTokens * rate.outputCostPerMillion) / 1_000_000;
    const total = inputCost + outputCost;
    return Math.round(total * 100_000) / 100_000; // 5 decimali
  }

  /**
   * Registra il consumo di token per una chiamata API
   */
  recordUsage(model: string, promptTokens: number, completionTokens: number): TokenUsageRecord {
    const cost = this.calculateCost(model, promptTokens, completionTokens);
    const totalTokens = promptTokens + completionTokens;

    const record: TokenUsageRecord = TokenUsageRecordSchema.parse({
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: cost,
      timestamp: new Date().toISOString(),
    });

    this.pushBounded(record);

    // Sincronizza anche con FinOpsEngine
    try {
      FinOpsEngine.getInstance().recordUsage(model, {
        uncachedInputTokens: promptTokens,
        outputTokens: completionTokens,
      });
    } catch {}

    return record;
  }

  /**
   * Registra il consumo quadri-fascia di token (Prompt Caching aware)
   */
  recordMultiTierUsage(model: string, usage: TokenUsageInput): MultiTierTokenUsageRecord {
    const finopsRecord = FinOpsEngine.getInstance().recordUsage(model, usage);
    const promptTokens = (usage.uncachedInputTokens || 0) + (usage.cacheReadTokens || 0) + (usage.cacheWriteTokens || 0);
    const completionTokens = usage.outputTokens || 0;

    const record: TokenUsageRecord = TokenUsageRecordSchema.parse({
      model,
      promptTokens,
      completionTokens,
      totalTokens: finopsRecord.totalTokens,
      estimatedCostUsd: finopsRecord.actualCostUsd,
      timestamp: finopsRecord.timestamp,
    });

    this.pushBounded(record);
    return finopsRecord;
  }

  /**
   * Restituisce il riepilogo aggregato FinOps
   */
  getFinOpsSummary(): FinOpsSummary {
    return FinOpsEngine.getInstance().getSummary();
  }

  /**
   * Restituisce lo stato attuale del budget e la percentuale utilizzata
   */
  getBudgetStatus(): BudgetStatus {
    const totalCost =
      this.foldedCostUsd + this.records.reduce((acc, r) => acc + r.estimatedCostUsd, 0);
    const totalCostUsd = Math.round(totalCost * 10_000) / 10_000;
    const percentUsed = Math.round((totalCostUsd / this.config.maxBudgetUsd) * 1000) / 10;
    const remainingBudgetUsd = Math.max(0, Math.round((this.config.maxBudgetUsd - totalCostUsd) * 10_000) / 10_000);

    const hardLimitPercent = 100.0 + this.config.graceMarginPercent;

    let status: "OK" | "WARNING" | "EXCEEDED_GRACE" | "HALTED" = "OK";

    if (percentUsed >= hardLimitPercent) {
      status = "HALTED";
    } else if (percentUsed >= 100.0) {
      status = "EXCEEDED_GRACE";
    } else if (percentUsed >= this.config.warningThresholdPercent) {
      status = "WARNING";
    }

    return BudgetStatusSchema.parse({
      totalCostUsd,
      maxBudgetUsd: this.config.maxBudgetUsd,
      percentUsed,
      status,
      remainingBudgetUsd,
      recordsCount: this.foldedCount + this.records.length,
    });
  }

  /**
   * Valuta lo stato del budget ed esegue azioni automatiche (avvisi sul bus o Safe-Pause dell'engine)
   */
  async evaluateBudget(steeringEngine?: SteeringEngine): Promise<BudgetStatus> {
    const status = this.getBudgetStatus();

    // 1. Allarme soglia 80%
    if (status.status === "WARNING" && !this.warned80) {
      this.warned80 = true;
      await this.eventBus.emit({
        type: "BUDGET_WARNING",
        sourceAgent: "budget_watchdog",
        level: "warn",
        payload: {
          percentUsed: status.percentUsed,
          totalCostUsd: status.totalCostUsd,
          maxBudgetUsd: status.maxBudgetUsd,
        },
      });
    }

    // 2. Soglia 100% superata: richiede safe-pause cooperativa
    if (status.status === "EXCEEDED_GRACE" || status.status === "HALTED") {
      await this.eventBus.emit({
        type: "BUDGET_EXCEEDED",
        sourceAgent: "budget_watchdog",
        level: "error",
        payload: {
          percentUsed: status.percentUsed,
          totalCostUsd: status.totalCostUsd,
          graceMarginPercent: this.config.graceMarginPercent,
          status: status.status,
        },
      });

      if (steeringEngine) {
        steeringEngine.requestPause({
          action: "pause",
          message: `Budget esaurito (${status.percentUsed}% di $${status.maxBudgetUsd}). Attivazione SAFE_PAUSED.`,
        });
      }
    }

    return status;
  }

  /**
   * Reset dello stato per test
   */
  reset(): void {
    this.records = [];
    this.warned80 = false;
    this.foldedCostUsd = 0;
    this.foldedCount = 0;
  }
}
