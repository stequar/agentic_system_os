import { z } from "zod";
export declare const ModelRateSchema: z.ZodObject<{
    inputCostPerMillion: z.ZodNumber;
    outputCostPerMillion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    inputCostPerMillion: number;
    outputCostPerMillion: number;
}, {
    inputCostPerMillion: number;
    outputCostPerMillion: number;
}>;
export type ModelRate = z.infer<typeof ModelRateSchema>;
export declare const TokenUsageRecordSchema: z.ZodObject<{
    model: z.ZodString;
    promptTokens: z.ZodNumber;
    completionTokens: z.ZodNumber;
    totalTokens: z.ZodNumber;
    estimatedCostUsd: z.ZodNumber;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    model: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
}, {
    timestamp: string;
    model: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
}>;
export type TokenUsageRecord = z.infer<typeof TokenUsageRecordSchema>;
export declare const BudgetConfigSchema: z.ZodObject<{
    maxBudgetUsd: z.ZodDefault<z.ZodNumber>;
    warningThresholdPercent: z.ZodDefault<z.ZodNumber>;
    graceMarginPercent: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxBudgetUsd: number;
    warningThresholdPercent: number;
    graceMarginPercent: number;
}, {
    maxBudgetUsd?: number | undefined;
    warningThresholdPercent?: number | undefined;
    graceMarginPercent?: number | undefined;
}>;
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;
export declare const BudgetStatusSchema: z.ZodObject<{
    totalCostUsd: z.ZodNumber;
    maxBudgetUsd: z.ZodNumber;
    percentUsed: z.ZodNumber;
    status: z.ZodEnum<["OK", "WARNING", "EXCEEDED_GRACE", "HALTED"]>;
    remainingBudgetUsd: z.ZodNumber;
    recordsCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "OK" | "WARNING" | "EXCEEDED_GRACE" | "HALTED";
    recordsCount: number;
    percentUsed: number;
    maxBudgetUsd: number;
    totalCostUsd: number;
    remainingBudgetUsd: number;
}, {
    status: "OK" | "WARNING" | "EXCEEDED_GRACE" | "HALTED";
    recordsCount: number;
    percentUsed: number;
    maxBudgetUsd: number;
    totalCostUsd: number;
    remainingBudgetUsd: number;
}>;
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;
//# sourceMappingURL=budget.d.ts.map