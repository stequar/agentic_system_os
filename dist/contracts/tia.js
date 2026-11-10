import { z } from "zod";
/**
 * Rappresenta il grafo delle dipendenze statiche del progetto
 */
export const DependencyGraphSchema = z.object({
    /** Mappa diretta: File sorgente -> Lista dei file importati */
    directDependencies: z.record(z.string(), z.array(z.string())),
    /** Mappa inversa: File sorgente -> Lista dei file che lo importano */
    reverseDependencies: z.record(z.string(), z.array(z.string())),
    /** Elenco di tutti i file di test rilevati */
    testFiles: z.array(z.string()),
    /** Elenco di tutti i file sorgente rilevati (non-test) */
    sourceFiles: z.array(z.string()),
    /** Data di costruzione o scansione del grafo */
    createdAt: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Risultato della valutazione TIA per un insieme di file modificati
 */
export const ImpactedTestsResultSchema = z.object({
    /** File identificati come modificati nel diff o changeset */
    modifiedFiles: z.array(z.string()),
    /** Lista dei file di test impattati che devono essere eseguiti */
    impactedTests: z.array(z.string()),
    /** Flag indicante se è stata innescata l'invalidazione globale transitiva */
    isGloballyInvalidated: z.boolean(),
    /** Motivazione della selezione (es. "Zod Contracts changed: Global Invalidation" o "3 impacted tests found") */
    reason: z.string(),
    /** Tempo impiegato dal calcolo TIA in millisecondi */
    durationMs: z.number().nonnegative(),
    /** Timestamp della valutazione */
    timestamp: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Opzioni per il calcolo TIA
 */
export const TiaOptionsSchema = z.object({
    /** Percorso radice del workspace */
    workspaceRoot: z.string().default(process.cwd()),
    /** Directory sorgenti da includere (default: src, tests) */
    scanDirs: z.array(z.string()).default(["src", "tests"]),
    /** Estensioni file supportate */
    extensions: z.array(z.string()).default([".ts", ".tsx", ".js", ".jsx", ".mjs"]),
    /** File o pattern critici che causano invalidazione globale immediata */
    globalInvalidationPatterns: z.array(z.string()).default([
        "src/contracts/",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "vitest.config.ts",
        "vitest.config.js",
    ]),
});
//# sourceMappingURL=tia.js.map