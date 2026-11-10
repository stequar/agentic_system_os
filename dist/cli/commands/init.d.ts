import type { ExecutionContext } from "../context.js";
export interface InitCommandOptions {
    yes?: boolean;
    nonInteractive?: boolean;
    json?: boolean;
}
export declare function initCommand(ctx: ExecutionContext, targetPath?: string, options?: InitCommandOptions): Promise<void>;
//# sourceMappingURL=init.d.ts.map