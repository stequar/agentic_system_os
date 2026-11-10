import { z } from "zod";

export const TestRunResultSchema = z.enum(["PASS", "FAIL"]);
export type TestRunResult = z.infer<typeof TestRunResultSchema>;

export const QuarantinedTestSchema = z.object({
  testIdentifier: z.string().describe("Identificativo o nome del test case"),
  testFile: z.string().describe("Percorso relativo del file di test"),
  runs: z.array(TestRunResultSchema).length(3).describe("Vettore dei 3 esiti consecutivi"),
  quarantinedAt: z.string().datetime(),
  reason: z.string(),
  issueTicketId: z.string().optional(),
});
export type QuarantinedTest = z.infer<typeof QuarantinedTestSchema>;

export const QuarantineRegistrySchema = z.object({
  quarantinedTests: z.array(QuarantinedTestSchema).default([]),
  maxAllowedQuarantined: z.number().int().positive().default(2),
  updatedAt: z.string().datetime(),
});
export type QuarantineRegistry = z.infer<typeof QuarantineRegistrySchema>;

export const QuarantineEvaluationResultSchema = z.object({
  isFlaky: z.boolean(),
  isDeterministicFailure: z.boolean(),
  runs: z.array(TestRunResultSchema),
  actionTaken: z.enum(["QUARANTINED", "REJECTED_DETERMINISTIC", "PASS", "CAP_EXCEEDED"]),
  quarantinedRecord: QuarantinedTestSchema.optional(),
  message: z.string(),
});
export type QuarantineEvaluationResult = z.infer<typeof QuarantineEvaluationResultSchema>;
