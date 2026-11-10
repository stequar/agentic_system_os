import { z } from "zod";
/**
 * Categoria diagnostica di un controllo dell'Environment Doctor.
 */
export const DiagnosticCategorySchema = z.enum([
    "runtime",
    "compiler",
    "daemon",
    "vcs",
    "workspace",
]);
/**
 * Stato del singolo controllo diagnostico.
 */
export const DoctorCheckStatusSchema = z.enum([
    "ok",
    "warn",
    "error",
    "skipped",
]);
/**
 * Risultato tipizzato di un singolo controllo effettuato dall'Environment Doctor.
 */
export const DoctorCheckResultSchema = z.object({
    checkName: z.string().min(1),
    category: DiagnosticCategorySchema,
    status: DoctorCheckStatusSchema,
    version: z.string().optional(),
    message: z.string().min(1),
    fixSuggested: z.string().optional(),
});
/**
 * Opzioni per l'esecuzione di `runEnvironmentDoctor`.
 */
export const DoctorOptionsSchema = z.object({
    timeoutMs: z.number().int().positive().default(3000),
});
/**
 * Report aggregato dell'Environment Doctor validato via Zod.
 */
export const DoctorReportSchema = z.object({
    targetPath: z.string(),
    overallStatus: z.enum(["ok", "warn", "error"]),
    checks: z.array(DoctorCheckResultSchema),
    checkedAt: z.string().datetime(),
    durationMs: z.number().nonnegative(),
});
//# sourceMappingURL=doctor.js.map