import type { ExecutionContext } from "../context.js";
export interface DoctorCommandOptions {
    json?: boolean;
    timeout?: number;
}
export declare function doctorCommand(ctx: ExecutionContext, targetPath?: string, options?: DoctorCommandOptions): Promise<void>;
//# sourceMappingURL=doctor.d.ts.map