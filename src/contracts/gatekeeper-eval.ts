import { z } from "zod";

/**
 * Gatekeeper-Efficacy (mutation) Evaluation contract.
 *
 * Honest detection metric: inject KNOWN defects (mutants) that MUST be caught, plus CLEAN
 * inputs that must NOT be flagged, then measure the real true-positive and false-positive
 * rates of the Gatekeeper's detection surfaces. Replaces the self-referential chaos
 * "resilience score" — every `actuallyDetected` is a real observation of the detector output.
 */
export const MutationResultSchema = z.object({
  id: z.string(),
  surface: z.enum(["DIAGNOSTIC_PARSER", "HEURISTIC_SCANNER", "DIFF_GUARD"]),
  kind: z.enum(["MUTANT", "CLEAN"]),
  description: z.string(),
  expectedDetected: z.boolean(),
  actuallyDetected: z.boolean(),
  /** True when the detector did the right thing (caught a mutant, or left a clean input alone). */
  correct: z.boolean(),
});
export type MutationResult = z.infer<typeof MutationResultSchema>;

export const GatekeeperEfficacyScorecardSchema = z.object({
  evalId: z.string(),
  executedAt: z.string().datetime().default(() => new Date().toISOString()),
  totalMutants: z.number().int().nonnegative(),
  detectedMutants: z.number().int().nonnegative(),
  truePositiveRate: z.number().min(0).max(100),
  totalClean: z.number().int().nonnegative(),
  falsePositives: z.number().int().nonnegative(),
  falsePositiveRate: z.number().min(0).max(100),
  verdict: z.enum(["EFFECTIVE", "DEGRADED", "INEFFECTIVE"]),
  results: z.array(MutationResultSchema),
});
export type GatekeeperEfficacyScorecard = z.infer<typeof GatekeeperEfficacyScorecardSchema>;
