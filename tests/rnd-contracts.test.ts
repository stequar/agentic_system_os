import { describe, it, expect } from "vitest";
import {
  OneOnOneInterviewSchema,
  ManagerFeedbackSchema,
  ConsensusRfcSchema,
} from "../src/contracts/rnd.js";

describe("R&D Contracts", () => {
  it("valida correttamente un'intervista 1:1", () => {
    const validInterview = {
      id: "1ON1-2026-10-BACKEND",
      interviewerRole: "rnd_lead",
      intervieweeRole: "backend_manager",
      date: new Date().toISOString(),
      painPoints: ["Latenza eccessiva nelle query ORM", "Mancanza di contratti simmetrici con Mobile"],
      technicalDebt: ["Legacy models senza Pydantic v2"],
      featureRequests: ["Generatore automatico di contratti TypeScript to Pydantic"],
      visionAndAspirations: "Avere un backend asincrono puro e type-safe al 100%",
      summary: "Intervista proficua: priorità assoluta su sincronizzazione contratti API.",
    };

    const parsed = OneOnOneInterviewSchema.parse(validInterview);
    expect(parsed.id).toBe("1ON1-2026-10-BACKEND");
    expect(parsed.painPoints.length).toBe(2);
  });

  it("valida correttamente il feedback di un manager su un topic di RFC", () => {
    const validFeedback = {
      managerRole: "mobile_manager",
      topicId: "TOPIC-1-CONTRACT-SYNC",
      opinion: "Completamente favorevole all'adozione di Swift 6 Codable & Sendable.",
      concerns: ["Assicurarsi che le date siano rigorosamente ISO8601"],
      proposedTradeOffs: ["Accettiamo snake_case su JSON purché mappato con CodingKeys"],
      approvalStatus: "APPROVED" as const,
    };

    const parsed = ManagerFeedbackSchema.parse(validFeedback);
    expect(parsed.approvalStatus).toBe("APPROVED");
    expect(parsed.proposedTradeOffs.length).toBe(1);
  });

  it("valida un Consensus RFC completo con firme dei manager", () => {
    const validRfc = {
      rfcId: "RFC-001-UNIVERSAL-SCAFFOLDING",
      title: "Universal Multi-Agent Scaffolding & Native Plugin Architecture",
      authorRole: "rnd_lead",
      status: "CONSENSUS_REACHED" as const,
      sharedVision: "Creare un OS agentico universale compatibile con qualsiasi stack moderno, estendibile tramite plugin community e MCP.",
      topics: [
        {
          id: "TOPIC-1",
          title: "Sincronizzazione Contrattuale Universale",
          originatingInterviews: ["1ON1-2026-10-BACKEND", "1ON1-2026-10-MOBILE"],
          problemStatement: "Discrepanze contrattuali tra backend e mobile causano rotture a runtime.",
          proposedSolution: "Generatore Zod deterministico verso Pydantic v2 e Swift Codable.",
          managerFeedbacks: [
            {
              managerRole: "backend_manager",
              topicId: "TOPIC-1",
              opinion: "Favorevole, riduce i test manuali.",
              concerns: [],
              proposedTradeOffs: [],
              approvalStatus: "APPROVED" as const,
            },
            {
              managerRole: "mobile_manager",
              topicId: "TOPIC-1",
              opinion: "Essenziale per garantire la stabilità di iOS.",
              concerns: [],
              proposedTradeOffs: [],
              approvalStatus: "APPROVED" as const,
            },
          ],
          consensusReached: true,
        },
      ],
      resolvedTradeOffs: ["Adottato mapping CodingKeys esplicito per preservare snake_case in Python e camelCase in Swift"],
      signatures: [
        { role: "rnd_lead", signedAt: new Date().toISOString() },
        { role: "backend_manager", signedAt: new Date().toISOString() },
        { role: "mobile_manager", signedAt: new Date().toISOString() },
        { role: "qa_lead", signedAt: new Date().toISOString() },
      ],
      actionableBacklogTickets: ["TCK-3.1", "TCK-3.3"],
    };

    const parsed = ConsensusRfcSchema.parse(validRfc);
    expect(parsed.status).toBe("CONSENSUS_REACHED");
    expect(parsed.signatures.length).toBe(4);
    expect(parsed.topics[0].consensusReached).toBe(true);
  });
});
