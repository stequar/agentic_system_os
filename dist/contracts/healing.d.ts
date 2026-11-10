import { z } from "zod";
export declare const DiagnosticViolationSchema: z.ZodObject<{
    file: z.ZodString;
    line: z.ZodNumber;
    column: z.ZodOptional<z.ZodNumber>;
    code: z.ZodOptional<z.ZodString>;
    severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
    message: z.ZodString;
    sourceRunner: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    file: string;
    line: number;
    severity: "error" | "warning";
    sourceRunner: string;
    code?: string | undefined;
    column?: number | undefined;
}, {
    message: string;
    file: string;
    line: number;
    sourceRunner: string;
    code?: string | undefined;
    severity?: "error" | "warning" | undefined;
    column?: number | undefined;
}>;
export declare const DiagnosticReportSchema: z.ZodObject<{
    violations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodNumber;
        column: z.ZodOptional<z.ZodNumber>;
        code: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
        message: z.ZodString;
        sourceRunner: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        code?: string | undefined;
        column?: number | undefined;
    }, {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
    }>, "many">>;
    errorCount: z.ZodDefault<z.ZodNumber>;
    warningCount: z.ZodDefault<z.ZodNumber>;
    rawOutput: z.ZodDefault<z.ZodString>;
    runner: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    violations: {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        code?: string | undefined;
        column?: number | undefined;
    }[];
    rawOutput: string;
    errorCount: number;
    warningCount: number;
    runner: string;
}, {
    violations?: {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
    }[] | undefined;
    rawOutput?: string | undefined;
    errorCount?: number | undefined;
    warningCount?: number | undefined;
    runner?: string | undefined;
}>;
export declare const DiffGuardResultSchema: z.ZodObject<{
    passed: z.ZodBoolean;
    violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    testsPreserved: z.ZodDefault<z.ZodBoolean>;
    scopePreserved: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    violations: string[];
    testsPreserved: boolean;
    scopePreserved: boolean;
}, {
    passed: boolean;
    violations?: string[] | undefined;
    testsPreserved?: boolean | undefined;
    scopePreserved?: boolean | undefined;
}>;
export declare const HealingAttemptSchema: z.ZodObject<{
    iteration: z.ZodNumber;
    violations: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodNumber;
        column: z.ZodOptional<z.ZodNumber>;
        code: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
        message: z.ZodString;
        sourceRunner: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        code?: string | undefined;
        column?: number | undefined;
    }, {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
    }>, "many">;
    proposedPatch: z.ZodRecord<z.ZodString, z.ZodString>;
    guardResult: z.ZodObject<{
        passed: z.ZodBoolean;
        violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        testsPreserved: z.ZodDefault<z.ZodBoolean>;
        scopePreserved: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        passed: boolean;
        violations: string[];
        testsPreserved: boolean;
        scopePreserved: boolean;
    }, {
        passed: boolean;
        violations?: string[] | undefined;
        testsPreserved?: boolean | undefined;
        scopePreserved?: boolean | undefined;
    }>;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    violations: {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        code?: string | undefined;
        column?: number | undefined;
    }[];
    success: boolean;
    iteration: number;
    proposedPatch: Record<string, string>;
    guardResult: {
        passed: boolean;
        violations: string[];
        testsPreserved: boolean;
        scopePreserved: boolean;
    };
}, {
    violations: {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
    }[];
    success: boolean;
    iteration: number;
    proposedPatch: Record<string, string>;
    guardResult: {
        passed: boolean;
        violations?: string[] | undefined;
        testsPreserved?: boolean | undefined;
        scopePreserved?: boolean | undefined;
    };
}>;
export declare const HealingSessionResultSchema: z.ZodObject<{
    status: z.ZodEnum<["SUCCESS", "BUDGET_EXHAUSTED", "GUARD_VIOLATION"]>;
    iterationsRun: z.ZodNumber;
    maxIterations: z.ZodDefault<z.ZodNumber>;
    restoredRollback: z.ZodDefault<z.ZodBoolean>;
    finalGatekeeperResult: z.ZodOptional<z.ZodObject<{
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
    }>>;
    attempts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        iteration: z.ZodNumber;
        violations: z.ZodArray<z.ZodObject<{
            file: z.ZodString;
            line: z.ZodNumber;
            column: z.ZodOptional<z.ZodNumber>;
            code: z.ZodOptional<z.ZodString>;
            severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
            message: z.ZodString;
            sourceRunner: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            file: string;
            line: number;
            severity: "error" | "warning";
            sourceRunner: string;
            code?: string | undefined;
            column?: number | undefined;
        }, {
            message: string;
            file: string;
            line: number;
            sourceRunner: string;
            code?: string | undefined;
            severity?: "error" | "warning" | undefined;
            column?: number | undefined;
        }>, "many">;
        proposedPatch: z.ZodRecord<z.ZodString, z.ZodString>;
        guardResult: z.ZodObject<{
            passed: z.ZodBoolean;
            violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            testsPreserved: z.ZodDefault<z.ZodBoolean>;
            scopePreserved: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            passed: boolean;
            violations: string[];
            testsPreserved: boolean;
            scopePreserved: boolean;
        }, {
            passed: boolean;
            violations?: string[] | undefined;
            testsPreserved?: boolean | undefined;
            scopePreserved?: boolean | undefined;
        }>;
        success: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        violations: {
            message: string;
            file: string;
            line: number;
            severity: "error" | "warning";
            sourceRunner: string;
            code?: string | undefined;
            column?: number | undefined;
        }[];
        success: boolean;
        iteration: number;
        proposedPatch: Record<string, string>;
        guardResult: {
            passed: boolean;
            violations: string[];
            testsPreserved: boolean;
            scopePreserved: boolean;
        };
    }, {
        violations: {
            message: string;
            file: string;
            line: number;
            sourceRunner: string;
            code?: string | undefined;
            severity?: "error" | "warning" | undefined;
            column?: number | undefined;
        }[];
        success: boolean;
        iteration: number;
        proposedPatch: Record<string, string>;
        guardResult: {
            passed: boolean;
            violations?: string[] | undefined;
            testsPreserved?: boolean | undefined;
            scopePreserved?: boolean | undefined;
        };
    }>, "many">>;
    durationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "SUCCESS" | "BUDGET_EXHAUSTED" | "GUARD_VIOLATION";
    durationMs: number;
    iterationsRun: number;
    maxIterations: number;
    restoredRollback: boolean;
    attempts: {
        violations: {
            message: string;
            file: string;
            line: number;
            severity: "error" | "warning";
            sourceRunner: string;
            code?: string | undefined;
            column?: number | undefined;
        }[];
        success: boolean;
        iteration: number;
        proposedPatch: Record<string, string>;
        guardResult: {
            passed: boolean;
            violations: string[];
            testsPreserved: boolean;
            scopePreserved: boolean;
        };
    }[];
    finalGatekeeperResult?: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests: number;
        failedTests: number;
        rawOutput?: string | undefined;
    } | undefined;
}, {
    status: "SUCCESS" | "BUDGET_EXHAUSTED" | "GUARD_VIOLATION";
    durationMs: number;
    iterationsRun: number;
    maxIterations?: number | undefined;
    restoredRollback?: boolean | undefined;
    finalGatekeeperResult?: {
        typecheckPassed: boolean;
        linterPassed: boolean;
        testsPassed: boolean;
        totalTests?: number | undefined;
        failedTests?: number | undefined;
        rawOutput?: string | undefined;
    } | undefined;
    attempts?: {
        violations: {
            message: string;
            file: string;
            line: number;
            sourceRunner: string;
            code?: string | undefined;
            severity?: "error" | "warning" | undefined;
            column?: number | undefined;
        }[];
        success: boolean;
        iteration: number;
        proposedPatch: Record<string, string>;
        guardResult: {
            passed: boolean;
            violations?: string[] | undefined;
            testsPreserved?: boolean | undefined;
            scopePreserved?: boolean | undefined;
        };
    }[] | undefined;
}>;
export type DiagnosticViolation = z.infer<typeof DiagnosticViolationSchema>;
export type DiagnosticReport = z.infer<typeof DiagnosticReportSchema>;
export type DiffGuardResult = z.infer<typeof DiffGuardResultSchema>;
export type HealingAttempt = z.infer<typeof HealingAttemptSchema>;
export type HealingSessionResult = z.infer<typeof HealingSessionResultSchema>;
//# sourceMappingURL=healing.d.ts.map