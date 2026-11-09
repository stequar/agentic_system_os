import chalk from "chalk";
import type { ExecutionContext } from "../context.js";
import { startMcpServer } from "../../mcp/server.js";

export async function mcpCommand(ctx: ExecutionContext): Promise<void> {
  try {
    await startMcpServer();
  } catch (err: any) {
    ctx.stderr(chalk.red(`Errore avvio MCP Server: ${err.message || String(err)}`));
    ctx.exit(1);
  }
}
