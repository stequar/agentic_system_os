import type { ExecutionContext } from "../context.js";
export interface ResumeCommandOptions {
    path?: string;
    json?: boolean;
}
export declare function resumeCommand(ctx: ExecutionContext, sessionId?: string, options?: ResumeCommandOptions): Promise<void>;
//# sourceMappingURL=resume.d.ts.map