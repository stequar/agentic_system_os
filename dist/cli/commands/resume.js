import chalk from "chalk";
import { SessionStore } from "../../core/session-store.js";
export async function resumeCommand(ctx, sessionId, options) {
    try {
        const targetPath = options?.path || ctx.cwd;
        const result = await SessionStore.resumeSession(targetPath, sessionId);
        if (options?.json) {
            ctx.stdout(JSON.stringify(result, null, 2));
            return;
        }
        if (result.success) {
            ctx.stdout(chalk.green(`✔ ${result.message}`));
        }
        else {
            ctx.stderr(chalk.red(`✖ ${result.message}`));
            ctx.exit(1);
        }
    }
    catch (err) {
        ctx.stderr(chalk.red(`Error resuming: ${err.message || String(err)}`));
        ctx.exit(1);
    }
}
//# sourceMappingURL=resume.js.map