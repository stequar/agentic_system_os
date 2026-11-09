import { describe, it, expect } from "vitest";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { SlmDistillationTraceSchema } from "../src/contracts/frontiers.js";
import {
  filterHighFpyEpisodes,
  harvestHighFpyTrajectories,
  type CandidateTrajectoryEpisode,
} from "../src/distillation/harvester.js";
import {
  isStrictLoopbackUrl,
  profileHostHardware,
  scanInstalledLocalModels,
} from "../src/distillation/local-slm-adapter.js";
import { dispatchQuadTierInference } from "../src/distillation/quad-tier-dispatcher.js";
import { createMcpServer } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";

describe("Sprint 21: Zero-Cost Local SLM Distillation & Hierarchical Speculative Swarm", () => {
  describe("TCK-21.1: High-FPY Trajectory Harvester (Anti-Model-Collapse)", () => {
    it("filtra rigorosamente solo gli episodi con FPY=100% (0 retry di Self-Healing e firma Merkle valida)", async () => {
      const episodes: CandidateTrajectoryEpisode[] = [
        {
          episodeId: "EP-CLEAN-1",
          domain: "CAVEMAN_ENCODING",
          instruction: "Compress status update",
          inputContext: "Everything is working fine in the module.",
          verifiedOutput: "[CAVEMAN-RPC] MODULE:OK",
          gatekeeperPassed: true,
          selfHealingRetries: 0,
          merkleSignatureValid: true,
        },
        {
          episodeId: "EP-DIRTY-HEALED",
          domain: "CAVEMAN_ENCODING",
          instruction: "Compress status update 2",
          inputContext: "Needed two retries",
          verifiedOutput: "[CAVEMAN-RPC] RETRY:OK",
          gatekeeperPassed: true,
          selfHealingRetries: 2, // Scartato: ha richiesto Self-Healing
          merkleSignatureValid: true,
        },
        {
          episodeId: "EP-UNSIGNED",
          domain: "CAVEMAN_ENCODING",
          instruction: "Unsigned trajectory",
          inputContext: "Tampered",
          verifiedOutput: "[CAVEMAN-RPC] TAMPER",
          gatekeeperPassed: true,
          selfHealingRetries: 0,
          merkleSignatureValid: false, // Scartato: firma Merkle invalida
        },
      ];

      const filtered = filterHighFpyEpisodes(episodes, "CAVEMAN_ENCODING");
      expect(filtered.accepted).toHaveLength(1);
      expect(filtered.accepted[0]?.episodeId).toBe("EP-CLEAN-1");
      expect(filtered.rejectedCount).toBe(2);

      const harvestRes = await harvestHighFpyTrajectories({
        targetPath: process.cwd(),
        specializedDomain: "CAVEMAN_ENCODING",
        targetStudentModel: "qwen3:4b",
        candidateEpisodes: episodes,
      });

      expect(() =>
        SlmDistillationTraceSchema.parse(harvestRes.trace)
      ).not.toThrow();
      expect(harvestRes.trace.fpyVerificationRate).toBe(100);
      expect(harvestRes.trace.targetStudentModel).toBe("qwen3:4b");
      expect(harvestRes.datasetJsonl).toContain("EP-CLEAN-1");
      expect(harvestRes.datasetJsonl).not.toContain("EP-DIRTY-HEALED");
    });
  });

  describe("TCK-21.2: Hardware-Adaptive Profiling & Installed Local Model Auto-Discovery", () => {
    it("classifica correttamente le 4 fasce hardware (da LOW_RESOURCE_BYPASS a WORKSTATION_ULTRA)", () => {
      const GB = 1024 * 1024 * 1024;

      // 1. Macchina poco potente (4GB RAM): disattiva automaticamente gli SLM locali per evitare rallentamenti
      const weakProfile = profileHostHardware({
        totalMemoryBytes: 4 * GB,
        cpuCores: 2,
        arch: "x64",
        platform: "linux",
      });
      expect(weakProfile.tier).toBe("LOW_RESOURCE_BYPASS");
      expect(weakProfile.bypassLocalSlm).toBe(true);
      expect(weakProfile.recommendedModel).toBe("none");

      // 2. Portatile entry-level (12GB RAM): seleziona Qwen3-1.7B / Phi-4-Mini / Gemma3-4B
      const compactProfile = profileHostHardware({
        totalMemoryBytes: 12 * GB,
        cpuCores: 8,
        arch: "arm64",
        platform: "darwin",
      });
      expect(compactProfile.tier).toBe("COMPACT_EDGE");
      expect(compactProfile.bypassLocalSlm).toBe(false);
      expect(compactProfile.recommendedModel).toBe("qwen3:1.7b");
      expect(compactProfile.preferredQuantization).toBe("MLX_4BIT");

      // 3. Macchina Pro intermedia (24GB RAM): seleziona Qwen3-8B / Gemma3-12B
      const balancedProfile = profileHostHardware({
        totalMemoryBytes: 24 * GB,
        cpuCores: 10,
        arch: "arm64",
        platform: "darwin",
      });
      expect(balancedProfile.tier).toBe("BALANCED_PRO");
      expect(balancedProfile.recommendedModel).toBe("qwen3:8b");

      // 4. Workstation potentissima (64GB RAM): sblocca Qwen3-Coder 30B (MoE) e Gemma 3 27B
      const ultraProfile = profileHostHardware({
        totalMemoryBytes: 64 * GB,
        cpuCores: 16,
        arch: "arm64",
        platform: "darwin",
      });
      expect(ultraProfile.tier).toBe("WORKSTATION_ULTRA");
      expect(ultraProfile.recommendedModel).toBe("qwen3-coder:30b");
      expect(ultraProfile.candidateModels).toContain("gemma3:27b");
    });

    it("rileva i modelli già installati sulla macchina e filtra quelli troppo pesanti per la RAM disponibile", async () => {
      const GB = 1024 * 1024 * 1024;

      // Su macchina da 12GB, anche se l'utente ha scaricato qwen3-coder:30b, sceglie phi4-mini per non saturare la RAM
      const scanCompact = await scanInstalledLocalModels({
        hardwareOverride: {
          totalMemoryBytes: 12 * GB,
          cpuCores: 8,
          arch: "arm64",
          platform: "darwin",
        },
        mockInstalledModels: ["qwen3-coder:30b", "phi4-mini:latest"],
      });
      expect(scanCompact.selectionSource).toBe("INSTALLED_MATCH");
      expect(scanCompact.selectedModel).toBe("phi4-mini:latest");

      // Su Workstation da 64GB, aggancia direttamente qwen3-coder:30b già installato
      const scanUltra = await scanInstalledLocalModels({
        hardwareOverride: {
          totalMemoryBytes: 64 * GB,
          cpuCores: 16,
          arch: "arm64",
          platform: "darwin",
        },
        mockInstalledModels: ["qwen3-coder:30b", "phi4-mini:latest"],
      });
      expect(scanUltra.selectionSource).toBe("INSTALLED_MATCH");
      expect(scanUltra.selectedModel).toBe("qwen3-coder:30b");
    });

    it("impone il vincolo di sicurezza strict-loopback (127.0.0.1 / localhost)", async () => {
      expect(isStrictLoopbackUrl("http://127.0.0.1:11434")).toBe(true);
      expect(isStrictLoopbackUrl("http://localhost:8080")).toBe(true);
      expect(isStrictLoopbackUrl("https://external- leak.example.com")).toBe(
        false
      );

      await expect(
        scanInstalledLocalModels({
          ollamaBaseUrl: "https://remote-server.example.com:11434",
        })
      ).rejects.toThrow("SECURITY_VIOLATION");
    });
  });

  describe("TCK-21.3 & TCK-21.4: Quad-Tier Dispatcher & Speculative Formal Prover Escalation", () => {
    const GB = 1024 * 1024 * 1024;

    it("esegue il bypass automatico verso Tier 2 Cloud su macchine poco potenti (zero rallentamenti)", async () => {
      const res = await dispatchQuadTierInference({
        prompt: "Compress this handoff message",
        domain: "CAVEMAN_ENCODING",
        complexityScore: 0.2,
        hardwareOverride: {
          totalMemoryBytes: 4 * GB,
          cpuCores: 2,
        },
      });

      expect(res.hardwareProfile.tier).toBe("LOW_RESOURCE_BYPASS");
      expect(res.finalTier).toBe("TIER_2_CLOUD_WORKHORSE");
      expect(res.escalationReason).toContain("RAM < 8GB");
    });

    it("esegue su Tier 1 Local SLM a costo $0.00 quando il codice supera il Formal AST Prover", async () => {
      const safeRefactoredCode = `
export function safeCalc(a: number, b: number): number {
  if (b === 0) return 0;
  return a / b;
}
`;
      const res = await dispatchQuadTierInference({
        prompt: "Refactor safeCalc",
        domain: "AST_REFACTOR",
        complexityScore: 0.35,
        targetFilePathForProof: "src/safe-calc.ts",
        targetSymbolForProof: "safeCalc",
        hardwareOverride: {
          totalMemoryBytes: 64 * GB,
          cpuCores: 16,
          arch: "arm64",
          platform: "darwin",
        },
        mockInstalledModels: ["qwen3-coder:30b"],
        simulatedSlmOutput: safeRefactoredCode,
      });

      expect(res.initialTier).toBe("TIER_1_LOCAL_SLM");
      expect(res.finalTier).toBe("TIER_1_LOCAL_SLM");
      expect(res.modelSelected).toBe("qwen3-coder:30b");
      expect(res.speculativeVerificationPassed).toBe(true);
      expect(res.speculativeEscalated).toBe(false);
      expect(res.cloudCostUsd).toBe(0);
      expect(res.estimatedCloudSavingsUsd).toBeGreaterThan(0);
    });

    it("intercetta con il Formal AST Prover (Sprint 20) un bug generato dall'SLM locale ed esegue la Speculative Escalation a Tier 2 Cloud", async () => {
      const buggySlmCode = `
export function buggyCalc(a: number, b: number): number {
  return a / b;
}
`;
      const res = await dispatchQuadTierInference({
        prompt: "Refactor buggyCalc",
        domain: "AST_REFACTOR",
        complexityScore: 0.35,
        targetFilePathForProof: "src/buggy-calc.ts",
        targetSymbolForProof: "buggyCalc",
        hardwareOverride: {
          totalMemoryBytes: 32 * GB,
          cpuCores: 12,
        },
        simulatedSlmOutput: buggySlmCode,
      });

      expect(res.initialTier).toBe("TIER_1_LOCAL_SLM");
      expect(res.finalTier).toBe("TIER_2_CLOUD_WORKHORSE");
      expect(res.speculativeVerificationPassed).toBe(false);
      expect(res.speculativeEscalated).toBe(true);
      expect(res.escalationReason).toContain(
        "Speculative Formal Prover detected counterexample"
      );
    });

    it("vieta categoricamente il Tier 1 durante MODE_2_INVESTIGATE_RCA e MODE_3_RND_ROUNDTABLE forzando Tier 3 Deep Reasoning", async () => {
      const rcaDispatch = await dispatchQuadTierInference({
        prompt: "Run 5 Whys on memory leak",
        domain: "FAST_TRIAGE",
        complexityScore: 0.2,
        activeCtoMode: "MODE_2_INVESTIGATE_RCA",
      });

      expect(rcaDispatch.finalTier).toBe("TIER_3_DEEP_REASONING");
      expect(rcaDispatch.modelSelected).toContain("deep-thinking");
    });

    it("espone dispatch_quad_tier_inference sul Server MCP", async () => {
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);

      const client = new McpClientBridge(
        { serverName: "slm-mcp-test" },
        clientTransport
      );
      await client.connect();

      const response = await client.callTool({
        name: "dispatch_quad_tier_inference",
        arguments: {
          prompt: " Gentilmente potresti verificare lo stato del modulo per favore? ",
          domain: "CAVEMAN_ENCODING",
          complexityScore: 0.2,
        },
      });

      expect(response.isError).toBe(false);
      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.finalTier).toBe("TIER_1_LOCAL_SLM");
      expect(parsed.output).toContain("[CAVEMAN-RPC]");

      await client.disconnect();
      await server.close();
    });
  });
});
