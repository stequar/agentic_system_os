import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  RoundtableConvergenceSchema,
  type RoundtableConvergence,
  DevilsAdvocateFeedbackSchema,
  type DevilsAdvocateFeedback,
} from "../contracts/ceremonies.js";
import { CompanyEventBus } from "./event-bus.js";
import { CavemanFormatter } from "./caveman-formatter.js";
import { FluffTelemetry } from "./fluff-telemetry.js";

export interface ActiveRoundtableSession {
  roundtableId: string;
  topic: string;
  proposerRole: string;
  redTeamerRole: string;
  convergence: RoundtableConvergence;
  redTeamFeedback?: DevilsAdvocateFeedback;
  mitigationsProposed?: Record<string, string>;
  createdAt: string;
}

/**
 * Anti-Echo-Chamber Consensus Engine.
 * Gestisce il confronto orizzontale strutturato tra agenti Domain Lead,
 * imponendo un Devil's Advocate / Red-Teamer obbligatorio, un limite tassativo di 2 round
 * e un meccanismo deterministico di Tie-Break del CTO per evitare stalli infiniti
 * senza richiedere il micromonitoraggio del CEO.
 */
export class ConsensusEngine {
  private static sessions = new Map<string, ActiveRoundtableSession>();

  /**
   * Inizializza una nuova sessione di roundtable e apre il Round 1.
   */
  public static initRoundtable(params: {
    roundtableId?: string;
    topic: string;
    proposerRole: string;
    redTeamerRole?: string;
  }): ActiveRoundtableSession {
    const roundtableId =
      params.roundtableId ||
      `ROUNDTABLE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const redTeamerRole = params.redTeamerRole || "qa_lead";

    const convergence = RoundtableConvergenceSchema.parse({
      roundtableId,
      currentRound: 1,
      maxRounds: 2,
      status: "ROUND_1_DEBATE",
      redTeamChallenged: true,
      resolvedAt: new Date().toISOString(),
    });

    const session: ActiveRoundtableSession = {
      roundtableId,
      topic: params.topic,
      proposerRole: params.proposerRole,
      redTeamerRole,
      convergence,
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(roundtableId, session);
    return session;
  }

  /**
   * Registra il feedback strutturato del Devil's Advocate / Red-Teamer nel Round 1.
   */
  public static submitRound1RedTeam(
    roundtableId: string,
    feedback: Omit<DevilsAdvocateFeedback, "submittedAt">
  ): ActiveRoundtableSession {
    const session = this.sessions.get(roundtableId);
    if (!session) {
      throw new Error(`Roundtable session ${roundtableId} not found`);
    }

    const validatedFeedback = DevilsAdvocateFeedbackSchema.parse({
      ...feedback,
      submittedAt: new Date().toISOString(),
    });

    session.redTeamFeedback = validatedFeedback;
    session.convergence.currentRound = 2;
    session.convergence.status = "ROUND_2_TRADE_OFFS";

    return session;
  }

  /**
   * Esegue il Round 2 con valutazione delle contromisure.
   * Se il Red Team accetta le mitigazioni -> CONSENSUS_REACHED.
   * Se vi è ancora dissenso o blocco -> TIE_BREAK_INVOKED con verdetto architetturale del CTO.
   */
  public static async concludeRoundtable(params: {
    targetPath?: string;
    roundtableId: string;
    mitigations: Record<string, string>;
    redTeamVerdict: "MITIGATION_ACCEPTED" | "UNRESOLVED_BLOCKER";
    ctoTieBreakDecision?: string;
  }): Promise<{ session: ActiveRoundtableSession; convergence: RoundtableConvergence }> {
    const session = this.sessions.get(params.roundtableId);
    if (!session) {
      throw new Error(`Roundtable session ${params.roundtableId} not found`);
    }

    session.mitigationsProposed = params.mitigations;

    if (params.redTeamVerdict === "MITIGATION_ACCEPTED") {
      session.convergence.status = "CONSENSUS_REACHED";
      session.convergence.decidedByRole = "COLLECTIVE_CONSENSUS";
    } else {
      // Disaccordo irrisolto a fine Round 2: Scatta il Tie-Break autoritativo del CTO
      session.convergence.status = "TIE_BREAK_INVOKED";
      session.convergence.decidedByRole = "CTO";
      session.convergence.tieBreakDecision =
        params.ctoTieBreakDecision ||
        `CTO Directive: Approved with mandatory sandbox constraints and automated telemetry guards as required by Red Team. Proceeding without CEO intervention.`;
    }

    session.convergence.resolvedAt = new Date().toISOString();

    // Formattazione teleografica Caveman-RPC e registrazione FluffTelemetry
    try {
      const rpcMsg = CavemanFormatter.createMessage({
        senderRole: session.proposerRole,
        recipientRole: session.redTeamerRole,
        actionCode: session.convergence.status,
        targetFiles: [],
        constraints: Object.keys(params.mitigations),
        payload: {
          roundtableId: params.roundtableId,
          mitigations: params.mitigations,
        },
      });
      const formattedRpc = CavemanFormatter.format(rpcMsg);
      const verboseEquivalent = `Gentile ${session.redTeamerRole}, ecco la proposta per la tavola rotonda '${session.topic}': ${JSON.stringify(params.mitigations)}. Spero che questo aiuti, grazie mille!`;
      FluffTelemetry.getInstance().recordHandoff(
        verboseEquivalent,
        formattedRpc,
        params.targetPath
      );
    } catch {
      // Best effort telemetry
    }

    // Persistenza opzionale su disco
    if (params.targetPath) {
      const dir = path.resolve(params.targetPath, ".company-os", "ceremonies", "roundtables");
      await fs.mkdir(dir, { recursive: true });
      const recordPath = path.resolve(dir, `${params.roundtableId}.json`);
      await fs.writeFile(recordPath, JSON.stringify(session, null, 2), "utf-8");
    }

    // Pubblicazione su CompanyEventBus
    try {
      const bus = CompanyEventBus.getInstance();
      bus.publish({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: session.convergence.status === "CONSENSUS_REACHED" ? "CONSENSUS_REACHED" : "TIE_BREAK_INVOKED",
        sourceAgent: session.convergence.decidedByRole || "ConsensusEngine",
        level: session.convergence.status === "CONSENSUS_REACHED" ? "info" : "warn",
        payload: {
          roundtableId: params.roundtableId,
          topic: session.topic,
          status: session.convergence.status,
          tieBreakDecision: session.convergence.tieBreakDecision,
        },
      });
    } catch {
      // Best effort
    }

    return { session, convergence: session.convergence };
  }

  public static getSession(roundtableId: string): ActiveRoundtableSession | undefined {
    return this.sessions.get(roundtableId);
  }
}
