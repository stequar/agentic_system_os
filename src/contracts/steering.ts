import { z } from "zod";

export const SteeringActionSchema = z.enum(["pause", "hint", "resume", "abort"]);
export type SteeringAction = z.infer<typeof SteeringActionSchema>;

export const SteeringStateSchema = z.enum([
  "RUNNING",
  "PAUSE_REQUESTED",
  "SAFE_PAUSED",
  "RESUMING",
  "ABORTED",
]);
export type SteeringState = z.infer<typeof SteeringStateSchema>;

export const SteeringCommandSchema = z.object({
  action: SteeringActionSchema,
  message: z.string().optional().describe("Messaggio o hint opzionale dell'operatore umano"),
  proposedPatch: z.record(z.string()).optional().describe("Patch opzionale proposta dall'operatore"),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  source: z.enum(["cli", "web-studio", "api"]).default("cli"),
});
export type SteeringCommand = z.infer<typeof SteeringCommandSchema>;

export const SteeringResultSchema = z.object({
  success: z.boolean(),
  currentState: SteeringStateSchema,
  actionApplied: SteeringActionSchema,
  message: z.string(),
  activeSafePoint: z.boolean().default(false),
  violations: z.array(z.string()).default([]),
});
export type SteeringResult = z.infer<typeof SteeringResultSchema>;
