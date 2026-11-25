import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  AgentRunEvalHarness,
  parseClaudeCodeJsonResult,
  wilsonInterval,
  type AgentRunner,
} from "../src/eval/agent-run-harness.js";
import { AgentRunScorecardSchema } from "../src/contracts/agent-run-eval.js";

const TASK_DIR = path.resolve(process.cwd(), "tests/fixtures/agent-tasks/invoice-total");

/**
 * These tests check the HARNESS (isolation, grading, persistence) with scripted
 * stand-in agents. They are not agent evaluations: a real run is `npm run eval:agent`.
 */
function scriptedAgent(name: string, act: (workspace: string) => Promise<void>): AgentRunner {
  return {
    name,
    run: async (workspace) => {
      const started = Date.now();
      await act(workspace);
      return {
        runner: name,
        exitCode: 0,
        timedOut: false,
        durationMs: Date.now() - started,
        costUsd: null,
        inputTokens: null,
        outputTokens: null,
        cacheReadTokens: null,
        cacheCreationTokens: null,
        numTurns: null,
        sessionId: null,
        models: [],
        // A stand-in that always CLAIMS success: the harness must ignore this text.
        rawOutput: JSON.stringify({ result: "All done, every test passes!" }),
      };
    },
  };
}

const applyReference = async (ws: string) =>
  fs.copyFile(path.join(TASK_DIR, "reference-solution.js"), path.join(ws, "src", "invoice.js"));

