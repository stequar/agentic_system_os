import { z } from "zod";

/**
 * Brownfield Corpus Evaluation contract.
 *
 * Runs stack detection against a corpus of synthetic fixture repos, scoring DETECTION RECALL
 * against HUMAN-labeled ground truth (not tuned to the detector). `extras` (detected-but-not-
 * expected) are reported informationally — common ones like javascript-with-typescript or a
 * test runner surfaced as a framework are defensible, so they do not fail the eval.
 */
export const CorpusFixtureResultSchema = z.object({
  fixture: z.string(),
  expectedChecks: z.number().int().nonnegative(),
  foundChecks: z.number().int().nonnegative(),
  recall: z.number().min(0).max(100),
  missed: z.array(z.string()),
  extras: z.array(z.string()),
  passed: z.boolean(),
});
export type CorpusFixtureResult = z.infer<typeof CorpusFixtureResultSchema>;

export const BrownfieldCorpusScorecardSchema = z.object({
  evalId: z.string(),
  executedAt: z.string().datetime().default(() => new Date().toISOString()),
  totalFixtures: z.number().int().nonnegative(),
  totalExpectedChecks: z.number().int().nonnegative(),
  totalFoundChecks: z.number().int().nonnegative(),
  recallPct: z.number().min(0).max(100),
  totalExtras: z.number().int().nonnegative(),
  verdict: z.enum(["DETECTION_ACCURATE", "DETECTION_GAPS"]),
  fixtures: z.array(CorpusFixtureResultSchema),
});
export type BrownfieldCorpusScorecard = z.infer<typeof BrownfieldCorpusScorecardSchema>;
