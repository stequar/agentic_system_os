import { z } from "zod";
/**
 * Tipi di cerimonie agili native integrate nel ciclo di vita di Agentic Company OS.
 */
export declare const AgileCeremonyTypeSchema: z.ZodEnum<["BRAINSTORMING_KICKOFF", "BACKLOG_REFINEMENT_1ON1", "ARCHITECTURE_REVIEW_ROUNDTABLE", "INCIDENT_WAR_ROOM", "SPRINT_RETROSPECTIVE"]>;
export type AgileCeremonyType = z.infer<typeof AgileCeremonyTypeSchema>;
/**
 * Stato di avanzamento di una cerimonia agile.
 */
export declare const CeremonyStatusSchema: z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "CONCLUDED", "ESCALATED_TO_CTO"]>;
export type CeremonyStatus = z.infer<typeof CeremonyStatusSchema>;
/**
 * Schema generale per la registrazione e tracciamento di una cerimonia agile.
 */
export declare const AgileCeremonySchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["BRAINSTORMING_KICKOFF", "BACKLOG_REFINEMENT_1ON1", "ARCHITECTURE_REVIEW_ROUNDTABLE", "INCIDENT_WAR_ROOM", "SPRINT_RETROSPECTIVE"]>;
    chairRole: z.ZodString;
    attendeeRoles: z.ZodArray<z.ZodString, "many">;
    status: z.ZodDefault<z.ZodEnum<["SCHEDULED", "IN_PROGRESS", "CONCLUDED", "ESCALATED_TO_CTO"]>>;
    inputArtifactUri: z.ZodOptional<z.ZodString>;
    outputArtifactUri: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodDefault<z.ZodString>;
    concludedAt: z.ZodOptional<z.ZodString>;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "BRAINSTORMING_KICKOFF" | "BACKLOG_REFINEMENT_1ON1" | "ARCHITECTURE_REVIEW_ROUNDTABLE" | "INCIDENT_WAR_ROOM" | "SPRINT_RETROSPECTIVE";
    status: "IN_PROGRESS" | "SCHEDULED" | "CONCLUDED" | "ESCALATED_TO_CTO";
    id: string;
    summary: string;
    chairRole: string;
    attendeeRoles: string[];
    startedAt: string;
    inputArtifactUri?: string | undefined;
    outputArtifactUri?: string | undefined;
    concludedAt?: string | undefined;
}, {
    type: "BRAINSTORMING_KICKOFF" | "BACKLOG_REFINEMENT_1ON1" | "ARCHITECTURE_REVIEW_ROUNDTABLE" | "INCIDENT_WAR_ROOM" | "SPRINT_RETROSPECTIVE";
    id: string;
    summary: string;
    chairRole: string;
    attendeeRoles: string[];
    status?: "IN_PROGRESS" | "SCHEDULED" | "CONCLUDED" | "ESCALATED_TO_CTO" | undefined;
    inputArtifactUri?: string | undefined;
    outputArtifactUri?: string | undefined;
    startedAt?: string | undefined;
    concludedAt?: string | undefined;
}>;
export type AgileCeremony = z.infer<typeof AgileCeremonySchema>;
/**
 * Trigger per l'apertura immediata di una Incident War Room d'emergenza.
 */
export declare const WarRoomTriggerSchema: z.ZodEnum<["SELF_HEALING_EXHAUSTED", "SECURITY_VIOLATION", "CRITICAL_SECURITY_CVE", "CRITICAL_REGRESSION", "DIFF_GUARD_VIOLATION", "MANUAL_CTO_OVERRIDE"]>;
export type WarRoomTrigger = z.infer<typeof WarRoomTriggerSchema>;
/**
 * Schema per gli incidenti gestiti nella War Room (Emergency Circuit Breaker).
 */
