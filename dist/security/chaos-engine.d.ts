import { type ChaosFaultInjection } from "../contracts/frontiers.js";
export type ChaosFaultType = ChaosFaultInjection["faultType"];
export interface ChaosExperimentRequest {
    faultType: ChaosFaultType;
    targetSubsystem?: string;
    simulateContainmentBreach?: boolean;
}
export interface ChaosCampaignReport {
    campaignId: string;
    overallResilienceScore: number;
    allContained: boolean;
    warRoomActivationsCount: number;
    experiments: ChaosFaultInjection[];
    completedAt: string;
}
/**
 * Calcola il punteggio deterministico di antifragilità (0-100):
 * - Se containmentSuccess === false -> 0 immediato.
 * - Altrimenti: 70 base + fino a 15 punti per detectionTimeMs (<=50ms) + fino a 15 punti per recoveryTimeMs (<=100ms).
 */
export declare function calculateResilienceScore(params: {
    containmentSuccess: boolean;
    detectionTimeMs: number;
    recoveryTimeMs: number;
}): number;
/**
 * Esegue un singolo esperimento di Chaos Engineering in un'arena effimera isolata (os.tmpdir()),
 * garantendo impatto zero sul repository reale e restituendo un certificato ChaosFaultInjection.
 */
export declare function runChaosExperiment(request: ChaosExperimentRequest): Promise<ChaosFaultInjection>;
/**
 * Esegue l'intera campagna antifragile su tutti i 6 vettori di Chaos Engineering.
 */
export declare function runFullChaosCampaign(options?: {
    faultTypes?: ChaosFaultType[];
}): Promise<ChaosCampaignReport>;
//# sourceMappingURL=chaos-engine.d.ts.map