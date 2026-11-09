import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CtoOperatingModeSchema,
  RootCauseAnalysisReportSchema,
  WorkflowEvalScorecardSchema,
} from "../src/contracts/workflow-eval.js";
import { CompanyStateMachine } from "../src/core/state-machine.js";
import { runHolisticWorkspaceBootstrap } from "../src/bootstrap/holistic-bootstrap.js";
import { resetTargetWorkspaceToCleanSlate } from "../src/eval/integration-harness.js";
import { runWorkflowBehavioralEval } from "../src/eval/workflow-eval-harness.js";

async function createIsolatedFitnessCloneForWorkflowEval(): Promise<string> {
  const realFitness = "/Users/stequar/fitness_project";
  const tmpClone = await fs.mkdtemp(
    path.join(os.tmpdir(), "fitness-wf-eval-clone-")
  );

  async function copyFiltered(srcDir: string, destDir: string): Promise<void> {
    await fs.mkdir(destDir, { recursive: true });
    const entries = await fs.readdir(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === ".venv" ||
        entry.name === "dataset_raw" ||
        entry.name === ".git" ||
        entry.name === "__pycache__" ||
        entry.name === ".pytest_cache"
      ) {
        continue;
      }
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        await copyFiltered(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  if (fsSync.existsSync(realFitness)) {
    await copyFiltered(realFitness, tmpClone);
    const realVenv = path.join(realFitness, ".venv");
    if (fsSync.existsSync(realVenv)) {
      await fs.symlink(realVenv, path.join(tmpClone, ".venv"), "dir");
    }
  }

  return tmpClone;
}

describe("Sprint 17.6 — Executive & R&D Operating Protocol v2, Self-Hosting DNA & Workflow Behavioral Eval (`W1..W7`)", () => {
  it("should enforce Cognitive Forcing Functions Gate in CompanyStateMachine and reject premature transitions on anomalies", async () => {
    expect(CtoOperatingModeSchema.parse("MODE_2_INVESTIGATE_RCA")).toBe(
      "MODE_2_INVESTIGATE_RCA"
    );

    const fsm = new CompanyStateMachine("STANDUP");
    fsm.setStimulusContext({ stimulusType: "ANOMALY_OR_BUG" });

    // 1. Direct jump from STANDUP to SPECIFY on anomaly without RCA -> MUST throw COGNITIVE_FORCING_GATE_VIOLATION
    await expect(fsm.transitionTo("SPECIFY")).rejects.toThrow(
      /COGNITIVE_FORCING_GATE_VIOLATION/
    );

    // 2. Transition to INVESTIGATE_RCA is allowed
    const enteredRca = await fsm.transitionTo("INVESTIGATE_RCA");
    expect(enteredRca).toBe(true);
    expect(fsm.getOperatingMode()).toBe("MODE_2_INVESTIGATE_RCA");

    // 3. RCA without CEO approval -> MUST throw COGNITIVE_FORCING_GATE_VIOLATION
    const unapprovedRca = RootCauseAnalysisReportSchema.parse({
      rcaId: "RCA-TEST-17-6",
      symptomDescription: "Ghost roles in org-chart not visible in AGENTS.md",
      fiveWhys: [
        "Why 1: renderAgentsMarkdown did not receive orgChart",
        "Why 2: attachWorkspace did not load .company-os/org-chart.json",
        "Why 3: Conversational skills had no CLI bridge to query Tri-Ring routing",
      ],
      rootCause: "Dual-Brain disconnect between markdown prompt layer and TypeScript engine",
      systemicPrinciple: "100% Self-Hosting Symmetry & Dual-Brain CLI Bridge",
      affectedDomains: ["generator", "attach", "cli"],
      consultedSpecialists: ["rnd_lead", "qa_lead", "engineering_lead"],
      redTeamRisks: ["Duplicate sentinel blocks if smart-merge is not idempotent"],
      proposedActionPlan: ["Pass orgChart to renderAgentsMarkdown and add workflow CLI"],
      ceoApproved: false,
    });

    fsm.setStimulusContext({
      stimulusType: "ANOMALY_OR_BUG",
      rcaReport: unapprovedRca,
    });
    await expect(fsm.transitionTo("SPECIFY")).rejects.toThrow(
      /COGNITIVE_FORCING_GATE_VIOLATION/
    );

    // 4. RCA with CEO approval -> unlocks SPECIFY (MODE_4_BUILD_GATEKEEPER)
    fsm.setStimulusContext({
      stimulusType: "ANOMALY_OR_BUG",
      rcaReport: { ...unapprovedRca, ceoApproved: true },
    });
    const enteredSpecify = await fsm.transitionTo("SPECIFY");
    expect(enteredSpecify).toBe(true);
    expect(fsm.getOperatingMode()).toBe("MODE_4_BUILD_GATEKEEPER");
  });

  it("should certify 100/100 (WORKFLOW_CERTIFIED) across all 7 axes (W1..W7) on agentic_company_os (Self-Hosting)", async () => {
    const osRoot = path.resolve(process.cwd());
    const scorecard = await runWorkflowBehavioralEval(osRoot);
    const parsed = WorkflowEvalScorecardSchema.parse(scorecard);

    expect(parsed.overallScore).toBe(100);
    expect(parsed.verdict).toBe("WORKFLOW_CERTIFIED");
    expect(parsed.axes).toHaveLength(7);
    for (const axis of parsed.axes) {
      expect(axis.passed).toBe(true);
      expect(axis.score).toBe(100);
    }
  });

  it("should certify 100/100 (WORKFLOW_CERTIFIED) across all 7 axes (W1..W7) on fitness_project after Clean-Slate Reset + Holistic Bootstrap", async () => {
    const isolatedFitness = await createIsolatedFitnessCloneForWorkflowEval();
    try {
      await resetTargetWorkspaceToCleanSlate(isolatedFitness);
      await runHolisticWorkspaceBootstrap(isolatedFitness, {
        dryRun: false,
        ignoreExistingAgentsMdForMining: true,
        doctorTimeoutMs: 2500,
      });

      const scorecard = await runWorkflowBehavioralEval(isolatedFitness);
      const parsed = WorkflowEvalScorecardSchema.parse(scorecard);

      expect(parsed.overallScore).toBe(100);
      expect(parsed.verdict).toBe("WORKFLOW_CERTIFIED");
      expect(parsed.axes).toHaveLength(7);
      for (const axis of parsed.axes) {
        expect(axis.passed).toBe(true);
        expect(axis.score).toBe(100);
      }
    } finally {
      await fs.rm(isolatedFitness, { recursive: true, force: true });
    }
  });
});
