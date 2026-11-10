import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { GitWorktreeManager } from "../src/core/worktree-manager.js";
import { WorktreeSessionSchema, WorktreePoolStatusSchema } from "../src/contracts/worktree.js";

const execFileAsync = promisify(execFile);
const git = (cwd: string, args: string[]) => execFileAsync("git", args, { cwd });

describe("Git Worktree Multi-Agent Pool & Safe Concurrency Sandbox", () => {
  // Test isolation: operate on a throwaway temp git repo, NOT the project repo.
  // (Previously this suite ran `git worktree add -b feat/...` against process.cwd(),
  // littering the real repo with ~150 orphan branches on every test run.)
  let rootDir: string;
  const manager = new GitWorktreeManager({ maxConcurrent: 4 });
  const createdSessions: string[] = [];

  beforeAll(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "worktree-test-"));
    await git(rootDir, ["init", "-q"]);
    await git(rootDir, ["config", "user.email", "t@t.co"]);
    await git(rootDir, ["config", "user.name", "t"]);
    await fs.writeFile(path.join(rootDir, "README.md"), "# worktree test fixture\n");
    await git(rootDir, ["add", "-A"]);
    await git(rootDir, ["commit", "-q", "-m", "init"]);
    await git(rootDir, ["branch", "-M", "main"]);
  });

  afterAll(async () => {
    await fs.rm(rootDir, { recursive: true, force: true }).catch(() => {});
  });

  afterEach(async () => {
    // Pulizia garantita di tutti i worktree creati durante i test
    for (const sessionPath of createdSessions) {
      await manager.cleanupWorktree(rootDir, sessionPath).catch(() => {});
    }
    createdSessions.length = 0;
  });

  it("getPoolDir restituisce il percorso atteso in .company-os/worktrees", () => {
    const poolDir = manager.getPoolDir(rootDir);
    expect(poolDir).toBe(path.join(rootDir, ".company-os", "worktrees"));
  });

  it("getPoolStatus restituisce lo stato del pool conforme a WorktreePoolStatusSchema", () => {
    const status = manager.getPoolStatus(rootDir);
    const validated = WorktreePoolStatusSchema.parse(status);

    expect(validated.maxConcurrent).toBe(4);
    expect(validated.poolDir).toBe(path.join(rootDir, ".company-os", "worktrees"));
    expect(Array.isArray(validated.activeWorktrees)).toBe(true);
  });

  it("crea un worktree isolato per un agente restituendo WorktreeSession conforme", async () => {
    const session = await manager.createWorktree(rootDir, {
      agentId: "test-leaf-1",
      ticketId: "TCK-8.3",
    });
    createdSessions.push(session.worktreePath);

    const validated = WorktreeSessionSchema.parse(session);
    expect(validated.agentId).toBe("test-leaf-1");
    expect(validated.ticketId).toBe("TCK-8.3");
    expect(validated.status).toBe("ACTIVE");

    // Verifica esistenza fisica della directory del worktree
    const stat = await fs.stat(session.worktreePath);
    expect(stat.isDirectory()).toBe(true);

    // Un worktree Git contiene un file .git che punta al repo genitore
    const gitFileStat = await fs.stat(path.join(session.worktreePath, ".git"));
    expect(gitFileStat.isFile()).toBe(true);
  });

  it("withWorktree garantisce la pulizia atomica del worktree anche in caso di eccezione", async () => {
    let capturedPath = "";

    await expect(
      manager.withWorktree(
        rootDir,
        {
          agentId: "test-leaf-auto-cleanup",
          ticketId: "TCK-8.3",
        },
        async (session) => {
          capturedPath = session.worktreePath;
          const stat = await fs.stat(session.worktreePath);
          expect(stat.isDirectory()).toBe(true);
          throw new Error("Errore simulato all'interno del task dell'agente");
        }
      )
    ).rejects.toThrow("Errore simulato all'interno del task dell'agente");

    // Verifica che il worktree sia stato rimosso dopo il blocco finally
    let exists = true;
    try {
      await fs.stat(capturedPath);
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });

  it("blocca la creazione oltre il limite massimo di concorrenza (max 4 agenti)", async () => {
    const localManager = new GitWorktreeManager({ maxConcurrent: 2 });
    const localSessions: string[] = [];

    try {
      // Crea 2 worktree (limite massimo impostato a 2)
      const s1 = await localManager.createWorktree(rootDir, {
        agentId: "limit-agent-1",
        ticketId: "TCK-LIMIT-1",
      });
      localSessions.push(s1.worktreePath);

      const s2 = await localManager.createWorktree(rootDir, {
        agentId: "limit-agent-2",
        ticketId: "TCK-LIMIT-2",
      });
      localSessions.push(s2.worktreePath);

      // Il terzo deve fallire con errore di superamento limite
      await expect(
        localManager.createWorktree(rootDir, {
          agentId: "limit-agent-3",
          ticketId: "TCK-LIMIT-3",
        })
      ).rejects.toThrow("MAX_CONCURRENT_WORKTREES_EXCEEDED");
    } finally {
      for (const p of localSessions) {
        await localManager.cleanupWorktree(rootDir, p).catch(() => {});
      }
    }
  });

  it("rebaseWorktree esegue il rebase sul branch principale", async () => {
    const session = await manager.createWorktree(rootDir, {
      agentId: "test-rebase-agent",
      ticketId: "TCK-8.3",
    });
    createdSessions.push(session.worktreePath);

    const rebaseResult = await manager.rebaseWorktree(session.worktreePath, "main");
    expect(rebaseResult.success).toBe(true);
  });

  it("pruneOrphanWorktrees ripulisce cartelle orfane non tracciate", async () => {
    const poolDir = manager.getPoolDir(rootDir);
    const orphanDir = path.join(poolDir, "orphan-ghost-agent");
    await fs.mkdir(orphanDir, { recursive: true });

    const pruned = await manager.pruneOrphanWorktrees(rootDir);
    expect(pruned).toBeGreaterThanOrEqual(1);

    let exists = true;
    try {
      await fs.stat(orphanDir);
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });
});
