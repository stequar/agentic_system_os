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
export type EvalDimensionId = z.infer<typeof EvalDimensionIdSchema>;

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
export type EvalDimensionResult = z.infer<typeof EvalDimensionResultSchema>;

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
export type ApplicationSprintSummary = z.infer<typeof ApplicationSprintSummarySchema>;

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
  verdict: z.enum(["CERTIFIED_EXCELLENT", "PASSED_WITH_WARNINGS", "FAILED"]),
  dimensions: z.array(EvalDimensionResultSchema).length(6),
  applicationSprintSummary: ApplicationSprintSummarySchema,
});
export type IntegrationEvalScorecard = z.infer<typeof IntegrationEvalScorecardSchema>;
