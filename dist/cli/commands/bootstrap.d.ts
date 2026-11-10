import type { ExecutionContext } from "../context.js";
export interface BootstrapCommandOptions {
    json?: boolean;
    dryRun?: boolean;
}
export declare function bootstrapCommand(ctx: ExecutionContext, targetPath?: string, options?: BootstrapCommandOptions): Promise<void>;
//# sourceMappingURL=bootstrap.d.ts.map