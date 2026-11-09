import { z } from "zod";
import { ProjectStackSchema } from "./inspector.js";
import { DoctorReportSchema } from "./doctor.js";
import { AttachResultSchema } from "./roles.js";
import { ContractSyncResultSchema } from "./sync.js";
import { DynamicMcpToolSchema } from "./frontiers.js";

/**
 * Livelli dell'ontologia organizzativa Tri-Ring (RFC-007).
 */
export const RingLevelSchema = z.enum([
  "RING_0_CORE",
  "RING_1_TECH_SPECIALIST",
  "RING_2_DOMAIN_EXPERT",
]);
export type RingLevel = z.infer<typeof RingLevelSchema>;

/**
 * Origine dello specialista sintetizzato o preservato.
 */
export const SpecialistOriginSchema = z.enum([
  "CATALOG",
  "OPEN_ENDED_SYNTHESIS",
  "PRESERVED_EXISTING",
  "SEMANTIC_MINED",
]);
export type SpecialistOrigin = z.infer<typeof SpecialistOriginSchema>;

/**
 * Definizione di uno specialista Ring-1 (Tech) o Ring-2 (Domain Expert)
 * con perimetro di file (`domainScope`), invarianti (`domainInvariants`) e `microRoleCard`.
 */
export const SynthesizedSpecialistSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(3),
  ring: RingLevelSchema,
  origin: SpecialistOriginSchema,
  boundedContext: z.string().min(3),
  domainKeywords: z.array(z.string()).default([]),
  domainScope: z.array(z.string()).default([]),
  domainInvariants: z.array(z.string()).default([]),
  microRoleCard: z.string().min(10),
  testCommand: z.string().optional(),
});
export type SynthesizedSpecialist = z.infer<typeof SynthesizedSpecialistSchema>;

/**
 * Organigramma Tri-Ring salvato in `.company-os/org-chart.json`.
 */
export const TriRingOrgChartSchema = z.object({
  targetPath: z.string(),
  generatedAt: z.string().datetime(),
  ring0CoreLeads: z.array(z.string()).min(1),
  ring1TechSpecialists: z.array(SynthesizedSpecialistSchema),
  ring2DomainExperts: z.array(SynthesizedSpecialistSchema),
});
export type TriRingOrgChart = z.infer<typeof TriRingOrgChartSchema>;

/**
 * Tipologia di disallineamento semantico rilevata tra DB SQL, Backend Python e Mobile Swift.
 */
export const SemanticDriftIssueTypeSchema = z.enum([
  "TYPE_MISMATCH",
  "MISSING_FIELD",
  "NAMING_ASYMMETRY",
  "MISSING_CODING_KEYS",
]);
export type SemanticDriftIssueType = z.infer<typeof SemanticDriftIssueTypeSchema>;

/**
 * Singola anomalia di Semantic Contract Drift.
 */
export const SemanticDriftFindingSchema = z.object({
  modelName: z.string().min(1),
  fieldName: z.string().min(1),
  issueType: SemanticDriftIssueTypeSchema,
  pythonOrSqlType: z.string().optional(),
  swiftType: z.string().optional(),
  recommendation: z.string().min(5),
});
export type SemanticDriftFinding = z.infer<typeof SemanticDriftFindingSchema>;

/**
 * Report completo del Semantic Drift Detector (TCK-17.5.4).
 */
export const SemanticDriftReportSchema = z.object({
  targetPath: z.string(),
  hasDrift: z.boolean(),
  findings: z.array(SemanticDriftFindingSchema),
  inspectedFiles: z.array(z.string()),
});
export type SemanticDriftReport = z.infer<typeof SemanticDriftReportSchema>;

/**
 * Le 5 fasi del ciclo di preparazione olistica del workspace (`P0..P4` — RFC-007).
 */
export const HolisticBootstrapPhaseSchema = z.enum([
  "P0_DEEP_RECONNAISSANCE",
  "P1_SEMANTIC_DOMAIN_MINING",
  "P2_TRI_RING_ORG_SYNTHESIS",
  "P3_HOLISTIC_TOOLING_PROVISIONING",
  "P4_INAUGURAL_ALIGNMENT_CEREMONY",
]);
export type HolisticBootstrapPhase = z.infer<typeof HolisticBootstrapPhaseSchema>;

/**
 * Report finale certificato del 5-Phase Holistic Workspace Bootstrap (`TCK-17.5.4` / `TCK-17.5.5`).
 */
export const HolisticBootstrapReportSchema = z.object({
  targetPath: z.string(),
  phasesCompleted: z.array(HolisticBootstrapPhaseSchema),
  stack: ProjectStackSchema,
  hermeticTestCommands: z.array(z.string()),
  doctorReport: DoctorReportSchema,
  orgChart: TriRingOrgChartSchema,
  attachResult: AttachResultSchema,
  driftReport: SemanticDriftReportSchema,
  contractSyncResult: ContractSyncResultSchema,
  synthesizedMcpTools: z.array(DynamicMcpToolSchema),
  invariantsPath: z.string(),
  orgChartPath: z.string(),
  contractsPath: z.string(),
  configPath: z.string(),
  ceremonyId: z.string(),
  idempotencyVerified: z.boolean(),
  completedAt: z.string().datetime(),
});
export type HolisticBootstrapReport = z.infer<typeof HolisticBootstrapReportSchema>;
