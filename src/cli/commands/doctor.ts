import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { runEnvironmentDoctor } from "../../doctor/health.js";

export interface DoctorCommandOptions {
  json?: boolean;
  timeout?: number;
}

export async function doctorCommand(
  ctx: ExecutionContext,
  targetPath?: string,
  options?: DoctorCommandOptions
): Promise<void> {
  const resolvedTarget = targetPath || ctx.cwd;

  try {
    const report = await runEnvironmentDoctor(resolvedTarget, {
      timeoutMs: options?.timeout ?? 3000,
    });

    if (options?.json) {
      ctx.stdout(JSON.stringify(report, null, 2));
      return;
    }

    ctx.stdout(chalk.bold.blue("\n🩺 AGENTIC COMPANY OS — Environment Doctor Report"));
    ctx.stdout(chalk.gray("--------------------------------------------------"));
    ctx.stdout(`${chalk.bold("Workspace Target:")} ${chalk.cyan(report.targetPath)}`);

    const statusBadge =
      report.overallStatus === "ok"
        ? chalk.bgGreen.black(" HEALTHY (OK) ")
        : report.overallStatus === "warn"
          ? chalk.bgYellow.black(" WARNING ")
          : chalk.bgRed.white(" ERROR ");

    ctx.stdout(`${chalk.bold("Overall Status:")}   ${statusBadge} (${report.durationMs}ms)\n`);

    for (const check of report.checks) {
      const icon =
        check.status === "ok"
          ? chalk.green("✔")
          : check.status === "warn"
            ? chalk.yellow("⚠")
            : check.status === "skipped"
              ? chalk.gray("○")
              : chalk.red("✖");

      const ver = check.version ? chalk.cyan(` [v${check.version}]`) : "";
      ctx.stdout(
        `  ${icon} ${chalk.bold(check.checkName.padEnd(10))} ${chalk.gray(`(${check.category})`)}${ver} — ${check.message}`
      );
      if (check.fixSuggested && check.status !== "ok") {
        ctx.stdout(`      ${chalk.yellow("↳ Fix suggerito:")} ${chalk.underline(check.fixSuggested)}`);
      }
    }

    ctx.stdout("");
    if (report.overallStatus === "error") {
      ctx.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.stderr(chalk.red(`Errore durante l'esecuzione del Doctor: ${message}`));
    ctx.exit(1);
  }
}
