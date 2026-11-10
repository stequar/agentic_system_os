import { z } from "zod";
export declare const CompanyEventLevelSchema: z.ZodEnum<["info", "warn", "error", "critical"]>;
export type CompanyEventLevel = z.infer<typeof CompanyEventLevelSchema>;
export declare const CompanyEventTypeSchema: z.ZodEnum<["SESSION_STARTED", "SESSION_RESUMED", "TASK_STARTED", "TASK_COMPLETED", "TASK_FAILED", "GATEKEEPER_TRIGGERED", "GATEKEEPER_PASSED", "GATEKEEPER_FAILED", "SELF_HEALING_ITERATION", "DIFF_GUARD_VIOLATION", "ROLLBACK_EXECUTED", "SECURITY_ALERT", "CHECKPOINT_SAVED", "DEPENDENCY_AUDIT_RESULT", "TICKET_STATUS_CHANGED", "CONTRACT_VIOLATION", "METRICS_CALCULATED", "CONTEXT_HEALTH_ALERT", "FINOPS_ALERT", "BUDGET_WARNING", "BUDGET_EXCEEDED", "CEREMONY_STARTED", "CEREMONY_CONCLUDED", "WAR_ROOM_TRIGGERED", "WAR_ROOM_RESOLVED", "CONSENSUS_REACHED", "TIE_BREAK_INVOKED"]>;
export type CompanyEventType = z.infer<typeof CompanyEventTypeSchema>;
export declare const CompanyEventSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    type: z.ZodUnion<[z.ZodEnum<["SESSION_STARTED", "SESSION_RESUMED", "TASK_STARTED", "TASK_COMPLETED", "TASK_FAILED", "GATEKEEPER_TRIGGERED", "GATEKEEPER_PASSED", "GATEKEEPER_FAILED", "SELF_HEALING_ITERATION", "DIFF_GUARD_VIOLATION", "ROLLBACK_EXECUTED", "SECURITY_ALERT", "CHECKPOINT_SAVED", "DEPENDENCY_AUDIT_RESULT", "TICKET_STATUS_CHANGED", "CONTRACT_VIOLATION", "METRICS_CALCULATED", "CONTEXT_HEALTH_ALERT", "FINOPS_ALERT", "BUDGET_WARNING", "BUDGET_EXCEEDED", "CEREMONY_STARTED", "CEREMONY_CONCLUDED", "WAR_ROOM_TRIGGERED", "WAR_ROOM_RESOLVED", "CONSENSUS_REACHED", "TIE_BREAK_INVOKED"]>, z.ZodString]>;
    sourceAgent: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<["info", "warn", "error", "critical"]>>;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    sourceAgent: string;
    timestamp: string;
    id: string;
    level: "info" | "warn" | "error" | "critical";
    payload: Record<string, any>;
    sessionId?: string | undefined;
}, {
    type: string;
    sourceAgent: string;
    timestamp: string;
    id: string;
    level?: "info" | "warn" | "error" | "critical" | undefined;
    payload?: Record<string, any> | undefined;
    sessionId?: string | undefined;
}>;
export type CompanyEvent = z.infer<typeof CompanyEventSchema>;
export type CompanyEventHandler = (event: CompanyEvent) => void | Promise<void>;
//# sourceMappingURL=events.d.ts.map