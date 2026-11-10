import { z } from "zod";

/**
 * Tipi di cerimonie agili native integrate nel ciclo di vita di Agentic Company OS.
 */
export const AgileCeremonyTypeSchema = z.enum([
  "BRAINSTORMING_KICKOFF",
  "BACKLOG_REFINEMENT_1ON1",
  "ARCHITECTURE_REVIEW_ROUNDTABLE",
  "INCIDENT_WAR_ROOM",
  "SPRINT_RETROSPECTIVE",
]);
export type AgileCeremonyType = z.infer<typeof AgileCeremonyTypeSchema>;

/**
 * Stato di avanzamento di una cerimonia agile.
 */
export const CeremonyStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "CONCLUDED",
  "ESCALATED_TO_CTO",
]);
export type CeremonyStatus = z.infer<typeof CeremonyStatusSchema>;

/**
 * Schema generale per la registrazione e tracciamento di una cerimonia agile.
 */
export const AgileCeremonySchema = z.object({
  id: z.string().describe("Identificativo univoco della cerimonia (es. CEREMONY-2026-WARROOM-01)"),
  type: AgileCeremonyTypeSchema,
  chairRole: z.string().describe("Ruolo del Lead che convoca e modera la cerimonia"),
  attendeeRoles: z.array(z.string()).min(1).describe("Ruoli dei partecipanti obbligatori"),
  status: CeremonyStatusSchema.default("SCHEDULED"),
  inputArtifactUri: z.string().optional().describe("URI del documento o evento di innesco"),
  outputArtifactUri: z.string().optional().describe("URI del verbale o deliverable prodotto"),
  startedAt: z.string().datetime().default(() => new Date().toISOString()),
  concludedAt: z.string().datetime().optional(),
  summary: z.string().min(10).describe("Sintesi delle decisioni prese nella cerimonia"),
});
export type AgileCeremony = z.infer<typeof AgileCeremonySchema>;

/**
 * Trigger per l'apertura immediata di una Incident War Room d'emergenza.
 */
export const WarRoomTriggerSchema = z.enum([
  "SELF_HEALING_EXHAUSTED",
  "SECURITY_VIOLATION",
  "CRITICAL_SECURITY_CVE",
  "CRITICAL_REGRESSION",
  "DIFF_GUARD_VIOLATION",
  "MANUAL_CTO_OVERRIDE",
]);
export type WarRoomTrigger = z.infer<typeof WarRoomTriggerSchema>;

/**
 * Schema per gli incidenti gestiti nella War Room (Emergency Circuit Breaker).
 */
