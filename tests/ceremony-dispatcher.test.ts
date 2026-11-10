import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { CeremonyDispatcher } from "../src/core/ceremony-dispatcher.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Agile Ceremonies Dispatcher & Lifecycle Orchestrator (TCK-15.3)", () => {
  let tempDir: string;
  let dispatcher: CeremonyDispatcher;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ceremony-dispatcher-test-"));
    dispatcher = new CeremonyDispatcher(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("avvia e traccia le diverse cerimonie agili native", async () => {
    let startedEventFired = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("CEREMONY_STARTED", (ev) => {
      if (ev.payload.type === "BRAINSTORMING_KICKOFF") {
        startedEventFired = true;
      }
    });

    const ceremony = await dispatcher.startCeremony({
      type: "BRAINSTORMING_KICKOFF",
      chairRole: "rnd_lead",
      attendeeRoles: ["product_lead", "engineering_lead", "ai_lead"],
      summary: "Brainstorming kickoff per le nuove tecnologie AI e inter-agent protocol",
    });

    bus.unsubscribe(subId);

    expect(ceremony.type).toBe("BRAINSTORMING_KICKOFF");
    expect(ceremony.status).toBe("IN_PROGRESS");
    expect(startedEventFired).toBe(true);

    // Verifica la persistenza su disco sia del JSON che del Markdown
    const jsonPath = path.join(tempDir, ".company-os", "ceremonies", `${ceremony.id}.json`);
    const mdPath = path.join(tempDir, ".company-os", "ceremonies", `${ceremony.id}.md`);

    expect(await fs.stat(jsonPath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.stat(mdPath).then(() => true).catch(() => false)).toBe(true);

    const mdContent = await fs.readFile(mdPath, "utf-8");
    expect(mdContent).toContain("Verbale Cerimonia Agile: BRAINSTORMING_KICKOFF");
    expect(mdContent).toContain("rnd_lead");
  });

  it("conclude una cerimonia registrando il verbale definitivo", async () => {
    const ceremony = await dispatcher.startCeremony({
      type: "BACKLOG_REFINEMENT_1ON1",
      chairRole: "product_lead",
      attendeeRoles: ["backend_manager"],
      summary: "Refinement 1:1 dei contratti API per Sprint 15",
    });

    let concludedEventFired = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("CEREMONY_CONCLUDED", (ev) => {
      if (ev.payload.ceremonyId === ceremony.id) {
        concludedEventFired = true;
      }
    });

    const concluded = await dispatcher.concludeCeremony({
      ceremonyId: ceremony.id,
      summary: "Storie del backlog stimate e criteri di accettazione convalidati con successo.",
      outputArtifactUri: "docs/wiki/product/backlog.md",
    });

    bus.unsubscribe(subId);

    expect(concluded.status).toBe("CONCLUDED");
    expect(concluded.concludedAt).toBeDefined();
    expect(concludedEventFired).toBe(true);
  });

  it("gestisce la SPRINT_RETROSPECTIVE salvando la metrica FPY e il report analitico", async () => {
    const ceremony = await dispatcher.startCeremony({
      type: "SPRINT_RETROSPECTIVE",
      chairRole: "product_lead",
      attendeeRoles: ["engineering_lead", "qa_lead", "ai_lead", "rnd_lead"],
      summary: "Retrospettiva di chiusura Sprint 15",
    });

    await dispatcher.concludeCeremony({
      ceremonyId: ceremony.id,
      summary: "Sprint concluso con successo, First-Pass Yield al 92% e zero allucinazioni.",
      retrospectiveData: {
        sprintId: "SPRINT-15",
        fpyPercentage: 92.5,
        totalSelfHealingCycles: 2,
        tokenCostUsd: 0.42,
        cacheHitRatePercentage: 88.0,
        bottlenecksIdentified: ["Latenza di caricamento moduli di test estesi"],
        technicalDebtTickets: ["TCK-TECH-DEBT-01"],
        actionItems: ["Attivare TIA come default nei cicli inner-loop di self-healing"],
      },
    });

    const retroJsonPath = path.join(
      tempDir,
      ".company-os",
      "ceremonies",
      "retrospectives",
      "SPRINT-15.json"
    );
    expect(await fs.stat(retroJsonPath).then(() => true).catch(() => false)).toBe(true);

    const retroContent = JSON.parse(await fs.readFile(retroJsonPath, "utf-8"));
    expect(retroContent.fpyPercentage).toBe(92.5);
    expect(retroContent.tokenCostUsd).toBe(0.42);
    expect(retroContent.actionItems).toContain("Attivare TIA come default nei cicli inner-loop di self-healing");
  });
});
