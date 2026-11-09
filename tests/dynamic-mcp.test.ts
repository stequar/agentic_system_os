import { describe, it, expect } from "vitest";
import { DynamicMcpToolSchema } from "../src/contracts/frontiers.js";
import {
  detectCapabilityGap,
  synthesizeDynamicMcpTool,
} from "../src/mcp/synthesizer.js";
import {
  verifyDynamicToolAst,
  DynamicToolAstGuard,
  runDynamicToolInSandbox,
} from "../src/mcp/sandbox-runner.js";
import {
  generateSyntheticFixtures,
  runPreFlightVerification,
} from "../src/mcp/fixture-generator.js";
import { DynamicMcpRegistry } from "../src/mcp/dynamic-registry.js";

describe("Sprint 19 — Self-Evolving Tooling & Dynamic JIT MCP Synthesis", () => {
  describe("TCK-19.1: Capability Gap Detector & Dynamic Tool Synthesizer", () => {
    it("should detect no gap when an existing tool covers the requested capability", () => {
      const catalog = [
        {
          name: "inspect_stack",
          description: "Inspect repository languages, frameworks, and package managers",
        },
        {
          name: "run_gatekeeper",
          description: "Execute deterministic test suites and typecheck validation",
        },
      ];

      const report = detectCapabilityGap(
        "Inspect repository languages and frameworks in workspace",
        catalog
      );

      expect(report.hasGap).toBe(false);
      expect(report.matchedToolName).toBe("inspect_stack");
    });

    it("should detect a capability gap and infer required permissions when no tool matches", () => {
      const catalog = [
        {
          name: "inspect_stack",
          description: "Inspect repository languages and frameworks",
        },
      ];

      const report = detectCapabilityGap(
        "Read file parquet schema and fetch local loopback endpoint with process.env",
        catalog
      );

      expect(report.hasGap).toBe(true);
      expect(report.suggestedToolName).toMatch(/^jit_/);
      expect(report.requiredPermissions).toContain("fs:read");
      expect(report.requiredPermissions).toContain("network:loopback");
      expect(report.requiredPermissions).toContain("env:read");
    });

    it("should synthesize a valid DynamicMcpTool and executable ESM source code", () => {
      const bundle = synthesizeDynamicMcpTool({
        taskDescription: "Parse custom CSV telemetry metrics and compute summary",
        missingCapability: "csv_telemetry_parser",
        suggestedToolName: "jit_csv_telemetry_parser",
        inputFields: {
          csvText: { type: "string", description: "Raw CSV content", required: true },
          delimiter: { type: "string", description: "Column delimiter", required: false },
        },
        permissions: ["fs:read"],
        ttlSeconds: 1800,
      });

      const validated = DynamicMcpToolSchema.parse(bundle.tool);
      expect(validated.toolId).toBe("tool_dyn_csv_telemetry_parser");
      expect(validated.name).toBe("jit_csv_telemetry_parser");
      expect(validated.status).toBe("SYNTHESIZED");
      expect(validated.sandboxType).toBe("NODE_WORKER");
      expect(validated.permissions).toEqual(["fs:read"]);
      expect(validated.ttlSeconds).toBe(1800);

      const parsedSchema = JSON.parse(validated.inputSchemaJson);
      expect(parsedSchema.$schema).toContain("draft-07");
      expect(parsedSchema.properties.csvText.type).toBe("string");
      expect(parsedSchema.required).toContain("csvText");
      expect(bundle.code).toContain("export async function handleDynamicTool");
      expect(bundle.code).toContain("export default handleDynamicTool");
    });
  });

  describe("TCK-19.2: AST Security Guard & Isolated Worker-Thread Sandbox Runner", () => {
    it("should block forbidden modules and unsafe constructs via DynamicToolAstGuard", () => {
      const childProcCheck = DynamicToolAstGuard.verify(
        `import { execSync } from "node:child_process"; export default async () => execSync("whoami");`,
        []
      );
      expect(childProcCheck.safe).toBe(false);
      expect(childProcCheck.violations.some((v) => v.includes("child_process"))).toBe(true);

      const evalCheck = verifyDynamicToolAst(
        `export default async (input) => eval(input.code);`,
        []
      );
      expect(evalCheck.safe).toBe(false);
      expect(evalCheck.violations.some((v) => v.includes("eval()"))).toBe(true);

      const envDenied = verifyDynamicToolAst(
        `export default async () => ({ secret: process.env.API_KEY });`,
        []
      );
      expect(envDenied.safe).toBe(false);
      expect(envDenied.violations.some((v) => v.includes("process.env"))).toBe(true);

      const fsWriteDenied = verifyDynamicToolAst(
        `import fs from "node:fs"; export default async () => fs.writeFileSync("/tmp/x", "1");`,
        ["fs:read"]
      );
      expect(fsWriteDenied.safe).toBe(false);
      expect(fsWriteDenied.violations.some((v) => v.includes("fs:write"))).toBe(true);

      const networkDenied = verifyDynamicToolAst(
        `export default async () => fetch("http://127.0.0.1:4321/api/health");`,
        []
      );
      expect(networkDenied.safe).toBe(false);
      expect(networkDenied.violations.some((v) => v.includes("network:loopback"))).toBe(true);
    });

    it("should approve restricted operations when explicit permissions are granted", () => {
      const allowedCheck = verifyDynamicToolAst(
        `export default async () => {
          const mode = process.env.NODE_ENV;
          return { mode };
        };`,
        ["env:read", "network:loopback", "fs:write"]
      );
      expect(allowedCheck.safe).toBe(true);
      expect(allowedCheck.violations).toHaveLength(0);
    });

    it("should execute valid ESM tool code inside isolated Worker Thread sandbox", async () => {
      const { tool, code } = synthesizeDynamicMcpTool({
        taskDescription: "Compute deterministic checksum summary",
        suggestedToolName: "jit_checksum_calc",
        inputFields: {
          payload: { type: "string", required: true },
          multiplier: { type: "number", required: true },
        },
        handlerBody: `return { lengthTimesMultiplier: input.payload.length * input.multiplier, tool: context.name };`,
      });

      const result = await runDynamicToolInSandbox(tool, code, {
        payload: "agentic",
        multiplier: 3,
      });

      expect(result.success).toBe(true);
      expect(result.quarantined).toBe(false);
      expect(result.output).toEqual({
        lengthTimesMultiplier: 21,
        tool: "jit_checksum_calc",
      });
    });

    it("should immediately quarantine tool on AST violation without spawning worker", async () => {
      const { tool } = synthesizeDynamicMcpTool({
        taskDescription: "Malicious shell runner test",
        suggestedToolName: "jit_malicious_runner",
      });
      const unsafeCode = `import { spawn } from "child_process"; export default async () => {};`;

      const result = await runDynamicToolInSandbox(tool, unsafeCode, { query: "test" });
      expect(result.success).toBe(false);
      expect(result.quarantined).toBe(true);
      expect(result.status).toBe("QUARANTINED");
      expect(result.error).toContain("AST Security Guard Violation");
    });

    it("should terminate and quarantine a tool stuck in an infinite loop within hard timeout", async () => {
      const { tool } = synthesizeDynamicMcpTool({
        taskDescription: "Infinite loop test tool",
        suggestedToolName: "jit_infinite_loop",
      });
      const infiniteLoopCode = `export default async function handleDynamicTool() { while (true) {} }`;

      const result = await runDynamicToolInSandbox(
        tool,
        infiniteLoopCode,
        { query: "hang" },
        200
      );

      expect(result.success).toBe(false);
      expect(result.quarantined).toBe(true);
      expect(result.status).toBe("QUARANTINED");
      expect(result.error).toContain("timed out after 200ms");
    });
  });

  describe("TCK-19.4: Synthetic Fixture Generator & Pre-Flight Verification Gate", () => {
    it("should generate HAPPY_PATH, BOUNDARY_EDGE, and NEGATIVE_MALFORMED fixtures from schema", () => {
      const { tool } = synthesizeDynamicMcpTool({
        taskDescription: "Validate multi-field input schema fixtures",
        suggestedToolName: "jit_schema_tester",
        inputFields: {
           label: { type: "string", required: true },
          count: { type: "number", required: true },
          active: { type: "boolean", required: true },
        },
      });

      const fixtures = generateSyntheticFixtures(tool);
      expect(fixtures).toHaveLength(3);
      expect(fixtures.map((f) => f.category)).toEqual([
        "HAPPY_PATH",
        "BOUNDARY_EDGE",
        "NEGATIVE_MALFORMED",
      ]);

      expect(typeof fixtures[0].input.label).toBe("string");
      expect(typeof fixtures[0].input.count).toBe("number");
      expect(fixtures[1].input.label).toBe("");
      expect(fixtures[1].input.count).toBe(0);
      expect(typeof fixtures[2].input.count).toBe("string");
    });

    it("should certify healthy synthesized tool as TEST_PASSED in pre-flight verification", async () => {
      const { tool, code } = synthesizeDynamicMcpTool({
        taskDescription: "Transform query text into uppercase tokens",
        suggestedToolName: "jit_uppercase_tokenizer",
        inputFields: {
          query: { type: "string", required: true },
        },
        handlerBody: `return { upper: String(input.query).toUpperCase() };`,
      });

      const report = await runPreFlightVerification(tool, code);
      expect(report.passed).toBe(true);
      expect(report.allPassed).toBe(true);
      expect(report.status).toBe("TEST_PASSED");
      expect(report.tool.status).toBe("TEST_PASSED");
      expect(report.totalTests).toBe(3);
      expect(report.passedTests).toBe(3);
      expect(report.failedTests).toBe(0);
    });

    it("should quarantine defective tool that crashes or fails nominal pre-flight fixtures", async () => {
      const { tool } = synthesizeDynamicMcpTool({
        taskDescription: "Defective tool throwing runtime error on happy path",
        suggestedToolName: "jit_broken_tool",
      });
      const brokenCode = `export default async function handleDynamicTool() {
        throw new Error("Nominal execution failed unexpectedly");
      }`;

      const report = await runPreFlightVerification(tool, brokenCode);
      expect(report.passed).toBe(false);
      expect(report.status).toBe("QUARANTINED");
      expect(report.tool.status).toBe("QUARANTINED");
      expect(report.failedTests).toBeGreaterThan(0);
    });
  });

  describe("TCK-19.3: Dynamic MCP Registry, Lazy Discovery, Promotion & TTL Eviction", () => {
    it("should fail loudly when attempting to register an unverified or quarantined tool", () => {
      const registry = new DynamicMcpRegistry();
      const { tool, code } = synthesizeDynamicMcpTool({
        taskDescription: "Unverified registration test tool",
        suggestedToolName: "jit_unverified_tool",
      });

      // Status is SYNTHESIZED, not TEST_PASSED
      expect(() => registry.registerVerifiedTool(tool, code)).toThrow(/Fail Loudly/);

      const quarantinedTool = { ...tool, status: "QUARANTINED" as const };
      expect(() => registry.registerVerifiedTool(quarantinedTool, code)).toThrow(
        /QUARANTINED/
      );
    });

    it("should hot-load verified tool, expose lightweight metadata, and auto-promote after N successes", async () => {
      const registry = new DynamicMcpRegistry({ promotionThreshold: 3 });
      const { tool, code } = synthesizeDynamicMcpTool({
        taskDescription: "Calculate deterministic metric score",
        suggestedToolName: "jit_metric_scorer",
        inputFields: {
          score: { type: "number", required: true },
        },
        handlerBody: `return { doubled: input.score * 2 };`,
      });

      const hotTool = await registry.verifyAndRegisterTool(tool, code);
      expect(hotTool.status).toBe("HOT_LOADED");

      // Karpathy Context as RAM: discoverLazyMetadata exposes only name & description
      const lazyCatalog = registry.discoverLazyMetadata();
      expect(lazyCatalog).toEqual([
        {
          name: "jit_metric_scorer",
          description: hotTool.description,
        },
      ]);
      expect("inputSchema" in lazyCatalog[0]).toBe(false);

      // Full JSON Schema is loaded on-demand via getToolDefinition
      const fullDef = registry.getToolDefinition("jit_metric_scorer");
      expect(fullDef).toBeDefined();
      expect(fullDef?.inputSchema).toHaveProperty("properties");

      // Invoke 3 times to reach promotionThreshold = 3
      const inv1 = await registry.invokeTool("jit_metric_scorer", { score: 5 });
      expect(inv1.success).toBe(true);
      expect(inv1.promoted).toBe(false);
      expect(inv1.status).toBe("HOT_LOADED");

      const inv2 = await registry.invokeTool("jit_metric_scorer", { score: 10 });
      expect(inv2.promoted).toBe(false);

      const inv3 = await registry.invokeTool("jit_metric_scorer", { score: 15 });
      expect(inv3.success).toBe(true);
      expect(inv3.promoted).toBe(true);
      expect(inv3.status).toBe("PROMOTED_PERMANENT");
      expect(inv3.output).toEqual({ doubled: 30 });
    });

    it("should evict expired ephemeral tools while preserving PROMOTED_PERMANENT tools", async () => {
      const registry = new DynamicMcpRegistry({ promotionThreshold: 1 });

      const ephemeralBundle = synthesizeDynamicMcpTool({
        taskDescription: "Short-lived ephemeral helper",
        suggestedToolName: "jit_ephemeral_helper",
        ttlSeconds: 60,
      });
      const permanentBundle = synthesizeDynamicMcpTool({
        taskDescription: "Permanent promoted helper",
        suggestedToolName: "jit_permanent_helper",
        ttlSeconds: 60,
      });

      await registry.verifyAndRegisterTool(ephemeralBundle.tool, ephemeralBundle.code);
      await registry.verifyAndRegisterTool(permanentBundle.tool, permanentBundle.code);

      // Promote permanentBundle with 1 successful invocation
      const promotedRes = await registry.invokeTool("jit_permanent_helper", {
        query: "promote_me",
      });
      expect(promotedRes.status).toBe("PROMOTED_PERMANENT");

      // Simulate time advancement beyond 60s TTL
      const futureMs = Date.now() + 120 * 1000;
      const evicted = registry.evictExpiredTools(futureMs);

      expect(evicted).toHaveLength(1);
      expect(evicted[0].name).toBe("jit_ephemeral_helper");
      expect(evicted[0].status).toBe("EXPIRED");

      // Active catalog should only contain the PROMOTED_PERMANENT tool
      const activeLazy = registry.discoverLazyMetadata();
      expect(activeLazy.map((t) => t.name)).toEqual(["jit_permanent_helper"]);

      // Invoking an expired tool must fail loudly
      await expect(
        registry.invokeTool("jit_ephemeral_helper", { query: "test" })
      ).rejects.toThrow(/EXPIRED/);
    });
  });
});
