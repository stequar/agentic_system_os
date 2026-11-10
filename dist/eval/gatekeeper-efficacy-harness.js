import crypto from "node:crypto";
import { GatekeeperEfficacyScorecardSchema, } from "../contracts/gatekeeper-eval.js";
import { parseDiagnostics } from "../gatekeeper/parsers/index.js";
import { scanCodeHeuristics } from "../gatekeeper/formal-prover.js";
import { validatePatch } from "../utils/diff-guard.js";
/**
 * Gatekeeper-Efficacy (mutation) Evaluation Harness.
 *
 * Injects known defects (mutants) that MUST be caught, and clean inputs that must NOT be
 * flagged, across the three Gatekeeper detection surfaces, then reports the real
 * true-positive / false-positive rates. Honest alternative to the fabricated chaos score.
 */
export class GatekeeperEfficacyHarness {
    static run() {
        const cases = [
            ...this.diagnosticParserCases(),
            ...this.heuristicScannerCases(),
            ...this.diffGuardCases(),
        ];
        const results = cases.map((c) => {
            const expectedDetected = c.kind === "MUTANT";
            const actuallyDetected = c.detect();
            return {
                id: c.id,
                surface: c.surface,
                kind: c.kind,
                description: c.description,
                expectedDetected,
                actuallyDetected,
                correct: actuallyDetected === expectedDetected,
            };
        });
        const mutants = results.filter((r) => r.kind === "MUTANT");
        const clean = results.filter((r) => r.kind === "CLEAN");
        const detectedMutants = mutants.filter((r) => r.actuallyDetected).length;
        const falsePositives = clean.filter((r) => r.actuallyDetected).length;
        const truePositiveRate = mutants.length ? Math.round((detectedMutants / mutants.length) * 1000) / 10 : 100;
        const falsePositiveRate = clean.length ? Math.round((falsePositives / clean.length) * 1000) / 10 : 0;
        const verdict = truePositiveRate === 100 && falsePositiveRate === 0
            ? "EFFECTIVE"
            : truePositiveRate >= 80 && falsePositiveRate <= 20
                ? "DEGRADED"
                : "INEFFECTIVE";
        return GatekeeperEfficacyScorecardSchema.parse({
            evalId: `GKEFF-${crypto.randomBytes(4).toString("hex")}`,
            totalMutants: mutants.length,
            detectedMutants,
            truePositiveRate,
            totalClean: clean.length,
            falsePositives,
            falsePositiveRate,
            verdict,
            results,
        });
    }
    /** Real toolchain output samples — the parser is the Gatekeeper's "eyes". */
    static diagnosticParserCases() {
        const hasViolations = (raw, runner) => parseDiagnostics(raw, runner).violations.length > 0;
        return [
            {
                id: "PARSE-tsc-legacy",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "tsc non-pretty error",
                detect: () => hasViolations("src/a.ts(5,1): error TS1005: ';' expected.", "tsc"),
            },
            {
                id: "PARSE-tsc-pretty",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "tsc pretty error (P1 fix)",
                detect: () => hasViolations("src/a.ts:5:1 - error TS2322: Type 'string' is not assignable.", "tsc"),
            },
            {
                id: "PARSE-vitest",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "vitest assertion failure",
                detect: () => hasViolations("AssertionError: expected 1 to be 2\n ❯ tests/a.test.ts:3:5", "vitest"),
            },
            {
                id: "PARSE-pytest",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "pytest failure",
                detect: () => hasViolations("FAILED tests/t.py::test_x - AssertionError: 1 != 2", "pytest"),
            },
            {
                id: "PARSE-go",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "go compile error",
                detect: () => hasViolations("./server.go:12:3: undefined: InitDB", "go"),
            },
            {
                id: "PARSE-cargo",
                surface: "DIAGNOSTIC_PARSER",
                kind: "MUTANT",
                description: "cargo error",
                detect: () => hasViolations("error[E0308]: mismatched types\n  --> src/main.rs:14:5", "cargo"),
            },
            {
                id: "PARSE-clean",
                surface: "DIAGNOSTIC_PARSER",
                kind: "CLEAN",
                description: "passing output (no defects)",
                detect: () => hasViolations("Test Files  3 passed (3)\nTests  12 passed (12)", "vitest"),
            },
        ];
    }
    /** Code-risk mutants the heuristic scanner must flag with a counterexample. */
    static heuristicScannerCases() {
        const flagged = (src, sym) => scanCodeHeuristics({ targetFilePath: `src/${sym}.ts`, sourceCode: src, targetSymbol: sym })
            .status === "COUNTEREXAMPLE_FOUND";
        return [
            {
                id: "SCAN-divzero",
                surface: "HEURISTIC_SCANNER",
                kind: "MUTANT",
                description: "unguarded division by zero",
                detect: () => flagged("export function ratio(a: number, b: number): number {\n  return a / b;\n}", "ratio"),
            },
            {
                id: "SCAN-nullderef",
                surface: "HEURISTIC_SCANNER",
                kind: "MUTANT",
                description: "null dereference",
                detect: () => flagged("export function fmt(u: { name: string } | null): string {\n  return u.name;\n}", "fmt"),
            },
            {
                id: "SCAN-oob",
                surface: "HEURISTIC_SCANNER",
                kind: "MUTANT",
                description: "array out-of-bounds",
                detect: () => flagged("export function pick(items: string[], i: number): string {\n  return items[i];\n}", "pick"),
            },
            {
                id: "SCAN-clean",
                surface: "HEURISTIC_SCANNER",
                kind: "CLEAN",
                description: "guarded safe division",
                detect: () => flagged("export function safeDiv(n: number, d: number): number {\n  if (d === 0) {\n    return 0;\n  }\n  return n / d;\n}", "safeDiv"),
            },
        ];
    }
    /** Patch mutants the diff-guard must block. */
    static diffGuardCases() {
        const original = new Map([
            ["src/a.ts", "export const a = 1;\n"],
            ["tests/a.test.ts", "it('a', () => { expect(a).toBe(1); });\n"],
        ]);
        const blocked = (modified, allowed) => validatePatch(original, modified, { allowedFiles: allowed }).passed === false;
        return [
            {
                id: "GUARD-assertion-removal",
                surface: "DIFF_GUARD",
                kind: "MUTANT",
                description: "removes a test assertion",
                detect: () => blocked(new Map([["tests/a.test.ts", "it('a', () => {});\n"]]), ["tests/a.test.ts"]),
            },
            {
                id: "GUARD-skip-injection",
                surface: "DIFF_GUARD",
                kind: "MUTANT",
                description: "injects it.skip",
                detect: () => blocked(new Map([["tests/a.test.ts", "it.skip('a', () => { expect(a).toBe(1); });\n"]]), ["tests/a.test.ts"]),
            },
            {
                id: "GUARD-out-of-scope",
                surface: "DIFF_GUARD",
                kind: "MUTANT",
                description: "writes an out-of-scope file",
                detect: () => blocked(new Map([["src/secret.ts", "export const leaked = true;\n"]]), ["src/a.ts"]),
            },
            {
                id: "GUARD-clean",
                surface: "DIFF_GUARD",
                kind: "CLEAN",
                description: "valid in-scope edit preserving tests",
                detect: () => blocked(new Map([["src/a.ts", "export const a = 2;\n"]]), ["src/a.ts"]),
            },
        ];
    }
}
//# sourceMappingURL=gatekeeper-efficacy-harness.js.map