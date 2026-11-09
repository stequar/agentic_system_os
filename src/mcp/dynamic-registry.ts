import {
  DynamicMcpToolSchema,
  type DynamicMcpTool,
} from "../contracts/frontiers.js";
import type { McpToolDefinition } from "../contracts/mcp.js";
import type { LightweightToolMetadata, McpClientBridge } from "./client.js";
import {
  verifyDynamicToolAst,
  runDynamicToolInSandbox,
} from "./sandbox-runner.js";
import { runPreFlightVerification } from "./fixture-generator.js";

/**
 * Record interno di un tool MCP dinamico gestito dal registro a caldo.
 */
export interface RegisteredDynamicToolEntry {
  tool: DynamicMcpTool;
  code: string;
  invocationCount: number;
  successCount: number;
  failureCount: number;
  registeredAtMs: number;
  lastInvokedAtMs?: number;
}

/**
 * Opzioni di configurazione per `DynamicMcpRegistry`.
 */
export interface DynamicMcpRegistryOptions {
  promotionThreshold?: number;
  defaultTimeoutMs?: number;
  clientBridge?: McpClientBridge;
}

/**
 * Risultato arricchito dell'invocazione di un tool dinamico tramite `DynamicMcpRegistry`.
 */
export interface DynamicToolInvocationResult {
  toolId: string;
  name: string;
  success: boolean;
  output?: unknown;
  error?: string;
  executionTimeMs: number;
  quarantined: boolean;
  status: DynamicMcpTool["status"];
  invocationCount: number;
  successCount: number;
  failureCount: number;
  promoted: boolean;
  content: Array<{ type: "text"; text: string }>;
  isError: boolean;
}

/**
 * Registro dinamico a caldo (Hot-Reload) e gestore del ciclo di vita effimero (TTL & Promotion)
 * per i tool MCP sintetizzati Just-In-Time (TCK-19.3).
 */
export class DynamicMcpRegistry {
  private entriesById: Map<string, RegisteredDynamicToolEntry> = new Map();
  private idByName: Map<string, string> = new Map();
  private readonly promotionThreshold: number;
  private readonly defaultTimeoutMs: number;
  private clientBridge?: McpClientBridge;

  constructor(options: DynamicMcpRegistryOptions = {}) {
    this.promotionThreshold = options.promotionThreshold ?? 10;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 3000;
    this.clientBridge = options.clientBridge;
  }

  /**
   * Collega opzionalmente un'istanza di `McpClientBridge` al registro dinamico.
   */
  attachClientBridge(bridge: McpClientBridge): void {
    this.clientBridge = bridge;
  }

  /**
   * Registra a caldo un tool dinamico nel catalogo attivo SOLO se ha superato
   * il Pre-Flight Verification Gate (`tool.status === "TEST_PASSED"`) e il controllo AST.
   * Rifiuta con errore Fail Loudly qualsiasi tool non verificato o in quarantena.
   */
  registerVerifiedTool(tool: DynamicMcpTool, code: string): DynamicMcpTool {
    const parsedTool = DynamicMcpToolSchema.parse(tool);

    if (parsedTool.status === "QUARANTINED") {
      throw new Error(
        `[Fail Loudly] Cannot register quarantined dynamic tool '${parsedTool.toolId}' (status: QUARANTINED)`
      );
    }

    if (parsedTool.status !== "TEST_PASSED") {
      throw new Error(
        `[Fail Loudly] Zero Unverified Dynamic Code: tool '${parsedTool.toolId}' must have status 'TEST_PASSED' before hot-loading (received '${parsedTool.status}')`
      );
    }

    const astCheck = verifyDynamicToolAst(code, parsedTool.permissions);
    if (!astCheck.safe) {
      throw new Error(
        `[Fail Loudly] AST Security Guard rejected tool '${parsedTool.toolId}': ${astCheck.violations.join("; ")}`
      );
    }

    const hotLoadedTool = DynamicMcpToolSchema.parse({
      ...parsedTool,
      status: "HOT_LOADED",
    });

    const entry: RegisteredDynamicToolEntry = {
      tool: hotLoadedTool,
      code,
      invocationCount: 0,
      successCount: 0,
      failureCount: 0,
      registeredAtMs: Date.now(),
    };

    this.entriesById.set(hotLoadedTool.toolId, entry);
    this.idByName.set(hotLoadedTool.name, hotLoadedTool.toolId);

    return hotLoadedTool;
  }

