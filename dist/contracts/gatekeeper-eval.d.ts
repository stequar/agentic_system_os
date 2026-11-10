import { z } from "zod";
/**
 * Gatekeeper-Efficacy (mutation) Evaluation contract.
 *
 * Honest detection metric: inject KNOWN defects (mutants) that MUST be caught, plus CLEAN
 * inputs that must NOT be flagged, then measure the real true-positive and false-positive
 * rates of the Gatekeeper's detection surfaces. Replaces the self-referential chaos
 * "resilience score" — every `actuallyDetected` is a real observation of the detector output.
 */
export declare const MutationResultSchema: z.ZodObject<{
    id: z.ZodString;
    surface: z.ZodEnum<["DIAGNOSTIC_PARSER", "HEURISTIC_SCANNER", "DIFF_GUARD"]>;
    kind: z.ZodEnum<["MUTANT", "CLEAN"]>;
    description: z.ZodString;
    expectedDetected: z.ZodBoolean;
    actuallyDetected: z.ZodBoolean;
    /** True when the detector did the right thing (caught a mutant, or left a clean input alone). */
    correct: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
    kind: "MUTANT" | "CLEAN";
    expectedDetected: boolean;
    actuallyDetected: boolean;
    correct: boolean;
}, {
    id: string;
    description: string;
    surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
    kind: "MUTANT" | "CLEAN";
    expectedDetected: boolean;
    actuallyDetected: boolean;
    correct: boolean;
}>;
export type MutationResult = z.infer<typeof MutationResultSchema>;
export declare const GatekeeperEfficacyScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    executedAt: z.ZodDefault<z.ZodString>;
    totalMutants: z.ZodNumber;
    detectedMutants: z.ZodNumber;
    truePositiveRate: z.ZodNumber;
    totalClean: z.ZodNumber;
    falsePositives: z.ZodNumber;
    falsePositiveRate: z.ZodNumber;
    verdict: z.ZodEnum<["EFFECTIVE", "DEGRADED", "INEFFECTIVE"]>;
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        surface: z.ZodEnum<["DIAGNOSTIC_PARSER", "HEURISTIC_SCANNER", "DIFF_GUARD"]>;
        kind: z.ZodEnum<["MUTANT", "CLEAN"]>;
        description: z.ZodString;
        expectedDetected: z.ZodBoolean;
        actuallyDetected: z.ZodBoolean;
        /** True when the detector did the right thing (caught a mutant, or left a clean input alone). */
        correct: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
        kind: "MUTANT" | "CLEAN";
        expectedDetected: boolean;
        actuallyDetected: boolean;
        correct: boolean;
    }, {
        id: string;
        description: string;
        surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
        kind: "MUTANT" | "CLEAN";
        expectedDetected: boolean;
        actuallyDetected: boolean;
        correct: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    evalId: string;
    verdict: "EFFECTIVE" | "DEGRADED" | "INEFFECTIVE";
    executedAt: string;
    totalMutants: number;
    detectedMutants: number;
    truePositiveRate: number;
    totalClean: number;
    falsePositives: number;
    falsePositiveRate: number;
    results: {
        id: string;
        description: string;
        surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
        kind: "MUTANT" | "CLEAN";
        expectedDetected: boolean;
        actuallyDetected: boolean;
        correct: boolean;
    }[];
}, {
    evalId: string;
    verdict: "EFFECTIVE" | "DEGRADED" | "INEFFECTIVE";
    totalMutants: number;
    detectedMutants: number;
    truePositiveRate: number;
    totalClean: number;
    falsePositives: number;
    falsePositiveRate: number;
    results: {
        id: string;
        description: string;
        surface: "DIAGNOSTIC_PARSER" | "HEURISTIC_SCANNER" | "DIFF_GUARD";
        kind: "MUTANT" | "CLEAN";
        expectedDetected: boolean;
        actuallyDetected: boolean;
        correct: boolean;
    }[];
    executedAt?: string | undefined;
}>;
export type GatekeeperEfficacyScorecard = z.infer<typeof GatekeeperEfficacyScorecardSchema>;
//# sourceMappingURL=gatekeeper-eval.d.ts.map