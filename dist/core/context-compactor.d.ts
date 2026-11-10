import { type ContextCompactionInput, type CompactedContextResult, type InvariantDefinition, type InvariantVerificationResult, type SurgicalDiagnosticSlice, type CleanSlatePayload, type ContextMessage } from "../contracts/compaction.js";
import type { DiagnosticReport, HealingAttempt } from "../contracts/healing.js";
export declare class ContextCompactor {
    /**
     * Determina se la dimensione della finestra di contesto supera la soglia di compattazione (default: 40k token).
     */
    static shouldCompact(tokenCount: number, threshold?: number): boolean;
    /**
     * Guardrail deterministico non-LLM: verifica che il testo o i messaggi compattati
     * preservino intatti tutti gli invarianti di business e operativi del ticket
     * (Ticket ID, Allowed Files, Acceptance Criteria, Test Commands).
     */
    static verifyContextInvariants(content: string | ContextMessage[], invariants: InvariantDefinition): InvariantVerificationResult;
    /**
     * Esegue la compattazione deterministica del contesto se superata la soglia di token
     * o se forzata dal chiamante.
     */
    static compactContext(input: ContextCompactionInput): CompactedContextResult;
    /**
     * Surgical Diagnostic Slicer: trasforma un DiagnosticReport grezzo in slice chirurgiche
     * con coordinate AST atomiche (<120 token ciascuna), azzerando ANSI escapes e stack trace verbose.
     */
    static sliceDiagnostics(report: DiagnosticReport, discardedAttempts?: HealingAttempt[]): SurgicalDiagnosticSlice[];
    /**
     * Epistemic Clean-Slate Protocol: costruisce il payload di reset a t0 per il Self-Healing.
     * Elimina l'accumulo di contesto delle iterazioni precedenti, fornendo unicamente
     * le coordinate AST d'errore e i vincoli negativi appresi.
     */
    static buildCleanSlatePayload(iteration: number, report: DiagnosticReport, discardedAttempts?: HealingAttempt[]): CleanSlatePayload;
}
//# sourceMappingURL=context-compactor.d.ts.map