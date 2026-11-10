import { type WorktreeSession, type WorktreePoolStatus } from "../contracts/worktree.js";
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
export declare class GitWorktreeManager {
    private maxConcurrent;
    private activeSessions;
    private pendingReservations;
    private totalCreated;
    constructor(options?: GitWorktreeManagerOptions);
    /**
     * Restituisce la directory radice del pool di worktree (.company-os/worktrees)
     */
    getPoolDir(repoPath: string): string;
    /**
     * Restituisce lo stato corrente del pool di worktree
     */
    getPoolStatus(repoPath: string): WorktreePoolStatus;
    /**
     * Conta gli slot occupati: sessioni attive + prenotazioni in volo.
     */
    private occupiedSlots;
    /**
     * Crea e isola una nuova working directory Git Worktree per l'agente specificato.
     */
    createWorktree(repoPath: string, options: CreateWorktreeOptions): Promise<WorktreeSession>;
    /**
     * Esegue il rebase sequenziale deterministico sul branch target prima del consolidamento della PR.
     */
    rebaseWorktree(worktreePath: string, targetBranch?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Rimuove forzatamente il worktree e ripulisce le referenze Git (git worktree prune).
     */
    cleanupWorktree(repoPath: string, worktreeTarget: string | WorktreeSession): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Esegue una funzione all'interno del contesto isolato di un worktree,
     * garantendo la pulizia atomica automatica in blocco `finally`.
     */
    withWorktree<T>(repoPath: string, options: CreateWorktreeOptions, fn: (session: WorktreeSession) => Promise<T>): Promise<T>;
    /**
     * Esegue il pruning dei worktree orfani o non tracciati presenti nella cartella pool.
     */
    pruneOrphanWorktrees(repoPath: string): Promise<number>;
}
//# sourceMappingURL=worktree-manager.d.ts.map