import type { ExecutionContext } from "../context.js";
export interface AttachCommandOptions {
    json?: boolean;
    force?: boolean;
    dryRun?: boolean;
}
export declare function attachCommand(ctx: ExecutionContext, targetPath: string, options?: AttachCommandOptions): Promise<void>;
//# sourceMappingURL=attach.d.ts.map