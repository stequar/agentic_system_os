import { type SafetyEvalScorecard } from "../contracts/safety-eval.js";
/**
 * Safety / Destructiveness Evaluation Harness.
 *
 * Exercises the OS's destructive-capable flows with ADVERSARIAL input on throwaway repos
 * and verifies the P0/governance safety invariants hold by OBSERVING the real filesystem/git.
 * This is the adoption gate: a repo is only "safe to run on" once this passes.
 */
export declare class SafetyEvalHarness {
    static run(): Promise<SafetyEvalScorecard>;
    /** Malicious branch/base names must be rejected and must NOT execute a shell command. */
    private static shellInjectionRejected;
    /** Resuming a DIRTY session must back up uncommitted work recoverably, never destroy it. */
    private static dirtyResumePreservesWork;
    /** A rollback to a non-existent commit must report FAILURE, not fake success. */
    private static failedRollbackReportsHonestly;
    /** The diff guard must block out-of-scope writes and test/assertion removal. */
    private static outOfScopeAndTestDeletionBlocked;
    /** Attach must preserve 100% of pre-existing user content (non-destructive). */
    private static nonDestructiveAttach;
    /** The dynamic-tool guard must reject known exploit classes and allow benign code. */
    private static sandboxGuardFailsClosed;
}
//# sourceMappingURL=safety-eval-harness.d.ts.map