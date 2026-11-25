import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Vitest global setup: the test suite must never write into this repository's own
 * operational state. Dashboards and metrics are computed from `.company-os/audit.jsonl`,
 * so a test run that appends to it silently turns test activity into "production" data.
 *
 * The guard fingerprints the protected files before the run and fails the whole run in
 * teardown if any of them changed. Tests and eval harnesses must operate on a temp copy.
 */
export const PROTECTED_REPO_STATE = [
  ".company-os/audit.jsonl",
  ".company-os/workflow-state.json",
  ".company-os/workflow-eval-scorecard.json",
  ".company-os/eval-scorecard.json",
  "docs/wiki/qa/fitness-project-eval-report.md",
] as const;

function fingerprint(root: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rel of PROTECTED_REPO_STATE) {
    const full = path.join(root, rel);
    out.set(
      rel,
      fs.existsSync(full)
        ? createHash("sha256").update(fs.readFileSync(full)).digest("hex")
        : "ABSENT"
    );
  }
  return out;
}

export default function setup(): () => void {
  const root = process.cwd();
  const before = fingerprint(root);

  return function teardown(): void {
    const after = fingerprint(root);
    const changed = PROTECTED_REPO_STATE.filter((rel) => before.get(rel) !== after.get(rel));
    if (changed.length > 0) {
      throw new Error(
        `REPO_STATE_MUTATED_BY_TESTS: the test run modified ${changed.join(", ")}. ` +
          "Tests must run against an isolated temp copy and eval harnesses must use the eval audit channel."
      );
    }
  };
}
