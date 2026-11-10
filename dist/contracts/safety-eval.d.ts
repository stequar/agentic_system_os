import { z } from "zod";
/**
 * Safety / Destructiveness Evaluation contract.
 *
 * Unlike the legacy self-referential harnesses, EVERY result here is derived from a real
 * filesystem/git observation on a throwaway repo — a skeptic can reproduce it. `passed` is
 * never a constant; it reflects what actually happened to disk under adversarial input.
 */
export declare const SafetyScenarioResultSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    category: z.ZodEnum<["SHELL_INJECTION", "DATA_LOSS", "HONEST_FAILURE", "SCOPE_ENFORCEMENT", "NON_DESTRUCTIVE_ATTACH", "SANDBOX_GUARD"]>;
    passed: z.ZodBoolean;
    /** Concrete observed evidence (what was/wasn't written, deleted, rejected, recovered). */
    evidence: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    passed: boolean;
    evidence: string;
    id: string;
    category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
}, {
    title: string;
    passed: boolean;
    evidence: string;
    id: string;
    category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
}>;
export type SafetyScenarioResult = z.infer<typeof SafetyScenarioResultSchema>;
export declare const SafetyEvalScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    executedAt: z.ZodDefault<z.ZodString>;
    totalScenarios: z.ZodNumber;
    passedScenarios: z.ZodNumber;
    allPassed: z.ZodBoolean;
    verdict: z.ZodEnum<["SAFE_TO_RUN", "UNSAFE"]>;
    scenarios: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        category: z.ZodEnum<["SHELL_INJECTION", "DATA_LOSS", "HONEST_FAILURE", "SCOPE_ENFORCEMENT", "NON_DESTRUCTIVE_ATTACH", "SANDBOX_GUARD"]>;
        passed: z.ZodBoolean;
        /** Concrete observed evidence (what was/wasn't written, deleted, rejected, recovered). */
        evidence: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
    }, {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    evalId: string;
    verdict: "SAFE_TO_RUN" | "UNSAFE";
    allPassed: boolean;
    executedAt: string;
    totalScenarios: number;
    passedScenarios: number;
    scenarios: {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
    }[];
}, {
    evalId: string;
    verdict: "SAFE_TO_RUN" | "UNSAFE";
    allPassed: boolean;
    totalScenarios: number;
    passedScenarios: number;
    scenarios: {
        title: string;
        passed: boolean;
        evidence: string;
        id: string;
        category: "SHELL_INJECTION" | "DATA_LOSS" | "HONEST_FAILURE" | "SCOPE_ENFORCEMENT" | "NON_DESTRUCTIVE_ATTACH" | "SANDBOX_GUARD";
    }[];
    executedAt?: string | undefined;
}>;
export type SafetyEvalScorecard = z.infer<typeof SafetyEvalScorecardSchema>;
//# sourceMappingURL=safety-eval.d.ts.map