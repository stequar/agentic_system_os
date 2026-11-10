import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { atomicWriteFile } from "../utils/fs-atomic.js";
import { SessionSnapshotSchema, SessionResumeResultSchema, } from "../contracts/session.js";
// Git senza shell (argv diretto): nessuna interpolazione di SHA/percorsi in `/bin/sh`.
const execFileAsync = promisify(execFile);
async function git(cwd, args) {
    return execFileAsync("git", args, { cwd });
}
/** Verifica se `cwd` è dentro un repository Git. */
async function isGitRepo(cwd) {
    try {
        await git(cwd, ["rev-parse", "--git-dir"]);
        return true;
    }
    catch {
        return false;
    }
}
const SHA_RE = /^[0-9a-f]{40}$/i;
/**
 * Calcola l'hash SHA-256 dell'albero di lavoro (git diff o fallback)
 */
async function computeWorktreeDiffHash(targetPath) {
    try {
        const { stdout } = await git(targetPath, ["diff", "HEAD"]);
        return crypto.createHash("sha256").update(stdout || "clean").digest("hex");
    }
    catch {
        return crypto.createHash("sha256").update("no-git").digest("hex");
    }
}
/**
 * Ottiene il commit SHA attuale di Git
 */
async function getGitCommitSha(targetPath) {
    try {
        const { stdout } = await git(targetPath, ["rev-parse", "HEAD"]);
        return stdout.trim();
    }
    catch {
        return "0000000000000000000000000000000000000000";
    }
}
export class SessionStore {
    /**
     * Restituisce la directory di persistenza per le sessioni
     */
    static getSessionsDir(targetPath) {
        return path.join(path.resolve(targetPath), ".company-os", "sessions");
    }
    /**
     * Crea una nuova sessione di lavoro e la persiste atomicamente
     */
    static async createSession(targetPath, initialData) {
        const resolvedPath = path.resolve(targetPath);
        const sessionId = initialData?.sessionId || `session-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
        const gitCommitSha = initialData?.gitCommitSha || (await getGitCommitSha(resolvedPath));
        const diffHash = initialData?.diffHash || (await computeWorktreeDiffHash(resolvedPath));
        const snapshot = SessionSnapshotSchema.parse({
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
    static async saveSnapshot(targetPath, snapshot) {
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
    static async loadSession(targetPath, sessionId) {
        const sessionsDir = this.getSessionsDir(targetPath);
        if (sessionId) {
            const filePath = path.join(sessionsDir, `${sessionId}.json`);
            try {
                const content = await fs.readFile(filePath, "utf-8");
                return SessionSnapshotSchema.parse(JSON.parse(content));
            }
            catch {
                return null;
            }
        }
        // Se non specificato, cerca l'ultimo snapshot modificato
        const all = await this.listSessions(targetPath);
        if (all.length === 0)
            return null;
        // Ordina per timestamp decrescente
        all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return all[0];
    }
    /**
     * Elenca tutti gli snapshot di sessione persistiti nel workspace
     */
    static async listSessions(targetPath) {
        const sessionsDir = this.getSessionsDir(targetPath);
        try {
            const files = await fs.readdir(sessionsDir);
            const jsonFiles = files.filter((f) => f.endsWith(".json"));
            const snapshots = [];
            for (const file of jsonFiles) {
                try {
                    const content = await fs.readFile(path.join(sessionsDir, file), "utf-8");
                    const parsed = SessionSnapshotSchema.safeParse(JSON.parse(content));
                    if (parsed.success) {
                        snapshots.push(parsed.data);
                    }
                }
                catch {
                    // File non valido o parziale ignorato
                }
            }
            return snapshots;
        }
        catch {
            return [];
        }
    }
    /**
     * Two-Phase Commit: marca il task corrente come DIRTY_IN_PROGRESS
     */
    static async markDirtyInProgress(targetPath, sessionId, activeTicketId) {
        const session = await this.loadSession(targetPath, sessionId);
        if (!session) {
            throw new Error(`Session '${sessionId}' not found in ${targetPath}`);
        }
        const updated = {
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
    static async commitSafepoint(targetPath, sessionId, options) {
        const session = await this.loadSession(targetPath, sessionId);
        if (!session) {
            throw new Error(`Session '${sessionId}' not found in ${targetPath}`);
        }
        const gitCommitSha = options?.commitSha || (await getGitCommitSha(targetPath));
        const diffHash = await computeWorktreeDiffHash(targetPath);
        const updated = {
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
    static async resumeSession(targetPath, sessionId) {
        const resolvedPath = path.resolve(targetPath);
        const session = await this.loadSession(resolvedPath, sessionId);
        if (!session) {
            return SessionResumeResultSchema.parse({
                success: false,
                sessionId: sessionId || "none",
                restoredFromStatus: "FAILED",
                actionTaken: "FAILED",
                gitCommitSha: "0000000000000000000000000000000000000000",
                message: `No session found to resume in ${resolvedPath}`,
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
            // Unclean safepoint rilevato: rollback automatico a un commit pulito, MA SENZA
            // distruggere lavoro non committato. Prima di `reset --hard` facciamo un backup
            // recuperabile con `git stash --include-untracked` (sostituisce il vecchio
            // `git clean -fd` che cancellava definitivamente i file non tracciati).
            const sha = session.gitCommitSha;
            const hasValidSha = SHA_RE.test(sha || "");
            let rollbackFailure = null;
            if (hasValidSha && (await isGitRepo(resolvedPath))) {
                // Backup recuperabile del lavoro UTENTE (tracked + untracked), ESCLUDENDO il
                // control-plane dell'OS (`.company-os`) così da non spazzare via lo stato di
                // sessione. Se non c'è nulla da salvare, `git stash` esce con errore benigno
                // ("No local changes to save") -> ignorato.
                await git(resolvedPath, [
                    "stash",
                    "push",
                    "--include-untracked",
                    "--message",
                    `agentic-os-safepoint-backup-${Date.now()}`,
                    "--",
                    ".",
                    ":(exclude).company-os",
                ]).catch(() => { });
                try {
                    await git(resolvedPath, ["reset", "--hard", sha]);
                }
                catch (err) {
                    rollbackFailure = err?.message || String(err);
                }
            }
            // Se il rollback Git è stato tentato ma è FALLITO, NON dichiariamo un safepoint
            // pulito: segnaliamo l'esito reale e indichiamo come recuperare il backup.
            if (rollbackFailure) {
                return SessionResumeResultSchema.parse({
                    success: false,
                    sessionId: session.sessionId,
                    restoredFromStatus: "DIRTY_IN_PROGRESS",
                    actionTaken: "FAILED",
                    gitCommitSha: sha,
                    activeTicketId: session.activeTicketId,
                    message: `Rollback a ${sha.slice(0, 7)} FALLITO (${rollbackFailure}). L'albero di lavoro NON è stato ripulito; l'eventuale lavoro è recuperabile con 'git stash list'.`,
                });
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
                message: `Sessione ${session.sessionId} ripristinata con rollback a commit pulito ${session.gitCommitSha.slice(0, 7)} (lavoro non committato preservato in git stash).`,
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
//# sourceMappingURL=session-store.js.map