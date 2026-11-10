import { type DiagnosticReport } from "../../contracts/healing.js";
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
export declare function parseDiagnostics(rawOutput: string, runner?: string): DiagnosticReport;
//# sourceMappingURL=index.d.ts.map