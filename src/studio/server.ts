import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { URL } from "node:url";
import { renderStudioHtml } from "./ui.js";
import { CompanyEventBus } from "../core/event-bus.js";
import { SteeringEngine } from "../core/steering-engine.js";
import {
  StudioConfigSchema,
  StudioCommandSchema,
  KanbanMoveRequestSchema,
  WarRoomResolveRequestSchema,
  type StudioCommand,
  type TrajectoryNodeCategory,
} from "../contracts/studio.js";
import { parseBacklogToKanban, moveTicketInBacklog } from "./kanban.js";
import { MetricsAggregator } from "../core/metrics-aggregator.js";
import { FinOpsEngine } from "../core/finops-engine.js";
import { ContextHealthMeter } from "../core/context-health.js";
import { TrajectoryReader } from "../core/trajectory-reader.js";
import { StudioAgileHandler } from "./agile-handler.js";
import { FluffTelemetry } from "../core/fluff-telemetry.js";
import { buildSpatialArchitectureGraph } from "./spatial-canvas.js";
import { executeExecutiveVoiceCommand } from "./voice-director.js";

export interface StudioServerHandle {
  server: http.Server;
  port: number;
  host: string;
  url: string;
  token: string;
  stop: () => Promise<void>;
}

export interface StartStudioOptions {
  port?: number;
  host?: string;
  targetPath?: string;
  steeringEngine?: SteeringEngine;
  eventBus?: CompanyEventBus;
}

/**
 * Avvia il server embedded per il Web Studio Dashboard su localhost:4321
 */
