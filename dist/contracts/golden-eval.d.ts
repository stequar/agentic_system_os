import { z } from "zod";
/**
 * Golden-Snapshot Evaluation contract.
 *
 * Freezes deterministic, path-independent generated artifacts and byte-compares each against a
 * committed golden file. MISMATCH = a real generation regression (or an intentional change that
 * must be re-recorded). RECORDED = first-run baseline. Every status is a real byte comparison.
 */
export declare const GoldenCheckResultSchema: z.ZodObject<{
    id: z.ZodString;
    artifact: z.ZodString;
    status: z.ZodEnum<["MATCH", "MISMATCH", "RECORDED"]>;
    passed: z.ZodBoolean;
    actualSha: z.ZodString;
    goldenSha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "MATCH" | "MISMATCH" | "RECORDED";
    passed: boolean;
    id: string;
    artifact: string;
    actualSha: string;
    goldenSha: string;
}, {
    status: "MATCH" | "MISMATCH" | "RECORDED";
    passed: boolean;
    id: string;
    artifact: string;
    actualSha: string;
    goldenSha: string;
}>;
export type GoldenCheckResult = z.infer<typeof GoldenCheckResultSchema>;
export declare const GoldenSnapshotScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    executedAt: z.ZodDefault<z.ZodString>;
    totalArtifacts: z.ZodNumber;
    matched: z.ZodNumber;
    recorded: z.ZodNumber;
    mismatched: z.ZodNumber;
    allPassed: z.ZodBoolean;
    verdict: z.ZodEnum<["GOLDEN_STABLE", "DRIFT_DETECTED"]>;
    checks: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        artifact: z.ZodString;
        status: z.ZodEnum<["MATCH", "MISMATCH", "RECORDED"]>;
        passed: z.ZodBoolean;
        actualSha: z.ZodString;
        goldenSha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "MATCH" | "MISMATCH" | "RECORDED";
        passed: boolean;
        id: string;
        artifact: string;
        actualSha: string;
        goldenSha: string;
    }, {
        status: "MATCH" | "MISMATCH" | "RECORDED";
        passed: boolean;
        id: string;
        artifact: string;
        actualSha: string;
        goldenSha: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    evalId: string;
    verdict: "GOLDEN_STABLE" | "DRIFT_DETECTED";
    checks: {
        status: "MATCH" | "MISMATCH" | "RECORDED";
        passed: boolean;
        id: string;
        artifact: string;
        actualSha: string;
        goldenSha: string;
    }[];
    allPassed: boolean;
    executedAt: string;
    totalArtifacts: number;
    matched: number;
    recorded: number;
    mismatched: number;
}, {
    evalId: string;
    verdict: "GOLDEN_STABLE" | "DRIFT_DETECTED";
    checks: {
        status: "MATCH" | "MISMATCH" | "RECORDED";
        passed: boolean;
        id: string;
        artifact: string;
        actualSha: string;
        goldenSha: string;
    }[];
    allPassed: boolean;
    totalArtifacts: number;
    matched: number;
    recorded: number;
    mismatched: number;
    executedAt?: string | undefined;
}>;
export type GoldenSnapshotScorecard = z.infer<typeof GoldenSnapshotScorecardSchema>;
//# sourceMappingURL=golden-eval.d.ts.map