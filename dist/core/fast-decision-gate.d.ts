import { z } from "zod";
export declare const FastDecisionTypeSchema: z.ZodEnum<["FAST_APPROVE", "FAST_REJECT", "ESCALATE_TO_SYSTEM2"]>;
export type FastDecisionType = z.infer<typeof FastDecisionTypeSchema>;
export declare const FastDecisionResultSchema: z.ZodObject<{
    decision: z.ZodEnum<["FAST_APPROVE", "FAST_REJECT", "ESCALATE_TO_SYSTEM2"]>;
    latencyMs: z.ZodNumber;
    tokenCostUsd: z.ZodLiteral<0>;
    reason: z.ZodString;
    ruleTriggered: z.ZodOptional<z.ZodString>;
    routedTo: z.ZodString;
    evaluatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    evaluatedAt: string;
    decision: "FAST_APPROVE" | "FAST_REJECT" | "ESCALATE_TO_SYSTEM2";
    latencyMs: number;
    tokenCostUsd: 0;
    reason: string;
    routedTo: string;
    ruleTriggered?: string | undefined;
}, {
    decision: "FAST_APPROVE" | "FAST_REJECT" | "ESCALATE_TO_SYSTEM2";
    latencyMs: number;
    tokenCostUsd: 0;
    reason: string;
    routedTo: string;
    evaluatedAt?: string | undefined;
    ruleTriggered?: string | undefined;
}>;
export type FastDecisionResult = z.infer<typeof FastDecisionResultSchema>;
export interface FastDecisionInput {
    action: string;
    targetFiles?: string[];
    payload?: Record<string, any>;
    promptSnippet?: string;
    senderRole?: string;
}
/**
 * Kahneman System-1 Fast Decision Gate.
 * Esegue triage, sicurezza deterministica e micro-routing in sub-10ms a costo token $0,
 * evitando invocazioni LLM onerose per decisioni deterministiche o violazioni palesi.
 */
export declare class FastDecisionGate {
    private static readonly FORBIDDEN_PATH_PATTERNS;
    private static readonly SECRET_PATTERNS;
    private static readonly DETERMINISTIC_SAFE_ACTIONS;
    private static readonly COMPLEX_SYSTEM2_ACTIONS;
    /**
     * Valuta l'azione richiesta in modo sub-10ms senza invocare alcun modello LLM.
     */
    static evaluate(input: FastDecisionInput): FastDecisionResult;
}
//# sourceMappingURL=fast-decision-gate.d.ts.map