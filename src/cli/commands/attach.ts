import path from "node:path";
import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { attachWorkspace } from "../../attach/injector.js";
import { detectProjectStack } from "../../inspector/detector.js";
import { generateTeamConfiguration } from "../../generator/roles.js";

export interface AttachCommandOptions {
  json?: boolean;
  force?: boolean;
  dryRun?: boolean;
}

export async function attachCommand(
  ctx: ExecutionContext,
  targetPath: string,
  options?: AttachCommandOptions
): Promise<void> {
  try {
    const result = await attachWorkspace(targetPath, {
      force: options?.force,
      dryRun: options?.dryRun,
    });

    if (options?.json) {
      ctx.stdout(JSON.stringify(result, null, 2));
      return;
    }

    const stack = await detectProjectStack(targetPath);
    const teamConfig = await generateTeamConfiguration(stack);

    ctx.stdout(chalk.bold.blue("\n🏢 AGENTIC COMPANY OS — Workspace Attach"));
    ctx.stdout(chalk.gray("--------------------------------------------------"));
    ctx.stdout(`${chalk.bold("Target Path:")} ${chalk.cyan(result.targetPath)}`);
    ctx.stdout(
      `${chalk.bold("Modalità:")} ${
        options?.dryRun
          ? chalk.yellow.bold("Dry Run (Simulazione)")
          : chalk.green.bold("Live (Scrittura)")
      }`
    );

    const langsText = stack.languages.length > 0 ? stack.languages.join(", ") : "Nessuno rilevato";
    const fwsText = stack.frameworks.length > 0 ? ` (${stack.frameworks.join(", ")})` : "";
    ctx.stdout(`${chalk.bold("Stack Rilevato:")} ${chalk.white(langsText + fwsText)}`);

    const rolesList = teamConfig.roles.map((r) => `${r.name} [${r.level}]`).join(", ");
    ctx.stdout(`${chalk.bold("Ruoli Generati:")} ${chalk.yellow(rolesList)}`);

    ctx.stdout(chalk.bold("\nFile Iniettati:"));
    for (const file of result.injectedFiles) {
      const relPath = path.relative(result.targetPath, file.path);
      let statusBadge = "";
      switch (file.status) {
        case "CREATED":
          statusBadge = chalk.green("CREATED");
          break;
        case "SKIPPED_UNCHANGED":
          statusBadge = chalk.cyan("SKIPPED_UNCHANGED");
          break;
        case "BACKED_UP_AND_OVERWRITTEN":
          statusBadge =
            chalk.yellow("BACKED_UP_AND_OVERWRITTEN") +
            (file.backupPath
              ? chalk.gray(` (backup: ${path.relative(result.targetPath, file.backupPath)})`)
              : "");
          break;
        case "OVERWRITTEN":
          statusBadge = chalk.magenta("OVERWRITTEN");
          break;
      }
      ctx.stdout(`  ${chalk.gray("•")} ${chalk.bold(relPath)}: ${statusBadge}`);
    }

    ctx.stdout(`\n${chalk.bold("Summary:")} ${chalk.white(result.summary)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.stderr(chalk.red(`Errore durante l'operazione di attach: ${message}`));
    ctx.exit(1);
  }
}
