/**
 * One-command real agent-run evaluation (spends real tokens):
 *
 *   npm run eval:agent -- [--trials 5] [--task invoice-total] [--model <id>] [--max-budget-usd 1]
 *
 * Results: .company-os/eval-runs/<runId>/ (per-trial raw output, diff, hook trace,
 * hidden-test output, result.json) and one line appended to .company-os/eval-runs/history.jsonl.
 */
import path from "node:path";
import { AgentRunEvalHarness, claudeCodeHeadlessRunner } from "../src/eval/agent-run-harness.js";

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const root = process.cwd();
const task = arg("task", "invoice-total")!;
const trials = Number(arg("trials", "5"));
const maxBudgetUsd = Number(arg("max-budget-usd", "1"));
const model = arg("model");

const card = await AgentRunEvalHarness.run({
  taskDir: path.join(root, "tests", "fixtures", "agent-tasks", task),
  runner: claudeCodeHeadlessRunner({ model, maxBudgetUsd }),
  trials,
  runsDir: path.join(root, ".company-os", "eval-runs"),
});

const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
console.log(`\nAgent-run eval — task ${card.taskId}, runner ${card.runner} (${card.runnerVersion ?? "version unknown"})`);
console.log(`Models reported: ${card.models.join(", ") || "not reported"}`);
for (const r of card.results) {
  console.log(
    `  trial ${r.trial}: ${r.passed ? "PASS" : "FAIL"}  hidden tests exit=${r.hiddenTestExitCode} (${r.hiddenTestsTotal - r.hiddenTestsFailed}/${r.hiddenTestsTotal})` +
      `  scope=${r.scopeRespected ? "ok" : "VIOLATED: " + r.outOfScopeFiles.join(",")}` +
      `  cost=${r.invocation.costUsd === null ? "not measured" : "$" + r.invocation.costUsd.toFixed(4)}` +
      `  turns=${r.invocation.numTurns ?? "n/a"}  ${(r.invocation.durationMs / 1000).toFixed(0)}s  hookEvents=${r.hookEventsRecorded}`
  );
}
console.log(
  `Pass rate ${card.passedTrials}/${card.trials} = ${pct(card.passRate)} (95% CI ${pct(card.passRateCi95[0])}–${pct(card.passRateCi95[1])}); all trials passed: ${card.allTrialsPassed}`
);
console.log(`Total cost: ${card.totalCostUsd === null ? "not measured" : "$" + card.totalCostUsd.toFixed(4)}`);
console.log(`Artifacts: ${card.artifactsDir}`);
for (const c of card.caveats) console.log(`Caveat: ${c}`);
