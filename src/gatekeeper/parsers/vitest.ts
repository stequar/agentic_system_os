import { DiagnosticViolationSchema, type DiagnosticViolation } from "../../contracts/healing.js";

function cleanAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parser per emissioni di Vitest e Jest.
 * Estrae asserzioni fallite e stack trace indicanti file, riga e colonna.
 */
export function parseVitestOutput(rawOutput: string): DiagnosticViolation[] {
  const clean = cleanAnsi(rawOutput);
  const violations: DiagnosticViolation[] = [];

  // 1. Vitest pattern:
  // AssertionError: expected 40 to be 42
  //   ❯ tests/calc.test.ts:18:5
  // Il gap tra il messaggio e la riga di stack è LIMITATO (<=400 char) per non "agganciare"
  // un `Error:`/`at path:line:col` appartenente a output di un altro runner (es. in modalità auto).
  const vitestBlockRegex = /(?:AssertionError|Error):\s*([^\n\r]+)[\s\S]{0,400}?(?:❯|\bat\b)\s*([^\s():]+):(\d+):(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = vitestBlockRegex.exec(clean)) !== null) {
    const message = match[1].trim();
    const file = match[2].trim();
    const line = parseInt(match[3], 10);
    const col = parseInt(match[4], 10);

    try {
      const violation = DiagnosticViolationSchema.parse({
        file,
        line,
        column: col,
        code: "TEST_ASSERTION_FAILED",
        severity: "error",
        message,
        sourceRunner: "vitest",
      });
      violations.push(violation);
    } catch {
      // Ignora righe non conformi
    }
  }

  // 2. Fallback per test file con FAIL ma senza stack trace esplicito a 3 parti
  if (violations.length === 0) {
    const failFileRegex = /(?:^|\n)\s*(?:FAIL|✕)\s+([^\s\n\r]+)/g;
    let failMatch: RegExpExecArray | null;
    while ((failMatch = failFileRegex.exec(clean)) !== null) {
      const file = failMatch[1].trim();
      try {
        const violation = DiagnosticViolationSchema.parse({
          file,
          line: 1,
          severity: "error",
          message: "Test suite fallita",
          sourceRunner: "vitest",
        });
        violations.push(violation);
      } catch {
        // Ignora
      }
    }
  }

  return violations;
}
