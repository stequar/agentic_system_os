import { z } from "zod";
export declare const ResearchedToolSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    pros: z.ZodArray<z.ZodString, "many">;
    cons: z.ZodArray<z.ZodString, "many">;
    recommendation: z.ZodEnum<["adopt", "evaluate", "avoid"]>;
    notes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: string;
    recommendation: "adopt" | "evaluate" | "avoid";
    pros: string[];
    cons: string[];
    notes: string;
    url?: string | undefined;
}, {
    name: string;
    category: string;
    recommendation: "adopt" | "evaluate" | "avoid";
    pros: string[];
    cons: string[];
    notes: string;
    url?: string | undefined;
}>;
export declare const RiskMitigationSchema: z.ZodObject<{
    risk: z.ZodString;
    impact: z.ZodEnum<["low", "medium", "high", "critical"]>;
    mitigation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    risk: string;
    impact: "critical" | "low" | "high" | "medium";
    mitigation: string;
}, {
    risk: string;
    impact: "critical" | "low" | "high" | "medium";
    mitigation: string;
}>;
export declare const TechValidationReportSchema: z.ZodObject<{
    sprintId: z.ZodString;
    sprintTheme: z.ZodString;
    executiveSummary: z.ZodString;
    proposedDecisions: z.ZodArray<z.ZodString, "many">;
    benchmarksAndTools: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        category: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        pros: z.ZodArray<z.ZodString, "many">;
        cons: z.ZodArray<z.ZodString, "many">;
        recommendation: z.ZodEnum<["adopt", "evaluate", "avoid"]>;
        notes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        category: string;
        recommendation: "adopt" | "evaluate" | "avoid";
        pros: string[];
        cons: string[];
        notes: string;
        url?: string | undefined;
    }, {
        name: string;
        category: string;
        recommendation: "adopt" | "evaluate" | "avoid";
        pros: string[];
        cons: string[];
        notes: string;
        url?: string | undefined;
    }>, "many">>;
    bestPractices: z.ZodArray<z.ZodString, "many">;
    risksAndMitigations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        risk: z.ZodString;
        impact: z.ZodEnum<["low", "medium", "high", "critical"]>;
        mitigation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        risk: string;
        impact: "critical" | "low" | "high" | "medium";
        mitigation: string;
    }, {
        risk: string;
        impact: "critical" | "low" | "high" | "medium";
        mitigation: string;
    }>, "many">>;
    verdict: z.ZodEnum<["APPROVED", "ADJUSTMENTS_RECOMMENDED", "REJECTED"]>;
    finalRecommendations: z.ZodArray<z.ZodString, "many">;
    sources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    validatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    verdict: "APPROVED" | "REJECTED" | "ADJUSTMENTS_RECOMMENDED";
    sprintId: string;
    sprintTheme: string;
    executiveSummary: string;
    proposedDecisions: string[];
    benchmarksAndTools: {
        name: string;
        category: string;
        recommendation: "adopt" | "evaluate" | "avoid";
        pros: string[];
        cons: string[];
        notes: string;
        url?: string | undefined;
    }[];
    bestPractices: string[];
    risksAndMitigations: {
        risk: string;
        impact: "critical" | "low" | "high" | "medium";
        mitigation: string;
    }[];
    finalRecommendations: string[];
    sources: string[];
    validatedAt: string;
}, {
    verdict: "APPROVED" | "REJECTED" | "ADJUSTMENTS_RECOMMENDED";
    sprintId: string;
    sprintTheme: string;
    executiveSummary: string;
    proposedDecisions: string[];
    bestPractices: string[];
    finalRecommendations: string[];
    benchmarksAndTools?: {
        name: string;
        category: string;
        recommendation: "adopt" | "evaluate" | "avoid";
        pros: string[];
        cons: string[];
        notes: string;
        url?: string | undefined;
    }[] | undefined;
    risksAndMitigations?: {
        risk: string;
        impact: "critical" | "low" | "high" | "medium";
        mitigation: string;
    }[] | undefined;
    sources?: string[] | undefined;
    validatedAt?: string | undefined;
}>;
export type ResearchedTool = z.infer<typeof ResearchedToolSchema>;
export type RiskMitigation = z.infer<typeof RiskMitigationSchema>;
export type TechValidationReport = z.infer<typeof TechValidationReportSchema>;
//# sourceMappingURL=research.d.ts.map