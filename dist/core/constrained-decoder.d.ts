import { z } from "zod";
import { type ConstrainedDecodingResult } from "../contracts/tools.js";
export declare class ConstrainedDecodingError extends Error {
    readonly parsingErrors: string[];
    readonly rawInput: string;
    constructor(message: string, parsingErrors: string[], rawInput: string);
}
export declare class ConstrainedDecoder {
    /**
     * Pulisce l'output grezzo dell'LLM estraendo il payload JSON valido:
     * rimuove markdown code fences (```json ... ```), preamboli conversazionali e spaziature.
     */
    static cleanAndExtractJson(raw: string): {
        jsonStr: string;
        hadMarkdownFences: boolean;
    };
    /**
     * Genera un JSON Schema conforme alla specifica Strict Mode (es. OpenAI strict: true):
     * - additionalProperties: false obbligatorio
     * - required: lista completa delle chiavi non opzionali
     */
    static toStrictJsonSchema(zodSchema: z.ZodTypeAny): Record<string, any>;
    /**
     * Decodifica deterministica: esegue il parsing e la validazione rispetto allo schema Zod.
     * Lancia un errore dettagliato se il parsing fallisce.
     */
    static decode<T>(raw: string, schema: z.ZodType<T>, options?: {
        allowRepair?: boolean;
    }): T;
    /**
     * Decodifica sicura che restituisce un oggetto conforme a ConstrainedDecodingResultSchema
     * senza lanciare eccezioni.
     */
    static safeDecode<T>(raw: string, schema: z.ZodType<T>, options?: {
        allowRepair?: boolean;
    }): ConstrainedDecodingResult;
    /**
     * Genera la configurazione API per OpenAI Structured Outputs (strict: true).
     */
    static getOpenAiStrictConfig(schema: z.ZodTypeAny, schemaName?: string): Record<string, any>;
    /**
     * Genera la configurazione API per Anthropic Tool Forcing deterministico.
     */
    static getAnthropicForcedToolConfig(toolName: string, schema: z.ZodTypeAny): Record<string, any>;
}
//# sourceMappingURL=constrained-decoder.d.ts.map