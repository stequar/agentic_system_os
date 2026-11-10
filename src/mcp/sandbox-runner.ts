import { Worker } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import { z } from "zod";
import type { DynamicMcpTool } from "../contracts/frontiers.js";

/**
 * Risultato dell'analisi statica preventiva AST/Token sul codice del tool dinamico.
 */
export const AstVerificationResultSchema = z.object({
  safe: z.boolean(),
  violations: z.array(z.string()),
});
export type AstVerificationResult = z.infer<typeof AstVerificationResultSchema>;

/**
 * SECURITY BOUNDARY DISCLAIMER (TCK-DH.1 — Capability Honesty):
 * `node:worker_threads` provides RESOURCE isolation only (heap/CPU-time limits via
 * `resourceLimits` and a hard timeout). It is NOT an OS-level security sandbox: a worker
 * shares the host process filesystem, environment variables, and network stack.
 * Therefore `verifyDynamicToolAst` is a best-effort, fail-closed HEURISTIC deny-list
 * (defense-in-depth), not a soundness proof. Only self-synthesized, pre-flight-verified
 * tools must run on this path; never execute untrusted third-party code here.
 */
export const SANDBOX_SECURITY_MODEL = {
  resourceIsolation: true,
  osLevelSecuritySandbox: false,
  staticGuard: "HEURISTIC_FAIL_CLOSED_DENYLIST",
} as const;

/**
 * Risultato strutturato dell'esecuzione di un tool MCP dinamico nella sandbox Worker Threads.
 */
export const SandboxExecutionResultSchema = z.object({
  toolId: z.string(),
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  executionTimeMs: z.number().nonnegative(),
  quarantined: z.boolean(),
  status: z.enum([
    "SYNTHESIZED",
    "TEST_PASSED",
    "HOT_LOADED",
    "PROMOTED_PERMANENT",
    "QUARANTINED",
    "EXPIRED",
  ]),
});
export type SandboxExecutionResult = z.infer<typeof SandboxExecutionResultSchema>;

/**
 * Rimuove i commenti dal codice prima della scansione statica per evitare falsi positivi
 * sui commenti, mantenendo intatto il codice eseguibile.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

/**
 * Scansiona staticamente il codice sorgente del tool sintetizzato prima dell'esecuzione.
 * Rigetta qualsiasi pattern proibito secondo la policy Zero-Trust dello Sprint 19.
 */
