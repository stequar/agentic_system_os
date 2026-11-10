import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { runHolisticWorkspaceBootstrap } from "../../bootstrap/holistic-bootstrap.js";

export interface BootstrapCommandOptions {
  json?: boolean;
  dryRun?: boolean;
}

export async function bootstrapCommand(
  ctx: ExecutionContext,
  targetPath?: string,
  options?: BootstrapCommandOptions
): Promise<void> {
  const resolvedTarget = targetPath || ctx.cwd;

  try {
    const report = await runHolisticWorkspaceBootstrap(resolvedTarget, {
      dryRun: Boolean(options?.dryRun),
    });

    if (options?.json) {
      ctx.stdout(JSON.stringify(report, null, 2));
      return;
    }

    ctx.stdout(
      chalk.bold.blue("\n🚀 AGENTIC COMPANY OS — 5-Phase Holistic Workspace Bootstrap")
    );
    ctx.stdout(chalk.gray("--------------------------------------------------------------"));
    ctx.stdout(`${chalk.bold("Target Workspace:")} ${chalk.cyan(report.targetPath)}`);
    ctx.stdout(
      `${chalk.bold("Phases Completed:")} ${report.phasesCompleted.map((p) => chalk.green(p)).join(" → ")}`
    );
    ctx.stdout(
      `${chalk.bold("Hermetic Runners:")} ${report.hermeticTestCommands.join(", ")}`
    );
    ctx.stdout(
      `${chalk.bold("Ring-1 Specialists:")} ${report.orgChart.ring1TechSpecialists.map((s) => s.id).join(", ")}`
    );
    ctx.stdout(
      `${chalk.bold("Ring-2 Domain Experts:")} ${report.orgChart.ring2DomainExperts.map((s) => s.id).join(", ")}`
    );
    ctx.stdout(
      `${chalk.bold("JIT MCP Tools Hot-Loaded:")} ${report.synthesizedMcpTools.map((t) => t.toolId).join(", ")}`
    );
    ctx.stdout(
      `${chalk.bold("Contract Drift Findings:")} ${report.driftReport.findings.length}`
    );
    ctx.stdout(
      `${chalk.bold("Inaugural Ceremony ID:")} ${chalk.magenta(report.ceremonyId)}\n`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.stderr(chalk.red(`Error during holistic bootstrap: ${message}`));
    ctx.exit(1);
  }
}
