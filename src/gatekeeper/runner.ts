import { exec } from "node:child_process";
import fs from "node:fs";
import {
  GatekeeperResultSchema,
  type GatekeeperResult,
} from "../contracts/review.js";

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

interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  error?: Error;
}

/**
 * Classifies a command string into typecheck, lint, or test/generic categories.
 */
export function classifyCommand(cmd: string): ClassifiedCommand {
  const isTypecheck = /(?:typecheck|tsc|mypy|pyright)/i.test(cmd);
  const isLint = /(?:lint|eslint|flake8|ruff|clippy)/i.test(cmd);
  const isExplicitTest = /(?:test|vitest|jest|pytest|cargo\s+test|swift\s+test)/i.test(cmd);

  // If command is neither typecheck nor lint, or explicitly invokes a test runner, mark as test
  const isTest = isExplicitTest || (!isTypecheck && !isLint);

  return { isTypecheck, isLint, isTest };
}

/**
 * Strips ANSI escape codes from terminal outputs to facilitate reliable regex matching.
 */
function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

/**
 * Parses test execution counts (total and failed) from various popular test runner outputs.
 * Supports Jest/Vitest, Pytest, Cargo test, Python unittest, TAP, and generic output.
 */
export function parseTestCounts(output: string): ParsedTestCounts | null {
  const clean = stripAnsi(output);

  // 1. Vitest / Jest pattern (e.g., "Tests: 1 failed, 2 passed, 3 total" or "Tests: 2 passed, 2 total")
  const jestMatch = clean.match(/(?:^|\n)\s*(?:Tests|Test Files):\s+([^\n\r]+)/i);
  if (jestMatch) {
    const line = jestMatch[1];
    const failedMatch = line.match(/(\d+)\s+failed/i);
    const passedMatch = line.match(/(\d+)\s+passed/i);
    const totalMatch = line.match(/(\d+)\s+total/i);
    const skippedMatch = line.match(/(\d+)\s+(?:skipped|todo)/i);

    const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
    let total = totalMatch ? parseInt(totalMatch[1], 10) : failed + passed + skipped;
    if (total === 0 && (failed > 0 || passed > 0)) {
      total = failed + passed;
    }
    if (total > 0 || failed > 0) {
      return { total, failed };
    }
  }

  // 2. Pytest pattern (e.g., "=== 1 failed, 2 passed in 0.12s ===" or "=== 2 passed in 0.05s ===")
  const pytestMatch = clean.match(/=+\s+([0-9a-zA-Z, ]+?)\s+in\s+[\d\.]+s\s+=+/i);
  if (pytestMatch) {
    const line = pytestMatch[1];
    const failed = parseInt(line.match(/(\d+)\s+failed/i)?.[1] ?? "0", 10);
    const passed = parseInt(line.match(/(\d+)\s+passed/i)?.[1] ?? "0", 10);
    const total = failed + passed;
    if (total > 0) {
      return { total, failed };
    }
  }

  // 3. Cargo test pattern (e.g., "test result: ok. 5 passed; 0 failed; ..." or "test result: FAILED. 4 passed; 1 failed; ...")
  const cargoMatch = clean.match(/test result:\s+(?:ok|FAILED)\.\s+(\d+)\s+passed;\s+(\d+)\s+failed;/i);
  if (cargoMatch) {
    const passed = parseInt(cargoMatch[1], 10);
    const failed = parseInt(cargoMatch[2], 10);
    return { total: passed + failed, failed };
  }

  // 4. Python unittest pattern (e.g., "Ran 5 tests in 0.002s\n\nFAILED (failures=2, errors=1)" or "Ran 3 tests\n\nOK")
  const unittestMatch = clean.match(/Ran\s+(\d+)\s+tests?/i);
  if (unittestMatch) {
    const total = parseInt(unittestMatch[1], 10);
    let failed = 0;
    const fMatch = clean.match(/failures=(\d+)/i);
    const eMatch = clean.match(/errors=(\d+)/i);
    if (fMatch) failed += parseInt(fMatch[1], 10);
    if (eMatch) failed += parseInt(eMatch[1], 10);
    if (clean.includes("FAILED") && failed === 0) {
      failed = 1;
    }
    return { total, failed };
  }

  // 5. TAP pattern (e.g., "# tests 4\n# pass 3\n# fail 1")
  const tapTests = clean.match(/#\s+tests\s+(\d+)/i);
  if (tapTests) {
    const total = parseInt(tapTests[1], 10);
    const fMatch = clean.match(/#\s+fail\s+(\d+)/i);
    const failed = fMatch ? parseInt(fMatch[1], 10) : 0;
    return { total, failed };
  }

  // 6. Generic "X tests passed, Y tests failed" pattern
  const genPassedMatch = clean.match(/(\d+)\s+tests?\s+passed/i);
  const genFailedMatch = clean.match(/(\d+)\s+tests?\s+failed/i);
  if (genPassedMatch || genFailedMatch) {
    const passed = parseInt(genPassedMatch?.[1] ?? "0", 10);
    const failed = parseInt(genFailedMatch?.[1] ?? "0", 10);
    const total = passed + failed;
    if (total > 0) {
      return { total, failed };
    }
  }

  return null;
}

/**
 * Executes a single command in the specified directory with timeout and output capture.
 */
function executeCommand(
  cmd: string,
  cwd: string,
  timeoutMs: number
): Promise<CommandExecutionResult> {
  return new Promise((resolve) => {
    let timedOut = false;
    let timer: NodeJS.Timeout | undefined;

    const child = exec(
      cmd,
      {
        cwd,
        timeout: timeoutMs,
        maxBuffer: 20 * 1024 * 1024,
        killSignal: "SIGTERM",
      },
      (error, stdout, stderr) => {
        if (timer) {
          clearTimeout(timer);
        }
        const stdoutStr = stdout?.toString() ?? "";
        const stderrStr = stderr?.toString() ?? "";

        if (error) {
          const isKilled = Boolean(
            error.killed || timedOut || error.signal === "SIGTERM" || (error as { code?: unknown }).code === "ETIMEDOUT"
          );
          const exitCode = typeof error.code === "number" ? error.code : 1;
          resolve({
            stdout: stdoutStr,
            stderr: stderrStr,
            exitCode,
            timedOut: isKilled,
            error,
          });
        } else {
          resolve({
            stdout: stdoutStr,
            stderr: stderrStr,
            exitCode: 0,
            timedOut: false,
          });
        }
      }
    );

    // Fallback safety timer if exec child process hangs past timeoutMs
    timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGTERM");
      } catch {
        // Child process may already have terminated
      }
    }, timeoutMs + 1000);
  });
}

