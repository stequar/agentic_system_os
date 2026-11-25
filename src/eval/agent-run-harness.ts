import fs from "node:fs/promises";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import {
  AgentRunScorecardSchema,
  AgentTaskSchema,
  AgentTrialResultSchema,
  type AgentInvocation,
  type AgentRunScorecard,
  type AgentTask,
  type AgentTrialResult,
} from "../contracts/agent-run-eval.js";
import { runGatekeeper } from "../gatekeeper/runner.js";
import {
  TRACE_REL,
  installClaudeCodeHookRecorder,
  readTrace,
  startTicket,
} from "../telemetry/run-trace.js";

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

function exec(
  file: string,
  args: string[],
  cwd: string
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(file, args, { cwd, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      const code = err ? (typeof (err as { code?: unknown }).code === "number" ? ((err as { code: number }).code) : 1) : 0;
      resolve({ code, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

async function git(cwd: string, ...args: string[]): Promise<string> {
  const res = await exec("git", args, cwd);
  if (res.code !== 0) {
    throw new Error(`AGENT_EVAL_GIT_FAILED: git ${args.join(" ")} → ${res.stderr.trim() || res.stdout.trim()}`);
  }
  return res.stdout.trim();
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);
const int = (v: unknown): number | null => {
  const n = num(v);
  return n === null ? null : Math.round(n);
};

/**
 * Extracts usage figures from `claude -p --output-format json` output. Anything the
 * CLI did not report stays null: nothing is estimated.
 */
export function parseClaudeCodeJsonResult(
  stdout: string
): Pick<
  AgentInvocation,
  "costUsd" | "inputTokens" | "outputTokens" | "cacheReadTokens" | "cacheCreationTokens" | "numTurns" | "sessionId" | "models"
> {
  const empty = {
    costUsd: null,
    inputTokens: null,
    outputTokens: null,
    cacheReadTokens: null,
    cacheCreationTokens: null,
    numTurns: null,
    sessionId: null,
    models: [] as string[],
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return empty;
  }
  // Depending on CLI version the output is a single result object or an array of events.
  const result = Array.isArray(parsed)
    ? [...parsed].reverse().find((e) => e && typeof e === "object" && (e as { type?: unknown }).type === "result")
    : parsed;
  if (!result || typeof result !== "object") return empty;
  const r = result as Record<string, unknown>;
  const usage = (r.usage && typeof r.usage === "object" ? r.usage : {}) as Record<string, unknown>;
  const modelUsage = r.modelUsage && typeof r.modelUsage === "object" ? Object.keys(r.modelUsage as object) : [];
  return {
    costUsd: num(r.total_cost_usd),
    inputTokens: int(usage.input_tokens),
    outputTokens: int(usage.output_tokens),
    cacheReadTokens: int(usage.cache_read_input_tokens),
    cacheCreationTokens: int(usage.cache_creation_input_tokens),
    numTurns: int(r.num_turns),
    sessionId: typeof r.session_id === "string" ? r.session_id : null,
    models: modelUsage,
  };
}

/**
 * Real agent: Claude Code in headless mode. User-level settings are excluded and no
 * MCP servers are loaded, so the run depends only on what is inside the workspace.
 */
export function claudeCodeHeadlessRunner(options?: {
  model?: string;
  maxBudgetUsd?: number;
  timeoutMs?: number;
  binary?: string;
}): AgentRunner {
  const binary = options?.binary ?? "claude";
  const timeoutMs = options?.timeoutMs ?? 10 * 60_000;
  return {
    name: "claude-code-headless",
    version: async () => {
      const res = await exec(binary, ["--version"], os.tmpdir());
      return res.code === 0 ? res.stdout.trim() : null;
    },
    run: (workspace, prompt) =>
      new Promise((resolve) => {
        const args = [
          "-p",
          prompt,
          "--output-format",
          "json",
          "--permission-mode",
          "acceptEdits",
          "--allowedTools",
          "Bash(npm test:*)",
          "Bash(node --test:*)",
          "--setting-sources",
          "project,local",
          "--strict-mcp-config",
          "--max-budget-usd",
          String(options?.maxBudgetUsd ?? 1),
        ];
        if (options?.model) args.push("--model", options.model);

        const started = Date.now();
        const child = spawn(binary, args, { cwd: workspace, stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let timedOut = false;
        child.stdout.on("data", (c) => (stdout += c));
        child.stderr.on("data", () => undefined);
        const timer = setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, timeoutMs);
        const finish = (exitCode: number | null) => {
          clearTimeout(timer);
          resolve({
            runner: "claude-code-headless",
            exitCode,
            timedOut,
            durationMs: Date.now() - started,
            ...parseClaudeCodeJsonResult(stdout),
            rawOutput: stdout,
          });
        };
        child.on("error", () => finish(null));
        child.on("close", (code) => finish(code));
      }),
  };
}

export async function loadAgentTask(taskDir: string): Promise<AgentTask> {
  return AgentTaskSchema.parse(JSON.parse(await fs.readFile(path.join(taskDir, "task.json"), "utf-8")));
}

/** Wilson score interval for a binomial proportion (95%). */
export function wilsonInterval(successes: number, n: number): [number, number] {
  if (n === 0) return [0, 1];
  const z = 1.959964;
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}

const TRIAL_GITIGNORE = [".company-os/telemetry/", ".company-os/active-ticket.json", ""].join("\n");

async function runTrial(
  task: AgentTask,
  taskDir: string,
  trial: number,
  runner: AgentRunner,
  artifactsDir: string,
  keepWorkspace: boolean
): Promise<AgentTrialResult> {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), `agent-eval-${task.id}-t${trial}-`));
  try {
    // 1. Clean environment: fixture repo + hook recorder, committed as the baseline.
    await fs.cp(path.join(taskDir, "repo"), workspace, { recursive: true });
    await installClaudeCodeHookRecorder(workspace);
    await fs.appendFile(path.join(workspace, ".gitignore"), TRIAL_GITIGNORE, "utf-8");
    await git(workspace, "init", "-q");
    await git(workspace, "config", "user.email", "agent-eval@example.invalid");
    await git(workspace, "config", "user.name", "agent-eval");
    await git(workspace, "add", "-A");
    await git(workspace, "commit", "-q", "-m", "baseline");
    const ticket = await startTicket(workspace, `${task.id}-t${trial}`);
    const baselineSha = ticket.baselineSha;
    if (!baselineSha) throw new Error("AGENT_EVAL_NO_BASELINE: could not read the baseline commit");

    // 2. The agent works. Its output is stored, not trusted.
    const invocation = await runner.run(workspace, task.prompt);

    // 3. Grade the environment state.
    //    a) Diff scope against the baseline, BEFORE hidden tests are added.
    await git(workspace, "add", "-A");
    const changedRaw = await git(workspace, "diff", "--cached", "--name-only", baselineSha);
    const changedFiles = changedRaw.split("\n").map((l) => l.trim()).filter(Boolean).sort();
    const outOfScopeFiles = changedFiles.filter((f) => !task.allowedFiles.includes(f));
    const diffPatch = await git(workspace, "diff", "--cached", baselineSha);

    //    b) Hidden tests: copied in only now, run through the real gatekeeper.
    await fs.cp(path.join(taskDir, "hidden-tests"), path.join(workspace, "hidden-tests"), { recursive: true });
    const gate = await runGatekeeper(workspace, [task.hiddenTestCommand], { timeoutMs: 120_000 });

    const trace = await readTrace(workspace, { ticketId: ticket.ticketId });
    const gatekeeperRecord = [...trace].reverse().find((r) => r.source === "gatekeeper");
    const commands = (gatekeeperRecord?.payload.commands ?? []) as Array<{ exitCode: number }>;
    const hiddenTestExitCode = commands[0]?.exitCode ?? (gate.testsPassed ? 0 : 1);
    const hookEventsRecorded = trace.filter((r) => r.source === "claude_code_hook").length;

    const hiddenTestsPassed = gate.testsPassed && hiddenTestExitCode === 0;
    const scopeRespected = outOfScopeFiles.length === 0;

    // 4. Persist everything needed to audit this trial.
    const trialDir = path.join(artifactsDir, `trial-${trial}`);
    await fs.mkdir(trialDir, { recursive: true });
    const { rawOutput, ...invocationSummary } = invocation;
    await fs.writeFile(path.join(trialDir, "agent-output.txt"), rawOutput, "utf-8");
    await fs.writeFile(path.join(trialDir, "diff.patch"), diffPatch + "\n", "utf-8");
    await fs.writeFile(path.join(trialDir, "hidden-tests-output.txt"), gate.rawOutput ?? "", "utf-8");
    const tracePath = path.join(workspace, TRACE_REL);
    if (fsSync.existsSync(tracePath)) {
      await fs.copyFile(tracePath, path.join(trialDir, "hook-events.jsonl"));
    }

    const result = AgentTrialResultSchema.parse({
      taskId: task.id,
      trial,
      ticketId: ticket.ticketId,
      baselineSha,
      passed: hiddenTestsPassed && scopeRespected,
      hiddenTestsPassed,
      hiddenTestExitCode,
      hiddenTestsTotal: gate.totalTests,
      hiddenTestsFailed: gate.failedTests,
      scopeRespected,
      changedFiles,
      outOfScopeFiles,
      hookEventsRecorded,
      invocation: invocationSummary,
      artifactsDir: trialDir,
    });
    await fs.writeFile(path.join(trialDir, "result.json"), JSON.stringify(result, null, 2) + "\n", "utf-8");
    return result;
  } finally {
    if (!keepWorkspace) await fs.rm(workspace, { recursive: true, force: true });
  }
}

export class AgentRunEvalHarness {
  /**
   * Runs `trials` independent trials of one task and returns the scorecard. Results are
   * written under `<runsDir>/<runId>/` and one summary line is appended to
   * `<runsDir>/history.jsonl`, so runs can be compared over time.
   */
  static async run(options: {
    taskDir: string;
    runner: AgentRunner;
    trials: number;
    runsDir: string;
    keepWorkspaces?: boolean;
  }): Promise<AgentRunScorecard> {
    if (!Number.isInteger(options.trials) || options.trials < 1) {
      throw new Error("AGENT_EVAL_INVALID_TRIALS: trials must be a positive integer");
    }
    const task = await loadAgentTask(options.taskDir);
    const startedAt = new Date().toISOString();
    const runId = `${startedAt.replace(/[:.]/g, "-")}-${task.id}`;
    const artifactsDir = path.join(path.resolve(options.runsDir), runId);
    await fs.mkdir(artifactsDir, { recursive: true });

    // Trials run sequentially: each gets its own fresh workspace and nothing is shared.
    const results: AgentTrialResult[] = [];
    for (let trial = 1; trial <= options.trials; trial++) {
      results.push(
        await runTrial(task, options.taskDir, trial, options.runner, artifactsDir, options.keepWorkspaces ?? false)
      );
    }

    const passedTrials = results.filter((r) => r.passed).length;
    const costs = results.map((r) => r.invocation.costUsd);
    const totalCostUsd = costs.every((c): c is number => c !== null)
      ? Number(costs.reduce((a, c) => a + c, 0).toFixed(6))
      : null;
    const models = [...new Set(results.flatMap((r) => r.invocation.models))].sort();

    const caveats = [
      `Single task, ${options.trials} trial(s): the interval below is wide and says nothing beyond this task.`,
      "The task, prompt and hidden tests were written by the same author as the harness; there is no held-out split yet.",
      "Passing hidden tests means the specified behaviour is met, not that a maintainer would merge the change.",
    ];
    if (totalCostUsd === null) caveats.push("At least one trial reported no cost: total cost is not measured.");
    if (results.some((r) => r.hookEventsRecorded === 0)) {
      caveats.push("At least one trial captured no hook events: the per-step trace is missing for it.");
    }

    const scorecard = AgentRunScorecardSchema.parse({
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      evaluationKind: "REAL_AGENT_RUN",
      runner: options.runner.name,
      runnerVersion: options.runner.version ? await options.runner.version() : null,
      taskId: task.id,
      trials: options.trials,
      passedTrials,
      passRate: passedTrials / options.trials,
      passRateCi95: wilsonInterval(passedTrials, options.trials),
      allTrialsPassed: passedTrials === options.trials,
      totalCostUsd,
      meanDurationMs: Math.round(results.reduce((a, r) => a + r.invocation.durationMs, 0) / results.length),
      models,
      results,
      artifactsDir,
      caveats,
    });

    await fs.writeFile(path.join(artifactsDir, "scorecard.json"), JSON.stringify(scorecard, null, 2) + "\n", "utf-8");
    const { results: _omit, caveats: _omit2, ...historyLine } = scorecard;
    await fs.appendFile(
      path.join(path.resolve(options.runsDir), "history.jsonl"),
      JSON.stringify(historyLine) + "\n",
      "utf-8"
    );
    return scorecard;
  }
}
