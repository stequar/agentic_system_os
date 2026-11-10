import { z } from "zod";
export declare const WorktreeStatusSchema: z.ZodEnum<["ACTIVE", "COMMITTED", "REBASED", "CLEANED_UP"]>;
export type WorktreeStatus = z.infer<typeof WorktreeStatusSchema>;
export declare const WorktreeSessionSchema: z.ZodObject<{
    worktreeId: z.ZodString;
    agentId: z.ZodString;
    ticketId: z.ZodString;
    branchName: z.ZodString;
    worktreePath: z.ZodString;
    baseBranch: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "COMMITTED", "REBASED", "CLEANED_UP"]>>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP";
    ticketId: string;
    branchName: string;
    createdAt: string;
    worktreeId: string;
    agentId: string;
    worktreePath: string;
    baseBranch: string;
}, {
    ticketId: string;
    branchName: string;
    createdAt: string;
    worktreeId: string;
    agentId: string;
    worktreePath: string;
    status?: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP" | undefined;
    baseBranch?: string | undefined;
}>;
export type WorktreeSession = z.infer<typeof WorktreeSessionSchema>;
export declare const WorktreePoolStatusSchema: z.ZodObject<{
    activeWorktrees: z.ZodDefault<z.ZodArray<z.ZodObject<{
        worktreeId: z.ZodString;
        agentId: z.ZodString;
        ticketId: z.ZodString;
        branchName: z.ZodString;
        worktreePath: z.ZodString;
        baseBranch: z.ZodDefault<z.ZodString>;
        createdAt: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "COMMITTED", "REBASED", "CLEANED_UP"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP";
        ticketId: string;
        branchName: string;
        createdAt: string;
        worktreeId: string;
        agentId: string;
        worktreePath: string;
        baseBranch: string;
    }, {
        ticketId: string;
        branchName: string;
        createdAt: string;
        worktreeId: string;
        agentId: string;
        worktreePath: string;
        status?: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP" | undefined;
        baseBranch?: string | undefined;
    }>, "many">>;
    maxConcurrent: z.ZodDefault<z.ZodNumber>;
    poolDir: z.ZodString;
    totalCreated: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    activeWorktrees: {
        status: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP";
        ticketId: string;
        branchName: string;
        createdAt: string;
        worktreeId: string;
        agentId: string;
        worktreePath: string;
        baseBranch: string;
    }[];
    maxConcurrent: number;
    poolDir: string;
    totalCreated: number;
}, {
    poolDir: string;
    activeWorktrees?: {
        ticketId: string;
        branchName: string;
        createdAt: string;
        worktreeId: string;
        agentId: string;
        worktreePath: string;
        status?: "ACTIVE" | "COMMITTED" | "REBASED" | "CLEANED_UP" | undefined;
        baseBranch?: string | undefined;
    }[] | undefined;
    maxConcurrent?: number | undefined;
    totalCreated?: number | undefined;
}>;
export type WorktreePoolStatus = z.infer<typeof WorktreePoolStatusSchema>;
//# sourceMappingURL=worktree.d.ts.map