export async function startStudioServer(options?: StartStudioOptions): Promise<StudioServerHandle> {
  const targetPath = path.resolve(options?.targetPath || process.cwd());
  const host = "127.0.0.1"; // Loopback rigoroso obbligatorio
  const port = options?.port !== undefined ? options.port : 4321;
  const token = crypto.randomBytes(32).toString("hex");

  // Persiste il token effimero in .agents/.studio-token con permessi restrittivi 0600
  const agentsDir = path.join(targetPath, ".agents");
  await fs.mkdir(agentsDir, { recursive: true });
  const tokenPath = path.join(agentsDir, ".studio-token");
  await fs.writeFile(tokenPath, token, { mode: 0o600, encoding: "utf-8" });
  await fs.chmod(tokenPath, 0o600).catch(() => {});

  const eventBus = options?.eventBus || CompanyEventBus.getInstance();
  const steeringEngine = options?.steeringEngine || new SteeringEngine(eventBus);
  const sseClients: Set<http.ServerResponse> = new Set();
  const startTime = Date.now();

  // Connessione con CompanyEventBus per lo streaming SSE
  const unsubscribeBus = eventBus.subscribe("*", (event) => {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(data);
      } catch {
        sseClients.delete(client);
      }
    }
  });

  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = parsedUrl.pathname;

    // 1. Validazione DNS Rebinding: ammette solo localhost / 127.0.0.1
    const hostHeader = (req.headers.host || "").split(":")[0];
    if (hostHeader !== "127.0.0.1" && hostHeader !== "localhost") {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden: DNS Rebinding attack blocked.");
      return;
    }

    // 2. Estrazione e verifica del token di autenticazione
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const queryToken = parsedUrl.searchParams.get("token");
    const providedToken = bearerToken || queryToken;

    const isAuthorized = providedToken === token;

    // Endpoint: UI Web principale
    if (pathname === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderStudioHtml(token));
      return;
    }

    // Per tutti gli endpoint /api/* il token è perentorio
    if (!isAuthorized) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized: Token effimero non valido o assente." }));
      return;
    }

    // Endpoint: SSE Stream
    if (pathname === "/api/events" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      res.write(": alive\n\n");
      // Invia lo stato iniziale
      res.write(
        `data: ${JSON.stringify({
          type: "STUDIO_CONNECTED",
          sourceAgent: "studio_server",
          payload: { targetPath, status: steeringEngine.getState() },
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      sseClients.add(res);
      req.on("close", () => {
        sseClients.delete(res);
      });
      return;
    }

    // Endpoint: Status
    if (pathname === "/api/status" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: steeringEngine.getState(),
          connectedClients: sseClients.size,
          targetPath,
          uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        })
      );
      return;
    }

    // Endpoint: Steering Command (POST /api/steer)
    if (pathname === "/api/steer" && req.method === "POST") {
      // Validazione Origin per prevenire CSRF
      const origin = req.headers.origin;
      if (origin && !origin.includes("127.0.0.1") && !origin.includes("localhost")) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Cross-Origin request blocked." }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const parsed = StudioCommandSchema.parse(JSON.parse(body || "{}"));
          let result;

          switch (parsed.action) {
            case "pause":
              result = steeringEngine.requestPause();
              break;
            case "resume":
              result = await steeringEngine.resume();
              break;
            case "hint":
              result = steeringEngine.submitHint(parsed.message || "");
              break;
            case "abort":
              result = await steeringEngine.abort(parsed.message);
              break;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, result }));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
        }
      });
      return;
    }

    // Endpoint: Kanban Board (GET /api/kanban)
    if (pathname === "/api/kanban" && req.method === "GET") {
      const backlogPath = path.join(targetPath, "docs", "wiki", "product", "backlog.md");
      try {
        const content = await fs.readFile(backlogPath, "utf-8");
        const board = parseBacklogToKanban(content);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(board));
      } catch {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            tickets: [],
            columns: ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"],
            updatedAt: new Date().toISOString(),
          })
        );
      }
      return;
    }

    // Endpoint: Kanban Move Ticket (POST /api/kanban/move)
    if (pathname === "/api/kanban/move" && req.method === "POST") {
      const origin = req.headers.origin;
      if (origin && !origin.includes("127.0.0.1") && !origin.includes("localhost")) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Cross-Origin request blocked." }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const parsed = KanbanMoveRequestSchema.parse(JSON.parse(body || "{}"));
          const backlogPath = path.join(targetPath, "docs", "wiki", "product", "backlog.md");
          const result = await moveTicketInBacklog(
            backlogPath,
            parsed.ticketId,
            parsed.targetColumn,
            eventBus
          );

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
        }
      });
      return;
    }

    // Endpoint: Process & Quality Metrics (GET /api/metrics)
    if (pathname === "/api/metrics" && req.method === "GET") {
      try {
        const metrics = await MetricsAggregator.calculateFromPath(targetPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(metrics));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Live FinOps Summary (GET /api/finops)
    if (pathname === "/api/finops" && req.method === "GET") {
      try {
        const summary = FinOpsEngine.getInstance().getSummary();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(summary));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Context Health Score & Report (GET /api/context-health)
    if (pathname === "/api/context-health" && req.method === "GET") {
      try {
        const tokensParam = parsedUrl.searchParams.get("tokens");
        let currentTokens = tokensParam ? parseInt(tokensParam, 10) : 0;
        if (isNaN(currentTokens) || currentTokens <= 0) {
          const finops = FinOpsEngine.getInstance().getSummary();
          currentTokens = finops.totalTokens > 0 ? finops.totalTokens : 12_500;
        }
        const health = ContextHealthMeter.getInstance().getReport(currentTokens);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(health));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Breadcrumb Trajectory Timeline (GET /api/trajectory)
    if (pathname === "/api/trajectory" && req.method === "GET") {
      try {
        const limit = parseInt(parsedUrl.searchParams.get("limit") || "50", 10);
        const offset = parseInt(parsedUrl.searchParams.get("offset") || "0", 10);
        const category = parsedUrl.searchParams.get("category") as TrajectoryNodeCategory | undefined;

        const trajectory = await TrajectoryReader.readTrajectory(targetPath, {
          limit,
          offset,
          category: category || undefined,
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(trajectory));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Agile Ceremonies Board (GET /api/ceremonies)
    if (pathname === "/api/ceremonies" && req.method === "GET") {
      try {
        const ceremonies = await StudioAgileHandler.readCeremonies(targetPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(ceremonies));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Live War Room Cockpit Status (GET /api/war-room)
    if (pathname === "/api/war-room" && req.method === "GET") {
      try {
        const warRoom = await StudioAgileHandler.getWarRoomStatus(targetPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(warRoom));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Resolve War Room Incident (POST /api/war-room/resolve)
    if (pathname === "/api/war-room/resolve" && req.method === "POST") {
      const origin = req.headers.origin;
      if (origin && !origin.includes("127.0.0.1") && !origin.includes("localhost")) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Cross-Origin request blocked." }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const parsed = WarRoomResolveRequestSchema.parse(JSON.parse(body || "{}"));
          const resolved = await StudioAgileHandler.resolveWarRoomIncident(
            targetPath,
            parsed.incidentId,
            parsed.resolutionNotes
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, resolved }));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
        }
      });
      return;
    }

    // Endpoint: Token Fluff Telemetry (GET /api/fluff-telemetry)
    if (pathname === "/api/fluff-telemetry" && req.method === "GET") {
      try {
        const report = FluffTelemetry.getInstance().getReport(targetPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(report));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Living Spatial Architecture Graph (GET /api/spatial-graph)
    if (pathname === "/api/spatial-graph" && req.method === "GET") {
      try {
        const graph = await buildSpatialArchitectureGraph(targetPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(graph));
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || String(err) }));
      }
      return;
    }

    // Endpoint: Executive Voice Director in Italiano (POST /api/voice-director)
    if (pathname === "/api/voice-director" && req.method === "POST") {
      const origin = req.headers.origin;
      if (origin && !origin.includes("127.0.0.1") && !origin.includes("localhost")) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Forbidden: Cross-Origin request blocked." }));
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const parsedBody = JSON.parse(body || "{}");
          const transcript = String(parsedBody.transcript || "");
          if (!transcript.trim()) {
            throw new Error("Il campo 'transcript' è obbligatorio.");
          }
          const voiceResult = await executeExecutiveVoiceCommand({
            targetPath,
            transcript,
            steeringEngine,
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, ...voiceResult }));
        } catch (err: any) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
        }
      });
      return;
    }

    // 404 Not Found
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(port, host, () => resolve());
    server.on("error", reject);
  });

  const boundPort = (server.address() as any)?.port || port;
  const url = `http://${host}:${boundPort}/?token=${token}`;

  const stop = async () => {
    unsubscribeBus();
    for (const client of sseClients) {
      try {
        client.end();
      } catch {}
    }
    sseClients.clear();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    try {
      await fs.unlink(tokenPath).catch(() => {});
    } catch {}
  };

  return {
    server,
    port: boundPort,
    host,
    url,
    token,
    stop,
  };
}
