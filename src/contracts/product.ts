import { z } from "zod";

export const AcceptanceCriteriaSchema = z.object({
  id: z.string(),
  description: z.string(),
  isMandatory: z.boolean().default(true),
});

export const ProductTicketSchema = z.object({
  id: z.string().describe("Identificativo univoco del ticket (es. TCK-101)"),
  epicId: z.string().describe("ID dell'epica di riferimento (es. EPIC-1)"),
  title: z.string().min(5),
  description: z.string().min(10),
  assignedTeam: z.enum(["product", "backend", "frontend", "mobile", "ai", "qa"]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  acceptanceCriteria: z.array(AcceptanceCriteriaSchema).min(1),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});

export const EpicSchema = z.object({
  id: z.string(),
  title: z.string(),
  vision: z.string(),
  status: z.enum(["draft", "in_progress", "completed", "cancelled"]).default("draft"),
  tickets: z.array(ProductTicketSchema).default([]),
});

export type AcceptanceCriteria = z.infer<typeof AcceptanceCriteriaSchema>;
export type ProductTicket = z.infer<typeof ProductTicketSchema>;
export type Epic = z.infer<typeof EpicSchema>;
