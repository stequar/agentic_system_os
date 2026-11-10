import { z } from "zod";
export declare const SessionStatusSchema: z.ZodEnum<["DIRTY_IN_PROGRESS", "COMMITTED_SAFEPOINT", "COMPLETED", "FAILED"]>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export declare const SessionTaskItemSchema: z.ZodObject<{
    taskId: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["PENDING", "IN_PROGRESS", "VALIDATED", "FAILED"]>;
    assignedRole: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
    updatedAt: string;
    title: string;
    taskId: string;
    assignedRole: string;
}, {
    status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
    updatedAt: string;
    title: string;
    taskId: string;
    assignedRole: string;
}>;
export type SessionTaskItem = z.infer<typeof SessionTaskItemSchema>;
export declare const SessionSnapshotSchema: z.ZodObject<{
    sessionId: z.ZodString;
    status: z.ZodEnum<["DIRTY_IN_PROGRESS", "COMMITTED_SAFEPOINT", "COMPLETED", "FAILED"]>;
    targetPath: z.ZodString;
    currentFsmState: z.ZodString;
    activeTicketId: z.ZodOptional<z.ZodString>;
    gitCommitSha: z.ZodString;
    diffHash: z.ZodString;
    taskStack: z.ZodDefault<z.ZodArray<z.ZodObject<{
        taskId: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["PENDING", "IN_PROGRESS", "VALIDATED", "FAILED"]>;
        assignedRole: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
        updatedAt: string;
        title: string;
        taskId: string;
        assignedRole: string;
    }, {
        status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
        updatedAt: string;
        title: string;
        taskId: string;
        assignedRole: string;
    }>, "many">>;
    timestamp: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "FAILED" | "DIRTY_IN_PROGRESS" | "COMMITTED_SAFEPOINT" | "COMPLETED";
    targetPath: string;
    timestamp: string;
    sessionId: string;
    currentFsmState: string;
    gitCommitSha: string;
    diffHash: string;
    taskStack: {
        status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
        updatedAt: string;
        title: string;
        taskId: string;
        assignedRole: string;
    }[];
    activeTicketId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    status: "FAILED" | "DIRTY_IN_PROGRESS" | "COMMITTED_SAFEPOINT" | "COMPLETED";
    targetPath: string;
    timestamp: string;
    sessionId: string;
    currentFsmState: string;
    gitCommitSha: string;
    diffHash: string;
    activeTicketId?: string | undefined;
    taskStack?: {
        status: "FAILED" | "IN_PROGRESS" | "PENDING" | "VALIDATED";
        updatedAt: string;
        title: string;
        taskId: string;
        assignedRole: string;
    }[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type SessionSnapshot = z.infer<typeof SessionSnapshotSchema>;
export declare const SessionResumeResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    sessionId: z.ZodString;
    restoredFromStatus: z.ZodEnum<["DIRTY_IN_PROGRESS", "COMMITTED_SAFEPOINT", "COMPLETED", "FAILED"]>;
    actionTaken: z.ZodEnum<["RESUMED_CLEAN", "ROLLED_BACK_AND_RESUMED", "ALREADY_COMPLETED", "FAILED"]>;
    gitCommitSha: z.ZodString;
    activeTicketId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    sessionId: string;
    success: boolean;
    gitCommitSha: string;
    restoredFromStatus: "FAILED" | "DIRTY_IN_PROGRESS" | "COMMITTED_SAFEPOINT" | "COMPLETED";
    actionTaken: "FAILED" | "RESUMED_CLEAN" | "ROLLED_BACK_AND_RESUMED" | "ALREADY_COMPLETED";
    activeTicketId?: string | undefined;
}, {
    message: string;
    sessionId: string;
    success: boolean;
    gitCommitSha: string;
    restoredFromStatus: "FAILED" | "DIRTY_IN_PROGRESS" | "COMMITTED_SAFEPOINT" | "COMPLETED";
    actionTaken: "FAILED" | "RESUMED_CLEAN" | "ROLLED_BACK_AND_RESUMED" | "ALREADY_COMPLETED";
    activeTicketId?: string | undefined;
}>;
export type SessionResumeResult = z.infer<typeof SessionResumeResultSchema>;
//# sourceMappingURL=session.d.ts.map