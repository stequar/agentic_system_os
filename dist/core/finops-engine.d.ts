import { type ModelRateCard, type MultiTierTokenUsageRecord, type FinOpsSummary } from "../contracts/finops.js";
import { CompanyEventBus } from "./event-bus.js";
export declare const DEFAULT_MODEL_RATE_CARDS: Record<string, ModelRateCard>;
export interface TokenUsageInput {
    uncachedInputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
    outputTokens?: number;
}
export declare class FinOpsEngine {
    private static instance?;
    private records;
    private static readonly MAX_RECORDS;
    private folded;
    private rateCards;
    private eventBus;
    constructor(options?: {
        customRates?: Record<string, ModelRateCard>;
        eventBus?: CompanyEventBus;
    });
    static getInstance(): FinOpsEngine;
    getRateCard(model: string): ModelRateCard;
    setRateCard(model: string, card: ModelRateCard): void;
    /**
     * Calcola il costo effettivo, il costo baseline uncached e il risparmio netto in dollari.
     */
    calculateCostAndSavings(model: string, usage: TokenUsageInput): {
        actualCostUsd: number;
        baselineCostUsd: number;
        netSavingsUsd: number;
        totalTokens: number;
    };
    /**
     * Registra una chiamata LLM con granularità multi-tier.
     */
    recordUsage(model: string, usage: TokenUsageInput): MultiTierTokenUsageRecord;
    /**
     * Restituisce il riepilogo aggregato FinOps
     */
    getSummary(): FinOpsSummary;
    getRecords(): MultiTierTokenUsageRecord[];
    reset(): void;
}
//# sourceMappingURL=finops-engine.d.ts.map