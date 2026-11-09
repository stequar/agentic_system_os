import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { CeremonyDispatcher } from "../src/core/ceremony-dispatcher.js";
import { ConsensusEngine } from "../src/core/consensus-engine.js";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { CavemanFormatter } from "../src/core/caveman-formatter.js";
import { FastDecisionGate } from "../src/core/fast-decision-gate.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("E2E Autonomous Agile Multi-Agent Workflow Simulation (Sprint 15)", () => {
  let tempDir: string;
  let dispatcher: CeremonyDispatcher;
  const capturedEvents: string[] = [];

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agile-e2e-sim-"));
    dispatcher = new CeremonyDispatcher(tempDir);
    capturedEvents.length = 0;

    const bus = CompanyEventBus.getInstance();
    bus.subscribe("*", (event) => {
      capturedEvents.push(event.type);
    });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("esegue l'intero ciclo delle 5 cerimonie agili in piena autonomia e cooperazione senza intervento del CEO", async () => {
    // -------------------------------------------------------------
    // FASE 1: BRAINSTORMING KICKOFF (Chair: rnd_lead)
    // -------------------------------------------------------------
    const brainstorming = await dispatcher.startCeremony({
      type: "BRAINSTORMING_KICKOFF",
      chairRole: "rnd_lead",
      attendeeRoles: ["product_lead", "engineering_lead", "ai_lead"],
      summary: "Brainstorming su migrazione a vettori locali e ottimizzazione KV-Cache per multi-agente",
    });

    expect(brainstorming.status).toBe("IN_PROGRESS");

    // Subagenti cooperano per formalizzare le idee emerse
    const concludedBrainstorming = await dispatcher.concludeCeremony({
      ceremonyId: brainstorming.id,
      summary: "Accordo su 3 direttive di spike: 1) SQLite VSS, 2) Invariant Protection, 3) Caveman-RPC",
      outputArtifactUri: "docs/wiki/rnd/spikes/kv-cache-spike.md",
    });

    expect(concludedBrainstorming.status).toBe("CONCLUDED");

    // -------------------------------------------------------------
    // FASE 2: BACKLOG REFINEMENT 1:1 (Chair: product_lead con backend_manager)
    // -------------------------------------------------------------
    const refinement = await dispatcher.startCeremony({
      type: "BACKLOG_REFINEMENT_1ON1",
      chairRole: "product_lead",
      attendeeRoles: ["backend_manager"],
      summary: "Refinement 1:1 per definire acceptance criteria del ticket TCK-VEC-01",
    });

    // Comunicazione telegrafica tra product_lead e backend_manager senza convenevoli
    const rawHandoff = `
Certamente! Ecco i criteri per il nuovo endpoint:
Implementare /api/vectors con validazione Zod e rate-limit.
Verificare preservazione in src/api/vectors.ts.
Grazie mille! Spero che questo aiuti.
    `.trim();

    const cleaned = CavemanFormatter.stripFluff(rawHandoff);
    const telegMsg = CavemanFormatter.createMessage({
      senderRole: "product_lead",
      recipientRole: "backend_manager",
      actionCode: "DEFINE_ACCEPTANCE_CRITERIA",
      targetFiles: ["src/api/vectors.ts"],
      constraints: ["STRICT_ZOD", "RATE_LIMIT_100_RPS"],
      payload: { criteria: cleaned.cleanedText },
    });

    const savings = CavemanFormatter.calculateSavings(rawHandoff, cleaned.cleanedText);
    expect(savings.savingsRatioPercent).toBeGreaterThan(0);

    // Kahneman System-1 Gate per triage automatico istantaneo
    const gateDecision = FastDecisionGate.evaluate({
      action: "FIX_TYPE_ERROR",
      targetFiles: ["src/api/vectors.ts"],
    });
    expect(gateDecision.decision).toBe("FAST_APPROVE");
    expect(gateDecision.tokenCostUsd).toBe(0);

    await dispatcher.concludeCeremony({
      ceremonyId: refinement.id,
      summary: "Ticket TCK-VEC-01 raffinato con 3 punti storia e schemi contrattuali definiti.",
    });

    // -------------------------------------------------------------
    // FASE 3: ARCHITECTURE REVIEW ROUNDTABLE con DEVIL'S ADVOCATE (Chair: engineering_lead)
    // -------------------------------------------------------------
    const archRoundtable = await dispatcher.startCeremony({
      type: "ARCHITECTURE_REVIEW_ROUNDTABLE",
      chairRole: "engineering_lead",
      attendeeRoles: ["backend_manager", "qa_lead", "ai_lead"],
      summary: "Revisione architetturale per storage vettoriale in SQLite vs pgvector",
    });

    // ConsensusEngine apre il Round 1
    const session = ConsensusEngine.initRoundtable({
      topic: "SQLite VSS vs Postgres pgvector per memoria a lungo termine",
      proposerRole: "backend_manager",
      redTeamerRole: "ai_lead",
    });

    // Round 1: Red-Teamer (ai_lead) solleva vulnerabilità ed obiezioni strutturate
    ConsensusEngine.submitRound1RedTeam(session.roundtableId, {
      redTeamerRole: "ai_lead",
      targetProposalId: "PROP-VECTOR-STORAGE-01",
      identifiedFallacies: [
        {
          category: "OPERATIONAL_COMPLEXITY",
          description: "Postgres esterno introduce dipendenza da demone di rete non-embedded per l'OS",
          worstCaseScenario: "Fallimento onboarding zero-config per nuovi sviluppatori locali",
        },
      ],
      stressTestConditions: ["Test offline scaffolding senza Docker attivo"],
      proposedCounterMeasures: ["Adottare SQLite locale embedded con fallback file-based"],
      verdict: "CHALLENGES_RAISED",
    });

    // Round 2: Il backend_manager propone mitigazione accettando SQLite embedded
    // Il Red Team accetta le contromisure -> CONSENSUS RAGGIUNTO AUTONOMAMENTE!
    const consensusResult = await ConsensusEngine.concludeRoundtable({
      targetPath: tempDir,
      roundtableId: session.roundtableId,
      mitigations: {
        "Contromisura": "Accettata transizione a SQLite embedded per garantire zero-config offline",
      },
      redTeamVerdict: "MITIGATION_ACCEPTED",
    });

    expect(consensusResult.convergence.status).toBe("CONSENSUS_REACHED");
    expect(consensusResult.convergence.decidedByRole).toBe("COLLECTIVE_CONSENSUS");

    await dispatcher.concludeCeremony({
      ceremonyId: archRoundtable.id,
      summary: "Consenso unanime raggiunto dopo Round 2: adottato SQLite embedded. Nessun veto rimasto.",
    });

    // -------------------------------------------------------------
    // FASE 4: INCIDENT WAR ROOM (Simulazione scatto di emergenza su regressione)
    // -------------------------------------------------------------
    const criticalFilePath = path.join(tempDir, "vector-index.ts");
    const pristineCode = "export const version = '1.0.0';";
    await fs.writeFile(criticalFilePath, pristineCode, "utf-8");

    // Simulazione regressione introdotta accidentalmente da un leaf dev
    await fs.writeFile(criticalFilePath, "FATAL REGRESSION CODE SYNTAX ERROR", "utf-8");

    const snapshot = new Map<string, string>([[criticalFilePath, pristineCode]]);

    // Scatto automatico Circuit Breaker War Room
    const warRoom = await WarRoomEngine.declareIncident({
      targetPath: tempDir,
      trigger: "CRITICAL_REGRESSION",
      severity: "CRITICAL",
      targetTicketId: "TCK-VEC-01",
      affectedFiles: [criticalFilePath],
      rootCause: "Corruzione sintattica dell'indice vettoriale che comprometteva il caricamento",
      originalSnapshot: snapshot,
    });

    // Verifica isolamento e rollback immediato
    expect(WarRoomEngine.isWriteLocked()).toBe(true);
    const restoredCode = await fs.readFile(criticalFilePath, "utf-8");
    expect(restoredCode).toBe(pristineCode);

    // Risoluzione guidata della War Room da parte del QA Lead
    await WarRoomEngine.resolveIncident(
      tempDir,
      warRoom.incident.incidentId,
      "Ripristinato snapshot sano e isolata la patch corrotta"
    );
    expect(WarRoomEngine.isWriteLocked()).toBe(false);

    // -------------------------------------------------------------
    // FASE 5: SPRINT RETROSPECTIVE (Chair: product_lead)
    // -------------------------------------------------------------
    const retrospective = await dispatcher.startCeremony({
      type: "SPRINT_RETROSPECTIVE",
      chairRole: "product_lead",
      attendeeRoles: ["engineering_lead", "qa_lead", "ai_lead", "backend_manager"],
      summary: "Retrospettiva di chiusura dello sprint autonomo",
    });

    await dispatcher.concludeCeremony({
      ceremonyId: retrospective.id,
      summary: "Analisi delle performance dello sprint: zero interventi CEO, alta resilienza nella War Room.",
      retrospectiveData: {
        sprintId: "SPRINT-15-AUTONOMOUS",
        fpyPercentage: 94.0,
        totalSelfHealingCycles: 1,
        tokenCostUsd: 0.38,
        cacheHitRatePercentage: 89.2,
        bottlenecksIdentified: ["Tempo di rilevamento regressione nel modulo vettoriale"],
        technicalDebtTickets: [],
        actionItems: ["Attivare TIA preventivo pre-merge nei ticket vettoriali"],
      },
    });

    // -------------------------------------------------------------
    // VERIFICHE FINALI SULL'INTERO CICLO E SUGLI EVENTI AZIENDALI
    // -------------------------------------------------------------
    const allCeremonies = dispatcher.listCeremonies();
    expect(allCeremonies.length).toBe(4); // Brainstorming, Refinement, Architecture Review, Retrospective (+ War Room registrata in incidents)

    // Tutti gli eventi critici sono transitati sul bus aziendale
    expect(capturedEvents).toContain("CEREMONY_STARTED");
    expect(capturedEvents).toContain("CEREMONY_CONCLUDED");
    expect(capturedEvents).toContain("CONSENSUS_REACHED");
    expect(capturedEvents).toContain("WAR_ROOM_TRIGGERED");
    expect(capturedEvents).toContain("WAR_ROOM_RESOLVED");
  });
});
