import { type DependencyGraph, type ImpactedTestsResult, type TiaOptions } from "../contracts/tia.js";
/**
 * Normalizza un percorso file in formato POSIX relativo alla radice del workspace.
 */
export declare function normalizePosixPath(filePath: string, workspaceRoot?: string): string;
/**
 * Estrae tutti i percorsi di import ed export relativi da un file sorgente JavaScript/TypeScript.
 */
export declare function extractImportPaths(sourceCode: string): string[];
/**
 * Risolve un percorso di import relativo rispetto a un file sorgente in un percorso esistente su disco.
 * Gestisce la mappatura Node ESM da estensioni .js a file .ts originari.
 */
export declare function resolveImportTarget(importSpecifier: string, sourceFilePath: string, workspaceRoot: string, supportedExtensions?: string[]): Promise<string | null>;
/**
 * Costruisce in memoria il grafo delle dipendenze statiche del repository.
 */
export declare function buildDependencyGraph(workspaceRoot?: string, options?: Partial<TiaOptions>): Promise<DependencyGraph>;
/**
 * Calcola i file di test impattati per un insieme di file modificati.
 * Applica rigorosamente la Matrice di Invalidazione Transitiva e la risalita del grafo inverso.
 */
export declare function computeImpactedTests(modifiedFiles: string[], graph: DependencyGraph, options?: Partial<TiaOptions>): ImpactedTestsResult;
/**
 * Funzione unificata di esecuzione TIA: analizza il workspace e calcola i test impattati.
 */
export declare function runTia(workspaceRoot: string | undefined, modifiedFiles: string[], options?: Partial<TiaOptions>): Promise<ImpactedTestsResult>;
//# sourceMappingURL=tia.d.ts.map