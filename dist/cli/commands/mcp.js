import chalk from "chalk";
import { startMcpServer } from "../../mcp/server.js";
export async function mcpCommand(ctx) {
    try {
        await startMcpServer();
    }
    catch (err) {
        ctx.stderr(chalk.red(`Error starting MCP Server: ${err.message || String(err)}`));
        ctx.exit(1);
    }
}
//# sourceMappingURL=mcp.js.map