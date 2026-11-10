import { z } from "zod";

export const ResearchedToolSchema = z.object({
  name: z.string(),
  category: z.string(),
  url: z.string().optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  recommendation: z.enum(["adopt", "evaluate", "avoid"]),
  notes: z.string(),
});

export const RiskMitigationSchema = z.object({
  risk: z.string(),
  impact: z.enum(["low", "medium", "high", "critical"]),
  mitigation: z.string(),
});

export const TechValidationReportSchema = z.object({
  sprintId: z.string().describe("Identificativo dello sprint (es. SPRINT-2)"),
  sprintTheme: z.string(),
  executiveSummary: z.string(),
  proposedDecisions: z.array(z.string()).min(1),
  benchmarksAndTools: z.array(ResearchedToolSchema).default([]),
  bestPractices: z.array(z.string()).min(1),
  risksAndMitigations: z.array(RiskMitigationSchema).default([]),
  verdict: z.enum(["APPROVED", "ADJUSTMENTS_RECOMMENDED", "REJECTED"]),
  finalRecommendations: z.array(z.string()).min(1),
  sources: z.array(z.string()).default([]),
  validatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type ResearchedTool = z.infer<typeof ResearchedToolSchema>;
export type RiskMitigation = z.infer<typeof RiskMitigationSchema>;
export type TechValidationReport = z.infer<typeof TechValidationReportSchema>;
