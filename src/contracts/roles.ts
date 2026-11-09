import { z } from "zod";
import { ProjectStackSchema } from "./inspector.js";

export const GeneratedRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(["L2", "L3"]),
  description: z.string(),
  systemPrompt: z.string().min(20),
  recommendedTestCommand: z.string().optional(),
  targetLanguages: z.array(z.string()).default([]),
  targetFrameworks: z.array(z.string()).default([]),
  enableSubagents: z.boolean().default(false),
  enableWriteTools: z.boolean().default(true),
});

export const TeamConfigurationSchema = z.object({
  targetPath: z.string(),
  stack: ProjectStackSchema,
  roles: z.array(GeneratedRoleSchema).min(1),
  renderedAgentsMarkdown: z.string().min(50),
  generatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export const InjectedFileResultSchema = z.object({
  path: z.string(),
  status: z.enum(["CREATED", "OVERWRITTEN", "SKIPPED_UNCHANGED", "BACKED_UP_AND_OVERWRITTEN"]),
  backupPath: z.string().optional(),
  sha256: z.string(),
});

export const AttachResultSchema = z.object({
  targetPath: z.string(),
  success: z.boolean(),
  injectedFiles: z.array(InjectedFileResultSchema),
  summary: z.string(),
  attachedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export const AttachOptionsSchema = z.object({
  force: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  backup: z.boolean().default(true),
  backupExtension: z.string().default(".bak"),
});

export type GeneratedRole = z.infer<typeof GeneratedRoleSchema>;
export type TeamConfiguration = z.infer<typeof TeamConfigurationSchema>;
export type InjectedFileResult = z.infer<typeof InjectedFileResultSchema>;
export type AttachResult = z.infer<typeof AttachResultSchema>;
export type AttachOptions = z.infer<typeof AttachOptionsSchema>;

export const RoleCategorySchema = z.enum([
  "CORE_LEAD",
  "DYNAMIC_DOMAIN_LEAD",
  "LEAF_DEVELOPER",
  "EXECUTIVE",
]);

export const RoleDefinitionSchema = z.object({
  id: z.string().describe("Identificativo univoco del ruolo (es. engineering_lead, mobile_manager)"),
  name: z.string().describe("Nome human-readable del ruolo"),
  level: z.enum(["L1", "L2", "L3"]).describe("Livello gerarchico (L1: Exec, L2: Lead, L3: Leaf)"),
  category: RoleCategorySchema.describe("Categoria del ruolo"),
  description: z.string().describe("Missione ed ambito operativo del ruolo"),
  spikeDomain: z.string().optional().describe("Dominio specialistico per spike e validazioni"),
  enableSubagentTools: z.boolean().describe("Permesso di creare o delegare a sub-agenti"),
  enableWriteTools: z.boolean().describe("Permesso di modificare file su disco e lanciare comandi"),
  microRoleCard: z.string().describe("Definizione compatta Tier-2 (<150 token)"),
  cognitiveBoundary: z.string().describe("Confini cognitivi e responsabilità esclusive"),
  delegationScope: z.array(z.string()).default([]).describe("Sub-ruoli delegabili"),
});

export const RoleTaxonomySchema = z.object({
  version: z.string().default("1.0.0"),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
  coreLeads: z.array(RoleDefinitionSchema).min(5),
  dynamicDomainLeads: z.array(RoleDefinitionSchema).min(4),
  leafDevelopers: z.array(RoleDefinitionSchema).min(1),
  summary: z.string(),
});

export const RaciRoleAssignmentSchema = z.enum(["R", "A", "C", "I", "-"]);

export const RaciPhaseRowSchema = z.object({
  phase: z.enum([
    "SPIKE_VALIDATION",
    "BACKLOG_REFINEMENT",
    "CODE_IMPLEMENTATION",
    "GATEKEEPER_VERIFICATION",
    "SELF_HEALING",
    "SECURITY_AUDIT",
    "FINOPS_GOVERNANCE",
    "RELEASE_APPROVAL",
  ]),
  accountable: z.string().describe("Ruolo Accountable (deve essere unico per fase)"),
  responsible: z.array(z.string()).min(1).describe("Ruoli Responsible che eseguono"),
  consulted: z.array(z.string()).default([]).describe("Ruoli Consulted da consultare"),
  informed: z.array(z.string()).default([]).describe("Ruoli Informed da notificare"),
  description: z.string().describe("Descrizione delle aspettative della fase"),
});

export const RaciMatrixSchema = z.object({
  matrixId: z.string().default("RACI-AGENTIC-OS-v1"),
  version: z.string().default("1.0.0"),
  phases: z.array(RaciPhaseRowSchema).min(8),
  rules: z.array(z.string()).default([]),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type RoleCategory = z.infer<typeof RoleCategorySchema>;
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;
export type RoleTaxonomy = z.infer<typeof RoleTaxonomySchema>;
export type RaciPhaseRow = z.infer<typeof RaciPhaseRowSchema>;
export type RaciMatrix = z.infer<typeof RaciMatrixSchema>;

