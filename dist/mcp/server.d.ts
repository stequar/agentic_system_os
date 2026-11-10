import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { DynamicMcpRegistry } from "./dynamic-registry.js";
/**
 * Strumenti deterministici esposti dall'OS attraverso il protocollo MCP.
 */
export declare const MCP_OS_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            targetPath: {
                type: string;
                description: string;
            };
            testCommands?: undefined;
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            faultType?: undefined;
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            targetPath: {
                type: string;
                description: string;
            };
            testCommands: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            faultType?: undefined;
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            targetPath: {
                type: string;
                description: string;
            };
            testCommands?: undefined;
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            faultType?: undefined;
            transcript?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            targetFilePath: {
                type: string;
                description: string;
            };
            sourceCode: {
                type: string;
                description: string;
            };
            targetSymbol: {
                type: string;
                description: string;
            };
            invariants: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            targetPath?: undefined;
            testCommands?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            faultType?: undefined;
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            prompt: {
                type: string;
                description: string;
            };
            domain: {
                type: string;
                description: string;
            };
            complexityScore: {
                type: string;
                description: string;
            };
            targetPath?: undefined;
            testCommands?: undefined;
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            faultType?: undefined;
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            faultType: {
                type: string;
                description: string;
            };
            targetPath?: undefined;
            testCommands?: undefined;
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            transcript?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            transcript: {
                type: string;
                description: string;
            };
            targetPath: {
                type: string;
                description: string;
            };
            testCommands?: undefined;
            targetFilePath?: undefined;
            sourceCode?: undefined;
            targetSymbol?: undefined;
            invariants?: undefined;
            prompt?: undefined;
            domain?: undefined;
            complexityScore?: undefined;
            faultType?: undefined;
        };
        required: string[];
    };
})[];
/**
 * Istanzia e configura il Server MCP di Agentic Company OS.
 */
export declare function createMcpServer(options?: {
    dynamicRegistry?: DynamicMcpRegistry;
    fsmState?: string;
}): Server;
/**
 * Avvia il server MCP collegandolo al trasporto fornito (default: StdioServerTransport).
 * Garantisce che nessun output sporchi process.stdout al di fuori di JSON-RPC.
 */
export declare function startMcpServer(customTransport?: Transport): Promise<{
    server: Server;
    transport: Transport;
}>;
//# sourceMappingURL=server.d.ts.map