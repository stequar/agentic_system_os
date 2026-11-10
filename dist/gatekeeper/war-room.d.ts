import { type WarRoomIncident, type WarRoomTrigger, type AgileCeremony } from "../contracts/ceremonies.js";
export interface DeclareIncidentInput {
    targetPath: string;
    trigger: WarRoomTrigger;
    severity?: "HIGH" | "CRITICAL";
    targetTicketId: string;
    affectedFiles: string[];
    rootCause: string;
    originalSnapshot?: Map<string, string>;
    containmentAction?: string;
    remediationPlan?: string;
}
export declare class WarRoomEngine {
    private static activeIncidents;
    /**
     * Verifica se il blocco di scrittura di emergenza è attualmente attivo.
     *
     * Il lock è derivato dall'insieme degli incidenti aperti (ref-counting): resta attivo
     * finché ESISTE almeno un incidente non risolto. Un singolo booleano globale era errato —
     * risolvere un incidente mentre un altro è ancora aperto rilasciava il lock prematuramente.
     *
     * NOTA (advisory): questo è un segnale consumato dall'orchestratore/UI; non intercetta di per
     * sé ogni scrittura su disco. L'enforcement hard a livello di `atomicWriteFile` è lavoro futuro.
     */
    static isWriteLocked(): boolean;
    /**
     * Dichiara un incidente critico, attiva il Circuit Breaker, esegue il rollback atomico
     * e convoca immediatamente la Incident War Room.
     */
    static declareIncident(input: DeclareIncidentInput): Promise<{
        incident: WarRoomIncident;
        ceremony: AgileCeremony;
    }>;
    /**
     * Risolve l'incidente, rimuove il blocco di scrittura ed emette la notifica di ripristino.
     */
    static resolveIncident(targetPath: string, incidentId: string, resolutionNotes: string): Promise<WarRoomIncident>;
    /**
     * Svuota il registro degli incidenti attivi (isolamento test / reset del processo).
     * Rilascia implicitamente il write-lock (derivato da `activeIncidents.size`).
     */
    static clear(): void;
}
//# sourceMappingURL=war-room.d.ts.map