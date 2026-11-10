import { z } from "zod";

export const ToolScopeLevelSchema = z.enum(["L1", "L2", "L3"]);

export const ScopedToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()).default({ type: "object", properties: {} }),
  isCoreUniversal: z.boolean().default(false),
  allowedStates: z.array(z.string()).default([]),
  allowedLevels: z.array(ToolScopeLevelSchema).default(["L1", "L2", "L3"]),
  estimatedSchemaTokens: z.number().int().default(350),
});

export const ToolScopingResultSchema = z.object({
  activeTools: z.array(z.string()),
  prunedTools: z.array(z.string()),
  totalToolsCount: z.number().int().nonnegative(),
  activeToolsCount: z.number().int().nonnegative(),
  tokensSavedEstimate: z.number().int().nonnegative(),
  fsmState: z.string(),
  level: ToolScopeLevelSchema,
});

export const StrictJsonSchemaConfigSchema = z.object({
  type: z.literal("object"),
  properties: z.record(z.any()),
  required: z.array(z.string()),
  additionalProperties: z.literal(false),
});

export const ConstrainedDecodingResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  rawOutput: z.string(),
  parsingErrors: z.array(z.string()).default([]),
  repairedMarkdownFences: z.boolean().default(false),
});

export type ToolScopeLevel = z.infer<typeof ToolScopeLevelSchema>;
export type ScopedToolDefinition = z.infer<typeof ScopedToolDefinitionSchema>;
export type ToolScopingResult = z.infer<typeof ToolScopingResultSchema>;
export type StrictJsonSchemaConfig = z.infer<typeof StrictJsonSchemaConfigSchema>;
export type ConstrainedDecodingResult = z.infer<typeof ConstrainedDecodingResultSchema>;