export function verifyDynamicToolAst(
  code: string,
  allowedPermissions: string[] = []
): AstVerificationResult {
  const violations: string[] = [];
  const perms = new Set(allowedPermissions);
  const cleanCode = stripComments(code);

  if (!cleanCode.trim()) {
    violations.push("Empty or whitespace-only tool source code is not allowed");
  }

  // 1. Moduli di sistema critici sempre vietati (child_process, cluster, vm, v8)
  const forbiddenModules = ["child_process", "cluster", "vm", "v8"];
  for (const modName of forbiddenModules) {
    const importRegex = new RegExp(
      `(?:import\\s+[^;]*?from\\s*|import\\s*\\(\\s*|require\\s*\\(\\s*)["'\`](?:node:)?${modName}["'\`]`,
      "i"
    );
    const directRefRegex = new RegExp(`["'\`](?:node:)?${modName}["'\`]`, "i");
    if (importRegex.test(cleanCode) || directRefRegex.test(cleanCode)) {
      violations.push(`Forbidden module reference detected: '${modName}'`);
    }
  }

  // 2. Costrutti di valutazione dinamica arbitraria (eval, new Function, constructor-chain).
  //    Fail-closed: anche l'accesso al Function constructor via `.constructor()` è vietato.
  if (/\beval\s*\(/.test(cleanCode)) {
    violations.push("Forbidden dynamic code execution detected: 'eval()'");
  }
  if (/\bnew\s+Function\s*\(/.test(cleanCode)) {
    violations.push("Forbidden dynamic code execution detected: 'new Function()'");
  }
  if (/\.\s*constructor\s*\(/.test(cleanCode)) {
    violations.push(
      "Forbidden dynamic code execution detected: Function constructor access via '.constructor()'"
    );
  }

  // 2b. Caricamento dinamico di moduli (call-form `import()` / `require()`): non verificabile
  //     staticamente (es. bypass per concatenazione `import("child"+"_process")`) -> fail-closed.
  if (/\bimport\s*\(/.test(cleanCode) || /\brequire\s*\(/.test(cleanCode)) {
    violations.push(
      "Unverifiable dynamic module loading detected: call-form 'import()'/'require()' is not permitted in dynamic tool code"
    );
  }

  // 3. Accesso a process.env (notazione puntata o parentesi quadre) senza permesso env:read.
  const envAccessPattern = /\bprocess\s*(?:\.\s*env\b|\[\s*["'`]env["'`]\s*\])/;
  if (envAccessPattern.test(cleanCode) && !perms.has("env:read")) {
    violations.push("Unauthorized access to 'process.env' without 'env:read' permission");
  }

  // 3b. API di basso livello di `process` sempre vietate (escape nativi / caricamento binari).
  if (/\bprocess\s*\.\s*(?:binding|_linkedBinding|dlopen|mainModule)\b/.test(cleanCode)) {
    violations.push(
      "Forbidden low-level process API access detected (binding/dlopen/mainModule)"
    );
  }

  // 4. Scrittura o cancellazione su filesystem fuori dal permesso fs:write
  const fsWritePattern =
    /\b(?:fs\s*\.\s*(?:promises\s*\.\s*)?)?(?:writeFileSync|writeFile|appendFileSync|appendFile|rmSync|rmdirSync|unlinkSync|unlink|createWriteStream)\s*\(/;
  if (fsWritePattern.test(cleanCode) && !perms.has("fs:write")) {
    violations.push("Unauthorized filesystem write/delete operation without 'fs:write' permission");
  }

  // 4b. Lettura dal filesystem fuori dal permesso fs:read (anti-exfiltration di segreti/file host).
  const fsReadPattern =
    /\b(?:fs\s*\.\s*(?:promises\s*\.\s*)?)?(?:readFileSync|readFile|readdirSync|readdir|createReadStream|readlinkSync|readlink|realpathSync|realpath)\s*\(/;
  if (fsReadPattern.test(cleanCode) && !perms.has("fs:read")) {
    violations.push("Unauthorized filesystem read operation without 'fs:read' permission");
  }

  // 5. Apertura socket o chiamate di rete arbitrarie fuori da network:loopback / read:network
  const hasNetworkPerm = perms.has("network:loopback") || perms.has("read:network");
  const networkCallPattern =
    /\b(?:net\s*\.\s*(?:connect|createConnection)|http\s*\.\s*(?:request|get)|https\s*\.\s*(?:request|get)|tls\s*\.\s*connect|fetch)\s*\(/;
  if (networkCallPattern.test(cleanCode) && !hasNetworkPerm) {
    violations.push(
      "Unauthorized network/socket operation without 'network:loopback' or 'read:network' permission"
    );
  }

  // 5b. Riferimento a moduli di rete senza permesso network (es. `import "node:http"`).
  if (!hasNetworkPerm) {
    const networkModules = ["http", "https", "net", "tls", "dgram", "dns", "http2"];
    for (const modName of networkModules) {
      const netModRegex = new RegExp(`["'\`](?:node:)?${modName}["'\`]`, "i");
      if (netModRegex.test(cleanCode)) {
        violations.push(
          `Unauthorized network module reference '${modName}' without 'network:loopback' or 'read:network' permission`
        );
        break;
      }
    }
  }

  return AstVerificationResultSchema.parse({
    safe: violations.length === 0,
    violations,
  });
}

/**
 * Oggetto guardrail esportato per compatibilità con i contratti architetturali dello Sprint 19.
 */
export const DynamicToolAstGuard = {
  verify: verifyDynamicToolAst,
  verifyDynamicToolAst,
};

/**
 * Codice bootstrap eseguito nel Worker Thread isolato.
 * Silenzia stdout per non inquinare mai il canale JSON-RPC del processo padre.
 */
const SANDBOX_WORKER_BOOTSTRAP = `
import { parentPort, workerData } from "node:worker_threads";

// Disabilita qualsiasi scrittura accidentale su stdout per proteggere JSON-RPC MCP
process.stdout.write = () => true;
console.log = () => {};
console.info = () => {};
console.debug = () => {};

async function runIsolatedTool() {
  try {
    const { codeBase64, inputPayload, toolMeta } = workerData;
    const dataUrl = "data:text/javascript;base64," + codeBase64;
    const mod = await import(dataUrl);

    const handler =
      (typeof mod.default === "function" && mod.default) ||
      (typeof mod.execute === "function" && mod.execute) ||
      (typeof mod.handleDynamicTool === "function" && mod.handleDynamicTool) ||
      (typeof mod.run === "function" && mod.run) ||
      null;

    if (!handler) {
      throw new Error(
        "Dynamic MCP tool code must export an async function ('default', 'execute', or 'handleDynamicTool')"
      );
    }

    const result = await handler(inputPayload, {
      toolId: toolMeta.toolId,
      name: toolMeta.name,
      permissions: toolMeta.permissions,
    });

    parentPort?.postMessage({
      success: true,
      output: result,
    });
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    const errorName = err && err.name ? err.name : "Error";
    parentPort?.postMessage({
      success: false,
      error: message,
      errorName,
    });
  }
}

runIsolatedTool();
`;

/**
 * Esegue il codice di un tool MCP dinamico in una sandbox `node:worker_threads`
 * previa verifica statica con `verifyDynamicToolAst`.
 * Applica limiti di memoria V8 (128MB old gen, 32MB young gen) e hard timeout (default 3000ms).
 */
export async function runDynamicToolInSandbox(
  tool: DynamicMcpTool,
  code: string,
  inputPayload: Record<string, unknown>,
  timeoutMs = 3000
): Promise<SandboxExecutionResult> {
  const startTime = performance.now();

  // 1. Verifica statica preventiva dell'AST / pattern proibiti
  const astCheck = verifyDynamicToolAst(code, tool.permissions);
  if (!astCheck.safe) {
    const elapsed = Math.max(0, Math.round(performance.now() - startTime));
    return SandboxExecutionResultSchema.parse({
      toolId: tool.toolId,
      success: false,
      error: `AST Security Guard Violation: ${astCheck.violations.join("; ")}`,
      executionTimeMs: elapsed,
      quarantined: true,
      status: "QUARANTINED",
    });
  }

  const codeBase64 = Buffer.from(code, "utf8").toString("base64");

  return new Promise<SandboxExecutionResult>((resolve) => {
    let settled = false;
    let isTerminatedByTimeout = false;
    let timeoutTimer: NodeJS.Timeout | null = null;
    let worker: Worker | null = null;

    const finalize = (result: SandboxExecutionResult) => {
      if (settled) return;
      settled = true;
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      resolve(SandboxExecutionResultSchema.parse(result));
    };

    try {
      worker = new Worker(SANDBOX_WORKER_BOOTSTRAP, {
        eval: true,
        stdout: true,
        stderr: true,
        workerData: {
          codeBase64,
          inputPayload,
          toolMeta: {
            toolId: tool.toolId,
            name: tool.name,
            permissions: tool.permissions,
          },
        },
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 32,
        },
      });
    } catch (err: any) {
      const elapsed = Math.max(0, Math.round(performance.now() - startTime));
      finalize({
        toolId: tool.toolId,
        success: false,
        error: `Sandbox worker initialization failed: ${err?.message || String(err)}`,
        executionTimeMs: elapsed,
        quarantined: true,
        status: "QUARANTINED",
      });
      return;
    }

    // Hard timeout deterministico
    timeoutTimer = setTimeout(async () => {
      if (settled) return;
      isTerminatedByTimeout = true;
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // Ignora errori in fase di terminazione forzata
        }
      }
      const elapsed = Math.max(timeoutMs, Math.round(performance.now() - startTime));
      finalize({
        toolId: tool.toolId,
        success: false,
        error: `Dynamic tool execution timed out after ${timeoutMs}ms (terminated)`,
        executionTimeMs: elapsed,
        quarantined: true,
        status: "QUARANTINED",
      });
    }, timeoutMs);

    worker.on(
      "message",
      (msg: { success: boolean; output?: unknown; error?: string; errorName?: string }) => {
        if (isTerminatedByTimeout || settled) return;
        const elapsed = Math.max(0, Math.round(performance.now() - startTime));
        if (msg.success) {
          finalize({
            toolId: tool.toolId,
            success: true,
            output: msg.output,
            executionTimeMs: elapsed,
            quarantined: false,
            status: tool.status,
          });
        } else {
          // Un SyntaxError indica codice malformato -> quarantena
          const isSyntaxError = msg.errorName === "SyntaxError";
          finalize({
            toolId: tool.toolId,
            success: false,
            error: msg.error || "Unknown error during dynamic tool execution",
            executionTimeMs: elapsed,
            quarantined: isSyntaxError,
            status: isSyntaxError ? "QUARANTINED" : tool.status,
          });
        }
      }
    );

    worker.on("error", (err: Error) => {
      if (settled || isTerminatedByTimeout) return;
      const elapsed = Math.max(0, Math.round(performance.now() - startTime));
      let errorMsg = err.message || String(err);
      if (
        errorMsg.includes("ERR_WORKER_OUT_OF_MEMORY") ||
        errorMsg.includes("heap out of memory")
      ) {
        errorMsg = "Sandbox memory limit exceeded (ERR_WORKER_OUT_OF_MEMORY: max 128MB heap)";
      }
      finalize({
        toolId: tool.toolId,
        success: false,
        error: errorMsg,
        executionTimeMs: elapsed,
        quarantined: true,
        status: "QUARANTINED",
      });
    });

    worker.on("exit", (exitCode: number) => {
      if (settled || isTerminatedByTimeout) return;
      const elapsed = Math.max(0, Math.round(performance.now() - startTime));
      if (exitCode !== 0) {
        finalize({
          toolId: tool.toolId,
          success: false,
          error: `Sandbox worker exited unexpectedly with non-zero code (${exitCode})`,
          executionTimeMs: elapsed,
          quarantined: true,
          status: "QUARANTINED",
        });
      }
    });
  });
}
