import { type ActiveTicket, type GatekeeperCommandOutcome, type TraceRecord } from "../contracts/telemetry.js";
export declare const ACTIVE_TICKET_REL: string;
export declare const TRACE_REL: string;
export declare const HOOK_SCRIPT_REL: string;
export declare const HOOK_SCRIPT_MARKER = "record-hook-event.mjs";
/** Claude Code hook events the recorder subscribes to. */
export declare const RECORDED_HOOK_EVENTS: readonly ["SessionStart", "UserPromptSubmit", "PostToolUse", "SubagentStop", "Stop"];
/**
 * Starts (or switches) the active ticket: records the ticket id and the current git
 * HEAD as the baseline against which the agent's diff will later be judged.
 */
export declare function startTicket(targetPath: string, ticketId: string): Promise<ActiveTicket>;
export declare function readActiveTicket(targetPath: string): Promise<ActiveTicket | null>;
/**
 * Appends the gatekeeper's real outcome (per-command exit codes) to the ticket trace.
 * No-op when no ticket is active, so ad-hoc gatekeeper runs leave no trace behind.
 * Returns whether a record was written.
 */
export declare function recordGatekeeperVerdict(targetPath: string, verdict: {
    commands: GatekeeperCommandOutcome[];
    typecheckPassed: boolean;
    linterPassed: boolean;
    testsPassed: boolean;
    totalTests: number;
    failedTests: number;
}): Promise<boolean>;
/** Reads the trace, optionally filtered by ticket. Malformed lines are skipped. */
export declare function readTrace(targetPath: string, filter?: {
    ticketId?: string;
}): Promise<TraceRecord[]>;
/**
 * Dependency-free hook recorder installed into the target repo. It appends the raw
 * hook payload, stamped with the active ticket, and ALWAYS exits 0 with no output so
 * it can never block or alter the agent's work.
 */
export declare function renderHookRecorderScript(): string;
/**
 * Installs the recorder script and registers it in `.claude/settings.local.json`
 * (per-machine, not committed). Existing settings and hooks are preserved; running it
 * twice changes nothing.
 */
export declare function installClaudeCodeHookRecorder(targetPath: string): Promise<{
    scriptPath: string;
    settingsPath: string;
    eventsRegistered: string[];
}>;
//# sourceMappingURL=run-trace.d.ts.map