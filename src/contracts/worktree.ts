import { z } from "zod";

export const WorktreeStatusSchema = z.enum([
  "ACTIVE",
  "COMMITTED",
  "REBASED",
  "CLEANED_UP",
]);
export type WorktreeStatus = z.infer<typeof WorktreeStatusSchema>;

export const WorktreeSessionSchema = z.object({
  worktreeId: z.string().describe("Identificativo univoco della sessione worktree"),
  agentId: z.string().describe("Identificativo dell'agente assegnatario (es. leaf-dev-1)"),
  ticketId: z.string().describe("Identificativo del ticket (es. TCK-8.3)"),
  branchName: z.string().describe("Nome del branch associato al worktree (es. feat/tck-8.3-worktree)"),
  worktreePath: z.string().describe("Percorso assoluto del worktree su disco"),
  baseBranch: z.string().default("main").describe("Branch di partenza"),
  createdAt: z.string().datetime(),
  status: WorktreeStatusSchema.default("ACTIVE"),
});
export type WorktreeSession = z.infer<typeof WorktreeSessionSchema>;

export const WorktreePoolStatusSchema = z.object({
  activeWorktrees: z.array(WorktreeSessionSchema).default([]),
  maxConcurrent: z.number().int().positive().default(4),
  poolDir: z.string(),
  totalCreated: z.number().int().nonnegative().default(0),
});
export type WorktreePoolStatus = z.infer<typeof WorktreePoolStatusSchema>;
