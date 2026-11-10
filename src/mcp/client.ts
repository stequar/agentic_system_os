import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  McpClientConfigSchema,
  McpCallToolRequestSchema,
  McpCallToolResponseSchema,
  type McpClientConfig,
  type McpCallToolRequest,
  type McpCallToolResponse,
  type McpToolDefinition,
} from "../contracts/mcp.js";

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
export class McpClientBridge {
  private client: Client;
  private transport: Transport | null = null;
  private config: McpClientConfig;
  private toolRegistry: Map<string, McpToolDefinition> = new Map();
  private connected = false;

  constructor(config: Partial<McpClientConfig>, private customTransport?: Transport) {
    this.config = McpClientConfigSchema.parse({
      serverName: config.serverName || "external-mcp-server",
      transport: config.transport || "stdio",
      command: config.command,
      args: config.args || [],
      url: config.url,
      timeoutMs: config.timeoutMs || 5000,
    });

    this.client = new Client(
      {
        name: `agentic-client-for-${this.config.serverName}`,
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Connette il client al server MCP.
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    if (this.customTransport) {
      this.transport = this.customTransport;
    } else {
      if (this.config.transport === "stdio") {
        if (!this.config.command) {
          throw new Error("Missing command for stdio transport in McpClientBridge");
        }
        this.transport = new StdioClientTransport({
          command: this.config.command,
          args: this.config.args,
        });
      } else {
        throw new Error(`Trasporto '${this.config.transport}' non ancora implementato nel bridge`);
      }
    }

    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * Disconnette il client e rilascia le risorse.
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.close();
    } catch {
      // Ignora errori di chiusura già avvenuta
    }
    this.connected = false;
    this.toolRegistry.clear();
  }

  /**
   * Pattern "Lazy Tool Discovery":
   * Interroga il server MCP, memorizza gli schemi completi nella cache interna in RAM,
   * e restituisce agli agenti solo metadati leggeri (nome e descrizione)
   * per rispettare Karpathy Context as RAM ed evitare saturazione di token.
   */
  async discoverToolsLazy(): Promise<LightweightToolMetadata[]> {
    if (!this.connected) {
      await this.connect();
    }

    const response = await this.client.listTools();
    const lightweightList: LightweightToolMetadata[] = [];
    this.toolRegistry.clear();

    for (const tool of response.tools) {
      const toolDef: McpToolDefinition = {
        name: tool.name,
        description: tool.description || "Nessuna descrizione disponibile",
        inputSchema: (tool.inputSchema as Record<string, any>) || { type: "object" },
      };

      this.toolRegistry.set(tool.name, toolDef);
      lightweightList.push({
        name: toolDef.name,
        description: toolDef.description,
      });
    }

    return lightweightList;
  }

  /**
   * Recupera on-demand la definizione completa di uno strumento specifico (JIT context injection).
   */
  getToolDefinition(name: string): McpToolDefinition | undefined {
    return this.toolRegistry.get(name);
  }

  /**
   * Restituisce tutti i metadati leggeri degli strumenti memorizzati in cache.
   */
  getCachedToolsList(): LightweightToolMetadata[] {
    return Array.from(this.toolRegistry.values()).map((t) => ({
      name: t.name,
      description: t.description,
    }));
  }

  /**
   * Invoca uno strumento con validazione difensiva degli argomenti via Zod.
   */
  async callTool(request: McpCallToolRequest): Promise<McpCallToolResponse> {
    const validatedRequest = McpCallToolRequestSchema.parse(request);

    if (!this.connected) {
      await this.connect();
    }

    try {
      const response = await this.client.callTool({
        name: validatedRequest.name,
        arguments: validatedRequest.arguments,
      });

      // Mappatura sicura del contenuto restituito
      const content = Array.isArray(response.content)
        ? response.content.map((c: any) => ({
            type: (c.type === "image" || c.type === "resource" ? c.type : "text") as "text" | "image" | "resource",
            text: typeof c.text === "string" ? c.text : JSON.stringify(c),
          }))
        : [{ type: "text" as const, text: JSON.stringify(response) }];

      return McpCallToolResponseSchema.parse({
        content,
        isError: Boolean(response.isError),
      });
    } catch (err: any) {
      return McpCallToolResponseSchema.parse({
        content: [{ type: "text", text: `Errore chiamata tool: ${err.message || String(err)}` }],
        isError: true,
      });
    }
  }

  /**
   * Verifica se il client è attualmente connesso.
   */
  isConnected(): boolean {
    return this.connected;
  }
}
