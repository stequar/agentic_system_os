/**
 * Crea il contesto di esecuzione di default collegato all'ambiente di processo Node.js reale.
 */
export function createDefaultContext() {
    return {
        stdout: (msg) => console.log(msg),
        stderr: (msg) => console.error(msg),
        exit: (code) => process.exit(code),
        cwd: process.cwd(),
    };
}
/**
 * Crea un contesto di esecuzione in-memory per test unitari ultra-rapidi senza I/O bloccante o uscite di processo.
 */
export function createMemoryContext(initialCwd) {
    let stdoutLogs = [];
    let stderrLogs = [];
    let exitCode = null;
    return {
        stdout: (msg) => stdoutLogs.push(msg),
        stderr: (msg) => stderrLogs.push(msg),
        exit: (code) => {
            exitCode = code;
        },
        cwd: initialCwd || process.cwd(),
        getStdout: () => stdoutLogs.join("\n"),
        getStderr: () => stderrLogs.join("\n"),
        getExitCode: () => exitCode,
        clear: () => {
            stdoutLogs = [];
            stderrLogs = [];
            exitCode = null;
        },
    };
}
//# sourceMappingURL=context.js.map