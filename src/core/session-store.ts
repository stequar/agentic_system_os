import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { atomicWriteFile } from "../utils/fs-atomic.js";
import {
  SessionSnapshotSchema,
  SessionResumeResultSchema,
  type SessionSnapshot,
  type SessionResumeResult,
  type SessionStatus,
} from "../contracts/session.js";

const execAsync = promisify(exec);

/**
 * Calcola l'hash SHA-256 dell'albero di lavoro (git diff o fallback)
 */
async function computeWorktreeDiffHash(targetPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync("git diff HEAD", { cwd: targetPath });
    return crypto.createHash("sha256").update(stdout || "clean").digest("hex");
  } catch {
    return crypto.createHash("sha256").update("no-git").digest("hex");
  }
}

/**
 * Ottiene il commit SHA attuale di Git
 */
async function getGitCommitSha(targetPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync("git rev-parse HEAD", { cwd: targetPath });
    return stdout.trim();
  } catch {
    return "0000000000000000000000000000000000000000";
  }
}

export class SessionStore {
  /**
   * Restituisce la directory di persistenza per le sessioni
   */
  static getSessionsDir(targetPath: string): string {
    return path.join(path.resolve(targetPath), ".company-os", "sessions");
  }

  /**
   * Crea una nuova sessione di lavoro e la persiste atomicamente
   */
  static async createSession(
    targetPath: string,
    initialData?: Partial<SessionSnapshot>
  ): Promise<SessionSnapshot> {
    const resolvedPath = path.resolve(targetPath);
    const sessionId = initialData?.sessionId || `session-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const gitCommitSha = initialData?.gitCommitSha || (await getGitCommitSha(resolvedPath));
    const diffHash = initialData?.diffHash || (await computeWorktreeDiffHash(resolvedPath));

    const snapshot: SessionSnapshot = SessionSnapshotSchema.parse({
      sessionId,
      status: initialData?.status || "COMMITTED_SAFEPOINT",
      targetPath: resolvedPath,
      currentFsmState: initialData?.currentFsmState || "IDLE",
      activeTicketId: initialData?.activeTicketId,
      gitCommitSha,
      diffHash,
      taskStack: initialData?.taskStack || [],
      timestamp: new Date().toISOString(),
      metadata: initialData?.metadata || {},
    });

    await this.saveSnapshot(resolvedPath, snapshot);
    return snapshot;
  }

  /**
   * Salva uno snapshot di sessione in modo atomico POSIX Write-Sync-Rename
   */
  static async saveSnapshot(targetPath: string, snapshot: SessionSnapshot): Promise<SessionSnapshot> {
    const validated = SessionSnapshotSchema.parse(snapshot);
    const sessionsDir = this.getSessionsDir(targetPath);
    await fs.mkdir(sessionsDir, { recursive: true });

    const filePath = path.join(sessionsDir, `${validated.sessionId}.json`);
    const content = JSON.stringify(validated, null, 2);

    await atomicWriteFile(filePath, content, { backup: false });
    return validated;
  }

  /**
   * Carica uno snapshot specifico per ID o l'ultimo snapshot registrato
   */
  static async loadSession(targetPath: string, sessionId?: string): Promise<SessionSnapshot | null> {
    const sessionsDir = this.getSessionsDir(targetPath);

    if (sessionId) {
      const filePath = path.join(sessionsDir, `${sessionId}.json`);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        return SessionSnapshotSchema.parse(JSON.parse(content));
      } catch {
        return null;
      }
    }

    // Se non specificato, cerca l'ultimo snapshot modificato
    const all = await this.listSessions(targetPath);
    if (all.length === 0) return null;

    // Ordina per timestamp decrescente
    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return all[0];
  }

  /**
   * Elenca tutti gli snapshot di sessione persistiti nel workspace
   */
  static async listSessions(targetPath: string): Promise<SessionSnapshot[]> {
    const sessionsDir = this.getSessionsDir(targetPath);
    try {
      const files = await fs.readdir(sessionsDir);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));
      const snapshots: SessionSnapshot[] = [];

      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(path.join(sessionsDir, file), "utf-8");
          const parsed = SessionSnapshotSchema.safeParse(JSON.parse(content));
          if (parsed.success) {
            snapshots.push(parsed.data);
          }
        } catch {
          // File non valido o parziale ignorato
        }
      }
      return snapshots;
    } catch {
      return [];
    }
  }

  /**
   * Two-Phase Commit: marca il task corrente come DIRTY_IN_PROGRESS
   */
  static async markDirtyInProgress(
    targetPath: string,
    sessionId: string,
    activeTicketId?: string
  ): Promise<SessionSnapshot> {
    const session = await this.loadSession(targetPath, sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found in ${targetPath}`);
    }

    const updated: SessionSnapshot = {
      ...session,
      status: "DIRTY_IN_PROGRESS",
      activeTicketId: activeTicketId || session.activeTicketId,
      timestamp: new Date().toISOString(),
    };

    return await this.saveSnapshot(targetPath, updated);
  }

  /**
   * Two-Phase Commit: marca il task corrente come COMMITTED_SAFEPOINT
   */
  static async commitSafepoint(
    targetPath: string,
    sessionId: string,
    options?: { commitSha?: string; activeTicketId?: string }
  ): Promise<SessionSnapshot> {
    const session = await this.loadSession(targetPath, sessionId);
    if (!session) {
      throw new Error(`Session '${sessionId}' not found in ${targetPath}`);
    }

    const gitCommitSha = options?.commitSha || (await getGitCommitSha(targetPath));
    const diffHash = await computeWorktreeDiffHash(targetPath);

    const updated: SessionSnapshot = {
      ...session,
      status: "COMMITTED_SAFEPOINT",
      activeTicketId: options?.activeTicketId !== undefined ? options.activeTicketId : session.activeTicketId,
      gitCommitSha,
      diffHash,
      timestamp: new Date().toISOString(),
    };

    return await this.saveSnapshot(targetPath, updated);
  }

  /**
   * Ripristina l'esecuzione da uno snapshot (Session Resume).
   * Se lo stato era DIRTY_IN_PROGRESS, effettua rollback sicuro a clean commit.
   */
  static async resumeSession(targetPath: string, sessionId?: string): Promise<SessionResumeResult> {
    const resolvedPath = path.resolve(targetPath);
    const session = await this.loadSession(resolvedPath, sessionId);

    if (!session) {
      return SessionResumeResultSchema.parse({
        success: false,
        sessionId: sessionId || "none",
        restoredFromStatus: "FAILED",
        actionTaken: "FAILED",
        gitCommitSha: "0000000000000000000000000000000000000000",
        message: `Nessuna sessione trovata per il resume in ${resolvedPath}`,
      });
    }

    if (session.status === "COMPLETED") {
      return SessionResumeResultSchema.parse({
        success: true,
        sessionId: session.sessionId,
        restoredFromStatus: session.status,
        actionTaken: "ALREADY_COMPLETED",
        gitCommitSha: session.gitCommitSha,
        activeTicketId: session.activeTicketId,
        message: `Sessione ${session.sessionId} già completata con successo.`,
      });
    }

    if (session.status === "DIRTY_IN_PROGRESS") {
      // Unclean safepoint rilevato: eseguiamo rollback automatico a clean commit
      try {
        if (session.gitCommitSha && session.gitCommitSha !== "0000000000000000000000000000000000000000") {
          await execAsync(`git reset --hard ${session.gitCommitSha}`, { cwd: resolvedPath });
          await execAsync("git clean -fd", { cwd: resolvedPath });
        }
      } catch {
        // Fallback in caso di mancato supporto git
      }

      // Aggiorniamo lo status a COMMITTED_SAFEPOINT per consentire la ripresa pulita
      const restored = await this.commitSafepoint(resolvedPath, session.sessionId, {
        commitSha: session.gitCommitSha,
      });

      return SessionResumeResultSchema.parse({
        success: true,
        sessionId: restored.sessionId,
        restoredFromStatus: "DIRTY_IN_PROGRESS",
        actionTaken: "ROLLED_BACK_AND_RESUMED",
        gitCommitSha: restored.gitCommitSha,
        activeTicketId: restored.activeTicketId,
        message: `Sessione ${session.sessionId} ripristinata con rollback a commit pulito ${session.gitCommitSha.slice(0, 7)}.`,
      });
    }

    // Caso standard: safe-point già integro e pronto per la ripresa
    return SessionResumeResultSchema.parse({
      success: true,
      sessionId: session.sessionId,
      restoredFromStatus: session.status,
      actionTaken: "RESUMED_CLEAN",
      gitCommitSha: session.gitCommitSha,
      activeTicketId: session.activeTicketId,
      message: `Sessione ${session.sessionId} ripresa dall'ultimo safepoint coerente (${session.currentFsmState}).`,
    });
  }
}
