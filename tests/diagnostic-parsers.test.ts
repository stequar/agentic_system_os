import { describe, it, expect } from "vitest";
import {
  parseTscOutput,
  parseVitestOutput,
  parsePytestOutput,
  parseCargoOutput,
  parseGoOutput,
  parseDiagnostics,
} from "../src/gatekeeper/parsers/index.js";

describe("Structured Diagnostic Parsers (TCK-5.1)", () => {
  describe("TypeScript Parser (tsc)", () => {
    it("estrae correttamente errori e warning con riga, colonna e codice TS", () => {
      const tscOutput = `
src/core/index.ts(42,15): error TS2322: Type 'string' is not assignable to type 'number'.
src/utils.ts(10,5): warning TS6133: 'unusedVar' is declared but its value is never read.
      `;

      const violations = parseTscOutput(tscOutput);
      expect(violations).toHaveLength(2);

      const err = violations[0];
      expect(err.file).toBe("src/core/index.ts");
      expect(err.line).toBe(42);
      expect(err.column).toBe(15);
      expect(err.severity).toBe("error");
      expect(err.code).toBe("TS2322");
      expect(err.message).toContain("Type 'string' is not assignable");
      expect(err.sourceRunner).toBe("tsc");

      const warn = violations[1];
      expect(warn.file).toBe("src/utils.ts");
      expect(warn.line).toBe(10);
      expect(warn.column).toBe(5);
      expect(warn.severity).toBe("warning");
      expect(warn.code).toBe("TS6133");
    });
  });

  describe("Vitest / Jest Parser", () => {
    it("estrae stack trace e asserzione fallita da output Vitest", () => {
      const vitestOutput = `
FAIL  tests/calculator.test.ts > Calculator Suite > adds two numbers
AssertionError: expected 40 to be 42 // Object.is equality

- Expected: 42
+ Received: 40

 ❯ tests/calculator.test.ts:18:5
      `;

      const violations = parseVitestOutput(vitestOutput);
      expect(violations).toHaveLength(1);

      const v = violations[0];
      expect(v.file).toBe("tests/calculator.test.ts");
      expect(v.line).toBe(18);
      expect(v.column).toBe(5);
      expect(v.severity).toBe("error");
      expect(v.message).toContain("expected 40 to be 42");
      expect(v.sourceRunner).toBe("vitest");
    });
  });

  describe("Pytest Parser", () => {
    it("estrae traceback e fallimento con riga esatta in Pytest", () => {
      const pytestOutput = `
_________________________________ test_calculate __________________________________
tests/test_math.py:25: in test_calculate
    assert result == 100
E   AssertionError: assert 90 == 100
=========================== short test summary info ============================
FAILED tests/test_math.py::test_calculate - AssertionError: assert 90 == 100
      `;

      const violations = parsePytestOutput(pytestOutput);
      expect(violations.length).toBeGreaterThanOrEqual(1);

      const v = violations[0];
      expect(v.file).toBe("tests/test_math.py");
      expect(v.line).toBe(25);
      expect(v.severity).toBe("error");
      expect(v.message).toContain("assert 90 == 100");
      expect(v.sourceRunner).toBe("pytest");
    });
  });

  describe("Cargo / Clippy Parser", () => {
    it("estrae errore di compilazione e warning da output Cargo/Clippy", () => {
      const cargoOutput = `
error[E0308]: mismatched types
  --> src/main.rs:14:5
   |
14 |     42
   |     ^^ expected &str, found integer

warning: unused variable: 'counter'
  --> src/lib.rs:8:9
   |
 8 |     let counter = 0;
   |         ^^^^^^^ help: if this is intentional, prefix it with an underscore: '_counter'
      `;

      const violations = parseCargoOutput(cargoOutput);
      expect(violations).toHaveLength(2);

      const err = violations[0];
      expect(err.file).toBe("src/main.rs");
      expect(err.line).toBe(14);
      expect(err.column).toBe(5);
      expect(err.code).toBe("E0308");
      expect(err.severity).toBe("error");
      expect(err.message).toContain("mismatched types");

      const warn = violations[1];
      expect(warn.file).toBe("src/lib.rs");
      expect(warn.line).toBe(8);
      expect(warn.column).toBe(9);
      expect(warn.severity).toBe("warning");
    });
  });

  describe("Go Parser", () => {
    it("estrae errori di compilazione e fallimenti di test Go", () => {
      const goOutput = `
--- FAIL: TestMultiply (0.01s)
    math_test.go:30: expected 50, got 45
./server.go:12:3: undefined: InitializeDatabase
      `;

      const violations = parseGoOutput(goOutput);
      expect(violations.length).toBeGreaterThanOrEqual(2);

      const compErr = violations.find((v) => v.file.includes("server.go"))!;
      expect(compErr).toBeDefined();
      expect(compErr.line).toBe(12);
      expect(compErr.column).toBe(3);
      expect(compErr.message).toContain("undefined: InitializeDatabase");

      const testFail = violations.find((v) => v.file.includes("math_test.go"))!;
      expect(testFail).toBeDefined();
      expect(testFail.line).toBe(30);
      expect(testFail.message).toContain("expected 50, got 45");
    });
  });

  describe("Unified parseDiagnostics", () => {
    it("produce un DiagnosticReport tipizzato Zod con conteggi corretti di errori e warning", () => {
      const mixedOutput = `
src/index.ts(5,1): error TS1005: ';' expected.
src/config.ts(12,3): warning TS6133: 'foo' is declared but never read.
      `;

      const report = parseDiagnostics(mixedOutput, "tsc");
      expect(report.runner).toBe("tsc");
      expect(report.errorCount).toBe(1);
      expect(report.warningCount).toBe(1);
      expect(report.violations).toHaveLength(2);
      expect(report.violations[0].code).toBe("TS1005");
    });
  });
});
