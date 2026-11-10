import fs from "node:fs/promises";
import path from "node:path";
import { TrajectoryResponseSchema, TrajectoryNodeSchema, } from "../contracts/studio.js";
import { MerkleAuditEntrySchema } from "../contracts/audit.js";
/**
 * Classifica un evento aziendale in una categoria visiva di traiettoria e ne genera un riassunto sintetico.
 */
export function classifyEvent(event) {
    const type = String(event.type);
    if (type === "TICKET_STATUS_CHANGED" ||
        type === "SESSION_STARTED" ||
        type === "SESSION_RESUMED" ||
        type === "TASK_STARTED" ||
        type === "TASK_COMPLETED" ||
        type === "TASK_FAILED") {
        let summary = `Transizione di stato: ${type}`;
        if (type === "TICKET_STATUS_CHANGED" && event.payload?.ticketId) {
            summary = `Ticket ${event.payload.ticketId}: ${event.payload.previousStatus || "TODO"} ➔ ${event.payload.newStatus || "IN_PROGRESS"}`;
        }
        else if (type === "SESSION_STARTED" || type === "SESSION_RESUMED") {
            summary = `Sessione ${type === "SESSION_STARTED" ? "avviata" : "ripristinata"} (${event.payload?.sessionId || event.sessionId || "default"})`;
        }
        return { category: "FSM_TRANSITION", summary };
    }
    if (type === "GATEKEEPER_TRIGGERED" ||
        type === "GATEKEEPER_PASSED" ||
        type === "GATEKEEPER_FAILED" ||
        type === "CONTRACT_VIOLATION" ||
        type === "SECURITY_ALERT" ||
        type === "DEPENDENCY_AUDIT_RESULT") {
        let summary = `Gatekeeper: ${type}`;
        if (type === "GATEKEEPER_PASSED")
            summary = "Deterministic Gatekeeper: Superato con successo (100% green) ✅";
        else if (type === "GATEKEEPER_FAILED")
            summary = "Deterministic Gatekeeper: Fallimento verifiche ❌";
        else if (type === "CONTRACT_VIOLATION")
            summary = `Violazione contrattuale: ${event.payload?.schema || "Schema Drift"}`;
        else if (type === "SECURITY_ALERT")
            summary = `Allarme di sicurezza perimetrale: ${event.payload?.reason || type}`;
        return { category: "QUALITY_GATE", summary };
    }
    if (type === "SELF_HEALING_ITERATION" ||
        type === "DIFF_GUARD_VIOLATION" ||
        type === "ROLLBACK_EXECUTED") {
        let summary = `Ciclo di auto-riparazione: ${type}`;
        if (type === "SELF_HEALING_ITERATION")
            summary = `Self-Healing iterazione ${event.payload?.iteration || 1}`;
        else if (type === "DIFF_GUARD_VIOLATION")
            summary = "AST Diff Guard: violazione invarianti di modifica codice";
        else if (type === "ROLLBACK_EXECUTED")
            summary = "Rollback atomico eseguito al safepoint pulito";
        return { category: "SELF_HEALING", summary };
    }
    if (type === "BUDGET_WARNING" ||
        type === "BUDGET_EXCEEDED" ||
        type === "CONTEXT_HEALTH_ALERT" ||
        type === "FINOPS_ALERT") {
        let summary = `Allarme FinOps / Context Health: ${type}`;
        if (type === "CONTEXT_HEALTH_ALERT")
            summary = `Context Health Alert: ${event.payload?.status || "ROT_RISK"} (${event.payload?.healthScore || 0}%)`;
        else if (type === "BUDGET_WARNING")
            summary = `Budget Warning: ${event.payload?.percentUsed || 80}% consumato`;
        else if (type === "BUDGET_EXCEEDED")
            summary = "Budget esaurito: attivato blocco SAFE_PAUSE";
        return { category: "FINOPS_ALERT", summary };
    }
    if (type.includes("STEER") ||
        type.includes("PAUSE") ||
        type.includes("RESUME") ||
        type.includes("HINT") ||
        type.includes("ABORT")) {
        return { category: "STEERING_ACTION", summary: `Azione Steering HITL: ${type}` };
    }
    if (type.includes("TOOL") || type.includes("INSPECT") || type.includes("ATTACH")) {
        return { category: "TOOL_EXECUTION", summary: `Esecuzione tool: ${type}` };
    }
    return { category: "SYSTEM_EVENT", summary: `Evento di sistema: ${type}` };
}
export class TrajectoryReader {
    /**
     * Legge in modalità tail-first inversa `.company-os/audit.jsonl`
     * estraendo i nodi decisionali paginati senza caricare l'intero log in RAM.
     */
    static async readTrajectory(targetPath, options) {
        const limit = Math.max(1, options?.limit || 50);
        const offset = Math.max(0, options?.offset || 0);
        const filterCategory = options?.category;
        const auditPath = path.join(path.resolve(targetPath), ".company-os", "audit.jsonl");
        let fileHandle;
        try {
            fileHandle = await fs.open(auditPath, "r");
        }
        catch {
            // Se il file non esiste ancora, restituisce un risultato vuoto conforme
            return TrajectoryResponseSchema.parse({
                nodes: [],
                totalCount: 0,
                limit,
                offset,
                hasMore: false,
                updatedAt: new Date().toISOString(),
            });
        }
        try {
            const stat = await fileHandle.stat();
            const fileSize = stat.size;
            if (fileSize === 0) {
                return TrajectoryResponseSchema.parse({
                    nodes: [],
                    totalCount: 0,
                    limit,
                    offset,
                    hasMore: false,
                    updatedAt: new Date().toISOString(),
                });
            }
            // Lettura inversa a ritroso a chunk fissi di 64KB per garantire footprint < 5MB
            const CHUNK_SIZE = 64 * 1024;
            let position = fileSize;
            let remainder = "";
            const lines = [];
            while (position > 0) {
                const bytesToRead = Math.min(CHUNK_SIZE, position);
                position -= bytesToRead;
                const buffer = Buffer.alloc(bytesToRead);
                await fileHandle.read(buffer, 0, bytesToRead, position);
                const chunkStr = buffer.toString("utf-8") + remainder;
                const chunkLines = chunkStr.split("\n");
                // La prima porzione (a sinistra) potrebbe essere parziale: diventa il remainder per il chunk precedente
                remainder = chunkLines.shift() || "";
                // Le righe complete vengono aggiunte a ritroso
                for (let i = chunkLines.length - 1; i >= 0; i--) {
                    const trimmed = chunkLines[i].trim();
                    if (trimmed) {
                        lines.push(trimmed);
                    }
                }
            }
            if (remainder.trim()) {
                lines.push(remainder.trim());
            }
            // Parsing e conversione dei record MerkleAuditEntry
            const parsedNodes = [];
            for (const line of lines) {
                try {
                    const raw = JSON.parse(line);
                    const parsedEntry = MerkleAuditEntrySchema.parse(raw);
                    const { category, summary } = classifyEvent(parsedEntry.event);
                    if (!filterCategory || category === filterCategory) {
                        const node = TrajectoryNodeSchema.parse({
                            id: parsedEntry.event.id,
                            sequenceNumber: parsedEntry.sequenceNumber,
                            category,
                            sourceAgent: parsedEntry.event.sourceAgent,
                            type: String(parsedEntry.event.type),
                            summary,
                            timestamp: parsedEntry.timestamp,
                            payload: parsedEntry.event.payload,
                            merkleHash: parsedEntry.currentHash,
                            signature: parsedEntry.signature,
                        });
                        parsedNodes.push(node);
                    }
                }
                catch {
                    // Ignora linee non conformi o parziali
                }
            }
            const totalCount = parsedNodes.length;
            const paginatedNodes = parsedNodes.slice(offset, offset + limit);
            const hasMore = offset + paginatedNodes.length < totalCount;
            return TrajectoryResponseSchema.parse({
                nodes: paginatedNodes,
                totalCount,
                limit,
                offset,
                hasMore,
                updatedAt: new Date().toISOString(),
            });
        }
        finally {
            await fileHandle.close();
        }
    }
}
//# sourceMappingURL=trajectory-reader.js.map