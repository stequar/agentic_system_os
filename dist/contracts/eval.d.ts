import { z } from "zod";
/**
 * Identificativi dei 6 assi del Zero-Hint Integration Evaluation Framework.
 */
export declare const EvalDimensionIdSchema: z.ZodEnum<["E1_NON_DESTRUCTIVE_PRESERVATION", "E2_BLIND_DOMAIN_DISCOVERY_RECALL", "E3_AUTONOMOUS_CEREMONY_ROUTING", "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT", "E5_NATIVE_TARGET_GATEKEEPER_PASS", "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE"]>;
export type EvalDimensionId = z.infer<typeof EvalDimensionIdSchema>;
/**
 * Risultato valutativo di una singola dimensione (`E1..E6`).
 */
export declare const EvalDimensionResultSchema: z.ZodObject<{
    dimensionId: z.ZodEnum<["E1_NON_DESTRUCTIVE_PRESERVATION", "E2_BLIND_DOMAIN_DISCOVERY_RECALL", "E3_AUTONOMOUS_CEREMONY_ROUTING", "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT", "E5_NATIVE_TARGET_GATEKEEPER_PASS", "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE"]>;
    title: z.ZodString;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    weight: z.ZodNumber;
    evidence: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodBoolean]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    score: number;
    passed: boolean;
    weight: number;
    evidence: string[];
    metrics: Record<string, string | number | boolean>;
    dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
}, {
    title: string;
    score: number;
    passed: boolean;
    weight: number;
    evidence: string[];
    metrics: Record<string, string | number | boolean>;
    dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
}>;
export type EvalDimensionResult = z.infer<typeof EvalDimensionResultSchema>;
/**
 * Riepilogo dello sprint applicativo eseguito sul repository target.
 */
export declare const ApplicationSprintSummarySchema: z.ZodObject<{
    ticketIds: z.ZodArray<z.ZodString, "many">;
    modifiedTargetFiles: z.ZodArray<z.ZodString, "many">;
    nativeTestCommand: z.ZodString;
    nativeTestsPassed: z.ZodBoolean;
    nativeTestOutputSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ticketIds: string[];
    modifiedTargetFiles: string[];
    nativeTestCommand: string;
    nativeTestsPassed: boolean;
    nativeTestOutputSummary: string;
}, {
    ticketIds: string[];
    modifiedTargetFiles: string[];
    nativeTestCommand: string;
    nativeTestsPassed: boolean;
    nativeTestOutputSummary: string;
}>;
export type ApplicationSprintSummary = z.infer<typeof ApplicationSprintSummarySchema>;
/**
 * Scorecard certificata del Zero-Hint Integration Evaluation Harness (`E1..E6`).
 */
export declare const IntegrationEvalScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    targetPath: z.ZodString;
    executedAt: z.ZodString;
    zeroHintMode: z.ZodLiteral<true>;
    cleanSlateResetVerified: z.ZodBoolean;
    overallScore: z.ZodNumber;
    verdict: z.ZodEnum<["CERTIFIED_EXCELLENT", "PASSED_WITH_WARNINGS", "FAILED"]>;
    dimensions: z.ZodArray<z.ZodObject<{
        dimensionId: z.ZodEnum<["E1_NON_DESTRUCTIVE_PRESERVATION", "E2_BLIND_DOMAIN_DISCOVERY_RECALL", "E3_AUTONOMOUS_CEREMONY_ROUTING", "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT", "E5_NATIVE_TARGET_GATEKEEPER_PASS", "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE"]>;
        title: z.ZodString;
        score: z.ZodNumber;
        passed: z.ZodBoolean;
        weight: z.ZodNumber;
        evidence: z.ZodArray<z.ZodString, "many">;
        metrics: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodBoolean]>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
        dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
    }, {
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
        dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
    }>, "many">;
    applicationSprintSummary: z.ZodObject<{
        ticketIds: z.ZodArray<z.ZodString, "many">;
        modifiedTargetFiles: z.ZodArray<z.ZodString, "many">;
        nativeTestCommand: z.ZodString;
        nativeTestsPassed: z.ZodBoolean;
        nativeTestOutputSummary: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ticketIds: string[];
        modifiedTargetFiles: string[];
        nativeTestCommand: string;
        nativeTestsPassed: boolean;
        nativeTestOutputSummary: string;
    }, {
        ticketIds: string[];
        modifiedTargetFiles: string[];
        nativeTestCommand: string;
        nativeTestsPassed: boolean;
        nativeTestOutputSummary: string;
    }>;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    evalId: string;
    overallScore: number;
    verdict: "FAILED" | "CERTIFIED_EXCELLENT" | "PASSED_WITH_WARNINGS";
    executedAt: string;
    zeroHintMode: true;
    cleanSlateResetVerified: boolean;
    dimensions: {
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
        dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
    }[];
    applicationSprintSummary: {
        ticketIds: string[];
        modifiedTargetFiles: string[];
        nativeTestCommand: string;
        nativeTestsPassed: boolean;
        nativeTestOutputSummary: string;
    };
}, {
    targetPath: string;
    evalId: string;
    overallScore: number;
    verdict: "FAILED" | "CERTIFIED_EXCELLENT" | "PASSED_WITH_WARNINGS";
    executedAt: string;
    zeroHintMode: true;
    cleanSlateResetVerified: boolean;
    dimensions: {
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
        dimensionId: "E1_NON_DESTRUCTIVE_PRESERVATION" | "E2_BLIND_DOMAIN_DISCOVERY_RECALL" | "E3_AUTONOMOUS_CEREMONY_ROUTING" | "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT" | "E5_NATIVE_TARGET_GATEKEEPER_PASS" | "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE";
    }[];
    applicationSprintSummary: {
        ticketIds: string[];
        modifiedTargetFiles: string[];
        nativeTestCommand: string;
        nativeTestsPassed: boolean;
        nativeTestOutputSummary: string;
    };
}>;
export type IntegrationEvalScorecard = z.infer<typeof IntegrationEvalScorecardSchema>;
//# sourceMappingURL=eval.d.ts.map