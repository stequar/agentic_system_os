import { z } from "zod";
import type { DynamicMcpTool } from "../contracts/frontiers.js";
/**
 * Risultato dell'analisi statica preventiva AST/Token sul codice del tool dinamico.
 */
export declare const AstVerificationResultSchema: z.ZodObject<{
    safe: z.ZodBoolean;
    violations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    violations: string[];
    safe: boolean;
}, {
    violations: string[];
    safe: boolean;
}>;
export type AstVerificationResult = z.infer<typeof AstVerificationResultSchema>;
/**
 * SECURITY BOUNDARY DISCLAIMER (TCK-DH.1 — Capability Honesty):
 * `node:worker_threads` provides RESOURCE isolation only (heap/CPU-time limits via
 * `resourceLimits` and a hard timeout). It is NOT an OS-level security sandbox: a worker
 * shares the host process filesystem, environment variables, and network stack.
 * Therefore `verifyDynamicToolAst` is a best-effort, fail-closed HEURISTIC deny-list
 * (defense-in-depth), not a soundness proof. Only self-synthesized, pre-flight-verified
 * tools must run on this path; never execute untrusted third-party code here.
 */
export declare const SANDBOX_SECURITY_MODEL: {
    readonly resourceIsolation: true;
    readonly osLevelSecuritySandbox: false;
    readonly staticGuard: "HEURISTIC_FAIL_CLOSED_DENYLIST";
};
/**
 * Risultato strutturato dell'esecuzione di un tool MCP dinamico nella sandbox Worker Threads.
 */
export declare const SandboxExecutionResultSchema: z.ZodObject<{
    toolId: z.ZodString;
    success: z.ZodBoolean;
    output: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    executionTimeMs: z.ZodNumber;
    quarantined: z.ZodBoolean;
    status: z.ZodEnum<["SYNTHESIZED", "TEST_PASSED", "HOT_LOADED", "PROMOTED_PERMANENT", "QUARANTINED", "EXPIRED"]>;
}, "strip", z.ZodTypeAny, {
    status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
    success: boolean;
    toolId: string;
    executionTimeMs: number;
    quarantined: boolean;
    error?: string | undefined;
    output?: unknown;
}, {
    status: "SYNTHESIZED" | "TEST_PASSED" | "HOT_LOADED" | "PROMOTED_PERMANENT" | "QUARANTINED" | "EXPIRED";
    success: boolean;
    toolId: string;
    executionTimeMs: number;
    quarantined: boolean;
    error?: string | undefined;
    output?: unknown;
}>;
export type SandboxExecutionResult = z.infer<typeof SandboxExecutionResultSchema>;
/**
 * Scansiona staticamente il codice sorgente del tool sintetizzato prima dell'esecuzione.
 * Rigetta qualsiasi pattern proibito secondo la policy Zero-Trust dello Sprint 19.
 */
export declare function verifyDynamicToolAst(code: string, allowedPermissions?: string[]): AstVerificationResult;
/**
 * Oggetto guardrail esportato per compatibilità con i contratti architetturali dello Sprint 19.
 */
export declare const DynamicToolAstGuard: {
    verify: typeof verifyDynamicToolAst;
    verifyDynamicToolAst: typeof verifyDynamicToolAst;
};
/**
 * Esegue il codice di un tool MCP dinamico in una sandbox `node:worker_threads`
 * previa verifica statica con `verifyDynamicToolAst`.
 * Applica limiti di memoria V8 (128MB old gen, 32MB young gen) e hard timeout (default 3000ms).
 */
export declare function runDynamicToolInSandbox(tool: DynamicMcpTool, code: string, inputPayload: Record<string, unknown>, timeoutMs?: number): Promise<SandboxExecutionResult>;
//# sourceMappingURL=sandbox-runner.d.ts.map