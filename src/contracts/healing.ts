import { z } from "zod";
import { GatekeeperResultSchema } from "./review.js";

export const DiagnosticViolationSchema = z.object({
  file: z.string().describe("Percorso relativo o assoluto del file con violazione"),
  line: z.number().int().nonnegative().describe("Numero di riga (1-indexed, o 0 se non determinabile)"),
  column: z.number().int().nonnegative().optional().describe("Colonna (1-indexed, opzionale)"),
  code: z.string().optional().describe("Codice errore compiler/linter (es. TS2322, E0308, F401)"),
  severity: z.enum(["error", "warning"]).default("error"),
  message: z.string().describe("Messaggio esplicativo della violazione"),
  sourceRunner: z.string().describe("Toolchain o linter d'origine (es. tsc, vitest, pytest, cargo, go)"),
});

export const DiagnosticReportSchema = z.object({
  violations: z.array(DiagnosticViolationSchema).default([]),
  errorCount: z.number().int().nonnegative().default(0),
  warningCount: z.number().int().nonnegative().default(0),
  rawOutput: z.string().default(""),
  runner: z.string().default("generic"),
});

export const DiffGuardResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(z.string()).default([]),
  testsPreserved: z.boolean().default(true),
  scopePreserved: z.boolean().default(true),
});

export const HealingAttemptSchema = z.object({
  iteration: z.number().int().positive(),
  violations: z.array(DiagnosticViolationSchema),
  proposedPatch: z.record(z.string()).describe("Mappa di filePath -> nuovo contenuto proposto"),
  guardResult: DiffGuardResultSchema,
  success: z.boolean(),
});

export const HealingSessionResultSchema = z.object({
  status: z.enum(["SUCCESS", "BUDGET_EXHAUSTED", "GUARD_VIOLATION"]),
  iterationsRun: z.number().int().nonnegative(),
  maxIterations: z.number().int().positive().default(3),
  restoredRollback: z.boolean().default(false),
  finalGatekeeperResult: GatekeeperResultSchema.optional(),
  attempts: z.array(HealingAttemptSchema).default([]),
  durationMs: z.number().nonnegative(),
});

export type DiagnosticViolation = z.infer<typeof DiagnosticViolationSchema>;
export type DiagnosticReport = z.infer<typeof DiagnosticReportSchema>;
export type DiffGuardResult = z.infer<typeof DiffGuardResultSchema>;
export type HealingAttempt = z.infer<typeof HealingAttemptSchema>;
export type HealingSessionResult = z.infer<typeof HealingSessionResultSchema>;
