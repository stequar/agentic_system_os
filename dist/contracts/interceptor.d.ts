import { z } from "zod";
/**
 * Singola violazione sintattica o semantica rilevata dall'interceptor.
 */
export declare const DiagnosticViolationDetailSchema: z.ZodObject<{
    path: z.ZodString;
    code: z.ZodString;
    message: z.ZodString;
    expected: z.ZodOptional<z.ZodString>;
    received: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    path: string;
    message: string;
    expected?: string | undefined;
    received?: string | undefined;
}, {
    code: string;
    path: string;
    message: string;
    expected?: string | undefined;
    received?: string | undefined;
}>;
export type DiagnosticViolationDetail = z.infer<typeof DiagnosticViolationDetailSchema>;
/**
 * Evento emesso quando viene rilevata una violazione contrattuale a runtime.
 */
export declare const ContractViolationEventSchema: z.ZodObject<{
    contractName: z.ZodString;
    actionOrTransition: z.ZodString;
    violations: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        code: z.ZodString;
        message: z.ZodString;
        expected: z.ZodOptional<z.ZodString>;
        received: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }, {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }>, "many">;
    syntheticDiagnostic: z.ZodString;
    rawPayload: z.ZodAny;
    sourceAgent: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contractName: string;
    actionOrTransition: string;
    violations: {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }[];
    syntheticDiagnostic: string;
    timestamp: string;
    rawPayload?: any;
    sourceAgent?: string | undefined;
}, {
    contractName: string;
    actionOrTransition: string;
    violations: {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }[];
    syntheticDiagnostic: string;
    rawPayload?: any;
    sourceAgent?: string | undefined;
    timestamp?: string | undefined;
}>;
export type ContractViolationEvent = z.infer<typeof ContractViolationEventSchema>;
/**
 * Risultato della validazione runtime eseguita dall'interceptor.
 */
export declare const InterceptedResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    contractName: z.ZodString;
    durationMs: z.ZodNumber;
    errorSummary: z.ZodOptional<z.ZodString>;
    violations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        code: z.ZodString;
        message: z.ZodString;
        expected: z.ZodOptional<z.ZodString>;
        received: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }, {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    contractName: string;
    violations: {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }[];
    durationMs: number;
    errorSummary?: string | undefined;
}, {
    valid: boolean;
    contractName: string;
    durationMs: number;
    violations?: {
        code: string;
        path: string;
        message: string;
        expected?: string | undefined;
        received?: string | undefined;
    }[] | undefined;
    errorSummary?: string | undefined;
}>;
export type InterceptedResult = z.infer<typeof InterceptedResultSchema>;
//# sourceMappingURL=interceptor.d.ts.map