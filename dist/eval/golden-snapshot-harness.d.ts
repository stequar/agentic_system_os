import { type GoldenSnapshotScorecard } from "../contracts/golden-eval.js";
/**
 * Golden-Snapshot Evaluation Harness.
 *
 * Byte-compares each deterministic artifact against a committed golden under `goldensDir`.
 * A missing golden (or `update: true`) records a baseline (RECORDED). Any byte difference is a
 * MISMATCH — a real generation regression to review (or an intentional change to re-record via update).
 */
export declare class GoldenSnapshotHarness {
    static run(goldensDir: string, options?: {
        update?: boolean;
    }): Promise<GoldenSnapshotScorecard>;
}
//# sourceMappingURL=golden-snapshot-harness.d.ts.map