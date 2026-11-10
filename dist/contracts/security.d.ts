import { z } from "zod";
export declare const SecretViolationSchema: z.ZodObject<{
    secretType: z.ZodString;
    snippet: z.ZodString;
    line: z.ZodOptional<z.ZodNumber>;
    column: z.ZodOptional<z.ZodNumber>;
    entropy: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    secretType: string;
    snippet: string;
    line?: number | undefined;
    column?: number | undefined;
    entropy?: number | undefined;
}, {
    secretType: string;
    snippet: string;
    line?: number | undefined;
    column?: number | undefined;
    entropy?: number | undefined;
}>;
export type SecretViolation = z.infer<typeof SecretViolationSchema>;
export declare const SecretScanResultSchema: z.ZodObject<{
    passed: z.ZodBoolean;
    tier: z.ZodEnum<["tier1-prompt", "tier2-precommit"]>;
    violations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        secretType: z.ZodString;
        snippet: z.ZodString;
        line: z.ZodOptional<z.ZodNumber>;
        column: z.ZodOptional<z.ZodNumber>;
        entropy: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        secretType: string;
        snippet: string;
        line?: number | undefined;
        column?: number | undefined;
        entropy?: number | undefined;
    }, {
        secretType: string;
        snippet: string;
        line?: number | undefined;
        column?: number | undefined;
        entropy?: number | undefined;
    }>, "many">>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    violations: {
        secretType: string;
        snippet: string;
        line?: number | undefined;
        column?: number | undefined;
        entropy?: number | undefined;
    }[];
    tier: "tier1-prompt" | "tier2-precommit";
    message?: string | undefined;
}, {
    passed: boolean;
    tier: "tier1-prompt" | "tier2-precommit";
    message?: string | undefined;
    violations?: {
        secretType: string;
        snippet: string;
        line?: number | undefined;
        column?: number | undefined;
        entropy?: number | undefined;
    }[] | undefined;
}>;
export type SecretScanResult = z.infer<typeof SecretScanResultSchema>;
//# sourceMappingURL=security.d.ts.map