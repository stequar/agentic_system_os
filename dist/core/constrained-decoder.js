import { z } from "zod";
import { ConstrainedDecodingResultSchema, } from "../contracts/tools.js";
export class ConstrainedDecodingError extends Error {
    parsingErrors;
    rawInput;
    constructor(message, parsingErrors, rawInput) {
        super(message);
        this.parsingErrors = parsingErrors;
        this.rawInput = rawInput;
        this.name = "ConstrainedDecodingError";
    }
}
export class ConstrainedDecoder {
    /**
     * Pulisce l'output grezzo dell'LLM estraendo il payload JSON valido:
     * rimuove markdown code fences (```json ... ```), preamboli conversazionali e spaziature.
     */
    static cleanAndExtractJson(raw) {
        let text = raw.trim();
        let hadMarkdownFences = false;
        // Rimozione di markdown code blocks ```json ... ```
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            text = codeBlockMatch[1].trim();
            hadMarkdownFences = true;
        }
        // Se rimangono frammenti di testo conversazionale attorno al JSON, estrae il blocco tra la prima {/[ e l'ultima }/]
        const firstBrace = text.indexOf("{");
        const firstBracket = text.indexOf("[");
        let startIndex = -1;
        if (firstBrace !== -1 && firstBracket !== -1) {
            startIndex = Math.min(firstBrace, firstBracket);
        }
        else if (firstBrace !== -1) {
            startIndex = firstBrace;
        }
        else if (firstBracket !== -1) {
            startIndex = firstBracket;
        }
        if (startIndex > 0) {
            text = text.slice(startIndex);
            hadMarkdownFences = true;
        }
        const lastBrace = text.lastIndexOf("}");
        const lastBracket = text.lastIndexOf("]");
        let endIndex = -1;
        if (lastBrace !== -1 && lastBracket !== -1) {
            endIndex = Math.max(lastBrace, lastBracket);
        }
        else if (lastBrace !== -1) {
            endIndex = lastBrace;
        }
        else if (lastBracket !== -1) {
            endIndex = lastBracket;
        }
        if (endIndex !== -1 && endIndex < text.length - 1) {
            text = text.slice(0, endIndex + 1);
            hadMarkdownFences = true;
        }
        return { jsonStr: text.trim(), hadMarkdownFences };
    }
    /**
     * Genera un JSON Schema conforme alla specifica Strict Mode (es. OpenAI strict: true):
     * - additionalProperties: false obbligatorio
     * - required: lista completa delle chiavi non opzionali
     */
    static toStrictJsonSchema(zodSchema) {
        // Ispezione deterministica dello schema Zod
        if (zodSchema instanceof z.ZodObject) {
            const shape = zodSchema.shape;
            const properties = {};
            const required = [];
            for (const [key, value] of Object.entries(shape)) {
                const valType = value;
                properties[key] = this.toStrictJsonSchema(valType);
                // Se non è ZodOptional o ZodDefault, è un campo required
                if (!(valType instanceof z.ZodOptional)) {
                    required.push(key);
                }
            }
            return {
                type: "object",
                properties,
                required,
                additionalProperties: false,
            };
        }
        if (zodSchema instanceof z.ZodArray) {
            return {
                type: "array",
                items: this.toStrictJsonSchema(zodSchema.element),
            };
        }
        if (zodSchema instanceof z.ZodString) {
            return { type: "string" };
        }
        if (zodSchema instanceof z.ZodNumber) {
            return { type: "number" };
        }
        if (zodSchema instanceof z.ZodBoolean) {
            return { type: "boolean" };
        }
        if (zodSchema instanceof z.ZodEnum) {
            return {
                type: "string",
                enum: zodSchema.options,
            };
        }
        if (zodSchema instanceof z.ZodOptional) {
            return this.toStrictJsonSchema(zodSchema.unwrap());
        }
        if (zodSchema instanceof z.ZodDefault) {
            return this.toStrictJsonSchema(zodSchema.removeDefault());
        }
        // Fallback sicuro per tipi generici
        return { type: "string" };
    }
    /**
     * Decodifica deterministica: esegue il parsing e la validazione rispetto allo schema Zod.
     * Lancia un errore dettagliato se il parsing fallisce.
     */
    static decode(raw, schema, options) {
        const allowRepair = options?.allowRepair ?? true;
        let textToParse = raw;
        let hadRepair = false;
        if (allowRepair) {
            const { jsonStr, hadMarkdownFences } = this.cleanAndExtractJson(raw);
            textToParse = jsonStr;
            hadRepair = hadMarkdownFences;
        }
        let parsedJson;
        try {
            parsedJson = JSON.parse(textToParse);
        }
        catch (err) {
            throw new ConstrainedDecodingError(`Errore di sintassi JSON durante la decodifica vincolata: ${err.message}`, [err.message], raw);
        }
        const validation = schema.safeParse(parsedJson);
        if (!validation.success) {
            const issues = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
            throw new ConstrainedDecodingError(`Violazione dello schema Zod vincolato: ${issues.join("; ")}`, issues, raw);
        }
        return validation.data;
    }
    /**
     * Decodifica sicura che restituisce un oggetto conforme a ConstrainedDecodingResultSchema
     * senza lanciare eccezioni.
     */
    static safeDecode(raw, schema, options) {
        try {
            const { hadMarkdownFences } = this.cleanAndExtractJson(raw);
            const data = this.decode(raw, schema, options);
            return ConstrainedDecodingResultSchema.parse({
                success: true,
                data,
                rawOutput: raw,
                parsingErrors: [],
                repairedMarkdownFences: hadMarkdownFences,
            });
        }
        catch (err) {
            const parsingErrors = err instanceof ConstrainedDecodingError ? err.parsingErrors : [err.message || String(err)];
            return ConstrainedDecodingResultSchema.parse({
                success: false,
                rawOutput: raw,
                parsingErrors,
                repairedMarkdownFences: false,
            });
        }
    }
    /**
     * Genera la configurazione API per OpenAI Structured Outputs (strict: true).
     */
    static getOpenAiStrictConfig(schema, schemaName = "ConstrainedResponse") {
        return {
            type: "json_schema",
            json_schema: {
                name: schemaName,
                strict: true,
                schema: this.toStrictJsonSchema(schema),
            },
        };
    }
    /**
     * Genera la configurazione API per Anthropic Tool Forcing deterministico.
     */
    static getAnthropicForcedToolConfig(toolName, schema) {
        return {
            tools: [
                {
                    name: toolName,
                    description: `Schema vincolato deterministico per ${toolName}`,
                    input_schema: this.toStrictJsonSchema(schema),
                },
            ],
            tool_choice: {
                type: "tool",
                name: toolName,
            },
        };
    }
}
//# sourceMappingURL=constrained-decoder.js.map