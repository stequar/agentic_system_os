import chalk from "chalk";
import { startStudioServer } from "../../studio/server.js";
export async function studioCommand(ctx, options) {
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
    }
    catch (err) {
        ctx.stderr(chalk.red(`Error starting Studio Server: ${err.message || String(err)}`));
        ctx.exit(1);
    }
}
//# sourceMappingURL=studio.js.map