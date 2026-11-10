import { z } from "zod";
/**
 * Determinism / Idempotency Evaluation contract.
 *
 * Verifies the OS produces identical output for identical input and that re-running attach is a
 * no-op. Every `passed` is a real byte-identity / hash observation — not a constant.
 */
export const DeterminismCheckResultSchema = z.object({
    id: z.string(),
    title: z.string(),
    category: z.enum([
        "IDEMPOTENT_ATTACH",
        "DETERMINISTIC_GENERATION",
        "STABLE_CACHE_PREFIX",
        "IDEMPOTENT_MERGE",
    ]),
    passed: z.boolean(),
    evidence: z.string(),
});
export const DeterminismScorecardSchema = z.object({
    evalId: z.string(),
    executedAt: z.string().datetime().default(() => new Date().toISOString()),
    totalChecks: z.number().int().nonnegative(),
    passedChecks: z.number().int().nonnegative(),
    allPassed: z.boolean(),
    verdict: z.enum(["DETERMINISTIC", "NON_DETERMINISTIC"]),
    checks: z.array(DeterminismCheckResultSchema),
});
//# sourceMappingURL=determinism-eval.js.map