import { type HeuristicScanResult } from "../contracts/frontiers.js";
export type ScanEngine = HeuristicScanResult["scanEngine"];
export interface ExtractedSymbolAst {
    symbolName: string;
    parameters: Array<{
        name: string;
        rawType: string;
        nullable: boolean;
        numeric: boolean;
    }>;
    body: string;
    preconditions: string[];
    postconditions: string[];
    invariantsToCheck: string[];
}
export interface ScanCodeHeuristicsRequest {
    targetFilePath: string;
    sourceCode: string;
    targetSymbol?: string;
    scanEngine?: ScanEngine;
    invariants?: string[];
    preconditions?: string[];
    postconditions?: string[];
    timeoutMs?: number;
    simulatedSolverDelayMs?: number;
}
export interface PatchFormalVerificationResult {
    allProved: boolean;
    proofs: HeuristicScanResult[];
    counterexamples: HeuristicScanResult[];
    timedOut: HeuristicScanResult[];
}
/**
 * Estrae dal codice sorgente il simbolo target (funzione/metodo), i parametri tipizzati,
 * le precondizioni/postcondizioni Hoare {P} C {Q} (da JSDoc @requires/@ensures e schemi Zod)
 * e le invarianti formali candidate alla verifica simbolica.
 */
export declare function extractCodeHeuristics(sourceCode: string, targetSymbol?: string): ExtractedSymbolAst;
/**
 * Sintetizza una fixture di test eseguibile (Vitest per TypeScript/JS o Pytest per Python)
 * che riproduce esattamente il controesempio individuato dal solver simbolico.
 */
export declare function generateCounterexampleFixture(params: {
    targetFilePath: string;
    targetSymbol: string;
    violatedInvariant: string;
    inputState: Record<string, unknown>;
    failingPath: string[];
}): string;
/**
 * Esegue la verifica formale Neuro-Simbolica (Hoare Logic {P} C {Q} + Symbolic AST Solver)
 * su un file/simbolo target restituendo un oggetto certificato HeuristicScanResult.
 */
export declare function scanCodeHeuristics(request: ScanCodeHeuristicsRequest): HeuristicScanResult;
/**
 * Esegue la verifica formale simbolica su tutte le modifiche di una patch proposta (Map<filePath, content>).
 */
export declare function scanPatchHeuristics(proposedPatch: Map<string, string>, options?: {
    invariants?: string[];
    scanEngine?: ScanEngine;
    timeoutMs?: number;
}): PatchFormalVerificationResult;
//# sourceMappingURL=formal-prover.d.ts.map