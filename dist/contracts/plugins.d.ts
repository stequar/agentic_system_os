import { z } from "zod";
export declare const PluginTypeSchema: z.ZodEnum<["detector", "role", "gatekeeper", "tool"]>;
export declare const PluginManifestSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    type: z.ZodEnum<["detector", "role", "gatekeeper", "tool"]>;
    description: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
    entrypoint: z.ZodString;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    version: string;
    id: string;
    name: string;
    description: string;
    config: Record<string, any>;
    entrypoint: string;
    author?: string | undefined;
}, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    version: string;
    id: string;
    name: string;
    description: string;
    entrypoint: string;
    config?: Record<string, any> | undefined;
    author?: string | undefined;
}>;
export declare const PluginExecutionInputSchema: z.ZodObject<{
    pluginId: z.ZodString;
    type: z.ZodEnum<["detector", "role", "gatekeeper", "tool"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    payload: Record<string, any>;
    timeoutMs: number;
    pluginId: string;
}, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    payload: Record<string, any>;
    pluginId: string;
    timeoutMs?: number | undefined;
}>;
export declare const PluginExecutionResultSchema: z.ZodObject<{
    pluginId: z.ZodString;
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    executionDurationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    pluginId: string;
    executionDurationMs: number;
    error?: string | undefined;
    data?: any;
}, {
    success: boolean;
    pluginId: string;
    executionDurationMs: number;
    error?: string | undefined;
    data?: any;
}>;
export type PluginType = z.infer<typeof PluginTypeSchema>;
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type PluginExecutionInput = z.infer<typeof PluginExecutionInputSchema>;
export type PluginExecutionResult = z.infer<typeof PluginExecutionResultSchema>;
export declare const AgenticPluginSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    type: z.ZodEnum<["detector", "role", "gatekeeper", "tool"]>;
    description: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
    entrypoint: z.ZodString;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    version: string;
    id: string;
    name: string;
    description: string;
    config: Record<string, any>;
    entrypoint: string;
    author?: string | undefined;
}, {
    type: "gatekeeper" | "role" | "tool" | "detector";
    version: string;
    id: string;
    name: string;
    description: string;
    entrypoint: string;
    config?: Record<string, any> | undefined;
    author?: string | undefined;
}>;
export type AgenticPlugin = PluginManifest;
//# sourceMappingURL=plugins.d.ts.map