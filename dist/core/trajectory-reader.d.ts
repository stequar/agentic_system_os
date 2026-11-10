import { type TrajectoryResponse, type TrajectoryNodeCategory } from "../contracts/studio.js";
import type { CompanyEvent } from "../contracts/events.js";
/**
 * Classifica un evento aziendale in una categoria visiva di traiettoria e ne genera un riassunto sintetico.
 */
export declare function classifyEvent(event: CompanyEvent): {
    category: TrajectoryNodeCategory;
    summary: string;
};
export interface ReadTrajectoryOptions {
    limit?: number;
    offset?: number;
    category?: TrajectoryNodeCategory;
}
export declare class TrajectoryReader {
    /**
     * Legge in modalità tail-first inversa `.company-os/audit.jsonl`
     * estraendo i nodi decisionali paginati senza caricare l'intero log in RAM.
     */
    static readTrajectory(targetPath: string, options?: ReadTrajectoryOptions): Promise<TrajectoryResponse>;
}
//# sourceMappingURL=trajectory-reader.d.ts.map