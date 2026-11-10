import { describe, it, expect } from "vitest";
import { validatePatch } from "../src/gatekeeper/ast-guard.js";

describe("AST Diff Guard & Scope Enforcement Rule Engine (TCK-5.3)", () => {
  describe("Test Preservation Invariant", () => {
    it("consente modifiche al file di test se i test e le asserzioni sono preservati o aumentati", () => {
      const originalFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          describe("math", () => {
            it("adds numbers", () => {
              expect(add(1, 2)).toBe(3);
            });
          });
          `,
        ],
      ]);

      const modifiedFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          describe("math", () => {
            it("adds numbers", () => {
              expect(add(1, 2)).toBe(3);
              expect(add(2, 2)).toBe(4); // Aggiunta asserzione valida
            });
          });
          `,
        ],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles);
      expect(result.passed).toBe(true);
      expect(result.testsPreserved).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("blocca con violazione se un test case viene eliminato o commentato", () => {
      const originalFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it("test 1", () => { expect(1).toBe(1); });
          it("test 2", () => { expect(2).toBe(2); });
          `,
        ],
      ]);

      const modifiedFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it("test 1", () => { expect(1).toBe(1); });
          // it("test 2 eliminato per far passare il gatekeeper");
          `,
        ],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles);
      expect(result.passed).toBe(false);
      expect(result.testsPreserved).toBe(false);
      expect(result.violations.some((v) => v.includes("TEST_PRESERVATION_VIOLATION"))).toBe(true);
      expect(result.violations.some((v) => v.includes("Numero di test case ridotto"))).toBe(true);
    });

    it("blocca con violazione se un'asserzione expect/assert viene rimossa", () => {
      const originalFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it("checks calculation", () => {
            expect(calc(10)).toBe(100);
            expect(calc(20)).toBe(200);
          });
          `,
        ],
      ]);

      const modifiedFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it("checks calculation", () => {
            expect(calc(10)).toBe(100);
            // expect rimosso
          });
          `,
        ],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles);
      expect(result.passed).toBe(false);
      expect(result.testsPreserved).toBe(false);
      expect(result.violations.some((v) => v.includes("Numero di asserzioni ridotto"))).toBe(true);
    });

    it("blocca con violazione se viene aggiunto uno skip (.skip o xit) non autorizzato", () => {
      const originalFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it("failing test", () => {
            expect(faulty()).toBe(true);
          });
          `,
        ],
      ]);

      const modifiedFiles = new Map<string, string>([
        [
          "tests/math.test.ts",
          `
          it.skip("failing test", () => {
            expect(faulty()).toBe(true);
          });
          `,
        ],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles);
      expect(result.passed).toBe(false);
      expect(result.testsPreserved).toBe(false);
      expect(result.violations.some((v) => v.includes("test skip"))).toBe(true);
    });
  });

  describe("Scope Enforcement Invariant", () => {
    it("consente la patch se tutti i file modificati sono all'interno di allowedFiles", () => {
      const originalFiles = new Map<string, string>([
        ["src/calculator.ts", "export function calc() { return 0; }"],
      ]);

      const modifiedFiles = new Map<string, string>([
        ["src/calculator.ts", "export function calc() { return 42; }"],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles, {
        allowedFiles: ["src/calculator.ts"],
      });

      expect(result.passed).toBe(true);
      expect(result.scopePreserved).toBe(true);
    });

    it("blocca con violazione se viene modificato un file esterno ad allowedFiles", () => {
      const originalFiles = new Map<string, string>([
        ["src/unauthorized.ts", "const x = 1;"],
      ]);

      const modifiedFiles = new Map<string, string>([
        ["src/unauthorized.ts", "const x = 2;"],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles, {
        allowedFiles: ["src/authorized.ts"],
      });

      expect(result.passed).toBe(false);
      expect(result.scopePreserved).toBe(false);
      expect(result.violations.some((v) => v.includes("SCOPE_ENFORCEMENT_VIOLATION"))).toBe(true);
    });

    it("blocca la modifica a package.json se non esplicitamente autorizzato", () => {
      const originalFiles = new Map<string, string>([
        ["package.json", '{"name": "test", "version": "1.0.0"}'],
      ]);

      const modifiedFiles = new Map<string, string>([
        ["package.json", '{"name": "test", "version": "2.0.0"}'],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles);
      expect(result.passed).toBe(false);
      expect(result.scopePreserved).toBe(false);
      expect(result.violations.some((v) => v.includes("file di configurazione protetto"))).toBe(true);
    });

    it("consente la modifica a package.json se è esplicitamente presente in allowedFiles", () => {
      const originalFiles = new Map<string, string>([
        ["package.json", '{"name": "test", "version": "1.0.0"}'],
      ]);

      const modifiedFiles = new Map<string, string>([
        ["package.json", '{"name": "test", "version": "1.0.1"}'],
      ]);

      const result = validatePatch(originalFiles, modifiedFiles, {
        allowedFiles: ["package.json"],
      });

      expect(result.passed).toBe(true);
      expect(result.scopePreserved).toBe(true);
    });
  });
});
