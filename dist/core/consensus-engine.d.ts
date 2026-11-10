import { type RoundtableConvergence, type DevilsAdvocateFeedback } from "../contracts/ceremonies.js";
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
export declare class ConsensusEngine {
    private static sessions;
    /**
     * Inizializza una nuova sessione di roundtable e apre il Round 1.
     */
    static initRoundtable(params: {
        roundtableId?: string;
        topic: string;
        proposerRole: string;
        redTeamerRole?: string;
    }): ActiveRoundtableSession;
    /**
     * Registra il feedback strutturato del Devil's Advocate / Red-Teamer nel Round 1.
     */
    static submitRound1RedTeam(roundtableId: string, feedback: Omit<DevilsAdvocateFeedback, "submittedAt">): ActiveRoundtableSession;
    /**
     * Esegue il Round 2 con valutazione delle contromisure.
     * Se il Red Team accetta le mitigazioni -> CONSENSUS_REACHED.
     * Se vi è ancora dissenso o blocco -> TIE_BREAK_INVOKED con verdetto architetturale del CTO.
     */
    static concludeRoundtable(params: {
        targetPath?: string;
        roundtableId: string;
        mitigations: Record<string, string>;
        redTeamVerdict: "MITIGATION_ACCEPTED" | "UNRESOLVED_BLOCKER";
        ctoTieBreakDecision?: string;
    }): Promise<{
        session: ActiveRoundtableSession;
        convergence: RoundtableConvergence;
    }>;
    static getSession(roundtableId: string): ActiveRoundtableSession | undefined;
    /**
     * Svuota il registro delle sessioni (isolamento test / reset del processo long-running).
     */
    static clear(): void;
}
//# sourceMappingURL=consensus-engine.d.ts.map