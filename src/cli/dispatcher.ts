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
    .description("CLI e Orchestratore per Startup Software Multi-Agente Autonome")
    .version("0.1.0");

  program
    .command("status")
    .description("Mostra lo stato corrente dell'azienda e degli agenti")
    .action(async () => {
      await statusCommand(ctx);
    });

  program
    .command("init [path]")
    .description("Inizializza la struttura aziendale e la Knowledge Base in un nuovo repository con il wizard interattivo")
    .option("-y, --yes", "Accetta tutti i default senza prompt interattivi (modalità headless)")
    .option("--non-interactive", "Esecuzione non interattiva per runner CI/CD")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (targetPath?: string, options?: any) => {
      await initCommand(ctx, targetPath, options);
    });

  program
    .command("inspect <path>")
    .description("Analizza la directory di un progetto e visualizza lo stack tecnologico rilevato")
    .option("--json", "Output in formato JSON puro")
    .action(async (targetPath: string, options: any) => {
      await inspectCommand(ctx, targetPath, options);
    });

  program
    .command("attach <path>")
    .description("Inietta i ruoli, le skill operative e la knowledge base nel workspace specificato")
    .option("--json", "Output in formato JSON puro")
    .option("--force", "Forza l'iniezione")
    .option("--dry-run", "Simula l'iniezione senza modificare il disco")
    .action(async (targetPath: string, options: any) => {
      await attachCommand(ctx, targetPath, options);
    });

  program
    .command("mcp")
    .description("Avvia l'Agentic Company OS MCP Server su trasporto stdio")
    .action(async () => {
      await mcpCommand(ctx);
    });

  program
    .command("resume [sessionId]")
    .description("Ripristina una sessione di lavoro interrotta con garanzia di Two-Phase Commit")
    .option("-p, --path <path>", "Percorso del workspace target", ctx.cwd)
    .option("--json", "Output in formato JSON")
    .action(async (sessionId: string | undefined, options: any) => {
      await resumeCommand(ctx, sessionId, options);
    });

  program
    .command("studio")
    .description("Avvia il Local Web Studio Dashboard su localhost:4321 con Server-Sent Events")
    .option("-p, --port <port>", "Porta del server", "4321")
    .option("-w, --path <path>", "Percorso del workspace target", ctx.cwd)
    .action(async (options: any) => {
      await studioCommand(ctx, options);
    });

  program
    .command("doctor [path]")
    .description("Esegue la diagnostica parallela della toolchain locale (git, python3, venv, swiftc, docker)")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (targetPath?: string, options?: any) => {
      await doctorCommand(ctx, targetPath, options);
    });

  program
    .command("bootstrap [path]")
    .description("Esegue il 5-Phase Holistic Workspace Bootstrap (Recon, Domain Mining, Tri-Ring Org, JIT MCP Tools & Ceremonies)")
    .option("--json", "Output serializzato in formato JSON puro")
    .option("--dry-run", "Simula il bootstrap senza scrivere su disco")
    .action(async (targetPath?: string, options?: any) => {
      await bootstrapCommand(ctx, targetPath, options);
    });

  program
    .command("workflow <action> [path]")
    .description("Dual-Brain CLI Bridge per interrogare stato CTO Mode, Scope Routing Tri-Ring, Cognitive Forcing Gate e Settings (status | route | verify-gate | settings | set-setting | eval-settings)")
    .option("--scope <filesOrKeywords>", "File o keyword separati da virgola per il routing degli esperti Ring-1/Ring-2")
    .option("--mode <mode>", "Modalità operativa CTO (MODE_1_STANDUP | MODE_2_INVESTIGATE_RCA | MODE_3_RND_ROUNDTABLE | MODE_4_BUILD_GATEKEEPER)")
    .option("--stimulus <stimulus>", "Tipo di stimolo (NORMAL_SPRINT | ANOMALY_OR_BUG)")
    .option("--rca-file <rcaFile>", "Percorso file JSON contenente il RootCauseAnalysisReport")
    .option("--key <settingKey>", "Chiave dot-notation del setting in .company-os/settings.json (es. governance.spikeCheckpoint)")
    .option("--value <settingValue>", "Nuovo valore da impostare per il setting specificato")
    .option("--json", "Output serializzato in formato JSON puro")
    .action(async (action: string, targetPath?: string, options?: any) => {
      await workflowCommand(ctx, action, targetPath, options);
    });

  return program;
}
