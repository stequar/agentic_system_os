import { type GatekeeperResult } from "../contracts/review.js";
export interface GatekeeperOptions {
    timeoutMs?: number;
    targetTestFiles?: string[];
}
export interface ClassifiedCommand {
    isTypecheck: boolean;
    isLint: boolean;
    isTest: boolean;
}
export interface ParsedTestCounts {
    total: number;
    failed: number;
}
/**
 * Classifies a command string into typecheck, lint, or test/generic categories.
 */
export declare function classifyCommand(cmd: string): ClassifiedCommand;
/**
 * Parses test execution counts (total and failed) from various popular test runner outputs.
 * Supports Jest/Vitest, Pytest, Cargo test, Python unittest, TAP, and generic output.
 */
export declare function parseTestCounts(output: string): ParsedTestCounts | null;
/**
 * Runs the deterministic gatekeeper on a target path using a list of commands.
 * Sequentially executes each command, monitors timeouts, aggregates outputs,
 * categorizes typecheck, lint, and test statuses, parses test metrics, and validates
 * the final result against GatekeeperResultSchema.
 */
export declare function runGatekeeper(targetPath: string, testCommands: string[], options?: GatekeeperOptions): Promise<GatekeeperResult>;
//# sourceMappingURL=runner.d.ts.map