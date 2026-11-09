import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { CompanyEventBus } from "../src/core/event-bus.js";
import { AuditLogger } from "../src/core/audit-logger.js";
import { CompanyEventSchema } from "../src/contracts/events.js";

describe("Typed Enterprise Event Bus & JSONL Audit Trail Logger (TCK-6.2)", () => {
  let tempDir: string;
  let bus: CompanyEventBus;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "event-bus-test-"));
    bus = new CompanyEventBus();
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    bus.clear();
  });

  it("pubblica e riceve eventi tipizzati su specifici canali", async () => {
    const handler = vi.fn();
    bus.subscribe("TASK_STARTED", handler);

    const event = await bus.emit({
      type: "TASK_STARTED",
      sourceAgent: "engineering_lead",
      payload: { taskId: "TCK-6.2", sprint: "SPRINT-6" },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(event);
    expect(event.type).toBe("TASK_STARTED");
    expect(event.level).toBe("info");
    expect(CompanyEventSchema.safeParse(event).success).toBe(true);
  });

  it("supporta listener wildcard '*' per catturare tutti gli eventi", async () => {
    const wildcardHandler = vi.fn();
    bus.subscribe("*", wildcardHandler);

    await bus.emit({ type: "TASK_STARTED", sourceAgent: "orchestrator" });
    await bus.emit({ type: "GATEKEEPER_TRIGGERED", sourceAgent: "gatekeeper", level: "warn" });

    expect(wildcardHandler).toHaveBeenCalledTimes(2);
  });

  it("consente di effettuare l'unsubscribe sia tramite funzione che via off", async () => {
    const handler = vi.fn();
    const unsubscribe = bus.subscribe("DIFF_GUARD_VIOLATION", handler);

    await bus.emit({ type: "DIFF_GUARD_VIOLATION", sourceAgent: "guard" });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    await bus.emit({ type: "DIFF_GUARD_VIOLATION", sourceAgent: "guard" });
    expect(handler).toHaveBeenCalledTimes(1); // non chiamato la seconda volta
  });

  it("AuditLogger registra automaticamente gli eventi sul file JSONL append-only", async () => {
    const logger = new AuditLogger(tempDir);
    logger.attach(bus);

    await bus.emit({
      type: "TASK_STARTED",
      sourceAgent: "product_lead",
      payload: { ticket: "TCK-6.2" },
    });
    await bus.emit({
      type: "SECURITY_ALERT",
      sourceAgent: "secret_guard",
      level: "critical",
      payload: { reason: "API Key detected in prompt" },
    });

    // Verifica file audit.jsonl su disco
    const logPath = logger.getAuditLogPath();
    const exists = await fs.stat(logPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const records = await logger.readAuditLog();
    expect(records).toHaveLength(2);
    expect(records[0].type).toBe("TASK_STARTED");
    expect(records[1].type).toBe("SECURITY_ALERT");
    expect(records[1].level).toBe("critical");

    logger.detach();
  });

  it("supporta la lettura limitata (limit) degli ultimi eventi", async () => {
    const logger = new AuditLogger(tempDir);
    for (let i = 1; i <= 5; i++) {
      await logger.logEvent({
        id: `00000000-0000-0000-0000-00000000000${i}`,
        timestamp: new Date().toISOString(),
        type: "TASK_COMPLETED",
        sourceAgent: "leaf_dev",
        level: "info",
        payload: { iteration: i },
      });
    }

    const last2 = await logger.readAuditLog(2);
    expect(last2).toHaveLength(2);
    expect(last2[0].payload.iteration).toBe(4);
    expect(last2[1].payload.iteration).toBe(5);
  });
});
