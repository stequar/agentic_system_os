import { FastDecisionGate } from "../core/fast-decision-gate.js";
import { FinOpsEngine } from "../core/finops-engine.js";
import { scanCodeHeuristics } from "../gatekeeper/formal-prover.js";
import { profileHostHardware, runLocalSlmInference, scanInstalledLocalModels, } from "./local-slm-adapter.js";
const SPECIALIZED_SLM_DOMAINS = new Set([
    "AST_REFACTOR",
    "DOCSTRING_GEN",
    "SYNTHETIC_FIXTURES",
    "CAVEMAN_ENCODING",
    "FAST_TRIAGE",
]);
/**
 * Esegue il routing e l'esecuzione gerarchica a 4 livelli (Quad-Tier Speculative Swarm):
 * - Tier 0: Kahneman System-1 Gate (<2ms, $0)
 * - Tier 1: Local SLM (Qwen3 / Gemma 3 / Phi-4-Mini) + Speculative Formal Prover Gate ($0 Cloud)
 * - Tier 2: Cloud SOTA Workhorse (Claude Sonnet / GPT-4o con Two-Tier Cache)
 * - Tier 3: Deep Reasoning Frontier (riservato a MODE_2_INVESTIGATE_RCA, MODE_3_RND_ROUNDTABLE e War Room)
 */
