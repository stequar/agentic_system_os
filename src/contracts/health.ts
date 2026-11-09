import { z } from "zod";

/**
 * Livelli dello stato di salute del contesto (Context Health)
 */
export const ContextHealthStatusSchema = z.enum([
  "EXCELLENT",     // 90% - 100%: memoria fresca, attenzione ottimale
  "NOMINAL",       // 70% - 89%: esecuzione standard sotto controllo
  "ROT_RISK",      // 40% - 69%: superata soglia di attenzione (40k token), rischio amnesia
  "CRITICAL_ROT",  // < 40%: rischio critico di allucinazione, compattazione obbligatoria
]);
export type ContextHealthStatus = z.infer<typeof ContextHealthStatusSchema>;

/**
 * Azione raccomandata dall'Anti-Rot Memory Core
 */
export const RecommendedCompactionActionSchema = z.enum([
  "NONE",            // Nessun intervento richiesto
  "MONITOR",         // Monitoraggio attivo
  "COMPACT",         // Compattazione raccomandata
  "FORCED_COMPACT",  // Compattazione forzata immediata
]);
export type RecommendedCompactionAction = z.infer<typeof RecommendedCompactionActionSchema>;

/**
 * Report dello stato di salute della finestra di contesto
 */
export const ContextHealthReportSchema = z.object({
  currentTokens: z.number().int().nonnegative(),
  healthScore: z.number().min(0).max(100).describe("Punteggio di salute da 0 (saturazione critica) a 100 (ottimale)"),
  status: ContextHealthStatusSchema,
  recommendedAction: RecommendedCompactionActionSchema,
  compactionThreshold: z.number().int().positive().default(40_000),
  criticalThreshold: z.number().int().positive().default(80_000),
  message: z.string(),
  updatedAt: z.string().datetime(),
});
export type ContextHealthReport = z.infer<typeof ContextHealthReportSchema>;
