import { describe, it, expect, beforeEach } from "vitest";
import { renderStudioHtml } from "../src/studio/ui.js";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { ContractInterceptor } from "../src/core/contract-interceptor.js";
import { DynamicMcpRegistry } from "../src/mcp/dynamic-registry.js";
import { FinOpsEngine } from "../src/core/finops-engine.js";
import { validatePatch } from "../src/utils/diff-guard.js";
import { estimateTokenCount } from "../src/utils/tokens.js";

describe("P3R hardening regression", () => {
  describe("P3R-1 Studio UI XSS hardening", () => {
    const html = renderStudioHtml("tok");
    it("escapes the event-feed fields (no raw sourceAgent/type/payload into innerHTML)", () => {
      expect(html).toContain("escapeHtml(ev.sourceAgent)");
      expect(html).toContain("escapeHtml(ev.type)");
      expect(html).toContain("escapeHtml(JSON.stringify(ev.payload");
    });
    it("escapes ceremony attendeeRoles", () => {
      expect(html).toContain("c.attendeeRoles.map(escapeHtml)");
    });
    it("escapeHtml also neutralizes single quotes", () => {
      expect(html).toContain("&#39;");
    });
  });

  describe("P3R-2 singleton reset hooks", () => {
    it("WarRoomEngine.clear() releases the ref-counted write lock", async () => {
      await WarRoomEngine.declareIncident({
        targetPath: process.cwd(),
        trigger: "SELF_HEALING_EXHAUSTED",
        targetTicketId: "TCK-Z",
        affectedFiles: ["z.ts"],
        rootCause: "root cause for clear() test",
      });
      expect(WarRoomEngine.isWriteLocked()).toBe(true);
      WarRoomEngine.clear();
      expect(WarRoomEngine.isWriteLocked()).toBe(false);
    });
    it("ContractInterceptor.reset() exists and clears the default bus", () => {
      expect(typeof ContractInterceptor.reset).toBe("function");
      expect(() => ContractInterceptor.reset()).not.toThrow();
    });
    it("DynamicMcpRegistry.clear() empties the registry", () => {
      const reg = new DynamicMcpRegistry();
      expect(typeof reg.clear).toBe("function");
      reg.clear();
      expect(reg.discoverLazyMetadata().length).toBe(0);
    });
  });

  describe("P3R-3 layering: shared primitives live in utils/ (no core->gatekeeper)", () => {
    it("validatePatch is importable from utils/diff-guard and still works", () => {
      const original = new Map([["src/a.ts", "export const a = 1;\n"]]);
      const modified = new Map([["src/a.ts", "export const a = 2;\n"]]);
      const res = validatePatch(original, modified, { allowedFiles: ["src/a.ts"] });
      expect(res).toHaveProperty("passed");
    });
    it("estimateTokenCount is importable from utils/tokens", () => {
      expect(estimateTokenCount("abcd")).toBeGreaterThan(0);
    });
  });

  describe("Tier-2 growth caps: bounded records with exact totals (fold-on-evict)", () => {
    it("FinOpsEngine caps the detailed array but keeps recordsCount and totals exact", () => {
      const engine = FinOpsEngine.getInstance();
      engine.reset();
      const N = 10_050; // exceeds MAX_RECORDS (10_000)
      for (let i = 0; i < N; i++) {
        engine.recordUsage("claude-3-5-sonnet", { uncachedInputTokens: 10, outputTokens: 5 });
      }
      const summary = engine.getSummary();
      expect(summary.recordsCount).toBe(N); // exact count preserved via fold
      expect(engine.getRecords().length).toBeLessThanOrEqual(10_000); // detail array bounded
      expect(summary.totalTokens).toBe(N * 15); // totals exact across evicted + live records
      engine.reset();
    });
  });
});
