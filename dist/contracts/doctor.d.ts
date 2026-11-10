import { z } from "zod";
/**
 * Categoria diagnostica di un controllo dell'Environment Doctor.
 */
export declare const DiagnosticCategorySchema: z.ZodEnum<["runtime", "compiler", "daemon", "vcs", "workspace"]>;
export type DiagnosticCategory = z.infer<typeof DiagnosticCategorySchema>;
/**
 * Stato del singolo controllo diagnostico.
 */
export declare const DoctorCheckStatusSchema: z.ZodEnum<["ok", "warn", "error", "skipped"]>;
export type DoctorCheckStatus = z.infer<typeof DoctorCheckStatusSchema>;
/**
 * Risultato tipizzato di un singolo controllo effettuato dall'Environment Doctor.
 */
export declare const DoctorCheckResultSchema: z.ZodObject<{
    checkName: z.ZodString;
    category: z.ZodEnum<["runtime", "compiler", "daemon", "vcs", "workspace"]>;
    status: z.ZodEnum<["ok", "warn", "error", "skipped"]>;
    version: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    fixSuggested: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "warn" | "error" | "ok" | "skipped";
    category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
    checkName: string;
    version?: string | undefined;
    fixSuggested?: string | undefined;
}, {
    message: string;
    status: "warn" | "error" | "ok" | "skipped";
    category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
    checkName: string;
    version?: string | undefined;
    fixSuggested?: string | undefined;
}>;
export type DoctorCheckResult = z.infer<typeof DoctorCheckResultSchema>;
/**
 * Opzioni per l'esecuzione di `runEnvironmentDoctor`.
 */
export declare const DoctorOptionsSchema: z.ZodObject<{
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    timeoutMs: number;
}, {
    timeoutMs?: number | undefined;
}>;
export type DoctorOptions = z.infer<typeof DoctorOptionsSchema>;
/**
 * Report aggregato dell'Environment Doctor validato via Zod.
 */
export declare const DoctorReportSchema: z.ZodObject<{
    targetPath: z.ZodString;
    overallStatus: z.ZodEnum<["ok", "warn", "error"]>;
    checks: z.ZodArray<z.ZodObject<{
        checkName: z.ZodString;
        category: z.ZodEnum<["runtime", "compiler", "daemon", "vcs", "workspace"]>;
        status: z.ZodEnum<["ok", "warn", "error", "skipped"]>;
        version: z.ZodOptional<z.ZodString>;
        message: z.ZodString;
        fixSuggested: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: "warn" | "error" | "ok" | "skipped";
        category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
        checkName: string;
        version?: string | undefined;
        fixSuggested?: string | undefined;
    }, {
        message: string;
        status: "warn" | "error" | "ok" | "skipped";
        category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
        checkName: string;
        version?: string | undefined;
        fixSuggested?: string | undefined;
    }>, "many">;
    checkedAt: z.ZodString;
    durationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    durationMs: number;
    overallStatus: "warn" | "error" | "ok";
    checks: {
        message: string;
        status: "warn" | "error" | "ok" | "skipped";
        category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
        checkName: string;
        version?: string | undefined;
        fixSuggested?: string | undefined;
    }[];
    checkedAt: string;
}, {
    targetPath: string;
    durationMs: number;
    overallStatus: "warn" | "error" | "ok";
    checks: {
        message: string;
        status: "warn" | "error" | "ok" | "skipped";
        category: "runtime" | "compiler" | "daemon" | "vcs" | "workspace";
        checkName: string;
        version?: string | undefined;
        fixSuggested?: string | undefined;
    }[];
    checkedAt: string;
}>;
export type DoctorReport = z.infer<typeof DoctorReportSchema>;
//# sourceMappingURL=doctor.d.ts.map