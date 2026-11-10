import { DiagnosticReportSchema, } from "../../contracts/healing.js";
import { parseTscOutput } from "./tsc.js";
import { parseVitestOutput } from "./vitest.js";
import { parsePytestOutput } from "./pytest.js";
import { parseCargoOutput } from "./cargo.js";
import { parseGoOutput } from "./go.js";
export { parseTscOutput } from "./tsc.js";
export { parseVitestOutput } from "./vitest.js";
export { parsePytestOutput } from "./pytest.js";
export { parseCargoOutput } from "./cargo.js";
export { parseGoOutput } from "./go.js";
/**
 * Funzione unificata che esegue il parsing semantico dell'output grezzo
 * di compilatori o test runner e produce un DiagnosticReport tipizzato Zod.
 *
 * @param rawOutput L'output grezzo catturato da stdout o stderr
 * @param runner Identificativo del runner (tsc, vitest, pytest, cargo, go) o "generic"/auto
 */
export function parseDiagnostics(rawOutput, runner = "auto") {
    const normalizedRunner = runner.toLowerCase().trim();
    let violations = [];
    switch (normalizedRunner) {
        case "tsc":
        case "typescript":
        case "typecheck":
            violations = parseTscOutput(rawOutput);
            break;
        case "vitest":
        case "jest":
        case "npm test":
            violations = parseVitestOutput(rawOutput);
            break;
        case "pytest":
        case "python":
            violations = parsePytestOutput(rawOutput);
            break;
        case "cargo":
        case "clippy":
        case "cargo test":
            violations = parseCargoOutput(rawOutput);
            break;
        case "go":
        case "go test":
            violations = parseGoOutput(rawOutput);
            break;
        case "auto":
        case "generic":
        default: {
            // Esegue auto-detection aggregando i parser compatibili
            const tscViolations = parseTscOutput(rawOutput);
            const vitestViolations = parseVitestOutput(rawOutput);
            const pytestViolations = parsePytestOutput(rawOutput);
            const cargoViolations = parseCargoOutput(rawOutput);
            const goViolations = parseGoOutput(rawOutput);
            violations = [
                ...tscViolations,
                ...vitestViolations,
                ...pytestViolations,
                ...cargoViolations,
                ...goViolations,
            ];
            break;
        }
    }
    // Deduplicazione delle violazioni con medesime coordinate
    const uniqueViolations = [];
    const seenKeys = new Set();
    for (const v of violations) {
        const key = `${v.file}:${v.line}:${v.column ?? 0}:${v.code ?? ""}:${v.message}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueViolations.push(v);
        }
    }
    const errorCount = uniqueViolations.filter((v) => v.severity === "error").length;
    const warningCount = uniqueViolations.filter((v) => v.severity === "warning").length;
    return DiagnosticReportSchema.parse({
        violations: uniqueViolations,
        errorCount,
        warningCount,
        rawOutput,
        runner: normalizedRunner,
    });
}
//# sourceMappingURL=index.js.map