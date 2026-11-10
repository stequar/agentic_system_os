import { describe, it, expect } from "vitest";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ChaosFaultInjectionSchema } from "../src/contracts/frontiers.js";
import {
  calculateResilienceScore,
  runChaosExperiment,
  runFullChaosCampaign,
} from "../src/security/chaos-engine.js";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { createMcpServer } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";

describe("Sprint 22: Antifragile Chaos Swarm & Synthetic Fault Injection Engine", () => {
  it("resilienceScore: enforces behavioral invariants (containment override, monotonicity, [0,100] bounds) — not a hardcoded formula", () => {
    // TCK-DH.3: assert the score's CONTRACT (properties that must hold for any correct
    // implementation), not the specific arithmetic of the current implementation.

    // Invariant 1 — Containment failure is an absolute override, regardless of how fast it was.
    expect(
      calculateResilienceScore({ containmentSuccess: false, detectionTimeMs: 1, recoveryTimeMs: 1 })
    ).toBe(0);
    expect(
      calculateResilienceScore({ containmentSuccess: false, detectionTimeMs: 9999, recoveryTimeMs: 9999 })
    ).toBe(0);

    const score = (detectionTimeMs: number, recoveryTimeMs: number) =>
      calculateResilienceScore({ containmentSuccess: true, detectionTimeMs, recoveryTimeMs });

    const fast = score(12, 25);
    const mid = score(275, 550);
    const slow = score(5000, 60000);

    // Invariant 2 — Every contained incident scores strictly positive and within [0, 100].
    for (const s of [fast, mid, slow]) {
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(100);
    }

    // Invariant 3 — Monotonicity: faster detection+recovery must never score lower than slower.
    //   This catches real regressions (sign flips, broken bonus math) that a hardcoded value cannot.
    expect(fast).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(slow);

    // Invariant 4 — Optimal (instant) response reaches the ceiling; a slower contained incident stays below it.
    const best = score(0, 0);
    expect(best).toBe(100);
    expect(mid).toBeLessThan(best);

    // Invariant 5 — Output stays bounded even on absurd/negative inputs (no overflow/underflow).
    const absurd = score(-1, -1);
    expect(absurd).toBeGreaterThanOrEqual(0);
    expect(absurd).toBeLessThanOrEqual(100);
  });

  it("intercetta AST_MUTATION_OFF_BY_ONE tramite Formal Prover ed esegue il rollback atomico in War Room", async () => {
    const result = await runChaosExperiment({
      faultType: "AST_MUTATION_OFF_BY_ONE",
    });

    expect(() => ChaosFaultInjectionSchema.parse(result)).not.toThrow();
    expect(result.containmentSuccess).toBe(true);
    expect(result.warRoomActivated).toBe(true);
    expect(result.resilienceScore).toBeGreaterThanOrEqual(90);
    // Verifica che il write-lock della War Room sia stato rilasciato al termine del recovery
    expect(WarRoomEngine.isWriteLocked()).toBe(false);
  });

  it("contains ADVERSARIAL_PROMPT_INJECTION via FastDecisionGate & SecretGuard (deterministic simulation)", async () => {
    const result = await runChaosExperiment({
      faultType: "ADVERSARIAL_PROMPT_INJECTION",
    });

    // Behavioral guarantee: the fault is contained. We do NOT assert a wall-clock
    // threshold (detectionTimeMs measures in-process stub speed and is CPU-load dependent
    // — it was flaky under full-suite load). resilienceScore is checked as a high-range,
    // not an exact 100, for the same reason.
    expect(result.containmentSuccess).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.detectionTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.resilienceScore).toBeGreaterThanOrEqual(90);
  });

  it("rileva la manomissione parziale del WAL in DISK_WAL_PARTIAL_CORRUPT tramite AuditLogger Merkle", async () => {
    const result = await runChaosExperiment({
      faultType: "DISK_WAL_PARTIAL_CORRUPT",
    });

    expect(result.containmentSuccess).toBe(true);
    expect(result.resilienceScore).toBeGreaterThanOrEqual(90);
  });

  it("isola RACE_CONDITION_ASYNC_QUEUE, NETWORK_LATENCY_SPIKE e CIRCULAR_DEPENDENCY_DEADLOCK", async () => {
    const raceRes = await runChaosExperiment({
      faultType: "RACE_CONDITION_ASYNC_QUEUE",
    });
    expect(raceRes.containmentSuccess).toBe(true);
    expect(raceRes.warRoomActivated).toBe(true);

    const latencyRes = await runChaosExperiment({
      faultType: "NETWORK_LATENCY_SPIKE",
    });
    expect(latencyRes.containmentSuccess).toBe(true);

    const deadlockRes = await runChaosExperiment({
      faultType: "CIRCULAR_DEPENDENCY_DEADLOCK",
    });
    expect(deadlockRes.containmentSuccess).toBe(true);
  });

  it("esegue la campagna completa dei 6 vettori di Chaos Engineering certificando allContained=true", async () => {
    const campaign = await runFullChaosCampaign();

    expect(campaign.experiments).toHaveLength(6);
    expect(campaign.allContained).toBe(true);
    expect(campaign.warRoomActivationsCount).toBe(2);
    expect(campaign.overallResilienceScore).toBeGreaterThanOrEqual(90);
  });

  it("espone e invoca run_chaos_experiment tramite MCP Server & Client Bridge", async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const server = createMcpServer();
    await server.connect(serverTransport);

    const client = new McpClientBridge(
      { serverName: "chaos-mcp-test" },
      clientTransport
    );
    await client.connect();

    const response = await client.callTool({
      name: "run_chaos_experiment",
      arguments: {
        faultType: "ADVERSARIAL_PROMPT_INJECTION",
      },
    });

    expect(response.isError).toBe(false);
    const parsed = ChaosFaultInjectionSchema.parse(
      JSON.parse(response.content[0].text)
    );
    expect(parsed.containmentSuccess).toBe(true);
    // High-range, not exact 100: resilienceScore folds load-dependent wall-clock timing.
    expect(parsed.resilienceScore).toBeGreaterThanOrEqual(90);

    await client.disconnect();
    await server.close();
  });
});
