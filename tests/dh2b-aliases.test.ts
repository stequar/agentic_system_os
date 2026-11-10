import { describe, it, expect } from "vitest";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { scanCodeHeuristics } from "../src/gatekeeper/formal-prover.js";
import { HeuristicScanResultSchema } from "../src/contracts/frontiers.js";
import { GatekeeperSettingsSchema } from "../src/contracts/settings.js";
import { createMcpServer } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";

/**
 * TCK-DH.2b Phase 2 — honest canonical API only; legacy names removed.
 * Verifies the breaking rename landed cleanly: canonical names work, the deprecated
 * MCP tool is gone, and existing settings files are migrated one-way (legacy -> canonical).
 */
describe("TCK-DH.2b Phase 2: honest canonical API, legacy aliases removed", () => {
  describe("Surface 4 — canonical scanner names", () => {
    it("scanCodeHeuristics produces a valid HeuristicScanResult with the honest scanEngine value", () => {
      const result = scanCodeHeuristics({
        targetFilePath: "src/calc.ts",
        sourceCode: "export function inv(x: number): number {\n  return 100 / x;\n}",
        targetSymbol: "inv",
      });
      expect(() => HeuristicScanResultSchema.parse(result)).not.toThrow();
      expect(result.scanEngine).toBe("PATTERN_HEURISTIC");
      expect(result.status).toBe("COUNTEREXAMPLE_FOUND");
    });
  });

  describe("Surface 2 — settings one-way migration", () => {
    it("migrates legacy gatekeeper keys to the canonical keys and drops the legacy ones", () => {
      const parsed = GatekeeperSettingsSchema.parse({
        enableFormalAstProver: false,
        formalProverTimeoutMs: 1234,
      }) as Record<string, unknown>;
      expect(parsed.enableHeuristicScanner).toBe(false);
      expect(parsed.heuristicScannerTimeoutMs).toBe(1234);
      // Legacy keys are no longer part of the schema output.
      expect("enableFormalAstProver" in parsed).toBe(false);
      expect("formalProverTimeoutMs" in parsed).toBe(false);
    });

    it("accepts the canonical keys directly", () => {
      const parsed = GatekeeperSettingsSchema.parse({
        enableHeuristicScanner: false,
        heuristicScannerTimeoutMs: 1500,
      });
      expect(parsed.enableHeuristicScanner).toBe(false);
      expect(parsed.heuristicScannerTimeoutMs).toBe(1500);
    });
  });

  describe("Surface 1 — MCP tool rename", () => {
    it("exposes scan_code_heuristics and no longer exposes the deprecated prove_ast_invariants", async () => {
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
      const server = createMcpServer();
      await server.connect(serverTransport);
      const client = new McpClientBridge({ serverName: "dh2b-phase2-test" }, clientTransport);
      await client.connect();

      const names = (await client.discoverToolsLazy()).map((t) => t.name);
      expect(names).toContain("scan_code_heuristics");
      expect(names).not.toContain("prove_ast_invariants");

      const res = await client.callTool({
        name: "scan_code_heuristics",
        arguments: {
          targetFilePath: "src/calc.ts",
          sourceCode: "export function inv(x: number): number {\n  return 100 / x;\n}",
          targetSymbol: "inv",
        },
      });
      expect(res.isError).toBe(false);
      expect(JSON.parse(res.content[0].text).status).toBe("COUNTEREXAMPLE_FOUND");

      await client.disconnect();
      await server.close();
    });
  });
});
