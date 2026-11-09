import path from "node:path";
import {
  type CompanyEvent,
} from "../contracts/events.js";
import {
  ProcessQualityMetricsSchema,
  type ProcessQualityMetrics,
} from "../contracts/metrics.js";
import { AuditLogger } from "./audit-logger.js";

/**
 * Aggregatore per il calcolo empirico delle metriche di qualità, conformità e cooperazione:
 * - First-Pass Yield (FPY %): percentuale di ticket completati al primo passaggio senza autoguarigione.
 * - Mean Self-Healing Iterations: media delle iterazioni di fix richieste per ticket.
 * - Contract Compliance Rate: percentuale di rispetto dei contratti Zod a runtime.
 * - Audit Chain Integrity: stato di non-ripudiabilità crittografica Merkle.
 */
export class MetricsAggregator {
  /**
   * Calcola deterministicamente le metriche da una lista di eventi aziendali.
   */
  static calculateFromEvents(
    events: CompanyEvent[],
    auditChainIntact: boolean = true,
    totalContractChecksOverride?: number
  ): ProcessQualityMetrics {
    const ticketStats = new Map<
      string,
      { healingCount: number; failed: boolean; completed: boolean }
    >();

    let contractViolations = 0;
    let explicitContractChecks = 0;

    for (const event of events) {
      if (event.type === "CONTRACT_VIOLATION") {
        contractViolations++;
      } else if (event.type === "CONTRACT_CHECK_PASSED") {
        explicitContractChecks++;
      }

      // Estrazione ticketId dal payload se presente
      const payload = event.payload || {};
      const candidateId = payload.ticketId || payload.ticket || payload.id;
      const ticketId =
        typeof candidateId === "string" && /^TCK-[\w\.\-]+$/.test(candidateId)
          ? candidateId
          : undefined;

      if (ticketId) {
        if (!ticketStats.has(ticketId)) {
          ticketStats.set(ticketId, { healingCount: 0, failed: false, completed: false });
        }
        const stats = ticketStats.get(ticketId)!;

        if (event.type === "SELF_HEALING_ITERATION") {
          stats.healingCount += 1;
        } else if (event.type === "TASK_FAILED" || event.type === "GATEKEEPER_FAILED") {
          stats.failed = true;
        } else if (event.type === "TASK_COMPLETED" || event.type === "GATEKEEPER_PASSED") {
          if (typeof payload.iterations === "number" && payload.iterations > 1) {
            stats.healingCount = Math.max(stats.healingCount, payload.iterations - 1);
          }
          stats.completed = true;
        }
      }
    }

    const totalTickets = ticketStats.size;
    let firstPassSuccessfulTickets = 0;
    let remediatedTickets = 0;
    let totalHealingIterations = 0;

    for (const [, stats] of ticketStats) {
      totalHealingIterations += stats.healingCount;
      if (stats.healingCount === 0 && !stats.failed) {
        firstPassSuccessfulTickets++;
      } else {
        remediatedTickets++;
      }
    }

    const fpyPercentage =
      totalTickets === 0
        ? 100
        : Number(((firstPassSuccessfulTickets / totalTickets) * 100).toFixed(2));

    const meanSelfHealingIterations =
      totalTickets === 0
        ? 0
        : Number((totalHealingIterations / totalTickets).toFixed(2));

    const totalContractChecks =
      totalContractChecksOverride !== undefined
        ? totalContractChecksOverride
        : explicitContractChecks > 0
        ? explicitContractChecks + contractViolations
        : Math.max(events.length, contractViolations);

    const contractComplianceRate =
      totalContractChecks === 0
        ? 100
        : Number(
            (
              ((totalContractChecks - contractViolations) / totalContractChecks) *
              100
            ).toFixed(2)
          );

    return ProcessQualityMetricsSchema.parse({
      fpy: {
        totalTickets,
        firstPassSuccessfulTickets,
        remediatedTickets,
        fpyPercentage,
      },
      meanSelfHealingIterations,
      contractComplianceRate,
      totalContractChecks,
      contractViolations,
      totalAuditEvents: events.length,
      auditChainIntact,
      calculatedAt: new Date().toISOString(),
    });
  }

  /**
   * Calcola le metriche leggendo il log crittografico da un'istanza di AuditLogger.
   */
  static async calculateFromAuditLogger(
    auditLogger: AuditLogger
  ): Promise<ProcessQualityMetrics> {
    const events = await auditLogger.readAuditLog();
    const verification = await auditLogger.verifyAuditChain();
    return this.calculateFromEvents(events, verification.valid);
  }

  /**
   * Calcola le metriche a partire dal targetPath del workspace.
   */
  static async calculateFromPath(targetPath: string): Promise<ProcessQualityMetrics> {
    const logger = new AuditLogger(targetPath);
    return this.calculateFromAuditLogger(logger);
  }
}
