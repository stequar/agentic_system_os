import { z } from "zod";
import { DynamicMcpToolSchema, } from "../contracts/frontiers.js";
/**
 * Definizione di un singolo campo di input per la sintesi JIT di un tool MCP.
 */
export const CapabilityInputFieldSchema = z.object({
    type: z.enum(["string", "number", "boolean", "array", "object"]).default("string"),
    description: z.string().optional(),
    required: z.boolean().optional().default(true),
});
/**
 * Schema di richiesta per colmare un Capability Gap tramite sintesi JIT di un tool MCP.
 */
export const CapabilityGapRequestSchema = z.object({
    taskDescription: z.string().min(5).describe("Descrizione del task operativo che ha evidenziato il gap"),
    missingCapability: z.string().min(3).optional().describe("Capacità specifica mancante identificata dall'agente L2"),
    suggestedToolName: z.string().min(3).optional().describe("Nome suggerito per il tool dinamico"),
    description: z.string().min(10).optional().describe("Descrizione semantica del tool per il catalogo MCP"),
    inputFields: z.record(CapabilityInputFieldSchema).optional().default({}),
    inputSchemaJson: z.string().optional().describe("JSON Schema esplicito opzionale in formato stringa"),
    permissions: z.array(z.string()).optional().default([]),
    ttlSeconds: z.number().int().positive().optional().default(3600),
    generatedByRole: z.string().optional().default("ai_lead"),
    sandboxType: z.enum(["NODE_WORKER", "WASM_SANDBOX", "IN_PROCESS_RESTRICTED"]).optional().default("NODE_WORKER"),
    handlerBody: z.string().optional().describe("Corpo custom opzionale della funzione handler ESM"),
});
/**
 * Report strutturato restituito dal Capability Gap Detector.
 */
export const CapabilityGapReportSchema = z.object({
    hasGap: z.boolean(),
    matchedToolName: z.string().optional(),
    suggestedToolName: z.string(),
    reason: z.string(),
    requiredPermissions: z.array(z.string()),
});
const STOP_WORDS = new Set([
    "the", "and", "for", "with", "from", "into", "that", "this", "una", "uno",
    "per", "con", "del", "della", "dei", "degli", "nel", "nella", "sul", "sulla",
    "che", "non", "sono", "come", "più", "tool", "use", "using", "need", "task",
]);
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, " ")
        .split(/\s+/)
        .filter((tok) => tok.length >= 3 && !STOP_WORDS.has(tok));
}
function toSnakeCaseIdentifier(raw) {
    const tokens = tokenize(raw).slice(0, 4);
    if (tokens.length === 0) {
        return "custom_synthesized_helper";
    }
    const joined = tokens.join("_").replace(/[^a-z0-9_]/g, "");
    return joined.length >= 3 ? joined : `${joined}_tool`;
}
function inferPermissionsFromTask(taskDescription) {
    const lower = taskDescription.toLowerCase();
    const perms = new Set();
    if (/\b(http|https|fetch|network|loopback|endpoint|api|rest|socket)\b/.test(lower)) {
        perms.add("network:loopback");
    }
    if (/\b(write file|save file|writefilesync|fs:write|scrivi file|salva su disco)\b/.test(lower)) {
        perms.add("fs:write");
    }
    if (/\b(read file|fs:read|parquet|sqlite|schema file|leggi file)\b/.test(lower)) {
        perms.add("fs:read");
    }
    if (/\b(process\.env|env:read|environment variable)\b/.test(lower)) {
        perms.add("env:read");
    }
    return Array.from(perms);
}
/**
 * Analizza se i tool attuali nel catalogo coprono il task richiesto o se occorre
 * sintetizzare un tool JIT, restituendo un report strutturato deterministico.
 */
export function detectCapabilityGap(taskDescription, availableTools) {
    const normalizedTask = taskDescription.trim();
    const taskTokens = tokenize(normalizedTask);
    const requiredPermissions = inferPermissionsFromTask(normalizedTask);
    let bestTool;
    let bestScore = 0;
    for (const tool of availableTools) {
        const toolTokens = new Set(tokenize(`${tool.name} ${tool.description}`));
        if (toolTokens.size === 0 || taskTokens.length === 0)
            continue;
        // Verifica match diretto sul nome del tool
        const normalizedToolName = tool.name.toLowerCase();
        if (normalizedTask.toLowerCase().includes(normalizedToolName)) {
            bestTool = tool;
            bestScore = 1;
            break;
        }
        let overlap = 0;
        for (const token of taskTokens) {
            if (toolTokens.has(token)) {
                overlap += 1;
            }
        }
        const ratio = overlap / Math.min(taskTokens.length, Math.max(2, toolTokens.size));
        if (overlap >= 2 && ratio > bestScore) {
            bestScore = ratio;
            bestTool = tool;
        }
    }
    if (bestTool && bestScore >= 0.5) {
        return CapabilityGapReportSchema.parse({
            hasGap: false,
            matchedToolName: bestTool.name,
            suggestedToolName: bestTool.name,
            reason: `Capability coperta dal tool esistente '${bestTool.name}' (compatibilità semantica: ${Math.round(bestScore * 100)}%).`,
            requiredPermissions,
        });
    }
    const baseName = toSnakeCaseIdentifier(normalizedTask);
    const suggestedToolName = baseName.startsWith("jit_") ? baseName : `jit_${baseName}`;
    return CapabilityGapReportSchema.parse({
        hasGap: true,
        suggestedToolName,
        reason: `Nessun tool nel catalogo corrente copre il task richiesto ('${normalizedTask.slice(0, 80)}'). Sintesi JIT necessaria.`,
        requiredPermissions,
    });
}
/**
 * Costruisce la stringa JSON Schema draft-07 a partire dai campi dichiarati.
 */
