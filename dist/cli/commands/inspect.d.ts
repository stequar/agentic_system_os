import type { ExecutionContext } from "../context.js";
export interface InspectCommandOptions {
    json?: boolean;
}
export declare function inspectCommand(ctx: ExecutionContext, targetPath: string, options?: InspectCommandOptions): Promise<void>;
//# sourceMappingURL=inspect.d.ts.map