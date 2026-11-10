import { z } from "zod";
export declare const ContextMessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
    content: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    toolCallId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    role: "system" | "user" | "assistant" | "tool";
    name?: string | undefined;
    toolCallId?: string | undefined;
}, {
    content: string;
    role: "system" | "user" | "assistant" | "tool";
    name?: string | undefined;
    toolCallId?: string | undefined;
}>;
export declare const InvariantDefinitionSchema: z.ZodObject<{
    ticketId: z.ZodString;
    allowedFiles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    testCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    testCommands: string[];
    ticketId: string;
    allowedFiles: string[];
    acceptanceCriteria: string[];
}, {
    ticketId: string;
    testCommands?: string[] | undefined;
    allowedFiles?: string[] | undefined;
    acceptanceCriteria?: string[] | undefined;
}>;
export declare const InvariantVerificationResultSchema: z.ZodObject<{
    passed: z.ZodBoolean;
    violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preservedTicketId: z.ZodBoolean;
    preservedAllowedFiles: z.ZodBoolean;
    preservedAcceptanceCriteria: z.ZodBoolean;
    preservedTestCommands: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    violations: string[];
    preservedTicketId: boolean;
    preservedAllowedFiles: boolean;
    preservedAcceptanceCriteria: boolean;
    preservedTestCommands: boolean;
}, {
    passed: boolean;
    preservedTicketId: boolean;
    preservedAllowedFiles: boolean;
    preservedAcceptanceCriteria: boolean;
    preservedTestCommands: boolean;
    violations?: string[] | undefined;
}>;
export declare const ContextCompactionInputSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        content: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        toolCallId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }, {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }>, "many">;
    invariants: z.ZodObject<{
        ticketId: z.ZodString;
        allowedFiles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        acceptanceCriteria: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        testCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        testCommands: string[];
        ticketId: string;
        allowedFiles: string[];
        acceptanceCriteria: string[];
    }, {
        ticketId: string;
        testCommands?: string[] | undefined;
        allowedFiles?: string[] | undefined;
        acceptanceCriteria?: string[] | undefined;
    }>;
    maxTokenThreshold: z.ZodDefault<z.ZodNumber>;
    forceCompaction: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    invariants: {
        testCommands: string[];
        ticketId: string;
        allowedFiles: string[];
        acceptanceCriteria: string[];
    };
    messages: {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }[];
    maxTokenThreshold: number;
    forceCompaction: boolean;
}, {
    invariants: {
        ticketId: string;
        testCommands?: string[] | undefined;
        allowedFiles?: string[] | undefined;
        acceptanceCriteria?: string[] | undefined;
    };
    messages: {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }[];
    maxTokenThreshold?: number | undefined;
    forceCompaction?: boolean | undefined;
}>;
export declare const CompactedContextResultSchema: z.ZodObject<{
    wasCompacted: z.ZodBoolean;
    originalTokenEstimate: z.ZodNumber;
    compactedTokenEstimate: z.ZodNumber;
    reductionPercent: z.ZodNumber;
    compactedMessages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        content: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        toolCallId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }, {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }>, "many">;
    invariantVerification: z.ZodObject<{
        passed: z.ZodBoolean;
        violations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        preservedTicketId: z.ZodBoolean;
        preservedAllowedFiles: z.ZodBoolean;
        preservedAcceptanceCriteria: z.ZodBoolean;
        preservedTestCommands: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        passed: boolean;
        violations: string[];
        preservedTicketId: boolean;
        preservedAllowedFiles: boolean;
        preservedAcceptanceCriteria: boolean;
        preservedTestCommands: boolean;
    }, {
        passed: boolean;
        preservedTicketId: boolean;
        preservedAllowedFiles: boolean;
        preservedAcceptanceCriteria: boolean;
        preservedTestCommands: boolean;
        violations?: string[] | undefined;
    }>;
    distilledSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    wasCompacted: boolean;
    originalTokenEstimate: number;
    compactedTokenEstimate: number;
    reductionPercent: number;
    compactedMessages: {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }[];
    invariantVerification: {
        passed: boolean;
        violations: string[];
        preservedTicketId: boolean;
        preservedAllowedFiles: boolean;
        preservedAcceptanceCriteria: boolean;
        preservedTestCommands: boolean;
    };
    distilledSummary: string;
}, {
    wasCompacted: boolean;
    originalTokenEstimate: number;
    compactedTokenEstimate: number;
    reductionPercent: number;
    compactedMessages: {
        content: string;
        role: "system" | "user" | "assistant" | "tool";
        name?: string | undefined;
        toolCallId?: string | undefined;
    }[];
    invariantVerification: {
        passed: boolean;
        preservedTicketId: boolean;
        preservedAllowedFiles: boolean;
        preservedAcceptanceCriteria: boolean;
        preservedTestCommands: boolean;
        violations?: string[] | undefined;
    };
    distilledSummary: string;
}>;
export declare const SurgicalDiagnosticSliceSchema: z.ZodObject<{
    file: z.ZodString;
    line: z.ZodNumber;
    column: z.ZodOptional<z.ZodNumber>;
    code: z.ZodOptional<z.ZodString>;
    severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
    message: z.ZodString;
    sourceRunner: z.ZodString;
    symbol: z.ZodOptional<z.ZodString>;
    negativeHypotheses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    compactedTokensEstimate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    message: string;
    file: string;
    line: number;
    severity: "error" | "warning";
    sourceRunner: string;
    negativeHypotheses: string[];
    compactedTokensEstimate: number;
    symbol?: string | undefined;
    code?: string | undefined;
    column?: number | undefined;
}, {
    message: string;
    file: string;
    line: number;
    sourceRunner: string;
    compactedTokensEstimate: number;
    symbol?: string | undefined;
    code?: string | undefined;
    severity?: "error" | "warning" | undefined;
    column?: number | undefined;
    negativeHypotheses?: string[] | undefined;
}>;
export declare const CleanSlatePayloadSchema: z.ZodObject<{
    iteration: z.ZodNumber;
    t0ResetApplied: z.ZodDefault<z.ZodBoolean>;
    slices: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        line: z.ZodNumber;
        column: z.ZodOptional<z.ZodNumber>;
        code: z.ZodOptional<z.ZodString>;
        severity: z.ZodDefault<z.ZodEnum<["error", "warning"]>>;
        message: z.ZodString;
        sourceRunner: z.ZodString;
        symbol: z.ZodOptional<z.ZodString>;
        negativeHypotheses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        compactedTokensEstimate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        negativeHypotheses: string[];
        compactedTokensEstimate: number;
        symbol?: string | undefined;
        code?: string | undefined;
        column?: number | undefined;
    }, {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        compactedTokensEstimate: number;
        symbol?: string | undefined;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
        negativeHypotheses?: string[] | undefined;
    }>, "many">;
    accumulatedNegativeHypotheses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    totalTokensPayload: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    iteration: number;
    t0ResetApplied: boolean;
    slices: {
        message: string;
        file: string;
        line: number;
        severity: "error" | "warning";
        sourceRunner: string;
        negativeHypotheses: string[];
        compactedTokensEstimate: number;
        symbol?: string | undefined;
        code?: string | undefined;
        column?: number | undefined;
    }[];
    accumulatedNegativeHypotheses: string[];
    totalTokensPayload: number;
}, {
    iteration: number;
    slices: {
        message: string;
        file: string;
        line: number;
        sourceRunner: string;
        compactedTokensEstimate: number;
        symbol?: string | undefined;
        code?: string | undefined;
        severity?: "error" | "warning" | undefined;
        column?: number | undefined;
        negativeHypotheses?: string[] | undefined;
    }[];
    totalTokensPayload: number;
    t0ResetApplied?: boolean | undefined;
    accumulatedNegativeHypotheses?: string[] | undefined;
}>;
export type ContextMessage = z.infer<typeof ContextMessageSchema>;
export type InvariantDefinition = z.infer<typeof InvariantDefinitionSchema>;
export type InvariantVerificationResult = z.infer<typeof InvariantVerificationResultSchema>;
export type ContextCompactionInput = z.infer<typeof ContextCompactionInputSchema>;
export type CompactedContextResult = z.infer<typeof CompactedContextResultSchema>;
export type SurgicalDiagnosticSlice = z.infer<typeof SurgicalDiagnosticSliceSchema>;
export type CleanSlatePayload = z.infer<typeof CleanSlatePayloadSchema>;
//# sourceMappingURL=compaction.d.ts.map