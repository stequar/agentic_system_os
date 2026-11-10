import { z } from "zod";
/**
 * Le 4 Modalità Operative del CTO (Executive & R&D Operating Protocol v2 — Sprint 17.6).
 */
export declare const CtoOperatingModeSchema: z.ZodEnum<["MODE_1_STANDUP", "MODE_2_INVESTIGATE_RCA", "MODE_3_RND_ROUNDTABLE", "MODE_4_BUILD_GATEKEEPER"]>;
export type CtoOperatingMode = z.infer<typeof CtoOperatingModeSchema>;
/**
 * Tipo di stimolo in ingresso per il Cognitive Forcing Gate.
 */
export declare const WorkflowStimulusTypeSchema: z.ZodEnum<["NORMAL_SPRINT", "ANOMALY_OR_BUG"]>;
export type WorkflowStimulusType = z.infer<typeof WorkflowStimulusTypeSchema>;
/**
 * Dossier strutturato di Root Cause Analysis (RCA) richiesto obbligatoriamente
 * dal Cognitive Forcing Gate prima di passare da un'anomalia/bug a MODE_4_BUILD_GATEKEEPER.
 */
export declare const RootCauseAnalysisReportSchema: z.ZodObject<{
    rcaId: z.ZodString;
    symptomDescription: z.ZodString;
    fiveWhys: z.ZodArray<z.ZodString, "many">;
    rootCause: z.ZodString;
    systemicPrinciple: z.ZodString;
    affectedDomains: z.ZodArray<z.ZodString, "many">;
    consultedSpecialists: z.ZodArray<z.ZodString, "many">;
    redTeamRisks: z.ZodArray<z.ZodString, "many">;
    proposedActionPlan: z.ZodArray<z.ZodString, "many">;
    ceoApproved: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    rcaId: string;
    symptomDescription: string;
    fiveWhys: string[];
    rootCause: string;
    systemicPrinciple: string;
    affectedDomains: string[];
    consultedSpecialists: string[];
    redTeamRisks: string[];
    proposedActionPlan: string[];
    ceoApproved: boolean;
}, {
    rcaId: string;
    symptomDescription: string;
    fiveWhys: string[];
    rootCause: string;
    systemicPrinciple: string;
    affectedDomains: string[];
    consultedSpecialists: string[];
    redTeamRisks: string[];
    proposedActionPlan: string[];
    ceoApproved: boolean;
}>;
export type RootCauseAnalysisReport = z.infer<typeof RootCauseAnalysisReportSchema>;
/**
 * Stato persistito dal Dual-Brain Bridge in `.company-os/workflow-state.json`.
 */
export declare const WorkflowPersistedStateSchema: z.ZodObject<{
    targetPath: z.ZodString;
    activeMode: z.ZodEnum<["MODE_1_STANDUP", "MODE_2_INVESTIGATE_RCA", "MODE_3_RND_ROUNDTABLE", "MODE_4_BUILD_GATEKEEPER"]>;
    fsmState: z.ZodString;
    stimulusType: z.ZodDefault<z.ZodEnum<["NORMAL_SPRINT", "ANOMALY_OR_BUG"]>>;
    activeRcaReport: z.ZodOptional<z.ZodObject<{
        rcaId: z.ZodString;
        symptomDescription: z.ZodString;
        fiveWhys: z.ZodArray<z.ZodString, "many">;
        rootCause: z.ZodString;
        systemicPrinciple: z.ZodString;
        affectedDomains: z.ZodArray<z.ZodString, "many">;
        consultedSpecialists: z.ZodArray<z.ZodString, "many">;
        redTeamRisks: z.ZodArray<z.ZodString, "many">;
        proposedActionPlan: z.ZodArray<z.ZodString, "many">;
        ceoApproved: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        rcaId: string;
        symptomDescription: string;
        fiveWhys: string[];
        rootCause: string;
        systemicPrinciple: string;
        affectedDomains: string[];
        consultedSpecialists: string[];
        redTeamRisks: string[];
        proposedActionPlan: string[];
        ceoApproved: boolean;
    }, {
        rcaId: string;
        symptomDescription: string;
        fiveWhys: string[];
        rootCause: string;
        systemicPrinciple: string;
        affectedDomains: string[];
        consultedSpecialists: string[];
        redTeamRisks: string[];
        proposedActionPlan: string[];
        ceoApproved: boolean;
    }>>;
    lastRoutedScope: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    lastSummonedSpecialists: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    activeMode: "MODE_1_STANDUP" | "MODE_2_INVESTIGATE_RCA" | "MODE_3_RND_ROUNDTABLE" | "MODE_4_BUILD_GATEKEEPER";
    fsmState: string;
    stimulusType: "NORMAL_SPRINT" | "ANOMALY_OR_BUG";
    lastRoutedScope: string[];
    lastSummonedSpecialists: string[];
    updatedAt: string;
    activeRcaReport?: {
        rcaId: string;
        symptomDescription: string;
        fiveWhys: string[];
        rootCause: string;
        systemicPrinciple: string;
        affectedDomains: string[];
        consultedSpecialists: string[];
        redTeamRisks: string[];
        proposedActionPlan: string[];
        ceoApproved: boolean;
    } | undefined;
}, {
    targetPath: string;
    activeMode: "MODE_1_STANDUP" | "MODE_2_INVESTIGATE_RCA" | "MODE_3_RND_ROUNDTABLE" | "MODE_4_BUILD_GATEKEEPER";
    fsmState: string;
    updatedAt: string;
    stimulusType?: "NORMAL_SPRINT" | "ANOMALY_OR_BUG" | undefined;
    activeRcaReport?: {
        rcaId: string;
        symptomDescription: string;
        fiveWhys: string[];
        rootCause: string;
        systemicPrinciple: string;
        affectedDomains: string[];
        consultedSpecialists: string[];
        redTeamRisks: string[];
        proposedActionPlan: string[];
        ceoApproved: boolean;
    } | undefined;
    lastRoutedScope?: string[] | undefined;
    lastSummonedSpecialists?: string[] | undefined;
}>;
export type WorkflowPersistedState = z.infer<typeof WorkflowPersistedStateSchema>;
/**
 * I 7 Assi del Workflow Behavioral Eval Harness (`W1..W7`).
 */
