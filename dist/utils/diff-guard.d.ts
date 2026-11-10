import { type DiffGuardResult } from "../contracts/healing.js";
/**
 * Verifica se un file appartiene alla categoria dei file di test.
 */
export declare function isTestFile(filePath: string): boolean;
export interface ValidatePatchOptions {
    allowedFiles?: string[];
}
/**
 * Valida una patch proposta confrontando lo stato originale dei file con quello modificato.
 * Applica i due invarianti deterministici di sicurezza:
 * 1. Test Preservation Invariant: vieta l'eliminazione/commento di test o asserzioni, o l'aggiunta di .skip.
 * 2. Scope Enforcement Invariant: vieta modifiche a file esterni ad allowedFiles o a config protette.
 */
export declare function validatePatch(originalFiles: Map<string, string>, modifiedFiles: Map<string, string>, options?: ValidatePatchOptions): DiffGuardResult;
//# sourceMappingURL=diff-guard.d.ts.map