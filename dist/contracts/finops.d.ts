import { z } from "zod";
/**
 * Matrice tariffaria per modello con supporto quadri-fascia (Multi-Tier)
 * per distinguere token uncached, cache read, cache write e output.
 */
export declare const ModelRateCardSchema: z.ZodObject<{
    inputCostPerMillion: z.ZodNumber;
    cacheReadCostPerMillion: z.ZodNumber;
    cacheWriteCostPerMillion: z.ZodNumber;
    outputCostPerMillion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    inputCostPerMillion: number;
    cacheReadCostPerMillion: number;
    cacheWriteCostPerMillion: number;
    outputCostPerMillion: number;
}, {
    inputCostPerMillion: number;
    cacheReadCostPerMillion: number;
    cacheWriteCostPerMillion: number;
    outputCostPerMillion: number;
}>;
export type ModelRateCard = z.infer<typeof ModelRateCardSchema>;
/**
 * Record di utilizzo token con granularità quadri-fascia e calcolo risparmio netto
 */
export declare const MultiTierTokenUsageRecordSchema: z.ZodObject<{
    id: z.ZodDefault<z.ZodString>;
    model: z.ZodString;
    uncachedInputTokens: z.ZodDefault<z.ZodNumber>;
    cacheReadTokens: z.ZodDefault<z.ZodNumber>;
    cacheWriteTokens: z.ZodDefault<z.ZodNumber>;
    outputTokens: z.ZodDefault<z.ZodNumber>;
    totalTokens: z.ZodNumber;
    actualCostUsd: z.ZodNumber;
    baselineCostUsd: z.ZodNumber;
    netSavingsUsd: z.ZodNumber;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    id: string;
    model: string;
    uncachedInputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    outputTokens: number;
    totalTokens: number;
    actualCostUsd: number;
    baselineCostUsd: number;
    netSavingsUsd: number;
}, {
    timestamp: string;
    model: string;
    totalTokens: number;
    actualCostUsd: number;
    baselineCostUsd: number;
    netSavingsUsd: number;
    id?: string | undefined;
    uncachedInputTokens?: number | undefined;
    cacheReadTokens?: number | undefined;
    cacheWriteTokens?: number | undefined;
    outputTokens?: number | undefined;
}>;
export type MultiTierTokenUsageRecord = z.infer<typeof MultiTierTokenUsageRecordSchema>;
/**
 * Riepilogo aggregato FinOps per la dashboard
 */
export declare const FinOpsSummarySchema: z.ZodObject<{
    totalActualCostUsd: z.ZodNumber;
    totalBaselineCostUsd: z.ZodNumber;
    totalNetSavingsUsd: z.ZodNumber;
    cacheSavingsRatio: z.ZodNumber;
    totalUncachedInputTokens: z.ZodNumber;
    totalCacheReadTokens: z.ZodNumber;
    totalCacheWriteTokens: z.ZodNumber;
    totalOutputTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    recordsCount: z.ZodNumber;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    totalTokens: number;
    totalActualCostUsd: number;
    totalBaselineCostUsd: number;
    totalNetSavingsUsd: number;
    cacheSavingsRatio: number;
    totalUncachedInputTokens: number;
    totalCacheReadTokens: number;
    totalCacheWriteTokens: number;
    totalOutputTokens: number;
    recordsCount: number;
}, {
    updatedAt: string;
    totalTokens: number;
    totalActualCostUsd: number;
    totalBaselineCostUsd: number;
    totalNetSavingsUsd: number;
    cacheSavingsRatio: number;
    totalUncachedInputTokens: number;
    totalCacheReadTokens: number;
    totalCacheWriteTokens: number;
    totalOutputTokens: number;
    recordsCount: number;
}>;
export type FinOpsSummary = z.infer<typeof FinOpsSummarySchema>;
//# sourceMappingURL=finops.d.ts.map