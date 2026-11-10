import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  runGatekeeper,
  classifyCommand,
  parseTestCounts,
} from "../src/gatekeeper/runner.js";
import { GatekeeperResultSchema } from "../src/contracts/review.js";

describe("Deterministic Gatekeeper Runner (runGatekeeper)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "gatekeeper-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("Scenario 1: Esecuzione comandi con successo (exit code 0 e parsing test count)", async () => {
    const commands = [
      'node -e "console.log(\'Tests: 2 passed, 2 total\'); process.exit(0)"',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(true);
    expect(result.linterPassed).toBe(true);
    expect(result.testsPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.failedTests).toBe(0);
    expect(result.rawOutput).toContain("[SUCCESS]");
    expect(result.rawOutput).toContain("Tests: 2 passed, 2 total");

    // Zod validation verification
    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 2: Fallimento di typecheck (tsc fittizio con exit code 1 -> typecheckPassed: false)", async () => {
    const commands = [
      'node -e "console.error(\'Type error TS2322 in src/index.ts\'); process.exit(1)" /* tsc */',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(false);
    expect(result.linterPassed).toBe(true);
    expect(result.testsPassed).toBe(true);
    expect(result.rawOutput).toContain("[FAILED]");
    expect(result.rawOutput).toContain("Type error TS2322");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 3: Fallimento di linter (comando lint con exit code 1 -> linterPassed: false)", async () => {
    const commands = [
      'node -e "console.error(\'ESLint: Missing semicolon at line 12\'); process.exit(1)" /* eslint */',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(true);
    expect(result.linterPassed).toBe(false);
    expect(result.testsPassed).toBe(true);
    expect(result.rawOutput).toContain("[FAILED]");
    expect(result.rawOutput).toContain("Missing semicolon");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 4: Fallimento di test (comando vitest con 1 failed -> testsPassed: false)", async () => {
    const commands = [
      'node -e "console.log(\'Tests: 1 failed, 2 passed, 3 total\'); process.exit(1)" /* vitest */',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(true);
    expect(result.linterPassed).toBe(true);
    expect(result.testsPassed).toBe(false);
    expect(result.totalTests).toBe(3);
    expect(result.failedTests).toBe(1);
    expect(result.rawOutput).toContain("[FAILED]");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 5: Gestione timeout (comando bloccante terminato dopo timeoutMs)", async () => {
    const commands = [
      'node -e "setTimeout(() => { console.log(\'finished\'); }, 10000);"',
    ];

    const startTime = Date.now();
    const result = await runGatekeeper(tempDir, commands, { timeoutMs: 250 });
    const elapsedTime = Date.now() - startTime;

    expect(elapsedTime).toBeLessThan(4000);
    expect(result.testsPassed).toBe(false);
    expect(result.failedTests).toBe(1);
    expect(result.rawOutput).toContain("[TIMEOUT]");
    expect(result.rawOutput).toContain("timed out after 250ms");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 6: Gestione directory inesistente (fail loudly & gracefully)", async () => {
    const nonExistentPath = path.join(tempDir, "does-not-exist-dir-xyz");
    const commands = ["npm test"];

    const result = await runGatekeeper(nonExistentPath, commands);

    expect(result.typecheckPassed).toBe(false);
    expect(result.linterPassed).toBe(false);
    expect(result.testsPassed).toBe(false);
    expect(result.failedTests).toBeGreaterThanOrEqual(1);
    expect(result.rawOutput).toContain("Error: Target directory does not exist");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 7: Gestione targetPath che è un file invece di una directory", async () => {
    const filePath = path.join(tempDir, "regular-file.txt");
    await fs.writeFile(filePath, "sample content", "utf-8");

    const result = await runGatekeeper(filePath, ["npm test"]);

    expect(result.typecheckPassed).toBe(false);
    expect(result.linterPassed).toBe(false);
    expect(result.testsPassed).toBe(false);
    expect(result.rawOutput).toContain("Error: Target path is not a directory");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 8: Gestione lista vuota di comandi", async () => {
    const result = await runGatekeeper(tempDir, []);

    expect(result.typecheckPassed).toBe(true);
    expect(result.linterPassed).toBe(true);
    expect(result.testsPassed).toBe(true);
    expect(result.totalTests).toBe(0);
    expect(result.failedTests).toBe(0);
    expect(result.rawOutput).toBe("No test commands provided.");

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 9: Sequenza mista completa di successo (typecheck + lint + test)", async () => {
    const commands = [
      'node -e "console.log(\'tsc clean\'); process.exit(0)" /* tsc */',
      'node -e "console.log(\'lint clean\'); process.exit(0)" /* eslint */',
      'node -e "console.log(\'Tests: 5 passed, 5 total\'); process.exit(0)" /* vitest */',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(true);
    expect(result.linterPassed).toBe(true);
    expect(result.testsPassed).toBe(true);
    expect(result.totalTests).toBe(5);
    expect(result.failedTests).toBe(0);

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 10: Sequenza mista con fallimenti multipli cumulativi", async () => {
    const commands = [
      'node -e "process.exit(1)" /* tsc */',
      'node -e "process.exit(1)" /* eslint */',
      'node -e "process.exit(1)" /* test */',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.typecheckPassed).toBe(false);
    expect(result.linterPassed).toBe(false);
    expect(result.testsPassed).toBe(false);
    expect(result.failedTests).toBe(1);
    expect(result.totalTests).toBe(1);

    const parsed = GatekeeperResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 11: Fallback conteggio test su comandi generici senza output numerico", async () => {
    const commands = [
      'node -e "console.log(\'success 1\'); process.exit(0)"',
      'node -e "console.log(\'success 2\'); process.exit(0)"',
    ];

    const result = await runGatekeeper(tempDir, commands);

    expect(result.testsPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.failedTests).toBe(0);
  });
});

describe("Unit: Command Classification (classifyCommand)", () => {
  it("classifica correttamente comandi typecheck", () => {
    expect(classifyCommand("npm run typecheck")).toEqual({
      isTypecheck: true,
      isLint: false,
      isTest: false,
    });
    expect(classifyCommand("npx tsc --noEmit")).toEqual({
      isTypecheck: true,
      isLint: false,
      isTest: false,
    });
    expect(classifyCommand("mypy src/")).toEqual({
      isTypecheck: true,
      isLint: false,
      isTest: false,
    });
    expect(classifyCommand("pyright")).toEqual({
      isTypecheck: true,
      isLint: false,
      isTest: false,
    });
  });

  it("classifica correttamente comandi linter", () => {
    expect(classifyCommand("npm run lint")).toEqual({
      isTypecheck: false,
      isLint: true,
      isTest: false,
    });
    expect(classifyCommand("npx eslint .")).toEqual({
      isTypecheck: false,
      isLint: true,
      isTest: false,
    });
    expect(classifyCommand("flake8")).toEqual({
      isTypecheck: false,
      isLint: true,
      isTest: false,
    });
    expect(classifyCommand("ruff check .")).toEqual({
      isTypecheck: false,
      isLint: true,
      isTest: false,
    });
    expect(classifyCommand("cargo clippy")).toEqual({
      isTypecheck: false,
      isLint: true,
      isTest: false,
    });
  });

  it("classifica correttamente comandi test e comandi generici", () => {
    expect(classifyCommand("npm test")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
    expect(classifyCommand("vitest run")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
    expect(classifyCommand("pytest tests/")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
    expect(classifyCommand("cargo test")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
    expect(classifyCommand("swift test")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
    expect(classifyCommand("node -e 'check()'")).toEqual({
      isTypecheck: false,
      isLint: false,
      isTest: true,
    });
  });
});

describe("Unit: Test Count Parsing (parseTestCounts)", () => {
  it("parsa output Jest / Vitest standard e con colori ANSI", () => {
    const rawOutput = `
Test Files  1 passed (1)
Tests:       1 failed, 4 passed, 5 total
Time:        0.45s
`;
    expect(parseTestCounts(rawOutput)).toEqual({ total: 5, failed: 1 });

    const ansiOutput = "\u001b[32mTests:\u001b[39m 3 passed, 3 total";
    expect(parseTestCounts(ansiOutput)).toEqual({ total: 3, failed: 0 });
  });

  it("parsa output Pytest", () => {
    const pytestOutput = "================= 2 failed, 8 passed in 1.45s =================";
    expect(parseTestCounts(pytestOutput)).toEqual({ total: 10, failed: 2 });

    const pytestAllPassed = "================= 12 passed in 0.50s =================";
    expect(parseTestCounts(pytestAllPassed)).toEqual({ total: 12, failed: 0 });
  });

  it("parsa output Cargo test", () => {
    const cargoOutput = "test result: FAILED. 6 passed; 2 failed; 0 ignored; 0 measured; 0 filtered out";
    expect(parseTestCounts(cargoOutput)).toEqual({ total: 8, failed: 2 });
  });

  it("parsa output Python unittest", () => {
    const unittestOutput = `
Ran 10 tests in 0.051s

FAILED (failures=2, errors=1)
`;
    expect(parseTestCounts(unittestOutput)).toEqual({ total: 10, failed: 3 });
  });

  it("parsa output TAP (Test Anything Protocol)", () => {
    const tapOutput = `
# tests 7
# pass 5
# fail 2
`;
    expect(parseTestCounts(tapOutput)).toEqual({ total: 7, failed: 2 });
  });

  it("parsa output generico 'X tests passed, Y tests failed'", () => {
    const genericOutput = "Execution summary: 4 tests passed, 1 test failed.";
    expect(parseTestCounts(genericOutput)).toEqual({ total: 5, failed: 1 });
  });

  it("restituisce null su output non correlato", () => {
    expect(parseTestCounts("Build finished successfully in 2.1s")).toBeNull();
  });
});
