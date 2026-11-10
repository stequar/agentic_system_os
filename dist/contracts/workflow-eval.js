import { z } from "zod";
/**
 * Le 4 Modalità Operative del CTO (Executive & R&D Operating Protocol v2 — Sprint 17.6).
 */
export const CtoOperatingModeSchema = z.enum([
    "MODE_1_STANDUP",
    "MODE_2_INVESTIGATE_RCA",
    "MODE_3_RND_ROUNDTABLE",
    "MODE_4_BUILD_GATEKEEPER",
]);
/**
 * Tipo di stimolo in ingresso per il Cognitive Forcing Gate.
 */
export const WorkflowStimulusTypeSchema = z.enum([
    "NORMAL_SPRINT",
    "ANOMALY_OR_BUG",
]);
/**
 * Dossier strutturato di Root Cause Analysis (RCA) richiesto obbligatoriamente
 * dal Cognitive Forcing Gate prima di passare da un'anomalia/bug a MODE_4_BUILD_GATEKEEPER.
 */
export const RootCauseAnalysisReportSchema = z.object({
    rcaId: z.string().min(3),
    symptomDescription: z.string().min(5),
    fiveWhys: z.array(z.string().min(3)).min(3),
    rootCause: z.string().min(5),
    systemicPrinciple: z.string().min(5),
    affectedDomains: z.array(z.string()).min(1),
    consultedSpecialists: z.array(z.string()).min(2),
    redTeamRisks: z.array(z.string()).min(1),
    proposedActionPlan: z.array(z.string()).min(1),
    ceoApproved: z.boolean(),
});
/**
 * Stato persistito dal Dual-Brain Bridge in `.company-os/workflow-state.json`.
 */
export const WorkflowPersistedStateSchema = z.object({
    targetPath: z.string(),
    activeMode: CtoOperatingModeSchema,
    fsmState: z.string(),
    stimulusType: WorkflowStimulusTypeSchema.default("NORMAL_SPRINT"),
    activeRcaReport: RootCauseAnalysisReportSchema.optional(),
    lastRoutedScope: z.array(z.string()).default([]),
    lastSummonedSpecialists: z.array(z.string()).default([]),
    updatedAt: z.string().datetime(),
});
/**
 * I 7 Assi del Workflow Behavioral Eval Harness (`W1..W7`).
 */
export const WorkflowEvalAxisIdSchema = z.enum([
    "W1_SESSION_BOOT_AND_CTO_PERSONA",
    "W2_COGNITIVE_FORCING_FUNCTIONS_GATE",
    "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING",
    "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY",
    "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE",
    "W6_SELF_HOSTING_SYMMETRY",
    "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT",
]);
export const WorkflowEvalAxisResultSchema = z.object({
    axisId: WorkflowEvalAxisIdSchema,
    title: z.string(),
    score: z.number().min(0).max(100),
    passed: z.boolean(),
    weight: z.number().min(0).max(1),
    evidence: z.array(z.string()),
    metrics: z
        .record(z.string(), z.union([z.number(), z.string(), z.boolean()]))
        .default({}),
});
export const WorkflowEvalScorecardSchema = z.object({
    evalId: z.string(),
    targetPath: z.string(),
    evaluatedAt: z.string().datetime(),
    overallScore: z.number().min(0).max(100),
    verdict: z.enum(["WORKFLOW_CERTIFIED", "NEEDS_REMEDIATION"]),
    axes: z.array(WorkflowEvalAxisResultSchema).length(7),
});
//# sourceMappingURL=workflow-eval.js.map