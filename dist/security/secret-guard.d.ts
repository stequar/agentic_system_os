import { type SecretScanResult } from "../contracts/security.js";
/**
 * Calcola l'entropia di Shannon di una stringa:
 * H(X) = - sum( P(x_i) * log2( P(x_i) ) )
 */
export declare function calculateShannonEntropy(text: string): number;
/**
 * Verifica se un percorso file appartiene alla whitelist di test o fixture
 */
export declare function isWhitelistedPath(filePath?: string): boolean;
export interface ScanPromptOptions {
    filePath?: string;
    allowWhitelisted?: boolean;
}
/**
 * Tier 1: Scansione sincrona ultra-rapida (<2ms) sul payload del prompt
 * prima dell'invio ad API LLM esterne.
 */
export declare function scanPromptForSecrets(text: string, options?: ScanPromptOptions): SecretScanResult;
export interface ScanDiffOptions {
    filePath?: string;
    entropyThreshold?: number;
}
/**
 * Tier 2: Scansione differenziale pre-commit basata su Entropia di Shannon (H > 4.5).
 */
export declare function scanDiffForSecrets(diffText: string, options?: ScanDiffOptions): SecretScanResult;
//# sourceMappingURL=secret-guard.d.ts.map