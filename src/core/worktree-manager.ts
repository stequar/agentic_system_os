import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  WorktreeSessionSchema,
  WorktreePoolStatusSchema,
  type WorktreeSession,
  type WorktreePoolStatus,
} from "../contracts/worktree.js";

const execAsync = promisify(exec);

/**
 * Normalizza stringa in slug sicuro per percorsi file e branch Git.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CreateWorktreeOptions {
  agentId: string;
  ticketId: string;
  branchName?: string;
  baseBranch?: string;
}

export interface GitWorktreeManagerOptions {
  maxConcurrent?: number;
}

/**
 * Gestore del ciclo di vita dei Git Worktrees per l'esecuzione sicura e isolata di agenti concorrenti.
 * Alloca directory isolate in `.company-os/worktrees/<agent-id>`, limitando la concorrenza a 4 agenti simultanei,
 * con garanzia di ripristino e cleanup atomico in blocco `finally`.
 */
export class GitWorktreeManager {
  private maxConcurrent: number;
  private activeSessions: Map<string, WorktreeSession> = new Map();
  private totalCreated: number = 0;

  constructor(options?: GitWorktreeManagerOptions) {
    this.maxConcurrent = options?.maxConcurrent ?? 4;
  }

  /**
   * Restituisce la directory radice del pool di worktree (.company-os/worktrees)
   */
  getPoolDir(repoPath: string): string {
    return path.join(path.resolve(repoPath), ".company-os", "worktrees");
  }

  /**
   * Restituisce lo stato corrente del pool di worktree
   */
  getPoolStatus(repoPath: string): WorktreePoolStatus {
    const active = Array.from(this.activeSessions.values()).filter(
      (s) => s.status !== "CLEANED_UP"
    );

    return WorktreePoolStatusSchema.parse({
      activeWorktrees: active,
      maxConcurrent: this.maxConcurrent,
      poolDir: this.getPoolDir(repoPath),
      totalCreated: this.totalCreated,
    });
  }

  /**
   * Crea e isola una nuova working directory Git Worktree per l'agente specificato.
   */
  async createWorktree(
    repoPath: string,
    options: CreateWorktreeOptions
  ): Promise<WorktreeSession> {
    const resolvedRepo = path.resolve(repoPath);
    const activeCount = Array.from(this.activeSessions.values()).filter(
      (s) => s.status !== "CLEANED_UP"
    ).length;

    if (activeCount >= this.maxConcurrent) {
      throw new Error(
        `MAX_CONCURRENT_WORKTREES_EXCEEDED: Raggiunto il limite massimo di ${this.maxConcurrent} worktree simultanei.`
      );
    }

    const cleanAgent = slugify(options.agentId);
    const cleanTicket = slugify(options.ticketId);
    const poolDir = this.getPoolDir(resolvedRepo);
    await fs.mkdir(poolDir, { recursive: true });

    const worktreePath = path.join(poolDir, cleanAgent);
    const baseBranch = options.baseBranch || "main";
    const branchName =
      options.branchName || `feat/${cleanTicket}-${cleanAgent}-${Date.now().toString().slice(-4)}`;

    // Se esiste una directory o worktree precedente per questo agente, puliscilo preventivamente
    await this.cleanupWorktree(resolvedRepo, worktreePath).catch(() => {});

    // Crea il worktree tramite comando Git
    try {
      // Prova a creare un nuovo branch
      await execAsync(
        `git worktree add -b ${branchName} "${worktreePath}" ${baseBranch}`,
        { cwd: resolvedRepo }
      );
    } catch (createErr: any) {
      // Se il branch esiste già, crea il worktree agganciandosi al branch esistente
      try {
        await execAsync(`git worktree add "${worktreePath}" ${branchName}`, {
          cwd: resolvedRepo,
        });
      } catch (fallbackErr: any) {
        throw new Error(
          `Impossibile creare il worktree per l'agente '${options.agentId}': ${fallbackErr.message || String(fallbackErr)}`
        );
      }
    }

    const sessionId = `wt-${cleanAgent}-${crypto.randomBytes(3).toString("hex")}`;
    const session: WorktreeSession = WorktreeSessionSchema.parse({
      worktreeId: sessionId,
      agentId: options.agentId,
      ticketId: options.ticketId,
      branchName,
      worktreePath,
      baseBranch,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    });

    this.activeSessions.set(session.worktreeId, session);
    this.totalCreated++;

    return session;
  }

