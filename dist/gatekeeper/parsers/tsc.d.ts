import { type DiagnosticViolation } from "../../contracts/healing.js";
/**
 * Parser per emissioni del compilatore TypeScript (`tsc`).
 * Supporta formati standard:
 *   src/index.ts(42,15): error TS2322: Type 'string' is not assignable to type 'number'.
 *   src/utils.ts(10): warning TS6133: 'x' is declared but its value is never read.
 */
export declare function parseTscOutput(rawOutput: string): DiagnosticViolation[];
//# sourceMappingURL=tsc.d.ts.map