export declare const WarRoomIncidentSchema: z.ZodObject<{
    incidentId: z.ZodString;
    trigger: z.ZodEnum<["SELF_HEALING_EXHAUSTED", "SECURITY_VIOLATION", "CRITICAL_SECURITY_CVE", "CRITICAL_REGRESSION", "DIFF_GUARD_VIOLATION", "MANUAL_CTO_OVERRIDE"]>;
    severity: z.ZodEnum<["HIGH", "CRITICAL"]>;
    targetTicketId: z.ZodString;
    affectedFiles: z.ZodArray<z.ZodString, "many">;
    rootCause: z.ZodString;
    rollbackSnapshotSha256: z.ZodString;
    containmentAction: z.ZodString;
    remediationPlan: z.ZodString;
    resolvedByRole: z.ZodDefault<z.ZodString>;
    resolvedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rootCause: string;
    severity: "HIGH" | "CRITICAL";
    incidentId: string;
    trigger: "DIFF_GUARD_VIOLATION" | "SELF_HEALING_EXHAUSTED" | "SECURITY_VIOLATION" | "CRITICAL_SECURITY_CVE" | "CRITICAL_REGRESSION" | "MANUAL_CTO_OVERRIDE";
    targetTicketId: string;
    affectedFiles: string[];
    rollbackSnapshotSha256: string;
    containmentAction: string;
    remediationPlan: string;
    resolvedByRole: string;
    resolvedAt: string;
}, {
    rootCause: string;
    severity: "HIGH" | "CRITICAL";
    incidentId: string;
    trigger: "DIFF_GUARD_VIOLATION" | "SELF_HEALING_EXHAUSTED" | "SECURITY_VIOLATION" | "CRITICAL_SECURITY_CVE" | "CRITICAL_REGRESSION" | "MANUAL_CTO_OVERRIDE";
    targetTicketId: string;
    affectedFiles: string[];
    rollbackSnapshotSha256: string;
    containmentAction: string;
    remediationPlan: string;
    resolvedByRole?: string | undefined;
    resolvedAt?: string | undefined;
}>;
export type WarRoomIncident = z.infer<typeof WarRoomIncidentSchema>;
/**
 * Metriche e action items della Sprint Retrospective.
 */
export declare const SprintRetrospectiveSchema: z.ZodObject<{
    sprintId: z.ZodString;
    fpyPercentage: z.ZodNumber;
    totalSelfHealingCycles: z.ZodNumber;
    tokenCostUsd: z.ZodNumber;
    cacheHitRatePercentage: z.ZodNumber;
    bottlenecksIdentified: z.ZodArray<z.ZodString, "many">;
    technicalDebtTickets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    actionItems: z.ZodArray<z.ZodString, "many">;
    moderatorRole: z.ZodDefault<z.ZodString>;
    concludedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tokenCostUsd: number;
    concludedAt: string;
    sprintId: string;
    fpyPercentage: number;
    totalSelfHealingCycles: number;
    cacheHitRatePercentage: number;
    bottlenecksIdentified: string[];
    technicalDebtTickets: string[];
    actionItems: string[];
    moderatorRole: string;
}, {
    tokenCostUsd: number;
    sprintId: string;
    fpyPercentage: number;
    totalSelfHealingCycles: number;
    cacheHitRatePercentage: number;
    bottlenecksIdentified: string[];
    actionItems: string[];
    concludedAt?: string | undefined;
    technicalDebtTickets?: string[] | undefined;
    moderatorRole?: string | undefined;
}>;
export type SprintRetrospective = z.infer<typeof SprintRetrospectiveSchema>;
/**
 * Feedback strutturato del Devil's Advocate / Red-Teamer per evitare echo-chambers.
 */
