import { Command } from "commander";
import { type ExecutionContext, createDefaultContext } from "./context.js";
import { statusCommand } from "./commands/status.js";
import { initCommand } from "./commands/init.js";
import { inspectCommand } from "./commands/inspect.js";
import { attachCommand } from "./commands/attach.js";
import { mcpCommand } from "./commands/mcp.js";
import { resumeCommand } from "./commands/resume.js";
import { studioCommand } from "./commands/studio.js";
import { doctorCommand } from "./commands/doctor.js";
import { bootstrapCommand } from "./commands/bootstrap.js";
import { workflowCommand } from "./commands/workflow.js";

/**
 * Crea e configura l'applicazione CLI Commander disaccoppiata dall'ambiente di processo.
 * Consente l'iniezione di un ExecutionContext personalizzato per testing o runtime alternativi.
 */
export function createCliApp(ctx: ExecutionContext = createDefaultContext()): Command {
  const program = new Command();

  program
    .name("agentic-company")
    .description("CLI & Orchestrator for Autonomous Multi-Agent Software Startups")
    .version("0.1.0");

  program
    .command("status")
    .description("Show the current company and agent status")
    .action(async () => {
      await statusCommand(ctx);
    });

  program
    .command("init [path]")
    .description("Initialize the company structure and Knowledge Base in a new repository via the interactive wizard")
    .option("-y, --yes", "Accept all defaults with no interactive prompts (headless mode)")
    .option("--non-interactive", "Non-interactive execution for CI/CD runners")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (targetPath?: string, options?: any) => {
      await initCommand(ctx, targetPath, options);
    });

  program
    .command("inspect <path>")
    .description("Analyze a project directory and show the detected tech stack")
    .option("--json", "Output in formato JSON puro")
    .action(async (targetPath: string, options: any) => {
      await inspectCommand(ctx, targetPath, options);
    });

  program
    .command("attach <path>")
    .description("Inject roles, operational skills, and the knowledge base into the given workspace")
    .option("--json", "Output in formato JSON puro")
    .option("--force", "Forza l'iniezione")
    .option("--dry-run", "Simula l'iniezione senza modificare il disco")
    .action(async (targetPath: string, options: any) => {
      await attachCommand(ctx, targetPath, options);
    });

  program
    .command("mcp")
    .description("Start the Agentic Company OS MCP Server over stdio transport")
    .action(async () => {
      await mcpCommand(ctx);
    });

  program
    .command("resume [sessionId]")
    .description("Resume an interrupted work session with Two-Phase Commit guarantees")
    .option("-p, --path <path>", "Target workspace path", ctx.cwd)
    .option("--json", "Output in formato JSON")
    .action(async (sessionId: string | undefined, options: any) => {
      await resumeCommand(ctx, sessionId, options);
    });

  program
    .command("studio")
    .description("Start the Local Web Studio Dashboard on localhost:4321 with Server-Sent Events")
    .option("-p, --port <port>", "Porta del server", "4321")
    .option("-w, --path <path>", "Target workspace path", ctx.cwd)
    .action(async (options: any) => {
      await studioCommand(ctx, options);
    });

  program
    .command("doctor [path]")
    .description("Run parallel diagnostics on the local toolchain (git, python3, venv, swiftc, docker)")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (targetPath?: string, options?: any) => {
      await doctorCommand(ctx, targetPath, options);
    });

  program
    .command("bootstrap [path]")
    .description("Run the 5-Phase Holistic Workspace Bootstrap (Recon, Domain Mining, Tri-Ring Org, JIT MCP Tools & Ceremonies)")
    .option("--json", "Output serializzato in formato JSON puro")
    .option("--dry-run", "Simula il bootstrap senza scrivere su disco")
    .action(async (targetPath?: string, options?: any) => {
      await bootstrapCommand(ctx, targetPath, options);
    });

  program
    .command("workflow <action> [path]")
    .description("Dual-Brain CLI Bridge to query CTO Mode state, Tri-Ring Scope Routing, the Cognitive Forcing Gate, and Settings (status | route | verify-gate | settings | set-setting | eval-settings)")
    .option("--scope <filesOrKeywords>", "Comma-separated files or keywords for routing Ring-1/Ring-2 experts")
    .option("--mode <mode>", "CTO operating mode (MODE_1_STANDUP | MODE_2_INVESTIGATE_RCA | MODE_3_RND_ROUNDTABLE | MODE_4_BUILD_GATEKEEPER)")
    .option("--stimulus <stimulus>", "Tipo di stimolo (NORMAL_SPRINT | ANOMALY_OR_BUG)")
    .option("--rca-file <rcaFile>", "Path to the JSON file containing the RootCauseAnalysisReport")
    .option("--key <settingKey>", "Chiave dot-notation del setting in .company-os/settings.json (es. governance.spikeCheckpoint)")
    .option("--value <settingValue>", "New value to set for the specified setting")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (action: string, targetPath?: string, options?: any) => {
      await workflowCommand(ctx, action, targetPath, options);
    });

  return program;
}
