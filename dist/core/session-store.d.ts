import { type SessionSnapshot, type SessionResumeResult } from "../contracts/session.js";
export declare class SessionStore {
    /**
     * Restituisce la directory di persistenza per le sessioni
     */
    static getSessionsDir(targetPath: string): string;
    /**
     * Crea una nuova sessione di lavoro e la persiste atomicamente
     */
    static createSession(targetPath: string, initialData?: Partial<SessionSnapshot>): Promise<SessionSnapshot>;
    /**
     * Salva uno snapshot di sessione in modo atomico POSIX Write-Sync-Rename
     */
    static saveSnapshot(targetPath: string, snapshot: SessionSnapshot): Promise<SessionSnapshot>;
    /**
     * Carica uno snapshot specifico per ID o l'ultimo snapshot registrato
     */
    static loadSession(targetPath: string, sessionId?: string): Promise<SessionSnapshot | null>;
    /**
     * Elenca tutti gli snapshot di sessione persistiti nel workspace
     */
    static listSessions(targetPath: string): Promise<SessionSnapshot[]>;
    /**
     * Two-Phase Commit: marca il task corrente come DIRTY_IN_PROGRESS
     */
    static markDirtyInProgress(targetPath: string, sessionId: string, activeTicketId?: string): Promise<SessionSnapshot>;
    /**
     * Two-Phase Commit: marca il task corrente come COMMITTED_SAFEPOINT
     */
    static commitSafepoint(targetPath: string, sessionId: string, options?: {
        commitSha?: string;
        activeTicketId?: string;
    }): Promise<SessionSnapshot>;
    /**
     * Ripristina l'esecuzione da uno snapshot (Session Resume).
     * Se lo stato era DIRTY_IN_PROGRESS, effettua rollback sicuro a clean commit.
     */
    static resumeSession(targetPath: string, sessionId?: string): Promise<SessionResumeResult>;
}
//# sourceMappingURL=session-store.d.ts.map