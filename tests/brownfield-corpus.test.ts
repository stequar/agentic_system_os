import { describe, it, expect } from "vitest";
import path from "node:path";
import { BrownfieldCorpusHarness } from "../src/eval/brownfield-corpus-harness.js";
import { BrownfieldCorpusScorecardSchema } from "../src/contracts/corpus-eval.js";

const CORPUS_DIR = path.resolve(process.cwd(), "tests/fixtures/corpus");

/**
 * Stack-detection quality against a synthetic corpus with human-labeled ground truth.
 * Recall is the honest signal (did detection find the correct stack elements?).
 */
describe("Brownfield Corpus Evaluation", () => {
  it("detects the correct stack on every fixture → DETECTION_ACCURATE (100% recall)", async () => {
    const card = await BrownfieldCorpusHarness.run(CORPUS_DIR);
    expect(() => BrownfieldCorpusScorecardSchema.parse(card)).not.toThrow();

    // Surface any missed detection with the exact item.
    const gaps = card.fixtures.filter((f) => !f.passed);
    expect(gaps.map((f) => `${f.fixture} missed [${f.missed.join(", ")}]`)).toEqual([]);

    expect(card.totalFixtures).toBe(6);
    expect(card.recallPct).toBe(100);
    expect(card.verdict).toBe("DETECTION_ACCURATE");
  });
});
