import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DynamicMcpToolSchema,
  HeuristicScanResultSchema,
  SlmDistillationTraceSchema,
  ChaosFaultInjectionSchema,
  CreativeHorizonDossierSchema,
  type DynamicMcpTool,
  type HeuristicScanResult,
  type SlmDistillationTrace,
  type ChaosFaultInjection,
} from "../src/contracts/frontiers.js";
import { ConsensusRfcSchema } from "../src/contracts/rnd.js";

function extractJsonBlock(filePath: string): unknown {
  expect(fs.existsSync(filePath), `File does not exist: ${filePath}`).toBe(true);
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  expect(match, `No JSON code block found in ${filePath}`).not.toBeNull();
  return JSON.parse(match![1]);
}

describe("Sprint R&D Horizon Scanning & Creative Frontiers (2026+)", () => {
  describe("Frontier Contracts Verification", () => {
    it("valida DynamicMcpToolSchema per la sintesi JIT di strumenti MCP", () => {
      const tool: DynamicMcpTool = {
        toolId: "tool_dyn_clickhouse_query",
        name: "ClickHouse Schema Extractor",
        description: "Estrae dinamicamente lo schema delle tabelle analitiche per validazione query",
        generatedByRole: "ai_lead",
        sandboxType: "NODE_WORKER",
        permissions: ["network:http_loopback", "fs:read_schema"],
        inputSchemaJson: "{\"type\":\"object\",\"properties\":{\"tableName\":{\"type\":\"string\"}},\"required\":[\"tableName\"]}",
        ttlSeconds: 3600,
        status: "HOT_LOADED",
        createdAt: new Date().toISOString(),
      };

      const parsed = DynamicMcpToolSchema.parse(tool);
      expect(parsed.toolId).toBe("tool_dyn_clickhouse_query");
      expect(parsed.sandboxType).toBe("NODE_WORKER");
      expect(parsed.status).toBe("HOT_LOADED");
    });

    it("valida HeuristicScanResultSchema con supporto a controesempi deterministici", () => {
      const proof: HeuristicScanResult = {
        proofId: "PROOF-AST-2026-001",
        targetFilePath: "src/core/session-store.ts",
        targetSymbol: "TwoPhaseCommitWal.commit",
        scanEngine: "PATTERN_HEURISTIC",
        invariantsChecked: ["atomic_write_before_rename", "no_partial_wal_corruption", "lock_freedom"],
        status: "HEURISTIC_PASSED",
        executionTimeMs: 42.5,
        verifiedAt: new Date().toISOString(),
      };

      const parsed = HeuristicScanResultSchema.parse(proof);
      expect(parsed.scanEngine).toBe("PATTERN_HEURISTIC");
      expect(parsed.status).toBe("HEURISTIC_PASSED");
      expect(parsed.invariantsChecked.length).toBe(3);

      // Test con controesempio
      const failingProof: HeuristicScanResult = {
        proofId: "PROOF-AST-FAIL-02",
        targetFilePath: "src/utils/math.ts",
        targetSymbol: "divide",
        scanEngine: "PATTERN_HEURISTIC",
        invariantsChecked: ["division_by_zero_prohibited"],
        status: "COUNTEREXAMPLE_FOUND",
        counterexampleTrace: {
          inputState: { b: 0 },
          failingPath: ["src/utils/math.ts#L12"],
          reproducibleFixtureCode: "expect(() => divide(10, 0)).toThrow();",
        },
        executionTimeMs: 15.0,
        verifiedAt: new Date().toISOString(),
      };

      const parsedFailing = HeuristicScanResultSchema.parse(failingProof);
      expect(parsedFailing.status).toBe("COUNTEREXAMPLE_FOUND");
      expect(parsedFailing.counterexampleTrace?.inputState?.b).toBe(0);
    });

    it("valida SlmDistillationTraceSchema per quantizzazione locale e risparmio FinOps", () => {
      const trace: SlmDistillationTrace = {
        traceId: "DISTILL-SLM-001",
        sourceTeacherModel: "claude-3-7-sonnet",
        targetStudentModel: "qwen-2.5-coder-1.5b",
        specializedDomain: "AST_REFACTOR",
        datasetSampleCount: 1500,
        fpyVerificationRate: 98.4,
        quantizationFormat: "GGUF_Q4_K_M",
        averageInferenceLatencyMs: 68.2,
        cloudCostSavingsPercentage: 86.5,
        distilledAt: new Date().toISOString(),
      };

      const parsed = SlmDistillationTraceSchema.parse(trace);
      expect(parsed.fpyVerificationRate).toBe(98.4);
      expect(parsed.cloudCostSavingsPercentage).toBe(86.5);
      expect(parsed.quantizationFormat).toBe("GGUF_Q4_K_M");
    });

    it("valida ChaosFaultInjectionSchema per antifragilità e stress-test della War Room", () => {
      const chaos: ChaosFaultInjection = {
        faultId: "CHAOS-2026-FAULT-07",
        faultType: "AST_MUTATION_OFF_BY_ONE",
        targetSubsystem: "src/gatekeeper/runner.ts",
        detectionTimeMs: 85,
        recoveryTimeMs: 140,
        containmentSuccess: true,
        resilienceScore: 96.8,
        warRoomActivated: true,
        injectedAt: new Date().toISOString(),
      };

      const parsed = ChaosFaultInjectionSchema.parse(chaos);
      expect(parsed.faultType).toBe("AST_MUTATION_OFF_BY_ONE");
      expect(parsed.resilienceScore).toBe(96.8);
      expect(parsed.warRoomActivated).toBe(true);
    });
  });

  describe("Horizon Scanning Dossier Compliance", () => {
    const dossierPath = path.resolve(
      process.cwd(),
      "docs/wiki/rnd/audits/horizon-scanning-creative-frontiers.md"
    );

    it("estrae e valida il dossier strutturato rispetto a CreativeHorizonDossierSchema", () => {
      const rawData = extractJsonBlock(dossierPath);
      const dossier = CreativeHorizonDossierSchema.parse(rawData);

      expect(dossier.authorRole).toBe("rnd_lead");
      expect(dossier.strategicPillars.length).toBe(5);

      const pillarIds = dossier.strategicPillars.map((p) => p.id);
      expect(pillarIds).toContain("PILLAR-1-DYNAMIC-MCP");
      expect(pillarIds).toContain("PILLAR-2-NEURO-SYMBOLIC");
      expect(pillarIds).toContain("PILLAR-3-SLM-DISTILLATION");
      expect(pillarIds).toContain("PILLAR-4-ANTIFRAGILE-CHAOS");
      expect(pillarIds).toContain("PILLAR-5-SPATIAL-CANVAS");

      // Verifica Fase 6
      expect(dossier.proposedPhase.phaseNumber).toBe(6);
      expect(dossier.proposedPhase.sprints.length).toBe(5);
      const sprintNumbers = dossier.proposedPhase.sprints.map((s) => s.sprintNumber);
      expect(sprintNumbers).toEqual([19, 20, 21, 22, 23]);

      // Verifica sample artifacts
      expect(dossier.sampleArtifacts?.dynamicTool?.toolId).toBe("tool_dyn_clickhouse_query");
      expect(dossier.sampleArtifacts?.heuristicScan?.scanEngine).toBe("PATTERN_HEURISTIC");
      expect(dossier.sampleArtifacts?.slmTrace?.quantizationFormat).toBe("GGUF_Q4_K_M");
      expect(dossier.sampleArtifacts?.chaosExperiment?.resilienceScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe("RFC-006 Blueprint Compliance", () => {
    const rfcPath = path.resolve(
      process.cwd(),
      "docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md"
    );

    it("estrae e valida RFC-006 rispetto a ConsensusRfcSchema", () => {
      const rawData = extractJsonBlock(rfcPath);
      const rfc = ConsensusRfcSchema.parse(rawData);

      expect(rfc.rfcId).toBe("RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM");
      expect(rfc.status).toBe("CONSENSUS_REACHED");
      expect(rfc.sharedVision.length).toBeGreaterThan(50);

      // 4 Topic strutturati
      expect(rfc.topics.length).toBe(4);
      const topicIds = rfc.topics.map((t) => t.id);
      expect(topicIds).toContain("TOPIC-1-SELF-EVOLVING-MCP-SYNTHESIS");
      expect(topicIds).toContain("TOPIC-2-NEURO-SYMBOLIC-AST-VERIFICATION");
      expect(topicIds).toContain("TOPIC-3-ZERO-COST-SLM-DISTILLATION");
      expect(topicIds).toContain("TOPIC-4-ANTIFRAGILE-CHAOS-ENGINEERING");

      for (const topic of rfc.topics) {
        expect(topic.consensusReached).toBe(true);
        expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(2);
        for (const fb of topic.managerFeedbacks) {
          expect(fb.approvalStatus).toBe("APPROVED");
        }
      }

      // 7 firme allineate dei Domain Leads
      expect(rfc.signatures.length).toBe(7);
      const roles = rfc.signatures.map((s) => s.role);
      expect(roles).toEqual([
        "rnd_lead",
        "ai_lead",
        "engineering_lead",
        "product_lead",
        "qa_lead",
        "backend_lead",
        "mobile_lead",
      ]);

      // 4 trade-off risolti
      expect(rfc.resolvedTradeOffs.length).toBe(4);

      // Backlog tickets
      expect(rfc.actionableBacklogTickets.length).toBeGreaterThanOrEqual(15);
      expect(rfc.actionableBacklogTickets).toContain("TCK-19.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-20.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-21.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-22.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-23.1");
    });
  });
});
