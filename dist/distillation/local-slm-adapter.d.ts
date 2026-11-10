import type { QuantizationFormat, SpecializedSlmDomain } from "./harvester.js";
export type HardwareProfileTier = "LOW_RESOURCE_BYPASS" | "COMPACT_EDGE" | "BALANCED_PRO" | "WORKSTATION_ULTRA";
export interface HostHardwareProfile {
    tier: HardwareProfileTier;
    totalMemoryGb: number;
    cpuCores: number;
    arch: string;
    platform: string;
    isAppleSilicon: boolean;
    bypassLocalSlm: boolean;
    recommendedModel: string;
    candidateModels: string[];
    preferredQuantization: QuantizationFormat;
    maxAllowedModelParamsB: number;
    rationale: string;
}
export interface InstalledModelScanResult {
    daemonReachable: boolean;
    installedModels: string[];
    selectedModel: string | null;
    hardwareProfile: HostHardwareProfile;
    selectionSource: "INSTALLED_MATCH" | "HARDWARE_DEFAULT" | "BYPASSED_LOW_RESOURCE";
}
export interface LocalSlmInferenceRequest {
    domain: SpecializedSlmDomain;
    prompt: string;
    model?: string;
    baseUrl?: string;
    timeoutMs?: number;
    hardwareOverride?: {
        totalMemoryBytes?: number;
        cpuCores?: number;
        arch?: string;
        platform?: string;
    };
    simulatedOutputOverride?: string;
    simulatedLatencyMs?: number;
}
export interface LocalSlmInferenceResponse {
    success: boolean;
    modelUsed: string;
    quantizationFormat: QuantizationFormat;
    executionMode: "LIVE_LOOPBACK_DAEMON" | "HERMETIC_IN_PROCESS_ENGINE" | "BYPASSED_LOW_RESOURCE" | "SLA_TIMEOUT";
    output: string;
    latencyMs: number;
    estimatedTokensSaved: number;
    /**
     * ONESTÀ (TCK-DH P2): true quando l'output proviene dal motore deterministico IN-PROCESS
     * (stringhe predefinite), NON da un vero modello. Ad oggi nessun percorso invoca realmente
     * un modello (si contatta solo `/api/tags` per elencare i modelli installati), quindi è
     * sempre true tranne un futuro percorso `LIVE_LOOPBACK_DAEMON` reale.
     */
    simulated?: boolean;
}
/**
 * Verifica che l'URL dell'endpoint SLM punti rigorosamente a loopback locale
 * (127.0.0.1, localhost, ::1) per impedire qualsiasi esfiltrazione di codice sorgente.
 */
export declare function isStrictLoopbackUrl(rawUrl: string): boolean;
/**
 * Stima la taglia in miliardi di parametri a partire dal tag del modello (es. "qwen3-coder:30b" -> 30).
 */
export declare function estimateModelParamsB(modelTag: string): number;
/**
 * Rileva le capacità hardware della macchina ospite e determina il profilo ottimale
 * (da LOW_RESOURCE_BYPASS con zero rallentamenti fino a WORKSTATION_ULTRA con qwen3-coder:30b MoE).
 */
export declare function profileHostHardware(override?: {
    totalMemoryBytes?: number;
    cpuCores?: number;
    arch?: string;
    platform?: string;
}): HostHardwareProfile;
/**
 * Ricerca i modelli locali già installati sulla macchina dell'utente (Ollama /api/tags o server /v1/models)
 * e seleziona automaticamente il miglior modello compatibile con il budget RAM della macchina.
 */
export declare function scanInstalledLocalModels(options?: {
    ollamaBaseUrl?: string;
    timeoutMs?: number;
    hardwareOverride?: {
        totalMemoryBytes?: number;
        cpuCores?: number;
        arch?: string;
        platform?: string;
    };
    mockInstalledModels?: string[];
}): Promise<InstalledModelScanResult>;
/**
 * Esegue un'inferenza locale Tier-1 con rispetto rigoroso del profilo hardware,
 * vincolo strict-loopback e SLA Timeout (default 800ms).
 */
export declare function runLocalSlmInference(request: LocalSlmInferenceRequest): Promise<LocalSlmInferenceResponse>;
//# sourceMappingURL=local-slm-adapter.d.ts.map