import chalk from "chalk";
import { CompanyStateMachine } from "../../core/state-machine.js";
import type { ExecutionContext } from "../context.js";

export async function statusCommand(ctx: ExecutionContext): Promise<void> {
  const sm = new CompanyStateMachine();
  ctx.stdout(chalk.bold.blue("\n🏢 AGENTIC COMPANY OS — Status"));
  ctx.stdout(chalk.gray("-----------------------------------------"));
  ctx.stdout(`Stato Attuale: ${chalk.green.bold(sm.getState())}`);
  ctx.stdout(chalk.yellow("Ruoli attivi: CTO (L1), Product Lead (L2), Backend Manager (L2), Mobile Manager (L2)"));
  ctx.stdout(chalk.cyan("Principio Context as RAM attivo via docs/wiki/\n"));
}
