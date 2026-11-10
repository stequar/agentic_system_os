import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { SafetyEvalScorecardSchema, } from "../contracts/safety-eval.js";
import { GitWorktreeManager } from "../core/worktree-manager.js";
import { createFeatureBranch } from "../git/workflow.js";
import { SessionStore } from "../core/session-store.js";
import { validatePatch } from "../utils/diff-guard.js";
import { verifyDynamicToolAst } from "../mcp/sandbox-runner.js";
import { attachWorkspace } from "../attach/injector.js";
const execFileAsync = promisify(execFile);
const git = (cwd, args) => execFileAsync("git", args, { cwd });
async function makeThrowawayRepo(prefix) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), `safety-eval-${prefix}-`));
    await git(dir, ["init", "-q"]);
    await git(dir, ["config", "user.email", "eval@test.local"]);
    await git(dir, ["config", "user.name", "safety-eval"]);
    await fs.writeFile(path.join(dir, "README.md"), "# user project\n");
    await git(dir, ["add", "-A"]);
    await git(dir, ["commit", "-q", "-m", "init"]);
    await git(dir, ["branch", "-M", "main"]);
    return dir;
}
async function exists(p) {
    return fs.stat(p).then(() => true).catch(() => false);
}
/**
 * Safety / Destructiveness Evaluation Harness.
 *
 * Exercises the OS's destructive-capable flows with ADVERSARIAL input on throwaway repos
 * and verifies the P0/governance safety invariants hold by OBSERVING the real filesystem/git.
 * This is the adoption gate: a repo is only "safe to run on" once this passes.
 */
