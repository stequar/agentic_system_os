import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpClientConfigSchema, McpCallToolRequestSchema, McpCallToolResponseSchema, } from "../contracts/mcp.js";
/**
 * Bridge client MCP di Agentic Company OS.
 * Implementa Lazy Tool Discovery e validazione difensiva con Zod.
 */
export class McpClientBridge {
    customTransport;
    client;
    transport = null;
    config;
    toolRegistry = new Map();
    connected = false;
    constructor(config, customTransport) {
        this.customTransport = customTransport;
        this.config = McpClientConfigSchema.parse({
            serverName: config.serverName || "external-mcp-server",
            transport: config.transport || "stdio",
            command: config.command,
            args: config.args || [],
            url: config.url,
            timeoutMs: config.timeoutMs || 5000,
        });
        this.client = new Client({
            name: `agentic-client-for-${this.config.serverName}`,
            version: "1.0.0",
        }, {
            capabilities: {},
        });
    }
    /**
     * Connette il client al server MCP.
     */
    async connect() {
        if (this.connected)
            return;
        if (this.customTransport) {
            this.transport = this.customTransport;
        }
        else {
            if (this.config.transport === "stdio") {
                if (!this.config.command) {
                    throw new Error("Missing command for stdio transport in McpClientBridge");
                }
                this.transport = new StdioClientTransport({
                    command: this.config.command,
                    args: this.config.args,
                });
            }
            else {
                throw new Error(`Trasporto '${this.config.transport}' non ancora implementato nel bridge`);
            }
        }
        await this.client.connect(this.transport);
        this.connected = true;
    }
    /**
     * Disconnette il client e rilascia le risorse.
     */
    async disconnect() {
        if (!this.connected)
            return;
        try {
            await this.client.close();
        }
        catch {
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
    async discoverToolsLazy() {
        if (!this.connected) {
            await this.connect();
        }
        const response = await this.client.listTools();
        const lightweightList = [];
        this.toolRegistry.clear();
        for (const tool of response.tools) {
            const toolDef = {
                name: tool.name,
                description: tool.description || "Nessuna descrizione disponibile",
                inputSchema: tool.inputSchema || { type: "object" },
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
    getToolDefinition(name) {
        return this.toolRegistry.get(name);
    }
    /**
     * Restituisce tutti i metadati leggeri degli strumenti memorizzati in cache.
     */
    getCachedToolsList() {
        return Array.from(this.toolRegistry.values()).map((t) => ({
            name: t.name,
            description: t.description,
        }));
    }
    /**
     * Invoca uno strumento con validazione difensiva degli argomenti via Zod.
     */
    async callTool(request) {
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
                ? response.content.map((c) => ({
                    type: (c.type === "image" || c.type === "resource" ? c.type : "text"),
                    text: typeof c.text === "string" ? c.text : JSON.stringify(c),
                }))
                : [{ type: "text", text: JSON.stringify(response) }];
            return McpCallToolResponseSchema.parse({
                content,
                isError: Boolean(response.isError),
            });
        }
        catch (err) {
            return McpCallToolResponseSchema.parse({
                content: [{ type: "text", text: `Errore chiamata tool: ${err.message || String(err)}` }],
                isError: true,
            });
        }
    }
    /**
     * Verifica se il client è attualmente connesso.
     */
    isConnected() {
        return this.connected;
    }
}
//# sourceMappingURL=client.js.map