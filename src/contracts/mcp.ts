import { z } from "zod";

export const McpToolDefinitionSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  inputSchema: z.record(z.any()),
});

export const McpServerConfigSchema = z.object({
  name: z.string().default("agentic-company-mcp-server"),
  version: z.string().default("1.0.0"),
  tools: z.array(McpToolDefinitionSchema).default([]),
});

export const McpCallToolRequestSchema = z.object({
  name: z.string(),
  arguments: z.record(z.any()).optional().default({}),
});

export const McpCallToolResponseSchema = z.object({
  content: z.array(
    z.object({
      type: z.enum(["text", "image", "resource"]).default("text"),
      text: z.string(),
    })
  ),
  isError: z.boolean().default(false),
});

export const McpClientConfigSchema = z.object({
  serverName: z.string(),
  transport: z.enum(["stdio", "sse"]).default("stdio"),
  command: z.string().optional(),
  args: z.array(z.string()).default([]),
  url: z.string().optional(),
  timeoutMs: z.number().default(5000),
});

export type McpToolDefinition = z.infer<typeof McpToolDefinitionSchema>;
export type McpServerConfig = z.infer<typeof McpServerConfigSchema>;
export type McpCallToolRequest = z.infer<typeof McpCallToolRequestSchema>;
export type McpCallToolResponse = z.infer<typeof McpCallToolResponseSchema>;
export type McpClientConfig = z.infer<typeof McpClientConfigSchema>;
