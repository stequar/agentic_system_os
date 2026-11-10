import {
  SteeringCommandSchema,
  SteeringResultSchema,
  type SteeringCommand,
  type SteeringResult,
  type SteeringState,
} from "../contracts/steering.js";
import { validatePatch } from "../utils/diff-guard.js";
import { SessionStore } from "./session-store.js";
import { CompanyEventBus } from "./event-bus.js";

export class SteeringEngine {
  private state: SteeringState = "RUNNING";
  private activeLocks: Set<string> = new Set();
  private hints: Array<{ message: string; timestamp: string }> = [];
  private eventBus: CompanyEventBus;

  constructor(eventBus?: CompanyEventBus) {
    this.eventBus = eventBus || CompanyEventBus.getInstance();
  }

  getState(): SteeringState {
    return this.state;
  }

  isPaused(): boolean {
    return this.state === "SAFE_PAUSED";
  }

  isPauseRequested(): boolean {
    return this.state === "PAUSE_REQUESTED";
  }

  getHints(): Array<{ message: string; timestamp: string }> {
    return [...this.hints];
  }

  acquireFileLock(filePath: string): boolean {
    if (this.activeLocks.has(filePath)) {
      return false;
    }
    this.activeLocks.add(filePath);
    return true;
  }

  releaseFileLock(filePath: string): void {
    this.activeLocks.delete(filePath);
  }

  releaseAllLocks(): void {
    this.activeLocks.clear();
  }

  /**
   * Richiede la sospensione cooperativa del processo.
   * L'engine non blocca immediatamente ma attende il raggiungimento del safe-point.
   */
  requestPause(command?: Partial<SteeringCommand>): SteeringResult {
    if (this.state === "SAFE_PAUSED") {
      return SteeringResultSchema.parse({
        success: true,
        currentState: this.state,
        actionApplied: "pause",
        message: "Il sistema è già nello stato SAFE_PAUSED.",
        activeSafePoint: true,
      });
    }

    this.state = "PAUSE_REQUESTED";
    return SteeringResultSchema.parse({
      success: true,
      currentState: this.state,
      actionApplied: "pause",
      message: "Richiesta di pausa inviata. In attesa del completamento della transazione I/O corrente.",
      activeSafePoint: false,
    });
  }

  /**
   * Safe-Point Checkpoint: invocato al termine di ciascuna transazione atomica (es. POSIX file write o self-healing).
   * Se pauseRequested è attivo, salva il checkpoint COMMITTED_SAFEPOINT, rilascia i lock ed entra in SAFE_PAUSED.
   */
  async checkSafePoint(targetPath?: string, sessionId?: string): Promise<boolean> {
    if (this.state === "PAUSE_REQUESTED") {
      this.state = "SAFE_PAUSED";
      this.releaseAllLocks();

      if (targetPath && sessionId) {
        try {
          await SessionStore.commitSafepoint(targetPath, sessionId);
        } catch {
          // best effort
        }
      }

      await this.eventBus.emit({
        type: "STEERING_PAUSED",
        sourceAgent: "steering_engine",
        payload: { sessionId, targetPath },
      });

      return true; // È ora in pausa
    }

    return this.state === "SAFE_PAUSED";
  }

  /**
   * Invia un suggerimento umano o una patch proposta.
   * INVARIANTE KERNEL: valida la patch contro l'AST Diff Guard per garantire che
   * nessun suggerimento umano possa sopprimere test o asserzioni.
   */
  submitHint(
    message: string,
    options?: {
      proposedPatch?: Map<string, string> | Record<string, string>;
      originalFiles?: Map<string, string>;
    }
  ): SteeringResult {
    let patchMap = new Map<string, string>();
    if (options?.proposedPatch instanceof Map) {
      patchMap = options.proposedPatch;
    } else if (options?.proposedPatch) {
      patchMap = new Map(Object.entries(options.proposedPatch));
    }

    // Se è inclusa una patch proposta, eseguiamo la validazione a livello kernel
    if (patchMap.size > 0 && options?.originalFiles) {
      const guardResult = validatePatch(options.originalFiles, patchMap);
      if (!guardResult.passed) {
        return SteeringResultSchema.parse({
          success: false,
          currentState: this.state,
          actionApplied: "hint",
          message: "Suggerimento o patch RIFIUTATI dal kernel: violazione dell'invariante di sicurezza dei test.",
          activeSafePoint: this.isPaused(),
          violations: guardResult.violations,
        });
      }
    }

    this.hints.push({ message, timestamp: new Date().toISOString() });

    return SteeringResultSchema.parse({
      success: true,
      currentState: this.state,
      actionApplied: "hint",
      message: `Suggerimento registrato con successo: "${message}".`,
      activeSafePoint: this.isPaused(),
      violations: [],
    });
  }

  /**
   * Riprende l'esecuzione dal punto di safe-pause.
   */
  async resume(): Promise<SteeringResult> {
    if (this.state !== "SAFE_PAUSED" && this.state !== "PAUSE_REQUESTED") {
      return SteeringResultSchema.parse({
        success: false,
        currentState: this.state,
        actionApplied: "resume",
        message: `Impossibile eseguire resume: stato attuale non è SAFE_PAUSED (stato: ${this.state}).`,
        activeSafePoint: false,
      });
    }

    this.state = "RUNNING";

    await this.eventBus.emit({
      type: "STEERING_RESUMED",
      sourceAgent: "steering_engine",
      payload: { resumedAt: new Date().toISOString() },
    });

    return SteeringResultSchema.parse({
      success: true,
      currentState: this.state,
      actionApplied: "resume",
      message: "Esecuzione ripresa con successo dall'ultimo safe-point.",
      activeSafePoint: false,
    });
  }

  /**
   * Interrompe definitivamente l'esecuzione con stato ABORTED.
   */
  async abort(reason?: string): Promise<SteeringResult> {
    this.state = "ABORTED";
    this.releaseAllLocks();

    await this.eventBus.emit({
      type: "STEERING_ABORTED",
      sourceAgent: "steering_engine",
      level: "warn",
      payload: { reason: reason || "Interruzione manuale da operatore" },
    });

    return SteeringResultSchema.parse({
      success: true,
      currentState: this.state,
      actionApplied: "abort",
      message: `Esecuzione interrotta (ABORTED): ${reason || "operatore manuale"}.`,
      activeSafePoint: false,
    });
  }

  /**
   * Reset dello stato per test
   */
  reset(): void {
    this.state = "RUNNING";
    this.hints = [];
    this.activeLocks.clear();
  }
}