export declare const DevilsAdvocateFeedbackSchema: z.ZodObject<{
    redTeamerRole: z.ZodString;
    targetProposalId: z.ZodString;
    identifiedFallacies: z.ZodArray<z.ZodObject<{
        category: z.ZodEnum<["ARCHITECTURAL", "SECURITY", "FINANCIAL_TOKEN", "OPERATIONAL_COMPLEXITY"]>;
        description: z.ZodString;
        worstCaseScenario: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: "ARCHITECTURAL" | "SECURITY" | "FINANCIAL_TOKEN" | "OPERATIONAL_COMPLEXITY";
        worstCaseScenario: string;
    }, {
        description: string;
        category: "ARCHITECTURAL" | "SECURITY" | "FINANCIAL_TOKEN" | "OPERATIONAL_COMPLEXITY";
        worstCaseScenario: string;
    }>, "many">;
    stressTestConditions: z.ZodArray<z.ZodString, "many">;
    proposedCounterMeasures: z.ZodArray<z.ZodString, "many">;
    verdict: z.ZodEnum<["CHALLENGES_RAISED", "MITIGATION_ACCEPTED", "UNRESOLVED_BLOCKER"]>;
    submittedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    verdict: "CHALLENGES_RAISED" | "MITIGATION_ACCEPTED" | "UNRESOLVED_BLOCKER";
    redTeamerRole: string;
    targetProposalId: string;
    identifiedFallacies: {
        description: string;
        category: "ARCHITECTURAL" | "SECURITY" | "FINANCIAL_TOKEN" | "OPERATIONAL_COMPLEXITY";
        worstCaseScenario: string;
    }[];
    stressTestConditions: string[];
    proposedCounterMeasures: string[];
    submittedAt: string;
}, {
    verdict: "CHALLENGES_RAISED" | "MITIGATION_ACCEPTED" | "UNRESOLVED_BLOCKER";
    redTeamerRole: string;
    targetProposalId: string;
    identifiedFallacies: {
        description: string;
        category: "ARCHITECTURAL" | "SECURITY" | "FINANCIAL_TOKEN" | "OPERATIONAL_COMPLEXITY";
        worstCaseScenario: string;
    }[];
    stressTestConditions: string[];
    proposedCounterMeasures: string[];
    submittedAt?: string | undefined;
}>;
export type DevilsAdvocateFeedback = z.infer<typeof DevilsAdvocateFeedbackSchema>;
/**
 * Protocollo di convergenza delle Roundtable (Max 2 Round + CTO Tie-Break).
 */
export declare const RoundtableConvergenceSchema: z.ZodObject<{
    roundtableId: z.ZodString;
    currentRound: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    maxRounds: z.ZodDefault<z.ZodLiteral<2>>;
    status: z.ZodEnum<["ROUND_1_DEBATE", "ROUND_2_TRADE_OFFS", "CONSENSUS_REACHED", "TIE_BREAK_INVOKED"]>;
    redTeamChallenged: z.ZodDefault<z.ZodBoolean>;
    tieBreakDecision: z.ZodOptional<z.ZodString>;
    decidedByRole: z.ZodOptional<z.ZodString>;
    escalatedToCeo: z.ZodDefault<z.ZodBoolean>;
    resolvedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "CONSENSUS_REACHED" | "TIE_BREAK_INVOKED" | "ROUND_1_DEBATE" | "ROUND_2_TRADE_OFFS";
    resolvedAt: string;
    roundtableId: string;
    currentRound: 1 | 2;
    maxRounds: 2;
    redTeamChallenged: boolean;
    escalatedToCeo: boolean;
    tieBreakDecision?: string | undefined;
    decidedByRole?: string | undefined;
}, {
    status: "CONSENSUS_REACHED" | "TIE_BREAK_INVOKED" | "ROUND_1_DEBATE" | "ROUND_2_TRADE_OFFS";
    roundtableId: string;
    currentRound: 1 | 2;
    resolvedAt?: string | undefined;
    maxRounds?: 2 | undefined;
    redTeamChallenged?: boolean | undefined;
    tieBreakDecision?: string | undefined;
    decidedByRole?: string | undefined;
    escalatedToCeo?: boolean | undefined;
}>;
export type RoundtableConvergence = z.infer<typeof RoundtableConvergenceSchema>;
/**
 * Protocollo telegrafico inter-agente (Caveman-RPC / Typed Payload) per azzerare il token bloat.
 */
export declare const TelegraphicMessageSchema: z.ZodObject<{
    senderRole: z.ZodString;
    recipientRole: z.ZodString;
    actionCode: z.ZodString;
    targetFiles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    zeroFluff: z.ZodLiteral<true>;
    timestamp: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    payload: Record<string, any>;
    senderRole: string;
    recipientRole: string;
    actionCode: string;
    targetFiles: string[];
    constraints: string[];
    zeroFluff: true;
}, {
    senderRole: string;
    recipientRole: string;
    actionCode: string;
    zeroFluff: true;
    timestamp?: string | undefined;
    payload?: Record<string, any> | undefined;
    targetFiles?: string[] | undefined;
    constraints?: string[] | undefined;
}>;
export type TelegraphicMessage = z.infer<typeof TelegraphicMessageSchema>;
//# sourceMappingURL=ceremonies.d.ts.map