import { type BrownfieldCorpusScorecard } from "../contracts/corpus-eval.js";
/**
 * Brownfield Corpus Evaluation Harness.
 *
 * For each fixture repo under `corpusDir` (one with a `ground-truth.json`), runs the real
 * `detectProjectStack` and scores detection RECALL against the human-labeled ground truth.
 */
export declare class BrownfieldCorpusHarness {
    static run(corpusDir: string): Promise<BrownfieldCorpusScorecard>;
}
//# sourceMappingURL=brownfield-corpus-harness.d.ts.map