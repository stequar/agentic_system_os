import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { runSelfHealingLoop } from "../src/gatekeeper/self-healing.js";
import { HealingSessionResultSchema } from "../src/contracts/healing.js";

describe("Autonomous Self-Healing Closed Loop Runner (TCK-5.2)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "self-healing-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("Scenario 1: Successo immediato alla prima iterazione (Gatekeeper passa al primo colpo)", async () => {
    const commands = [
      'node -e "console.log(\'Tests: 3 passed, 3 total\'); process.exit(0)"',
    ];

    const result = await runSelfHealingLoop(tempDir, commands, async () => new Map());

    expect(result.status).toBe("SUCCESS");
    expect(result.iterationsRun).toBe(1);
    expect(result.maxIterations).toBe(3);
    expect(result.restoredRollback).toBe(false);
    expect(result.attempts).toHaveLength(0);
    expect(result.finalGatekeeperResult?.testsPassed).toBe(true);

    const parsed = HealingSessionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 2: Convergenza guidata alla seconda iterazione tramite patch valida", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.mkdir(srcDir, { recursive: true });
    const targetFile = path.join(srcDir, "math.ts");
    await fs.writeFile(targetFile, "export const value = 0; // broken", "utf-8");

    // Il comando fallisce se math.ts non contiene 'FIXED_VALUE = 42'
    const command = `node -e "
      const fs = require('fs');
      const content = fs.readFileSync('src/math.ts', 'utf8');
      if (content.includes('FIXED_VALUE = 42')) {
        console.log('Tests: 1 passed, 1 total');
        process.exit(0);
      } else {
        console.error('src/math.ts:1:1 - error TS2322: Type mismatch');
        process.exit(1);
      }
    "`;

    const patchApplier = async () => {
      return new Map([
        ["src/math.ts", "export const FIXED_VALUE = 42;"],
      ]);
    };

    const result = await runSelfHealingLoop(tempDir, [command], patchApplier, {
      maxIterations: 3,
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.iterationsRun).toBe(2);
    expect(result.restoredRollback).toBe(false);
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].iteration).toBe(1);
    expect(result.attempts[0].guardResult.passed).toBe(true);
    expect(result.attempts[0].success).toBe(true);

    // Verifica che il file su disco sia stato effettivamente aggiornato con la patch
    const updatedContent = await fs.readFile(targetFile, "utf-8");
    expect(updatedContent).toBe("export const FIXED_VALUE = 42;");

    const parsed = HealingSessionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 3: Esaurimento del budget (3 iterazioni) e Atomic Rollback garantito", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.mkdir(srcDir, { recursive: true });
    const targetFile = path.join(srcDir, "app.ts");
    const initialContent = "export const status = 'ORIGINAL_STABLE_CONTENT';";
    await fs.writeFile(targetFile, initialContent, "utf-8");

    // Comando che fallisce sempre
    const command = `node -e "
      console.error('src/app.ts:1:1 - error TS2322: Unfixable error');
      process.exit(1);
    "`;

    let attemptCount = 0;
    const patchApplier = async () => {
      attemptCount++;
      return new Map([
        ["src/app.ts", `export const status = 'MUTATED_ATTEMPT_${attemptCount}';`],
      ]);
    };

    const result = await runSelfHealingLoop(tempDir, [command], patchApplier, {
      maxIterations: 3,
    });

    expect(result.status).toBe("BUDGET_EXHAUSTED");
    expect(result.iterationsRun).toBe(3);
    expect(result.restoredRollback).toBe(true);
    expect(result.attempts).toHaveLength(2); // tentativi nelle iterazioni 1 e 2 prima del fallimento alla 3

    // Verifica invariante Atomic Rollback: il file su disco deve essere ripristinato esattamente a t0
    const diskContent = await fs.readFile(targetFile, "utf-8");
    expect(diskContent).toBe(initialContent);

    const parsed = HealingSessionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 4: Violazione Test Preservation Invariant e Rollback immediato", async () => {
    const testsDir = path.join(tempDir, "tests");
    await fs.mkdir(testsDir, { recursive: true });
    const testFile = path.join(testsDir, "core.test.ts");
    const initialTestCode = `
      describe("core suite", () => {
        it("must pass critical check", () => {
          expect(1).toBe(1);
        });
      });
    `;
    await fs.writeFile(testFile, initialTestCode, "utf-8");

    const command = `node -e "
      console.error('tests/core.test.ts:3:5 - Assertion failed');
      process.exit(1);
    "`;

    // Il patchApplier tenta di eliminare il test case per far passare il Gatekeeper
    const patchApplier = async () => {
      return new Map([
        ["tests/core.test.ts", "// Test eliminato illecitamente"],
      ]);
    };

    const result = await runSelfHealingLoop(tempDir, [command], patchApplier, {
      maxIterations: 3,
    });

    expect(result.status).toBe("GUARD_VIOLATION");
    expect(result.restoredRollback).toBe(true);
    expect(result.attempts).toHaveLength(1);
    expect(result.attempts[0].guardResult.passed).toBe(false);
    expect(result.attempts[0].guardResult.testsPreserved).toBe(false);
    expect(result.attempts[0].guardResult.violations.length).toBeGreaterThan(0);

    // Verifica che il file di test sia intatto su disco
    const contentOnDisk = await fs.readFile(testFile, "utf-8");
    expect(contentOnDisk).toBe(initialTestCode);

    const parsed = HealingSessionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("Scenario 5: Violazione Scope Enforcement Invariant (file non consentito)", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.mkdir(srcDir, { recursive: true });
    const allowedFile = path.join(srcDir, "allowed.ts");
    const forbiddenFile = path.join(srcDir, "unauthorized.ts");

    await fs.writeFile(allowedFile, "export const allowed = true;", "utf-8");
    await fs.writeFile(forbiddenFile, "export const secret = 'initial';", "utf-8");

    const command = `node -e "console.error('error TS2322 in src/allowed.ts'); process.exit(1);"`;

    // Il patchApplier tenta di modificare un file non presente in allowedFiles
    const patchApplier = async () => {
      return new Map([
        ["src/unauthorized.ts", "export const secret = 'tampered';"],
      ]);
    };

    const result = await runSelfHealingLoop(tempDir, [command], patchApplier, {
      maxIterations: 3,
      allowedFiles: ["src/allowed.ts"],
    });

    expect(result.status).toBe("GUARD_VIOLATION");
    expect(result.restoredRollback).toBe(true);
    expect(result.attempts[0].guardResult.passed).toBe(false);
    expect(result.attempts[0].guardResult.scopePreserved).toBe(false);

    // Il file non autorizzato non deve essere stato modificato
    const forbiddenContent = await fs.readFile(forbiddenFile, "utf-8");
    expect(forbiddenContent).toBe("export const secret = 'initial';");
  });
});
