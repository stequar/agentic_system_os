import fs from "node:fs/promises";
import path from "node:path";
import {
  QuarantineRegistrySchema,
  QuarantinedTestSchema,
  QuarantineEvaluationResultSchema,
  type QuarantineRegistry,
  type QuarantinedTest,
  type QuarantineEvaluationResult,
  type TestRunResult,
} from "../contracts/quarantine.js";
import { CompanyEventBus } from "../core/event-bus.js";
import { atomicWriteFile } from "../utils/fs-atomic.js";

/**
 * Percorso file di registro della quarantena
 */
export function getQuarantineFilePath(targetPath: string): string {
  return path.join(path.resolve(targetPath), ".gatekeeper", "quarantine.json");
}

/**
 * Carica il registro della quarantena dal filesystem o ne crea uno vuoto
 */
export async function loadQuarantineRegistry(targetPath: string): Promise<QuarantineRegistry> {
  const filePath = getQuarantineFilePath(targetPath);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return QuarantineRegistrySchema.parse(JSON.parse(raw));
  } catch {
    return QuarantineRegistrySchema.parse({
      quarantinedTests: [],
      maxAllowedQuarantined: 2,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Salva atomicamente il registro della quarantena
 */
export async function saveQuarantineRegistry(
  targetPath: string,
  registry: QuarantineRegistry
): Promise<void> {
  const filePath = getQuarantineFilePath(targetPath);
  const validated = QuarantineRegistrySchema.parse({
    ...registry,
    updatedAt: new Date().toISOString(),
  });
  await atomicWriteFile(filePath, JSON.stringify(validated, null, 2), { backup: false });
}

/**
 * Verifica se un test è attualmente in quarantena
 */
export async function isTestQuarantined(targetPath: string, testIdentifier: string): Promise<boolean> {
  const registry = await loadQuarantineRegistry(targetPath);
  return registry.quarantinedTests.some((t) => t.testIdentifier === testIdentifier);
}

export interface EvaluateFlakinessOptions {
  targetPath: string;
  testIdentifier: string;
  testFile: string;
  testExecutor: () => Promise<boolean>; // restituisce true se PASS, false se FAIL
  maxAllowed?: number;
  eventBus?: CompanyEventBus;
}

/**
 * Valuta un test secondo l'algoritmo N=3 di alternanza deterministica.
 * Isola in quarantena SOLO se il test alterna PASS e FAIL.
 * Se fallisce 3/3, è un fallimento deterministico (bug reale) e NON va in quarantena.
 */
export async function evaluateTestFlakiness(
  options: EvaluateFlakinessOptions
): Promise<QuarantineEvaluationResult> {
  const runs: TestRunResult[] = [];

  for (let i = 0; i < 3; i++) {
    const pass = await options.testExecutor();
    runs.push(pass ? "PASS" : "FAIL");
  }

  const passCount = runs.filter((r) => r === "PASS").length;
  const failCount = runs.filter((r) => r === "FAIL").length;

  // 1. Caso tutti PASS (3/3)
  if (passCount === 3) {
    return QuarantineEvaluationResultSchema.parse({
      isFlaky: false,
      isDeterministicFailure: false,
      runs,
      actionTaken: "PASS",
      message: `Il test '${options.testIdentifier}' ha superato tutti e 3 i tentativi consecutivi.`,
    });
  }

  // 2. Caso tutti FAIL (3/3): FALLIMENTO DETERMINISTICO
  if (failCount === 3) {
    return QuarantineEvaluationResultSchema.parse({
      isFlaky: false,
      isDeterministicFailure: true,
      runs,
      actionTaken: "REJECTED_DETERMINISTIC",
      message: `Il test '${options.testIdentifier}' ha fallito 3/3 tentativi consecutivi. È un FALLIMENTO DETERMINISTICO reale: divieto di quarantena.`,
    });
  }

  // 3. Caso Alternanza (PASS e FAIL misti): FLAKY TEST
  const registry = await loadQuarantineRegistry(options.targetPath);
  const maxAllowed = options.maxAllowed ?? registry.maxAllowedQuarantined;

  const alreadyQuarantined = registry.quarantinedTests.some(
    (t) => t.testIdentifier === options.testIdentifier
  );

  if (!alreadyQuarantined && registry.quarantinedTests.length >= maxAllowed) {
    return QuarantineEvaluationResultSchema.parse({
      isFlaky: true,
      isDeterministicFailure: false,
      runs,
      actionTaken: "CAP_EXCEEDED",
      message: `Test flaky rilevato (${runs.join(", ")}), ma il limite massimo di test in quarantena (${maxAllowed}) è stato superato. Rifiuto per evitare accumulo di debito tecnico.`,
    });
  }

  const ticketSlug = options.testIdentifier.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
  const issueTicketId = `TCK-FLAKY-${ticketSlug}`;

  const quarantinedRecord: QuarantinedTest = QuarantinedTestSchema.parse({
    testIdentifier: options.testIdentifier,
    testFile: options.testFile,
    runs,
    quarantinedAt: new Date().toISOString(),
    reason: `Test intermittente su N=3 prove: [${runs.join(", ")}]`,
    issueTicketId,
  });

  if (!alreadyQuarantined) {
    registry.quarantinedTests.push(quarantinedRecord);
  } else {
    const idx = registry.quarantinedTests.findIndex((t) => t.testIdentifier === options.testIdentifier);
    registry.quarantinedTests[idx] = quarantinedRecord;
  }

  await saveQuarantineRegistry(options.targetPath, registry);

  const bus = options.eventBus || CompanyEventBus.getInstance();
  await bus.emit({
    type: "FLAKY_TEST_QUARANTINED",
    sourceAgent: "quarantine_engine",
    level: "warn",
    payload: {
      testIdentifier: options.testIdentifier,
      testFile: options.testFile,
      runs,
      issueTicketId,
    },
  });

  return QuarantineEvaluationResultSchema.parse({
    isFlaky: true,
    isDeterministicFailure: false,
    runs,
    actionTaken: "QUARANTINED",
    quarantinedRecord,
    message: `Test '${options.testIdentifier}' isolato in quarantena con successo (vettore N=3: [${runs.join(", ")}]). Assegnato ticket: ${issueTicketId}.`,
  });
}

/**
 * Formatta un ticket Markdown da aggiungere al backlog del prodotto per il test in quarantena
 */
export function formatBacklogTicket(quarantinedTest: QuarantinedTest): string {
  return `### 🎫 ${quarantinedTest.issueTicketId || "TCK-FLAKY-UNRESOLVED"}: Risoluzione Flaky Test '${quarantinedTest.testIdentifier}' (Priorità Alta ⚠️)
- **Epica:** Technical Debt & Test Stability
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** \`${quarantinedTest.testFile}\`
- **Rilevato il:** \`${quarantinedTest.quarantinedAt}\`
- **Diagnostica N=3:** \`[${quarantinedTest.runs.join(", ")}]\`
- **Obiettivo:** Isolare la race condition o la dipendenza da timing/stato condiviso e rimuovere il test dalla quarantena.
`;
}
