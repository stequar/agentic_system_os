import { z } from "zod";
export declare const SteeringActionSchema: z.ZodEnum<["pause", "hint", "resume", "abort"]>;
export type SteeringAction = z.infer<typeof SteeringActionSchema>;
export declare const SteeringStateSchema: z.ZodEnum<["RUNNING", "PAUSE_REQUESTED", "SAFE_PAUSED", "RESUMING", "ABORTED"]>;
export type SteeringState = z.infer<typeof SteeringStateSchema>;
export declare const SteeringCommandSchema: z.ZodObject<{
    action: z.ZodEnum<["pause", "hint", "resume", "abort"]>;
    message: z.ZodOptional<z.ZodString>;
    proposedPatch: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timestamp: z.ZodDefault<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<["cli", "web-studio", "api"]>>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    action: "pause" | "resume" | "hint" | "abort";
    source: "cli" | "web-studio" | "api";
    message?: string | undefined;
    proposedPatch?: Record<string, string> | undefined;
}, {
    action: "pause" | "resume" | "hint" | "abort";
    message?: string | undefined;
    timestamp?: string | undefined;
    proposedPatch?: Record<string, string> | undefined;
    source?: "cli" | "web-studio" | "api" | undefined;
}>;
export type SteeringCommand = z.infer<typeof SteeringCommandSchema>;
export declare const SteeringResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    currentState: z.ZodEnum<["RUNNING", "PAUSE_REQUESTED", "SAFE_PAUSED", "RESUMING", "ABORTED"]>;
    actionApplied: z.ZodEnum<["pause", "hint", "resume", "abort"]>;
    message: z.ZodString;
    activeSafePoint: z.ZodDefault<z.ZodBoolean>;
    violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    message: string;
    violations: string[];
    success: boolean;
    currentState: "RUNNING" | "PAUSE_REQUESTED" | "SAFE_PAUSED" | "ABORTED" | "RESUMING";
    actionApplied: "pause" | "resume" | "hint" | "abort";
    activeSafePoint: boolean;
}, {
    message: string;
    success: boolean;
    currentState: "RUNNING" | "PAUSE_REQUESTED" | "SAFE_PAUSED" | "ABORTED" | "RESUMING";
    actionApplied: "pause" | "resume" | "hint" | "abort";
    violations?: string[] | undefined;
    activeSafePoint?: boolean | undefined;
}>;
export type SteeringResult = z.infer<typeof SteeringResultSchema>;
//# sourceMappingURL=steering.d.ts.map