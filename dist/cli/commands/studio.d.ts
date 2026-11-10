import type { ExecutionContext } from "../context.js";
export interface StudioCommandOptions {
    port?: string;
    path?: string;
}
export declare function studioCommand(ctx: ExecutionContext, options?: StudioCommandOptions): Promise<void>;
//# sourceMappingURL=studio.d.ts.map