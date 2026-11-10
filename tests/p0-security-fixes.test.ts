import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { GitWorktreeManager } from "../src/core/worktree-manager.js";
import { createFeatureBranch } from "../src/git/workflow.js";
import { SessionStore } from "../src/core/session-store.js";

const execFileAsync = promisify(execFile);
const git = (cwd: string, args: string[]) => execFileAsync("git", args, { cwd });

async function initGitRepo(dir: string): Promise<void> {
  await git(dir, ["init", "-q"]);
  await git(dir, ["config", "user.email", "t@t.co"]);
  await git(dir, ["config", "user.name", "t"]);
  await fs.writeFile(path.join(dir, "tracked.txt"), "v1");
  await git(dir, ["add", "-A"]);
  await git(dir, ["commit", "-q", "-m", "init"]);
}

/**
 * Regression tests for the P0 fixes (RCA systemic principle:
 * "Trust & Concurrency Boundary Inversion").
 */
describe("P0 security & data-loss regression", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "p0-fix-"));
  });
  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  describe("Shell injection is rejected (execFile argv + git-ref validation)", () => {
    it("createWorktree rejects a malicious baseBranch instead of executing it", async () => {
      const mgr = new GitWorktreeManager();
      await expect(
        mgr.createWorktree(tempDir, {
          agentId: "a1",
          ticketId: "T1",
          baseBranch: "main; touch INJECTED",
        })
      ).rejects.toThrow(/INVALID_GIT_REF/);
      const injected = await fs
        .stat(path.join(tempDir, "INJECTED"))
        .then(() => true)
        .catch(() => false);
      expect(injected).toBe(false);
    });

    it("createWorktree rejects a malicious branchName", async () => {
      const mgr = new GitWorktreeManager();
      await expect(
        mgr.createWorktree(tempDir, {
          agentId: "a1",
          ticketId: "T1",
          branchName: "x$(touch INJECTED)",
        })
      ).rejects.toThrow(/INVALID_GIT_REF/);
    });

    it("createFeatureBranch rejects injection in the branch name", async () => {
      const res = await createFeatureBranch(tempDir, "evil`whoami`", "main");
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/INVALID_GIT_REF/);
    });
  });

  describe("Data-loss fix: dirty resume preserves untracked work via stash (no git clean -fd)", () => {
    it("moves untracked files into a recoverable stash instead of deleting them", async () => {
      await initGitRepo(tempDir);
      await fs.writeFile(path.join(tempDir, "precious-untracked.txt"), "DO NOT DELETE");

      await SessionStore.createSession(tempDir, {
        sessionId: "dirty-real",
        status: "DIRTY_IN_PROGRESS",
        currentFsmState: "APPLYING_PATCH",
      });

      const res = await SessionStore.resumeSession(tempDir, "dirty-real");
      expect(res.success).toBe(true);
      expect(res.actionTaken).toBe("ROLLED_BACK_AND_RESUMED");

      // The untracked file is removed from the working tree...
      const stillInTree = await fs
        .stat(path.join(tempDir, "precious-untracked.txt"))
        .then(() => true)
        .catch(() => false);
      expect(stillInTree).toBe(false);
      // ...but recoverable from git stash (git clean -fd would have destroyed it).
      const { stdout } = await git(tempDir, ["stash", "list"]);
      expect(stdout).toContain("agentic-os-safepoint-backup");
    });

    it("reports FAILED (not false success) when the rollback target sha does not exist", async () => {
      await initGitRepo(tempDir);
      await SessionStore.createSession(tempDir, {
        sessionId: "bad-sha",
        status: "DIRTY_IN_PROGRESS",
        gitCommitSha: "0123456789abcdef0123456789abcdef01234567",
      });

      const res = await SessionStore.resumeSession(tempDir, "bad-sha");
      expect(res.success).toBe(false);
      expect(res.actionTaken).toBe("FAILED");
    });
  });

  describe("Concurrency: unique per-ticket worktree paths (no clobber)", () => {
    it("same agent + same ticket yields distinct worktree paths", async () => {
      await initGitRepo(tempDir);
      const mgr = new GitWorktreeManager();
      const s1 = await mgr.createWorktree(tempDir, { agentId: "agent-x", ticketId: "TCK-1" });
      const s2 = await mgr.createWorktree(tempDir, { agentId: "agent-x", ticketId: "TCK-1" });
      try {
        expect(s1.worktreePath).not.toBe(s2.worktreePath);
      } finally {
        await mgr.cleanupWorktree(tempDir, s1);
        await mgr.cleanupWorktree(tempDir, s2);
      }
    });
  });
});
