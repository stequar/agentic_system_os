export interface CoreKernelOptions {
    roleId: string;
    roleName: string;
    level: "L2" | "L3";
    description: string;
    targetLanguages: string[];
    targetFrameworks: string[];
    recommendedTestCommand?: string;
    enableSubagents: boolean;
    enableWriteTools: boolean;
    domainRules?: string[];
    wikiIndexPath?: string;
}
/**
 * Generates the Karpathy "Context as RAM" section for the modular kernel prompt.
 */
export declare function buildContextAsRamSection(wikiIndexPath?: string): string;
/**
 * Generates the Deterministic Gatekeeper section for the modular kernel prompt.
 */
export declare function buildGatekeeperSection(recommendedTestCommand?: string): string;
/**
 * Generates the delegation / execution protocol section for subagents.
 */
export declare function buildSubagentsProtocolSection(level: "L2" | "L3", enableSubagents: boolean): string;
/**
 * Builds the complete modular Karpathy Context as RAM system prompt.
 */
export declare function buildCoreKernelPrompt(options: CoreKernelOptions): string;
import { UNIVERSAL_TIER1_PREFIX, getUniversalTier1Sha256, estimateTokenCount, buildTwoTierPromptBundle } from "./cached-kernel.js";
export { UNIVERSAL_TIER1_PREFIX, getUniversalTier1Sha256, estimateTokenCount, buildTwoTierPromptBundle, };
/**
 * Costruisce il system prompt a Due Livelli con Prefisso Universale Immutabile (Tier 1 a token 0)
 * per garantire prefix caching deterministico.
 */
export declare function buildTwoTierKernelPrompt(options: CoreKernelOptions, taskSuffix?: string): string;
//# sourceMappingURL=core-kernel.d.ts.map