  /**
   * Esegue il rebase sequenziale deterministico sul branch target prima del consolidamento della PR.
   */
  async rebaseWorktree(
    worktreePath: string,
    targetBranch: string = "main"
  ): Promise<{ success: boolean; message: string }> {
    try {
      await execAsync(`git rebase ${targetBranch}`, { cwd: worktreePath });

      // Aggiorna lo stato della sessione corrispondente
      for (const session of this.activeSessions.values()) {
        if (session.worktreePath === worktreePath && session.status === "ACTIVE") {
          session.status = "REBASED";
          break;
        }
      }

      return {
        success: true,
        message: `Rebase su '${targetBranch}' completato con successo.`,
      };
    } catch (err: any) {
      // In caso di conflitto o fallimento, effettua il rollback del rebase
      await execAsync(`git rebase --abort`, { cwd: worktreePath }).catch(() => {});
      return {
        success: false,
        message: `Fallimento rebase su '${targetBranch}': ${err.message || String(err)}`,
      };
    }
  }

  /**
   * Rimuove forzatamente il worktree e ripulisce le referenze Git (git worktree prune).
   */
  async cleanupWorktree(
    repoPath: string,
    worktreeTarget: string | WorktreeSession
  ): Promise<{ success: boolean; message: string }> {
    const resolvedRepo = path.resolve(repoPath);
    const targetPath =
      typeof worktreeTarget === "string"
        ? worktreeTarget
        : worktreeTarget.worktreePath;

    try {
      // Rimuove il worktree registrato in Git
      await execAsync(`git worktree remove --force "${targetPath}"`, {
        cwd: resolvedRepo,
      }).catch(() => {});

      // Esegue il pruning dei riferimenti orfani
      await execAsync(`git worktree prune`, { cwd: resolvedRepo }).catch(() => {});

      // Verifica e rimuove forzatamente qualsiasi residuo sul filesystem
      await fs.rm(targetPath, { recursive: true, force: true }).catch(() => {});

      // Aggiorna lo stato della sessione in memoria
      for (const [id, session] of this.activeSessions.entries()) {
        if (session.worktreePath === targetPath) {
          session.status = "CLEANED_UP";
          this.activeSessions.delete(id);
          break;
        }
      }

      return {
        success: true,
        message: `Worktree '${targetPath}' rimosso e ripulito con successo.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Errore durante la pulizia del worktree: ${err.message || String(err)}`,
      };
    }
  }

  /**
   * Esegue una funzione all'interno del contesto isolato di un worktree,
   * garantendo la pulizia atomica automatica in blocco `finally`.
   */
  async withWorktree<T>(
    repoPath: string,
    options: CreateWorktreeOptions,
    fn: (session: WorktreeSession) => Promise<T>
  ): Promise<T> {
    const session = await this.createWorktree(repoPath, options);
    try {
      return await fn(session);
    } finally {
      await this.cleanupWorktree(repoPath, session);
    }
  }

  /**
   * Esegue il pruning dei worktree orfani o non tracciati presenti nella cartella pool.
   */
  async pruneOrphanWorktrees(repoPath: string): Promise<number> {
    const resolvedRepo = path.resolve(repoPath);
    const poolDir = this.getPoolDir(resolvedRepo);
    let prunedCount = 0;

    await execAsync(`git worktree prune`, { cwd: resolvedRepo }).catch(() => {});

    try {
      const entries = await fs.readdir(poolDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(poolDir, entry.name);
          const isManagedActive = Array.from(this.activeSessions.values()).some(
            (s) => s.worktreePath === dirPath && s.status !== "CLEANED_UP"
          );

          if (!isManagedActive) {
            await this.cleanupWorktree(resolvedRepo, dirPath);
            prunedCount++;
          }
        }
      }
    } catch {
      // Pool directory inesistente
    }

    return prunedCount;
  }
}
