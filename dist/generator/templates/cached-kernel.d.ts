import { type TwoTierPromptBundle } from "../../contracts/prompts.js";
import type { CoreKernelOptions } from "./core-kernel.js";
/**
 * Funzione euristica per la stima conservativa dei token.
 * Nei modelli moderni (Anthropic, OpenAI o200k/cl100k, Gemini), 1 token corrisponde
 * mediamente a ~3.8 caratteri in contesti di codice e testo tecnico in italiano/inglese.
 */
import { estimateTokenCount } from "../../utils/tokens.js";
export { estimateTokenCount };
/**
 * TIER 1: Costituzione Universale Immutabile di Agentic Company OS.
 * Deve rimanere byte-identica a token 0 (>1024 token) per qualsiasi agente, ruolo
 * o sub-agente dell'azienda al fine di massimizzare il Cache Hit Rate (>80%)
 * su Anthropic (cache_control ephemeral), OpenAI (prefix caching) e Gemini (systemInstruction).
 */
export declare const UNIVERSAL_TIER1_PREFIX: string;
/**
 * Calcola l'hash crittografico SHA-256 del Tier 1 Prefix universale.
 */
export declare function getUniversalTier1Sha256(): string;
/**
 * Costruisce il blocco di dominio del ruolo aziendale (Tier 2).
 */
export declare function buildTier2RoleDomain(options: CoreKernelOptions): string;
/**
 * Genera il TwoTierPromptBundle completo e validato rispetto a TwoTierPromptBundleSchema.
 * Garantisce che Tier 1 sia invariante byte-per-byte per qualsiasi ruolo.
 */
export declare function buildTwoTierPromptBundle(options: CoreKernelOptions, taskSuffix?: string): TwoTierPromptBundle;
//# sourceMappingURL=cached-kernel.d.ts.map