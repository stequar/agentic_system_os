import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  extractCodeHeuristics,
  scanCodeHeuristics,
  scanPatchHeuristics,
} from "../src/gatekeeper/formal-prover.js";
import { HeuristicScanResultSchema } from "../src/contracts/frontiers.js";
import { runSelfHealingLoop } from "../src/gatekeeper/self-healing.js";
import { createMcpServer } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";

describe("Sprint 20: Heuristic Static Scanner & Risk-Pattern Detection", () => {
  it("estrae correttamente parametri, precondizioni e postcondizioni Hoare {P} C {Q}", () => {
    const code = `
/**
 * @requires divisor !== 0
 * @ensures result >= 0
 */
export function computeRatio(amount: number, divisor: number, label?: string | null): number {
  if (divisor === 0) return 0;
  return amount / divisor;
}
`;
    const extracted = extractCodeHeuristics(code, "computeRatio");
    expect(extracted.symbolName).toBe("computeRatio");
    expect(extracted.parameters).toHaveLength(3);
    expect(extracted.parameters[0]?.name).toBe("amount");
    expect(extracted.parameters[0]?.numeric).toBe(true);
    expect(extracted.parameters[2]?.name).toBe("label");
    expect(extracted.parameters[2]?.nullable).toBe(true);
    expect(extracted.preconditions).toContain("divisor !== 0");
    expect(extracted.postconditions).toContain("result >= 0");
  });

  it("certifica HEURISTIC_PASSED quando tutte le invarianti sono protette da guardie esplicite", () => {
    const safeCode = `
export function safeDivide(numerator: number, divisor: number): number {
  if (divisor === 0) {
    return 0;
  }
  return numerator / divisor;
}
`;
    const proof = scanCodeHeuristics({
      targetFilePath: "src/math/safe-divide.ts",
      sourceCode: safeCode,
      targetSymbol: "safeDivide",
      scanEngine: "PATTERN_HEURISTIC",
    });

    expect(() => HeuristicScanResultSchema.parse(proof)).not.toThrow();
    expect(proof.status).toBe("HEURISTIC_PASSED");
    expect(proof.scanEngine).toBe("PATTERN_HEURISTIC");
    expect(proof.counterexampleTrace).toBeUndefined();
    expect(proof.invariantsChecked).toContain("division_by_zero_guard");
  });

  it("individua COUNTEREXAMPLE_FOUND per divisione per zero non protetta e sintetizza fixture Vitest e Pytest", () => {
    const unsafeTs = `
export function calculateShare(total: number, divisor: number): number {
  return total / divisor;
}
`;
    const proofTs = scanCodeHeuristics({
      targetFilePath: "src/finance/share.ts",
      sourceCode: unsafeTs,
      targetSymbol: "calculateShare",
    });

    expect(proofTs.status).toBe("COUNTEREXAMPLE_FOUND");
    expect(proofTs.counterexampleTrace).toBeDefined();
    expect(proofTs.counterexampleTrace?.inputState).toEqual({
      total: 10,
      divisor: 0,
    });
    expect(proofTs.counterexampleTrace?.reproducibleFixtureCode).toContain(
      'import { describe, it, expect } from "vitest";'
    );
    expect(proofTs.counterexampleTrace?.reproducibleFixtureCode).toContain(
      "calculateShare(10, 0)"
    );

    const unsafePy = `
def compute_average(total: float, count: int) -> float:
    return total / count
`;
    const proofPy = scanCodeHeuristics({
      targetFilePath: "analytics/stats.py",
      sourceCode: unsafePy,
      targetSymbol: "compute_average",
    });

    expect(proofPy.status).toBe("COUNTEREXAMPLE_FOUND");
    expect(proofPy.counterexampleTrace?.inputState).toEqual({
      total: 10,
      count: 0,
    });
    expect(proofPy.counterexampleTrace?.reproducibleFixtureCode).toContain(
      "import pytest"
    );
    expect(proofPy.counterexampleTrace?.reproducibleFixtureCode).toContain(
      "compute_average(10, 0)"
    );
  });

  it("individua COUNTEREXAMPLE_FOUND per dereferenziazione nulla (non_null_dereference) e array out-of-bounds", () => {
    const unsafeNullCode = `
export function formatProfile(user: { name: string } | null): string {
  return user.name.toUpperCase();
}
`;
    const nullProof = scanCodeHeuristics({
      targetFilePath: "src/profile.ts",
      sourceCode: unsafeNullCode,
      targetSymbol: "formatProfile",
    });

    expect(nullProof.status).toBe("COUNTEREXAMPLE_FOUND");
    expect(nullProof.counterexampleTrace?.inputState).toEqual({ user: null });
    expect(nullProof.counterexampleTrace?.reproducibleFixtureCode).toContain(
      "formatProfile(null)"
    );

    const unsafeArrayCode = `
export function pickElement(items: string[], idx: number): string {
  return items[idx];
}
`;
    const arrayProof = scanCodeHeuristics({
      targetFilePath: "src/list.ts",
      sourceCode: unsafeArrayCode,
      targetSymbol: "pickElement",
    });

    expect(arrayProof.status).toBe("COUNTEREXAMPLE_FOUND");
    expect(arrayProof.counterexampleTrace?.inputState).toEqual({
      items: [],
      idx: -1,
    });
  });

  it("individua COUNTEREXAMPLE_FOUND su violazione postcondizione Hoare {Q: result >= 0} (no_negative_balance)", () => {
    const unsafeDebit = `
/**
 * @ensures result >= 0
 */
export function withdraw(balance: number, amount: number): number {
  return balance - amount;
}
`;
    const proof = scanCodeHeuristics({
      targetFilePath: "src/ledger.ts",
      sourceCode: unsafeDebit,
      targetSymbol: "withdraw",
      invariants: ["no_negative_balance"],
    });

    expect(proof.status).toBe("COUNTEREXAMPLE_FOUND");
    expect(proof.counterexampleTrace?.inputState).toEqual({
      balance: 10,
      amount: 50,
    });
  });

  it("restituisce SCAN_TIMEOUT oltre il budget temporale e CONTRADICTORY_CONSTRAINTS su precondizioni contraddittorie", () => {
    const code = `
export function identity(x: number): number {
  return x;
}
`;
    const timeoutProof = scanCodeHeuristics({
      targetFilePath: "src/identity.ts",
      sourceCode: code,
      targetSymbol: "identity",
      timeoutMs: 100,
      simulatedSolverDelayMs: 650,
    });
    expect(timeoutProof.status).toBe("SCAN_TIMEOUT");
    expect(timeoutProof.executionTimeMs).toBeGreaterThanOrEqual(650);

    const unsatProof = scanCodeHeuristics({
      targetFilePath: "src/identity.ts",
      sourceCode: code,
      targetSymbol: "identity",
      preconditions: ["x >= 100", "x <= 10"],
    });
    expect(unsatProof.status).toBe("CONTRADICTORY_CONSTRAINTS");
  });

  describe("Zero-Island Kernel Wiring (Self-Healing + MCP Server)", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "formal-prover-"));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    });

    it("espone e invoca scan_code_heuristics tramite MCP Server & Client Bridge", async () => {
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);

      const client = new McpClientBridge(
        { serverName: "formal-prover-mcp" },
        clientTransport
      );
      await client.connect();

      const tools = await client.discoverToolsLazy();
      expect(tools.some((t) => t.name === "scan_code_heuristics")).toBe(true);

      const response = await client.callTool({
        name: "scan_code_heuristics",
        arguments: {
          targetFilePath: "src/calc.ts",
          sourceCode: "export function inv(x: number): number {\n  return 100 / x;\n}",
          targetSymbol: "inv",
        },
      });

      expect(response.isError).toBe(false);
      const parsed = HeuristicScanResultSchema.parse(
        JSON.parse(response.content[0].text)
      );
      expect(parsed.status).toBe("COUNTEREXAMPLE_FOUND");
      expect(parsed.counterexampleTrace?.inputState).toEqual({ x: 0 });

      await client.disconnect();
      await server.close();
    });

    it("blocca nel loop di Self-Healing una patch con controesempio formale (GUARD_VIOLATION)", async () => {
      const targetFile = path.join(tempDir, "calc.ts");
      await fs.writeFile(
        targetFile,
        "export function ratio(a: number, b: number): number {\n  return a / b;\n}\n",
        "utf-8"
      );

      const patchMap = new Map<string, string>([
        [
          targetFile,
          "export function ratio(a: number, b: number): number {\n  return a / b;\n}\n",
        ],
      ]);

      const batchReport = scanPatchHeuristics(patchMap);
      expect(batchReport.allProved).toBe(false);
      expect(batchReport.counterexamples).toHaveLength(1);

      const healingResult = await runSelfHealingLoop(
        tempDir,
        ['node -e "process.exit(1)"'],
        async () => patchMap,
        {
          maxIterations: 2,
          enableFormalProver: true,
        }
      );

      expect(healingResult.status).toBe("GUARD_VIOLATION");
      expect(healingResult.restoredRollback).toBe(true);
      expect(
        healingResult.attempts[0]?.guardResult?.violations.some((v) =>
          v.includes("FORMAL_PROVER_COUNTEREXAMPLE")
        )
      ).toBe(true);
    });
  });
});
