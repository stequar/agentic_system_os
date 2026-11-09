import { z } from "zod";

export const SessionStatusSchema = z.enum([
  "DIRTY_IN_PROGRESS",
  "COMMITTED_SAFEPOINT",
  "COMPLETED",
  "FAILED",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionTaskItemSchema = z.object({
  taskId: z.string(),
  title: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "VALIDATED", "FAILED"]),
  assignedRole: z.string(),
  updatedAt: z.string().datetime(),
});
export type SessionTaskItem = z.infer<typeof SessionTaskItemSchema>;

export const SessionSnapshotSchema = z.object({
  sessionId: z.string().describe("Identificativo univoco della sessione (UUID o slug)"),
  status: SessionStatusSchema,
  targetPath: z.string().describe("Percorso assoluto del workspace target"),
  currentFsmState: z.string().describe("Stato corrente della macchina a stati dell'OS"),
  activeTicketId: z.string().optional().describe("Ticket attualmente in lavorazione"),
  gitCommitSha: z.string().describe("Ultimo commit Git valido e sicuro"),
  diffHash: z.string().describe("Hash SHA-256 delle modifiche all'albero di lavoro"),
  taskStack: z.array(SessionTaskItemSchema).default([]),
  timestamp: z.string().datetime().describe("Data/ora ISO del checkpoint"),
  metadata: z.record(z.any()).optional(),
});
export type SessionSnapshot = z.infer<typeof SessionSnapshotSchema>;

export const SessionResumeResultSchema = z.object({
  success: z.boolean(),
  sessionId: z.string(),
  restoredFromStatus: SessionStatusSchema,
  actionTaken: z.enum(["RESUMED_CLEAN", "ROLLED_BACK_AND_RESUMED", "ALREADY_COMPLETED", "FAILED"]),
  gitCommitSha: z.string(),
  activeTicketId: z.string().optional(),
  message: z.string(),
});
export type SessionResumeResult = z.infer<typeof SessionResumeResultSchema>;
