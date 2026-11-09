import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { IntegrationEvalScorecardSchema } from "../src/contracts/eval.js";
import {
  resetTargetWorkspaceToCleanSlate,
  runBlindApplicationSprintAndEval,
  stripAllManagedSentinelBlocks,
} from "../src/eval/integration-harness.js";
import { formatManagedSentinelBlock } from "../src/attach/smart-merge.js";

/**
 * Crea un clone isolato di `/Users/stequar/fitness_project` con symlink al `.venv` reale
 * per evitare race condition con altre suite Vitest parallele, eseguendo comunque il vero `.venv/bin/pytest`.
 */
async function createIsolatedFitnessClone(): Promise<string> {
  const realFitness = "/Users/stequar/fitness_project";
  const tmpClone = await fs.mkdtemp(path.join(os.tmpdir(), "fitness-eval-clone-"));

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

describe("Zero-Hint Integration Evaluation Harness (`E1..E6`)", () => {
  it("resetTargetWorkspaceToCleanSlate should restore .bak files, strip managed sentinel blocks, and remove .company-os/", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "clean-slate-reset-"));
    try {
      await fs.mkdir(path.join(tmpDir, "docs/wiki/product"), { recursive: true });
      await fs.mkdir(path.join(tmpDir, ".company-os"), { recursive: true });
      await fs.mkdir(path.join(tmpDir, "src/backend/api"), { recursive: true });

      // 1. File with .bak backup
      await fs.writeFile(
        path.join(tmpDir, "AGENTS.md.bak"),
        "# Original Pre-Install AGENTS.md\n",
        "utf-8"
      );
      await fs.writeFile(
        path.join(tmpDir, "AGENTS.md"),
        `# Original Pre-Install AGENTS.md\n\n---\n\n${formatManagedSentinelBlock("agents-governance", "Managed OS Block")}\n`,
        "utf-8"
      );

      // 2. File without .bak but containing a managed sentinel block
      await fs.writeFile(
        path.join(tmpDir, "docs/wiki/product/roadmap.md"),
        `# Custom Roadmap\n## Epic 0\n\n---\n\n${formatManagedSentinelBlock("product-roadmap-governance", "OS Roadmap Block")}\n`,
        "utf-8"
      );

      // 3. Generated artifacts
      await fs.writeFile(
        path.join(tmpDir, ".company-os/org-chart.json"),
        "{}",
        "utf-8"
      );
      await fs.writeFile(
        path.join(tmpDir, "src/backend/api/synced_schemas.py"),
        "# synced",
        "utf-8"
      );

      const resetRes = await resetTargetWorkspaceToCleanSlate(tmpDir);
      expect(resetRes.cleanSlateResetVerified).toBe(true);
      expect(resetRes.restoredFromBackup).toContain("AGENTS.md");
      expect(resetRes.strippedManagedBlocksFrom).toContain(
        "docs/wiki/product/roadmap.md"
      );
      expect(resetRes.removedArtifacts).toContain(".company-os");
      expect(resetRes.removedArtifacts).toContain(
        "src/backend/api/synced_schemas.py"
      );

      const agentsRestored = await fs.readFile(
        path.join(tmpDir, "AGENTS.md"),
        "utf-8"
      );
      expect(agentsRestored).toBe("# Original Pre-Install AGENTS.md\n");
      expect(agentsRestored).not.toContain("AGENTIC-OS:MANAGED");

      const roadmapCleaned = await fs.readFile(
        path.join(tmpDir, "docs/wiki/product/roadmap.md"),
        "utf-8"
      );
      expect(roadmapCleaned).toContain("## Epic 0");
      expect(roadmapCleaned).not.toContain("AGENTIC-OS:MANAGED");

      const strippedDirect = stripAllManagedSentinelBlocks(
        `Header\n\n---\n\n${formatManagedSentinelBlock("sec", "Inner")}`
      );
      expect(strippedDirect).toBe("Header\n");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("runBlindApplicationSprintAndEval should execute Clean-Slate Reset + Blind 5-Phase Bootstrap + Application Sprint and achieve 100/100 CERTIFIED_EXCELLENT across E1..E6", async () => {
    const isolatedClone = await createIsolatedFitnessClone();
    try {
      const scorecard = await runBlindApplicationSprintAndEval(isolatedClone, {
        writeWikiReportToOsDir: isolatedClone,
      });

      const parsed = IntegrationEvalScorecardSchema.parse(scorecard);
      expect(parsed.zeroHintMode).toBe(true);
      expect(parsed.cleanSlateResetVerified).toBe(true);
      expect(parsed.overallScore).toBe(100);
      expect(parsed.verdict).toBe("CERTIFIED_EXCELLENT");
      expect(parsed.dimensions).toHaveLength(6);

      for (const dim of parsed.dimensions) {
        expect(dim.passed).toBe(true);
        expect(dim.score).toBe(100);
      }

      expect(parsed.applicationSprintSummary.nativeTestsPassed).toBe(true);
      expect(parsed.applicationSprintSummary.nativeTestCommand).toContain(
        ".venv/bin/pytest"
      );
    } finally {
      await fs.rm(isolatedClone, { recursive: true, force: true });
    }
  });
});
