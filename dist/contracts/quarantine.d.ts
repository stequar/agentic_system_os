import { z } from "zod";
export declare const TestRunResultSchema: z.ZodEnum<["PASS", "FAIL"]>;
export type TestRunResult = z.infer<typeof TestRunResultSchema>;
export declare const QuarantinedTestSchema: z.ZodObject<{
    testIdentifier: z.ZodString;
    testFile: z.ZodString;
    runs: z.ZodArray<z.ZodEnum<["PASS", "FAIL"]>, "many">;
    quarantinedAt: z.ZodString;
    reason: z.ZodString;
    issueTicketId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    testFile: string;
    testIdentifier: string;
    runs: ("PASS" | "FAIL")[];
    quarantinedAt: string;
    issueTicketId?: string | undefined;
}, {
    reason: string;
    testFile: string;
    testIdentifier: string;
    runs: ("PASS" | "FAIL")[];
    quarantinedAt: string;
    issueTicketId?: string | undefined;
}>;
export type QuarantinedTest = z.infer<typeof QuarantinedTestSchema>;
export declare const QuarantineRegistrySchema: z.ZodObject<{
    quarantinedTests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        testIdentifier: z.ZodString;
        testFile: z.ZodString;
        runs: z.ZodArray<z.ZodEnum<["PASS", "FAIL"]>, "many">;
        quarantinedAt: z.ZodString;
        reason: z.ZodString;
        issueTicketId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }, {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }>, "many">>;
    maxAllowedQuarantined: z.ZodDefault<z.ZodNumber>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    quarantinedTests: {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }[];
    maxAllowedQuarantined: number;
}, {
    updatedAt: string;
    quarantinedTests?: {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }[] | undefined;
    maxAllowedQuarantined?: number | undefined;
}>;
export type QuarantineRegistry = z.infer<typeof QuarantineRegistrySchema>;
export declare const QuarantineEvaluationResultSchema: z.ZodObject<{
    isFlaky: z.ZodBoolean;
    isDeterministicFailure: z.ZodBoolean;
    runs: z.ZodArray<z.ZodEnum<["PASS", "FAIL"]>, "many">;
    actionTaken: z.ZodEnum<["QUARANTINED", "REJECTED_DETERMINISTIC", "PASS", "CAP_EXCEEDED"]>;
    quarantinedRecord: z.ZodOptional<z.ZodObject<{
        testIdentifier: z.ZodString;
        testFile: z.ZodString;
        runs: z.ZodArray<z.ZodEnum<["PASS", "FAIL"]>, "many">;
        quarantinedAt: z.ZodString;
        reason: z.ZodString;
        issueTicketId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }, {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    }>>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    actionTaken: "QUARANTINED" | "PASS" | "REJECTED_DETERMINISTIC" | "CAP_EXCEEDED";
    runs: ("PASS" | "FAIL")[];
    isFlaky: boolean;
    isDeterministicFailure: boolean;
    quarantinedRecord?: {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    } | undefined;
}, {
    message: string;
    actionTaken: "QUARANTINED" | "PASS" | "REJECTED_DETERMINISTIC" | "CAP_EXCEEDED";
    runs: ("PASS" | "FAIL")[];
    isFlaky: boolean;
    isDeterministicFailure: boolean;
    quarantinedRecord?: {
        reason: string;
        testFile: string;
        testIdentifier: string;
        runs: ("PASS" | "FAIL")[];
        quarantinedAt: string;
        issueTicketId?: string | undefined;
    } | undefined;
}>;
export type QuarantineEvaluationResult = z.infer<typeof QuarantineEvaluationResultSchema>;
//# sourceMappingURL=quarantine.d.ts.map