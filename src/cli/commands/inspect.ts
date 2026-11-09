import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { detectProjectStack } from "../../inspector/detector.js";

export interface InspectCommandOptions {
  json?: boolean;
}

export async function inspectCommand(
  ctx: ExecutionContext,
  targetPath: string,
  options?: InspectCommandOptions
): Promise<void> {
  try {
    const stack = await detectProjectStack(targetPath);

    if (options?.json) {
      ctx.stdout(JSON.stringify(stack, null, 2));
      return;
    }

    ctx.stdout(chalk.bold.blue("\n🔍 AGENTIC COMPANY OS — Project Inspector Report"));
    ctx.stdout(chalk.gray("--------------------------------------------------"));
    ctx.stdout(`${chalk.bold("Percorso analizzato:")} ${chalk.cyan(stack.targetPath)}`);

    const langTags = stack.languages.map((l) => chalk.bgCyan.black(` ${l} `)).join(" ");
    ctx.stdout(`${chalk.bold("Linguaggi:")} ${langTags}`);

    const frameworksText =
      stack.frameworks.length > 0
        ? stack.frameworks.map((f) => chalk.magenta(f)).join(", ")
        : chalk.gray("Nessuno rilevato");
    ctx.stdout(`${chalk.bold("Frameworks:")} ${frameworksText}`);

    const dockerText = stack.hasDocker ? chalk.green("Sì") : chalk.red("No");
    ctx.stdout(`${chalk.bold("Supporto Docker:")} ${dockerText}`);

    const pmText =
      stack.packageManagers.length > 0
        ? stack.packageManagers.join(", ")
        : chalk.gray("Nessuno rilevato");
    ctx.stdout(`${chalk.bold("Package Managers:")} ${pmText}`);

    const testCmdText =
      stack.testCommands.length > 0
        ? stack.testCommands.map((c) => chalk.greenBright(c)).join(", ")
        : chalk.gray("Nessun comando configurato");
    ctx.stdout(`${chalk.bold("Comandi Test raccomandati:")} ${testCmdText}`);

    const entryPointsText =
      stack.entryPoints.length > 0
        ? stack.entryPoints.map((e) => chalk.white(e)).join(", ")
        : chalk.gray("Nessuno rilevato");
    ctx.stdout(`${chalk.bold("Entry Points:")} ${entryPointsText}`);

    ctx.stdout(`${chalk.bold("Timestamp rilevamento:")} ${chalk.gray(stack.detectedAt)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.stderr(chalk.red(`Errore durante l'ispezione: ${message}`));
    ctx.exit(1);
  }
}
