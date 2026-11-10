import { z } from "zod";

export const OneOnOneInterviewSchema = z.object({
  id: z.string().describe("Identificativo dell'intervista (es. 1ON1-2026-BACKEND)"),
  interviewerRole: z.string().default("rnd_lead"),
  intervieweeRole: z.string().describe("Ruolo del Domain Lead intervistato"),
  date: z.string().datetime().default(() => new Date().toISOString()),
  painPoints: z.array(z.string()).min(1).describe("Attriti operativi e colli di bottiglia riscontrati"),
  technicalDebt: z.array(z.string()).default([]).describe("Debito tecnico o fragilità architetturali"),
  featureRequests: z.array(z.string()).default([]).describe("Strumenti o funzionalità desiderate"),
  visionAndAspirations: z.string().describe("Visione e aspirazioni a lungo termine del team"),
  summary: z.string().describe("Sintesi dell'allineamento 1:1"),
});

export const ManagerFeedbackSchema = z.object({
  managerRole: z.string().describe("Ruolo del Lead che esprime il feedback"),
  topicId: z.string().describe("ID del punto di discussione nell'RFC"),
  opinion: z.string().describe("Opinione sul punto proposto dagli altri team"),
  concerns: z.array(z.string()).default([]).describe("Criticità o impatti negativi sollevati"),
  proposedTradeOffs: z.array(z.string()).default([]).describe("Compromessi o soluzioni alternative suggerite"),
  approvalStatus: z.enum(["APPROVED", "CONCERNS_RAISED", "BLOCKING"]),
});

export const RfcTopicSchema = z.object({
  id: z.string().describe("Identificativo univoco del topic (es. TOPIC-1)"),
  title: z.string().min(5),
  originatingInterviews: z.array(z.string()).default([]).describe("ID delle interviste da cui è emersa la necessità"),
  problemStatement: z.string().min(10),
  proposedSolution: z.string().min(10),
  managerFeedbacks: z.array(ManagerFeedbackSchema).default([]),
  consensusReached: z.boolean().default(false),
});

export const ConsensusRfcSchema = z.object({
  rfcId: z.string().describe("Identificativo dell'RFC (es. RFC-001)"),
  title: z.string().min(5),
  authorRole: z.string().default("rnd_lead"),
  status: z.enum([
    "DRAFT",
    "IN_CONSULTATION",
    "ROUNDTABLE_DEBATE",
    "CONSENSUS_REACHED",
    "RATIFIED_BY_CTO"
  ]).default("DRAFT"),
  sharedVision: z.string().min(20).describe("Visione condivisa risultante dal dibattito"),
  topics: z.array(RfcTopicSchema).min(1),
  resolvedTradeOffs: z.array(z.string()).default([]).describe("Elenco dei trade-off risolti durante la tavola rotonda"),
  signatures: z.array(z.object({
    role: z.string(),
    signedAt: z.string().datetime().default(() => new Date().toISOString())
  })).default([]),
  actionableBacklogTickets: z.array(z.string()).default([]).describe("Ticket proposti per i futuri sprint"),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type OneOnOneInterview = z.infer<typeof OneOnOneInterviewSchema>;
export type ManagerFeedback = z.infer<typeof ManagerFeedbackSchema>;
export type RfcTopic = z.infer<typeof RfcTopicSchema>;
export type ConsensusRfc = z.infer<typeof ConsensusRfcSchema>;
