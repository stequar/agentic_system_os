import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { startStudioServer, type StudioServerHandle } from "../src/studio/server.js";
import { FinOpsEngine } from "../src/core/finops-engine.js";
import { AuditLogger } from "../src/core/audit-logger.js";

describe("Sprint 11 — Web Studio FinOps, Health & Trajectory Endpoints", () => {
  let tmpDir: string;
  let studio: StudioServerHandle;
  let testPort = 4329;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "finops-studio-test-"));
    const logger = new AuditLogger(tmpDir);
    await logger.logEvent({
      id: "c0000000-0000-0000-0000-000000000001",
      timestamp: new Date().toISOString(),
      type: "TICKET_STATUS_CHANGED",
      sourceAgent: "product_lead",
      payload: { ticketId: "TCK-11.1", previousStatus: "IN_PROGRESS", newStatus: "DONE" },
    });

    FinOpsEngine.getInstance().reset();
    FinOpsEngine.getInstance().recordUsage("claude-3-5-sonnet", {
      uncachedInputTokens: 2_000,
      cacheReadTokens: 18_000,
      outputTokens: 1_000,
    });

    studio = await startStudioServer({
      port: testPort,
      targetPath: tmpDir,
    });
  });

  afterAll(async () => {
    await studio.stop();
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it("rifiuta richieste non autenticate con HTTP 401 Unauthorized", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/finops`);
    expect(res.status).toBe(401);
  });

  it("restituisce il riepilogo FinOps completo su GET /api/finops con autenticazione Bearer", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/finops`, {
      headers: { Authorization: `Bearer ${studio.token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalTokens).toBe(21_000);
    expect(body.totalCacheReadTokens).toBe(18_000);
    expect(body.totalNetSavingsUsd).toBeGreaterThan(0);
    expect(body.cacheSavingsRatio).toBeGreaterThan(50);
  });

  it("restituisce il report di Context Health su GET /api/context-health", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/context-health?tokens=35000`, {
      headers: { Authorization: `Bearer ${studio.token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.currentTokens).toBe(35_000);
    expect(body.healthScore).toBeGreaterThanOrEqual(70);
    expect(body.status).toBe("NOMINAL");
    expect(body.recommendedAction).toBe("MONITOR");
  });

  it("restituisce la sequenza di Trajectory Nodes su GET /api/trajectory", async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/trajectory?limit=10`, {
      headers: { Authorization: `Bearer ${studio.token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalCount).toBeGreaterThanOrEqual(1);
    expect(body.nodes.length).toBeGreaterThanOrEqual(1);
    expect(body.nodes[0].category).toBe("FSM_TRANSITION");
    expect(body.nodes[0].summary).toContain("TCK-11.1");
  });
});
