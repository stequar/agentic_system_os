import {
  type ContextHealthReport,
  type ContextHealthStatus,
  type RecommendedCompactionAction,
  ContextHealthReportSchema,
} from "../contracts/health.js";
import { CompanyEventBus } from "./event-bus.js";

export class ContextHealthMeter {
  private static instance?: ContextHealthMeter;
  private lastStatus?: ContextHealthStatus;
  private eventBus: CompanyEventBus;

  constructor(eventBus?: CompanyEventBus) {
    this.eventBus = eventBus || CompanyEventBus.getInstance();
  }

  static getInstance(): ContextHealthMeter {
    if (!ContextHealthMeter.instance) {
      ContextHealthMeter.instance = new ContextHealthMeter();
    }
    return ContextHealthMeter.instance;
  }

  /**
   * Calcola il Context Health Score (0-100%) in base al numero di token operativi
   */
  static computeHealthScore(
    currentTokens: number,
    compactionThreshold: number = 40_000,
    criticalThreshold: number = 80_000
  ): {
    score: number;
    status: ContextHealthStatus;
    recommendedAction: RecommendedCompactionAction;
    message: string;
  } {
    const T = Math.max(0, currentTokens);
    const T_nom = Math.min(10_000, Math.floor(compactionThreshold / 4));
    const T_comp = compactionThreshold;
    const T_crit = criticalThreshold;

    let score: number;
    if (T <= T_nom) {
      score = 100;
    } else if (T <= T_comp) {
      score = 100 - 30 * ((T - T_nom) / (T_comp - T_nom));
    } else if (T <= T_crit) {
      score = 70 - 40 * ((T - T_comp) / (T_crit - T_comp));
    } else {
      score = Math.max(5, 30 - 25 * ((T - T_crit) / (T_crit - T_comp)));
    }

    const roundedScore = Math.round(score * 10) / 10;

    let status: ContextHealthStatus;
    let recommendedAction: RecommendedCompactionAction;
    let message: string;

    if (roundedScore >= 90) {
      status = "EXCELLENT";
      recommendedAction = "NONE";
      message = "Contesto snello, attenzione ottimale ai vincoli aziendali.";
    } else if (roundedScore >= 70) {
      status = "NOMINAL";
      recommendedAction = "MONITOR";
      message = "Contesto nominale sotto controllo; monitoraggio attivo.";
    } else if (roundedScore >= 40) {
      status = "ROT_RISK";
      recommendedAction = "COMPACT";
      message = `Soglia di compattazione superata (${T} token). Rischio degradazione attentiva, compattazione raccomandata.`;
    } else {
      status = "CRITICAL_ROT";
      recommendedAction = "FORCED_COMPACT";
      message = `Saturazione critica della finestra di contesto (${T} token). Rischio elevato di allucinazioni; compattazione forzata obbligatoria.`;
    }

    return {
      score: roundedScore,
      status,
      recommendedAction,
      message,
    };
  }

  /**
   * Genera il report dello stato di salute del contesto
   */
  getReport(
    currentTokens: number,
    options?: { compactionThreshold?: number; criticalThreshold?: number }
  ): ContextHealthReport {
    const compThreshold = options?.compactionThreshold || 40_000;
    const critThreshold = options?.criticalThreshold || 80_000;

    const { score, status, recommendedAction, message } =
      ContextHealthMeter.computeHealthScore(currentTokens, compThreshold, critThreshold);

    return ContextHealthReportSchema.parse({
      currentTokens,
      healthScore: score,
      status,
      recommendedAction,
      compactionThreshold: compThreshold,
      criticalThreshold: critThreshold,
      message,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Valuta lo stato di salute ed emette proattivamente eventi di allarme sul bus se si entra in ROT_RISK o CRITICAL_ROT
   */
  async evaluateAndAlert(
    currentTokens: number,
    options?: { compactionThreshold?: number; criticalThreshold?: number }
  ): Promise<ContextHealthReport> {
    const report = this.getReport(currentTokens, options);

    // Emette l'evento se siamo in ROT_RISK o CRITICAL_ROT e lo stato è peggiorato o cambiato
    if (
      (report.status === "ROT_RISK" || report.status === "CRITICAL_ROT") &&
      this.lastStatus !== report.status
    ) {
      this.lastStatus = report.status;
      await this.eventBus.emit({
        type: "CONTEXT_HEALTH_ALERT",
        sourceAgent: "context_health_meter",
        level: report.status === "CRITICAL_ROT" ? "critical" : "warn",
        payload: {
          currentTokens: report.currentTokens,
          healthScore: report.healthScore,
          status: report.status,
          recommendedAction: report.recommendedAction,
          message: report.message,
        },
      });
    } else if (report.status === "NOMINAL" || report.status === "EXCELLENT") {
      this.lastStatus = report.status;
    }

    return report;
  }

  reset(): void {
    this.lastStatus = undefined;
  }
}
