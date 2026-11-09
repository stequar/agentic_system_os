import { DiagnosticViolationSchema, type DiagnosticViolation } from "../../contracts/healing.js";

function cleanAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parser per emissioni di test runner Python (Pytest e Unittest).
 * Supporta formati di traceback dettagliati e righe riassuntive FAILED.
 */
export function parsePytestOutput(rawOutput: string): DiagnosticViolation[] {
  const clean = cleanAnsi(rawOutput);
  const violations: DiagnosticViolation[] = [];

  // 1. Traceback dettagliato:
  // tests/test_api.py:42: in test_endpoint
  // E   AssertionError: assert 404 == 200
  const tracebackRegex = /(?:^|\n)([\w\-./\\]+\.py):(\d+):\s+(?:in\s+[^\n]+\n)[\s\S]*?(?:E\s+([A-Za-z0-9_]+Error:[^\n]+|assert\s+[^\n]+))/g;
  let match: RegExpExecArray | null;

  while ((match = tracebackRegex.exec(clean)) !== null) {
    const file = match[1].trim();
    const line = parseInt(match[2], 10);
    const message = match[3].trim();

    try {
      const violation = DiagnosticViolationSchema.parse({
        file,
        line,
        severity: "error",
        code: "PYTEST_ASSERTION_ERROR",
        message,
        sourceRunner: "pytest",
      });
      violations.push(violation);
    } catch {
      // Ignora righe non conformi
    }
  }

  // 2. Summary format: FAILED tests/test_api.py::test_endpoint - AssertionError: 404 == 200
  const summaryRegex = /(?:^|\n)FAILED\s+([\w\-./\\]+\.py)(?:::(\w+))?\s+-\s+([^\n\r]+)/g;
  while ((match = summaryRegex.exec(clean)) !== null) {
    const file = match[1].trim();
    const testFunc = match[2]?.trim();
    const rawMsg = match[3].trim();
    const message = testFunc ? `${testFunc} -> ${rawMsg}` : rawMsg;

    // Evita duplicati se già catturato con traceback
    if (!violations.some((v) => v.file === file)) {
      try {
        const violation = DiagnosticViolationSchema.parse({
          file,
          line: 1,
          severity: "error",
          code: "PYTEST_FAILURE",
          message,
          sourceRunner: "pytest",
        });
        violations.push(violation);
      } catch {
        // Ignora
      }
    }
  }

  return violations;
}
