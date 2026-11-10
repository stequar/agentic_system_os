import { type PluginManifest, type PluginExecutionInput, type PluginExecutionResult } from "../contracts/plugins.js";
/**
 * Esegue un plugin all'interno di una sandbox basata su node:worker_threads
 * con limiti hardware deterministici:
 * - resourceLimits: maxOldGenerationSizeMb = 128, maxYoungGenerationSizeMb = 16
 * - Hard timeout deterministico con terminazione forzata via worker.terminate() a timeoutMs (default: 3000ms)
 * - IPC tipizzato Zod
 */
export declare function runPluginInSandbox(manifest: PluginManifest, input: PluginExecutionInput, basePath?: string): Promise<PluginExecutionResult>;
//# sourceMappingURL=runner.d.ts.map