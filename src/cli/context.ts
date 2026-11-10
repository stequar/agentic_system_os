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
export function createDefaultContext(): ExecutionContext {
  return {
    stdout: (msg: string) => console.log(msg),
    stderr: (msg: string) => console.error(msg),
    exit: (code: number) => process.exit(code),
    cwd: process.cwd(),
  };
}

/**
 * Crea un contesto di esecuzione in-memory per test unitari ultra-rapidi senza I/O bloccante o uscite di processo.
 */
export function createMemoryContext(initialCwd?: string): ExecutionContext & {
  getStdout: () => string;
  getStderr: () => string;
  getExitCode: () => number | null;
  clear: () => void;
} {
  let stdoutLogs: string[] = [];
  let stderrLogs: string[] = [];
  let exitCode: number | null = null;

  return {
    stdout: (msg: string) => stdoutLogs.push(msg),
    stderr: (msg: string) => stderrLogs.push(msg),
    exit: (code: number) => {
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