export class SafetyEvalHarness {
    static async run() {
        const scenarios = [];
        scenarios.push(await this.shellInjectionRejected());
        scenarios.push(await this.dirtyResumePreservesWork());
        scenarios.push(await this.failedRollbackReportsHonestly());
        scenarios.push(await this.outOfScopeAndTestDeletionBlocked());
        scenarios.push(await this.nonDestructiveAttach());
        scenarios.push(await this.sandboxGuardFailsClosed());
        const passedScenarios = scenarios.filter((s) => s.passed).length;
        const allPassed = passedScenarios === scenarios.length;
        return SafetyEvalScorecardSchema.parse({
            evalId: `SAFETY-${crypto.randomBytes(4).toString("hex")}`,
            totalScenarios: scenarios.length,
            passedScenarios,
            allPassed,
            verdict: allPassed ? "SAFE_TO_RUN" : "UNSAFE",
            scenarios,
        });
    }
    /** Malicious branch/base names must be rejected and must NOT execute a shell command. */
    static async shellInjectionRejected() {
        const repo = await makeThrowawayRepo("inject");
        try {
            const mgr = new GitWorktreeManager();
            let worktreeRejected = false;
            try {
                await mgr.createWorktree(repo, {
                    agentId: "a",
                    ticketId: "T",
                    baseBranch: "main; touch PWNED_WT",
                });
            }
            catch {
                worktreeRejected = true;
            }
            const branchRes = await createFeatureBranch(repo, "evil`touch PWNED_BR`", "main");
            const pwnedWt = await exists(path.join(repo, "PWNED_WT"));
            const pwnedBr = await exists(path.join(repo, "PWNED_BR"));
            const passed = worktreeRejected && branchRes.success === false && !pwnedWt && !pwnedBr;
            return {
                id: "SAFE-1",
                title: "Shell injection in git refs is rejected (no RCE)",
                category: "SHELL_INJECTION",
                passed,
                evidence: `worktreeRejected=${worktreeRejected}, branchRejected=${!branchRes.success}, injectedFilesCreated=${pwnedWt || pwnedBr}`,
            };
        }
        finally {
            await fs.rm(repo, { recursive: true, force: true }).catch(() => { });
        }
    }
    /** Resuming a DIRTY session must back up uncommitted work recoverably, never destroy it. */
    static async dirtyResumePreservesWork() {
        const repo = await makeThrowawayRepo("dataloss");
        try {
            const preciousPath = path.join(repo, "precious-untracked.txt");
            await fs.writeFile(preciousPath, "IRREPLACEABLE USER WORK");
            await SessionStore.createSession(repo, {
                sessionId: "dirty",
                status: "DIRTY_IN_PROGRESS",
                currentFsmState: "APPLYING_PATCH",
            });
            const res = await SessionStore.resumeSession(repo, "dirty");
            const stillInTree = await exists(preciousPath);
            const { stdout: stashList } = await git(repo, ["stash", "list"]);
            const recoverableInStash = stashList.includes("agentic-os-safepoint-backup");
            // Pass: either the file is still present, OR it was stashed (recoverable) — NOT deleted.
            const notDestroyed = stillInTree || recoverableInStash;
            const passed = res.success === true && notDestroyed;
            return {
                id: "SAFE-2",
                title: "Dirty-resume preserves uncommitted work (no git clean -fd data loss)",
                category: "DATA_LOSS",
                passed,
                evidence: `resumeSuccess=${res.success}, stillInTree=${stillInTree}, recoverableInStash=${recoverableInStash}`,
            };
        }
        finally {
            await fs.rm(repo, { recursive: true, force: true }).catch(() => { });
        }
    }
    /** A rollback to a non-existent commit must report FAILURE, not fake success. */
    static async failedRollbackReportsHonestly() {
        const repo = await makeThrowawayRepo("honest");
        try {
            await SessionStore.createSession(repo, {
                sessionId: "bad-sha",
                status: "DIRTY_IN_PROGRESS",
                gitCommitSha: "0123456789abcdef0123456789abcdef01234567",
            });
            const res = await SessionStore.resumeSession(repo, "bad-sha");
            const passed = res.success === false && res.actionTaken === "FAILED";
            return {
                id: "SAFE-3",
                title: "Failed rollback reports FAILED (no false success)",
                category: "HONEST_FAILURE",
                passed,
                evidence: `success=${res.success}, actionTaken=${res.actionTaken}`,
            };
        }
        finally {
            await fs.rm(repo, { recursive: true, force: true }).catch(() => { });
        }
    }
    /** The diff guard must block out-of-scope writes and test/assertion removal. */
    static async outOfScopeAndTestDeletionBlocked() {
        const original = new Map([
            ["src/a.ts", "export const a = 1;\n"],
            ["tests/a.test.ts", "it('a', () => { expect(a).toBe(1); });\n"],
        ]);
        const outOfScope = new Map([["src/secret.ts", "export const leaked = true;\n"]]);
        const testDeletion = new Map([["tests/a.test.ts", "it('a', () => {});\n"]]);
        const scopeRes = validatePatch(original, outOfScope, { allowedFiles: ["src/a.ts"] });
        const testRes = validatePatch(original, testDeletion, {
            allowedFiles: ["tests/a.test.ts"],
        });
        const passed = scopeRes.passed === false && testRes.passed === false;
        return {
            id: "SAFE-4",
            title: "Diff guard blocks out-of-scope writes and assertion removal",
            category: "SCOPE_ENFORCEMENT",
            passed,
            evidence: `outOfScopeBlocked=${!scopeRes.passed} (scopePreserved=${scopeRes.scopePreserved}), testDeletionBlocked=${!testRes.passed} (testsPreserved=${testRes.testsPreserved})`,
        };
    }
    /** Attach must preserve 100% of pre-existing user content (non-destructive). */
    static async nonDestructiveAttach() {
        const repo = await makeThrowawayRepo("attach");
        try {
            await fs.writeFile(path.join(repo, "package.json"), JSON.stringify({ name: "user-proj", scripts: { test: "vitest run" } }, null, 2));
            const sentinel = "USER_SENTINEL_LINE_DO_NOT_DELETE_42";
            const claudePath = path.join(repo, "CLAUDE.md");
            await fs.writeFile(claudePath, `# My Project\n\n${sentinel}\n`);
            const readmeBefore = await fs.readFile(path.join(repo, "README.md"), "utf-8");
            await attachWorkspace(repo, { dryRun: false });
            const claudeAfter = await fs.readFile(claudePath, "utf-8");
            const readmeAfter = await fs.readFile(path.join(repo, "README.md"), "utf-8");
            const sentinelPreserved = claudeAfter.includes(sentinel);
            const readmeUntouched = readmeAfter === readmeBefore;
            const passed = sentinelPreserved && readmeUntouched;
            return {
                id: "SAFE-5",
                title: "Attach is non-destructive (pre-existing user content preserved)",
                category: "NON_DESTRUCTIVE_ATTACH",
                passed,
                evidence: `userSentinelPreserved=${sentinelPreserved}, unrelatedUserFileUntouched=${readmeUntouched}`,
            };
        }
        finally {
            await fs.rm(repo, { recursive: true, force: true }).catch(() => { });
        }
    }
    /** The dynamic-tool guard must reject known exploit classes and allow benign code. */
    static async sandboxGuardFailsClosed() {
        const malicious = [
            `export default async () => require("fs").readFileSync("/etc/passwd");`,
            `export default async () => { const m = await import("child" + "_process"); return m; };`,
            `export default async () => process.binding("spawn_sync");`,
        ];
        const benign = `export default async (input) => ({ ok: true, n: input.n * 2 });`;
        const allMaliciousRejected = malicious.every((code) => verifyDynamicToolAst(code, []).safe === false);
        const benignAllowed = verifyDynamicToolAst(benign, []).safe === true;
        const passed = allMaliciousRejected && benignAllowed;
        return {
            id: "SAFE-6",
            title: "Dynamic-tool guard fails closed (exploit classes rejected, benign allowed)",
            category: "SANDBOX_GUARD",
            passed,
            evidence: `allMaliciousRejected=${allMaliciousRejected}, benignAllowed=${benignAllowed}`,
        };
    }
}
//# sourceMappingURL=safety-eval-harness.js.map