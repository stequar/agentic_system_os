import { z } from "zod";
/**
 * Determinism / Idempotency Evaluation contract.
 *
 * Verifies the OS produces identical output for identical input and that re-running attach is a
 * no-op. Every `passed` is a real byte-identity / hash observation — not a constant.
 */
export declare const DeterminismCheckResultSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    category: z.ZodEnum<["IDEMPOTENT_ATTACH", "DETERMINISTIC_GENERATION", "STABLE_CACHE_PREFIX", "IDEMPOTENT_MERGE"]>;
    passed: z.ZodBoolean;
    evidence: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    passed: boolean;
    evidence: string;
    id: string;
    category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
}, {
    title: string;
    passed: boolean;
    evidence: string;
    id: string;
    category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
}>;
export type DeterminismCheckResult = z.infer<typeof DeterminismCheckResultSchema>;
export declare const DeterminismScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    executedAt: z.ZodDefault<z.ZodString>;
    totalChecks: z.ZodNumber;
    passedChecks: z.ZodNumber;
    allPassed: z.ZodBoolean;
    verdict: z.ZodEnum<["DETERMINISTIC", "NON_DETERMINISTIC"]>;
    checks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodEnum<["IDEMPOTENT_ATTACH", "DETERMINISTIC_GENERATION", "STABLE_CACHE_PREFIX", "IDEMPOTENT_MERGE"]>;
        passed: z.ZodBoolean;
        evidence: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
    }, {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    evalId: string;
    verdict: "DETERMINISTIC" | "NON_DETERMINISTIC";
    checks: {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
    }[];
    allPassed: boolean;
    executedAt: string;
    totalChecks: number;
    passedChecks: number;
}, {
    evalId: string;
    verdict: "DETERMINISTIC" | "NON_DETERMINISTIC";
    checks: {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "IDEMPOTENT_ATTACH" | "DETERMINISTIC_GENERATION" | "STABLE_CACHE_PREFIX" | "IDEMPOTENT_MERGE";
    }[];
    allPassed: boolean;
    totalChecks: number;
    passedChecks: number;
    executedAt?: string | undefined;
}>;
export type DeterminismScorecard = z.infer<typeof DeterminismScorecardSchema>;
//# sourceMappingURL=determinism-eval.d.ts.map