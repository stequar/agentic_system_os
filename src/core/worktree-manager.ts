import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  WorktreeSessionSchema,
  WorktreePoolStatusSchema,
  type WorktreeSession,
  type WorktreePoolStatus,
} from "../contracts/worktree.js";

// Esecuzione Git SENZA shell (argv diretto) per eliminare qualsiasi shell injection.
const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync("git", args, { cwd });
}

/**
 * Normalizza stringa in slug sicuro per percorsi file e branch Git.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Valida un riferimento Git (branch/base) prima di passarlo a `git`.
 * Difesa in profondità sopra `execFile`: rifiuta leading dash (argument injection),
 * sequenze `..`, caratteri fuori dal set sicuro e slash malformati.
 */
function assertSafeGitRef(ref: string, kind: string): void {
  if (
    typeof ref !== "string" ||
    ref.length === 0 ||
    ref.startsWith("-") ||
    ref.includes("..") ||
    ref.includes("//") ||
    ref.endsWith("/") ||
    !/^[A-Za-z0-9._\/-]+$/.test(ref)
  ) {
    throw new Error(`INVALID_GIT_REF: '${ref}' non è un ${kind} Git valido.`);
  }
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
 * Alloca directory isolate e univoche in `.company-os/worktrees/<agent>-<ticket>-<rand>`, limitando la
 * concorrenza con prenotazione sincrona dello slot (nessun TOCTOU), con cleanup atomico in blocco `finally`.
 */
export class GitWorktreeManager {
  private maxConcurrent: number;
  private activeSessions: Map<string, WorktreeSession> = new Map();
  private pendingReservations: number = 0;
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
   * Conta gli slot occupati: sessioni attive + prenotazioni in volo.
   */
  private occupiedSlots(): number {
    const active = Array.from(this.activeSessions.values()).filter(
      (s) => s.status !== "CLEANED_UP"
    ).length;
    return active + this.pendingReservations;
  }

  /**
   * Crea e isola una nuova working directory Git Worktree per l'agente specificato.
   */
  async createWorktree(
    repoPath: string,
    options: CreateWorktreeOptions
  ): Promise<WorktreeSession> {
    const resolvedRepo = path.resolve(repoPath);

    // Prenotazione SINCRONA dello slot prima di qualsiasi `await` (elimina il TOCTOU
    // che permetteva a più chiamate concorrenti di superare insieme il limite).
    if (this.occupiedSlots() >= this.maxConcurrent) {
      throw new Error(
        `MAX_CONCURRENT_WORKTREES_EXCEEDED: Raggiunto il limite massimo di ${this.maxConcurrent} worktree simultanei.`
      );
    }
    this.pendingReservations++;

    try {
      const cleanAgent = slugify(options.agentId);
      const cleanTicket = slugify(options.ticketId);
      const uniq = crypto.randomBytes(3).toString("hex");
      const poolDir = this.getPoolDir(resolvedRepo);
      await fs.mkdir(poolDir, { recursive: true });

      // Percorso UNIVOCO per (agente, ticket, chiamata): due ticket dello stesso agente
      // non collidono più sullo stesso worktree.
      const worktreePath = path.join(poolDir, `${cleanAgent}-${cleanTicket}-${uniq}`);
      const baseBranch = options.baseBranch || "main";
      const branchName =
        options.branchName || `feat/${cleanTicket}-${cleanAgent}-${uniq}`;

      assertSafeGitRef(branchName, "branch name");
      assertSafeGitRef(baseBranch, "base branch");

      // Crea il worktree tramite comando Git (argv diretto, nessuna shell).
      try {
        await git(resolvedRepo, ["worktree", "add", "-b", branchName, worktreePath, baseBranch]);
      } catch (createErr: any) {
        // Se il branch esiste già, crea il worktree agganciandosi al branch esistente
        try {
          await git(resolvedRepo, ["worktree", "add", worktreePath, branchName]);
        } catch (fallbackErr: any) {
          throw new Error(
            `Impossibile creare il worktree per l'agente '${options.agentId}': ${fallbackErr.message || String(fallbackErr)}`
          );
        }
      }

      const sessionId = `wt-${cleanAgent}-${uniq}`;
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
    } finally {
      // La prenotazione è stata convertita in sessione attiva (o annullata su errore).
      this.pendingReservations--;
    }
  }

  /**
   * Esegue il rebase sequenziale deterministico sul branch target prima del consolidamento della PR.
   */
  async rebaseWorktree(
    worktreePath: string,
    targetBranch: string = "main"
  ): Promise<{ success: boolean; message: string }> {
    try {
      assertSafeGitRef(targetBranch, "target branch");
      await git(worktreePath, ["rebase", targetBranch]);

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
      await git(worktreePath, ["rebase", "--abort"]).catch(() => {});
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
      await git(resolvedRepo, ["worktree", "remove", "--force", targetPath]).catch(() => {});

      // Esegue il pruning dei riferimenti orfani
      await git(resolvedRepo, ["worktree", "prune"]).catch(() => {});

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

    await git(resolvedRepo, ["worktree", "prune"]).catch(() => {});

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
