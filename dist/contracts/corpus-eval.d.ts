import { z } from "zod";
/**
 * Brownfield Corpus Evaluation contract.
 *
 * Runs stack detection against a corpus of synthetic fixture repos, scoring DETECTION RECALL
 * against HUMAN-labeled ground truth (not tuned to the detector). `extras` (detected-but-not-
 * expected) are reported informationally — common ones like javascript-with-typescript or a
 * test runner surfaced as a framework are defensible, so they do not fail the eval.
 */
export declare const CorpusFixtureResultSchema: z.ZodObject<{
    fixture: z.ZodString;
    expectedChecks: z.ZodNumber;
    foundChecks: z.ZodNumber;
    recall: z.ZodNumber;
    missed: z.ZodArray<z.ZodString, "many">;
    extras: z.ZodArray<z.ZodString, "many">;
    passed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    fixture: string;
    expectedChecks: number;
    foundChecks: number;
    recall: number;
    missed: string[];
    extras: string[];
}, {
    passed: boolean;
    fixture: string;
    expectedChecks: number;
    foundChecks: number;
    recall: number;
    missed: string[];
    extras: string[];
}>;
export type CorpusFixtureResult = z.infer<typeof CorpusFixtureResultSchema>;
export declare const BrownfieldCorpusScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    executedAt: z.ZodDefault<z.ZodString>;
    totalFixtures: z.ZodNumber;
    totalExpectedChecks: z.ZodNumber;
    totalFoundChecks: z.ZodNumber;
    recallPct: z.ZodNumber;
    totalExtras: z.ZodNumber;
    verdict: z.ZodEnum<["DETECTION_ACCURATE", "DETECTION_GAPS"]>;
    fixtures: z.ZodArray<z.ZodObject<{
        fixture: z.ZodString;
        expectedChecks: z.ZodNumber;
        foundChecks: z.ZodNumber;
        recall: z.ZodNumber;
        missed: z.ZodArray<z.ZodString, "many">;
        extras: z.ZodArray<z.ZodString, "many">;
        passed: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        passed: boolean;
        fixture: string;
        expectedChecks: number;
        foundChecks: number;
        recall: number;
        missed: string[];
        extras: string[];
    }, {
        passed: boolean;
        fixture: string;
        expectedChecks: number;
        foundChecks: number;
        recall: number;
        missed: string[];
        extras: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    evalId: string;
    verdict: "DETECTION_ACCURATE" | "DETECTION_GAPS";
    fixtures: {
        passed: boolean;
        fixture: string;
        expectedChecks: number;
        foundChecks: number;
        recall: number;
        missed: string[];
        extras: string[];
    }[];
    executedAt: string;
    totalFixtures: number;
    totalExpectedChecks: number;
    totalFoundChecks: number;
    recallPct: number;
    totalExtras: number;
}, {
    evalId: string;
    verdict: "DETECTION_ACCURATE" | "DETECTION_GAPS";
    fixtures: {
        passed: boolean;
        fixture: string;
        expectedChecks: number;
        foundChecks: number;
        recall: number;
        missed: string[];
        extras: string[];
    }[];
    totalFixtures: number;
    totalExpectedChecks: number;
    totalFoundChecks: number;
    recallPct: number;
    totalExtras: number;
    executedAt?: string | undefined;
}>;
export type BrownfieldCorpusScorecard = z.infer<typeof BrownfieldCorpusScorecardSchema>;
//# sourceMappingURL=corpus-eval.d.ts.map