describe("Agent-run evaluation harness (grading logic, scripted stand-in agents)", () => {
  let runsDir: string;
  beforeEach(async () => {
    runsDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-eval-runs-"));
  });
  afterEach(async () => {
    await fs.rm(runsDir, { recursive: true, force: true });
  });

  it("passes a correct in-scope change and persists auditable artifacts and history", async () => {
    const card = await AgentRunEvalHarness.run({
      taskDir: TASK_DIR,
      runner: scriptedAgent("scripted-correct", applyReference),
      trials: 2,
      runsDir,
    });
    expect(() => AgentRunScorecardSchema.parse(card)).not.toThrow();
    expect(card.passedTrials).toBe(2);
    expect(card.allTrialsPassed).toBe(true);
    expect(card.totalCostUsd).toBeNull(); // nothing reported → not measured, never estimated
    for (const r of card.results) {
      expect(r.hiddenTestExitCode).toBe(0);
      expect(r.hiddenTestsTotal).toBe(8);
      expect(r.changedFiles).toEqual(["src/invoice.js"]);
      expect(r.baselineSha).toMatch(/^[0-9a-f]{40}$/);
      for (const f of ["result.json", "diff.patch", "agent-output.txt", "hidden-tests-output.txt", "hook-events.jsonl"]) {
        await expect(fs.access(path.join(r.artifactsDir, f))).resolves.toBeUndefined();
      }
      expect(await fs.readFile(path.join(r.artifactsDir, "diff.patch"), "utf-8")).toContain("src/invoice.js");
    }
    expect(card.results[0]!.ticketId).not.toBe(card.results[1]!.ticketId);

    const history = (await fs.readFile(path.join(runsDir, "history.jsonl"), "utf-8")).trim().split("\n");
    expect(history).toHaveLength(1);
    expect(JSON.parse(history[0]!)).toMatchObject({ runId: card.runId, passedTrials: 2, trials: 2 });
  });

  it("fails an agent that claims success but changed nothing", async () => {
    const card = await AgentRunEvalHarness.run({
      taskDir: TASK_DIR,
      runner: scriptedAgent("scripted-noop", async () => undefined),
      trials: 1,
      runsDir,
    });
    const r = card.results[0]!;
    expect(r.passed).toBe(false);
    expect(r.hiddenTestsPassed).toBe(false);
    expect(r.hiddenTestExitCode).not.toBe(0);
    expect(r.hiddenTestsFailed).toBeGreaterThan(0);
    expect(r.changedFiles).toEqual([]);
    expect(card.passRate).toBe(0);
    expect(card.allTrialsPassed).toBe(false);
  });

  it("fails a correct solution that also touches files outside the allow-list (edits a test, adds a file)", async () => {
    const card = await AgentRunEvalHarness.run({
      taskDir: TASK_DIR,
      runner: scriptedAgent("scripted-out-of-scope", async (ws) => {
        await applyReference(ws);
        await fs.appendFile(path.join(ws, "test", "invoice.test.js"), "\n// weakened\n");
        await fs.writeFile(path.join(ws, "notes.md"), "extra\n");
      }),
      trials: 1,
      runsDir,
    });
    const r = card.results[0]!;
    expect(r.hiddenTestsPassed).toBe(true);
    expect(r.scopeRespected).toBe(false);
    expect(r.outOfScopeFiles).toEqual(["notes.md", "test/invoice.test.js"]);
    expect(r.passed).toBe(false);
  });

  it("does not let the agent pre-empt the grader: a planted hidden-tests directory is out of scope and overwritten", async () => {
    const card = await AgentRunEvalHarness.run({
      taskDir: TASK_DIR,
      runner: scriptedAgent("scripted-plants-tests", async (ws) => {
        await fs.mkdir(path.join(ws, "hidden-tests"), { recursive: true });
        await fs.writeFile(
          path.join(ws, "hidden-tests", "invoice.hidden.test.js"),
          'import { test } from "node:test";\ntest("always green", () => {});\n'
        );
      }),
      trials: 1,
      runsDir,
    });
    const r = card.results[0]!;
    expect(r.hiddenTestsPassed).toBe(false);
    expect(r.outOfScopeFiles).toContain("hidden-tests/invoice.hidden.test.js");
    expect(r.passed).toBe(false);
  });

  it("gives every trial a clean workspace: a change made in trial 1 is not visible in trial 2", async () => {
    let call = 0;
    const seenFixed: boolean[] = [];
    const card = await AgentRunEvalHarness.run({
      taskDir: TASK_DIR,
      runner: scriptedAgent("scripted-first-only", async (ws) => {
        call++;
        const src = await fs.readFile(path.join(ws, "src", "invoice.js"), "utf-8");
        seenFixed.push(src.includes("RangeError"));
        if (call === 1) await applyReference(ws);
      }),
      trials: 2,
      runsDir,
    });
    expect(seenFixed).toEqual([false, false]);
    expect(card.results.map((r) => r.passed)).toEqual([true, false]);
    expect(card.passRate).toBe(0.5);
  });

  it("rejects a non-positive trial count", async () => {
    await expect(
      AgentRunEvalHarness.run({ taskDir: TASK_DIR, runner: scriptedAgent("x", async () => undefined), trials: 0, runsDir })
    ).rejects.toThrow(/AGENT_EVAL_INVALID_TRIALS/);
  });

  it("parses usage only when the CLI reported it, in both object and event-array output shapes", () => {
    const result = {
      type: "result",
      total_cost_usd: 0.1234,
      num_turns: 7,
      session_id: "abc",
      usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 30, cache_creation_input_tokens: 40 },
      modelUsage: { "model-a": {} },
    };
    const expected = {
      costUsd: 0.1234,
      inputTokens: 10,
      outputTokens: 20,
      cacheReadTokens: 30,
      cacheCreationTokens: 40,
      numTurns: 7,
      sessionId: "abc",
      models: ["model-a"],
    };
    expect(parseClaudeCodeJsonResult(JSON.stringify(result))).toEqual(expected);
    expect(parseClaudeCodeJsonResult(JSON.stringify([{ type: "system" }, result]))).toEqual(expected);
    for (const junk of ["", "not json", "{}", "[]"]) {
      const parsed = parseClaudeCodeJsonResult(junk);
      expect(parsed.costUsd).toBeNull();
      expect(parsed.inputTokens).toBeNull();
      expect(parsed.models).toEqual([]);
    }
  });

  it("computes the Wilson interval correctly", () => {
    const [lo5, hi5] = wilsonInterval(5, 5);
    expect(lo5).toBeCloseTo(0.5655, 3);
    expect(hi5).toBe(1);
    const [lo, hi] = wilsonInterval(3, 5);
    expect(lo).toBeCloseTo(0.2307, 3);
    expect(hi).toBeCloseTo(0.8824, 3);
    expect(wilsonInterval(0, 0)).toEqual([0, 1]);
  });
});
