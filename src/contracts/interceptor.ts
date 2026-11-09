import { z } from "zod";

/**
 * Singola violazione sintattica o semantica rilevata dall'interceptor.
 */
export const DiagnosticViolationDetailSchema = z.object({
  path: z.string().describe("Percorso della proprietà non conforme (es. payload.user.id)"),
  code: z.string().describe("Codice di errore Zod (es. invalid_type, unrecognized_keys)"),
  message: z.string().describe("Descrizione dettagliata dell'errore"),
  expected: z.string().optional().describe("Tipo o formato atteso"),
  received: z.string().optional().describe("Valore o tipo ricevuto"),
});
export type DiagnosticViolationDetail = z.infer<typeof DiagnosticViolationDetailSchema>;

/**
 * Evento emesso quando viene rilevata una violazione contrattuale a runtime.
 */
export const ContractViolationEventSchema = z.object({
  contractName: z.string().describe("Nome dello schema Zod violato"),
  actionOrTransition: z.string().describe("Transizione FSM o azione dell'agente intercettata"),
  violations: z.array(DiagnosticViolationDetailSchema).min(1),
  syntheticDiagnostic: z.string().describe("Diagnostica sintetica per il recupero rapido dell'agente"),
  rawPayload: z.any().describe("Payload grezzo che ha innescato la violazione"),
  sourceAgent: z.string().optional().describe("Agente mittente della chiamata non conforme"),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});
export type ContractViolationEvent = z.infer<typeof ContractViolationEventSchema>;

/**
 * Risultato della validazione runtime eseguita dall'interceptor.
 */
export const InterceptedResultSchema = z.object({
  valid: z.boolean(),
  contractName: z.string(),
  durationMs: z.number().nonnegative(),
  errorSummary: z.string().optional(),
  violations: z.array(DiagnosticViolationDetailSchema).default([]),
});
export type InterceptedResult = z.infer<typeof InterceptedResultSchema>;
