import { type GatekeeperEfficacyScorecard } from "../contracts/gatekeeper-eval.js";
/**
 * Gatekeeper-Efficacy (mutation) Evaluation Harness.
 *
 * Injects known defects (mutants) that MUST be caught, and clean inputs that must NOT be
 * flagged, across the three Gatekeeper detection surfaces, then reports the real
 * true-positive / false-positive rates. Honest alternative to the fabricated chaos score.
 */
export declare class GatekeeperEfficacyHarness {
    static run(): GatekeeperEfficacyScorecard;
    /** Real toolchain output samples — the parser is the Gatekeeper's "eyes". */
    private static diagnosticParserCases;
    /** Code-risk mutants the heuristic scanner must flag with a counterexample. */
    private static heuristicScannerCases;
    /** Patch mutants the diff-guard must block. */
    private static diffGuardCases;
}
//# sourceMappingURL=gatekeeper-efficacy-harness.d.ts.map