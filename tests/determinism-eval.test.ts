import { describe, it, expect } from "vitest";
import { DeterminismEvalHarness } from "../src/eval/determinism-eval-harness.js";
import { DeterminismScorecardSchema } from "../src/contracts/determinism-eval.js";

/**
 * Confirms the OS is deterministic: identical input → byte-identical output, re-running attach
 * is a no-op, and the cache prefix is stable.
 */
describe("Determinism / Idempotency Evaluation", () => {
  it("all determinism checks pass → DETERMINISTIC", async () => {
    const card = await DeterminismEvalHarness.run();
    expect(() => DeterminismScorecardSchema.parse(card)).not.toThrow();

    const failures = card.checks.filter((c) => !c.passed);
    expect(failures.map((f) => `${f.id} ${f.title}: ${f.evidence}`)).toEqual([]);

    expect(card.allPassed).toBe(true);
    expect(card.verdict).toBe("DETERMINISTIC");
    expect(card.totalChecks).toBe(4);
  });
});
