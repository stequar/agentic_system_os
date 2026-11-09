import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import crypto from "node:crypto";
import { MetricsAggregator } from "../src/core/metrics-aggregator.js";
import { AuditLogger } from "../src/core/audit-logger.js";
import { CompanyEventBus } from "../src/core/event-bus.js";
import { startStudioServer, type StudioServerHandle } from "../src/studio/server.js";
import {
  ProcessQualityMetricsSchema,
  FirstPassYieldReportSchema,
} from "../src/contracts/metrics.js";
import type { CompanyEvent } from "../src/contracts/events.js";

function makeRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options?.method || "GET",
        headers: options?.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on("error", reject);
    if (options?.body) {
      req.write(options.body);
    }
    req.end();
  });
}

describe("Cooperation & Quality Metrics Aggregator (TCK-9.4)", () => {
  let tempDir: string;
  let studioHandle: StudioServerHandle | null = null;
  let bus: CompanyEventBus;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "metrics-test-"));
    bus = new CompanyEventBus();
  });

  afterEach(async () => {
    if (studioHandle) {
      await studioHandle.stop();
      studioHandle = null;
    }
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    bus.clear();
  });

  it("calcola First-Pass Yield (FPY) al 100% quando tutti i ticket passano senza fix", () => {
    const events: CompanyEvent[] = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "TASK_STARTED",
        sourceAgent: "agent-1",
        level: "info",
        payload: { ticketId: "TCK-9.1" },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "gatekeeper",
        level: "info",
        payload: { ticketId: "TCK-9.1", iterations: 1 },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "TASK_STARTED",
        sourceAgent: "agent-2",
        level: "info",
        payload: { ticketId: "TCK-9.2" },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "gatekeeper",
        level: "info",
        payload: { ticketId: "TCK-9.2", iterations: 1 },
      },
    ];

    const metrics = MetricsAggregator.calculateFromEvents(events);
    ProcessQualityMetricsSchema.parse(metrics);

    expect(metrics.fpy.totalTickets).toBe(2);
    expect(metrics.fpy.firstPassSuccessfulTickets).toBe(2);
    expect(metrics.fpy.remediatedTickets).toBe(0);
    expect(metrics.fpy.fpyPercentage).toBe(100);
    expect(metrics.meanSelfHealingIterations).toBe(0);
    expect(metrics.contractComplianceRate).toBe(100);
    expect(metrics.contractViolations).toBe(0);
  });

  it("calcola accuratamente FPY e cicli medi in presenza di autoguarigione e fallimenti", () => {
    const events: CompanyEvent[] = [
      // Ticket 1: pass al primo colpo
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "TASK_STARTED",
        sourceAgent: "agent-1",
        level: "info",
        payload: { ticketId: "TCK-1.1" },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "gatekeeper",
        level: "info",
        payload: { ticketId: "TCK-1.1" },
      },
      // Ticket 2: richiede 2 iterazioni di autoguarigione
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "TASK_STARTED",
        sourceAgent: "agent-2",
        level: "info",
        payload: { ticketId: "TCK-1.2" },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "SELF_HEALING_ITERATION",
        sourceAgent: "self_healing",
        level: "warn",
        payload: { ticketId: "TCK-1.2", iteration: 1 },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "SELF_HEALING_ITERATION",
        sourceAgent: "self_healing",
        level: "warn",
        payload: { ticketId: "TCK-1.2", iteration: 2 },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "gatekeeper",
        level: "info",
        payload: { ticketId: "TCK-1.2" },
      },
      // Ticket 3: fallito
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "TASK_STARTED",
        sourceAgent: "agent-3",
        level: "info",
        payload: { ticketId: "TCK-1.3" },
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_FAILED",
        sourceAgent: "gatekeeper",
        level: "error",
        payload: { ticketId: "TCK-1.3" },
      },
      // Ticket 4: pass al primo colpo
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "gatekeeper",
        level: "info",
        payload: { ticketId: "TCK-1.4" },
      },
      // Violazione contrattuale
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "CONTRACT_VIOLATION",
        sourceAgent: "interceptor",
        level: "critical",
        payload: { contractName: "ReviewSchema" },
      },
    ];

    const metrics = MetricsAggregator.calculateFromEvents(events);
    ProcessQualityMetricsSchema.parse(metrics);

    expect(metrics.fpy.totalTickets).toBe(4);
    expect(metrics.fpy.firstPassSuccessfulTickets).toBe(2); // TCK-1.1 e TCK-1.4
    expect(metrics.fpy.remediatedTickets).toBe(2); // TCK-1.2 e TCK-1.3
    expect(metrics.fpy.fpyPercentage).toBe(50.0);
    // 2 iterazioni di healing totali / 4 ticket = 0.5
    expect(metrics.meanSelfHealingIterations).toBe(0.5);
    expect(metrics.contractViolations).toBe(1);
    expect(metrics.contractComplianceRate).toBeLessThan(100);
  });

  it("gestisce il caso limite di log eventi vuoto con valori di default coerenti", () => {
    const metrics = MetricsAggregator.calculateFromEvents([]);
    expect(metrics.fpy.totalTickets).toBe(0);
    expect(metrics.fpy.firstPassSuccessfulTickets).toBe(0);
    expect(metrics.fpy.remediatedTickets).toBe(0);
    expect(metrics.fpy.fpyPercentage).toBe(100);
    expect(metrics.meanSelfHealingIterations).toBe(0);
    expect(metrics.contractComplianceRate).toBe(100);
    expect(metrics.contractViolations).toBe(0);
    expect(metrics.totalAuditEvents).toBe(0);
  });

  it("integra la verifica di integrità Merkle da disco (integra vs manomessa)", async () => {
    const logger = new AuditLogger(tempDir);

    await logger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_STARTED",
      sourceAgent: "lead",
      level: "info",
      payload: { ticketId: "TCK-9.4" },
    });
    await logger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "GATEKEEPER_PASSED",
      sourceAgent: "gatekeeper",
      level: "info",
      payload: { ticketId: "TCK-9.4" },
    });

    const metricsBefore = await MetricsAggregator.calculateFromPath(tempDir);
    expect(metricsBefore.auditChainIntact).toBe(true);
    expect(metricsBefore.fpy.fpyPercentage).toBe(100);

    // Simula una manomissione maligna di audit.jsonl alterando il payload
    const logPath = logger.getAuditLogPath();
    const raw = await fs.readFile(logPath, "utf-8");
    const tampered = raw.replace("TCK-9.4", "TCK-HACKED");
    await fs.writeFile(logPath, tampered, "utf-8");

    const metricsAfter = await MetricsAggregator.calculateFromPath(tempDir);
    expect(metricsAfter.auditChainIntact).toBe(false);
  });

  it("espone le metriche via GET /api/metrics con autenticazione via token", async () => {
    // Popola un evento di audit
    const logger = new AuditLogger(tempDir);
    await logger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_STARTED",
      sourceAgent: "agent",
      level: "info",
      payload: { ticketId: "TCK-9.1" },
    });

    studioHandle = await startStudioServer({
      port: 4441,
      targetPath: tempDir,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4441/api/metrics?token=${studioHandle.token}`);
    expect(res.statusCode).toBe(200);

    const data = JSON.parse(res.body);
    ProcessQualityMetricsSchema.parse(data);
    expect(data.fpy.totalTickets).toBe(1);
    expect(data.auditChainIntact).toBe(true);
  });
});
