import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  AgileCeremonyTypeSchema,
  AgileCeremonySchema,
  WarRoomTriggerSchema,
  WarRoomIncidentSchema,
  SprintRetrospectiveSchema,
  DevilsAdvocateFeedbackSchema,
  RoundtableConvergenceSchema,
  TelegraphicMessageSchema,
  type AgileCeremony,
  type WarRoomIncident,
  type SprintRetrospective,
  type DevilsAdvocateFeedback,
  type RoundtableConvergence,
  type TelegraphicMessage,
} from "../src/contracts/ceremonies.js";
import { ConsensusRfcSchema } from "../src/contracts/rnd.js";

function extractJsonBlock(filePath: string): unknown {
  expect(fs.existsSync(filePath), `File does not exist: ${filePath}`).toBe(true);
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/```json\r?\n([\s\S]*?)\r?\n```/);
  expect(match, `No JSON code block found in ${filePath}`).not.toBeNull();
  return JSON.parse(match![1]);
}

describe("Agile Multi-Agent Ceremonies & Inter-Agent Protocols", () => {
  describe("Zod Contract Validations", () => {
    it("valida tutti i tipi di cerimonie Agile previsti da AgileCeremonyTypeSchema", () => {
      const types = [
        "BRAINSTORMING_KICKOFF",
        "BACKLOG_REFINEMENT_1ON1",
        "ARCHITECTURE_REVIEW_ROUNDTABLE",
        "INCIDENT_WAR_ROOM",
        "SPRINT_RETROSPECTIVE",
      ];
      for (const t of types) {
        expect(AgileCeremonyTypeSchema.parse(t)).toBe(t);
      }
      expect(() => AgileCeremonyTypeSchema.parse("INVALID_CEREMONY")).toThrow();
    });

    it("valida correttamente un'istanza di AgileCeremonySchema", () => {
      const ceremonyData: AgileCeremony = {
        id: "CEREMONY-001",
        type: "BRAINSTORMING_KICKOFF",
        chairRole: "product_lead",
        attendeeRoles: ["product_lead", "engineering_lead", "rnd_lead"],
        status: "CONCLUDED",
        inputArtifactUri: "docs/wiki/product/roadmap.md",
        outputArtifactUri: "docs/wiki/rnd/rfcs/RFC-005.md",
        startedAt: "2026-10-17T14:00:00.000Z",
        concludedAt: "2026-10-17T14:30:00.000Z",
        summary: "Kickoff dello Sprint completato con allineamento su 5 cerimonie native.",
      };

      const parsed = AgileCeremonySchema.parse(ceremonyData);
      expect(parsed.id).toBe("CEREMONY-001");
      expect(parsed.attendeeRoles.length).toBe(3);
    });

    it("rifiuta AgileCeremonySchema con campi obbligatori mancanti o attendeeRoles vuoto", () => {
      expect(() =>
        AgileCeremonySchema.parse({
          id: "CEREMONY-FAIL",
          type: "BRAINSTORMING_KICKOFF",
          chairRole: "product_lead",
          attendeeRoles: [], // Minimo 1 partecipante
          summary: "Troppo corto", // Minimo 10 caratteri
        })
      ).toThrow();
    });

    it("valida i trigger di WarRoomTriggerSchema", () => {
      const triggers = [
        "SELF_HEALING_EXHAUSTED",
        "SECURITY_VIOLATION",
        "CRITICAL_SECURITY_CVE",
        "CRITICAL_REGRESSION",
        "DIFF_GUARD_VIOLATION",
        "MANUAL_CTO_OVERRIDE",
      ];
      for (const tr of triggers) {
        expect(WarRoomTriggerSchema.parse(tr)).toBe(tr);
      }
      expect(() => WarRoomTriggerSchema.parse("MINOR_TYPO")).toThrow();
    });

    it("valida correttamente WarRoomIncidentSchema e le sue invarianti di rollback", () => {
      const incident: WarRoomIncident = {
        incidentId: "INC-999",
        trigger: "SELF_HEALING_EXHAUSTED",
        severity: "CRITICAL",
        targetTicketId: "TCK-100",
        affectedFiles: ["src/core/critical-service.ts"],
        rootCause: "3 fallimenti consecutivi di self-healing per errore asincrono di timeout.",
        rollbackSnapshotSha256: "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
        containmentAction: "Rollback atomico all'ultimo commit integro ed isolamento del branch.",
        remediationPlan: "Rafforzamento dei timeout e revisione del contratto in Refinement 1:1.",
        resolvedByRole: "qa_lead",
        resolvedAt: "2026-10-17T15:10:00.000Z",
      };

      const parsed = WarRoomIncidentSchema.parse(incident);
      expect(parsed.incidentId).toBe("INC-999");
      expect(parsed.trigger).toBe("SELF_HEALING_EXHAUSTED");
      expect(parsed.rollbackSnapshotSha256).toBeDefined();
    });

    it("valida SprintRetrospectiveSchema con metriche FPY, FinOps e Action Items", () => {
      const retro: SprintRetrospective = {
        sprintId: "SPRINT-14",
        fpyPercentage: 92.4,
        totalSelfHealingCycles: 2,
        tokenCostUsd: 1.85,
        cacheHitRatePercentage: 89.1,
        bottlenecksIdentified: [
          "Verbosità comunicativa eccessiva tra lead ed esecutori L3",
        ],
        technicalDebtTickets: ["TCK-14.4"],
        actionItems: [
          "Enforce Caveman-RPC con zeroFluff su tutti i payload L2/L3",
        ],
        moderatorRole: "product_lead",
        concludedAt: "2026-10-17T15:30:00.000Z",
      };

      const parsed = SprintRetrospectiveSchema.parse(retro);
      expect(parsed.fpyPercentage).toBe(92.4);
      expect(parsed.cacheHitRatePercentage).toBe(89.1);
      expect(parsed.actionItems.length).toBe(1);
    });

    it("valida DevilsAdvocateFeedbackSchema per anti-echo-chamber", () => {
      const feedback: DevilsAdvocateFeedback = {
        redTeamerRole: "qa_lead",
        targetProposalId: "RFC-005",
        identifiedFallacies: [
          {
            category: "OPERATIONAL_COMPLEXITY",
            description: "Overhead cerimoniale per modifiche minori a file di configurazione.",
            worstCaseScenario: "Blocco operativo degli agenti su modifiche da una riga.",
          },
        ],
        stressTestConditions: [
          "Eseguire 100 micro-ticket con Fast-Track bypass per misurare la latenza complessiva.",
        ],
        proposedCounterMeasures: [
          "Procedura Fast-Track per ticket classificati come LOW complexity.",
        ],
        verdict: "MITIGATION_ACCEPTED",
        submittedAt: "2026-10-17T15:20:00.000Z",
      };

      const parsed = DevilsAdvocateFeedbackSchema.parse(feedback);
      expect(parsed.verdict).toBe("MITIGATION_ACCEPTED");
      expect(parsed.identifiedFallacies[0].category).toBe("OPERATIONAL_COMPLEXITY");
    });

    it("valida RoundtableConvergenceSchema con limite deterministico a 2 round", () => {
      const conv: RoundtableConvergence = {
        roundtableId: "ROUNDTABLE-RFC-005",
        currentRound: 2,
        maxRounds: 2,
        status: "CONSENSUS_REACHED",
        redTeamChallenged: true,
        resolvedAt: "2026-10-17T15:25:00.000Z",
      };

      const parsed = RoundtableConvergenceSchema.parse(conv);
      expect(parsed.currentRound).toBe(2);
      expect(parsed.status).toBe("CONSENSUS_REACHED");
    });

    it("valida TelegraphicMessageSchema con zeroFluff obbligatorio", () => {
      const msg: TelegraphicMessage = {
        senderRole: "engineering_lead",
        recipientRole: "leaf_developer",
        actionCode: "EXEC_AST_PATCH",
        targetFiles: ["src/contracts/ceremonies.ts"],
        payload: {
          ticketId: "TCK-14.1",
          schemaTarget: "AgileCeremonySchema",
        },
        constraints: ["NO_ANY", "PRESERVE_TESTS", "COVERAGE_100"],
        zeroFluff: true,
        timestamp: "2026-10-17T15:30:00.000Z",
      };

      const parsed = TelegraphicMessageSchema.parse(msg);
      expect(parsed.zeroFluff).toBe(true);
      expect(parsed.actionCode).toBe("EXEC_AST_PATCH");
      expect(parsed.constraints?.length).toBe(3);
    });
  });

  describe("Audit Dossier Extraction & Compliance", () => {
    const auditFilePath = path.resolve(
      process.cwd(),
      "docs/wiki/rnd/audits/agile-ceremonies-and-communication-efficiency.md"
    );

    it("estrae e valida le istanze strutturate dal dossier di audit", () => {
      const rawData = extractJsonBlock(auditFilePath) as any;

      // Valida array di cerimonie
      const ceremonies = z.array(AgileCeremonySchema).parse(rawData.ceremonies);
      expect(ceremonies.length).toBeGreaterThanOrEqual(2);
      expect(ceremonies.some((c) => c.type === "BRAINSTORMING_KICKOFF")).toBe(true);
      expect(ceremonies.some((c) => c.type === "INCIDENT_WAR_ROOM")).toBe(true);

      // Valida war room incident
      const incident = WarRoomIncidentSchema.parse(rawData.warRoomIncident);
      expect(incident.trigger).toBe("SELF_HEALING_EXHAUSTED");
      expect(incident.severity).toBe("CRITICAL");

      // Valida retrospective
      const retro = SprintRetrospectiveSchema.parse(rawData.retrospective);
      expect(retro.fpyPercentage).toBe(87.5);
      expect(retro.tokenCostUsd).toBe(1.42);

      // Valida devils advocate
      const devilsAdvocate = DevilsAdvocateFeedbackSchema.parse(rawData.devilsAdvocateFeedback);
      expect(devilsAdvocate.redTeamerRole).toBe("qa_lead");
      expect(devilsAdvocate.verdict).toBe("MITIGATION_ACCEPTED");

      // Valida convergenza roundtable
      const convergence = RoundtableConvergenceSchema.parse(rawData.roundtableConvergence);
      expect(convergence.maxRounds).toBe(2);
      expect(convergence.status).toBe("CONSENSUS_REACHED");

      // Valida messaggio telegrafico
      const telegraphic = TelegraphicMessageSchema.parse(rawData.telegraphicMessage);
      expect(telegraphic.zeroFluff).toBe(true);
      expect(telegraphic.actionCode).toBe("EXEC_AST_PATCH");
    });
  });

  describe("RFC-005 Consensus Blueprint Compliance", () => {
    const rfcFilePath = path.resolve(
      process.cwd(),
      "docs/wiki/rnd/rfcs/RFC-005-AGILE-CEREMONIES-AND-COLLABORATION-PROTOCOL.md"
    );

    it("estrae e valida RFC-005 secondo ConsensusRfcSchema", () => {
      const rawData = extractJsonBlock(rfcFilePath);
      const rfc = ConsensusRfcSchema.parse(rawData);

      expect(rfc.rfcId).toBe("RFC-005-AGILE-CEREMONIES-AND-COLLABORATION-PROTOCOL");
      expect(rfc.authorRole).toBe("rnd_lead");
      expect(rfc.status).toBe("CONSENSUS_REACHED");
      expect(rfc.sharedVision.length).toBeGreaterThan(50);

      // Valida i 4 topic
      expect(rfc.topics.length).toBe(4);
      const topicIds = rfc.topics.map((t) => t.id);
      expect(topicIds).toContain("TOPIC-1-NATIVE-AGILE-CEREMONIES");
      expect(topicIds).toContain("TOPIC-2-INCIDENT-WAR-ROOM");
      expect(topicIds).toContain("TOPIC-3-ANTI-ECHO-CHAMBER-PROTOCOL");
      expect(topicIds).toContain("TOPIC-4-CAVEMAN-RPC-TELEGRAPHIC");

      for (const topic of rfc.topics) {
        expect(topic.consensusReached).toBe(true);
        expect(topic.managerFeedbacks.length).toBeGreaterThanOrEqual(2);
        for (const fb of topic.managerFeedbacks) {
          expect(fb.approvalStatus).toBe("APPROVED");
        }
      }

      // Valida le 7 firme di consenso unanime
      expect(rfc.signatures.length).toBe(7);
      const signedRoles = rfc.signatures.map((s) => s.role);
      const expectedRoles = [
        "rnd_lead",
        "ai_lead",
        "engineering_lead",
        "product_lead",
        "qa_lead",
        "backend_lead",
        "mobile_lead",
      ];
      for (const role of expectedRoles) {
        expect(signedRoles).toContain(role);
      }

      // Valida i trade-off risolti
      expect(rfc.resolvedTradeOffs.length).toBe(4);

      // Valida i ticket di backlog azionabili
      expect(rfc.actionableBacklogTickets).toContain("TCK-14.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-14.2");
      expect(rfc.actionableBacklogTickets).toContain("TCK-14.3");
      expect(rfc.actionableBacklogTickets).toContain("TCK-14.4");
      expect(rfc.actionableBacklogTickets).toContain("TCK-15.1");
      expect(rfc.actionableBacklogTickets).toContain("TCK-15.2");
      expect(rfc.actionableBacklogTickets).toContain("TCK-15.3");
    });
  });
});
