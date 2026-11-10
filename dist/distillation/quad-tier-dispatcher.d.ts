import type { CtoOperatingMode } from "../contracts/workflow-eval.js";
import type { SpecializedSlmDomain } from "./harvester.js";
import { type HostHardwareProfile } from "./local-slm-adapter.js";
export type InferenceTier = "TIER_0_KAHNEMAN_GATE" | "TIER_1_LOCAL_SLM" | "TIER_2_CLOUD_WORKHORSE" | "TIER_3_DEEP_REASONING";
export interface QuadTierDispatchRequest {
    prompt: string;
    domain?: SpecializedSlmDomain | "GENERAL_ARCHITECTURE" | "MULTI_FILE_FEATURE";
    complexityScore?: number;
    activeCtoMode?: CtoOperatingMode;
    isWarRoomIncident?: boolean;
    targetFiles?: string[];
    command?: string;
    targetFilePathForProof?: string;
    targetSymbolForProof?: string;
    timeoutMs?: number;
    hardwareOverride?: {
        totalMemoryBytes?: number;
        cpuCores?: number;
        arch?: string;
        platform?: string;
    };
    mockInstalledModels?: string[];
    simulatedSlmOutput?: string;
    simulatedSlmLatencyMs?: number;
}
export interface QuadTierDispatchResult {
    initialTier: InferenceTier;
    finalTier: InferenceTier;
    modelSelected: string;
    hardwareProfile: HostHardwareProfile;
    speculativeVerificationPassed: boolean;
    speculativeEscalated: boolean;
    escalationReason?: string;
    output: string;
    latencyMs: number;
    cloudCostUsd: number;
    estimatedCloudSavingsUsd: number;
}
/**
 * Esegue il routing e l'esecuzione gerarchica a 4 livelli (Quad-Tier Speculative Swarm):
 * - Tier 0: Kahneman System-1 Gate (<2ms, $0)
 * - Tier 1: Local SLM (Qwen3 / Gemma 3 / Phi-4-Mini) + Speculative Formal Prover Gate ($0 Cloud)
 * - Tier 2: Cloud SOTA Workhorse (Claude Sonnet / GPT-4o con Two-Tier Cache)
 * - Tier 3: Deep Reasoning Frontier (riservato a MODE_2_INVESTIGATE_RCA, MODE_3_RND_ROUNDTABLE e War Room)
 */
export declare function dispatchQuadTierInference(request: QuadTierDispatchRequest): Promise<QuadTierDispatchResult>;
//# sourceMappingURL=quad-tier-dispatcher.d.ts.map