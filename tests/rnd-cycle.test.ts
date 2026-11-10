import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  OneOnOneInterviewSchema,
  ManagerFeedbackSchema,
  ConsensusRfcSchema,
} from "../src/contracts/rnd.js";

function extractJsonBlock(filePath: string): unknown {
  expect(fs.existsSync(filePath), `File does not exist: ${filePath}`).toBe(true);
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  expect(match, `No JSON code block found in ${filePath}`).not.toBeNull();
  return JSON.parse(match![1]);
}

describe("R&D Innovation Cycle — End-to-End Deterministic Compliance", () => {
  describe("Ciclo 1: Open Source Foundation & Universal Multi-Agent OS", () => {
    describe("Fase 1: 1:1 Discovery Interviews Compliance", () => {
      it("valida l'intervista 1:1 con l'Engineering Lead (1ON1-2026-10-ENG)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/engineering-lead-interview.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-ENG");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("engineering_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("MCP"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Go") || r.includes("Rust"))).toBe(true);
        expect(interview.visionAndAspirations.length).toBeGreaterThan(20);
      });

      it("valida l'intervista 1:1 con il Product Lead (1ON1-2026-10-PROD)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/product-lead-interview.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-PROD");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("product_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Wizard") || r.includes("init"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Monorepo"))).toBe(true);
      });

      it("valida l'intervista 1:1 con il QA Lead (1ON1-2026-10-QA)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/qa-lead-interview.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-QA");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("qa_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Self-Healing"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("AST Diff Guard"))).toBe(true);
      });
    });

    describe("Fase 3: Cross-Review Roundtable Feedback Compliance", () => {
      it("valida tutti i feedback dei Manager espressi durante la tavola rotonda RFC-001", () => {
        const roundtablePath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/roundtables/2026-10-roundtable-rfc-001.md"
        );
        const rawData = extractJsonBlock(roundtablePath);
        expect(Array.isArray(rawData)).toBe(true);

        const feedbacks = (rawData as unknown[]).map((f) => ManagerFeedbackSchema.parse(f));
        expect(feedbacks.length).toBeGreaterThanOrEqual(5);

        const roles = feedbacks.map((f) => f.managerRole);
        expect(roles).toContain("engineering_lead");
        expect(roles).toContain("product_lead");
        expect(roles).toContain("qa_lead");
        expect(roles).toContain("backend_lead");
        expect(roles).toContain("mobile_lead");

        for (const feedback of feedbacks) {
          expect(feedback.approvalStatus).toBe("APPROVED");
          expect(feedback.opinion.length).toBeGreaterThan(10);
        }
      });
    });

    describe("Fase 4: Consensus RFC Blueprint & Signatures Compliance", () => {
      it("valida il Consensus RFC-001 conforme a ConsensusRfcSchema con tutte le firme", () => {
        const rfcPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/rfcs/RFC-001-OPEN-SOURCE-OS-FOUNDATION.md"
        );
        const rawData = extractJsonBlock(rfcPath);
        const consensusRfc = ConsensusRfcSchema.parse(rawData);

        expect(consensusRfc.rfcId).toBe("RFC-001-OPEN-SOURCE-OS-FOUNDATION");
        expect(["CONSENSUS_REACHED", "RATIFIED_BY_CTO"]).toContain(consensusRfc.status);
        expect(consensusRfc.authorRole).toBe("rnd_lead");
        expect(consensusRfc.sharedVision.length).toBeGreaterThan(50);

        expect(consensusRfc.topics.length).toBe(4);
        const topicIds = consensusRfc.topics.map((t) => t.id);
        expect(topicIds).toContain("TOPIC-1-UNIVERSAL-SCAFFOLDING");
        expect(topicIds).toContain("TOPIC-2-MODULAR-PLUGINS-MCP");
        expect(topicIds).toContain("TOPIC-3-SELF-HEALING-GATEKEEPER");
        expect(topicIds).toContain("TOPIC-4-DEVEX-INTERACTIVE-WIZARD");

        for (const topic of consensusRfc.topics) {
          expect(topic.consensusReached).toBe(true);
          expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(1);
          for (const fb of topic.managerFeedbacks) {
            expect(fb.approvalStatus).toBe("APPROVED");
          }
        }

        expect(consensusRfc.resolvedTradeOffs.length).toBeGreaterThanOrEqual(3);

        expect(consensusRfc.signatures.length).toBeGreaterThanOrEqual(6);
        const signedRoles = consensusRfc.signatures.map((s) => s.role);
        expect(signedRoles).toContain("rnd_lead");
        expect(signedRoles).toContain("engineering_lead");
        expect(signedRoles).toContain("product_lead");
        expect(signedRoles).toContain("qa_lead");
        expect(signedRoles).toContain("backend_lead");
        expect(signedRoles).toContain("mobile_lead");

        expect(consensusRfc.actionableBacklogTickets.length).toBeGreaterThanOrEqual(5);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-4.1"))).toBe(true);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-5.1"))).toBe(true);
      });
    });
  });

  describe("Ciclo 2: Enterprise Autonomy, Checkpointing, Security & Git-Native Collaboration", () => {
    describe("Fase 1: 1:1 Discovery Interviews Compliance (Ciclo 2)", () => {
      it("valida l'intervista 1:1 con l'Engineering Lead (1ON1-2026-10-C2-ENG)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle2-engineering-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C2-ENG");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("engineering_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Checkpointing") || r.includes("Resume"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Event Bus"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Vulnerability") || r.includes("License"))).toBe(true);
        expect(interview.visionAndAspirations.length).toBeGreaterThan(20);
      });

      it("valida l'intervista 1:1 con il Product Lead (1ON1-2026-10-C2-PROD)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle2-product-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C2-PROD");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("product_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Steering") || r.includes("Human-in-the-Loop"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Git-Native") || r.includes("PR"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Dashboard"))).toBe(true);
      });

      it("valida l'intervista 1:1 con il QA Lead (1ON1-2026-10-C2-QA)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle2-qa-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C2-QA");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("qa_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Secret"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Flaky"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Budget"))).toBe(true);
      });
    });

    describe("Fase 3: Cross-Review Roundtable Feedback Compliance (Ciclo 2)", () => {
      it("valida tutti i feedback dei Manager espressi durante la tavola rotonda RFC-002", () => {
        const roundtablePath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/roundtables/2026-10-roundtable-rfc-002.md"
        );
        const rawData = extractJsonBlock(roundtablePath);
        expect(Array.isArray(rawData)).toBe(true);

        const feedbacks = (rawData as unknown[]).map((f) => ManagerFeedbackSchema.parse(f));
        expect(feedbacks.length).toBeGreaterThanOrEqual(5);

        const roles = feedbacks.map((f) => f.managerRole);
        expect(roles).toContain("engineering_lead");
        expect(roles).toContain("product_lead");
        expect(roles).toContain("qa_lead");
        expect(roles).toContain("backend_lead");
        expect(roles).toContain("mobile_lead");

        for (const feedback of feedbacks) {
          expect(feedback.approvalStatus).toBe("APPROVED");
          expect(feedback.opinion.length).toBeGreaterThan(10);
        }
      });
    });

    describe("Fase 4: Consensus RFC-002 Blueprint & Signatures Compliance (Ciclo 2)", () => {
      it("valida il Consensus RFC-002 conforme a ConsensusRfcSchema con tutte le firme", () => {
        const rfcPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/rfcs/RFC-002-ENTERPRISE-AUTONOMY-AND-SAFETY.md"
        );
        const rawData = extractJsonBlock(rfcPath);
        const consensusRfc = ConsensusRfcSchema.parse(rawData);

        expect(consensusRfc.rfcId).toBe("RFC-002-ENTERPRISE-AUTONOMY-AND-SAFETY");
        expect(["CONSENSUS_REACHED", "RATIFIED_BY_CTO"]).toContain(consensusRfc.status);
        expect(consensusRfc.authorRole).toBe("rnd_lead");
        expect(consensusRfc.sharedVision.length).toBeGreaterThan(50);

        expect(consensusRfc.topics.length).toBe(4);
        const topicIds = consensusRfc.topics.map((t) => t.id);
        expect(topicIds).toContain("TOPIC-1-SESSION-CHECKPOINTING");
        expect(topicIds).toContain("TOPIC-2-SECURITY-GUARDRAILS");
        expect(topicIds).toContain("TOPIC-3-GIT-AUTOMATION-HITL");
        expect(topicIds).toContain("TOPIC-4-BUDGETING-FLAKY-TESTS");

        for (const topic of consensusRfc.topics) {
          expect(topic.consensusReached).toBe(true);
          expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(1);
          for (const fb of topic.managerFeedbacks) {
            expect(fb.approvalStatus).toBe("APPROVED");
          }
        }

        expect(consensusRfc.resolvedTradeOffs.length).toBeGreaterThanOrEqual(3);

        expect(consensusRfc.signatures.length).toBeGreaterThanOrEqual(6);
        const signedRoles = consensusRfc.signatures.map((s) => s.role);
        expect(signedRoles).toContain("rnd_lead");
        expect(signedRoles).toContain("engineering_lead");
        expect(signedRoles).toContain("product_lead");
        expect(signedRoles).toContain("qa_lead");
        expect(signedRoles).toContain("backend_lead");
        expect(signedRoles).toContain("mobile_lead");

        expect(consensusRfc.actionableBacklogTickets.length).toBeGreaterThanOrEqual(5);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-6.1"))).toBe(true);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-7.1"))).toBe(true);
      });
    });
  });

  describe("Ciclo 3: Technical Debt Audit, Multi-Agent Collaboration & Workflow Optimization", () => {
    describe("Fase 1: 1:1 Discovery Interviews Compliance (Ciclo 3)", () => {
      it("valida l'intervista 1:1 con l'Engineering Lead (1ON1-2026-10-C3-ENG)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle3-engineering-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C3-ENG");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("engineering_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Impact Analysis") || r.includes("TIA"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Worktree") || r.includes("Parallelism"))).toBe(true);
        expect(interview.visionAndAspirations.length).toBeGreaterThan(20);
      });

      it("valida l'intervista 1:1 con il Product Lead (1ON1-2026-10-C3-PROD)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle3-product-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C3-PROD");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("product_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Kanban") || r.includes("Studio"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Handoff"))).toBe(true);
      });

      it("valida l'intervista 1:1 con il QA Lead (1ON1-2026-10-C3-QA)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle3-qa-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C3-QA");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("qa_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Interceptor"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Cryptographic") || r.includes("SHA-256"))).toBe(true);
      });
    });

    describe("Fase 3: Cross-Review Roundtable Feedback Compliance (Ciclo 3)", () => {
      it("valida tutti i feedback dei Manager espressi durante la tavola rotonda RFC-003", () => {
        const roundtablePath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/roundtables/2026-10-roundtable-rfc-003.md"
        );
        const rawData = extractJsonBlock(roundtablePath);
        expect(Array.isArray(rawData)).toBe(true);

        const feedbacks = (rawData as unknown[]).map((f) => ManagerFeedbackSchema.parse(f));
        expect(feedbacks.length).toBeGreaterThanOrEqual(5);

        const roles = feedbacks.map((f) => f.managerRole);
        expect(roles).toContain("engineering_lead");
        expect(roles).toContain("product_lead");
        expect(roles).toContain("qa_lead");
        expect(roles).toContain("backend_lead");
        expect(roles).toContain("mobile_lead");

        for (const feedback of feedbacks) {
          expect(feedback.approvalStatus).toBe("APPROVED");
          expect(feedback.opinion.length).toBeGreaterThan(10);
        }
      });
    });

    describe("Fase 4: Consensus RFC-003 Blueprint & Signatures Compliance (Ciclo 3)", () => {
      it("valida il Consensus RFC-003 conforme a ConsensusRfcSchema con tutte le firme", () => {
        const rfcPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/rfcs/RFC-003-TECHNICAL-DEBT-AND-AGENTIC-WORKFLOW.md"
        );
        const rawData = extractJsonBlock(rfcPath);
        const consensusRfc = ConsensusRfcSchema.parse(rawData);

        expect(consensusRfc.rfcId).toBe("RFC-003-TECHNICAL-DEBT-AND-AGENTIC-WORKFLOW");
        expect(["CONSENSUS_REACHED", "RATIFIED_BY_CTO"]).toContain(consensusRfc.status);
        expect(consensusRfc.authorRole).toBe("rnd_lead");
        expect(consensusRfc.sharedVision.length).toBeGreaterThan(50);

        expect(consensusRfc.topics.length).toBe(4);
        const topicIds = consensusRfc.topics.map((t) => t.id);
        expect(topicIds).toContain("TOPIC-1-ARCHITECTURAL-DECOUPLING-TIA");
        expect(topicIds).toContain("TOPIC-2-GIT-WORKTREES-PARALLELISM");
        expect(topicIds).toContain("TOPIC-3-RUNTIME-CONTRACT-INTERCEPTOR");
        expect(topicIds).toContain("TOPIC-4-VISUAL-STUDIO-KANBAN");

        for (const topic of consensusRfc.topics) {
          expect(topic.consensusReached).toBe(true);
          expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(1);
          for (const fb of topic.managerFeedbacks) {
            expect(fb.approvalStatus).toBe("APPROVED");
          }
        }

        expect(consensusRfc.resolvedTradeOffs.length).toBeGreaterThanOrEqual(3);

        expect(consensusRfc.signatures.length).toBeGreaterThanOrEqual(6);
        const signedRoles = consensusRfc.signatures.map((s) => s.role);
        expect(signedRoles).toContain("rnd_lead");
        expect(signedRoles).toContain("engineering_lead");
        expect(signedRoles).toContain("product_lead");
        expect(signedRoles).toContain("qa_lead");
        expect(signedRoles).toContain("backend_lead");
        expect(signedRoles).toContain("mobile_lead");

        expect(consensusRfc.actionableBacklogTickets.length).toBeGreaterThanOrEqual(5);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-8.1"))).toBe(true);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-9.1"))).toBe(true);
      });
    });
  });

  describe("Ciclo 4: Advanced AI Harness, Context Window Engineering & Token Optimization", () => {
    describe("Fase 1: 1:1 Discovery Interviews Compliance (Ciclo 4)", () => {
      it("valida l'intervista 1:1 con l'AI & Context Harness Lead (1ON1-2026-10-C4-AI)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle4-ai-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C4-AI");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("ai_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Two-Tier") || r.includes("Caching"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Compaction") || r.includes("Anti-Rot"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Tool Pruning") || r.includes("Decoding"))).toBe(true);
        expect(interview.visionAndAspirations.length).toBeGreaterThan(20);
      });

      it("valida l'intervista 1:1 con l'Engineering Lead (1ON1-2026-10-C4-ENG)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle4-engineering-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C4-ENG");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("engineering_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Caching") || r.includes("Adapter"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Tool Pruner") || r.includes("Tokenizer"))).toBe(true);
      });

      it("valida l'intervista 1:1 con il Product Lead (1ON1-2026-10-C4-PROD)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle4-product-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C4-PROD");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("product_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("FinOps"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Context Health"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Breadcrumb") || r.includes("Trajectory"))).toBe(true);
      });

      it("valida l'intervista 1:1 con il QA Lead (1ON1-2026-10-C4-QA)", () => {
        const interviewPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/interviews/cycle4-qa-lead.md"
        );
        const rawData = extractJsonBlock(interviewPath);
        const interview = OneOnOneInterviewSchema.parse(rawData);

        expect(interview.id).toBe("1ON1-2026-10-C4-QA");
        expect(interview.interviewerRole).toBe("rnd_lead");
        expect(interview.intervieweeRole).toBe("qa_lead");
        expect(interview.painPoints.length).toBeGreaterThanOrEqual(3);
        expect(interview.featureRequests.some((r) => r.includes("Structured Decoding") || r.includes("Schema-Guided"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Lossless") || r.includes("Compaction"))).toBe(true);
        expect(interview.featureRequests.some((r) => r.includes("Benchmark"))).toBe(true);
      });
    });

    describe("Fase 3: Cross-Review Roundtable Feedback Compliance (Ciclo 4)", () => {
      it("valida tutti i feedback dei Manager espressi durante la tavola rotonda RFC-004", () => {
        const roundtablePath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/roundtables/2026-10-roundtable-rfc-004.md"
        );
        const rawData = extractJsonBlock(roundtablePath);
        expect(Array.isArray(rawData)).toBe(true);

        const feedbacks = (rawData as unknown[]).map((f) => ManagerFeedbackSchema.parse(f));
        expect(feedbacks.length).toBeGreaterThanOrEqual(5);

        const roles = feedbacks.map((f) => f.managerRole);
        expect(roles).toContain("ai_lead");
        expect(roles).toContain("engineering_lead");
        expect(roles).toContain("product_lead");
        expect(roles).toContain("qa_lead");
        expect(roles).toContain("backend_lead");
        expect(roles).toContain("mobile_lead");

        for (const feedback of feedbacks) {
          expect(feedback.approvalStatus).toBe("APPROVED");
          expect(feedback.opinion.length).toBeGreaterThan(10);
        }
      });
    });

    describe("Fase 4: Consensus RFC-004 Blueprint & Signatures Compliance (Ciclo 4)", () => {
      it("valida il Consensus RFC-004 conforme a ConsensusRfcSchema con tutte le firme (incluso ai_lead)", () => {
        const rfcPath = path.resolve(
          process.cwd(),
          "docs/wiki/rnd/rfcs/RFC-004-ADVANCED-AI-HARNESS-AND-CONTEXT-ENGINEERING.md"
        );
        const rawData = extractJsonBlock(rfcPath);
        const consensusRfc = ConsensusRfcSchema.parse(rawData);

        expect(consensusRfc.rfcId).toBe("RFC-004-ADVANCED-AI-HARNESS-AND-CONTEXT-ENGINEERING");
        expect(["CONSENSUS_REACHED", "RATIFIED_BY_CTO"]).toContain(consensusRfc.status);
        expect(consensusRfc.authorRole).toBe("rnd_lead");
        expect(consensusRfc.sharedVision.length).toBeGreaterThan(50);

        // Verifica dei 4 topic di RFC-004
        expect(consensusRfc.topics.length).toBe(4);
        const topicIds = consensusRfc.topics.map((t) => t.id);
        expect(topicIds).toContain("TOPIC-1-TWO-TIER-PROMPT-CACHING");
        expect(topicIds).toContain("TOPIC-2-CONTEXT-COMPACTION-ANTI-ROT");
        expect(topicIds).toContain("TOPIC-3-DYNAMIC-TOOL-PRUNING");
        expect(topicIds).toContain("TOPIC-4-OBSERVABILITY-FINOPS-COCKPIT");

        for (const topic of consensusRfc.topics) {
          expect(topic.consensusReached).toBe(true);
          expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(1);
          for (const fb of topic.managerFeedbacks) {
            expect(fb.approvalStatus).toBe("APPROVED");
          }
        }

        // Verifica trade-off risolti
        expect(consensusRfc.resolvedTradeOffs.length).toBeGreaterThanOrEqual(3);

        // Verifica firme congiunte di tutti i Lead (incluso il nuovo ruolo ai_lead)
        expect(consensusRfc.signatures.length).toBeGreaterThanOrEqual(7);
        const signedRoles = consensusRfc.signatures.map((s) => s.role);
        expect(signedRoles).toContain("rnd_lead");
        expect(signedRoles).toContain("ai_lead");
        expect(signedRoles).toContain("engineering_lead");
        expect(signedRoles).toContain("product_lead");
        expect(signedRoles).toContain("qa_lead");
        expect(signedRoles).toContain("backend_lead");
        expect(signedRoles).toContain("mobile_lead");

        // Verifica ticket per Sprint 10 e Sprint 11
        expect(consensusRfc.actionableBacklogTickets.length).toBeGreaterThanOrEqual(5);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-10.1"))).toBe(true);
        expect(consensusRfc.actionableBacklogTickets.some((t) => t.includes("TCK-11.1"))).toBe(true);
      });
    });
  });
});
