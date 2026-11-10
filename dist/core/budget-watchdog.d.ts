import { type BudgetConfig, type BudgetStatus, type TokenUsageRecord, type ModelRate } from "../contracts/budget.js";
import { type TokenUsageInput } from "./finops-engine.js";
import type { FinOpsSummary, MultiTierTokenUsageRecord } from "../contracts/finops.js";
import { CompanyEventBus } from "./event-bus.js";
import type { SteeringEngine } from "./steering-engine.js";
export declare const DEFAULT_MODEL_RATES: Record<string, ModelRate>;
export declare class BudgetWatchdog {
    private config;
    private records;
    private eventBus;
    private warned80;
    private customRates;
    private static readonly MAX_RECORDS;
    private foldedCostUsd;
    private foldedCount;
    /** Push limitato: oltre MAX_RECORDS il più vecchio viene ripiegato nell'aggregato. */
    private pushBounded;
    constructor(config?: Partial<BudgetConfig>, options?: {
        eventBus?: CompanyEventBus;
        customRates?: Record<string, ModelRate>;
    });
    /**
     * Calcola il costo stimato in USD per un'invocazione LLM
     */
    calculateCost(model: string, promptTokens: number, completionTokens: number): number;
    /**
     * Registra il consumo di token per una chiamata API
     */
    recordUsage(model: string, promptTokens: number, completionTokens: number): TokenUsageRecord;
    /**
     * Registra il consumo quadri-fascia di token (Prompt Caching aware)
     */
    recordMultiTierUsage(model: string, usage: TokenUsageInput): MultiTierTokenUsageRecord;
    /**
     * Restituisce il riepilogo aggregato FinOps
     */
    getFinOpsSummary(): FinOpsSummary;
    /**
     * Restituisce lo stato attuale del budget e la percentuale utilizzata
     */
    getBudgetStatus(): BudgetStatus;
    /**
     * Valuta lo stato del budget ed esegue azioni automatiche (avvisi sul bus o Safe-Pause dell'engine)
     */
    evaluateBudget(steeringEngine?: SteeringEngine): Promise<BudgetStatus>;
    /**
     * Reset dello stato per test
     */
    reset(): void;
}
//# sourceMappingURL=budget-watchdog.d.ts.map