import { z } from "zod";

/**
 * Safety / Destructiveness Evaluation contract.
 *
 * Unlike the legacy self-referential harnesses, EVERY result here is derived from a real
 * filesystem/git observation on a throwaway repo — a skeptic can reproduce it. `passed` is
 * never a constant; it reflects what actually happened to disk under adversarial input.
 */
export const SafetyScenarioResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "SHELL_INJECTION",
    "DATA_LOSS",
    "HONEST_FAILURE",
    "SCOPE_ENFORCEMENT",
    "NON_DESTRUCTIVE_ATTACH",
    "SANDBOX_GUARD",
  ]),
  passed: z.boolean(),
  /** Concrete observed evidence (what was/wasn't written, deleted, rejected, recovered). */
  evidence: z.string(),
});
export type SafetyScenarioResult = z.infer<typeof SafetyScenarioResultSchema>;

export const SafetyEvalScorecardSchema = z.object({
  evalId: z.string(),
  executedAt: z.string().datetime().default(() => new Date().toISOString()),
  totalScenarios: z.number().int().nonnegative(),
  passedScenarios: z.number().int().nonnegative(),
  allPassed: z.boolean(),
  verdict: z.enum(["SAFE_TO_RUN", "UNSAFE"]),
  scenarios: z.array(SafetyScenarioResultSchema),
});
export type SafetyEvalScorecard = z.infer<typeof SafetyEvalScorecardSchema>;
