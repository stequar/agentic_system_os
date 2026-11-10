import { type DiagnosticViolation } from "../../contracts/healing.js";
/**
 * Parser per emissioni di Vitest e Jest.
 * Estrae asserzioni fallite e stack trace indicanti file, riga e colonna.
 */
export declare function parseVitestOutput(rawOutput: string): DiagnosticViolation[];
//# sourceMappingURL=vitest.d.ts.map