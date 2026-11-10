import chalk from "chalk";
import { runScaffoldingWizard } from "../wizard.js";
export async function initCommand(ctx, targetPath, options) {
    try {
        const target = targetPath || ctx.cwd;
        await runScaffoldingWizard(target, options);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.stderr(chalk.red(`Error during initialization: ${message}`));
        ctx.exit(1);
    }
}
//# sourceMappingURL=init.js.map