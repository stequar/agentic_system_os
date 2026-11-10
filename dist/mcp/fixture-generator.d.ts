import { z } from "zod";
import { type DynamicMcpTool } from "../contracts/frontiers.js";
import { type AstVerificationResult } from "./sandbox-runner.js";
/**
 * Categorie obbligatorie di fixture sintetiche per il Pre-Flight Verification Gate (TCK-19.4).
 */
export declare const FixtureCategorySchema: z.ZodEnum<["HAPPY_PATH", "BOUNDARY_EDGE", "NEGATIVE_MALFORMED"]>;
export type FixtureCategory = z.infer<typeof FixtureCategorySchema>;
/**
 * Singola fixture sintetica generata a partire dal JSON Schema del tool.
 */
export declare const SyntheticFixtureSchema: z.ZodObject<{
    category: z.ZodEnum<["HAPPY_PATH", "BOUNDARY_EDGE", "NEGATIVE_MALFORMED"]>;
    name: z.ZodString;
    description: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    expectGracefulRejectionOrSuccess: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    category: "HAPPY_PATH" | "BOUNDARY_EDGE" | "NEGATIVE_MALFORMED";
    input: Record<string, unknown>;
    expectGracefulRejectionOrSuccess: boolean;
}, {
    name: string;
    description: string;
    category: "HAPPY_PATH" | "BOUNDARY_EDGE" | "NEGATIVE_MALFORMED";
    input: Record<string, unknown>;
    expectGracefulRejectionOrSuccess?: boolean | undefined;
}>;
export type SyntheticFixture = z.infer<typeof SyntheticFixtureSchema>;
/**
 * Esito dell'esecuzione di una singola fixture in sandbox.
 */
export declare const FixtureExecutionReportSchema: z.ZodObject<{
    category: z.ZodEnum<["HAPPY_PATH", "BOUNDARY_EDGE", "NEGATIVE_MALFORMED"]>;
    name: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    passed: z.ZodBoolean;
    executionTimeMs: z.ZodNumber;
    output: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passed: boolean;
    name: string;
    category: "HAPPY_PATH" | "BOUNDARY_EDGE" | "NEGATIVE_MALFORMED";
    executionTimeMs: number;
    input: Record<string, unknown>;
    error?: string | undefined;
    output?: unknown;
}, {
    passed: boolean;
    name: string;
    category: "HAPPY_PATH" | "BOUNDARY_EDGE" | "NEGATIVE_MALFORMED";
    executionTimeMs: number;
    input: Record<string, unknown>;
    error?: string | undefined;
    output?: unknown;
}>;
export type FixtureExecutionReport = z.infer<typeof FixtureExecutionReportSchema>;
/**
 * Risultato complessivo del Pre-Flight Verification Gate ("Zero Unverified Dynamic Code").
 */
export interface PreFlightVerificationReport {
    tool: DynamicMcpTool;
    passed: boolean;
    allPassed: boolean;
    status: "TEST_PASSED" | "QUARANTINED";
    astCheck: AstVerificationResult;
    fixtureResults: FixtureExecutionReport[];
    totalTests: number;
    passedTests: number;
    failedTests: number;
}
/**
 * Genera automaticamente le 3 categorie di fixture sintetiche (`HAPPY_PATH`,
 * `BOUNDARY_EDGE`, `NEGATIVE_MALFORMED`) a partire da `tool.inputSchemaJson`.
 */
export declare function generateSyntheticFixtures(tool: DynamicMcpTool): SyntheticFixture[];
/**
 * Esegue il Pre-Flight Verification Gate completo ("Zero Unverified Dynamic Code"):
 * 1. Analisi statica `verifyDynamicToolAst`
 * 2. Esecuzione in sandbox di tutte le fixture (`HAPPY_PATH`, `BOUNDARY_EDGE`, `NEGATIVE_MALFORMED`)
 * Restituisce il tool certificato con `status: "TEST_PASSED"` solo se il 100% delle verifiche passa;
 * altrimenti imposta `status: "QUARANTINED"`.
 */
export declare function runPreFlightVerification(tool: DynamicMcpTool, code: string, customFixtures?: SyntheticFixture[], timeoutMs?: number): Promise<PreFlightVerificationReport>;
//# sourceMappingURL=fixture-generator.d.ts.map