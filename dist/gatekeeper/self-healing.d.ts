import { type HealingSessionResult, type DiagnosticReport } from "../contracts/healing.js";
export interface SelfHealingOptions {
    maxIterations?: number;
    allowedFiles?: string[];
    enableCleanSlate?: boolean;
    useTia?: boolean;
    enableWarRoomCircuitBreaker?: boolean;
    enableFormalProver?: boolean;
    formalInvariants?: string[];
    ticketId?: string;
}
/**
 * Runner deterministico per il closed loop di Self-Healing autonomo.
 * Esegue il ciclo: Gatekeeper -> Parsing Diagnostico -> Remediation Patch -> AST Diff Guard -> Re-check.
 *
 * Vincoli di sicurezza:
 * - Budget rigido: massimo 3 iterazioni di default.
 * - Atomic Rollback Snapshot: garantisce il ripristino esatto dello stato a t0 se il Gatekeeper non converge.
 * - Fail Loudly in caso di esaurimento budget o violazione dei guardrail.
 */
export declare function runSelfHealingLoop(targetPath: string, testCommands: string[], patchApplier: (report: DiagnosticReport) => Promise<Map<string, string>>, options?: SelfHealingOptions): Promise<HealingSessionResult>;
//# sourceMappingURL=self-healing.d.ts.map