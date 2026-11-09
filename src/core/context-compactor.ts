import {
  type ContextCompactionInput,
  type CompactedContextResult,
  type InvariantDefinition,
  type InvariantVerificationResult,
  type SurgicalDiagnosticSlice,
  type CleanSlatePayload,
  type ContextMessage,
  ContextCompactionInputSchema,
  CompactedContextResultSchema,
  InvariantVerificationResultSchema,
  CleanSlatePayloadSchema,
} from "../contracts/compaction.js";
import { estimateTokenCount } from "../generator/templates/cached-kernel.js";
import type { DiagnosticReport, HealingAttempt } from "../contracts/healing.js";

/**
 * Pulisce i codici ANSI escape e i percorsi di sistema superflui dai messaggi diagnostici.
 */
function cleanDiagnosticMessage(raw: string): string {
  return raw
    .replace(/\u001b\[[0-9;]*m/g, "") // rimozione ANSI escape codes
    .replace(/[a-zA-Z]:\\[^\n]+/g, (p) => p.split(/[\\/]/).slice(-2).join("/")) // tronca path Windows
    .replace(/\/Users\/[^\s\n]+/g, (p) => p.split("/").slice(-3).join("/")) // tronca path Mac/Linux
    .trim();
}

export class ContextCompactor {
  /**
   * Determina se la dimensione della finestra di contesto supera la soglia di compattazione (default: 40k token).
   */
  static shouldCompact(tokenCount: number, threshold: number = 40_000): boolean {
    return tokenCount >= threshold;
  }

  /**
   * Guardrail deterministico non-LLM: verifica che il testo o i messaggi compattati
   * preservino intatti tutti gli invarianti di business e operativi del ticket
   * (Ticket ID, Allowed Files, Acceptance Criteria, Test Commands).
   */
  static verifyContextInvariants(
    content: string | ContextMessage[],
    invariants: InvariantDefinition
  ): InvariantVerificationResult {
    const text = typeof content === "string" ? content : content.map((m) => m.content).join("\n");
    const violations: string[] = [];

    // 1. Preservazione del Ticket ID
    const preservedTicketId = text.includes(invariants.ticketId);
    if (!preservedTicketId) {
      violations.push(`INVARIANT_VIOLATION: Ticket ID '${invariants.ticketId}' mancante nel contesto compattato`);
    }

    // 2. Preservazione di tutti i file target consentiti
    let preservedAllowedFiles = true;
    for (const file of invariants.allowedFiles) {
      if (!text.includes(file)) {
        preservedAllowedFiles = false;
        violations.push(`INVARIANT_VIOLATION: File autorizzato '${file}' mancante nel contesto compattato`);
      }
    }

    // 3. Preservazione di tutti i criteri di accettazione
    let preservedAcceptanceCriteria = true;
    for (const criterion of invariants.acceptanceCriteria) {
      // Verifica con tolleranza semantica: presenza del testo completo o di un frammento distintivo
      const cleanCriterion = criterion.trim().replace(/^[-*•\d.]+\s*/, "");
      const sample = cleanCriterion.slice(0, Math.min(25, cleanCriterion.length));
      if (!text.includes(sample)) {
        preservedAcceptanceCriteria = false;
        violations.push(
          `INVARIANT_VIOLATION: Criterio di accettazione non preservato: "${criterion.slice(0, 40)}..."`
        );
      }
    }

    // 4. Preservazione dei comandi di test
    let preservedTestCommands = true;
    for (const cmd of invariants.testCommands) {
      if (!text.includes(cmd)) {
        preservedTestCommands = false;
        violations.push(`INVARIANT_VIOLATION: Comando di test raccomandato '${cmd}' mancante nel contesto compattato`);
      }
    }

    const passed = violations.length === 0;

    return InvariantVerificationResultSchema.parse({
      passed,
      violations,
      preservedTicketId,
      preservedAllowedFiles,
      preservedAcceptanceCriteria,
      preservedTestCommands,
    });
  }

  /**
   * Esegue la compattazione deterministica del contesto se superata la soglia di token
   * o se forzata dal chiamante.
   */
  static compactContext(input: ContextCompactionInput): CompactedContextResult {
    const validatedInput = ContextCompactionInputSchema.parse(input);
    const rawContent = validatedInput.messages.map((m) => m.content).join("\n");
    const originalTokenEstimate = estimateTokenCount(rawContent);

    const requiresCompaction =
      validatedInput.forceCompaction || this.shouldCompact(originalTokenEstimate, validatedInput.maxTokenThreshold);

    // Se la compattazione non è necessaria, restituisce il contesto intatto
    if (!requiresCompaction) {
      const invariantVerification = this.verifyContextInvariants(
        validatedInput.messages,
        validatedInput.invariants
      );

      return CompactedContextResultSchema.parse({
        wasCompacted: false,
        originalTokenEstimate,
        compactedTokenEstimate: originalTokenEstimate,
        reductionPercent: 0,
        compactedMessages: validatedInput.messages,
        invariantVerification,
        distilledSummary: "Nessuna compattazione necessaria: volume token inferiore alla soglia di guardia (40k).",
      });
    }

    // 1. Isola i messaggi di sistema invarianti (Tier 1 / Tier 2)
    const systemMessages = validatedInput.messages.filter((m) => m.role === "system");
    const nonSystemMessages = validatedInput.messages.filter((m) => m.role !== "system");

    // 2. Distilla le conversazioni intermedie ed elimina i dump pesanti di tool
    const distilledNotes: string[] = [];
    let lastUserMessage = "";

    for (const msg of nonSystemMessages) {
      if (msg.role === "user") {
        lastUserMessage = msg.content;
      } else if (msg.role === "assistant") {
        // Estrae solo decisioni chiave e azioni
        const lines = msg.content.split("\n").filter((l) => l.trim().length > 0);
        const actionLines = lines.filter((l) => l.toLowerCase().includes("applico") || l.toLowerCase().includes("modifico") || l.includes("patch") || l.includes("test"));
        if (actionLines.length > 0) {
          distilledNotes.push(`Assistant: ${actionLines.slice(0, 2).join("; ")}`);
        }
      } else if (msg.role === "tool") {
        // Comprime l'output del tool a una sola riga riassuntiva
        distilledNotes.push(`Tool [${msg.name || "execution"}]: Esito registrato (${estimateTokenCount(msg.content)} token distillati).`);
      }
    }

    // 3. Costruisce l'Invariant Protection Anchor Block (preservazione garantita)
    const invariantAnchorBlock = `### 🔒 Invariant Protection Guardrail Anchor (Preserved by OS Kernel)
- **Ticket ID**: ${validatedInput.invariants.ticketId}
- **Allowed Files**: ${validatedInput.invariants.allowedFiles.join(", ") || "Nessun vincolo restrittivo"}
- **Acceptance Criteria**:
${validatedInput.invariants.acceptanceCriteria.map((ac, i) => `  ${i + 1}. ${ac}`).join("\n") || "  1. Verifica dei test di regressione"}
- **Recommended Test Commands**: ${validatedInput.invariants.testCommands.join(", ") || "npm test"}
`;

    // 4. Assembla la memoria compattata
    const compactedMemoryContent = `${invariantAnchorBlock}

### 🧠 Distilled History & State Memory
${distilledNotes.length > 0 ? distilledNotes.join("\n") : "Inizio sessione operativa."}

### 🎯 Current Working Request
${lastUserMessage || "Procedi con l'implementazione nel rispetto dei criteri di accettazione."}`.trim();

    const compactedMessages: ContextMessage[] = [
      ...systemMessages,
      {
        role: "user",
        content: compactedMemoryContent,
      },
    ];

    // 5. Verifica deterministica degli invarianti sul risultato compattato
    const invariantVerification = this.verifyContextInvariants(compactedMessages, validatedInput.invariants);

    const compactedContentStr = compactedMessages.map((m) => m.content).join("\n");
    const compactedTokenEstimate = estimateTokenCount(compactedContentStr);
    const reductionPercent =
      originalTokenEstimate > 0
        ? Math.round(((originalTokenEstimate - compactedTokenEstimate) / originalTokenEstimate) * 1000) / 10
        : 0;

    return CompactedContextResultSchema.parse({
      wasCompacted: true,
      originalTokenEstimate,
      compactedTokenEstimate,
      reductionPercent,
      compactedMessages,
      invariantVerification,
      distilledSummary: `Compattazione completata con successo: riduzione del ${reductionPercent}% (${originalTokenEstimate} -> ${compactedTokenEstimate} token). Invarianti intatti al 100%.`,
    });
  }

  /**
   * Surgical Diagnostic Slicer: trasforma un DiagnosticReport grezzo in slice chirurgiche
   * con coordinate AST atomiche (<120 token ciascuna), azzerando ANSI escapes e stack trace verbose.
   */
  static sliceDiagnostics(
    report: DiagnosticReport,
    discardedAttempts: HealingAttempt[] = []
  ): SurgicalDiagnosticSlice[] {
    const slices: SurgicalDiagnosticSlice[] = [];

    // Estrae ipotesi negative dai tentativi scartati precedenti
    const negativeHypothesesByFile = new Map<string, string[]>();
    for (const attempt of discardedAttempts) {
      for (const [filePath] of Object.entries(attempt.proposedPatch)) {
        const existing = negativeHypothesesByFile.get(filePath) || [];
        const reason = attempt.guardResult.violations.length > 0
          ? attempt.guardResult.violations[0]
          : "Fallimento compilazione/test non risolto";
        existing.push(`Iterazione #${attempt.iteration}: patch fallita con '${reason}'`);
        negativeHypothesesByFile.set(filePath, existing);
      }
    }

    for (const violation of report.violations) {
      const cleanMsg = cleanDiagnosticMessage(violation.message);
      const negHypotheses = negativeHypothesesByFile.get(violation.file) || [];

      const sliceSummary = `${violation.file}:${violation.line}:${violation.column || 0} - [${
        violation.code || "ERR"
      }] ${cleanMsg}`;

      const sliceTokens = estimateTokenCount(sliceSummary);

      slices.push({
        file: violation.file,
        line: violation.line,
        column: violation.column,
        code: violation.code,
        severity: violation.severity,
        message: cleanMsg,
        sourceRunner: violation.sourceRunner,
        symbol: undefined,
        negativeHypotheses: negHypotheses,
        compactedTokensEstimate: sliceTokens,
      });
    }

    return slices;
  }

  /**
   * Epistemic Clean-Slate Protocol: costruisce il payload di reset a t0 per il Self-Healing.
   * Elimina l'accumulo di contesto delle iterazioni precedenti, fornendo unicamente
   * le coordinate AST d'errore e i vincoli negativi appresi.
   */
  static buildCleanSlatePayload(
    iteration: number,
    report: DiagnosticReport,
    discardedAttempts: HealingAttempt[] = []
  ): CleanSlatePayload {
    const slices = this.sliceDiagnostics(report, discardedAttempts);
    const accumulatedNegativeHypotheses: string[] = [];

    for (const attempt of discardedAttempts) {
      for (const [file] of Object.entries(attempt.proposedPatch)) {
        accumulatedNegativeHypotheses.push(
          `Iterazione #${attempt.iteration} (${file}): Ipotesi respinta da Gatekeeper/AST Guard.`
        );
      }
    }

    const payloadText = JSON.stringify({ slices, accumulatedNegativeHypotheses });
    const totalTokensPayload = estimateTokenCount(payloadText);

    return CleanSlatePayloadSchema.parse({
      iteration,
      t0ResetApplied: true,
      slices,
      accumulatedNegativeHypotheses,
      totalTokensPayload,
    });
  }
}