function buildInputSchemaJson(req) {
    if (req.inputSchemaJson) {
        // Verifica che sia JSON valido
        const parsed = JSON.parse(req.inputSchemaJson);
        return JSON.stringify(parsed);
    }
    const properties = {};
    const required = [];
    const entries = Object.entries(req.inputFields ?? {});
    if (entries.length === 0) {
        properties.query = {
            type: "string",
            description: "Input principale per il tool dinamico sintetizzato",
        };
        required.push("query");
    }
    else {
        for (const [fieldName, fieldSpec] of entries) {
            properties[fieldName] = {
                type: fieldSpec.type,
                ...(fieldSpec.description ? { description: fieldSpec.description } : {}),
            };
            if (fieldSpec.required !== false) {
                required.push(fieldName);
            }
        }
    }
    const schemaObj = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties,
        required,
        additionalProperties: false,
    };
    return JSON.stringify(schemaObj);
}
/**
 * Sintetizza un tool MCP dinamico conforme a DynamicMcpToolSchema e genera il
 * relativo codice sorgente ESM eseguibile nella sandbox Worker Threads.
 */
export function synthesizeDynamicMcpTool(req) {
    const parsed = CapabilityGapRequestSchema.parse(req);
    const rawName = parsed.suggestedToolName ||
        parsed.missingCapability ||
        toSnakeCaseIdentifier(parsed.taskDescription);
    const cleanName = rawName
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");
    const finalName = cleanName.length >= 3 ? cleanName : `jit_${cleanName || "tool"}`;
    const toolId = finalName.startsWith("tool_dyn_")
        ? finalName
        : `tool_dyn_${finalName.replace(/^jit_/, "")}`;
    const rawDescription = parsed.description ||
        `Dynamic JIT MCP tool for: ${parsed.missingCapability ? `${parsed.missingCapability} — ` : ""}${parsed.taskDescription}`;
    const finalDescription = rawDescription.length >= 10
        ? rawDescription
        : `${rawDescription} (synthesized JIT tool)`;
    const inputSchemaJson = buildInputSchemaJson(parsed);
    const inferredPerms = parsed.permissions && parsed.permissions.length > 0
        ? parsed.permissions
        : inferPermissionsFromTask(parsed.taskDescription);
    const tool = DynamicMcpToolSchema.parse({
        toolId,
        name: finalName,
        description: finalDescription,
        generatedByRole: parsed.generatedByRole,
        sandboxType: parsed.sandboxType,
        permissions: inferredPerms,
        inputSchemaJson,
        ttlSeconds: parsed.ttlSeconds,
        status: "SYNTHESIZED",
    });
    const customOrDefaultBody = parsed.handlerBody
        ? parsed.handlerBody.trim()
        : `return {
    ok: true,
    toolId: ${JSON.stringify(tool.toolId)},
    toolName: ${JSON.stringify(tool.name)},
    processedInput: input,
    synthesizedFor: ${JSON.stringify(parsed.missingCapability || parsed.taskDescription)},
  };`;
    const code = `// Auto-synthesized JIT MCP Tool: ${tool.toolId}
const INPUT_SCHEMA = ${inputSchemaJson};

function validateInputAgainstSchema(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid input payload: expected a non-null JSON object");
  }
  const props = INPUT_SCHEMA.properties || {};
  const required = Array.isArray(INPUT_SCHEMA.required) ? INPUT_SCHEMA.required : [];

  for (const reqKey of required) {
    if (!(reqKey in input) || input[reqKey] === undefined || input[reqKey] === null) {
      throw new Error(\`Missing required input field: '\${reqKey}'\`);
    }
  }

  for (const [key, propSchema] of Object.entries(props)) {
    if (key in input && input[key] !== undefined && input[key] !== null) {
      const val = input[key];
      const expectedType = propSchema.type;
      if (expectedType === "array") {
        if (!Array.isArray(val)) {
          throw new Error(\`Invalid type for field '\${key}': expected array\`);
        }
      } else if (expectedType === "object") {
        if (typeof val !== "object" || Array.isArray(val)) {
          throw new Error(\`Invalid type for field '\${key}': expected object\`);
        }
      } else if (expectedType && typeof val !== expectedType) {
        throw new Error(\`Invalid type for field '\${key}': expected \${expectedType}, got \${typeof val}\`);
      }
    }
  }
}

export async function handleDynamicTool(input = {}, context = {}) {
  validateInputAgainstSchema(input);
  ${customOrDefaultBody}
}

export async function execute(input = {}, context = {}) {
  return handleDynamicTool(input, context);
}

export default handleDynamicTool;
`;
    return { tool, code };
}
//# sourceMappingURL=synthesizer.js.map