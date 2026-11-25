import { z } from "zod";

/**
 * Runtime anchor for observability: which ticket is being worked on and what the
 * repository looked like when work started. Every trace record is keyed by it.
 */
export const ActiveTicketSchema = z.object({
  ticketId: z
    .string()
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]{1,63}$/, "ticketId must be 2-64 chars of [A-Za-z0-9._-]"),
  baselineSha: z
    .string()
    .nullable()
    .describe("git HEAD when the ticket was started; null when the target is not a git repository"),
  startedAt: z.string().datetime(),
});
export type ActiveTicket = z.infer<typeof ActiveTicketSchema>;

/**
 * One line of `.company-os/telemetry/hook-events.jsonl`.
 *
 * - `claude_code_hook`: `payload` is the raw JSON the agent CLI passed to the hook
 *   (session id, tool name, tool input/response…). The OS does not author it.
 * - `gatekeeper`: `payload` is the outcome of commands the gatekeeper actually ran
 *   (process exit codes), not an assumed verdict.
 *
 * Payloads can contain prompts and source code. The file is local and gitignored.
 */
export const TraceRecordSchema = z.object({
  recordedAt: z.string().datetime(),
  source: z.enum(["claude_code_hook", "gatekeeper"]),
  ticketId: z.string().nullable(),
  baselineSha: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()),
});
export type TraceRecord = z.infer<typeof TraceRecordSchema>;

export const GatekeeperCommandOutcomeSchema = z.object({
  command: z.string(),
  exitCode: z.number().int(),
  timedOut: z.boolean(),
});
export type GatekeeperCommandOutcome = z.infer<typeof GatekeeperCommandOutcomeSchema>;
