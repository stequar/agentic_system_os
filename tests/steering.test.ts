import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SteeringEngine } from "../src/core/steering-engine.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Cooperative Safe-Point HITL Steering Engine (TCK-7.1)", () => {
  let engine: SteeringEngine;
  let bus: CompanyEventBus;

  beforeEach(() => {
    bus = new CompanyEventBus();
    engine = new SteeringEngine(bus);
  });

  afterEach(() => {
    engine.reset();
    bus.clear();
  });

  it("gestisce la richiesta di pausa cooperativa passando per PAUSE_REQUESTED e poi SAFE_PAUSED", async () => {
    expect(engine.getState()).toBe("RUNNING");

    // 1. Invia richiesta di pausa
    const pauseReq = engine.requestPause();
    expect(pauseReq.success).toBe(true);
    expect(pauseReq.currentState).toBe("PAUSE_REQUESTED");
    expect(engine.isPauseRequested()).toBe(true);
    expect(engine.isPaused()).toBe(false);

    // Acquisisce un lock durante l'operazione in volo
    engine.acquireFileLock("src/service.ts");

    // 2. Safe-point raggiunto: transizione a SAFE_PAUSED e rilascio automatico lock
    const isPaused = await engine.checkSafePoint();
    expect(isPaused).toBe(true);
    expect(engine.getState()).toBe("SAFE_PAUSED");
    expect(engine.isPaused()).toBe(true);

    // Il lock deve essere stato rilasciato
    expect(engine.acquireFileLock("src/service.ts")).toBe(true);

    // 3. Ripresa (Resume)
    const resumeRes = await engine.resume();
    expect(resumeRes.success).toBe(true);
    expect(resumeRes.currentState).toBe("RUNNING");
    expect(engine.getState()).toBe("RUNNING");
  });

  it("accetta suggerimenti (hint) testuali dell'operatore umano", () => {
    const hintRes = engine.submitHint("Usa un approccio basato su hash map invece di scansione O(N^2)");
    expect(hintRes.success).toBe(true);
    expect(hintRes.actionApplied).toBe("hint");

    const hints = engine.getHints();
    expect(hints).toHaveLength(1);
    expect(hints[0].message).toContain("hash map");
  });

  it("Kernel AST Diff Guard: RIFIUTA categoricamente suggerimenti o patch umane che sopprimono test", () => {
    const originalFiles = new Map<string, string>([
      [
        "tests/calc.test.ts",
        `
        describe("calc", () => {
          it("somma due numeri", () => {
            expect(add(1, 2)).toBe(3);
          });
        });
        `,
      ],
    ]);

    // L'operatore propone di disabilitare il test con .skip o rimuovere l'asserzione
    const fraudulentPatch = new Map<string, string>([
      [
        "tests/calc.test.ts",
        `
        describe("calc", () => {
          it.skip("somma due numeri", () => {
            expect(add(1, 2)).toBe(3);
          });
        });
        `,
      ],
    ]);

    const result = engine.submitHint("Disabilita temporaneamente il test che fallisce", {
      proposedPatch: fraudulentPatch,
      originalFiles,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("RIFIUTATI dal kernel");
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some((v) => v.includes("TEST_PRESERVATION_VIOLATION"))).toBe(true);

    // L'hint fraudolento non deve essere stato registrato nella coda
    expect(engine.getHints()).toHaveLength(0);
  });

  it("Kernel AST Diff Guard: ACCETTA patch umane valide che preservano o arricchiscono i test", () => {
    const originalFiles = new Map<string, string>([
      [
        "tests/calc.test.ts",
        `
        it("funziona", () => {
          expect(1).toBe(1);
        });
        `,
      ],
    ]);

    const validPatch = new Map<string, string>([
      [
        "tests/calc.test.ts",
        `
        it("funziona", () => {
          expect(1).toBe(1);
          expect(2).toBe(2);
        });
        `,
      ],
    ]);

    const result = engine.submitHint("Aggiunta asserzione corretta", {
      proposedPatch: validPatch,
      originalFiles,
    });

    expect(result.success).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(engine.getHints()).toHaveLength(1);
  });

  it("gestisce il comando abort rilasciando tutti i lock e impostando lo stato ABORTED", async () => {
    engine.acquireFileLock("critical.ts");
    const abortRes = await engine.abort("Emergenza manuale");

    expect(abortRes.success).toBe(true);
    expect(abortRes.currentState).toBe("ABORTED");
    expect(engine.getState()).toBe("ABORTED");

    // Lock rilasciato
    expect(engine.acquireFileLock("critical.ts")).toBe(true);
  });
});
