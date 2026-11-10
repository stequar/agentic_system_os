import { z } from "zod";

/**
 * Matrice tariffaria per modello con supporto quadri-fascia (Multi-Tier)
 * per distinguere token uncached, cache read, cache write e output.
 */
export const ModelRateCardSchema = z.object({
  inputCostPerMillion: z.number().nonnegative().describe("Costo per milione di token di input standard (uncached)"),
  cacheReadCostPerMillion: z.number().nonnegative().describe("Costo per milione di token letti da cache"),
  cacheWriteCostPerMillion: z.number().nonnegative().describe("Costo per milione di token scritti/creati in cache"),
  outputCostPerMillion: z.number().nonnegative().describe("Costo per milione di token generati in output"),
});
export type ModelRateCard = z.infer<typeof ModelRateCardSchema>;

/**
 * Record di utilizzo token con granularità quadri-fascia e calcolo risparmio netto
 */
export const MultiTierTokenUsageRecordSchema = z.object({
  id: z.string().default(() => `usage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
  model: z.string(),
  uncachedInputTokens: z.number().int().nonnegative().default(0),
  cacheReadTokens: z.number().int().nonnegative().default(0),
  cacheWriteTokens: z.number().int().nonnegative().default(0),
  outputTokens: z.number().int().nonnegative().default(0),
  totalTokens: z.number().int().nonnegative(),
  actualCostUsd: z.number().nonnegative().describe("Costo effettivo reale addebitato"),
  baselineCostUsd: z.number().nonnegative().describe("Costo ipotetico equivalente se tutti i token fossero uncached"),
  netSavingsUsd: z.number().describe("Risparmio netto in dollari (baseline - actual)"),
  timestamp: z.string().datetime(),
});
export type MultiTierTokenUsageRecord = z.infer<typeof MultiTierTokenUsageRecordSchema>;

/**
 * Riepilogo aggregato FinOps per la dashboard
 */
export const FinOpsSummarySchema = z.object({
  totalActualCostUsd: z.number().nonnegative(),
  totalBaselineCostUsd: z.number().nonnegative(),
  totalNetSavingsUsd: z.number(),
  cacheSavingsRatio: z.number().nonnegative().describe("Percentuale di risparmio netto rispetto alla baseline (0-100%)"),
  totalUncachedInputTokens: z.number().int().nonnegative(),
  totalCacheReadTokens: z.number().int().nonnegative(),
  totalCacheWriteTokens: z.number().int().nonnegative(),
  totalOutputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  recordsCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});
export type FinOpsSummary = z.infer<typeof FinOpsSummarySchema>;
