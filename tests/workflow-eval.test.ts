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

/**
 * Copies only the governance artifacts the harness inspects into a throwaway directory,
 * so the eval never writes into this repository (audit log, workflow state, scorecard).
 */
async function createIsolatedSelfHostingCopy(): Promise<string> {
  const osRoot = path.resolve(process.cwd());
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "os-wf-eval-self-"));
  await fs.copyFile(path.join(osRoot, "AGENTS.md"), path.join(tmp, "AGENTS.md"));
  await fs.cp(path.join(osRoot, ".agents", "skills"), path.join(tmp, ".agents", "skills"), {
    recursive: true,
  });
  await fs.mkdir(path.join(tmp, "docs"), { recursive: true });
  await fs.copyFile(
    path.join(osRoot, "docs", "CEO_Dashboard.md"),
    path.join(tmp, "docs", "CEO_Dashboard.md")
  );
  await fs.mkdir(path.join(tmp, ".company-os"), { recursive: true });
  for (const f of ["org-chart.json", "invariants.json", "config.json", "workflow-state.json", "settings.json"]) {
    const src = path.join(osRoot, ".company-os", f);
    if (fsSync.existsSync(src)) await fs.copyFile(src, path.join(tmp, ".company-os", f));
  }
  return tmp;
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

  it("should pass scripted conformance 100/100 (SCRIPTED_CONFORMANCE_PASSED) across all 7 axes (W1..W7) on agentic_company_os (Self-Hosting)", async () => {
    const osCopy = await createIsolatedSelfHostingCopy();
    try {
      const scorecard = await runWorkflowBehavioralEval(osCopy);
      const parsed = WorkflowEvalScorecardSchema.parse(scorecard);

      expect(parsed.overallScore).toBe(100);
      expect(parsed.verdict).toBe("SCRIPTED_CONFORMANCE_PASSED");
      expect(parsed.evaluationKind).toBe("SCRIPTED_CONFORMANCE");
      expect(parsed.measuresRealAgentRuns).toBe(false);
      expect(parsed.axes).toHaveLength(7);
      for (const axis of parsed.axes) {
        expect(axis.passed).toBe(true);
        expect(axis.score).toBe(100);
      }

      // The CLI calls made by the harness must land in the eval channel only.
      expect(fsSync.existsSync(path.join(osCopy, ".company-os", "audit.eval.jsonl"))).toBe(true);
      expect(fsSync.existsSync(path.join(osCopy, ".company-os", "audit.jsonl"))).toBe(false);
      expect(process.env.AGENTIC_OS_AUDIT_CHANNEL).toBeUndefined();
    } finally {
      await fs.rm(osCopy, { recursive: true, force: true });
    }
  });

  // The harness must be able to FAIL. Each case breaks one subsystem in an isolated
  // copy and expects the corresponding axis (and the verdict) to go red, with no
  // partial credit for the failed axis.
  const breakages: Array<{
    name: string;
    expectFailedAxes: string[];
    breakIt: (dir: string) => Promise<void>;
  }> = [
    {
      name: "a skill loses its YAML frontmatter",
      expectFailedAxes: ["W1_SESSION_BOOT_AND_CTO_PERSONA", "W6_SELF_HOSTING_SYMMETRY"],
      breakIt: async (dir) => {
        const p = path.join(dir, ".agents", "skills", "rnd-roundtable", "SKILL.md");
        const txt = await fs.readFile(p, "utf-8");
        await fs.writeFile(p, txt.split(/\r?\n/).slice(4).join("\n"), "utf-8");
      },
    },
    {
      name: "the Cognitive Forcing Functions are missing from AGENTS.md",
      expectFailedAxes: ["W2_COGNITIVE_FORCING_FUNCTIONS_GATE", "W6_SELF_HOSTING_SYMMETRY"],
      breakIt: async (dir) => {
        const p = path.join(dir, "AGENTS.md");
        const txt = await fs.readFile(p, "utf-8");
        await fs.writeFile(p, txt.replaceAll("CFF-3", "CFF-X"), "utf-8");
      },
    },
    {
      name: "a Ring-2 expert in the org chart is a ghost role (absent from AGENTS.md)",
      expectFailedAxes: ["W3_TRI_RING_SYNC_AND_SCOPE_ROUTING", "W6_SELF_HOSTING_SYMMETRY"],
      breakIt: async (dir) => {
        const p = path.join(dir, "AGENTS.md");
        const txt = await fs.readFile(p, "utf-8");
        await fs.writeFile(p, txt.replaceAll("ast_gatekeeper_specialist", "removed_role"), "utf-8");
      },
    },
    {
      name: "the domain invariants file is empty",
      expectFailedAxes: ["W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT"],
      breakIt: async (dir) => {
        await fs.writeFile(
          path.join(dir, ".company-os", "invariants.json"),
          JSON.stringify({ domainInvariants: [] }),
          "utf-8"
        );
      },
    },
  ];

  for (const breakage of breakages) {
    it(`should FAIL (NEEDS_REMEDIATION, no partial credit) when ${breakage.name}`, async () => {
      const osCopy = await createIsolatedSelfHostingCopy();
      try {
        await breakage.breakIt(osCopy);
        const parsed = WorkflowEvalScorecardSchema.parse(
          await runWorkflowBehavioralEval(osCopy)
        );

        expect(parsed.verdict).toBe("NEEDS_REMEDIATION");
        expect(parsed.overallScore).toBeLessThan(100);
        const failedAxes = parsed.axes.filter((a) => !a.passed).map((a) => a.axisId);
        for (const expected of breakage.expectFailedAxes) {
          expect(failedAxes).toContain(expected);
        }
        for (const axis of parsed.axes.filter((a) => !a.passed)) {
          expect(axis.score).toBe(0);
        }
      } finally {
        await fs.rm(osCopy, { recursive: true, force: true });
      }
    });
  }

  it("should pass scripted conformance 100/100 (SCRIPTED_CONFORMANCE_PASSED) across all 7 axes (W1..W7) on fitness_project after Clean-Slate Reset + Holistic Bootstrap", async () => {
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
      expect(parsed.verdict).toBe("SCRIPTED_CONFORMANCE_PASSED");
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