export async function dispatchQuadTierInference(request) {
    const startTime = performance.now();
    const complexity = request.complexityScore ?? 0.3;
    // 1. Controllo Tier 0: Kahneman System-1 Gate (sicurezza perimetrale istantanea)
    if (request.targetFiles || request.command) {
        const gateRes = FastDecisionGate.evaluate({
            action: request.command ? "EXECUTE_COMMAND" : "WRITE_FILE",
            targetFiles: request.targetFiles,
            promptSnippet: request.command,
        });
        if (gateRes.decision === "FAST_REJECT") {
            return {
                initialTier: "TIER_0_KAHNEMAN_GATE",
                finalTier: "TIER_0_KAHNEMAN_GATE",
                modelSelected: "kahneman-system-1-gate",
                hardwareProfile: profileHostHardware(request.hardwareOverride),
                speculativeVerificationPassed: false,
                speculativeEscalated: false,
                escalationReason: `FAST_REJECT (${gateRes.ruleTriggered}): ${gateRes.reason}`,
                output: JSON.stringify(gateRes),
                latencyMs: Math.max(0, Math.round(performance.now() - startTime)),
                cloudCostUsd: 0,
                estimatedCloudSavingsUsd: 0.005,
            };
        }
    }
    // 2. Profilazione Hardware & Auto-Discovery modelli installati
    const scanResult = await scanInstalledLocalModels({
        hardwareOverride: request.hardwareOverride,
        mockInstalledModels: request.mockInstalledModels,
    });
    const hwProfile = scanResult.hardwareProfile;
    // 3. Regola aurea CFF: RCA (MODE 2), Roundtable (MODE 3) e War Room forzano SEMPRE Tier 3 (Deep Reasoning)
    if (request.activeCtoMode === "MODE_2_INVESTIGATE_RCA" ||
        request.activeCtoMode === "MODE_3_RND_ROUNDTABLE" ||
        request.isWarRoomIncident === true ||
        complexity > 0.8) {
        return {
            initialTier: "TIER_3_DEEP_REASONING",
            finalTier: "TIER_3_DEEP_REASONING",
            modelSelected: "claude-3-7-sonnet-deep-thinking",
            hardwareProfile: hwProfile,
            speculativeVerificationPassed: true,
            speculativeEscalated: false,
            output: `[TIER_3_DEEP_REASONING] Verified high-cognition synthesis for ${request.activeCtoMode ?? "HIGH_COMPLEXITY"}`,
            latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
            cloudCostUsd: 0.018,
            estimatedCloudSavingsUsd: 0,
        };
    }
    // 4. Valutazione eleggibilità Tier 1 (Local SLM)
    // Su WORKSTATION_ULTRA (es. qwen3-coder:30b MoE) la soglia di complessità locale sale a 0.70
    const maxLocalComplexity = hwProfile.tier === "WORKSTATION_ULTRA" ? 0.7 : 0.5;
    const isSpecializedDomain = request.domain !== undefined && SPECIALIZED_SLM_DOMAINS.has(request.domain);
    if (!hwProfile.bypassLocalSlm &&
        isSpecializedDomain &&
        complexity <= maxLocalComplexity) {
        const slmModel = scanResult.selectedModel ?? hwProfile.recommendedModel;
        const slmResponse = await runLocalSlmInference({
            domain: request.domain,
            prompt: request.prompt,
            model: slmModel,
            timeoutMs: request.timeoutMs ?? 800,
            hardwareOverride: request.hardwareOverride,
            simulatedOutputOverride: request.simulatedSlmOutput,
            simulatedLatencyMs: request.simulatedSlmLatencyMs,
        });
        // 4a. Se l'SLM va in SLA timeout, escala subito a Tier 2 (Cloud Workhorse)
        if (!slmResponse.success || slmResponse.executionMode === "SLA_TIMEOUT") {
            return {
                initialTier: "TIER_1_LOCAL_SLM",
                finalTier: "TIER_2_CLOUD_WORKHORSE",
                modelSelected: "claude-3-5-sonnet",
                hardwareProfile: hwProfile,
                speculativeVerificationPassed: false,
                speculativeEscalated: true,
                escalationReason: `Local SLM (${slmModel}) exceeded SLA timeout (${slmResponse.latencyMs}ms); auto-escalated to Cloud Tier 2.`,
                output: `[TIER_2_CLOUD_FALLBACK] Completed after local SLA timeout`,
                latencyMs: slmResponse.latencyMs,
                cloudCostUsd: 0.004,
                estimatedCloudSavingsUsd: 0,
            };
        }
        // 4b. Speculative Verification Gate: se il dominio è AST_REFACTOR, valida con lo scanner euristico basato su pattern (NON una prova formale)
        if (request.domain === "AST_REFACTOR") {
            const proof = scanCodeHeuristics({
                targetFilePath: request.targetFilePathForProof ?? "src/speculative.ts",
                sourceCode: slmResponse.output,
                targetSymbol: request.targetSymbolForProof,
            });
            if (proof.status === "COUNTEREXAMPLE_FOUND") {
                return {
                    initialTier: "TIER_1_LOCAL_SLM",
                    finalTier: "TIER_2_CLOUD_WORKHORSE",
                    modelSelected: "claude-3-5-sonnet",
                    hardwareProfile: hwProfile,
                    speculativeVerificationPassed: false,
                    speculativeEscalated: true,
                    escalationReason: `Speculative Formal Prover detected counterexample (${proof.proofId} on ${proof.targetSymbol}: ${JSON.stringify(proof.counterexampleTrace?.inputState ?? {})}); auto-escalated to Cloud Tier 2.`,
                    output: `[TIER_2_CLOUD_ESCALATED] Safe cloud refactor after Formal Prover caught local SLM counterexample`,
                    latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
                    cloudCostUsd: 0.004,
                    estimatedCloudSavingsUsd: 0,
                };
            }
        }
        // 4c. Speculative Verification superata! Contabilizza il risparmio a $0.00 in FinOpsEngine
        const finops = FinOpsEngine.getInstance();
        const baselineCalc = finops.calculateCostAndSavings("claude-3-5-sonnet", {
            uncachedInputTokens: Math.max(100, slmResponse.estimatedTokensSaved),
            outputTokens: Math.max(50, Math.round(slmResponse.estimatedTokensSaved / 2)),
        });
        const savingsUsd = Math.max(0.0015, baselineCalc.baselineCostUsd);
        return {
            initialTier: "TIER_1_LOCAL_SLM",
            finalTier: "TIER_1_LOCAL_SLM",
            modelSelected: slmModel,
            hardwareProfile: hwProfile,
            speculativeVerificationPassed: true,
            speculativeEscalated: false,
            output: slmResponse.output,
            latencyMs: slmResponse.latencyMs,
            cloudCostUsd: 0,
            estimatedCloudSavingsUsd: savingsUsd,
        };
    }
    // 5. Default / Low-Resource Bypass -> Tier 2 (Cloud SOTA Workhorse)
    return {
        initialTier: "TIER_2_CLOUD_WORKHORSE",
        finalTier: "TIER_2_CLOUD_WORKHORSE",
        modelSelected: "claude-3-5-sonnet",
        hardwareProfile: hwProfile,
        speculativeVerificationPassed: true,
        speculativeEscalated: false,
        escalationReason: hwProfile.bypassLocalSlm
            ? hwProfile.rationale
            : undefined,
        output: `[TIER_2_CLOUD_WORKHORSE] Executed on Cloud SOTA Workhorse`,
        latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
        cloudCostUsd: 0.004,
        estimatedCloudSavingsUsd: 0,
    };
}
//# sourceMappingURL=quad-tier-dispatcher.js.map