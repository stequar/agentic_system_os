import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { runScaffoldingWizard } from "../wizard.js";

export interface InitCommandOptions {
  yes?: boolean;
  nonInteractive?: boolean;
  json?: boolean;
}

export async function initCommand(
  ctx: ExecutionContext,
  targetPath?: string,
  options?: InitCommandOptions
): Promise<void> {
  try {
    const target = targetPath || ctx.cwd;
    await runScaffoldingWizard(target, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.stderr(chalk.red(`Error during initialization: ${message}`));
    ctx.exit(1);
  }
}
