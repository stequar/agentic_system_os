import { z } from "zod";
/**
 * Report First-Pass Yield (FPY) che misura la quota di ticket completati
 * senza richiedere iterazioni di autoguarigione (self-healing) o cicli di fix.
 */
export declare const FirstPassYieldReportSchema: z.ZodObject<{
    totalTickets: z.ZodNumber;
    firstPassSuccessfulTickets: z.ZodNumber;
    remediatedTickets: z.ZodNumber;
    fpyPercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    fpyPercentage: number;
    totalTickets: number;
    firstPassSuccessfulTickets: number;
    remediatedTickets: number;
}, {
    fpyPercentage: number;
    totalTickets: number;
    firstPassSuccessfulTickets: number;
    remediatedTickets: number;
}>;
export type FirstPassYieldReport = z.infer<typeof FirstPassYieldReportSchema>;
/**
 * Metriche complessive di cooperazione, conformità e qualità del processo.
 */
export declare const ProcessQualityMetricsSchema: z.ZodObject<{
    fpy: z.ZodObject<{
        totalTickets: z.ZodNumber;
        firstPassSuccessfulTickets: z.ZodNumber;
        remediatedTickets: z.ZodNumber;
        fpyPercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        fpyPercentage: number;
        totalTickets: number;
        firstPassSuccessfulTickets: number;
        remediatedTickets: number;
    }, {
        fpyPercentage: number;
        totalTickets: number;
        firstPassSuccessfulTickets: number;
        remediatedTickets: number;
    }>;
    meanSelfHealingIterations: z.ZodNumber;
    contractComplianceRate: z.ZodNumber;
    totalContractChecks: z.ZodNumber;
    contractViolations: z.ZodNumber;
    totalAuditEvents: z.ZodNumber;
    auditChainIntact: z.ZodBoolean;
    calculatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fpy: {
        fpyPercentage: number;
        totalTickets: number;
        firstPassSuccessfulTickets: number;
        remediatedTickets: number;
    };
    meanSelfHealingIterations: number;
    contractComplianceRate: number;
    totalContractChecks: number;
    contractViolations: number;
    totalAuditEvents: number;
    auditChainIntact: boolean;
    calculatedAt: string;
}, {
    fpy: {
        fpyPercentage: number;
        totalTickets: number;
        firstPassSuccessfulTickets: number;
        remediatedTickets: number;
    };
    meanSelfHealingIterations: number;
    contractComplianceRate: number;
    totalContractChecks: number;
    contractViolations: number;
    totalAuditEvents: number;
    auditChainIntact: boolean;
    calculatedAt?: string | undefined;
}>;
export type ProcessQualityMetrics = z.infer<typeof ProcessQualityMetricsSchema>;
//# sourceMappingURL=metrics.d.ts.map