import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { DeterminismScorecardSchema, } from "../contracts/determinism-eval.js";
import { attachWorkspace } from "../attach/injector.js";
import { graftManagedSection } from "../attach/smart-merge.js";
import { buildTwoTierPromptBundle, getUniversalTier1Sha256, } from "../generator/templates/cached-kernel.js";
function sha256(s) {
    return crypto.createHash("sha256").update(s, "utf-8").digest("hex");
}
async function hashFileIfPresent(p) {
    try {
        return sha256(await fs.readFile(p, "utf-8"));
    }
    catch {
        return "ABSENT";
    }
}
/**
 * Determinism / Idempotency Evaluation Harness.
 *
 * Confirms identical input yields byte-identical output, re-running attach is a no-op, and the
 * cache prefix is stable (required for prompt caching). All observations are real hashes.
 */
export class DeterminismEvalHarness {
    static async run() {
        const checks = [];
        checks.push(await this.idempotentAttach());
        checks.push(this.deterministicGeneration());
        checks.push(this.stableCachePrefix());
        checks.push(this.idempotentMerge());
        const passedChecks = checks.filter((c) => c.passed).length;
        const allPassed = passedChecks === checks.length;
        return DeterminismScorecardSchema.parse({
            evalId: `DET-${crypto.randomBytes(4).toString("hex")}`,
            totalChecks: checks.length,
            passedChecks,
            allPassed,
            verdict: allPassed ? "DETERMINISTIC" : "NON_DETERMINISTIC",
            checks,
        });
    }
    /** Re-running attach on an already-attached repo must not change the generated artifacts. */
    static async idempotentAttach() {
        const repo = await fs.mkdtemp(path.join(os.tmpdir(), "det-attach-"));
        try {
            await fs.writeFile(path.join(repo, "package.json"), JSON.stringify({ name: "p", scripts: { test: "vitest run" } }, null, 2));
            const agents = path.join(repo, "AGENTS.md");
            await attachWorkspace(repo, { dryRun: false });
            const h1 = await hashFileIfPresent(agents);
            await attachWorkspace(repo, { dryRun: false });
            const h2 = await hashFileIfPresent(agents);
            const generated = h1 !== "ABSENT";
            const stable = h1 === h2;
            return {
                id: "DET-1",
                title: "Re-running attach is a no-op (generated AGENTS.md byte-identical)",
                category: "IDEMPOTENT_ATTACH",
                passed: generated && stable,
                evidence: `AGENTS.md generated=${generated}, stable across re-run=${stable}`,
            };
        }
        finally {
            await fs.rm(repo, { recursive: true, force: true }).catch(() => { });
        }
    }
    /** The same generation options must produce a byte-identical prompt bundle. */
    static deterministicGeneration() {
        const opts = {
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
        };
        const a = sha256(JSON.stringify(buildTwoTierPromptBundle(opts)));
        const b = sha256(JSON.stringify(buildTwoTierPromptBundle(opts)));
        return {
            id: "DET-2",
            title: "Identical options → byte-identical prompt bundle",
            category: "DETERMINISTIC_GENERATION",
            passed: a === b,
            evidence: `bundleHashesEqual=${a === b}`,
        };
    }
    /** The Tier-1 cache prefix hash must be stable (prompt caching depends on it). */
    static stableCachePrefix() {
        const h1 = getUniversalTier1Sha256();
        const h2 = getUniversalTier1Sha256();
        const bundleSha = buildTwoTierPromptBundle({
            roleId: "r",
            roleName: "R",
            level: "L2",
            description: "d",
            targetLanguages: ["typescript"],
            targetFrameworks: [],
            enableWriteTools: false,
            enableSubagents: false,
            recommendedTestCommand: "npm test",
            domainRules: [],
        }).sha256Tier1;
        const passed = h1 === h2 && h1 === bundleSha && /^[0-9a-f]{64}$/.test(h1);
        return {
            id: "DET-3",
            title: "Tier-1 cache prefix hash is stable across calls and bundles",
            category: "STABLE_CACHE_PREFIX",
            passed,
            evidence: `stable=${h1 === h2}, matchesBundle=${h1 === bundleSha}, sha=${h1.slice(0, 12)}`,
        };
    }
    /** graftManagedSection must be idempotent: re-grafting the same payload is a no-op. */
    static idempotentMerge() {
        const user = "# My Doc\n\nUser content here.\n";
        const payload = "Managed governance block v1";
        const once = graftManagedSection(user, "sec", payload);
        const twice = graftManagedSection(once, "sec", payload);
        const idempotent = once === twice;
        const userPreserved = twice.includes("User content here.");
        return {
            id: "DET-4",
            title: "graftManagedSection is idempotent and preserves user content",
            category: "IDEMPOTENT_MERGE",
            passed: idempotent && userPreserved,
            evidence: `reGraftUnchanged=${idempotent}, userContentPreserved=${userPreserved}`,
        };
    }
}
//# sourceMappingURL=determinism-eval-harness.js.map