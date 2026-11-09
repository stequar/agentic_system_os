import { describe, it, expect, beforeEach } from "vitest";
import path from "node:path";
import { createMemoryContext } from "../src/cli/context.js";
import { statusCommand } from "../src/cli/commands/status.js";
import { inspectCommand } from "../src/cli/commands/inspect.js";
import { attachCommand } from "../src/cli/commands/attach.js";
import { resumeCommand } from "../src/cli/commands/resume.js";
import { createCliApp } from "../src/cli/dispatcher.js";
import { AttachResultSchema } from "../src/contracts/roles.js";

describe("CLI Modular Refactor & ExecutionContext Decoupling", () => {
  const rootDir = process.cwd();
  let ctx: ReturnType<typeof createMemoryContext>;

  beforeEach(() => {
    ctx = createMemoryContext(rootDir);
  });

  it("ExecutionContext in-memory cattura correttamente stdout, stderr ed exitCode", () => {
    ctx.stdout("test stdout message");
    ctx.stderr("test stderr message");
    ctx.exit(1);

    expect(ctx.getStdout()).toContain("test stdout message");
    expect(ctx.getStderr()).toContain("test stderr message");
    expect(ctx.getExitCode()).toBe(1);

    ctx.clear();
    expect(ctx.getStdout()).toBe("");
    expect(ctx.getStderr()).toBe("");
    expect(ctx.getExitCode()).toBeNull();
  });

  it("esegue statusCommand in-memory senza terminare il processo", async () => {
    await statusCommand(ctx);

    expect(ctx.getStdout()).toContain("AGENTIC COMPANY OS — Status");
    expect(ctx.getStdout()).toContain("Stato Attuale:");
    expect(ctx.getStdout()).toContain("Context as RAM");
    expect(ctx.getExitCode()).toBeNull();
    expect(ctx.getStderr()).toBe("");
  });

  it("esegue inspectCommand con output JSON in-memory", async () => {
    await inspectCommand(ctx, rootDir, { json: true });

    expect(ctx.getExitCode()).toBeNull();
    const stdout = ctx.getStdout();
    const parsed = JSON.parse(stdout);

    expect(parsed.targetPath).toBe(rootDir);
    expect(parsed.languages).toContain("typescript");
    expect(parsed.packageManagers).toContain("npm");
  });

  it("esegue inspectCommand con output formattato (human readable)", async () => {
    await inspectCommand(ctx, rootDir);

    expect(ctx.getExitCode()).toBeNull();
    expect(ctx.getStdout()).toContain("Project Inspector Report");
    expect(ctx.getStdout()).toContain("Linguaggi:");
    expect(ctx.getStdout()).toContain("Package Managers:");
  });

  it("gestisce errore in inspectCommand su directory non valida registrando exitCode 1", async () => {
    const invalidPath = path.join(rootDir, "directory_totalmente_inesistente_123");
    await inspectCommand(ctx, invalidPath);

    expect(ctx.getExitCode()).toBe(1);
    expect(ctx.getStderr()).toContain("Errore durante l'ispezione");
  });

  it("esegue attachCommand con --dry-run e --json in-memory", async () => {
    await attachCommand(ctx, rootDir, { dryRun: true, json: true });

    expect(ctx.getExitCode()).toBeNull();
    const stdout = ctx.getStdout();
    const parsed = JSON.parse(stdout);

    const validation = AttachResultSchema.safeParse(parsed);
    expect(validation.success).toBe(true);
    expect(parsed.targetPath).toBe(rootDir);
  });

  it("gestisce directory inesistente in attachCommand con exitCode 1", async () => {
    const invalidPath = path.join(rootDir, "dir_inesistente_attach_456");
    await attachCommand(ctx, invalidPath);

    expect(ctx.getExitCode()).toBe(1);
    expect(ctx.getStderr()).toContain("Errore durante l'operazione di attach");
  });

  it("gestisce sessione inesistente in resumeCommand senza crash di processo", async () => {
    await resumeCommand(ctx, "session-inesistente-9999", { path: rootDir });

    expect(ctx.getExitCode()).toBe(1);
    expect(ctx.getStderr()).toContain("Nessuna sessione trovata");
  });

  it("createCliApp esegue il dispatching corretto tramite Commander con ExecutionContext", async () => {
    const app = createCliApp(ctx);
    await app.parseAsync(["node", "agentic-company", "status"]);

    expect(ctx.getStdout()).toContain("AGENTIC COMPANY OS — Status");
    expect(ctx.getExitCode()).toBeNull();
  });
});
