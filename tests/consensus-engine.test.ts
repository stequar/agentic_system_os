import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ConsensusEngine } from "../src/core/consensus-engine.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Anti-Echo-Chamber Consensus Engine (TCK-15.5)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "consensus-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("inizializza una sessione di roundtable con Round 1 debate", () => {
    const session = ConsensusEngine.initRoundtable({
      topic: "Adozione nuovo framework di caching per SQLite",
      proposerRole: "backend_manager",
      redTeamerRole: "qa_lead",
    });

    expect(session.convergence.currentRound).toBe(1);
    expect(session.convergence.status).toBe("ROUND_1_DEBATE");
    expect(session.convergence.redTeamChallenged).toBe(true);
    expect(session.proposerRole).toBe("backend_manager");
    expect(session.redTeamerRole).toBe("qa_lead");
  });

  it("accoglie il feedback strutturato del Devil's Advocate ed avanza al Round 2", () => {
    const session = ConsensusEngine.initRoundtable({
      topic: "Transizione a un modello di memoria interamente in-memory",
      proposerRole: "engineering_lead",
      redTeamerRole: "ai_lead",
    });

    const updated = ConsensusEngine.submitRound1RedTeam(session.roundtableId, {
      redTeamerRole: "ai_lead",
      targetProposalId: "PROP-MEMORY-01",
      identifiedFallacies: [
        {
          category: "FINANCIAL_TOKEN",
          description: "Elevato consumo di RAM e rischio OOM per processi concorrenti",
          worstCaseScenario: "Crash improvviso del container senza persistenza dello stato",
        },
      ],
      stressTestConditions: ["Carico con 1000 transazioni simultanee in meno di 2 secondi"],
      proposedCounterMeasures: ["Aggiungere limite rigido di memoria a 256MB e swap LRU su disco"],
      verdict: "CHALLENGES_RAISED",
    });

    expect(updated.convergence.currentRound).toBe(2);
    expect(updated.convergence.status).toBe("ROUND_2_TRADE_OFFS");
    expect(updated.redTeamFeedback?.identifiedFallacies).toHaveLength(1);
  });

  it("conclude con CONSENSUS_REACHED se le mitigazioni soddisfano il Red Team", async () => {
    const session = ConsensusEngine.initRoundtable({
      topic: "Plugin SDK Worker Threads Sandboxing",
      proposerRole: "engineering_lead",
      redTeamerRole: "qa_lead",
    });

    ConsensusEngine.submitRound1RedTeam(session.roundtableId, {
      redTeamerRole: "qa_lead",
      targetProposalId: "PROP-WORKER-01",
      identifiedFallacies: [
        {
          category: "SECURITY",
          description: "Potenziale bypass del timeout se il thread va in loop sincrono infinito",
          worstCaseScenario: "Blocco del processo genitore per esaurimento risorse",
        },
      ],
      stressTestConditions: ["Esecuzione loop infinito while(true)"],
      proposedCounterMeasures: ["Hard worker.terminate() dopo 3000ms"],
      verdict: "CHALLENGES_RAISED",
    });

    let consensusEventFired = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("CONSENSUS_REACHED", () => {
      consensusEventFired = true;
    });

    const result = await ConsensusEngine.concludeRoundtable({
      targetPath: tempDir,
      roundtableId: session.roundtableId,
      mitigations: {
        "Hard termination": "Implementato worker.terminate() rigido con watchdog a 3000ms",
      },
      redTeamVerdict: "MITIGATION_ACCEPTED",
    });

    bus.unsubscribe(subId);

    expect(result.convergence.status).toBe("CONSENSUS_REACHED");
    expect(result.convergence.decidedByRole).toBe("COLLECTIVE_CONSENSUS");
    expect(consensusEventFired).toBe(true);

    // Verifica persistenza su disco
    const recordFile = path.join(tempDir, ".company-os", "ceremonies", "roundtables", `${session.roundtableId}.json`);
    const exists = await fs.stat(recordFile).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it("invoca automaticamente il CTO Tie-Break in caso di dissenso irrisolto a fine Round 2", async () => {
    const session = ConsensusEngine.initRoundtable({
      topic: "Scelta tra Monolite e Microservizi per modulo di analytics",
      proposerRole: "product_lead",
      redTeamerRole: "engineering_lead",
    });

    ConsensusEngine.submitRound1RedTeam(session.roundtableId, {
      redTeamerRole: "engineering_lead",
      targetProposalId: "PROP-ARCH-02",
      identifiedFallacies: [
        {
          category: "OPERATIONAL_COMPLEXITY",
          description: "Microservizi prematuri aumenterebbero la latenza di rete e i costi di manutenzione",
          worstCaseScenario: "Overhead operativo insostenibile per la dimensione attuale dell'harness",
        },
      ],
      stressTestConditions: ["Benchmark IPC locale vs chiamate gRPC"],
      proposedCounterMeasures: ["Mantenere modularità in-memory come primo step"],
      verdict: "CHALLENGES_RAISED",
    });

    let tieBreakEventFired = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("TIE_BREAK_INVOKED", () => {
      tieBreakEventFired = true;
    });

    const result = await ConsensusEngine.concludeRoundtable({
      targetPath: tempDir,
      roundtableId: session.roundtableId,
      mitigations: {
        "Contro-argomentazione": "Riteniamo comunque preferibile la separazione di processo",
      },
      redTeamVerdict: "UNRESOLVED_BLOCKER",
      ctoTieBreakDecision: "CTO Decision: Mantenere modularità in-memory per Sprint 15. Rivalutare scalabilità orizzontale in Fase 5.",
    });

    bus.unsubscribe(subId);

    expect(result.convergence.status).toBe("TIE_BREAK_INVOKED");
    expect(result.convergence.decidedByRole).toBe("CTO");
    expect(result.convergence.tieBreakDecision).toContain("CTO Decision: Mantenere modularità in-memory");
    expect(tieBreakEventFired).toBe(true);
  });
});
