import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { runGatekeeper } from "./runner.js";
import { parseDiagnostics } from "./parsers/index.js";
import { validatePatch } from "./ast-guard.js";
import {
  HealingSessionResultSchema,
  type HealingSessionResult,
  type HealingAttempt,
  type DiagnosticReport,
} from "../contracts/healing.js";
import type { GatekeeperResult } from "../contracts/review.js";

import { ContextCompactor } from "../core/context-compactor.js";
import { FastDecisionGate } from "../core/fast-decision-gate.js";
import { scanPatchHeuristics } from "./formal-prover.js";
import type { CleanSlatePayload } from "../contracts/compaction.js";
import { runTia } from "./tia.js";
import { WarRoomEngine } from "./war-room.js";

export interface SelfHealingOptions {
  maxIterations?: number;
  allowedFiles?: string[];
  enableCleanSlate?: boolean;
  useTia?: boolean;
  enableWarRoomCircuitBreaker?: boolean;
  enableFormalProver?: boolean;
  formalInvariants?: string[];
  ticketId?: string;
}

/**
 * Runner deterministico per il closed loop di Self-Healing autonomo.
 * Esegue il ciclo: Gatekeeper -> Parsing Diagnostico -> Remediation Patch -> AST Diff Guard -> Re-check.
 *
 * Vincoli di sicurezza:
 * - Budget rigido: massimo 3 iterazioni di default.
 * - Atomic Rollback Snapshot: garantisce il ripristino esatto dello stato a t0 se il Gatekeeper non converge.
 * - Fail Loudly in caso di esaurimento budget o violazione dei guardrail.
 */
