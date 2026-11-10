import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  GoldenSnapshotScorecardSchema,
  type GoldenSnapshotScorecard,
  type GoldenCheckResult,
} from "../contracts/golden-eval.js";
import {
  buildBackendManagerPrompt,
  buildMobileManagerPrompt,
  buildFrontendManagerPrompt,
  buildLeadEngineerPrompt,
} from "../generator/templates/roles-prompts.js";
import { buildTwoTierPromptBundle } from "../generator/templates/cached-kernel.js";
import { renderStudioHtml } from "../studio/ui.js";

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s, "utf-8").digest("hex");
}

/**
 * The frozen, deterministic, PATH-INDEPENDENT artifacts under golden snapshot.
 * (No absolute paths / timestamps / randomness — so goldens are stable across machines.)
 */
function goldenArtifacts(): { id: string; file: string; content: string }[] {
  return [
    { id: "GOLD-backend", file: "backend-role-prompt.golden", content: buildBackendManagerPrompt() },
    { id: "GOLD-mobile", file: "mobile-role-prompt.golden", content: buildMobileManagerPrompt() },
    { id: "GOLD-frontend", file: "frontend-react-role-prompt.golden", content: buildFrontendManagerPrompt() },
    { id: "GOLD-lead", file: "lead-engineer-role-prompt.golden", content: buildLeadEngineerPrompt() },
    {
      id: "GOLD-bundle",
      file: "two-tier-bundle.golden",
      content: JSON.stringify(
        buildTwoTierPromptBundle({
          roleId: "backend_manager",
          roleName: "Backend Engineering Lead",
          level: "L2",
          description: "Backend domain lead",
          targetLanguages: ["python"],
          targetFrameworks: ["fastapi"],
          enableWriteTools: true,
          enableSubagents: true,
          recommendedTestCommand: "pytest",
          domainRules: ["Rule 1", "Rule 2"],
        }),
        null,
        2
      ),
    },
    { id: "GOLD-studio", file: "studio-dashboard.golden", content: renderStudioHtml("GOLDEN_TOKEN") },
  ];
}

/**
 * Golden-Snapshot Evaluation Harness.
 *
 * Byte-compares each deterministic artifact against a committed golden under `goldensDir`.
 * A missing golden (or `update: true`) records a baseline (RECORDED). Any byte difference is a
 * MISMATCH — a real generation regression to review (or an intentional change to re-record via update).
 */
export class GoldenSnapshotHarness {
  static async run(goldensDir: string, options?: { update?: boolean }): Promise<GoldenSnapshotScorecard> {
    await fs.mkdir(goldensDir, { recursive: true });
    const checks: GoldenCheckResult[] = [];

    for (const art of goldenArtifacts()) {
      const goldenPath = path.join(goldensDir, art.file);
      const actualSha = sha256(art.content);
      let golden: string | null = null;
      try {
        golden = await fs.readFile(goldenPath, "utf-8");
      } catch {
        golden = null;
      }

      if (options?.update || golden === null) {
        await fs.writeFile(goldenPath, art.content, "utf-8");
        checks.push({
          id: art.id,
          artifact: art.file,
          status: "RECORDED",
          passed: true,
          actualSha,
          goldenSha: actualSha,
        });
        continue;
      }

      const goldenSha = sha256(golden);
      const match = golden === art.content;
      checks.push({
        id: art.id,
        artifact: art.file,
        status: match ? "MATCH" : "MISMATCH",
        passed: match,
        actualSha,
        goldenSha,
      });
    }

    const matched = checks.filter((c) => c.status === "MATCH").length;
    const recorded = checks.filter((c) => c.status === "RECORDED").length;
    const mismatched = checks.filter((c) => c.status === "MISMATCH").length;
    const allPassed = mismatched === 0;
    return GoldenSnapshotScorecardSchema.parse({
      evalId: `GOLDEN-${crypto.randomBytes(4).toString("hex")}`,
      totalArtifacts: checks.length,
      matched,
      recorded,
      mismatched,
      allPassed,
      verdict: allPassed ? "GOLDEN_STABLE" : "DRIFT_DETECTED",
      checks,
    });
  }
}
