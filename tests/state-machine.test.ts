import { describe, it, expect } from "vitest";
import { CompanyStateMachine } from "../src/core/state-machine.js";

describe("CompanyStateMachine", () => {
  it("inizializza lo stato di default su STANDUP", () => {
    const sm = new CompanyStateMachine();
    expect(sm.getState()).toBe("STANDUP");
  });

  it("supporta la transizione da STANDUP a TECH_VALIDATION e poi SPECIFY", async () => {
    const sm = new CompanyStateMachine();
    expect(sm.getState()).toBe("STANDUP");

    const t1 = await sm.transitionTo("TECH_VALIDATION");
    expect(t1).toBe(true);
    expect(sm.getState()).toBe("TECH_VALIDATION");

    const t2 = await sm.transitionTo("SPECIFY");
    expect(t2).toBe(true);
    expect(sm.getState()).toBe("SPECIFY");
  });

  it("supporta il bypass diretto da STANDUP a SPECIFY", async () => {
    const sm = new CompanyStateMachine();
    const t = await sm.transitionTo("SPECIFY");
    expect(t).toBe(true);
    expect(sm.getState()).toBe("SPECIFY");
  });

  it("supporta l'intero ciclo R&D: STANDUP -> RND_DISCOVERY -> RND_ROUNDTABLE -> RND_CONSENSUS -> TECH_VALIDATION", async () => {
    const sm = new CompanyStateMachine();
    expect(sm.getState()).toBe("STANDUP");

    await sm.transitionTo("RND_DISCOVERY");
    expect(sm.getState()).toBe("RND_DISCOVERY");

    await sm.transitionTo("RND_ROUNDTABLE");
    expect(sm.getState()).toBe("RND_ROUNDTABLE");

    await sm.transitionTo("RND_CONSENSUS");
    expect(sm.getState()).toBe("RND_CONSENSUS");

    await sm.transitionTo("TECH_VALIDATION");
    expect(sm.getState()).toBe("TECH_VALIDATION");
  });

  it("lancia errore per transizioni non consentite", async () => {
    const sm = new CompanyStateMachine();
    await expect(sm.transitionTo("IMPLEMENT")).rejects.toThrow("Transizione non valida");
  });
});
