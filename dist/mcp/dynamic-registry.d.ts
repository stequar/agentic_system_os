import { type DynamicMcpTool } from "../contracts/frontiers.js";
import type { McpToolDefinition } from "../contracts/mcp.js";
import type { LightweightToolMetadata, McpClientBridge } from "./client.js";
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
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError: boolean;
}
/**
 * Registro dinamico a caldo (Hot-Reload) e gestore del ciclo di vita effimero (TTL & Promotion)
 * per i tool MCP sintetizzati Just-In-Time (TCK-19.3).
 */
export declare class DynamicMcpRegistry {
    private entriesById;
    private idByName;
    private readonly promotionThreshold;
    private readonly defaultTimeoutMs;
    private clientBridge?;
    constructor(options?: DynamicMcpRegistryOptions);
    /**
     * Collega opzionalmente un'istanza di `McpClientBridge` al registro dinamico.
     */
    attachClientBridge(bridge: McpClientBridge): void;
    /**
     * Registra a caldo un tool dinamico nel catalogo attivo SOLO se ha superato
     * il Pre-Flight Verification Gate (`tool.status === "TEST_PASSED"`) e il controllo AST.
     * Rifiuta con errore Fail Loudly qualsiasi tool non verificato o in quarantena.
     */
    registerVerifiedTool(tool: DynamicMcpTool, code: string): DynamicMcpTool;
    /**
     * Esegue il Pre-Flight Verification Gate sul tool e, se certificato `TEST_PASSED`,
     * lo registra immediatamente a caldo (`HOT_LOADED`).
     */
    verifyAndRegisterTool(tool: DynamicMcpTool, code: string): Promise<DynamicMcpTool>;
    /**
     * Svuota il registro (isolamento test / reset): rimuove tutti i tool e le mappe nome→id.
     */
    clear(): void;
    /**
     * Risolve l'entry interna cercando per `toolId` o per `name`.
     */
    private resolveEntry;
    /**
     * Restituisce i metadati del tool (anche se EXPIRED o QUARANTINED) per ispezione e audit.
     */
    getTool(nameOrId: string): DynamicMcpTool | undefined;
    /**
     * Restituisce l'entry completa (con statistiche di invocazione) per telemetria e test.
     */
    getToolEntry(nameOrId: string): RegisteredDynamicToolEntry | undefined;
    /**
     * Recupera on-demand la definizione MCP completa (incluso `inputSchema` JSON) per
     * l'iniezione JIT nel contesto solo al momento dell'uso.
     */
    getToolDefinition(nameOrId: string): McpToolDefinition | undefined;
    /**
     * Principio Karpathy "Context as RAM" (Lazy Tool Discovery):
     * Espone solo `name` e `description` dei tool attivi (`HOT_LOADED` o `PROMOTED_PERMANENT`),
     * combinati opzionalmente con quelli del `McpClientBridge` collegato.
     */
    discoverLazyMetadata(): LightweightToolMetadata[];
    /**
     * Invoca un tool dinamico registrato eseguendolo nella sandbox Worker Threads.
     * Aggiorna i contatori e promuove automaticamente lo stato a `PROMOTED_PERMANENT`
     * al raggiungimento di `promotionThreshold` invocazioni riuscite con 0 fallimenti.
     */
    invokeTool(nameOrId: string, args?: Record<string, unknown>): Promise<DynamicToolInvocationResult>;
    /**
     * Gestione TTL & Auto-Eviction (Anti-Context-Rot):
     * Verifica se `(nowMs - createdAtMs) / 1000 >= tool.ttlSeconds` per tutti i tool
     * non promossi (`status !== "PROMOTED_PERMANENT"`), marcandoli come `"EXPIRED"`
     * e rimuovendoli dalla lista attiva restituita da `discoverLazyMetadata()`.
     */
    evictExpiredTools(nowMs?: number): DynamicMcpTool[];
}
//# sourceMappingURL=dynamic-registry.d.ts.map