import { DiagnosticViolationSchema } from "../../contracts/healing.js";
function cleanAnsi(text) {
    return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}
/**
 * Parser per emissioni di Go (`go test` e `go build`).
 * Supporta errori di compilazione e fallimenti di test con coordinate di riga e colonna.
 */
export function parseGoOutput(rawOutput) {
    const clean = cleanAnsi(rawOutput);
    const violations = [];
    // 1. Build & Compiler errors:
    // ./server.go:25:2: undefined: HandleRequest
    // main.go:10:14: not enough arguments in call to Add
    const compilerRegex = /(?:^|\n)([\w\-./\\]+\.go):(\d+):(\d+):\s*([^\n\r]+)/g;
    let match;
    while ((match = compilerRegex.exec(clean)) !== null) {
        const file = match[1].trim();
        const line = parseInt(match[2], 10);
        const col = parseInt(match[3], 10);
        const message = match[4].trim();
        try {
            const violation = DiagnosticViolationSchema.parse({
                file,
                line,
                column: col,
                code: "GO_COMPILER_ERROR",
                severity: "error",
                message,
                sourceRunner: "go",
            });
            violations.push(violation);
        }
        catch {
            // Ignora righe non conformi
        }
    }
    // 2. Go test failures:
    // --- FAIL: TestAdd (0.00s)
    //     calc_test.go:15: expected 42, got 40
    const testFailureRegex = /(?:^|\n)\s+([\w\-./\\]+\.go):(\d+):\s*([^\n\r]+)/g;
    while ((match = testFailureRegex.exec(clean)) !== null) {
        const file = match[1].trim();
        const line = parseInt(match[2], 10);
        const message = match[3].trim();
        // Evita duplicati se già catturato dal regex precedente
        if (!violations.some((v) => v.file === file && v.line === line)) {
            try {
                const violation = DiagnosticViolationSchema.parse({
                    file,
                    line,
                    code: "GO_TEST_FAILURE",
                    severity: "error",
                    message,
                    sourceRunner: "go",
                });
                violations.push(violation);
            }
            catch {
                // Ignora
            }
        }
    }
    return violations;
}
//# sourceMappingURL=go.js.map