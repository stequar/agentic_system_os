import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { type McpClientConfig, type McpCallToolRequest, type McpCallToolResponse, type McpToolDefinition } from "../contracts/mcp.js";
/**
 * Metadati leggeri di uno strumento per il principio Karpathy "Context as RAM".
 * Evita di caricare gli schemi JSON completi e pesanti nel prompt dell'agente.
 */
export interface LightweightToolMetadata {
    name: string;
    description: string;
}
/**
 * Bridge client MCP di Agentic Company OS.
 * Implementa Lazy Tool Discovery e validazione difensiva con Zod.
 */
export declare class McpClientBridge {
    private customTransport?;
    private client;
    private transport;
    private config;
    private toolRegistry;
    private connected;
    constructor(config: Partial<McpClientConfig>, customTransport?: Transport | undefined);
    /**
     * Connette il client al server MCP.
     */
    connect(): Promise<void>;
    /**
     * Disconnette il client e rilascia le risorse.
     */
    disconnect(): Promise<void>;
    /**
     * Pattern "Lazy Tool Discovery":
     * Interroga il server MCP, memorizza gli schemi completi nella cache interna in RAM,
     * e restituisce agli agenti solo metadati leggeri (nome e descrizione)
     * per rispettare Karpathy Context as RAM ed evitare saturazione di token.
     */
    discoverToolsLazy(): Promise<LightweightToolMetadata[]>;
    /**
     * Recupera on-demand la definizione completa di uno strumento specifico (JIT context injection).
     */
    getToolDefinition(name: string): McpToolDefinition | undefined;
    /**
     * Restituisce tutti i metadati leggeri degli strumenti memorizzati in cache.
     */
    getCachedToolsList(): LightweightToolMetadata[];
    /**
     * Invoca uno strumento con validazione difensiva degli argomenti via Zod.
     */
    callTool(request: McpCallToolRequest): Promise<McpCallToolResponse>;
    /**
     * Verifica se il client è attualmente connesso.
     */
    isConnected(): boolean;
}
//# sourceMappingURL=client.d.ts.map