export async function runSelfHealingLoop(
  targetPath: string,
  testCommands: string[],
  patchApplier: (report: DiagnosticReport) => Promise<Map<string, string>>,
  options?: SelfHealingOptions
): Promise<HealingSessionResult> {
  const startTime = performance.now();
  const maxIterations = options?.maxIterations ?? 3;
  const attempts: HealingAttempt[] = [];
  const originalFilesSnapshot = new Map<string, string>();
  let lastGatekeeperResult: GatekeeperResult | undefined;
  let finalStatus: "SUCCESS" | "BUDGET_EXHAUSTED" | "GUARD_VIOLATION" = "BUDGET_EXHAUSTED";
  let iterationsRun = 0;
  let restoredRollback = false;

  // Ripristina lo stato originale su disco in caso di insuccesso
  const executeAtomicRollback = async () => {
    for (const [absPath, originalContent] of originalFilesSnapshot.entries()) {
      try {
        if (originalContent === "") {
          // Il file non esisteva prima dell'inizio della sessione
          await fs.unlink(absPath).catch(() => {});
        } else {
          await fs.writeFile(absPath, originalContent, "utf-8");
        }
      } catch {
        // Ripristino best-effort
      }
    }
    restoredRollback = true;
  };

  try {
    let targetTestFiles: string[] | undefined;

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      iterationsRun = iteration;

      // 1. Esegue il Gatekeeper deterministico (full suite o targeted TIA)
      let gatekeeperResult = await runGatekeeper(targetPath, testCommands, { targetTestFiles });
      lastGatekeeperResult = gatekeeperResult;

      // Se le verifiche passano
      let allPassed =
        gatekeeperResult.typecheckPassed &&
        gatekeeperResult.linterPassed &&
        gatekeeperResult.testsPassed &&
        gatekeeperResult.failedTests === 0;

      // Two-Stage Gatekeeper: se ha passato i test mirati TIA, esegui la verifica full suite pre-merge
      if (allPassed && targetTestFiles && targetTestFiles.length > 0) {
        const fullVerification = await runGatekeeper(targetPath, testCommands);
        lastGatekeeperResult = fullVerification;
        allPassed =
          fullVerification.typecheckPassed &&
          fullVerification.linterPassed &&
          fullVerification.testsPassed &&
          fullVerification.failedTests === 0;
      }

      if (allPassed) {
        finalStatus = "SUCCESS";
        break;
      }

      // Se siamo all'ultima iterazione consentita e non passa, termina per esaurimento budget
      if (iteration === maxIterations) {
        finalStatus = "BUDGET_EXHAUSTED";
        break;
      }

      // 2. Parsing diagnostico strutturato dei fallimenti
      const rawOutput = gatekeeperResult.rawOutput || "";
      const diagnosticReport = parseDiagnostics(rawOutput, "auto");

      // Epistemic Clean-Slate Protocol: se attivo, riduce il payload a sole coordinate AST (<120t)
      let effectiveReport = diagnosticReport;
      if (options?.enableCleanSlate) {
        const cleanSlate = ContextCompactor.buildCleanSlatePayload(iteration, diagnosticReport, attempts);
        effectiveReport = {
          ...diagnosticReport,
          rawOutput: `[CLEAN_SLATE: ${cleanSlate.slices.length} surgical slices, ${cleanSlate.totalTokensPayload} tokens]`,
          cleanSlatePayload: cleanSlate,
        } as any;
      }

      // 3. Generazione proposta di patch tramite patchApplier
      const proposedPatch = await patchApplier(effectiveReport);
      if (proposedPatch.size === 0) {
        // Nessuna patch proposta, arresto per mancata convergenza
        finalStatus = "BUDGET_EXHAUSTED";
        break;
      }

      // 4. Salvataggio snapshot pre-flight per i file che verranno modificati
      for (const filePath of proposedPatch.keys()) {
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(targetPath, filePath);
        if (!originalFilesSnapshot.has(absPath)) {
          try {
            const content = await fs.readFile(absPath, "utf-8");
            originalFilesSnapshot.set(absPath, content);
          } catch {
            // File non esistente in origine
            originalFilesSnapshot.set(absPath, "");
          }
        }
      }

      // 4.5 Kahneman System-1 Fast Decision Gate (blocco <10ms a costo $0 su path proibiti o secret leak)
      const patchRecord: Record<string, string> = {};
      for (const [k, v] of proposedPatch.entries()) {
        patchRecord[k] = v;
      }

      const fastGateResult = FastDecisionGate.evaluate({
        action: "WRITE_FILE",
        targetFiles: Array.from(proposedPatch.keys()),
        payload: patchRecord,
      });

      // 5. Validazione con AST Diff Guard & Scope Enforcement
      const guardResult = validatePatch(originalFilesSnapshot, proposedPatch, {
        allowedFiles: options?.allowedFiles,
      });

      if (fastGateResult.decision === "FAST_REJECT") {
        guardResult.passed = false;
        guardResult.scopePreserved = false;
        guardResult.violations.push(
          `FAST_DECISION_GATE_REJECT (${fastGateResult.ruleTriggered}): ${fastGateResult.reason}`
        );
      }

      // 5.5 Heuristic pattern-based invariant scan (regex risk-pattern & Hoare-annotation check — NOT a formal prover)
      if (options?.enableFormalProver && guardResult.passed) {
        const formalReport = scanPatchHeuristics(proposedPatch, {
          invariants: options.formalInvariants,
        });
        if (!formalReport.allProved) {
          guardResult.passed = false;
          for (const ce of formalReport.counterexamples) {
            guardResult.violations.push(
              `FORMAL_PROVER_COUNTEREXAMPLE (${ce.proofId} on ${ce.targetSymbol}): input=${JSON.stringify(
                ce.counterexampleTrace?.inputState ?? {}
              )} fixture=${ce.counterexampleTrace?.reproducibleFixtureCode ?? ""}`
            );
          }
          for (const to of formalReport.timedOut) {
            guardResult.violations.push(
              `FORMAL_PROVER_TIMEOUT (${to.proofId} on ${to.targetSymbol}): exceeded ${to.executionTimeMs}ms`
            );
          }
        }
      }

      if (!guardResult.passed) {
        // Violazione invariante di sicurezza (es. test rimossi o file fuori scope)
        attempts.push({
          iteration,
          violations: diagnosticReport.violations,
          proposedPatch: patchRecord,
          guardResult,
          success: false,
        });

        finalStatus = "GUARD_VIOLATION";
        await executeAtomicRollback();
        break;
      }

      // 6. Applicazione su disco della patch validata
      for (const [filePath, newContent] of proposedPatch.entries()) {
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(targetPath, filePath);
        await fs.mkdir(path.dirname(absPath), { recursive: true });
        await fs.writeFile(absPath, newContent, "utf-8");
      }

      // Se TIA è abilitato, calcola i test impattati dalle modifiche per la prossima iterazione
      if (options?.useTia && proposedPatch.size > 0) {
        try {
          const tiaResult = await runTia(targetPath, Array.from(proposedPatch.keys()));
          if (!tiaResult.isGloballyInvalidated && tiaResult.impactedTests.length > 0) {
            targetTestFiles = tiaResult.impactedTests;
          } else {
            targetTestFiles = undefined;
          }
        } catch {
          targetTestFiles = undefined;
        }
      } else {
        targetTestFiles = undefined;
      }

      attempts.push({
        iteration,
        violations: diagnosticReport.violations,
        proposedPatch: patchRecord,
        guardResult,
        success: true,
      });
    }

    // Se non abbiamo raggiunto il successo, eseguiamo l'Atomic Rollback garantito
    if (finalStatus !== "SUCCESS" && !restoredRollback) {
      await executeAtomicRollback();
    }

    // Se abilitato il Circuit Breaker e il loop non ha avuto successo, convoca la War Room d'emergenza
    if (finalStatus !== "SUCCESS" && options?.enableWarRoomCircuitBreaker) {
      const trigger = finalStatus === "GUARD_VIOLATION" ? "DIFF_GUARD_VIOLATION" : "SELF_HEALING_EXHAUSTED";
      await WarRoomEngine.declareIncident({
        targetPath,
        trigger,
        targetTicketId: options?.ticketId || "TCK-SELF-HEALING",
        affectedFiles: Array.from(originalFilesSnapshot.keys()),
        rootCause: `Self-healing loop failed to converge after ${iterationsRun}/${maxIterations} iterations. Final status: ${finalStatus}.`,
        originalSnapshot: originalFilesSnapshot,
      });
    }
  } catch (error) {
    // In caso di eccezione inattesa, garanzia di rollback nel blocco catch/finally
    if (!restoredRollback) {
      await executeAtomicRollback();
    }
    throw error;
  }

  const durationMs = Math.round(performance.now() - startTime);

  return HealingSessionResultSchema.parse({
    status: finalStatus,
    iterationsRun,
    maxIterations,
    restoredRollback,
    finalGatekeeperResult: lastGatekeeperResult,
    attempts,
    durationMs,
  });
}
