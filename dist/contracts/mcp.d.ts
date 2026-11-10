import { z } from "zod";
export declare const McpToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}, {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
}>;
export declare const McpServerConfigSchema: z.ZodObject<{
    name: z.ZodDefault<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    tools: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        inputSchema: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
    }, {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    version: string;
    name: string;
    tools: {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
    }[];
}, {
    version?: string | undefined;
    name?: string | undefined;
    tools?: {
        name: string;
        description: string;
        inputSchema: Record<string, any>;
    }[] | undefined;
}>;
export declare const McpCallToolRequestSchema: z.ZodObject<{
    name: z.ZodString;
    arguments: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    arguments: Record<string, any>;
}, {
    name: string;
    arguments?: Record<string, any> | undefined;
}>;
export declare const McpCallToolResponseSchema: z.ZodObject<{
    content: z.ZodArray<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["text", "image", "resource"]>>;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "text" | "image" | "resource";
        text: string;
    }, {
        text: string;
        type?: "text" | "image" | "resource" | undefined;
    }>, "many">;
    isError: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    content: {
        type: "text" | "image" | "resource";
        text: string;
    }[];
    isError: boolean;
}, {
    content: {
        text: string;
        type?: "text" | "image" | "resource" | undefined;
    }[];
    isError?: boolean | undefined;
}>;
export declare const McpClientConfigSchema: z.ZodObject<{
    serverName: z.ZodString;
    transport: z.ZodDefault<z.ZodEnum<["stdio", "sse"]>>;
    command: z.ZodOptional<z.ZodString>;
    args: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    url: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeoutMs: number;
    serverName: string;
    transport: "stdio" | "sse";
    args: string[];
    url?: string | undefined;
    command?: string | undefined;
}, {
    serverName: string;
    timeoutMs?: number | undefined;
    url?: string | undefined;
    transport?: "stdio" | "sse" | undefined;
    command?: string | undefined;
    args?: string[] | undefined;
}>;
export type McpToolDefinition = z.infer<typeof McpToolDefinitionSchema>;
export type McpServerConfig = z.infer<typeof McpServerConfigSchema>;
export type McpCallToolRequest = z.infer<typeof McpCallToolRequestSchema>;
export type McpCallToolResponse = z.infer<typeof McpCallToolResponseSchema>;
export type McpClientConfig = z.infer<typeof McpClientConfigSchema>;
//# sourceMappingURL=mcp.d.ts.map