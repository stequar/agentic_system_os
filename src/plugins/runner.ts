import { Worker } from "node:worker_threads";
import path from "node:path";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import {
  PluginExecutionInputSchema,
  PluginExecutionResultSchema,
  type PluginManifest,
  type PluginExecutionInput,
  type PluginExecutionResult,
} from "../contracts/plugins.js";

/**
 * Codice isolato eseguito nel thread worker secondario.
 * Gira in un V8 Isolate separato con memoria heap limitata.
 */
const WORKER_CODE = `
import { parentPort, workerData } from "node:worker_threads";
import { pathToFileURL } from "node:url";

async function executePlugin() {
  try {
    const { entrypointPath, payload, type, config } = workerData;
    const fileUrl = pathToFileURL(entrypointPath).href;
    const mod = await import(fileUrl);

    let handler = mod.default || mod.execute || mod.run || (typeof mod === "function" ? mod : null);
    if (!handler) {
      throw new Error("L'entrypoint del plugin non esporta una funzione valida (default, execute, o run)");
    }

    let result;
    if (typeof handler === "function") {
      result = await handler({ payload, type, config });
    } else if (typeof handler.execute === "function") {
      result = await handler.execute({ payload, type, config });
    } else if (typeof handler.run === "function") {
      result = await handler.run({ payload, type, config });
    } else {
      throw new Error("Impossibile invocare l'handler del plugin: firma non supportata");
    }

    parentPort?.postMessage({ success: true, data: result });
  } catch (err) {
    const errorMessage = err?.message || String(err);
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
}

executePlugin();
`;

/**
 * Esegue un plugin all'interno di una sandbox basata su node:worker_threads
 * con limiti hardware deterministici:
 * - resourceLimits: maxOldGenerationSizeMb = 128, maxYoungGenerationSizeMb = 16
 * - Hard timeout deterministico con terminazione forzata via worker.terminate() a timeoutMs (default: 3000ms)
 * - IPC tipizzato Zod
 */
export async function runPluginInSandbox(
  manifest: PluginManifest,
  input: PluginExecutionInput,
  basePath?: string
): Promise<PluginExecutionResult> {
  const startTime = performance.now();

  // Validazione preventiva dell'input tramite Zod
  const validatedInput = PluginExecutionInputSchema.parse(input);
  const timeoutMs = validatedInput.timeoutMs ?? 3000;

  // Risoluzione dell'entrypoint rispetto alla directory base
  let resolvedEntrypoint = manifest.entrypoint;
  if (!path.isAbsolute(resolvedEntrypoint) && basePath) {
    resolvedEntrypoint = path.resolve(basePath, manifest.entrypoint);
  } else {
    resolvedEntrypoint = path.resolve(resolvedEntrypoint);
  }

  if (!fs.existsSync(resolvedEntrypoint)) {
    const duration = Math.round(performance.now() - startTime);
    return PluginExecutionResultSchema.parse({
      pluginId: manifest.id,
      success: false,
      error: `File entrypoint del plugin non trovato: ${resolvedEntrypoint}`,
      executionDurationMs: duration,
    });
  }

  return new Promise<PluginExecutionResult>((resolve) => {
    let settled = false;
    let isTerminatedByTimeout = false;
    let timeoutTimer: NodeJS.Timeout | null = null;
    let worker: Worker | null = null;

    const cleanupAndResolve = (result: PluginExecutionResult) => {
      if (settled) return;
      settled = true;
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      resolve(result);
    };

    try {
      worker = new Worker(WORKER_CODE, {
        eval: true,
        workerData: {
          entrypointPath: resolvedEntrypoint,
          payload: validatedInput.payload,
          type: validatedInput.type,
          config: manifest.config,
        },
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 16,
        },
      });
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return cleanupAndResolve(
        PluginExecutionResultSchema.parse({
          pluginId: manifest.id,
          success: false,
          error: `Inizializzazione Worker fallita: ${err.message}`,
          executionDurationMs: duration,
        })
      );
    }

    // Hard timeout deterministico con terminazione forzata
    timeoutTimer = setTimeout(async () => {
      if (settled) return;
      isTerminatedByTimeout = true;
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // Ignora errori durante la terminazione forzata
        }
      }
      const duration = Math.round(performance.now() - startTime);
      cleanupAndResolve(
        PluginExecutionResultSchema.parse({
          pluginId: manifest.id,
          success: false,
          error: `Plugin execution timed out after ${timeoutMs}ms`,
          executionDurationMs: duration,
        })
      );
    }, timeoutMs);

    worker.on("message", (message: { success: boolean; data?: any; error?: string }) => {
      if (isTerminatedByTimeout) return;
      const duration = Math.round(performance.now() - startTime);
      if (message.success) {
        cleanupAndResolve(
          PluginExecutionResultSchema.parse({
            pluginId: manifest.id,
            success: true,
            data: message.data,
            executionDurationMs: duration,
          })
        );
      } else {
        cleanupAndResolve(
          PluginExecutionResultSchema.parse({
            pluginId: manifest.id,
            success: false,
            error: message.error || "Errore sconosciuto nel plugin",
            executionDurationMs: duration,
          })
        );
      }
    });

    worker.on("error", (err: Error) => {
      if (settled || isTerminatedByTimeout) return;
      const duration = Math.round(performance.now() - startTime);
      let errorMsg = err.message;
      if (errorMsg.includes("ERR_WORKER_OUT_OF_MEMORY") || errorMsg.includes("heap out of memory")) {
        errorMsg = "Limite di memoria superato (ERR_WORKER_OUT_OF_MEMORY): heap oltre 128MB";
      }
      cleanupAndResolve(
        PluginExecutionResultSchema.parse({
          pluginId: manifest.id,
          success: false,
          error: errorMsg,
          executionDurationMs: duration,
        })
      );
    });

    worker.on("exit", (exitCode: number) => {
      if (settled || isTerminatedByTimeout) return;
      const duration = Math.round(performance.now() - startTime);
      if (exitCode !== 0) {
        cleanupAndResolve(
          PluginExecutionResultSchema.parse({
            pluginId: manifest.id,
            success: false,
            error: `Il worker thread si è interrotto con exit code non-zero (${exitCode})`,
            executionDurationMs: duration,
          })
        );
      }
    });
  });
}
