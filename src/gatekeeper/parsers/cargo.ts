import { DiagnosticViolationSchema, type DiagnosticViolation } from "../../contracts/healing.js";

function cleanAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parser per emissioni di Cargo e Clippy (compilazione, linting e test runner Rust).
 */
export function parseCargoOutput(rawOutput: string): DiagnosticViolation[] {
  const clean = cleanAnsi(rawOutput);
  const violations: DiagnosticViolation[] = [];

  // 1. Compiler & Clippy diagnostics:
  // error[E0308]: mismatched types
  //   --> src/main.rs:14:5
  const compilerRegex = /(?:^|\n)(error|warning)(?:\[(E\d+)\])?:\s*([^\n\r]+)[\s\S]*?-->\s*([^\s():]+):(\d+):(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = compilerRegex.exec(clean)) !== null) {
    const severityRaw = match[1].toLowerCase();
    const severity = severityRaw === "warning" ? "warning" : "error";
    const code = match[2]?.trim() || (severity === "warning" ? "CLIPPY_WARNING" : "CARGO_ERROR");
    const message = match[3].trim();
    const file = match[4].trim();
    const line = parseInt(match[5], 10);
    const col = parseInt(match[6], 10);

    try {
      const violation = DiagnosticViolationSchema.parse({
        file,
        line,
        column: col,
        code,
        severity,
        message,
        sourceRunner: "cargo",
      });
      violations.push(violation);
    } catch {
      // Ignora righe non conformi
    }
  }

  // 2. Cargo test panic pattern:
  // thread 'tests::test_add' panicked at src/lib.rs:25:9:
  // assertion `left == right` failed
  const testPanicRegex = /panicked at\s+([^\s():]+):(\d+):(\d+):(?:\s*\n)?\s*([^\n\r]+)/g;
  while ((match = testPanicRegex.exec(clean)) !== null) {
    const file = match[1].trim();
    const line = parseInt(match[2], 10);
    const col = parseInt(match[3], 10);
    const message = match[4].trim();

    try {
      const violation = DiagnosticViolationSchema.parse({
        file,
        line,
        column: col,
        code: "RUST_TEST_PANIC",
        severity: "error",
        message,
        sourceRunner: "cargo",
      });
      violations.push(violation);
    } catch {
      // Ignora
    }
  }

  return violations;
}
