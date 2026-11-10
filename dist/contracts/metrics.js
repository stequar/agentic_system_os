import { z } from "zod";
/**
 * Report First-Pass Yield (FPY) che misura la quota di ticket completati
 * senza richiedere iterazioni di autoguarigione (self-healing) o cicli di fix.
 */
export const FirstPassYieldReportSchema = z.object({
    totalTickets: z.number().int().nonnegative().describe("Numero totale di ticket analizzati"),
    firstPassSuccessfulTickets: z.number().int().nonnegative().describe("Ticket passati al primo tentativo senza fix"),
    remediatedTickets: z.number().int().nonnegative().describe("Ticket che hanno richiesto almeno una riparazione"),
    fpyPercentage: z.number().min(0).max(100).describe("Percentuale First-Pass Yield (0-100%)"),
});
/**
 * Metriche complessive di cooperazione, conformità e qualità del processo.
 */
export const ProcessQualityMetricsSchema = z.object({
    fpy: FirstPassYieldReportSchema,
    meanSelfHealingIterations: z.number().nonnegative().describe("Media iterazioni di self-healing per ticket"),
    contractComplianceRate: z.number().min(0).max(100).describe("Percentuale conformità dei contratti a runtime (0-100%)"),
    totalContractChecks: z.number().int().nonnegative().describe("Totale verifiche contrattuali eseguite"),
    contractViolations: z.number().int().nonnegative().describe("Totale violazioni contrattuali rilevate"),
    totalAuditEvents: z.number().int().nonnegative().describe("Numero totale di eventi nel log crittografico"),
    auditChainIntact: z.boolean().describe("Stato di integrità crittografica della catena Merkle"),
    calculatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
//# sourceMappingURL=metrics.js.map