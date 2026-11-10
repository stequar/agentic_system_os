import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { runSelfHealingLoop } from "../src/gatekeeper/self-healing.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Incident War Room Circuit Breaker & Rollback Engine (TCK-15.4)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "war-room-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("dichiara un incidente, attiva il write lock, esegue il rollback atomico e genera l'artefatto", async () => {
    const filePath = path.join(tempDir, "critical-file.ts");
    const originalContent = "export const status = 'PRISTINE';";
    await fs.writeFile(filePath, originalContent, "utf-8");

    // Simula una corruzione del file
    await fs.writeFile(filePath, "CORRUPTED CONTENT SYNTAX ERROR", "utf-8");

    const snapshot = new Map<string, string>();
    snapshot.set(filePath, originalContent);

    let warRoomEventReceived = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("WAR_ROOM_TRIGGERED", (ev) => {
      if (ev.payload.ticketId === "TCK-15-BUG") {
        warRoomEventReceived = true;
      }
    });

    const result = await WarRoomEngine.declareIncident({
      targetPath: tempDir,
      trigger: "SELF_HEALING_EXHAUSTED",
      severity: "CRITICAL",
      targetTicketId: "TCK-15-BUG",
      affectedFiles: [filePath],
      rootCause: "Continuous syntax error preventing compilation after 3 attempts",
      originalSnapshot: snapshot,
    });

    bus.unsubscribe(subId);

    // 1. Verifica che il write lock sia attivo
    expect(WarRoomEngine.isWriteLocked()).toBe(true);

    // 2. Verifica ripristino atomico del file originale
    const restoredContent = await fs.readFile(filePath, "utf-8");
    expect(restoredContent).toBe(originalContent);

    // 3. Verifica generazione dell'incidente e cerimonia
    expect(result.incident.trigger).toBe("SELF_HEALING_EXHAUSTED");
    expect(result.incident.targetTicketId).toBe("TCK-15-BUG");
    expect(result.incident.rollbackSnapshotSha256).not.toBe("0000000000000000000000000000000000000000000000000000000000000000");
    expect(result.ceremony.type).toBe("INCIDENT_WAR_ROOM");
    expect(result.ceremony.status).toBe("IN_PROGRESS");
    expect(warRoomEventReceived).toBe(true);

    // 4. Risolvi l'incidente
    const resolved = await WarRoomEngine.resolveIncident(
      tempDir,
      result.incident.incidentId,
      "Fixed by senior lead patch"
    );

    expect(WarRoomEngine.isWriteLocked()).toBe(false);
    expect(resolved.containmentAction).toContain("Resolved: Fixed by senior lead patch");
  });

  it("integrazione: scatena automaticamente la War Room quando Self-Healing fallisce con enableWarRoomCircuitBreaker", async () => {
    const dummyFile = path.join(tempDir, "index.ts");
    await fs.writeFile(dummyFile, "export const value = 42;", "utf-8");

    let warRoomTriggered = false;
    const bus = CompanyEventBus.getInstance();
    const subId = bus.subscribe("WAR_ROOM_TRIGGERED", (ev) => {
      if (ev.payload.ticketId === "TCK-FAIL-HEAL") {
        warRoomTriggered = true;
      }
    });

    // Simuliamo un comando di test che fallisce sempre (exit code 1)
    const testCommands = ["node -e 'process.exit(1)'"];

    // Il patch applier propone patch ma il test continuerà a fallire per 3 iterazioni
    const failingPatchApplier = async () => {
      return new Map<string, string>([[dummyFile, "export const value = 99;"]]);
    };

    const session = await runSelfHealingLoop(tempDir, testCommands, failingPatchApplier, {
      maxIterations: 2,
      enableWarRoomCircuitBreaker: true,
      ticketId: "TCK-FAIL-HEAL",
    });

    bus.unsubscribe(subId);

    expect(session.status).toBe("BUDGET_EXHAUSTED");
    expect(session.restoredRollback).toBe(true);
    expect(warRoomTriggered).toBe(true);
    expect(WarRoomEngine.isWriteLocked()).toBe(true);

    // Cleanup — use the public clear() hook (no private-state reflection).
    WarRoomEngine.clear();
    expect(WarRoomEngine.isWriteLocked()).toBe(false);
  });
});
