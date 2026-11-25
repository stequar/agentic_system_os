import { z } from "zod";
/**
 * Identificativi dei 6 assi del Zero-Hint Integration Evaluation Framework.
 */
export const EvalDimensionIdSchema = z.enum([
    "E1_NON_DESTRUCTIVE_PRESERVATION",
    "E2_BLIND_DOMAIN_DISCOVERY_RECALL",
    "E3_AUTONOMOUS_CEREMONY_ROUTING",
    "E4_DOMAIN_INVARIANT_SAFETY_ENFORCEMENT",
    "E5_NATIVE_TARGET_GATEKEEPER_PASS",
    "E6_OPERATIONAL_EFFICIENCY_AND_MERKLE",
]);
/**
 * Risultato valutativo di una singola dimensione (`E1..E6`).
 */
export const EvalDimensionResultSchema = z.object({
    dimensionId: EvalDimensionIdSchema,
    title: z.string().min(3),
    score: z.number().min(0).max(100),
    passed: z.boolean(),
    weight: z.number().positive(),
    evidence: z.array(z.string()).min(1),
    metrics: z.record(z.union([z.number(), z.string(), z.boolean()])),
});
/**
 * Riepilogo dello sprint applicativo eseguito sul repository target.
 */
export const ApplicationSprintSummarySchema = z.object({
    ticketIds: z.array(z.string()).min(1),
    modifiedTargetFiles: z.array(z.string()).min(1),
    nativeTestCommand: z.string().min(1),
    nativeTestsPassed: z.boolean(),
    nativeTestOutputSummary: z.string().min(1),
});
/**
 * Scorecard certificata del Zero-Hint Integration Evaluation Harness (`E1..E6`).
 */
export const IntegrationEvalScorecardSchema = z.object({
    evalId: z.string().min(5),
    targetPath: z.string().min(1),
    executedAt: z.string().datetime(),
    zeroHintMode: z.literal(true),
    cleanSlateResetVerified: z.boolean(),
    overallScore: z.number().min(0).max(100),
    // Scripted conformance run: ceremonies, consensus verdicts and sprint tickets are
    // authored by the harness itself; only the native test command is a real observation.
    // No agent edits code during this eval.
    evaluationKind: z.literal("SCRIPTED_CONFORMANCE").default("SCRIPTED_CONFORMANCE"),
    measuresRealAgentRuns: z.literal(false).default(false),
    verdict: z.enum(["SCRIPTED_CONFORMANCE_PASSED", "PASSED_WITH_WARNINGS", "FAILED"]),
    dimensions: z.array(EvalDimensionResultSchema).length(6),
    applicationSprintSummary: ApplicationSprintSummarySchema,
});
//# sourceMappingURL=eval.js.map