export const WarRoomIncidentSchema = z.object({
  incidentId: z.string().describe("ID dell'incidente (es. INC-2026-HEALING-FAIL-01)"),
  trigger: WarRoomTriggerSchema,
  severity: z.enum(["HIGH", "CRITICAL"]),
  targetTicketId: z.string().describe("Ticket su cui si è verificato l'incidente"),
  affectedFiles: z.array(z.string()).min(1).describe("File coinvolti nel fallimento"),
  rootCause: z.string().min(10).describe("Diagnosi semantica della causa radice"),
  rollbackSnapshotSha256: z.string().describe("SHA-256 dello snapshot ripristinato"),
  containmentAction: z.string().min(10).describe("Azione immediata di isolamento eseguita"),
  remediationPlan: z.string().min(10).describe("Piano di correzione o riassegnazione"),
  resolvedByRole: z.string().default("qa_lead"),
  resolvedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type WarRoomIncident = z.infer<typeof WarRoomIncidentSchema>;

/**
 * Metriche e action items della Sprint Retrospective.
 */
export const SprintRetrospectiveSchema = z.object({
  sprintId: z.string().describe("ID dello sprint analizzato (es. SPRINT-13)"),
  fpyPercentage: z.number().min(0).max(100).describe("First-Pass Yield percentuale dello sprint"),
  totalSelfHealingCycles: z.number().int().nonnegative().describe("Numero totale di cicli di autoguarigione attivati"),
  tokenCostUsd: z.number().nonnegative().describe("Costo totale stimato in token (USD)"),
  cacheHitRatePercentage: z.number().min(0).max(100).describe("Percentuale di hit rate Tier 1 prompt caching"),
  bottlenecksIdentified: z.array(z.string()).min(1).describe("Colli di bottiglia emersi nello sprint"),
  technicalDebtTickets: z.array(z.string()).default([]).describe("Ticket di debito tecnico generati"),
  actionItems: z.array(z.string()).min(1).describe("Miglioramenti procedurali per il prossimo sprint"),
  moderatorRole: z.string().default("product_lead"),
  concludedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type SprintRetrospective = z.infer<typeof SprintRetrospectiveSchema>;

/**
 * Feedback strutturato del Devil's Advocate / Red-Teamer per evitare echo-chambers.
 */
export const DevilsAdvocateFeedbackSchema = z.object({
  redTeamerRole: z.string().describe("Ruolo del Lead designato come Devil's Advocate per la sessione"),
  targetProposalId: z.string().describe("ID dell'RFC o proposta sotto esame"),
  identifiedFallacies: z.array(z.object({
    category: z.enum(["ARCHITECTURAL", "SECURITY", "FINANCIAL_TOKEN", "OPERATIONAL_COMPLEXITY"]),
    description: z.string().min(10),
    worstCaseScenario: z.string().min(10),
  })).min(1).describe("Vulnerabilità e scenari peggiori individuati"),
  stressTestConditions: z.array(z.string()).min(1).describe("Condizioni limite da testare per validare la proposta"),
  proposedCounterMeasures: z.array(z.string()).min(1).describe("Misure di mitigazione richieste dal Red Team"),
  verdict: z.enum(["CHALLENGES_RAISED", "MITIGATION_ACCEPTED", "UNRESOLVED_BLOCKER"]),
  submittedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type DevilsAdvocateFeedback = z.infer<typeof DevilsAdvocateFeedbackSchema>;

/**
 * Protocollo di convergenza delle Roundtable (Max 2 Round + CTO Tie-Break).
 */
export const RoundtableConvergenceSchema = z.object({
  roundtableId: z.string(),
  currentRound: z.union([z.literal(1), z.literal(2)]),
  maxRounds: z.literal(2).default(2),
  status: z.enum([
    "ROUND_1_DEBATE",
    "ROUND_2_TRADE_OFFS",
    "CONSENSUS_REACHED",
    "TIE_BREAK_INVOKED",
  ]),
  redTeamChallenged: z.boolean().default(true),
  tieBreakDecision: z.string().optional().describe("Decisione d'autorità del CTO in caso di mancato consenso a fine Round 2"),
  decidedByRole: z.string().optional(),
  // GOV-1: un blocker irrisolto SENZA autorità di tie-break esplicita viene escalato al CEO,
  // NON auto-approvato. Fail-closed per impedire che un blocco diventi silenziosamente un via libera.
  escalatedToCeo: z.boolean().default(false).describe("True quando un blocker irrisolto è stato escalato al CEO senza auto-approvazione"),
  resolvedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type RoundtableConvergence = z.infer<typeof RoundtableConvergenceSchema>;

/**
 * Protocollo telegrafico inter-agente (Caveman-RPC / Typed Payload) per azzerare il token bloat.
 */
export const TelegraphicMessageSchema = z.object({
  senderRole: z.string(),
  recipientRole: z.string(),
  actionCode: z.string().describe("Codice telegrafico dell'azione (es. EXEC_AST_FIX, AUDIT_DEP, VERIFY_GATE)"),
  targetFiles: z.array(z.string()).default([]),
  payload: z.record(z.any()).default({}),
  constraints: z.array(z.string()).default([]),
  zeroFluff: z.literal(true).describe("Garantisce assenza totale di convenevoli o preamboli conversazionali"),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});
export type TelegraphicMessage = z.infer<typeof TelegraphicMessageSchema>;
