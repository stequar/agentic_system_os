import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { startStudioServer, type StudioServerHandle } from "../src/studio/server.js";
import { SteeringEngine } from "../src/core/steering-engine.js";
import { CompanyEventBus } from "../src/core/event-bus.js";

function makeRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options?.method || "GET",
        headers: options?.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 500,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on("error", reject);
    if (options?.body) {
      req.write(options.body);
    }
    req.end();
  });
}

describe("Zero-Dependency Embedded Local Web Studio Dashboard (TCK-7.3)", () => {
  let tempDir: string;
  let studioHandle: StudioServerHandle | null = null;
  let bus: CompanyEventBus;
  let engine: SteeringEngine;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "studio-test-"));
    bus = new CompanyEventBus();
    engine = new SteeringEngine(bus);
  });

  afterEach(async () => {
    if (studioHandle) {
      await studioHandle.stop();
      studioHandle = null;
    }
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    bus.clear();
  });

  it("avvia il server su 127.0.0.1 e crea il file token con permessi restrittivi 0600", async () => {
    studioHandle = await startStudioServer({
      port: 4421,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    expect(studioHandle.host).toBe("127.0.0.1");
    expect(studioHandle.port).toBe(4421);
    expect(studioHandle.token).toBeDefined();

    // Verifica esistenza file token in .agents/.studio-token
    const tokenFile = path.join(tempDir, ".agents", ".studio-token");
    const stat = await fs.stat(tokenFile);
    expect(stat.isFile()).toBe(true);

    const savedToken = await fs.readFile(tokenFile, "utf-8");
    expect(savedToken).toBe(studioHandle.token);
  });

  it("serve l'interfaccia HTML sulla root GET /", async () => {
    studioHandle = await startStudioServer({
      port: 4422,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4422/?token=${studioHandle.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.body).toContain("Agentic Company OS — Studio");
  });

  it("blocca con 401 Unauthorized richieste API prive di token valido", async () => {
    studioHandle = await startStudioServer({
      port: 4423,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    const res = await makeRequest("http://127.0.0.1:4423/api/status");
    expect(res.statusCode).toBe(401);
  });

  it("restituisce lo stato di sistema con token autorizzato", async () => {
    studioHandle = await startStudioServer({
      port: 4424,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4424/api/status?token=${studioHandle.token}`);
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.status).toBe("RUNNING");
  });

  it("protezione DNS Rebinding: blocca con 403 richieste con Host header non locale", async () => {
    studioHandle = await startStudioServer({
      port: 4425,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4425/?token=${studioHandle.token}`, {
      headers: { Host: "attacker.com" },
    });
    expect(res.statusCode).toBe(403);
    expect(res.body).toContain("DNS Rebinding attack blocked");
  });

  it("esegue comandi di steering via POST /api/steer (es. pause)", async () => {
    studioHandle = await startStudioServer({
      port: 4426,
      targetPath: tempDir,
      steeringEngine: engine,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4426/api/steer?token=${studioHandle.token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://127.0.0.1:4426",
      },
      body: JSON.stringify({ action: "pause" }),
    });

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.success).toBe(true);
    expect(engine.isPauseRequested()).toBe(true);
  });
});
