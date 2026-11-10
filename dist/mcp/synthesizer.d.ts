import { z } from "zod";
import { type DynamicMcpTool } from "../contracts/frontiers.js";
import type { LightweightToolMetadata } from "./client.js";
/**
 * Definizione di un singolo campo di input per la sintesi JIT di un tool MCP.
 */
export declare const CapabilityInputFieldSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["string", "number", "boolean", "array", "object"]>>;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "number" | "boolean" | "object" | "array";
    required: boolean;
    description?: string | undefined;
}, {
    type?: "string" | "number" | "boolean" | "object" | "array" | undefined;
    description?: string | undefined;
    required?: boolean | undefined;
}>;
export type CapabilityInputField = z.infer<typeof CapabilityInputFieldSchema>;
/**
 * Schema di richiesta per colmare un Capability Gap tramite sintesi JIT di un tool MCP.
 */
export declare const CapabilityGapRequestSchema: z.ZodObject<{
    taskDescription: z.ZodString;
    missingCapability: z.ZodOptional<z.ZodString>;
    suggestedToolName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    inputFields: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["string", "number", "boolean", "array", "object"]>>;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        type: "string" | "number" | "boolean" | "object" | "array";
        required: boolean;
        description?: string | undefined;
    }, {
        type?: "string" | "number" | "boolean" | "object" | "array" | undefined;
        description?: string | undefined;
        required?: boolean | undefined;
    }>>>>;
    inputSchemaJson: z.ZodOptional<z.ZodString>;
    permissions: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    ttlSeconds: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    generatedByRole: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sandboxType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["NODE_WORKER", "WASM_SANDBOX", "IN_PROCESS_RESTRICTED"]>>>;
    handlerBody: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    generatedByRole: string;
    sandboxType: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED";
    permissions: string[];
    ttlSeconds: number;
    taskDescription: string;
    inputFields: Record<string, {
        type: "string" | "number" | "boolean" | "object" | "array";
        required: boolean;
        description?: string | undefined;
    }>;
    description?: string | undefined;
    inputSchemaJson?: string | undefined;
    missingCapability?: string | undefined;
    suggestedToolName?: string | undefined;
    handlerBody?: string | undefined;
}, {
    taskDescription: string;
    description?: string | undefined;
    generatedByRole?: string | undefined;
    sandboxType?: "NODE_WORKER" | "WASM_SANDBOX" | "IN_PROCESS_RESTRICTED" | undefined;
    permissions?: string[] | undefined;
    inputSchemaJson?: string | undefined;
    ttlSeconds?: number | undefined;
    missingCapability?: string | undefined;
    suggestedToolName?: string | undefined;
    inputFields?: Record<string, {
        type?: "string" | "number" | "boolean" | "object" | "array" | undefined;
        description?: string | undefined;
        required?: boolean | undefined;
    }> | undefined;
    handlerBody?: string | undefined;
}>;
export type CapabilityGapRequest = z.input<typeof CapabilityGapRequestSchema>;
export type ParsedCapabilityGapRequest = z.infer<typeof CapabilityGapRequestSchema>;
/**
 * Report strutturato restituito dal Capability Gap Detector.
 */
export declare const CapabilityGapReportSchema: z.ZodObject<{
    hasGap: z.ZodBoolean;
    matchedToolName: z.ZodOptional<z.ZodString>;
    suggestedToolName: z.ZodString;
    reason: z.ZodString;
    requiredPermissions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    reason: string;
    suggestedToolName: string;
    hasGap: boolean;
    requiredPermissions: string[];
    matchedToolName?: string | undefined;
}, {
    reason: string;
    suggestedToolName: string;
    hasGap: boolean;
    requiredPermissions: string[];
    matchedToolName?: string | undefined;
}>;
export type CapabilityGapReport = z.infer<typeof CapabilityGapReportSchema>;
/**
 * Bundle generato dal sintetizzatore JIT: metadati validati + codice ESM eseguibile.
 */
export interface SynthesizedToolBundle {
    tool: DynamicMcpTool;
    code: string;
}
/**
 * Analizza se i tool attuali nel catalogo coprono il task richiesto o se occorre
 * sintetizzare un tool JIT, restituendo un report strutturato deterministico.
 */
export declare function detectCapabilityGap(taskDescription: string, availableTools: LightweightToolMetadata[]): CapabilityGapReport;
/**
 * Sintetizza un tool MCP dinamico conforme a DynamicMcpToolSchema e genera il
 * relativo codice sorgente ESM eseguibile nella sandbox Worker Threads.
 */
export declare function synthesizeDynamicMcpTool(req: CapabilityGapRequest): SynthesizedToolBundle;
//# sourceMappingURL=synthesizer.d.ts.map