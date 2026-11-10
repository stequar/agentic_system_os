import { type CompanyEvent } from "../contracts/events.js";
import { type ProcessQualityMetrics } from "../contracts/metrics.js";
import { AuditLogger } from "./audit-logger.js";
/**
 * Aggregatore per il calcolo empirico delle metriche di qualità, conformità e cooperazione:
 * - First-Pass Yield (FPY %): percentuale di ticket completati al primo passaggio senza autoguarigione.
 * - Mean Self-Healing Iterations: media delle iterazioni di fix richieste per ticket.
 * - Contract Compliance Rate: percentuale di rispetto dei contratti Zod a runtime.
 * - Audit Chain Integrity: stato di non-ripudiabilità crittografica Merkle.
 */
export declare class MetricsAggregator {
    /**
     * Calcola deterministicamente le metriche da una lista di eventi aziendali.
     */
    static calculateFromEvents(events: CompanyEvent[], auditChainIntact?: boolean, totalContractChecksOverride?: number): ProcessQualityMetrics;
    /**
     * Calcola le metriche leggendo il log crittografico da un'istanza di AuditLogger.
     */
    static calculateFromAuditLogger(auditLogger: AuditLogger): Promise<ProcessQualityMetrics>;
    /**
     * Calcola le metriche a partire dal targetPath del workspace.
     */
    static calculateFromPath(targetPath: string): Promise<ProcessQualityMetrics>;
}
//# sourceMappingURL=metrics-aggregator.d.ts.map