  /**
   * Esegue il Pre-Flight Verification Gate sul tool e, se certificato `TEST_PASSED`,
   * lo registra immediatamente a caldo (`HOT_LOADED`).
   */
  async verifyAndRegisterTool(
    tool: DynamicMcpTool,
    code: string
  ): Promise<DynamicMcpTool> {
    const verification = await runPreFlightVerification(
      tool,
      code,
      undefined,
      this.defaultTimeoutMs
    );

    if (!verification.passed || verification.tool.status !== "TEST_PASSED") {
      throw new Error(
        `[Fail Loudly] Pre-flight verification failed for tool '${tool.toolId}'; status set to ${verification.status}`
      );
    }

    return this.registerVerifiedTool(verification.tool, code);
  }

  /**
   * Risolve l'entry interna cercando per `toolId` o per `name`.
   */
  private resolveEntry(nameOrId: string): RegisteredDynamicToolEntry | undefined {
    const byId = this.entriesById.get(nameOrId);
    if (byId) return byId;
    const mappedId = this.idByName.get(nameOrId);
    if (mappedId) return this.entriesById.get(mappedId);
    return undefined;
  }

  /**
   * Restituisce i metadati del tool (anche se EXPIRED o QUARANTINED) per ispezione e audit.
   */
  getTool(nameOrId: string): DynamicMcpTool | undefined {
    return this.resolveEntry(nameOrId)?.tool;
  }

  /**
   * Restituisce l'entry completa (con statistiche di invocazione) per telemetria e test.
   */
  getToolEntry(nameOrId: string): RegisteredDynamicToolEntry | undefined {
    return this.resolveEntry(nameOrId);
  }

  /**
   * Recupera on-demand la definizione MCP completa (incluso `inputSchema` JSON) per
   * l'iniezione JIT nel contesto solo al momento dell'uso.
   */
  getToolDefinition(nameOrId: string): McpToolDefinition | undefined {
    const entry = this.resolveEntry(nameOrId);
    if (!entry) return undefined;
    if (
      entry.tool.status !== "HOT_LOADED" &&
      entry.tool.status !== "PROMOTED_PERMANENT"
    ) {
      return undefined;
    }

    let parsedSchema: Record<string, unknown> = { type: "object" };
    try {
      parsedSchema = JSON.parse(entry.tool.inputSchemaJson);
    } catch {
      parsedSchema = { type: "object" };
    }

    return {
      name: entry.tool.name,
      description: entry.tool.description,
      inputSchema: parsedSchema,
    };
  }

  /**
   * Principio Karpathy "Context as RAM" (Lazy Tool Discovery):
   * Espone solo `name` e `description` dei tool attivi (`HOT_LOADED` o `PROMOTED_PERMANENT`),
   * combinati opzionalmente con quelli del `McpClientBridge` collegato.
   */
  discoverLazyMetadata(): LightweightToolMetadata[] {
    const bridgeTools = this.clientBridge
      ? this.clientBridge.getCachedToolsList()
      : [];

    const dynamicTools: LightweightToolMetadata[] = [];
    for (const entry of this.entriesById.values()) {
      if (
        entry.tool.status === "HOT_LOADED" ||
        entry.tool.status === "PROMOTED_PERMANENT"
      ) {
        dynamicTools.push({
          name: entry.tool.name,
          description: entry.tool.description,
        });
      }
    }

    return [...bridgeTools, ...dynamicTools];
  }

