import type { ExecutionContext } from "../context.js";
export interface WorkflowCommandOptions {
    scope?: string;
    mode?: string;
    stimulus?: string;
    rcaFile?: string;
    key?: string;
    value?: string;
    json?: boolean;
}
export declare function workflowCommand(ctx: ExecutionContext, action: string, targetPath?: string, options?: WorkflowCommandOptions): Promise<void>;
//# sourceMappingURL=workflow.d.ts.map