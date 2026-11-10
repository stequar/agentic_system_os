import {
  type ModelRateCard,
  type MultiTierTokenUsageRecord,
  type FinOpsSummary,
  ModelRateCardSchema,
  MultiTierTokenUsageRecordSchema,
  FinOpsSummarySchema,
} from "../contracts/finops.js";
import { CompanyEventBus } from "./event-bus.js";

export const DEFAULT_MODEL_RATE_CARDS: Record<string, ModelRateCard> = {
  "claude-3-5-sonnet": {
    inputCostPerMillion: 3.0,
    cacheReadCostPerMillion: 0.3,   // 90% discount
    cacheWriteCostPerMillion: 3.75, // 125% standard input
    outputCostPerMillion: 15.0,
  },
  "claude-3-5-haiku": {
    inputCostPerMillion: 0.8,
    cacheReadCostPerMillion: 0.08,  // 90% discount
    cacheWriteCostPerMillion: 1.0,
    outputCostPerMillion: 4.0,
  },
  "gpt-4o": {
    inputCostPerMillion: 2.5,
    cacheReadCostPerMillion: 1.25,  // 50% discount
    cacheWriteCostPerMillion: 2.5,
    outputCostPerMillion: 10.0,
  },
  "gpt-4o-mini": {
    inputCostPerMillion: 0.15,
    cacheReadCostPerMillion: 0.075, // 50% discount
    cacheWriteCostPerMillion: 0.15,
    outputCostPerMillion: 0.6,
  },
  "gemini-1.5-pro": {
    inputCostPerMillion: 1.25,
    cacheReadCostPerMillion: 0.3125,// 75% discount
    cacheWriteCostPerMillion: 1.25,
    outputCostPerMillion: 5.0,
  },
  "gemini-1.5-flash": {
    inputCostPerMillion: 0.075,
    cacheReadCostPerMillion: 0.01875, // 75% discount
    cacheWriteCostPerMillion: 0.075,
    outputCostPerMillion: 0.3,
  },
  default: {
    inputCostPerMillion: 2.0,
    cacheReadCostPerMillion: 0.5,
    cacheWriteCostPerMillion: 2.0,
    outputCostPerMillion: 8.0,
  },
};

export interface TokenUsageInput {
  uncachedInputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  outputTokens?: number;
}

export class FinOpsEngine {
  private static instance?: FinOpsEngine;
  private records: MultiTierTokenUsageRecord[] = [];
  // Tier-2 (growth cap): la lista dettagliata è limitata; i record più vecchi sono "ripiegati"
  // in un aggregato cumulativo così i totali restano ESATTI senza crescita illimitata.
  private static readonly MAX_RECORDS = 10_000;
  private folded = {
    actualCost: 0,
    baselineCost: 0,
    netSavings: 0,
    uncached: 0,
    cacheRead: 0,
    cacheWrite: 0,
    output: 0,
    count: 0,
  };
  private rateCards: Record<string, ModelRateCard>;
  private eventBus: CompanyEventBus;

  constructor(options?: {
    customRates?: Record<string, ModelRateCard>;
    eventBus?: CompanyEventBus;
  }) {
    this.rateCards = { ...DEFAULT_MODEL_RATE_CARDS, ...(options?.customRates || {}) };
    this.eventBus = options?.eventBus || CompanyEventBus.getInstance();
  }

  static getInstance(): FinOpsEngine {
    if (!FinOpsEngine.instance) {
      FinOpsEngine.instance = new FinOpsEngine();
    }
    return FinOpsEngine.instance;
  }

  getRateCard(model: string): ModelRateCard {
    const key = model.toLowerCase();
    return this.rateCards[key] || this.rateCards["default"];
  }

  setRateCard(model: string, card: ModelRateCard): void {
    const parsed = ModelRateCardSchema.parse(card);
    this.rateCards[model.toLowerCase()] = parsed;
  }

  /**
   * Calcola il costo effettivo, il costo baseline uncached e il risparmio netto in dollari.
   */
  calculateCostAndSavings(
    model: string,
    usage: TokenUsageInput
  ): {
    actualCostUsd: number;
    baselineCostUsd: number;
    netSavingsUsd: number;
    totalTokens: number;
  } {
    const rate = this.getRateCard(model);
    const uncached = usage.uncachedInputTokens || 0;
    const cacheRead = usage.cacheReadTokens || 0;
    const cacheWrite = usage.cacheWriteTokens || 0;
    const output = usage.outputTokens || 0;
    const totalTokens = uncached + cacheRead + cacheWrite + output;

    // 1. Costo effettivo addebitato
    const actual =
      (uncached * rate.inputCostPerMillion +
        cacheRead * rate.cacheReadCostPerMillion +
        cacheWrite * rate.cacheWriteCostPerMillion +
        output * rate.outputCostPerMillion) /
      1_000_000;

    // 2. Costo baseline se tutti i token di input fossero non cachati
    const baseline =
      ((uncached + cacheRead + cacheWrite) * rate.inputCostPerMillion +
        output * rate.outputCostPerMillion) /
      1_000_000;

    const actualCostUsd = Math.round(actual * 100_000) / 100_000;
    const baselineCostUsd = Math.round(baseline * 100_000) / 100_000;
    const netSavingsUsd = Math.round((baselineCostUsd - actualCostUsd) * 100_000) / 100_000;

    return {
      actualCostUsd,
      baselineCostUsd,
      netSavingsUsd,
      totalTokens,
    };
  }

