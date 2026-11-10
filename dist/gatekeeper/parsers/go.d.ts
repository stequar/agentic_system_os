import { type DiagnosticViolation } from "../../contracts/healing.js";
/**
 * Parser per emissioni di Go (`go test` e `go build`).
 * Supporta errori di compilazione e fallimenti di test con coordinate di riga e colonna.
 */
export declare function parseGoOutput(rawOutput: string): DiagnosticViolation[];
//# sourceMappingURL=go.d.ts.map