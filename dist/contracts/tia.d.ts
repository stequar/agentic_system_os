import { z } from "zod";
/**
 * Rappresenta il grafo delle dipendenze statiche del progetto
 */
export declare const DependencyGraphSchema: z.ZodObject<{
    /** Mappa diretta: File sorgente -> Lista dei file importati */
    directDependencies: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    /** Mappa inversa: File sorgente -> Lista dei file che lo importano */
    reverseDependencies: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
    /** Elenco di tutti i file di test rilevati */
    testFiles: z.ZodArray<z.ZodString, "many">;
    /** Elenco di tutti i file sorgente rilevati (non-test) */
    sourceFiles: z.ZodArray<z.ZodString, "many">;
    /** Data di costruzione o scansione del grafo */
    createdAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    directDependencies: Record<string, string[]>;
    reverseDependencies: Record<string, string[]>;
    testFiles: string[];
    sourceFiles: string[];
}, {
    directDependencies: Record<string, string[]>;
    reverseDependencies: Record<string, string[]>;
    testFiles: string[];
    sourceFiles: string[];
    createdAt?: string | undefined;
}>;
export type DependencyGraph = z.infer<typeof DependencyGraphSchema>;
/**
 * Risultato della valutazione TIA per un insieme di file modificati
 */
export declare const ImpactedTestsResultSchema: z.ZodObject<{
    /** File identificati come modificati nel diff o changeset */
    modifiedFiles: z.ZodArray<z.ZodString, "many">;
    /** Lista dei file di test impattati che devono essere eseguiti */
    impactedTests: z.ZodArray<z.ZodString, "many">;
    /** Flag indicante se è stata innescata l'invalidazione globale transitiva */
    isGloballyInvalidated: z.ZodBoolean;
    /** Motivazione della selezione (es. "Zod Contracts changed: Global Invalidation" o "3 impacted tests found") */
    reason: z.ZodString;
    /** Tempo impiegato dal calcolo TIA in millisecondi */
    durationMs: z.ZodNumber;
    /** Timestamp della valutazione */
    timestamp: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    durationMs: number;
    reason: string;
    modifiedFiles: string[];
    impactedTests: string[];
    isGloballyInvalidated: boolean;
}, {
    durationMs: number;
    reason: string;
    modifiedFiles: string[];
    impactedTests: string[];
    isGloballyInvalidated: boolean;
    timestamp?: string | undefined;
}>;
export type ImpactedTestsResult = z.infer<typeof ImpactedTestsResultSchema>;
/**
 * Opzioni per il calcolo TIA
 */
export declare const TiaOptionsSchema: z.ZodObject<{
    /** Percorso radice del workspace */
    workspaceRoot: z.ZodDefault<z.ZodString>;
    /** Directory sorgenti da includere (default: src, tests) */
    scanDirs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Estensioni file supportate */
    extensions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** File o pattern critici che causano invalidazione globale immediata */
    globalInvalidationPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    workspaceRoot: string;
    scanDirs: string[];
    extensions: string[];
    globalInvalidationPatterns: string[];
}, {
    workspaceRoot?: string | undefined;
    scanDirs?: string[] | undefined;
    extensions?: string[] | undefined;
    globalInvalidationPatterns?: string[] | undefined;
}>;
export type TiaOptions = z.infer<typeof TiaOptionsSchema>;
//# sourceMappingURL=tia.d.ts.map