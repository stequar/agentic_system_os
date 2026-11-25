import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import {
  HOOK_SCRIPT_REL,
  RECORDED_HOOK_EVENTS,
  TRACE_REL,
  installClaudeCodeHookRecorder,
  readActiveTicket,
  readTrace,
  startTicket,
} from "../src/telemetry/run-trace.js";
import { runGatekeeper } from "../src/gatekeeper/runner.js";
import { setupAgentHarnesses } from "../src/attach/harness-adapter.js";
import { createMemoryContext } from "../src/cli/context.js";
import { createCliApp } from "../src/cli/dispatcher.js";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

describe("Run trace: ticket anchor, hook recorder and gatekeeper verdict", () => {
  let repo: string;

  beforeEach(async () => {
    repo = await fs.mkdtemp(path.join(os.tmpdir(), "run-trace-"));
    git(repo, "init", "-q");
    git(repo, "config", "user.email", "test@example.invalid");
    git(repo, "config", "user.name", "test");
    await fs.writeFile(path.join(repo, "a.txt"), "a\n");
    git(repo, "add", ".");
    git(repo, "commit", "-q", "-m", "init");
  });

  afterEach(async () => {
    await fs.rm(repo, { recursive: true, force: true });
  });

  it("start-ticket persists the ticket id with the real git HEAD as baseline", async () => {
    const ctx = createMemoryContext(repo);
    await createCliApp(ctx).parseAsync([
      "node", "agentic-os", "workflow", "start-ticket", repo, "--ticket", "TCK-42", "--json",
    ]);
    const out = JSON.parse(ctx.getStdout());
    expect(out.ticketId).toBe("TCK-42");
    expect(out.baselineSha).toBe(git(repo, "rev-parse", "HEAD"));
    expect(await readActiveTicket(repo)).toMatchObject({ ticketId: "TCK-42", baselineSha: out.baselineSha });
  });

  it("rejects a ticket id that is not a safe identifier and records a null baseline outside git", async () => {
    await expect(startTicket(repo, "../../etc/passwd")).rejects.toThrow();
    expect(await readActiveTicket(repo)).toBeNull();

    const plain = await fs.mkdtemp(path.join(os.tmpdir(), "run-trace-nogit-"));
    try {
      expect((await startTicket(plain, "TCK-1")).baselineSha).toBeNull();
    } finally {
      await fs.rm(plain, { recursive: true, force: true });
    }
  });

  it("the gatekeeper records real exit codes for the active ticket — both pass and fail", async () => {
    await startTicket(repo, "TCK-7");
    const ok = await runGatekeeper(repo, ["node -e \"process.exit(0)\""]);
    const bad = await runGatekeeper(repo, ["node -e \"process.exit(3)\""]);
    expect(ok.testsPassed).toBe(true);
    expect(bad.testsPassed).toBe(false);

    const trace = await readTrace(repo, { ticketId: "TCK-7" });
    expect(trace).toHaveLength(2);
    expect(trace.every((r) => r.source === "gatekeeper")).toBe(true);
    expect(trace[0]!.payload).toMatchObject({ testsPassed: true, commands: [{ exitCode: 0, timedOut: false }] });
    expect(trace[1]!.payload).toMatchObject({ testsPassed: false, commands: [{ exitCode: 3, timedOut: false }] });
    expect(trace[1]!.baselineSha).toBe(git(repo, "rev-parse", "HEAD"));
  });

  it("the gatekeeper leaves no trace when no ticket is active", async () => {
    await runGatekeeper(repo, ["node -e \"process.exit(0)\""]);
    expect(await readTrace(repo)).toEqual([]);
    await expect(fs.access(path.join(repo, TRACE_REL))).rejects.toThrow();
  });

  it("install preserves existing local settings and user hooks, and is idempotent", async () => {
    const settingsPath = path.join(repo, ".claude", "settings.local.json");
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    const userSettings = {
      permissions: { allow: ["Bash(npm test *)"] },
      hooks: { Stop: [{ hooks: [{ type: "command", command: "echo user-hook" }] }] },
    };
    await fs.writeFile(settingsPath, JSON.stringify(userSettings));

    const first = await installClaudeCodeHookRecorder(repo);
    expect(first.eventsRegistered).toEqual([...RECORDED_HOOK_EVENTS]);
    const afterFirst = await fs.readFile(settingsPath, "utf-8");
    const parsed = JSON.parse(afterFirst);
    expect(parsed.permissions).toEqual(userSettings.permissions);
    expect(parsed.hooks.Stop[0]).toEqual(userSettings.hooks.Stop[0]);
    expect(parsed.hooks.Stop).toHaveLength(2);
    for (const event of RECORDED_HOOK_EVENTS) {
      expect(JSON.stringify(parsed.hooks[event])).toContain("record-hook-event.mjs");
    }

    const second = await installClaudeCodeHookRecorder(repo);
    expect(second.eventsRegistered).toEqual([]);
    expect(await fs.readFile(settingsPath, "utf-8")).toBe(afterFirst);
  });

  it("refuses to overwrite a local settings file it cannot parse", async () => {
    const settingsPath = path.join(repo, ".claude", "settings.local.json");
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, "{ not json");
    await expect(installClaudeCodeHookRecorder(repo)).rejects.toThrow();
    expect(await fs.readFile(settingsPath, "utf-8")).toBe("{ not json");
  });

  it("the installed recorder script really runs: it appends the raw payload stamped with the ticket, exits 0 and prints nothing", async () => {
    await installClaudeCodeHookRecorder(repo);
    await startTicket(repo, "TCK-9");
    const payload = {
      session_id: "sess-abc",
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      tool_input: { command: "npm test" },
    };
    const run = (stdin: string) =>
      spawnSync("node", [path.join(repo, HOOK_SCRIPT_REL)], {
        input: stdin,
        encoding: "utf-8",
        env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
      });

    const good = run(JSON.stringify(payload));
    const garbage = run("this is not json");
    for (const r of [good, garbage]) {
      expect(r.status).toBe(0);
      expect(r.stdout).toBe("");
      expect(r.stderr).toBe("");
    }

    const trace = await readTrace(repo, { ticketId: "TCK-9" });
    expect(trace).toHaveLength(2);
    expect(trace[0]).toMatchObject({ source: "claude_code_hook", ticketId: "TCK-9", payload });
    expect(trace[1]!.payload).toEqual({ unparsed: "this is not json" });
  });

  it("setup-harnesses installs the recorder and `workflow trace` summarises hook and gatekeeper records together", async () => {
    const result = await setupAgentHarnesses(repo);
    expect(result.telemetryHookFiles).toHaveLength(2);
    await startTicket(repo, "TCK-11");
    spawnSync("node", [path.join(repo, HOOK_SCRIPT_REL)], {
      input: JSON.stringify({ hook_event_name: "Stop", session_id: "s1" }),
      env: { ...process.env, CLAUDE_PROJECT_DIR: repo },
    });
    await runGatekeeper(repo, ["node -e \"process.exit(1)\""]);

    const ctx = createMemoryContext(repo);
    await createCliApp(ctx).parseAsync(["node", "agentic-os", "workflow", "trace", repo, "--json"]);
    const out = JSON.parse(ctx.getStdout());
    expect(out.ticketId).toBe("TCK-11");
    expect(out.bySource).toEqual({ claude_code_hook: 1, gatekeeper: 1 });
    expect(out.byHookEvent).toEqual({ Stop: 1 });
    expect(out.gatekeeperRuns[0]).toMatchObject({ testsPassed: false, commands: [{ exitCode: 1 }] });
  });
});
