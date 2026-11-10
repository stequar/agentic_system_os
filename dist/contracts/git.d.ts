import { z } from "zod";
export declare const CommitTypeSchema: z.ZodEnum<["feat", "fix", "test", "refactor", "chore", "docs", "perf", "ci"]>;
export type CommitType = z.infer<typeof CommitTypeSchema>;
export declare const CommitMessageSchema: z.ZodObject<{
    type: z.ZodEnum<["feat", "fix", "test", "refactor", "chore", "docs", "perf", "ci"]>;
    scope: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    fullMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "docs" | "test" | "feat" | "fix" | "refactor" | "chore" | "perf" | "ci";
    description: string;
    fullMessage: string;
    scope?: string | undefined;
}, {
    type: "docs" | "test" | "feat" | "fix" | "refactor" | "chore" | "perf" | "ci";
    description: string;
    fullMessage: string;
    scope?: string | undefined;
}>;
export type CommitMessage = z.infer<typeof CommitMessageSchema>;
export declare const GitBranchSchema: z.ZodObject<{
    branchName: z.ZodString;
    baseBranch: z.ZodDefault<z.ZodString>;
    ticketId: z.ZodOptional<z.ZodString>;
    isClean: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    branchName: string;
    baseBranch: string;
    isClean: boolean;
    ticketId?: string | undefined;
}, {
    branchName: string;
    ticketId?: string | undefined;
    baseBranch?: string | undefined;
    isClean?: boolean | undefined;
}>;
export type GitBranch = z.infer<typeof GitBranchSchema>;
export declare const GatekeeperScorecardSchema: z.ZodObject<{
    gatekeeperPassed: z.ZodBoolean;
    testsTotal: z.ZodNumber;
    testsFailed: z.ZodNumber;
    typecheckPassed: z.ZodBoolean;
    linterPassed: z.ZodBoolean;
    secretScanPassed: z.ZodBoolean;
    dependencyAuditPassed: z.ZodBoolean;
    commitSha: z.ZodString;
    sessionSafePoint: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    typecheckPassed: boolean;
    linterPassed: boolean;
    commitSha: string;
    gatekeeperPassed: boolean;
    testsTotal: number;
    testsFailed: number;
    secretScanPassed: boolean;
    dependencyAuditPassed: boolean;
    sessionSafePoint: string;
}, {
    typecheckPassed: boolean;
    linterPassed: boolean;
    commitSha: string;
    gatekeeperPassed: boolean;
    testsTotal: number;
    testsFailed: number;
    secretScanPassed: boolean;
    dependencyAuditPassed: boolean;
    sessionSafePoint?: string | undefined;
}>;
export type GatekeeperScorecard = z.infer<typeof GatekeeperScorecardSchema>;
export declare const PullRequestSchema: z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    sourceBranch: z.ZodString;
    targetBranch: z.ZodDefault<z.ZodString>;
    scorecard: z.ZodObject<{
        gatekeeperPassed: z.ZodBoolean;
        testsTotal: z.ZodNumber;
        testsFailed: z.ZodNumber;
        typecheckPassed: z.ZodBoolean;
        linterPassed: z.ZodBoolean;
        secretScanPassed: z.ZodBoolean;
        dependencyAuditPassed: z.ZodBoolean;
        commitSha: z.ZodString;
        sessionSafePoint: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        typecheckPassed: boolean;
        linterPassed: boolean;
        commitSha: string;
        gatekeeperPassed: boolean;
        testsTotal: number;
        testsFailed: number;
        secretScanPassed: boolean;
        dependencyAuditPassed: boolean;
        sessionSafePoint: string;
    }, {
        typecheckPassed: boolean;
        linterPassed: boolean;
        commitSha: string;
        gatekeeperPassed: boolean;
        testsTotal: number;
        testsFailed: number;
        secretScanPassed: boolean;
        dependencyAuditPassed: boolean;
        sessionSafePoint?: string | undefined;
    }>;
    createdAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    createdAt: string;
    body: string;
    sourceBranch: string;
    targetBranch: string;
    scorecard: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        commitSha: string;
        gatekeeperPassed: boolean;
        testsTotal: number;
        testsFailed: number;
        secretScanPassed: boolean;
        dependencyAuditPassed: boolean;
        sessionSafePoint: string;
    };
}, {
    title: string;
    body: string;
    sourceBranch: string;
    scorecard: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        commitSha: string;
        gatekeeperPassed: boolean;
        testsTotal: number;
        testsFailed: number;
        secretScanPassed: boolean;
        dependencyAuditPassed: boolean;
        sessionSafePoint?: string | undefined;
    };
    createdAt?: string | undefined;
    targetBranch?: string | undefined;
}>;
export type PullRequest = z.infer<typeof PullRequestSchema>;
//# sourceMappingURL=git.d.ts.map