  /**
   * Registra una chiamata LLM con granularità multi-tier.
   */
  recordUsage(model: string, usage: TokenUsageInput): MultiTierTokenUsageRecord {
    const uncached = usage.uncachedInputTokens || 0;
    const cacheRead = usage.cacheReadTokens || 0;
    const cacheWrite = usage.cacheWriteTokens || 0;
    const output = usage.outputTokens || 0;

    const { actualCostUsd, baselineCostUsd, netSavingsUsd, totalTokens } =
      this.calculateCostAndSavings(model, usage);

    const record: MultiTierTokenUsageRecord = MultiTierTokenUsageRecordSchema.parse({
      model,
      uncachedInputTokens: uncached,
      cacheReadTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
      outputTokens: output,
      totalTokens,
      actualCostUsd,
      baselineCostUsd,
      netSavingsUsd,
      timestamp: new Date().toISOString(),
    });

    this.records.push(record);
    if (this.records.length > FinOpsEngine.MAX_RECORDS) {
      const old = this.records.shift()!;
      this.folded.actualCost += old.actualCostUsd;
      this.folded.baselineCost += old.baselineCostUsd;
      this.folded.netSavings += old.netSavingsUsd;
      this.folded.uncached += old.uncachedInputTokens;
      this.folded.cacheRead += old.cacheReadTokens;
      this.folded.cacheWrite += old.cacheWriteTokens;
      this.folded.output += old.outputTokens;
      this.folded.count += 1;
    }
    return record;
  }

  /**
   * Restituisce il riepilogo aggregato FinOps
   */
  getSummary(): FinOpsSummary {
    // Parte dall'aggregato ripiegato (record vecchi evicti) così i totali restano esatti.
    let totalActualCost = this.folded.actualCost;
    let totalBaselineCost = this.folded.baselineCost;
    let totalNetSavings = this.folded.netSavings;
    let totalUncached = this.folded.uncached;
    let totalCacheRead = this.folded.cacheRead;
    let totalCacheWrite = this.folded.cacheWrite;
    let totalOutput = this.folded.output;

    for (const r of this.records) {
      totalActualCost += r.actualCostUsd;
      totalBaselineCost += r.baselineCostUsd;
      totalNetSavings += r.netSavingsUsd;
      totalUncached += r.uncachedInputTokens;
      totalCacheRead += r.cacheReadTokens;
      totalCacheWrite += r.cacheWriteTokens;
      totalOutput += r.outputTokens;
    }

    const totalActualCostUsd = Math.round(totalActualCost * 10_000) / 10_000;
    const totalBaselineCostUsd = Math.round(totalBaselineCost * 10_000) / 10_000;
    const totalNetSavingsUsd = Math.round(totalNetSavings * 10_000) / 10_000;

    const cacheSavingsRatio =
      totalBaselineCostUsd > 0
        ? Math.round((totalNetSavingsUsd / totalBaselineCostUsd) * 1000) / 10
        : 0;

    return FinOpsSummarySchema.parse({
      totalActualCostUsd,
      totalBaselineCostUsd,
      totalNetSavingsUsd,
      cacheSavingsRatio,
      totalUncachedInputTokens: totalUncached,
      totalCacheReadTokens: totalCacheRead,
      totalCacheWriteTokens: totalCacheWrite,
      totalOutputTokens: totalOutput,
      totalTokens: totalUncached + totalCacheRead + totalCacheWrite + totalOutput,
      recordsCount: this.folded.count + this.records.length,
      updatedAt: new Date().toISOString(),
    });
  }

  getRecords(): MultiTierTokenUsageRecord[] {
    return [...this.records];
  }

  reset(): void {
    this.records = [];
    this.folded = {
      actualCost: 0,
      baselineCost: 0,
      netSavings: 0,
      uncached: 0,
      cacheRead: 0,
      cacheWrite: 0,
      output: 0,
      count: 0,
    };
  }
}
