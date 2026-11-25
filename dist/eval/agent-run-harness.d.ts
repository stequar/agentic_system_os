import { type AgentInvocation, type AgentRunScorecard, type AgentTask } from "../contracts/agent-run-eval.js";
/**
 * End-to-end agent-run evaluation.
 *
 * Each trial: copy the task's fixture repo into a fresh temp directory, commit it as
 * the baseline, let a REAL agent work on the task, then grade the resulting environment
 * with code only:
 *   1. hidden tests (copied in after the agent finished) — process exit code;
 *   2. diff scope — files changed against the baseline commit vs. the task's allow-list.
 * The agent's own claims of success are never read. Cost and tokens are whatever the
 * agent CLI reported; when it reports nothing they stay null ("not measured").
 *
 * Every trial's raw CLI output, diff, hook trace and result are persisted so a skeptic
 * can re-inspect or re-run them.
 */
export type AgentRunner = {
    name: string;
    version?: () => Promise<string | null>;
    run: (workspace: string, prompt: string) => Promise<AgentInvocation>;
};
/**
 * Extracts usage figures from `claude -p --output-format json` output. Anything the
 * CLI did not report stays null: nothing is estimated.
 */
export declare function parseClaudeCodeJsonResult(stdout: string): Pick<AgentInvocation, "costUsd" | "inputTokens" | "outputTokens" | "cacheReadTokens" | "cacheCreationTokens" | "numTurns" | "sessionId" | "models">;
/**
 * Real agent: Claude Code in headless mode. User-level settings are excluded and no
 * MCP servers are loaded, so the run depends only on what is inside the workspace.
 */
export declare function claudeCodeHeadlessRunner(options?: {
    model?: string;
    maxBudgetUsd?: number;
    timeoutMs?: number;
    binary?: string;
}): AgentRunner;
export declare function loadAgentTask(taskDir: string): Promise<AgentTask>;
/** Wilson score interval for a binomial proportion (95%). */
export declare function wilsonInterval(successes: number, n: number): [number, number];
export declare class AgentRunEvalHarness {
    /**
     * Runs `trials` independent trials of one task and returns the scorecard. Results are
     * written under `<runsDir>/<runId>/` and one summary line is appended to
     * `<runsDir>/history.jsonl`, so runs can be compared over time.
     */
    static run(options: {
        taskDir: string;
        runner: AgentRunner;
        trials: number;
        runsDir: string;
        keepWorkspaces?: boolean;
    }): Promise<AgentRunScorecard>;
}
//# sourceMappingURL=agent-run-harness.d.ts.map