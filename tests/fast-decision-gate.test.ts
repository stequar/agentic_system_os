import { describe, it, expect } from "vitest";
import { FastDecisionGate } from "../src/core/fast-decision-gate.js";

describe("Kahneman System-1 Fast Decision Gate (TCK-15.2)", () => {
  it("esegue FAST_APPROVE su azioni sicure e deterministiche in sub-10ms a costo $0", () => {
    const res = FastDecisionGate.evaluate({
      action: "GIT_STATUS",
      targetFiles: ["src/core/engine.ts"],
    });

    expect(res.decision).toBe("FAST_APPROVE");
    expect(res.tokenCostUsd).toBe(0);
    expect(res.latencyMs).toBeLessThan(10);
    expect(res.routedTo).toBe("LOCAL_DETERMINISTIC_ENGINE");
    expect(res.ruleTriggered).toBe("DETERMINISTIC_SAFE_ACTION");
  });

  it("esegue FAST_REJECT immediato su percorsi protetti o vietati (.git, .env, node_modules)", () => {
    const resGit = FastDecisionGate.evaluate({
      action: "MODIFY_FILE",
      targetFiles: [".git/config"],
    });
    expect(resGit.decision).toBe("FAST_REJECT");
    expect(resGit.ruleTriggered).toBe("SEC_GUARD_FORBIDDEN_PATH");
    expect(resGit.latencyMs).toBeLessThan(10);

    const resEnv = FastDecisionGate.evaluate({
      action: "READ_SECRET",
      targetFiles: [".env.production"],
    });
    expect(resEnv.decision).toBe("FAST_REJECT");
    expect(resEnv.ruleTriggered).toBe("SEC_GUARD_FORBIDDEN_PATH");
  });

  it("esegue FAST_REJECT su tentativi di leak di credenziali o chiavi private", () => {
    const res = FastDecisionGate.evaluate({
      action: "COMMIT_SECRET",
      promptSnippet: "Ecco la mia chiave github ghp_123456789012345678901234567890123456 da usare per il push.",
    });

    expect(res.decision).toBe("FAST_REJECT");
    expect(res.tokenCostUsd).toBe(0);
    expect(res.ruleTriggered).toBe("SEC_GUARD_SECRET_LEAK");
    expect(res.latencyMs).toBeLessThan(10);
  });

  it("esegue ESCALATE_TO_SYSTEM2 su azioni architetturali complesse o modifiche su più di 2 file", () => {
    const resArchitecture = FastDecisionGate.evaluate({
      action: "ARCHITECTURE_REDESIGN",
      targetFiles: ["src/core/engine.ts"],
    });
    expect(resArchitecture.decision).toBe("ESCALATE_TO_SYSTEM2");
    expect(resArchitecture.routedTo).toBe("SYSTEM_2_ROUNDTABLE");
    expect(resArchitecture.latencyMs).toBeLessThan(10);

    const resBatch = FastDecisionGate.evaluate({
      action: "UPDATE_MODULES",
      targetFiles: ["src/a.ts", "src/b.ts", "src/c.ts"],
    });
    expect(resBatch.decision).toBe("ESCALATE_TO_SYSTEM2");
    expect(resBatch.ruleTriggered).toBe("MULTI_FILE_COMPLEXITY_POLICY");
  });

  it("approva task atomico circoscritto su singolo file per esecuzione Leaf Developer", () => {
    const res = FastDecisionGate.evaluate({
      action: "FIX_TYPE_ERROR",
      targetFiles: ["src/utils/math.ts"],
    });

    expect(res.decision).toBe("FAST_APPROVE");
    expect(res.routedTo).toBe("LEAF_DEVELOPER_EXECUTION");
    expect(res.latencyMs).toBeLessThan(10);
  });
});
