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
  it("calcola deterministicamente il resilienceScore (0-100) ed impone 0 se containmentSuccess è false", () => {
    expect(
      calculateResilienceScore({
        containmentSuccess: false,
        detectionTimeMs: 5,
        recoveryTimeMs: 10,
      })
    ).toBe(0);

    expect(
      calculateResilienceScore({
        containmentSuccess: true,
        detectionTimeMs: 12,
        recoveryTimeMs: 25,
      })
    ).toBe(100);

    const midScore = calculateResilienceScore({
      containmentSuccess: true,
      detectionTimeMs: 275, // metà tra 50ms e 500ms -> +7.5
      recoveryTimeMs: 550, // metà tra 100ms e 1000ms -> +7.5
    });
    expect(midScore).toBe(85);
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

  it("blocca ADVERSARIAL_PROMPT_INJECTION tramite FastDecisionGate e SecretGuard in <50ms", async () => {
    const result = await runChaosExperiment({
      faultType: "ADVERSARIAL_PROMPT_INJECTION",
    });

    expect(result.containmentSuccess).toBe(true);
    expect(result.detectionTimeMs).toBeLessThan(50);
    expect(result.resilienceScore).toBe(100);
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
    expect(parsed.resilienceScore).toBe(100);

    await client.disconnect();
    await server.close();
  });
});
