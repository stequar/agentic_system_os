import { z } from "zod";
/**
 * Runtime anchor for observability: which ticket is being worked on and what the
 * repository looked like when work started. Every trace record is keyed by it.
 */
export declare const ActiveTicketSchema: z.ZodObject<{
    ticketId: z.ZodString;
    baselineSha: z.ZodNullable<z.ZodString>;
    startedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ticketId: string;
    baselineSha: string | null;
    startedAt: string;
}, {
    ticketId: string;
    baselineSha: string | null;
    startedAt: string;
}>;
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
export declare const TraceRecordSchema: z.ZodObject<{
    recordedAt: z.ZodString;
    source: z.ZodEnum<["claude_code_hook", "gatekeeper"]>;
    ticketId: z.ZodNullable<z.ZodString>;
    baselineSha: z.ZodNullable<z.ZodString>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    payload: Record<string, unknown>;
    ticketId: string | null;
    baselineSha: string | null;
    recordedAt: string;
    source: "gatekeeper" | "claude_code_hook";
}, {
    payload: Record<string, unknown>;
    ticketId: string | null;
    baselineSha: string | null;
    recordedAt: string;
    source: "gatekeeper" | "claude_code_hook";
}>;
export type TraceRecord = z.infer<typeof TraceRecordSchema>;
export declare const GatekeeperCommandOutcomeSchema: z.ZodObject<{
    command: z.ZodString;
    exitCode: z.ZodNumber;
    timedOut: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    command: string;
    exitCode: number;
    timedOut: boolean;
}, {
    command: string;
    exitCode: number;
    timedOut: boolean;
}>;
export type GatekeeperCommandOutcome = z.infer<typeof GatekeeperCommandOutcomeSchema>;
//# sourceMappingURL=telemetry.d.ts.map