  /**
   * Invoca un tool dinamico registrato eseguendolo nella sandbox Worker Threads.
   * Aggiorna i contatori e promuove automaticamente lo stato a `PROMOTED_PERMANENT`
   * al raggiungimento di `promotionThreshold` invocazioni riuscite con 0 fallimenti.
   */
  async invokeTool(
    nameOrId: string,
    args: Record<string, unknown> = {}
  ): Promise<DynamicToolInvocationResult> {
    const entry = this.resolveEntry(nameOrId);
    if (!entry) {
      throw new Error(
        `[Fail Loudly] Dynamic MCP tool '${nameOrId}' not found in registry`
      );
    }

    if (entry.tool.status === "EXPIRED") {
      throw new Error(
        `[Fail Loudly] Dynamic MCP tool '${entry.tool.toolId}' has EXPIRED and cannot be invoked`
      );
    }

    if (entry.tool.status === "QUARANTINED") {
      throw new Error(
        `[Fail Loudly] Dynamic MCP tool '${entry.tool.toolId}' is QUARANTINED and cannot be invoked`
      );
    }

    const sandboxResult = await runDynamicToolInSandbox(
      entry.tool,
      entry.code,
      args,
      this.defaultTimeoutMs
    );

    entry.invocationCount += 1;
    entry.lastInvokedAtMs = Date.now();

    if (sandboxResult.success && !sandboxResult.quarantined) {
      entry.successCount += 1;
      if (
        entry.tool.status !== "PROMOTED_PERMANENT" &&
        entry.successCount >= this.promotionThreshold &&
        entry.failureCount === 0
      ) {
        entry.tool = DynamicMcpToolSchema.parse({
          ...entry.tool,
          status: "PROMOTED_PERMANENT",
        });
      }
    } else {
      entry.failureCount += 1;
      if (sandboxResult.quarantined) {
        entry.tool = DynamicMcpToolSchema.parse({
          ...entry.tool,
          status: "QUARANTINED",
        });
      }
    }

    const promoted = entry.tool.status === "PROMOTED_PERMANENT";
    const textPayload = sandboxResult.success
      ? typeof sandboxResult.output === "string"
        ? sandboxResult.output
        : JSON.stringify(sandboxResult.output ?? {})
      : `Error: ${sandboxResult.error ?? "Dynamic tool execution failed"}`;

    return {
      toolId: entry.tool.toolId,
      name: entry.tool.name,
      success: sandboxResult.success,
      output: sandboxResult.output,
      error: sandboxResult.error,
      executionTimeMs: sandboxResult.executionTimeMs,
      quarantined: sandboxResult.quarantined,
      status: entry.tool.status,
      invocationCount: entry.invocationCount,
      successCount: entry.successCount,
      failureCount: entry.failureCount,
      promoted,
      content: [{ type: "text", text: textPayload }],
      isError: !sandboxResult.success,
    };
  }

  /**
   * Gestione TTL & Auto-Eviction (Anti-Context-Rot):
   * Verifica se `(nowMs - createdAtMs) / 1000 >= tool.ttlSeconds` per tutti i tool
   * non promossi (`status !== "PROMOTED_PERMANENT"`), marcandoli come `"EXPIRED"`
   * e rimuovendoli dalla lista attiva restituita da `discoverLazyMetadata()`.
   */
  evictExpiredTools(nowMs: number = Date.now()): DynamicMcpTool[] {
    const evicted: DynamicMcpTool[] = [];

    for (const entry of this.entriesById.values()) {
      if (
        entry.tool.status === "PROMOTED_PERMANENT" ||
        entry.tool.status === "EXPIRED"
      ) {
        continue;
      }

      const createdAtMs = new Date(entry.tool.createdAt).getTime();
      const elapsedSeconds = (nowMs - createdAtMs) / 1000;

      if (elapsedSeconds >= entry.tool.ttlSeconds) {
        entry.tool = DynamicMcpToolSchema.parse({
          ...entry.tool,
          status: "EXPIRED",
        });
        evicted.push(entry.tool);
      }
    }

    return evicted;
  }
}
