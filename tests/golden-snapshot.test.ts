import { describe, it, expect } from "vitest";
import path from "node:path";
import { GoldenSnapshotHarness } from "../src/eval/golden-snapshot-harness.js";
import { GoldenSnapshotScorecardSchema } from "../src/contracts/golden-eval.js";

const GOLDENS_DIR = path.resolve(process.cwd(), "tests/goldens");

/**
 * Golden-snapshot regression wall: deterministic generated artifacts must match their committed
 * goldens byte-for-byte. If a generator changes intentionally, re-record with:
 *   GoldenSnapshotHarness.run(GOLDENS_DIR, { update: true })  (then commit the updated goldens).
 */
describe("Golden-Snapshot Evaluation", () => {
  it("every generated artifact matches its committed golden → GOLDEN_STABLE", async () => {
    const card = await GoldenSnapshotHarness.run(GOLDENS_DIR);
    expect(() => GoldenSnapshotScorecardSchema.parse(card)).not.toThrow();

    const drift = card.checks.filter((c) => c.status === "MISMATCH");
    expect(drift.map((d) => `${d.artifact}: actual ${d.actualSha.slice(0, 12)} != golden ${d.goldenSha.slice(0, 12)}`)).toEqual([]);

    // Goldens are committed, so everything should MATCH (not be freshly RECORDED).
    expect(card.recorded).toBe(0);
    expect(card.mismatched).toBe(0);
    expect(card.matched).toBe(card.totalArtifacts);
    expect(card.verdict).toBe("GOLDEN_STABLE");
    expect(card.totalArtifacts).toBe(6);
  });
});
