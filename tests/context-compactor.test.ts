import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { ContextCompactor } from "../src/core/context-compactor.js";
import { runSelfHealingLoop } from "../src/gatekeeper/self-healing.js";
import type { DiagnosticReport, HealingAttempt } from "../src/contracts/healing.js";

describe("Invariant-Protected Context Compaction & Anti-Rot Memory Core (TCK-10.2)", () => {
  it("determina correttamente la necessità di compattazione in base alla soglia di 40k token", () => {
    expect(ContextCompactor.shouldCompact(25_000, 40_000)).toBe(false);
    expect(ContextCompactor.shouldCompact(39_999, 40_000)).toBe(false);
    expect(ContextCompactor.shouldCompact(40_000, 40_000)).toBe(true);
    expect(ContextCompactor.shouldCompact(75_000, 40_000)).toBe(true);
  });

  it("verifica gli invarianti con esito positivo quando ticket, file, criteri e test sono preservati", () => {
    const invariants = {
      ticketId: "TCK-10.2",
      allowedFiles: ["src/core/context-compactor.ts", "src/contracts/compaction.ts"],
      acceptanceCriteria: [
        "Soglia di compattazione a 40k token deterministica",
        "Invariant Protection Guardrail attivo",
      ],
      testCommands: ["npm test", "npm run typecheck"],
    };

    const text = `
    Riepilogo sessione:
    Ticket ID: TCK-10.2
    File consentiti: src/core/context-compactor.ts e src/contracts/compaction.ts
    Criteri di accettazione:
    1. Soglia di compattazione a 40k token deterministica
    2. Invariant Protection Guardrail attivo
    Comandi da eseguire: npm test, npm run typecheck
    `;

    const result = ContextCompactor.verifyContextInvariants(text, invariants);
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.preservedTicketId).toBe(true);
    expect(result.preservedAllowedFiles).toBe(true);
    expect(result.preservedAcceptanceCriteria).toBe(true);
    expect(result.preservedTestCommands).toBe(true);
  });

  it("intercetta e segnala violazioni quando mancano ticket ID o file autorizzati", () => {
    const invariants = {
      ticketId: "TCK-999",
      allowedFiles: ["src/critical/secret.ts"],
      acceptanceCriteria: ["Protezione dati"],
      testCommands: ["npm test"],
    };

    const textDegenerato = "Testo sintetico dove mancano sia il ticket che il file protetto.";

    const result = ContextCompactor.verifyContextInvariants(textDegenerato, invariants);
    expect(result.passed).toBe(false);
    expect(result.preservedTicketId).toBe(false);
    expect(result.preservedAllowedFiles).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });

  it("esegue la compattazione semantica quando forzata o oltre soglia riducendo i token e blindando gli invarianti", () => {
    const invariants = {
      ticketId: "TCK-10.2",
      allowedFiles: ["src/core/compactor.ts"],
      acceptanceCriteria: ["Riduzione token > 50%", "Invarianti intatti"],
      testCommands: ["npm test"],
    };

    // Simulazione di una conversazione prolungata con dump di tool pesanti
    const heavyToolOutput = "LOG DUMP LINE ".repeat(1500); // stringa molto lunga
    const messages = [
      { role: "system" as const, content: "Sei il Lead Engineer." },
      { role: "user" as const, content: "Inizia ticket TCK-10.2 per src/core/compactor.ts con npm test" },
      { role: "assistant" as const, content: "Applico la patch iniziale per compactor.ts" },
      { role: "tool" as const, name: "run_gatekeeper", content: heavyToolOutput },
      { role: "assistant" as const, content: "Modifico la logica interna per rispettare i criteri di accettazione" },
      { role: "user" as const, content: "Assicurati che la riduzione token sia > 50% e gli invarianti intatti" },
    ];

    const result = ContextCompactor.compactContext({
      messages,
      invariants,
      forceCompaction: true,
    });

    expect(result.wasCompacted).toBe(true);
    expect(result.reductionPercent).toBeGreaterThan(40);
    expect(result.compactedTokenEstimate).toBeLessThan(result.originalTokenEstimate);
    expect(result.invariantVerification.passed).toBe(true);
    expect(result.invariantVerification.preservedTicketId).toBe(true);
    expect(result.invariantVerification.preservedAllowedFiles).toBe(true);
    expect(result.invariantVerification.preservedAcceptanceCriteria).toBe(true);
  });

  it("Surgical Diagnostic Slicer: riduce log d'errore verbosi ad atomi <120 token arricchiti da ipotesi negative", () => {
    const rawCompilerDump = `
    \u001b[31m[ERROR]\u001b[39m /Users/stequar/workspace/project/src/core/compactor.ts:42:15 - error TS2322: Type 'string' is not assignable to type 'number'.
        42     const value: number = "not_a_number";
                                     ~~~~~~~~~~~~~~
        at CompilerInstance.compile (/node_modules/typescript/lib/typescript.js:12345:67)
        at runSuite (/node_modules/vitest/dist/index.js:987:65)
    `;

    const report: DiagnosticReport = {
      violations: [
        {
          file: "src/core/compactor.ts",
          line: 42,
          column: 15,
          code: "TS2322",
          severity: "error",
          message: rawCompilerDump,
          sourceRunner: "tsc",
        },
      ],
      errorCount: 1,
      warningCount: 0,
      rawOutput: rawCompilerDump,
      runner: "tsc",
    };

    const discardedAttempts: HealingAttempt[] = [
      {
        iteration: 1,
        violations: report.violations,
        proposedPatch: { "src/core/compactor.ts": "const value: any = 'test';" },
        guardResult: {
          passed: false,
          violations: ["TEST_PRESERVATION_VIOLATION: Any cast forbidden"],
          testsPreserved: false,
          scopePreserved: true,
        },
        success: false,
      },
    ];

    const slices = ContextCompactor.sliceDiagnostics(report, discardedAttempts);
    expect(slices).toHaveLength(1);
    expect(slices[0].file).toBe("src/core/compactor.ts");
    expect(slices[0].line).toBe(42);
    expect(slices[0].compactedTokensEstimate).toBeLessThan(120);
    // Non deve contenere codici ANSI
    expect(slices[0].message).not.toContain("\u001b[31m");
    // Deve contenere l'ipotesi negativa scartata dal tentativo precedente
    expect(slices[0].negativeHypotheses).toHaveLength(1);
    expect(slices[0].negativeHypotheses[0]).toContain("Iterazione #1");
  });

  it("Epistemic Clean-Slate Protocol: costruisce payload compatto a t0 per il Self-Healing", () => {
    const report: DiagnosticReport = {
      violations: [
        {
          file: "src/calc.ts",
          line: 10,
          severity: "error",
          message: "AssertionError: expected 5 to be 10",
          sourceRunner: "vitest",
        },
      ],
      errorCount: 1,
      warningCount: 0,
      rawOutput: "AssertionError at test.ts",
      runner: "vitest",
    };

    const cleanSlate = ContextCompactor.buildCleanSlatePayload(2, report);
    expect(cleanSlate.iteration).toBe(2);
    expect(cleanSlate.t0ResetApplied).toBe(true);
    expect(cleanSlate.slices).toHaveLength(1);
    expect(cleanSlate.totalTokensPayload).toBeLessThan(200);
  });

  describe("Integrazione Clean-Slate nel closed loop di Self-Healing", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "clean-slate-healing-"));
    });

    afterEach(async () => {
      if (tempDir) {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    });

    it("esegue runSelfHealingLoop con enableCleanSlate riducendo il payload diagnostico", async () => {
      const srcDir = path.join(tempDir, "src");
      await fs.mkdir(srcDir, { recursive: true });
      const targetFile = path.join(srcDir, "token.ts");
      await fs.writeFile(targetFile, "export const count = 0;", "utf-8");

      // Il comando fallisce alla prima iterazione, poi passa quando count = 100
      const command = `node -e "
        const fs = require('fs');
        const content = fs.readFileSync('src/token.ts', 'utf8');
        if (content.includes('count = 100')) {
          console.log('Tests: 1 passed');
          process.exit(0);
        } else {
          console.error('src/token.ts:1:1 - error TS2322: Count must be 100');
          process.exit(1);
        }
      "`;

      let capturedReport: any = null;

      const patchApplier = async (report: DiagnosticReport) => {
        capturedReport = report;
        return new Map([["src/token.ts", "export const count = 100;"]]);
      };

      const result = await runSelfHealingLoop(tempDir, [command], patchApplier, {
        enableCleanSlate: true,
      });

      expect(result.status).toBe("SUCCESS");
      expect(result.iterationsRun).toBe(2);
      expect(capturedReport).not.toBeNull();
      // Con clean slate, rawOutput è compattato e cleanSlatePayload è presente
      expect(capturedReport.rawOutput).toContain("CLEAN_SLATE");
      expect(capturedReport.cleanSlatePayload).toBeDefined();
      expect(capturedReport.cleanSlatePayload.t0ResetApplied).toBe(true);
    });
  });
});
