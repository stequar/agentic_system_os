import { type SteeringCommand, type SteeringResult, type SteeringState } from "../contracts/steering.js";
import { CompanyEventBus } from "./event-bus.js";
export declare class SteeringEngine {
    private state;
    private activeLocks;
    private hints;
    private eventBus;
    constructor(eventBus?: CompanyEventBus);
    getState(): SteeringState;
    isPaused(): boolean;
    isPauseRequested(): boolean;
    getHints(): Array<{
        message: string;
        timestamp: string;
    }>;
    acquireFileLock(filePath: string): boolean;
    releaseFileLock(filePath: string): void;
    releaseAllLocks(): void;
    /**
     * Richiede la sospensione cooperativa del processo.
     * L'engine non blocca immediatamente ma attende il raggiungimento del safe-point.
     */
    requestPause(command?: Partial<SteeringCommand>): SteeringResult;
    /**
     * Safe-Point Checkpoint: invocato al termine di ciascuna transazione atomica (es. POSIX file write o self-healing).
     * Se pauseRequested è attivo, salva il checkpoint COMMITTED_SAFEPOINT, rilascia i lock ed entra in SAFE_PAUSED.
     */
    checkSafePoint(targetPath?: string, sessionId?: string): Promise<boolean>;
    /**
     * Invia un suggerimento umano o una patch proposta.
     * INVARIANTE KERNEL: valida la patch contro l'AST Diff Guard per garantire che
     * nessun suggerimento umano possa sopprimere test o asserzioni.
     */
    submitHint(message: string, options?: {
        proposedPatch?: Map<string, string> | Record<string, string>;
        originalFiles?: Map<string, string>;
    }): SteeringResult;
    /**
     * Riprende l'esecuzione dal punto di safe-pause.
     */
    resume(): Promise<SteeringResult>;
    /**
     * Interrompe definitivamente l'esecuzione con stato ABORTED.
     */
    abort(reason?: string): Promise<SteeringResult>;
    /**
     * Reset dello stato per test
     */
    reset(): void;
}
//# sourceMappingURL=steering-engine.d.ts.map