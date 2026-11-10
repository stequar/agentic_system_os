import { describe, it, expect } from "vitest";
import { GatekeeperEfficacyHarness } from "../src/eval/gatekeeper-efficacy-harness.js";
import { GatekeeperEfficacyScorecardSchema } from "../src/contracts/gatekeeper-eval.js";

/**
 * Proves the Gatekeeper actually catches known regressions (true-positive rate) and does not
 * flag clean inputs (false-positive rate) — an honest detection metric, not a constant.
 */
describe("Gatekeeper-Efficacy (mutation) Evaluation", () => {
  it("catches every injected defect and flags no clean input → EFFECTIVE", () => {
    const card = GatekeeperEfficacyHarness.run();
    expect(() => GatekeeperEfficacyScorecardSchema.parse(card)).not.toThrow();

    // Surface any detector miss / false positive with its description.
    const wrong = card.results.filter((r) => !r.correct);
    expect(wrong.map((r) => `${r.id} (${r.surface}, ${r.kind}): ${r.description}`)).toEqual([]);

    expect(card.truePositiveRate).toBe(100);
    expect(card.falsePositiveRate).toBe(0);
    expect(card.verdict).toBe("EFFECTIVE");
  });

  it("exercises all three detection surfaces with both mutants and clean inputs", () => {
    const card = GatekeeperEfficacyHarness.run();
    const surfaces = new Set(card.results.map((r) => r.surface));
    expect(surfaces.has("DIAGNOSTIC_PARSER")).toBe(true);
    expect(surfaces.has("HEURISTIC_SCANNER")).toBe(true);
    expect(surfaces.has("DIFF_GUARD")).toBe(true);
    expect(card.totalMutants).toBeGreaterThanOrEqual(10);
    expect(card.totalClean).toBeGreaterThanOrEqual(3);
  });
});
