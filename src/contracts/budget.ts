import { z } from "zod";

export const ModelRateSchema = z.object({
  inputCostPerMillion: z.number().nonnegative(),
  outputCostPerMillion: z.number().nonnegative(),
});
export type ModelRate = z.infer<typeof ModelRateSchema>;

export const TokenUsageRecordSchema = z.object({
  model: z.string(),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
  timestamp: z.string().datetime(),
});
export type TokenUsageRecord = z.infer<typeof TokenUsageRecordSchema>;

export const BudgetConfigSchema = z.object({
  maxBudgetUsd: z.number().positive().default(10.0),
  warningThresholdPercent: z.number().positive().default(80.0),
  graceMarginPercent: z.number().nonnegative().default(5.0), // buffer del 5% per completare checkpoint
});
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;

export const BudgetStatusSchema = z.object({
  totalCostUsd: z.number().nonnegative(),
  maxBudgetUsd: z.number().positive(),
  percentUsed: z.number().nonnegative(),
  status: z.enum(["OK", "WARNING", "EXCEEDED_GRACE", "HALTED"]),
  remainingBudgetUsd: z.number(),
  recordsCount: z.number().int().nonnegative(),
});
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;
