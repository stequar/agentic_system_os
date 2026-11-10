import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { BrownfieldCorpusScorecardSchema, } from "../contracts/corpus-eval.js";
import { detectProjectStack } from "../inspector/detector.js";
const ci = (s) => s.toLowerCase().trim();
/** An expected item is "detected" if any detected token contains it (case-insensitive). */
function detected(expected, actual) {
    const e = ci(expected);
    return actual.some((a) => ci(a).includes(e));
}
/**
 * Brownfield Corpus Evaluation Harness.
 *
 * For each fixture repo under `corpusDir` (one with a `ground-truth.json`), runs the real
 * `detectProjectStack` and scores detection RECALL against the human-labeled ground truth.
 */
export class BrownfieldCorpusHarness {
    static async run(corpusDir) {
        const fixtures = [];
        let entries = [];
        try {
            entries = (await fs.readdir(corpusDir, { withFileTypes: true }))
                .filter((e) => e.isDirectory())
                .map((e) => e.name)
                .sort();
        }
        catch {
            entries = [];
        }
        for (const name of entries) {
            const dir = path.join(corpusDir, name);
            let gt;
            try {
                gt = JSON.parse(await fs.readFile(path.join(dir, "ground-truth.json"), "utf-8"));
            }
            catch {
                continue; // not a labeled fixture
            }
            const stack = await detectProjectStack(dir);
            const missed = [];
            let expectedChecks = 0;
            let foundChecks = 0;
            const checkSet = (expected, actual, label) => {
                for (const item of expected) {
                    expectedChecks++;
                    if (detected(item, actual))
                        foundChecks++;
                    else
                        missed.push(`${label}:${item}`);
                }
            };
            checkSet(gt.languages, stack.languages, "lang");
            checkSet(gt.frameworks, stack.frameworks, "fw");
            checkSet(gt.packageManagers, stack.packageManagers, "pm");
            // hasDocker (exact)
            expectedChecks++;
            if (stack.hasDocker === gt.hasDocker)
                foundChecks++;
            else
                missed.push(`hasDocker:${gt.hasDocker}`);
            // test command (substring presence)
            expectedChecks++;
            if (stack.testCommands.some((c) => ci(c).includes(ci(gt.testCommandIncludes))))
                foundChecks++;
            else
                missed.push(`cmd:${gt.testCommandIncludes}`);
            // extras (informational): detected languages/frameworks not matching any expected
            const extras = [];
            for (const l of stack.languages)
                if (!gt.languages.some((e) => detected(e, [l])))
                    extras.push(`lang:${l}`);
            for (const f of stack.frameworks)
                if (!gt.frameworks.some((e) => detected(e, [f])))
                    extras.push(`fw:${f}`);
            const recall = expectedChecks ? Math.round((foundChecks / expectedChecks) * 1000) / 10 : 100;
            fixtures.push({
                fixture: name,
                expectedChecks,
                foundChecks,
                recall,
                missed,
                extras,
                passed: foundChecks === expectedChecks,
            });
        }
        const totalExpectedChecks = fixtures.reduce((a, f) => a + f.expectedChecks, 0);
        const totalFoundChecks = fixtures.reduce((a, f) => a + f.foundChecks, 0);
        const totalExtras = fixtures.reduce((a, f) => a + f.extras.length, 0);
        const recallPct = totalExpectedChecks
            ? Math.round((totalFoundChecks / totalExpectedChecks) * 1000) / 10
            : 100;
        const verdict = recallPct === 100 ? "DETECTION_ACCURATE" : "DETECTION_GAPS";
        return BrownfieldCorpusScorecardSchema.parse({
            evalId: `CORPUS-${crypto.randomBytes(4).toString("hex")}`,
            totalFixtures: fixtures.length,
            totalExpectedChecks,
            totalFoundChecks,
            recallPct,
            totalExtras,
            verdict,
            fixtures,
        });
    }
}
//# sourceMappingURL=brownfield-corpus-harness.js.map