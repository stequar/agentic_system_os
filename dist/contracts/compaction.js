import { z } from "zod";
export const ContextMessageSchema = z.object({
    role: z.enum(["system", "user", "assistant", "tool"]),
    content: z.string(),
    name: z.string().optional(),
    toolCallId: z.string().optional(),
});
export const InvariantDefinitionSchema = z.object({
    ticketId: z.string().describe("Identificativo immutabile del ticket di lavoro"),
    allowedFiles: z.array(z.string()).default([]).describe("File consentiti per la modifica"),
    acceptanceCriteria: z.array(z.string()).default([]).describe("Criteri di accettazione non negoziabili"),
    testCommands: z.array(z.string()).default([]).describe("Comandi di test di riferimento"),
});
export const InvariantVerificationResultSchema = z.object({
    passed: z.boolean(),
    violations: z.array(z.string()).default([]),
    preservedTicketId: z.boolean(),
    preservedAllowedFiles: z.boolean(),
    preservedAcceptanceCriteria: z.boolean(),
    preservedTestCommands: z.boolean(),
});
export const ContextCompactionInputSchema = z.object({
    messages: z.array(ContextMessageSchema),
    invariants: InvariantDefinitionSchema,
    maxTokenThreshold: z.number().int().default(40_000),
    forceCompaction: z.boolean().default(false),
});
export const CompactedContextResultSchema = z.object({
    wasCompacted: z.boolean(),
    originalTokenEstimate: z.number().int(),
    compactedTokenEstimate: z.number().int(),
    reductionPercent: z.number(),
    compactedMessages: z.array(ContextMessageSchema),
    invariantVerification: InvariantVerificationResultSchema,
    distilledSummary: z.string(),
});
export const SurgicalDiagnosticSliceSchema = z.object({
    file: z.string(),
    line: z.number().int().nonnegative(),
    column: z.number().int().nonnegative().optional(),
    code: z.string().optional(),
    severity: z.enum(["error", "warning"]).default("error"),
    message: z.string(),
    sourceRunner: z.string(),
    symbol: z.string().optional(),
    negativeHypotheses: z.array(z.string()).default([]),
    compactedTokensEstimate: z.number().int(),
});
export const CleanSlatePayloadSchema = z.object({
    iteration: z.number().int().positive(),
    t0ResetApplied: z.boolean().default(true),
    slices: z.array(SurgicalDiagnosticSliceSchema),
    accumulatedNegativeHypotheses: z.array(z.string()).default([]),
    totalTokensPayload: z.number().int(),
});
//# sourceMappingURL=compaction.js.map