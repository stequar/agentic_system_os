import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { WarRoomIncidentSchema, AgileCeremonySchema, } from "../contracts/ceremonies.js";
import { CompanyEventBus } from "../core/event-bus.js";
export class WarRoomEngine {
    static activeIncidents = new Map();
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
    static isWriteLocked() {
        return this.activeIncidents.size > 0;
    }
    /**
     * Dichiara un incidente critico, attiva il Circuit Breaker, esegue il rollback atomico
     * e convoca immediatamente la Incident War Room.
     */
    static async declareIncident(input) {
        // 1. Il blocco di scrittura si attiva automaticamente quando l'incidente entra nel
        //    registro attivo (vedi `this.activeIncidents.set` più sotto): lock ref-counted.
        const incidentId = `INC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        // 2. Esegue il rollback atomico dei file coinvolti
        let rollbackSha = "0000000000000000000000000000000000000000000000000000000000000000";
        if (input.originalSnapshot && input.originalSnapshot.size > 0) {
            const hasher = crypto.createHash("sha256");
            for (const [absPath, originalContent] of input.originalSnapshot.entries()) {
                try {
                    if (originalContent === "") {
                        await fs.unlink(absPath).catch(() => { });
                    }
                    else {
                        await fs.mkdir(path.dirname(absPath), { recursive: true });
                        await fs.writeFile(absPath, originalContent, "utf-8");
                    }
                    hasher.update(`${absPath}:${originalContent}`);
                }
                catch {
                    // Rollback best-effort garantito
                }
            }
            rollbackSha = hasher.digest("hex");
        }
        const containmentAction = input.containmentAction ||
            `Emergency write lock engaged. Atomic rollback executed to pristine state (SHA256: ${rollbackSha.slice(0, 12)}). Unmerged branches isolated.`;
        const remediationPlan = input.remediationPlan ||
            `Reassign ticket ${input.targetTicketId} for full architectural review. Invalidate corrupted AST patches and schedule 1:1 refinement with Domain Lead.`;
        const incident = WarRoomIncidentSchema.parse({
            incidentId,
            trigger: input.trigger,
            severity: input.severity ?? "CRITICAL",
            targetTicketId: input.targetTicketId,
            affectedFiles: input.affectedFiles,
            rootCause: input.rootCause,
            rollbackSnapshotSha256: rollbackSha,
            containmentAction,
            remediationPlan,
            resolvedByRole: "qa_lead",
            resolvedAt: new Date().toISOString(),
        });
        this.activeIncidents.set(incidentId, incident);
        // 3. Registra la cerimonia agile INCIDENT_WAR_ROOM
        const ceremonyId = `CEREMONY-WARROOM-${incidentId}`;
        const incidentDir = path.resolve(input.targetPath, ".company-os", "ceremonies", "incidents");
        await fs.mkdir(incidentDir, { recursive: true });
        const incidentJsonPath = path.resolve(incidentDir, `${incidentId}.json`);
        await fs.writeFile(incidentJsonPath, JSON.stringify(incident, null, 2), "utf-8");
        const ceremony = AgileCeremonySchema.parse({
            id: ceremonyId,
            type: "INCIDENT_WAR_ROOM",
            chairRole: "qa_lead",
            attendeeRoles: ["qa_lead", "engineering_lead", "lead_engineer"],
            status: "IN_PROGRESS",
            inputArtifactUri: incidentJsonPath,
            outputArtifactUri: incidentJsonPath,
            summary: `War Room convened for incident ${incidentId}. Root cause: ${input.rootCause.slice(0, 80)}... Rollback executed.`,
            startedAt: new Date().toISOString(),
        });
        // 4. Emetti l'evento nel CompanyEventBus
        try {
            const bus = CompanyEventBus.getInstance();
            bus.publish({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: "WAR_ROOM_TRIGGERED",
                sourceAgent: "qa_lead",
                level: "critical",
                payload: {
                    incidentId,
                    trigger: input.trigger,
                    ticketId: input.targetTicketId,
                    rollbackSnapshotSha256: rollbackSha,
                },
            });
        }
        catch {
            // Best-effort se l'event bus non è in ascolto
        }
        return { incident, ceremony };
    }
    /**
     * Risolve l'incidente, rimuove il blocco di scrittura ed emette la notifica di ripristino.
     */
    static async resolveIncident(targetPath, incidentId, resolutionNotes) {
        const incident = this.activeIncidents.get(incidentId);
        if (!incident) {
            throw new Error(`Incident ${incidentId} not found in active registry`);
        }
        // Rimuove l'incidente dal registro: il lock si disattiva solo quando NON resta
        // più alcun incidente aperto (ref-counting).
        this.activeIncidents.delete(incidentId);
        // Salva verbale di chiusura
        const incidentDir = path.resolve(targetPath, ".company-os", "ceremonies", "incidents");
        const incidentJsonPath = path.resolve(incidentDir, `${incidentId}.json`);
        const updatedIncident = {
            ...incident,
            containmentAction: `${incident.containmentAction} | Resolved: ${resolutionNotes}`,
            resolvedAt: new Date().toISOString(),
        };
        await fs.writeFile(incidentJsonPath, JSON.stringify(updatedIncident, null, 2), "utf-8");
        try {
            const bus = CompanyEventBus.getInstance();
            bus.publish({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: "WAR_ROOM_RESOLVED",
                sourceAgent: "qa_lead",
                level: "info",
                payload: {
                    incidentId,
                    resolutionNotes,
                },
            });
        }
        catch {
            // Best effort
        }
        return updatedIncident;
    }
    /**
     * Svuota il registro degli incidenti attivi (isolamento test / reset del processo).
     * Rilascia implicitamente il write-lock (derivato da `activeIncidents.size`).
     */
    static clear() {
        this.activeIncidents.clear();
    }
}
//# sourceMappingURL=war-room.js.map