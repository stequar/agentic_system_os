import { type DeterminismScorecard } from "../contracts/determinism-eval.js";
/**
 * Determinism / Idempotency Evaluation Harness.
 *
 * Confirms identical input yields byte-identical output, re-running attach is a no-op, and the
 * cache prefix is stable (required for prompt caching). All observations are real hashes.
 */
export declare class DeterminismEvalHarness {
    static run(): Promise<DeterminismScorecard>;
    /** Re-running attach on an already-attached repo must not change the generated artifacts. */
    private static idempotentAttach;
    /** The same generation options must produce a byte-identical prompt bundle. */
    private static deterministicGeneration;
    /** The Tier-1 cache prefix hash must be stable (prompt caching depends on it). */
    private static stableCachePrefix;
    /** graftManagedSection must be idempotent: re-grafting the same payload is a no-op. */
    private static idempotentMerge;
}
//# sourceMappingURL=determinism-eval-harness.d.ts.map