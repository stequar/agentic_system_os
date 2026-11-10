import { z } from "zod";
export declare const CacheProviderSchema: z.ZodEnum<["anthropic", "openai", "gemini", "generic"]>;
export declare const PromptCacheMarkerSchema: z.ZodObject<{
    type: z.ZodEnum<["ephemeral", "static", "none"]>;
    position: z.ZodEnum<["tier1_end", "tier2_end", "none"]>;
}, "strip", z.ZodTypeAny, {
    type: "ephemeral" | "static" | "none";
    position: "none" | "tier1_end" | "tier2_end";
}, {
    type: "ephemeral" | "static" | "none";
    position: "none" | "tier1_end" | "tier2_end";
}>;
export declare const TwoTierPromptBundleSchema: z.ZodObject<{
    tier1UniversalPrefix: z.ZodString;
    tier2RoleDomain: z.ZodString;
    tier3TaskSuffix: z.ZodOptional<z.ZodString>;
    estimatedTier1Tokens: z.ZodNumber;
    estimatedTotalTokens: z.ZodNumber;
    sha256Tier1: z.ZodString;
    roleId: z.ZodString;
    level: z.ZodEnum<["L1", "L2", "L3"]>;
}, "strip", z.ZodTypeAny, {
    level: "L2" | "L3" | "L1";
    tier1UniversalPrefix: string;
    tier2RoleDomain: string;
    estimatedTier1Tokens: number;
    estimatedTotalTokens: number;
    sha256Tier1: string;
    roleId: string;
    tier3TaskSuffix?: string | undefined;
}, {
    level: "L2" | "L3" | "L1";
    tier1UniversalPrefix: string;
    tier2RoleDomain: string;
    estimatedTier1Tokens: number;
    estimatedTotalTokens: number;
    sha256Tier1: string;
    roleId: string;
    tier3TaskSuffix?: string | undefined;
}>;
export declare const AnthropicCacheBlockSchema: z.ZodObject<{
    type: z.ZodLiteral<"text">;
    text: z.ZodString;
    cache_control: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"ephemeral">;
    }, "strip", z.ZodTypeAny, {
        type: "ephemeral";
    }, {
        type: "ephemeral";
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "text";
    text: string;
    cache_control?: {
        type: "ephemeral";
    } | undefined;
}, {
    type: "text";
    text: string;
    cache_control?: {
        type: "ephemeral";
    } | undefined;
}>;
export declare const AnthropicAdaptedPromptSchema: z.ZodObject<{
    system: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"text">;
        text: z.ZodString;
        cache_control: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"ephemeral">;
        }, "strip", z.ZodTypeAny, {
            type: "ephemeral";
        }, {
            type: "ephemeral";
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "text";
        text: string;
        cache_control?: {
            type: "ephemeral";
        } | undefined;
    }, {
        type: "text";
        text: string;
        cache_control?: {
            type: "ephemeral";
        } | undefined;
    }>, "many">;
    userContent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    system: {
        type: "text";
        text: string;
        cache_control?: {
            type: "ephemeral";
        } | undefined;
    }[];
    userContent?: string | undefined;
}, {
    system: {
        type: "text";
        text: string;
        cache_control?: {
            type: "ephemeral";
        } | undefined;
    }[];
    userContent?: string | undefined;
}>;
export declare const OpenAiAdaptedPromptSchema: z.ZodObject<{
    systemMessage: z.ZodString;
    userMessage: z.ZodOptional<z.ZodString>;
    isPrefixEligible: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    systemMessage: string;
    isPrefixEligible: boolean;
    userMessage?: string | undefined;
}, {
    systemMessage: string;
    userMessage?: string | undefined;
    isPrefixEligible?: boolean | undefined;
}>;
export declare const GeminiAdaptedPromptSchema: z.ZodObject<{
    systemInstruction: z.ZodString;
    userContent: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userContent: string;
    systemInstruction: string;
}, {
    userContent: string;
    systemInstruction: string;
}>;
export declare const AdaptedPromptPayloadSchema: z.ZodObject<{
    provider: z.ZodEnum<["anthropic", "openai", "gemini", "generic"]>;
    anthropic: z.ZodOptional<z.ZodObject<{
        system: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"text">;
            text: z.ZodString;
            cache_control: z.ZodOptional<z.ZodObject<{
                type: z.ZodLiteral<"ephemeral">;
            }, "strip", z.ZodTypeAny, {
                type: "ephemeral";
            }, {
                type: "ephemeral";
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }, {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }>, "many">;
        userContent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        system: {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }[];
        userContent?: string | undefined;
    }, {
        system: {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }[];
        userContent?: string | undefined;
    }>>;
    openai: z.ZodOptional<z.ZodObject<{
        systemMessage: z.ZodString;
        userMessage: z.ZodOptional<z.ZodString>;
        isPrefixEligible: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        systemMessage: string;
        isPrefixEligible: boolean;
        userMessage?: string | undefined;
    }, {
        systemMessage: string;
        userMessage?: string | undefined;
        isPrefixEligible?: boolean | undefined;
    }>>;
    gemini: z.ZodOptional<z.ZodObject<{
        systemInstruction: z.ZodString;
        userContent: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userContent: string;
        systemInstruction: string;
    }, {
        userContent: string;
        systemInstruction: string;
    }>>;
    estimatedCacheHitRate: z.ZodNumber;
    sha256Tier1: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sha256Tier1: string;
    provider: "anthropic" | "openai" | "gemini" | "generic";
    estimatedCacheHitRate: number;
    anthropic?: {
        system: {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }[];
        userContent?: string | undefined;
    } | undefined;
    openai?: {
        systemMessage: string;
        isPrefixEligible: boolean;
        userMessage?: string | undefined;
    } | undefined;
    gemini?: {
        userContent: string;
        systemInstruction: string;
    } | undefined;
}, {
    sha256Tier1: string;
    provider: "anthropic" | "openai" | "gemini" | "generic";
    estimatedCacheHitRate: number;
    anthropic?: {
        system: {
            type: "text";
            text: string;
            cache_control?: {
                type: "ephemeral";
            } | undefined;
        }[];
        userContent?: string | undefined;
    } | undefined;
    openai?: {
        systemMessage: string;
        userMessage?: string | undefined;
        isPrefixEligible?: boolean | undefined;
    } | undefined;
    gemini?: {
        userContent: string;
        systemInstruction: string;
    } | undefined;
}>;
export type CacheProvider = z.infer<typeof CacheProviderSchema>;
export type PromptCacheMarker = z.infer<typeof PromptCacheMarkerSchema>;
export type TwoTierPromptBundle = z.infer<typeof TwoTierPromptBundleSchema>;
export type AnthropicCacheBlock = z.infer<typeof AnthropicCacheBlockSchema>;
export type AnthropicAdaptedPrompt = z.infer<typeof AnthropicAdaptedPromptSchema>;
export type OpenAiAdaptedPrompt = z.infer<typeof OpenAiAdaptedPromptSchema>;
export type GeminiAdaptedPrompt = z.infer<typeof GeminiAdaptedPromptSchema>;
export type AdaptedPromptPayload = z.infer<typeof AdaptedPromptPayloadSchema>;
//# sourceMappingURL=prompts.d.ts.map