import { type ContextHealthReport, type ContextHealthStatus, type RecommendedCompactionAction } from "../contracts/health.js";
import { CompanyEventBus } from "./event-bus.js";
export declare class ContextHealthMeter {
    private static instance?;
    private lastStatus?;
    private eventBus;
    constructor(eventBus?: CompanyEventBus);
    static getInstance(): ContextHealthMeter;
    /**
     * Calcola il Context Health Score (0-100%) in base al numero di token operativi
     */
    static computeHealthScore(currentTokens: number, compactionThreshold?: number, criticalThreshold?: number): {
        score: number;
        status: ContextHealthStatus;
        recommendedAction: RecommendedCompactionAction;
        message: string;
    };
    /**
     * Genera il report dello stato di salute del contesto
     */
    getReport(currentTokens: number, options?: {
        compactionThreshold?: number;
        criticalThreshold?: number;
    }): ContextHealthReport;
    /**
     * Valuta lo stato di salute ed emette proattivamente eventi di allarme sul bus se si entra in ROT_RISK o CRITICAL_ROT
     */
    evaluateAndAlert(currentTokens: number, options?: {
        compactionThreshold?: number;
        criticalThreshold?: number;
    }): Promise<ContextHealthReport>;
    reset(): void;
}
//# sourceMappingURL=context-health.d.ts.map