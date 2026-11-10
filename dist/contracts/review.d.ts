import { z } from "zod";
export declare const ReviewViolationSchema: z.ZodObject<{
    file: z.ZodString;
    line: z.ZodOptional<z.ZodNumber>;
    severity: z.ZodEnum<["info", "warning", "critical"]>;
    message: z.ZodString;
    suggestedFix: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    file: string;
    severity: "info" | "critical" | "warning";
    line?: number | undefined;
    suggestedFix?: string | undefined;
}, {
    message: string;
    file: string;
    severity: "info" | "critical" | "warning";
    line?: number | undefined;
    suggestedFix?: string | undefined;
}>;
export declare const GatekeeperResultSchema: z.ZodObject<{
    typecheckPassed: z.ZodBoolean;
    linterPassed: z.ZodBoolean;
    testsPassed: z.ZodBoolean;
    totalTests: z.ZodDefault<z.ZodNumber>;
    failedTests: z.ZodDefault<z.ZodNumber>;
    rawOutput: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    typecheckPassed: boolean;
    linterPassed: boolean;
    testsPassed: boolean;
    totalTests: number;
    failedTests: number;
    rawOutput?: string | undefined;
}, {
    typecheckPassed: boolean;
    linterPassed: boolean;
    testsPassed: boolean;
    totalTests?: number | undefined;
    failedTests?: number | undefined;
    rawOutput?: string | undefined;
}>;
export declare const ReviewReportSchema: z.ZodObject<{
    ticketId: z.ZodString;
    reviewerRole: z.ZodString;
    status: z.ZodEnum<["APPROVED", "CHANGES_REQUESTED", "REJECTED"]>;
    gatekeeper: z.ZodObject<{
        typecheckPassed: z.ZodBoolean;
        linterPassed: z.ZodBoolean;
        testsPassed: z.ZodBoolean;
        totalTests: z.ZodDefault<z.ZodNumber>;
        failedTests: z.ZodDefault<z.ZodNumber>;
        rawOutput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests: number;
        failedTests: number;
        rawOutput?: string | undefined;
    }, {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests?: number | undefined;
        failedTests?: number | undefined;
        rawOutput?: string | undefined;
    }>;
    architecturalCompliance: z.ZodBoolean;
    violations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        severity: z.ZodEnum<["info", "warning", "critical"]>;
        message: z.ZodString;
        suggestedFix: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        file: string;
        severity: "info" | "critical" | "warning";
        line?: number | undefined;
        suggestedFix?: string | undefined;
    }, {
        message: string;
        file: string;
        severity: "info" | "critical" | "warning";
        line?: number | undefined;
        suggestedFix?: string | undefined;
    }>, "many">>;
    finalNotes: z.ZodString;
    reviewedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
    gatekeeper: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests: number;
        failedTests: number;
        rawOutput?: string | undefined;
    };
    violations: {
        message: string;
        file: string;
        severity: "info" | "critical" | "warning";
        line?: number | undefined;
        suggestedFix?: string | undefined;
    }[];
    ticketId: string;
    reviewerRole: string;
    architecturalCompliance: boolean;
    finalNotes: string;
    reviewedAt: string;
}, {
    status: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
    gatekeeper: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests?: number | undefined;
        failedTests?: number | undefined;
        rawOutput?: string | undefined;
    };
    ticketId: string;
    reviewerRole: string;
    architecturalCompliance: boolean;
    finalNotes: string;
    violations?: {
        message: string;
        file: string;
        severity: "info" | "critical" | "warning";
        line?: number | undefined;
        suggestedFix?: string | undefined;
    }[] | undefined;
    reviewedAt?: string | undefined;
}>;
export type ReviewViolation = z.infer<typeof ReviewViolationSchema>;
export type GatekeeperResult = z.infer<typeof GatekeeperResultSchema>;
export type ReviewReport = z.infer<typeof ReviewReportSchema>;
//# sourceMappingURL=review.d.ts.map