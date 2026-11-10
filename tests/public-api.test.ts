import { describe, it, expect } from "vitest";
import * as api from "../src/lib.js";

/**
 * Public API contract (TCK-DH P3): external consumers import from the package root.
 * This guards the stable surface so an accidental rename/removal is caught by CI
 * instead of silently breaking downstream projects.
 */
describe("public library entry point (src/lib.ts)", () => {
  it("exports the operational engines", () => {
    for (const name of [
      "detectProjectStack",
      "mineRepositoryDomainAndRoles",
      "graftManagedSection",
      "attachWorkspace",
      "runHolisticWorkspaceBootstrap",
      "runGatekeeper",
      "parseDiagnostics",
      "runSelfHealingLoop",
      "WarRoomEngine",
      "scanCodeHeuristics",
      "CompanyStateMachine",
      "SessionStore",
      "GitWorktreeManager",
      "SettingsManager",
      "createMcpServer",
      "McpClientBridge",
      "verifyDynamicToolAst",
      "SANDBOX_SECURITY_MODEL",
    ]) {
      expect(api[name as keyof typeof api], `missing public export: ${name}`).toBeDefined();
    }
  });

  it("exports key typed Zod contracts (schemas are runtime values)", () => {
    for (const name of [
      "ProjectStackSchema",
      "TriRingOrgChartSchema",
      "WorktreeSessionSchema",
      "SessionSnapshotSchema",
      "DiagnosticReportSchema",
      "CompanySettingsSchema",
    ]) {
      expect(api[name as keyof typeof api], `missing public contract: ${name}`).toBeDefined();
    }
  });

  it("does NOT re-export the CLI bootstrap (which would run on import)", () => {
    expect((api as Record<string, unknown>).createCliApp).toBeUndefined();
  });
});
