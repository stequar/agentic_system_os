import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  buildSpatialArchitectureGraph,
  SpatialArchitectureGraphSchema,
} from "../src/studio/spatial-canvas.js";
import {
  classifyItalianVoiceIntent,
  executeExecutiveVoiceCommand,
} from "../src/studio/voice-director.js";
import { startStudioServer } from "../src/studio/server.js";
import { createMcpServer } from "../src/mcp/server.js";
import { McpClientBridge } from "../src/mcp/client.js";

describe("Sprint 23: Living Spatial Architecture Canvas & Executive Voice Director", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "spatial-voice-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  describe("TCK-23.1 & TCK-23.2: Living Spatial Architecture Canvas & Trajectory Heatmap", () => {
    it("costruisce il grafo spaziale concentrico 2D/3D (L1 -> Ring-0 -> Ring-1/2 -> Subsystems) con heatmap", async () => {
      const graph = await buildSpatialArchitectureGraph(process.cwd());

      expect(() => SpatialArchitectureGraphSchema.parse(graph)).not.toThrow();
      expect(graph.nodes.some((n) => n.id === "cto" && n.ringLevel === 0)).toBe(
        true
      );
      expect(
        graph.nodes.some(
          (n) => n.id === "engineering_lead" && n.ringLevel === 1
        )
      ).toBe(true);
      expect(
        graph.nodes.some(
          (n) => n.category === "RING_2_DOMAIN_EXPERT" && n.ringLevel === 2
        )
      ).toBe(true);
      expect(
        graph.nodes.some(
          (n) => n.id === "sub_formal_prover" && n.ringLevel === 3
        )
      ).toBe(true);
      expect(graph.edges.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("TCK-23.3: Executive Voice Director & Italian Speech-to-Intent", () => {
    it("interpreta i comandi vocali in italiano del CEO incluso il toggle del checkpoint Spike", async () => {
      const c1 = classifyItalianVoiceIntent(
        "Attiva il checkpoint spike e chiedimi conferma prima di sviluppare"
      );
      expect(c1.intent).toBe("TOGGLE_SPIKE_CHECKPOINT");
      expect(c1.desiredSpikeMode).toBe("HITL_SPIKE_REVIEW");

      const c2 = classifyItalianVoiceIntent(
        "Disattiva checkpoint spike, procedi in automatico"
      );
      expect(c2.intent).toBe("TOGGLE_SPIKE_CHECKPOINT");
      expect(c2.desiredSpikeMode).toBe("AUTONOMOUS_FAST_TRACK");

      const execHitl = await executeExecutiveVoiceCommand({
        targetPath: tempDir,
        transcript: "Attiva il punto intermedio sullo spike",
      });
      expect(execHitl.intent).toBe("TOGGLE_SPIKE_CHECKPOINT");
      expect(execHitl.spikeCheckpointMode).toBe("HITL_SPIKE_REVIEW");
      expect(execHitl.spokenBriefingIt).toContain("Ricevuto CEO");

      const persistedRaw = JSON.parse(
        await fs.readFile(
          path.join(tempDir, ".company-os", "spike-checkpoint.json"),
          "utf-8"
        )
      );
      expect(persistedRaw.spikeCheckpointMode).toBe("HITL_SPIKE_REVIEW");
    });

    it("espone GET /api/spatial-graph e POST /api/voice-director su Web Studio e execute_voice_command su MCP", async () => {
      const studio = await startStudioServer(tempDir, { port: 0 });
      try {
        const headers = {
          Authorization: `Bearer ${studio.token}`,
          "Content-Type": "application/json",
        };

        const graphRes = await fetch(
          `http://${studio.host}:${studio.port}/api/spatial-graph`,
          { headers }
        );
        expect(graphRes.status).toBe(200);
        const graphJson = await graphRes.json();
        expect(graphJson.nodes.length).toBeGreaterThan(5);

        const voiceRes = await fetch(
          `http://${studio.host}:${studio.port}/api/voice-director`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              transcript: "Buongiorno, avvia lo standup",
            }),
          }
        );
        expect(voiceRes.status).toBe(200);
        const voiceJson = await voiceRes.json();
        expect(voiceJson.success).toBe(true);
        expect(voiceJson.intent).toBe("RUN_STANDUP");
        expect(voiceJson.spokenBriefingIt).toContain("Buongiorno CEO");
      } finally {
        await studio.stop();
      }

      // Verifica anche via MCP Server
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      const mcpServer = createMcpServer();
      await mcpServer.connect(serverTransport);
      const client = new McpClientBridge(
        { serverName: "voice-mcp-test" },
        clientTransport
      );
      await client.connect();

      const mcpResp = await client.callTool({
        name: "execute_voice_command",
        arguments: {
          transcript: "Verifica antifragilità e chaos test",
          targetPath: tempDir,
        },
      });
      expect(mcpResp.isError).toBe(false);
      const parsedMcp = JSON.parse(mcpResp.content[0].text);
      expect(parsedMcp.intent).toBe("RUN_CHAOS_AUDIT");

      await client.disconnect();
      await mcpServer.close();
    });
  });
});
