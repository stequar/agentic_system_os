import { describe, it, expect } from "vitest";
import { SettingsEvalHarness } from "../src/eval/settings-eval-harness.js";
import { SettingsEvalScorecardSchema } from "../src/contracts/settings-eval.js";

describe("Sprint 17.8/Eval — Settings Behavioral Evaluation Suite (`S1..S5`)", () => {
  it("Scenario A: should enforce CEO_MAX_CONTROL (CFF-5 Spike Checkpoint Gate on Python microservice)", async () => {
    const result = await SettingsEvalHarness.evaluateScenarioA();
    expect(result.status).toBe("PASSED");
    expect(result.assertionsPassed).toBe(result.assertionsTotal);
    expect(result.fpyPercentage).toBe(100);
    expect(result.stackType).toBe("python_fastapi");
  });

  it("Scenario B: should enforce AUTONOMOUS_FAST_TRACK & Caveman Mode on Node/TypeScript workspace", async () => {
    const result = await SettingsEvalHarness.evaluateScenarioB();
    expect(result.status).toBe("PASSED");
    expect(result.assertionsPassed).toBe(result.assertionsTotal);
    expect(result.fpyPercentage).toBe(100);
    expect(result.stackType).toBe("typescript_node");
  });

  it("Scenario C: should enforce LOCAL_FIRST_AIRGAP, Fast-Decision Gate & FinOps Safe-Pause", async () => {
    const result = await SettingsEvalHarness.evaluateScenarioC();
    expect(result.status).toBe("PASSED");
    expect(result.assertionsPassed).toBe(result.assertionsTotal);
    expect(result.fpyPercentage).toBe(100);
    expect(result.stackType).toBe("airgap_worker");
  });

  it("Scenario D: should enforce STRICT_IMMUNE_DEFENSE, Formal AST Prover & Chaos Fault Containment", async () => {
    const result = await SettingsEvalHarness.evaluateScenarioD();
    expect(result.status).toBe("PASSED");
    expect(result.assertionsPassed).toBe(result.assertionsTotal);
    expect(result.fpyPercentage).toBe(100);
    expect(result.stackType).toBe("brownfield_chaos");
  });

  it("Full Suite Run: should execute all scenarios and produce a valid 100/100 SettingsEvalScorecard", async () => {
    const scorecard = await SettingsEvalHarness.runFullEvalSuite();
    const validated = SettingsEvalScorecardSchema.parse(scorecard);

    expect(validated.totalScenarios).toBe(4);
    expect(validated.passedScenarios).toBe(4);
    expect(validated.overallScore).toBe(100);
    expect(validated.verdict).toBe("SETTINGS_VERIFIED");
  });
});
