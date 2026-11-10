import { z } from "zod";
/**
 * Livelli dello stato di salute del contesto (Context Health)
 */
export declare const ContextHealthStatusSchema: z.ZodEnum<["EXCELLENT", "NOMINAL", "ROT_RISK", "CRITICAL_ROT"]>;
export type ContextHealthStatus = z.infer<typeof ContextHealthStatusSchema>;
/**
 * Azione raccomandata dall'Anti-Rot Memory Core
 */
export declare const RecommendedCompactionActionSchema: z.ZodEnum<["NONE", "MONITOR", "COMPACT", "FORCED_COMPACT"]>;
export type RecommendedCompactionAction = z.infer<typeof RecommendedCompactionActionSchema>;
/**
 * Report dello stato di salute della finestra di contesto
 */
export declare const ContextHealthReportSchema: z.ZodObject<{
    currentTokens: z.ZodNumber;
    healthScore: z.ZodNumber;
    status: z.ZodEnum<["EXCELLENT", "NOMINAL", "ROT_RISK", "CRITICAL_ROT"]>;
    recommendedAction: z.ZodEnum<["NONE", "MONITOR", "COMPACT", "FORCED_COMPACT"]>;
    compactionThreshold: z.ZodDefault<z.ZodNumber>;
    criticalThreshold: z.ZodDefault<z.ZodNumber>;
    message: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "ROT_RISK" | "EXCELLENT" | "NOMINAL" | "CRITICAL_ROT";
    updatedAt: string;
    healthScore: number;
    currentTokens: number;
    recommendedAction: "NONE" | "MONITOR" | "COMPACT" | "FORCED_COMPACT";
    compactionThreshold: number;
    criticalThreshold: number;
}, {
    message: string;
    status: "ROT_RISK" | "EXCELLENT" | "NOMINAL" | "CRITICAL_ROT";
    updatedAt: string;
    healthScore: number;
    currentTokens: number;
    recommendedAction: "NONE" | "MONITOR" | "COMPACT" | "FORCED_COMPACT";
    compactionThreshold?: number | undefined;
    criticalThreshold?: number | undefined;
}>;
export type ContextHealthReport = z.infer<typeof ContextHealthReportSchema>;
//# sourceMappingURL=health.d.ts.map