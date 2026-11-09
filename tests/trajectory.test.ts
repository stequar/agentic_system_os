import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  TrajectoryReader,
  classifyEvent,
} from "../src/core/trajectory-reader.js";
import { AuditLogger } from "../src/core/audit-logger.js";
import { CompanyEventSchema } from "../src/contracts/events.js";
import { TrajectoryResponseSchema } from "../src/contracts/studio.js";

describe("Sprint 11 — Trajectory Reader & Event Classifier", () => {
  let tmpDir: string;
  let logger: AuditLogger;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "trajectory-test-"));
    logger = new AuditLogger(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it("classifica accuratamente i diversi tipi di evento aziendale", () => {
    const ev1 = CompanyEventSchema.parse({
      id: "a0000000-0000-0000-0000-000000000001",
      timestamp: new Date().toISOString(),
      type: "TICKET_STATUS_CHANGED",
      sourceAgent: "product_lead",
      payload: { ticketId: "TCK-11.1", previousStatus: "TODO", newStatus: "IN_PROGRESS" },
    });
    const c1 = classifyEvent(ev1);
    expect(c1.category).toBe("FSM_TRANSITION");
    expect(c1.summary).toContain("TCK-11.1");

    const ev2 = CompanyEventSchema.parse({
      id: "a0000000-0000-0000-0000-000000000002",
      timestamp: new Date().toISOString(),
      type: "GATEKEEPER_PASSED",
      sourceAgent: "qa_lead",
      payload: { totalTests: 295, passedTests: 295 },
    });
    const c2 = classifyEvent(ev2);
    expect(c2.category).toBe("QUALITY_GATE");
    expect(c2.summary).toContain("Superato");

    const ev3 = CompanyEventSchema.parse({
      id: "a0000000-0000-0000-0000-000000000003",
      timestamp: new Date().toISOString(),
      type: "SELF_HEALING_ITERATION",
      sourceAgent: "engineering_lead",
      payload: { iteration: 2 },
    });
    const c3 = classifyEvent(ev3);
    expect(c3.category).toBe("SELF_HEALING");
    expect(c3.summary).toContain("iterazione 2");

    const ev4 = CompanyEventSchema.parse({
      id: "a0000000-0000-0000-0000-000000000004",
      timestamp: new Date().toISOString(),
      type: "CONTEXT_HEALTH_ALERT",
      sourceAgent: "context_health_meter",
      payload: { status: "ROT_RISK", healthScore: 55 },
    });
    const c4 = classifyEvent(ev4);
    expect(c4.category).toBe("FINOPS_ALERT");
  });

  it("restituisce una risposta vuota conforme a TrajectoryResponseSchema se audit.jsonl non esiste", async () => {
    const res = await TrajectoryReader.readTrajectory(tmpDir);
    const parsed = TrajectoryResponseSchema.safeParse(res);
    expect(parsed.success).toBe(true);
    expect(res.nodes.length).toBe(0);
    expect(res.totalCount).toBe(0);
    expect(res.hasMore).toBe(false);
  });

  it("estrae nodi con ordinamento tail-first, paginazione e filtro per categoria", async () => {
    // Registra 5 eventi
    await logger.logEvent({
      id: "b0000000-0000-0000-0000-000000000001",
      timestamp: new Date(Date.now() - 5000).toISOString(),
      type: "SESSION_STARTED",
      sourceAgent: "core",
      payload: { sessionId: "s1" },
    });

    await logger.logEvent({
      id: "b0000000-0000-0000-0000-000000000002",
      timestamp: new Date(Date.now() - 4000).toISOString(),
      type: "GATEKEEPER_PASSED",
      sourceAgent: "qa_lead",
      payload: {},
    });

    await logger.logEvent({
      id: "b0000000-0000-0000-0000-000000000003",
      timestamp: new Date(Date.now() - 3000).toISOString(),
      type: "SELF_HEALING_ITERATION",
      sourceAgent: "engine",
      payload: { iteration: 1 },
    });

    await logger.logEvent({
      id: "b0000000-0000-0000-0000-000000000004",
      timestamp: new Date(Date.now() - 2000).toISOString(),
      type: "CONTEXT_HEALTH_ALERT",
      sourceAgent: "health",
      payload: { status: "ROT_RISK" },
    });

    await logger.logEvent({
      id: "b0000000-0000-0000-0000-000000000005",
      timestamp: new Date(Date.now() - 1000).toISOString(),
      type: "TICKET_STATUS_CHANGED",
      sourceAgent: "product",
      payload: { ticketId: "TCK-11.3", previousStatus: "TODO", newStatus: "DONE" },
    });

    // 1. Lettura globale tail-first (l'ultimo registrato deve essere il primo)
    const resAll = await TrajectoryReader.readTrajectory(tmpDir, { limit: 10 });
    expect(resAll.totalCount).toBe(5);
    expect(resAll.nodes[0].type).toBe("TICKET_STATUS_CHANGED");
    expect(resAll.nodes[0].sequenceNumber).toBe(4);
    expect(resAll.nodes[0].merkleHash).toBeDefined();

    // 2. Filtro per categoria QUALITY_GATE
    const resGate = await TrajectoryReader.readTrajectory(tmpDir, { category: "QUALITY_GATE" });
    expect(resGate.totalCount).toBe(1);
    expect(resGate.nodes[0].type).toBe("GATEKEEPER_PASSED");

    // 3. Paginazione con limit e offset
    const page1 = await TrajectoryReader.readTrajectory(tmpDir, { limit: 2, offset: 0 });
    expect(page1.nodes.length).toBe(2);
    expect(page1.hasMore).toBe(true);

    const page2 = await TrajectoryReader.readTrajectory(tmpDir, { limit: 2, offset: 2 });
    expect(page2.nodes.length).toBe(2);
    expect(page2.hasMore).toBe(true);
  });
});
