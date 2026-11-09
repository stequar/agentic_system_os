import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { startStudioServer } from "../../studio/server.js";

export interface StudioCommandOptions {
  port?: string;
  path?: string;
}

export async function studioCommand(
  ctx: ExecutionContext,
  options?: StudioCommandOptions
): Promise<void> {
  try {
    const port = parseInt(options?.port || "4321", 10);
    const targetPath = options?.path || ctx.cwd;

    const handle = await startStudioServer({
      port,
      targetPath,
    });

    ctx.stdout(chalk.bold.cyan("\n🚀 Agentic Company OS — Local Web Studio"));
    ctx.stdout(chalk.gray("--------------------------------------------------"));
    ctx.stdout(`${chalk.bold("Studio URL:")} ${chalk.green.underline(handle.url)}`);
    ctx.stdout(`${chalk.bold("Auth Token:")} ${chalk.yellow(handle.token)}`);
    ctx.stdout(`${chalk.bold("Loopback Host:")} 127.0.0.1 (Strict Bind)`);
    ctx.stdout(chalk.gray("Premi Ctrl+C per arrestare il server.\n"));

    process.on("SIGINT", async () => {
      ctx.stdout(chalk.yellow("\nArresto dello Studio Server in corso..."));
      await handle.stop();
      ctx.exit(0);
    });
  } catch (err: any) {
    ctx.stderr(chalk.red(`Errore avvio Studio Server: ${err.message || String(err)}`));
    ctx.exit(1);
  }
}