/**
 * Runs the deterministic gatekeeper on a target path using a list of commands.
 * Sequentially executes each command, monitors timeouts, aggregates outputs,
 * categorizes typecheck, lint, and test statuses, parses test metrics, and validates
 * the final result against GatekeeperResultSchema.
 */
export async function runGatekeeper(
  targetPath: string,
  testCommands: string[],
  options?: GatekeeperOptions
): Promise<GatekeeperResult> {
  const timeoutMs = options?.timeoutMs ?? 60000;

  // Handle non-existent or invalid directory gracefully
  if (!fs.existsSync(targetPath)) {
    const rawOutput = `Error: Target directory does not exist: ${targetPath}`;
    return GatekeeperResultSchema.parse({
      typecheckPassed: false,
      linterPassed: false,
      testsPassed: false,
      totalTests: testCommands.length > 0 ? testCommands.length : 1,
      failedTests: testCommands.length > 0 ? testCommands.length : 1,
      rawOutput,
    });
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    const rawOutput = `Error: Target path is not a directory: ${targetPath}`;
    return GatekeeperResultSchema.parse({
      typecheckPassed: false,
      linterPassed: false,
      testsPassed: false,
      totalTests: testCommands.length > 0 ? testCommands.length : 1,
      failedTests: testCommands.length > 0 ? testCommands.length : 1,
      rawOutput,
    });
  }

  // Handle empty commands list
  if (testCommands.length === 0) {
    return GatekeeperResultSchema.parse({
      typecheckPassed: true,
      linterPassed: true,
      testsPassed: true,
      totalTests: 0,
      failedTests: 0,
      rawOutput: "No test commands provided.",
    });
  }

  let typecheckPassed = true;
  let linterPassed = true;
  let testsPassed = true;

  let hasMatchedParser = false;
  let totalTestsFromParsers = 0;
  let failedTestsFromParsers = 0;

  let unparsedCommandsTotal = 0;
  let unparsedCommandsFailed = 0;

  const rawOutputChunks: string[] = [];

  for (let cmd of testCommands) {
    const { isTypecheck, isLint, isTest } = classifyCommand(cmd);

    // Se sono specificati file di test mirati (TIA inner-loop), applicali al comando di test
    if (options?.targetTestFiles && options.targetTestFiles.length > 0 && isTest) {
      if (cmd.includes("vitest") || cmd.includes("jest")) {
        cmd = `${cmd} ${options.targetTestFiles.join(" ")}`;
      } else if (cmd === "npm test") {
        cmd = `npm test -- ${options.targetTestFiles.join(" ")}`;
      }
    }

    const result = await executeCommand(cmd, targetPath, timeoutMs);

    const cmdPassed = !result.timedOut && result.exitCode === 0;

    if (isTypecheck && !cmdPassed) {
      typecheckPassed = false;
    }

    if (isLint && !cmdPassed) {
      linterPassed = false;
    }

    if (isTest) {
      if (!cmdPassed) {
        testsPassed = false;
      }

      const combinedOutput = `${result.stdout}\n${result.stderr}`;
      const parsedCounts = parseTestCounts(combinedOutput);

      if (parsedCounts) {
        hasMatchedParser = true;
        totalTestsFromParsers += parsedCounts.total;
        failedTestsFromParsers += parsedCounts.failed;
      } else {
        unparsedCommandsTotal += 1;
        if (!cmdPassed) {
          unparsedCommandsFailed += 1;
        }
      }
    }

    // Build execution log chunk
    rawOutputChunks.push(`--- Command: ${cmd} ---`);
    if (result.stdout.trim()) {
      rawOutputChunks.push(result.stdout.trim());
    }
    if (result.stderr.trim()) {
      rawOutputChunks.push(result.stderr.trim());
    }
    if (result.timedOut) {
      rawOutputChunks.push(`[TIMEOUT] Command timed out after ${timeoutMs}ms: ${cmd}`);
    } else if (!cmdPassed) {
      rawOutputChunks.push(`[FAILED] Command exited with code ${result.exitCode}: ${cmd}`);
    } else {
      rawOutputChunks.push(`[SUCCESS] Command exited with code 0: ${cmd}`);
    }
    rawOutputChunks.push("");
  }

  // Calculate aggregated test metrics
  let totalTests = 0;
  let failedTests = 0;

  if (hasMatchedParser) {
    totalTests = totalTestsFromParsers + unparsedCommandsTotal;
    failedTests = failedTestsFromParsers + unparsedCommandsFailed;
  } else {
    totalTests = unparsedCommandsTotal;
    failedTests = unparsedCommandsFailed;
  }

  // Ensure logical consistency between test status and counts
  if (!testsPassed && failedTests === 0) {
    failedTests = 1;
    if (totalTests === 0) {
      totalTests = 1;
    }
  }

  if (testsPassed && failedTests > 0) {
    testsPassed = false;
  }

  const rawOutput = rawOutputChunks.join("\n").trim();

  const finalResult: GatekeeperResult = {
    typecheckPassed,
    linterPassed,
    testsPassed,
    totalTests,
    failedTests,
    rawOutput,
  };

  return GatekeeperResultSchema.parse(finalResult);
}
