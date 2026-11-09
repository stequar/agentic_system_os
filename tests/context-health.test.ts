import { describe, it, expect, beforeEach } from "vitest";
import { ContextHealthMeter } from "../src/core/context-health.js";
import { ContextHealthReportSchema } from "../src/contracts/health.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Sprint 11 — Context Health Meter & Proactive Compaction Alerting", () => {
  let meter: ContextHealthMeter;
  let eventBus: CompanyEventBus;

  beforeEach(() => {
    eventBus = new CompanyEventBus();
    meter = new ContextHealthMeter(eventBus);
  });

  it("calcola punteggio EXCELLENT (100%) per contesti inferiori alla soglia nominale (es. 5.000 token)", () => {
    const report = meter.getReport(5_000);
    const parsed = ContextHealthReportSchema.safeParse(report);

    expect(parsed.success).toBe(true);
    expect(report.healthScore).toBe(100);
    expect(report.status).toBe("EXCELLENT");
    expect(report.recommendedAction).toBe("NONE");
  });

  it("calcola punteggio NOMINAL per contesti operativi standard (es. 25.000 token)", () => {
    const report = meter.getReport(25_000);
    expect(report.healthScore).toBeLessThan(100);
    expect(report.healthScore).toBeGreaterThanOrEqual(70);
    expect(report.status).toBe("NOMINAL");
    expect(report.recommendedAction).toBe("MONITOR");
  });

  it("rileva ROT_RISK e raccomanda COMPACT quando si supera la soglia di 40.000 token", () => {
    const report = meter.getReport(45_000);
    expect(report.healthScore).toBeLessThan(70);
    expect(report.healthScore).toBeGreaterThanOrEqual(40);
    expect(report.status).toBe("ROT_RISK");
    expect(report.recommendedAction).toBe("COMPACT");
  });

  it("rileva CRITICAL_ROT e impone FORCED_COMPACT per saturazione estrema (es. 90.000 token)", () => {
    const report = meter.getReport(90_000);
    expect(report.healthScore).toBeLessThan(40);
    expect(report.status).toBe("CRITICAL_ROT");
    expect(report.recommendedAction).toBe("FORCED_COMPACT");
  });

  it("emette un evento CONTEXT_HEALTH_ALERT sul bus quando si entra in ROT_RISK", async () => {
    const events: any[] = [];
    eventBus.subscribe("CONTEXT_HEALTH_ALERT", (e) => {
      events.push(e);
    });

    const report = await meter.evaluateAndAlert(48_000);
    expect(report.status).toBe("ROT_RISK");
    expect(events.length).toBe(1);
    expect(events[0].payload.healthScore).toBe(report.healthScore);
    expect(events[0].payload.recommendedAction).toBe("COMPACT");
  });
});
