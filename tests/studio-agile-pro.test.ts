import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { startStudioServer, type StudioServerHandle } from "../src/studio/server.js";
import { renderStudioHtml } from "../src/studio/ui.js";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { FluffTelemetry } from "../src/core/fluff-telemetry.js";
import { CeremonyDispatcher } from "../src/core/ceremony-dispatcher.js";
import {
  CeremoniesResponseSchema,
  WarRoomStatusResponseSchema,
  FluffTelemetryReportSchema,
} from "../src/contracts/studio.js";

describe("Sprint 16 — Studio Pro: Agile Ceremony Board, Live War-Room & Fluff Telemetry", () => {
  let tempDir: string;
  let studioHandle: StudioServerHandle;
  let baseUrl: string;
  let token: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-pro-test-"));

    // Prepara cerimonie di prova in .company-os/ceremonies/
    const dispatcher = new CeremonyDispatcher(tempDir);
    const c1 = await dispatcher.startCeremony({
      type: "BRAINSTORMING_KICKOFF",
      chairRole: "rnd_lead",
      attendeeRoles: ["product_lead", "engineering_lead"],
      summary: "Kickoff R&D su memoria vettoriale locale",
    });
    await dispatcher.concludeCeremony({
      ceremonyId: c1.id,
      summary: "Concluso con 2 direttive approvate",
    });

    const c2 = await dispatcher.startCeremony({
      type: "SPRINT_RETROSPECTIVE",
      chairRole: "product_lead",
      attendeeRoles: ["engineering_lead", "qa_lead"],
      summary: "Retrospettiva di chiusura SPRINT-15",
    });
    await dispatcher.concludeCeremony({
      ceremonyId: c2.id,
      summary: "Sprint 15 concluso positivamente con FPY al 95%",
      retrospectiveData: {
        sprintId: "SPRINT-15",
        fpyPercentage: 95.0,
        totalSelfHealingCycles: 1,
        tokenCostUsd: 0.35,
        cacheHitRatePercentage: 88.5,
        bottlenecksIdentified: ["Tempo iniziale scansione workspace"],
        technicalDebtTickets: [],
        actionItems: ["Attivare TIA inner-loop come default"],
      },
    });

    // Avvia il server embedded su porta libera
    studioHandle = await startStudioServer({
      targetPath: tempDir,
      port: 0, // porta casuale assegnata dal sistema
    });

    const address = studioHandle.server.address() as any;
    baseUrl = `http://127.0.0.1:${address.port}`;
    token = studioHandle.token;
  });

  afterAll(async () => {
    await studioHandle.stop();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("renderStudioHtml include gli elementi visivi di War Room, Ceremony Board e Fluff Telemetry", () => {
    const html = renderStudioHtml("test-token-12345");
    expect(html).toContain('id="warroom-banner"');
    expect(html).toContain('id="ceremonies-feed"');
    expect(html).toContain('id="kpi-fluff-ratio"');
    expect(html).toContain("Agile Ceremony Board & Meeting Timeline");
    expect(html).toContain("Caveman Fluff Reduction");
    expect(html).toContain("loadAgileCeremonies()");
    expect(html).toContain("loadWarRoomStatus()");
    expect(html).toContain("loadFluffTelemetry()");
  });

  it("GET /api/ceremonies restituisce la lista delle cerimonie agili e retrospettive (TCK-16.1)", async () => {
    const res = await fetch(`${baseUrl}/api/ceremonies?token=${token}`);
    expect(res.status).toBe(200);

    const json = await res.json();
    const validated = CeremoniesResponseSchema.parse(json);

    expect(validated.totalCount).toBeGreaterThanOrEqual(2);
    expect(validated.ceremonies.some((c) => c.type === "BRAINSTORMING_KICKOFF")).toBe(true);
    expect(validated.ceremonies.some((c) => c.type === "SPRINT_RETROSPECTIVE")).toBe(true);
    expect(validated.retrospectives).toHaveLength(1);
    expect(validated.retrospectives[0].fpyPercentage).toBe(95.0);
  });

  it("GET /api/war-room e POST /api/war-room/resolve gestiscono la Live War Room (TCK-16.2)", async () => {
    // 1. Simula l'apertura di un incidente tramite WarRoomEngine
    const dummyFile = path.join(tempDir, "core.ts");
    await fs.writeFile(dummyFile, "const clean = true;", "utf-8");
    const snapshot = new Map<string, string>([[dummyFile, "const clean = true;"]]);

    const { incident } = await WarRoomEngine.declareIncident({
      targetPath: tempDir,
      trigger: "DIFF_GUARD_VIOLATION",
      severity: "CRITICAL",
      targetTicketId: "TCK-WAR-ROOM-TEST",
      affectedFiles: [dummyFile],
      rootCause: "Tentativo non autorizzato di modifica a file protetto fuori scope",
      originalSnapshot: snapshot,
    });

    expect(WarRoomEngine.isWriteLocked()).toBe(true);

    // 2. Chiamata GET /api/war-room
    const statusRes = await fetch(`${baseUrl}/api/war-room?token=${token}`);
    expect(statusRes.status).toBe(200);

    const statusJson = await statusRes.json();
    const validatedStatus = WarRoomStatusResponseSchema.parse(statusJson);

    expect(validatedStatus.isWriteLocked).toBe(true);
    expect(validatedStatus.activeIncidents.length).toBeGreaterThanOrEqual(1);
    expect(validatedStatus.activeIncidents[0].incidentId).toBe(incident.incidentId);

    // 3. Risoluzione guidata tramite POST /api/war-room/resolve
    const resolveRes = await fetch(`${baseUrl}/api/war-room/resolve?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: incident.incidentId,
        resolutionNotes: "Verificato diff e autorizzata eccezione di sicurezza da senior QA",
      }),
    });
    expect(resolveRes.status).toBe(200);

    const resolveJson = await resolveRes.json();
    expect(resolveJson.success).toBe(true);
    expect(resolveJson.resolved.containmentAction).toContain("Resolved: Verificato diff");
    expect(WarRoomEngine.isWriteLocked()).toBe(false);

    // 4. Ri-verifica dello stato: il blocco scrittura è ora disattivato
    const postResolveRes = await fetch(`${baseUrl}/api/war-room?token=${token}`);
    const postResolveJson = await postResolveRes.json();
    expect(postResolveJson.isWriteLocked).toBe(false);
  });

  it("GET /api/fluff-telemetry calcola e restituisce il report di Caveman Mode (TCK-16.3)", async () => {
    const telemetry = FluffTelemetry.getInstance();
    telemetry.reset();

    const verbose = "Certamente! Ecco il codice: const x = 1; Spero che questo aiuti molto! Grazie mille!";
    const compressed = "const x = 1;";

    telemetry.recordHandoff(verbose, compressed);

    const res = await fetch(`${baseUrl}/api/fluff-telemetry?token=${token}`);
    expect(res.status).toBe(200);

    const json = await res.json();
    const validated = FluffTelemetryReportSchema.parse(json);

    expect(validated.totalMessagesIntercepted).toBe(1);
    expect(validated.fluffTokensEliminated).toBeGreaterThan(0);
    expect(validated.fluffReductionPercentage).toBeGreaterThan(50);
    expect(validated.estimatedDollarsSavedUsd).toBeGreaterThanOrEqual(0);
  });
});
