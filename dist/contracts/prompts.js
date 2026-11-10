import { z } from "zod";
export const CacheProviderSchema = z.enum(["anthropic", "openai", "gemini", "generic"]);
export const PromptCacheMarkerSchema = z.object({
    type: z.enum(["ephemeral", "static", "none"]),
    position: z.enum(["tier1_end", "tier2_end", "none"]),
});
export const TwoTierPromptBundleSchema = z.object({
    tier1UniversalPrefix: z
        .string()
        .min(1000)
        .describe("Prefisso universale invariante byte-identico a token 0 (>1024 token)"),
    tier2RoleDomain: z.string().describe("Regole di dominio e ruolo specifiche"),
    tier3TaskSuffix: z.string().optional().describe("Contesto effimero del task corrente"),
    estimatedTier1Tokens: z.number().int().positive(),
    estimatedTotalTokens: z.number().int().positive(),
    sha256Tier1: z
        .string()
        .describe("Hash SHA-256 del Tier 1 per accertare l'identità byte-a-byte inter-ruolo"),
    roleId: z.string(),
    level: z.enum(["L1", "L2", "L3"]),
});
export const AnthropicCacheBlockSchema = z.object({
    type: z.literal("text"),
    text: z.string(),
    cache_control: z
        .object({
        type: z.literal("ephemeral"),
    })
        .optional(),
});
export const AnthropicAdaptedPromptSchema = z.object({
    system: z.array(AnthropicCacheBlockSchema),
    userContent: z.string().optional(),
});
export const OpenAiAdaptedPromptSchema = z.object({
    systemMessage: z.string(),
    userMessage: z.string().optional(),
    isPrefixEligible: z.boolean().default(true),
});
export const GeminiAdaptedPromptSchema = z.object({
    systemInstruction: z.string(),
    userContent: z.string(),
});
export const AdaptedPromptPayloadSchema = z.object({
    provider: CacheProviderSchema,
    anthropic: AnthropicAdaptedPromptSchema.optional(),
    openai: OpenAiAdaptedPromptSchema.optional(),
    gemini: GeminiAdaptedPromptSchema.optional(),
    estimatedCacheHitRate: z.number().min(0).max(1),
    sha256Tier1: z.string(),
});
//# sourceMappingURL=prompts.js.map