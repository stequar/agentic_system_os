import { z } from "zod";
/**
 * Golden-Snapshot Evaluation contract.
 *
 * Freezes deterministic, path-independent generated artifacts and byte-compares each against a
 * committed golden file. MISMATCH = a real generation regression (or an intentional change that
 * must be re-recorded). RECORDED = first-run baseline. Every status is a real byte comparison.
 */
export const GoldenCheckResultSchema = z.object({
    id: z.string(),
    artifact: z.string(),
    status: z.enum(["MATCH", "MISMATCH", "RECORDED"]),
    passed: z.boolean(),
    actualSha: z.string(),
    goldenSha: z.string(),
});
export const GoldenSnapshotScorecardSchema = z.object({
    evalId: z.string(),
    executedAt: z.string().datetime().default(() => new Date().toISOString()),
    totalArtifacts: z.number().int().nonnegative(),
    matched: z.number().int().nonnegative(),
    recorded: z.number().int().nonnegative(),
    mismatched: z.number().int().nonnegative(),
    allPassed: z.boolean(),
    verdict: z.enum(["GOLDEN_STABLE", "DRIFT_DETECTED"]),
    checks: z.array(GoldenCheckResultSchema),
});
//# sourceMappingURL=golden-eval.js.map