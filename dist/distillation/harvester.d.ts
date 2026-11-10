import { type SlmDistillationTrace } from "../contracts/frontiers.js";
export type SpecializedSlmDomain = SlmDistillationTrace["specializedDomain"];
export type QuantizationFormat = SlmDistillationTrace["quantizationFormat"];
export interface CandidateTrajectoryEpisode {
    episodeId: string;
    domain: SpecializedSlmDomain;
    instruction: string;
    inputContext: string;
    verifiedOutput: string;
    gatekeeperPassed: boolean;
    selfHealingRetries: number;
    merkleSignatureValid: boolean;
    teacherModel?: string;
}
export interface HarvestTrajectoriesOptions {
    targetPath: string;
    specializedDomain: SpecializedSlmDomain;
    sourceTeacherModel?: string;
    targetStudentModel?: string;
    quantizationFormat?: QuantizationFormat;
    candidateEpisodes?: CandidateTrajectoryEpisode[];
    averageInferenceLatencyMs?: number;
}
export interface HarvestTrajectoriesResult {
    trace: SlmDistillationTrace;
    acceptedEpisodes: CandidateTrajectoryEpisode[];
    rejectedEpisodesCount: number;
    datasetJsonl: string;
}
/**
 * Filtra le traiettorie candidate conservando esclusivamente quelle con
 * First-Pass Yield (FPY) = 100% (gatekeeperPassed === true, selfHealingRetries === 0,
 * merkleSignatureValid === true) per prevenire il Model Collapse dell'SLM locale.
 */
export declare function filterHighFpyEpisodes(episodes: CandidateTrajectoryEpisode[], domain?: SpecializedSlmDomain): {
    accepted: CandidateTrajectoryEpisode[];
    rejectedCount: number;
};
/**
 * Converte gli episodi distillati ad alto FPY in formato JSONL standard
 * per fine-tuning LoRA (MLX / Unsloth) o few-shot in-context cache.
 */
export declare function exportDistilledDatasetJsonl(episodes: CandidateTrajectoryEpisode[]): string;
/**
 * Estrae dal log Merkle (.company-os/audit.jsonl) e/o da episodi forniti le traiettorie
 * a First-Pass Yield 100%, generando il dataset JSONL e il certificato SlmDistillationTrace.
 */
export declare function harvestHighFpyTrajectories(options: HarvestTrajectoriesOptions): Promise<HarvestTrajectoriesResult>;
//# sourceMappingURL=harvester.d.ts.map