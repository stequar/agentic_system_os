/**
 * Astrazione del contesto di esecuzione per i comandi CLI.
 * Disaccoppia la logica dei comandi da console.log, console.error e process.exit.
 */
export interface ExecutionContext {
    stdout: (message: string) => void;
    stderr: (message: string) => void;
    exit: (code: number) => void;
    cwd: string;
}
/**
 * Crea il contesto di esecuzione di default collegato all'ambiente di processo Node.js reale.
 */
export declare function createDefaultContext(): ExecutionContext;
/**
 * Crea un contesto di esecuzione in-memory per test unitari ultra-rapidi senza I/O bloccante o uscite di processo.
 */
export declare function createMemoryContext(initialCwd?: string): ExecutionContext & {
    getStdout: () => string;
    getStderr: () => string;
    getExitCode: () => number | null;
    clear: () => void;
};
//# sourceMappingURL=context.d.ts.map