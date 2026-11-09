import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  evaluateTestFlakiness,
  loadQuarantineRegistry,
  isTestQuarantined,
  formatBacklogTicket,
} from "../src/gatekeeper/quarantine.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

describe("Flaky Test N=3 Detection & Quarantine Engine (TCK-7.4)", () => {
  let tempDir: string;
  let bus: CompanyEventBus;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "quarantine-test-"));
    bus = new CompanyEventBus();
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    bus.clear();
  });

  it("non mette in quarantena se il test passa 3/3 volte", async () => {
    const executor = async () => true;

    const result = await evaluateTestFlakiness({
      targetPath: tempDir,
      testIdentifier: "test_stable_check",
      testFile: "tests/stable.test.ts",
      testExecutor: executor,
      eventBus: bus,
    });

    expect(result.actionTaken).toBe("PASS");
    expect(result.isFlaky).toBe(false);
    expect(result.isDeterministicFailure).toBe(false);
    expect(result.runs).toEqual(["PASS", "PASS", "PASS"]);

    const isQuarantined = await isTestQuarantined(tempDir, "test_stable_check");
    expect(isQuarantined).toBe(false);
  });

  it("rifiuta la quarantena se il test fallisce 3/3 volte (Fallimento Deterministico / Bug Reale)", async () => {
    const executor = async () => false;

    const result = await evaluateTestFlakiness({
      targetPath: tempDir,
      testIdentifier: "test_broken_auth",
      testFile: "tests/auth.test.ts",
      testExecutor: executor,
      eventBus: bus,
    });

    expect(result.actionTaken).toBe("REJECTED_DETERMINISTIC");
    expect(result.isDeterministicFailure).toBe(true);
    expect(result.isFlaky).toBe(false);
    expect(result.runs).toEqual(["FAIL", "FAIL", "FAIL"]);
    expect(result.message).toContain("FALLIMENTO DETERMINISTICO");

    const isQuarantined = await isTestQuarantined(tempDir, "test_broken_auth");
    expect(isQuarantined).toBe(false);
  });

  it("isola in quarantena il test se i risultati alternano PASS e FAIL (vettore misto)", async () => {
    // Esecuzioni: [FAIL, PASS, PASS]
    let callCount = 0;
    const executor = async () => {
      callCount++;
      return callCount !== 1; // 1st run: false (FAIL), 2nd: true (PASS), 3rd: true (PASS)
    };

    const result = await evaluateTestFlakiness({
      targetPath: tempDir,
      testIdentifier: "test_race_condition",
      testFile: "tests/concurrency.test.ts",
      testExecutor: executor,
      eventBus: bus,
    });

    expect(result.actionTaken).toBe("QUARANTINED");
    expect(result.isFlaky).toBe(true);
    expect(result.isDeterministicFailure).toBe(false);
    expect(result.runs).toEqual(["FAIL", "PASS", "PASS"]);
    expect(result.quarantinedRecord).toBeDefined();
    expect(result.quarantinedRecord?.issueTicketId).toContain("TCK-FLAKY");

    // Verifica persistenza su file
    const registry = await loadQuarantineRegistry(tempDir);
    expect(registry.quarantinedTests).toHaveLength(1);
    expect(registry.quarantinedTests[0].testIdentifier).toBe("test_race_condition");

    const isQuarantined = await isTestQuarantined(tempDir, "test_race_condition");
    expect(isQuarantined).toBe(true);
  });

  it("blocca con CAP_EXCEEDED se si supera il numero massimo di test in quarantena consentiti", async () => {
    let count = 0;
    const alternatingExecutor = async () => {
      count++;
      return count % 2 === 0;
    };

    // Primo test in quarantena (max = 1)
    await evaluateTestFlakiness({
      targetPath: tempDir,
      testIdentifier: "flaky_1",
      testFile: "tests/f1.test.ts",
      testExecutor: alternatingExecutor,
      maxAllowed: 1,
      eventBus: bus,
    });

    // Secondo test: deve superare il cap
    const secondResult = await evaluateTestFlakiness({
      targetPath: tempDir,
      testIdentifier: "flaky_2",
      testFile: "tests/f2.test.ts",
      testExecutor: alternatingExecutor,
      maxAllowed: 1,
      eventBus: bus,
    });

    expect(secondResult.actionTaken).toBe("CAP_EXCEEDED");
    expect(secondResult.message).toContain("limite massimo");
  });

  it("genera il Markdown per il ticket del backlog", () => {
    const ticket = formatBacklogTicket({
      testIdentifier: "test_network_sync",
      testFile: "tests/net.test.ts",
      runs: ["FAIL", "PASS", "PASS"],
      quarantinedAt: "2026-10-16T17:00:00.000Z",
      reason: "Alternanza N=3",
      issueTicketId: "TCK-FLAKY-net-sync",
    });

    expect(ticket).toContain("TCK-FLAKY-net-sync");
    expect(ticket).toContain("tests/net.test.ts");
    expect(ticket).toContain("FAIL, PASS, PASS");
  });
});
