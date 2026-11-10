import {
  type TwoTierPromptBundle,
  type CacheProvider,
  type AdaptedPromptPayload,
  type AnthropicAdaptedPrompt,
  type OpenAiAdaptedPrompt,
  type GeminiAdaptedPrompt,
  AdaptedPromptPayloadSchema,
} from "../contracts/prompts.js";

export class PromptCacheAdapter {
  /**
   * Adatta il TwoTierPromptBundle per l'API di Anthropic Claude.
   * Inietta il breakpoint esplicito `cache_control: { type: "ephemeral" }`
   * alla fine del blocco Tier 1 (Universal Prefix) per attivare il Prompt Caching.
   */
  static formatForAnthropic(
    bundle: TwoTierPromptBundle,
    options?: { taskMessage?: string }
  ): AnthropicAdaptedPrompt {
    const userContent = options?.taskMessage || bundle.tier3TaskSuffix;

    return {
      system: [
        {
          type: "text",
          text: bundle.tier1UniversalPrefix,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: bundle.tier2RoleDomain,
        },
      ],
      userContent,
    };
  }

  /**
   * Adatta il TwoTierPromptBundle per l'API di OpenAI (GPT-4o, o1, o3-mini).
   * Sfrutta l'Automatic Prefix Caching di OpenAI: avendo il Tier 1 invariante
   * byte-identico a token 0 (>1024 token), tutte le chiamate multi-ruolo colpiscono la cache.
   */
  static formatForOpenAi(
    bundle: TwoTierPromptBundle,
    options?: { taskMessage?: string }
  ): OpenAiAdaptedPrompt {
    const systemMessage = `${bundle.tier1UniversalPrefix}\n\n${bundle.tier2RoleDomain}`;
    const userMessage = options?.taskMessage || bundle.tier3TaskSuffix;

    return {
      systemMessage,
      userMessage,
      isPrefixEligible: bundle.estimatedTier1Tokens >= 1024,
    };
  }

  /**
   * Adatta il TwoTierPromptBundle per Google Gemini (Gemini 1.5 Pro/Flash, 2.0).
   * Colloca il Tier 1 invariante nel blocco dedicato `systemInstruction`.
   */
  static formatForGemini(
    bundle: TwoTierPromptBundle,
    options?: { taskMessage?: string }
  ): GeminiAdaptedPrompt {
    const userContent = `${bundle.tier2RoleDomain}${
      bundle.tier3TaskSuffix ? `\n\n${bundle.tier3TaskSuffix}` : ""
    }${options?.taskMessage ? `\n\n${options.taskMessage}` : ""}`;

    return {
      systemInstruction: bundle.tier1UniversalPrefix,
      userContent,
    };
  }

  /**
   * Adatta il bundle al provider richiesto restituendo un payload validato da Zod.
   */
  static adapt(
    bundle: TwoTierPromptBundle,
    provider: CacheProvider,
    options?: { taskMessage?: string }
  ): AdaptedPromptPayload {
    const payload: Partial<AdaptedPromptPayload> = {
      provider,
      sha256Tier1: bundle.sha256Tier1,
      estimatedCacheHitRate: bundle.estimatedTier1Tokens >= 1024 ? 0.85 : 0.0,
    };

    switch (provider) {
      case "anthropic":
        payload.anthropic = this.formatForAnthropic(bundle, options);
        break;
      case "openai":
        payload.openai = this.formatForOpenAi(bundle, options);
        break;
      case "gemini":
        payload.gemini = this.formatForGemini(bundle, options);
        break;
      case "generic":
      default:
        payload.openai = this.formatForOpenAi(bundle, options);
        break;
    }

    return AdaptedPromptPayloadSchema.parse(payload);
  }
}
