import { type TwoTierPromptBundle, type CacheProvider, type AdaptedPromptPayload, type AnthropicAdaptedPrompt, type OpenAiAdaptedPrompt, type GeminiAdaptedPrompt } from "../contracts/prompts.js";
export declare class PromptCacheAdapter {
    /**
     * Adatta il TwoTierPromptBundle per l'API di Anthropic Claude.
     * Inietta il breakpoint esplicito `cache_control: { type: "ephemeral" }`
     * alla fine del blocco Tier 1 (Universal Prefix) per attivare il Prompt Caching.
     */
    static formatForAnthropic(bundle: TwoTierPromptBundle, options?: {
        taskMessage?: string;
    }): AnthropicAdaptedPrompt;
    /**
     * Adatta il TwoTierPromptBundle per l'API di OpenAI (GPT-4o, o1, o3-mini).
     * Sfrutta l'Automatic Prefix Caching di OpenAI: avendo il Tier 1 invariante
     * byte-identico a token 0 (>1024 token), tutte le chiamate multi-ruolo colpiscono la cache.
     */
    static formatForOpenAi(bundle: TwoTierPromptBundle, options?: {
        taskMessage?: string;
    }): OpenAiAdaptedPrompt;
    /**
     * Adatta il TwoTierPromptBundle per Google Gemini (Gemini 1.5 Pro/Flash, 2.0).
     * Colloca il Tier 1 invariante nel blocco dedicato `systemInstruction`.
     */
    static formatForGemini(bundle: TwoTierPromptBundle, options?: {
        taskMessage?: string;
    }): GeminiAdaptedPrompt;
    /**
     * Adatta il bundle al provider richiesto restituendo un payload validato da Zod.
     */
    static adapt(bundle: TwoTierPromptBundle, provider: CacheProvider, options?: {
        taskMessage?: string;
    }): AdaptedPromptPayload;
}
//# sourceMappingURL=prompt-cache-adapter.d.ts.map