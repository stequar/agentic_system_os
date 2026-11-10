import { describe, it, expect } from "vitest";
import { SafetyEvalHarness } from "../src/eval/safety-eval-harness.js";
import { SafetyEvalScorecardSchema } from "../src/contracts/safety-eval.js";

/**
 * The adoption gate: the OS is "safe to run on a repo" only if every adversarial
 * safety/destructiveness scenario passes against throwaway repos.
 */
describe("Safety / Destructiveness Evaluation Harness", () => {
  it("passes all adversarial safety scenarios → SAFE_TO_RUN", async () => {
    const card = await SafetyEvalHarness.run();
    expect(() => SafetyEvalScorecardSchema.parse(card)).not.toThrow();

    // Surface per-scenario evidence on failure so the report is actionable.
    const failures = card.scenarios.filter((s) => !s.passed);
    expect(failures.map((f) => `${f.id} ${f.title}: ${f.evidence}`)).toEqual([]);

    expect(card.allPassed).toBe(true);
    expect(card.verdict).toBe("SAFE_TO_RUN");
    expect(card.totalScenarios).toBe(6);
    expect(card.passedScenarios).toBe(6);
  });

  it("covers all safety categories", async () => {
    const card = await SafetyEvalHarness.run();
    const cats = new Set(card.scenarios.map((s) => s.category));
    for (const c of [
      "SHELL_INJECTION",
      "DATA_LOSS",
      "HONEST_FAILURE",
      "SCOPE_ENFORCEMENT",
      "NON_DESTRUCTIVE_ATTACH",
      "SANDBOX_GUARD",
    ]) {
      expect(cats.has(c as never)).toBe(true);
    }
  });
});
