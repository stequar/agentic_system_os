import { DiagnosticViolationSchema, type DiagnosticViolation } from "../../contracts/healing.js";

/**
 * Rimuove i codici escape ANSI per facilitare il parsing delle regex.
 */
function cleanAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parser per emissioni del compilatore TypeScript (`tsc`).
 * Supporta formati standard:
 *   src/index.ts(42,15): error TS2322: Type 'string' is not assignable to type 'number'.
 *   src/utils.ts(10): warning TS6133: 'x' is declared but its value is never read.
 */
export function parseTscOutput(rawOutput: string): DiagnosticViolation[] {
  const clean = cleanAnsi(rawOutput);
  const violations: DiagnosticViolation[] = [];

  // Pattern principale: file.ts(line,col): (error|warning) TSXXXX: message
  const standardRegex = /(?:^|\n)([\w\-./\\]+\.tsx?)\((\d+)(?:,(\d+))?\):\s*(error|warning)\s*([A-Z0-9]+)?:\s*([^\n\r]+)/g;

  let match: RegExpExecArray | null;
  while ((match = standardRegex.exec(clean)) !== null) {
    const file = match[1].trim();
    const line = parseInt(match[2], 10);
    const col = match[3] ? parseInt(match[3], 10) : undefined;
    const severityRaw = match[4].toLowerCase();
    const severity = severityRaw === "warning" ? "warning" : "error";
    const code = match[5]?.trim();
    const message = match[6].trim();

    try {
      const violation = DiagnosticViolationSchema.parse({
        file,
        line,
        column: col,
        code,
        severity,
        message,
        sourceRunner: "tsc",
      });
      violations.push(violation);
    } catch {
      // Ignora righe non conformi allo schema
    }
  }

  return violations;
}
