import { z } from "zod";
/**
 * End-to-end agent-run evaluation: a real agent works on a task in an isolated
 * repository and is graded on the resulting environment state, never on what it says.
 */
export const AgentTaskSchema = z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}$/),
    title: z.string().min(3),
    prompt: z.string().min(20),
    allowedFiles: z.array(z.string().min(1)).min(1).describe("Exact repo-relative paths the agent may change"),
    hiddenTestCommand: z.string().min(1).describe("Run only after the agent finished; its tests are not visible to the agent"),
    publicTestCommand: z.string().min(1).optional(),
});
/** What the agent CLI itself reported about a run. Every field is null when not reported. */
export const AgentInvocationSchema = z.object({
    runner: z.string().describe("Which runner produced this: e.g. 'claude-code-headless' or a scripted test double"),
    exitCode: z.number().int().nullable(),
    timedOut: z.boolean(),
    durationMs: z.number().nonnegative().describe("Wall-clock time measured by the harness"),
    costUsd: z.number().nonnegative().nullable().describe("As reported by the agent CLI; null = not measured"),
    inputTokens: z.number().int().nonnegative().nullable(),
    outputTokens: z.number().int().nonnegative().nullable(),
    cacheReadTokens: z.number().int().nonnegative().nullable(),
    cacheCreationTokens: z.number().int().nonnegative().nullable(),
    numTurns: z.number().int().nonnegative().nullable(),
    sessionId: z.string().nullable(),
    models: z.array(z.string()).describe("Model ids the CLI reported using; empty = not reported"),
    rawOutput: z.string().describe("Raw stdout of the agent CLI"),
});
export const AgentTrialResultSchema = z.object({
    taskId: z.string(),
    trial: z.number().int().positive(),
    ticketId: z.string(),
    baselineSha: z.string(),
    passed: z.boolean().describe("hiddenTestsPassed && scopeRespected"),
    hiddenTestsPassed: z.boolean(),
    hiddenTestExitCode: z.number().int(),
    hiddenTestsTotal: z.number().int().nonnegative(),
    hiddenTestsFailed: z.number().int().nonnegative(),
    scopeRespected: z.boolean(),
    changedFiles: z.array(z.string()),
    outOfScopeFiles: z.array(z.string()),
    hookEventsRecorded: z.number().int().nonnegative().describe("Raw agent-CLI hook payloads captured for this trial"),
    invocation: AgentInvocationSchema.omit({ rawOutput: true }),
    artifactsDir: z.string(),
});
export const AgentRunScorecardSchema = z.object({
    runId: z.string(),
    startedAt: z.string().datetime(),
    finishedAt: z.string().datetime(),
    evaluationKind: z.literal("REAL_AGENT_RUN"),
    runner: z.string(),
    runnerVersion: z.string().nullable(),
    taskId: z.string(),
    trials: z.number().int().positive(),
    passedTrials: z.number().int().nonnegative(),
    passRate: z.number().min(0).max(1),
    passRateCi95: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).describe("Wilson score interval"),
    allTrialsPassed: z.boolean().describe("pass^k for k = trials: every trial passed"),
    totalCostUsd: z.number().nonnegative().nullable().describe("Sum of CLI-reported costs; null if any trial did not report one"),
    meanDurationMs: z.number().nonnegative(),
    models: z.array(z.string()),
    results: z.array(AgentTrialResultSchema),
    artifactsDir: z.string(),
    caveats: z.array(z.string()),
});
//# sourceMappingURL=agent-run-eval.js.map