export declare const WorkflowEvalAxisIdSchema: z.ZodEnum<["W1_SESSION_BOOT_AND_CTO_PERSONA", "W2_COGNITIVE_FORCING_FUNCTIONS_GATE", "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING", "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY", "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE", "W6_SELF_HOSTING_SYMMETRY", "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT"]>;
export type WorkflowEvalAxisId = z.infer<typeof WorkflowEvalAxisIdSchema>;
export declare const WorkflowEvalAxisResultSchema: z.ZodObject<{
    axisId: z.ZodEnum<["W1_SESSION_BOOT_AND_CTO_PERSONA", "W2_COGNITIVE_FORCING_FUNCTIONS_GATE", "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING", "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY", "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE", "W6_SELF_HOSTING_SYMMETRY", "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT"]>;
    title: z.ZodString;
    score: z.ZodNumber;
    passed: z.ZodBoolean;
    weight: z.ZodNumber;
    evidence: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodBoolean]>>>;
}, "strip", z.ZodTypeAny, {
    axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
    title: string;
    score: number;
    passed: boolean;
    weight: number;
    evidence: string[];
    metrics: Record<string, string | number | boolean>;
}, {
    axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
    title: string;
    score: number;
    passed: boolean;
    weight: number;
    evidence: string[];
    metrics?: Record<string, string | number | boolean> | undefined;
}>;
export type WorkflowEvalAxisResult = z.infer<typeof WorkflowEvalAxisResultSchema>;
export declare const WorkflowEvalScorecardSchema: z.ZodObject<{
    evalId: z.ZodString;
    targetPath: z.ZodString;
    evaluatedAt: z.ZodString;
    overallScore: z.ZodNumber;
    verdict: z.ZodEnum<["WORKFLOW_CERTIFIED", "NEEDS_REMEDIATION"]>;
    axes: z.ZodArray<z.ZodObject<{
        axisId: z.ZodEnum<["W1_SESSION_BOOT_AND_CTO_PERSONA", "W2_COGNITIVE_FORCING_FUNCTIONS_GATE", "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING", "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY", "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE", "W6_SELF_HOSTING_SYMMETRY", "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT"]>;
        title: z.ZodString;
        score: z.ZodNumber;
        passed: z.ZodBoolean;
        weight: z.ZodNumber;
        evidence: z.ZodArray<z.ZodString, "many">;
        metrics: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodBoolean]>>>;
    }, "strip", z.ZodTypeAny, {
        axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
    }, {
        axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics?: Record<string, string | number | boolean> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    evalId: string;
    evaluatedAt: string;
    overallScore: number;
    verdict: "WORKFLOW_CERTIFIED" | "NEEDS_REMEDIATION";
    axes: {
        axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics: Record<string, string | number | boolean>;
    }[];
}, {
    targetPath: string;
    evalId: string;
    evaluatedAt: string;
    overallScore: number;
    verdict: "WORKFLOW_CERTIFIED" | "NEEDS_REMEDIATION";
    axes: {
        axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA" | "W2_COGNITIVE_FORCING_FUNCTIONS_GATE" | "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING" | "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY" | "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE" | "W6_SELF_HOSTING_SYMMETRY" | "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT";
        title: string;
        score: number;
        passed: boolean;
        weight: number;
        evidence: string[];
        metrics?: Record<string, string | number | boolean> | undefined;
    }[];
}>;
export type WorkflowEvalScorecard = z.infer<typeof WorkflowEvalScorecardSchema>;
//# sourceMappingURL=workflow-eval.d.ts.map