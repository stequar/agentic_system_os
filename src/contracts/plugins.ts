import { z } from "zod";

export const PluginTypeSchema = z.enum(["detector", "role", "gatekeeper", "tool"]);

export const PluginManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/, "L'ID del plugin deve contenere solo caratteri alfanumerici minuscoli, trattini o underscore"),
  name: z.string().min(3),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "La versione del plugin deve seguire il formato SemVer (es. 1.0.0)"),
  type: PluginTypeSchema,
  description: z.string().min(10),
  author: z.string().optional(),
  entrypoint: z.string().describe("Percorso relativo dello script del plugin"),
  config: z.record(z.any()).default({}),
});

export const PluginExecutionInputSchema = z.object({
  pluginId: z.string(),
  type: PluginTypeSchema,
  payload: z.record(z.any()),
  timeoutMs: z.number().default(3000),
});

export const PluginExecutionResultSchema = z.object({
  pluginId: z.string(),
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  executionDurationMs: z.number().nonnegative(),
});

export type PluginType = z.infer<typeof PluginTypeSchema>;
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type PluginExecutionInput = z.infer<typeof PluginExecutionInputSchema>;
export type PluginExecutionResult = z.infer<typeof PluginExecutionResultSchema>;

export const AgenticPluginSchema = PluginManifestSchema;
export type AgenticPlugin = PluginManifest;

