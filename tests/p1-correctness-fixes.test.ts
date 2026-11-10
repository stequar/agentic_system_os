import { describe, it, expect } from "vitest";
import { parseTscOutput, parsePytestOutput } from "../src/gatekeeper/parsers/index.js";
import { graftManagedSection, computeManagedBlockHash } from "../src/attach/smart-merge.js";

/**
 * Regression tests for the P1 "silently broken core functions" fixes.
 */
describe("P1 correctness regression", () => {
  describe("tsc parser handles the pretty format (self-healing was blind to it)", () => {
    it("parses `file.ts:line:col - error TSxxxx` (pretty / pretty:true output)", () => {
      const pretty = `
src/core/index.ts:42:15 - error TS2322: Type 'string' is not assignable to type 'number'.
src/utils.ts:10:5 - warning TS6133: 'unusedVar' is declared but never read.
`;
      const violations = parseTscOutput(pretty);
      expect(violations).toHaveLength(2);
      expect(violations[0].file).toBe("src/core/index.ts");
      expect(violations[0].line).toBe(42);
      expect(violations[0].column).toBe(15);
      expect(violations[0].code).toBe("TS2322");
      expect(violations[0].severity).toBe("error");
    });

    it("still parses the legacy `file.ts(line,col):` format and does not double-count", () => {
      const legacy = `src/a.ts(5,1): error TS1005: ';' expected.`;
      const violations = parseTscOutput(legacy);
      expect(violations).toHaveLength(1);
      expect(violations[0].code).toBe("TS1005");
    });
  });

  describe("pytest parser keeps every failing test in a file", () => {
    it("reports all FAILED entries, not just the first per file", () => {
      const output = `
=========================== short test summary info ============================
FAILED tests/test_math.py::test_add - AssertionError: 1 != 2
FAILED tests/test_math.py::test_sub - AssertionError: 3 != 4
FAILED tests/test_math.py::test_mul - AssertionError: 5 != 6
`;
      const violations = parsePytestOutput(output);
      const funcs = violations.map((v) => v.message);
      expect(funcs.some((m) => m.includes("test_add"))).toBe(true);
      expect(funcs.some((m) => m.includes("test_sub"))).toBe(true);
      expect(funcs.some((m) => m.includes("test_mul"))).toBe(true);
      expect(violations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("smart-merge update is payload-safe and does not duplicate blocks", () => {
    it("preserves `$`-sequences in the managed payload verbatim on update", () => {
      const id = "test-block";
      const v1 = graftManagedSection(null, id, "original content");
      // New payload contains regex/shell replacement sequences that would corrupt a
      // string-based .replace(): $&, $1, $`, $'
      const trickyPayload = "shell: echo $0 $1 && sed 's/x/$&/' # $` and $'";
      const v2 = graftManagedSection(v1, id, trickyPayload);
      expect(v2).toContain(trickyPayload);
      expect(v2).not.toContain("original content");
    });

    it("updates in place (no duplicate block) even when the stored sha256 is tampered", () => {
      const id = "ceo-dashboard-governance";
      const good = graftManagedSection(null, id, "payload v1");
      // Corrupt the stored hash (truncate) — the strict 64-hex matcher used to miss this
      // and append a SECOND block with the same id.
      const tampered = good.replace(computeManagedBlockHash("payload v1"), "deadbeef");
      const updated = graftManagedSection(tampered, id, "payload v2");
      const startCount = (updated.match(/AGENTIC-OS:MANAGED:START id="ceo-dashboard-governance"/g) || []).length;
      expect(startCount).toBe(1);
      expect(updated).toContain("payload v2");
    });
  });
});
