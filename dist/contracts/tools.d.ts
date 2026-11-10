import { z } from "zod";
export declare const ToolScopeLevelSchema: z.ZodEnum<["L1", "L2", "L3"]>;
export declare const ScopedToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isCoreUniversal: z.ZodDefault<z.ZodBoolean>;
    allowedStates: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    allowedLevels: z.ZodDefault<z.ZodArray<z.ZodEnum<["L1", "L2", "L3"]>, "many">>;
    estimatedSchemaTokens: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    inputSchema: Record<string, any>;
    isCoreUniversal: boolean;
    allowedStates: string[];
    allowedLevels: ("L2" | "L3" | "L1")[];
    estimatedSchemaTokens: number;
}, {
    name: string;
    description: string;
    inputSchema?: Record<string, any> | undefined;
    isCoreUniversal?: boolean | undefined;
    allowedStates?: string[] | undefined;
    allowedLevels?: ("L2" | "L3" | "L1")[] | undefined;
    estimatedSchemaTokens?: number | undefined;
}>;
export declare const ToolScopingResultSchema: z.ZodObject<{
    activeTools: z.ZodArray<z.ZodString, "many">;
    prunedTools: z.ZodArray<z.ZodString, "many">;
    totalToolsCount: z.ZodNumber;
    activeToolsCount: z.ZodNumber;
    tokensSavedEstimate: z.ZodNumber;
    fsmState: z.ZodString;
    level: z.ZodEnum<["L1", "L2", "L3"]>;
}, "strip", z.ZodTypeAny, {
    fsmState: string;
    level: "L2" | "L3" | "L1";
    activeTools: string[];
    prunedTools: string[];
    totalToolsCount: number;
    activeToolsCount: number;
    tokensSavedEstimate: number;
}, {
    fsmState: string;
    level: "L2" | "L3" | "L1";
    activeTools: string[];
    prunedTools: string[];
    totalToolsCount: number;
    activeToolsCount: number;
    tokensSavedEstimate: number;
}>;
export declare const StrictJsonSchemaConfigSchema: z.ZodObject<{
    type: z.ZodLiteral<"object">;
    properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    required: z.ZodArray<z.ZodString, "many">;
    additionalProperties: z.ZodLiteral<false>;
}, "strip", z.ZodTypeAny, {
    type: "object";
    required: string[];
    properties: Record<string, any>;
    additionalProperties: false;
}, {
    type: "object";
    required: string[];
    properties: Record<string, any>;
    additionalProperties: false;
}>;
export declare const ConstrainedDecodingResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    rawOutput: z.ZodString;
    parsingErrors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    repairedMarkdownFences: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    rawOutput: string;
    parsingErrors: string[];
    repairedMarkdownFences: boolean;
    data?: any;
}, {
    success: boolean;
    rawOutput: string;
    data?: any;
    parsingErrors?: string[] | undefined;
    repairedMarkdownFences?: boolean | undefined;
}>;
export type ToolScopeLevel = z.infer<typeof ToolScopeLevelSchema>;
export type ScopedToolDefinition = z.infer<typeof ScopedToolDefinitionSchema>;
export type ToolScopingResult = z.infer<typeof ToolScopingResultSchema>;
export type StrictJsonSchemaConfig = z.infer<typeof StrictJsonSchemaConfigSchema>;
export type ConstrainedDecodingResult = z.infer<typeof ConstrainedDecodingResultSchema>;
//# sourceMappingURL=tools.d.ts.map