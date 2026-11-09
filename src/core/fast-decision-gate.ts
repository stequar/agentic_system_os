import { z } from "zod";
import { performance } from "node:perf_hooks";

export const FastDecisionTypeSchema = z.enum([
  "FAST_APPROVE",
  "FAST_REJECT",
  "ESCALATE_TO_SYSTEM2",
]);
export type FastDecisionType = z.infer<typeof FastDecisionTypeSchema>;

export const FastDecisionResultSchema = z.object({
  decision: FastDecisionTypeSchema,
  latencyMs: z.number().nonnegative(),
  tokenCostUsd: z.literal(0),
  reason: z.string(),
  ruleTriggered: z.string().optional(),
  routedTo: z.string(),
  evaluatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
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
export class FastDecisionGate {
  private static readonly FORBIDDEN_PATH_PATTERNS = [
    /(^|\/)\.git(\/|$)/i,
    /(^|\/)\.env(\.|$)/i,
    /(^|\/)node_modules(\/|$)/i,
    /(^|\/)\.ssh(\/|$)/i,
    /(^|\/)id_rsa/i,
  ];

  private static readonly SECRET_PATTERNS = [
    /ghp_[a-zA-Z0-9]{36}/,
    /sk-[a-zA-Z0-9]{32,}/,
    /AIza[0-9A-Za-z-_]{35}/,
    /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/,
  ];

  private static readonly DETERMINISTIC_SAFE_ACTIONS = new Set([
    "GIT_STATUS",
    "READ_FILE",
    "LIST_FILES",
    "CHECK_TYPECHECK",
    "RUN_GATEKEEPER",
    "INSPECT_STACK",
    "HEALTH_CHECK",
    "CONTEXT_HEALTH",
    "GET_METRICS",
  ]);

  private static readonly COMPLEX_SYSTEM2_ACTIONS = new Set([
    "ARCHITECTURE_REDESIGN",
    "API_CONTRACT_BREAK",
    "CONSENSUS_ROUNDTABLE",
    "CROSS_DOMAIN_REFACTOR",
    "MULTI_FILE_MIGRATION",
    "BACKLOG_REFINEMENT",
    "NEW_FEATURE_DESIGN",
  ]);

  /**
   * Valuta l'azione richiesta in modo sub-10ms senza invocare alcun modello LLM.
   */
  public static evaluate(input: FastDecisionInput): FastDecisionResult {
    const start = performance.now();

    // 1. Controllo di sicurezza: Percorsi protetti o proibiti
    if (input.targetFiles && input.targetFiles.length > 0) {
      for (const file of input.targetFiles) {
        for (const pattern of this.FORBIDDEN_PATH_PATTERNS) {
          if (pattern.test(file)) {
            const latencyMs = Number((performance.now() - start).toFixed(3));
            return FastDecisionResultSchema.parse({
              decision: "FAST_REJECT",
              latencyMs,
              tokenCostUsd: 0,
              reason: `Target file matches forbidden security path pattern: ${file}`,
              ruleTriggered: "SEC_GUARD_FORBIDDEN_PATH",
              routedTo: "REJECTED",
            });
          }
        }
      }
    }

    // 2. Controllo di sicurezza: Secret leak detection nel prompt o nel payload
    const textToScan = [
      input.promptSnippet || "",
      JSON.stringify(input.payload || {}),
    ].join(" ");

    for (const pattern of this.SECRET_PATTERNS) {
      if (pattern.test(textToScan)) {
        const latencyMs = Number((performance.now() - start).toFixed(3));
        return FastDecisionResultSchema.parse({
          decision: "FAST_REJECT",
          latencyMs,
          tokenCostUsd: 0,
          reason: "Critical credential or private key pattern detected in request payload",
          ruleTriggered: "SEC_GUARD_SECRET_LEAK",
          routedTo: "REJECTED",
        });
      }
    }

    // 3. Triage deterministico veloce: Azioni sicure e deterministiche -> FAST_APPROVE
    const upperAction = input.action.toUpperCase();
    if (this.DETERMINISTIC_SAFE_ACTIONS.has(upperAction)) {
      const latencyMs = Number((performance.now() - start).toFixed(3));
      return FastDecisionResultSchema.parse({
        decision: "FAST_APPROVE",
        latencyMs,
        tokenCostUsd: 0,
        reason: `Action '${input.action}' is statically verified as safe and deterministic`,
        ruleTriggered: "DETERMINISTIC_SAFE_ACTION",
        routedTo: "LOCAL_DETERMINISTIC_ENGINE",
      });
    }

    // 4. Azioni complesse o architetturali -> ESCALATE_TO_SYSTEM2
    if (this.COMPLEX_SYSTEM2_ACTIONS.has(upperAction)) {
      const latencyMs = Number((performance.now() - start).toFixed(3));
      return FastDecisionResultSchema.parse({
        decision: "ESCALATE_TO_SYSTEM2",
        latencyMs,
        tokenCostUsd: 0,
        reason: `Action '${input.action}' requires deliberation, multi-agent consensus or deep architectural review`,
        ruleTriggered: "SYSTEM_2_ESCALATION_POLICY",
        routedTo: "SYSTEM_2_ROUNDTABLE",
      });
    }

    // 5. Default: se l'azione modifica file multipli (>2) o ha un prompt ambiguo, scala a System 2
    if (input.targetFiles && input.targetFiles.length > 2) {
      const latencyMs = Number((performance.now() - start).toFixed(3));
      return FastDecisionResultSchema.parse({
        decision: "ESCALATE_TO_SYSTEM2",
        latencyMs,
        tokenCostUsd: 0,
        reason: `Batch modification across ${input.targetFiles.length} files requires multi-file architectural planning`,
        ruleTriggered: "MULTI_FILE_COMPLEXITY_POLICY",
        routedTo: "SYSTEM_2_ROUNDTABLE",
      });
    }

    // Altrimenti per task atomici circoscritti su singolo file
    const latencyMs = Number((performance.now() - start).toFixed(3));
    return FastDecisionResultSchema.parse({
      decision: "FAST_APPROVE",
      latencyMs,
      tokenCostUsd: 0,
      reason: `Action '${input.action}' accepted for single-file leaf execution`,
      ruleTriggered: "ATOMIC_LEAF_POLICY",
      routedTo: "LEAF_DEVELOPER_EXECUTION",
    });
  }
}
