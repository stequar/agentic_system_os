import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { parseBacklogToKanban, moveTicketInBacklog } from "../src/studio/kanban.js";
import { startStudioServer, type StudioServerHandle } from "../src/studio/server.js";
import { CompanyEventBus } from "../src/core/event-bus.js";
import {
  KanbanBoardSchema,
  KanbanMoveResultSchema,
} from "../src/contracts/studio.js";

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

const SAMPLE_BACKLOG = `# Backlog Operativo

## 🏃 Sprint 1: Core Foundation (Completato ✅)

### 🎫 TCK-1.1: Project Inspector (Completato ✅)
- **Epica:** Core Engine
- **Assegnato a:** Backend Lead

### 🎫 TCK-1.2: Deterministic Gatekeeper
- **Epica:** Quality
- **Assegnato a:** QA Lead

## 🏃 Sprint 9: Visual Studio Kanban (ATTIVO ORA 🚀)

### 🎫 TCK-9.1: Runtime Interceptor (Completato ✅)
- **Epica:** Contracts
- **Assegnato a:** Core Lead

### 🎫 TCK-9.2: Merkle Trail Logger (In Review 🔍)
- **Epica:** Security
- **Assegnato a:** Security Lead

### 🎫 TCK-9.3: Kanban Studio Board (In Corso ⏳)
- **Epica:** DevEx
- **Assegnato a:** Frontend Lead

### 🎫 TCK-9.4: Cooperation Metrics
- **Epica:** Telemetry
- **Assegnato a:** QA Lead

## 📅 Sprint 10: Future Enhancements (Pianificato 📋)

### 🎫 TCK-10.1: Prompt Caching Engine
- **Epica:** AI Optimization
`;

describe("Interactive Visual Kanban Board & Drag-and-Drop Studio (TCK-9.3)", () => {
  let tempDir: string;
  let backlogPath: string;
  let studioHandle: StudioServerHandle | null = null;
  let bus: CompanyEventBus;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kanban-test-"));
    const wikiDir = path.join(tempDir, "docs", "wiki", "product");
    await fs.mkdir(wikiDir, { recursive: true });
    backlogPath = path.join(wikiDir, "backlog.md");
    await fs.writeFile(backlogPath, SAMPLE_BACKLOG, "utf-8");
    bus = new CompanyEventBus();
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

  it("esegue il parsing del markdown popolando una KanbanBoard tipizzata Zod", () => {
    const board = parseBacklogToKanban(SAMPLE_BACKLOG);
    KanbanBoardSchema.parse(board);

    expect(board.tickets.length).toBe(7);
    expect(board.columns).toEqual(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

    // TCK-1.1: Completed in completed sprint
    const tck11 = board.tickets.find((t) => t.id === "TCK-1.1");
    expect(tck11?.status).toBe("DONE");
    expect(tck11?.title).toBe("Project Inspector");
    expect(tck11?.epic).toBe("Core Engine");
    expect(tck11?.assignedTo).toBe("Backend Lead");

    // TCK-1.2: No tag, but Sprint 1 is Completato -> DONE
    const tck12 = board.tickets.find((t) => t.id === "TCK-1.2");
    expect(tck12?.status).toBe("DONE");

    // TCK-9.2: (In Review 🔍) -> REVIEW
    const tck92 = board.tickets.find((t) => t.id === "TCK-9.2");
    expect(tck92?.status).toBe("REVIEW");

    // TCK-9.3: (In Corso ⏳) -> IN_PROGRESS
    const tck93 = board.tickets.find((t) => t.id === "TCK-9.3");
    expect(tck93?.status).toBe("IN_PROGRESS");

    // TCK-9.4: No tag in ACTIVE sprint -> TODO
    const tck94 = board.tickets.find((t) => t.id === "TCK-9.4");
    expect(tck94?.status).toBe("TODO");

    // TCK-10.1: No tag in PLANNED sprint -> BACKLOG
    const tck101 = board.tickets.find((t) => t.id === "TCK-10.1");
    expect(tck101?.status).toBe("BACKLOG");
  });

  it("sposta atomicamente un ticket su disco e genera evento TICKET_STATUS_CHANGED", async () => {
    let capturedEvent: any = null;
    bus.subscribe("TICKET_STATUS_CHANGED", (e) => {
      capturedEvent = e;
    });

    const result = await moveTicketInBacklog(backlogPath, "TCK-9.3", "DONE", bus);
    KanbanMoveResultSchema.parse(result);

    expect(result.success).toBe(true);
    expect(result.ticketId).toBe("TCK-9.3");
    expect(result.previousColumn).toBe("IN_PROGRESS");
    expect(result.newColumn).toBe("DONE");

    // Verifica persistenza atomica sul file markdown
    const updatedContent = await fs.readFile(backlogPath, "utf-8");
    expect(updatedContent).toContain("### 🎫 TCK-9.3: Kanban Studio Board (Completato ✅)");

    // Rilettura con parser per verificare che il ticket risulti DONE
    const updatedBoard = parseBacklogToKanban(updatedContent);
    const movedTicket = updatedBoard.tickets.find((t) => t.id === "TCK-9.3");
    expect(movedTicket?.status).toBe("DONE");

    // Verifica evento emesso sul bus
    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent.type).toBe("TICKET_STATUS_CHANGED");
    expect(capturedEvent.payload.ticketId).toBe("TCK-9.3");
    expect(capturedEvent.payload.newColumn).toBe("DONE");
  });

  it("è idempotente quando il ticket si trova già nella colonna di destinazione", async () => {
    const result = await moveTicketInBacklog(backlogPath, "TCK-9.1", "DONE");
    expect(result.success).toBe(true);
    expect(result.previousColumn).toBe("DONE");
    expect(result.newColumn).toBe("DONE");
    expect(result.message).toContain("si trova già nella colonna DONE");
  });

  it("lancia un errore appropriato se il ticket non esiste", async () => {
    await expect(
      moveTicketInBacklog(backlogPath, "TCK-999.9", "DONE")
    ).rejects.toThrow("Ticket 'TCK-999.9' not found");
  });

  it("serve la board via GET /api/kanban con autenticazione via token", async () => {
    studioHandle = await startStudioServer({
      port: 4431,
      targetPath: tempDir,
      eventBus: bus,
    });

    const res = await makeRequest(`http://127.0.0.1:4431/api/kanban?token=${studioHandle.token}`);
    expect(res.statusCode).toBe(200);
    const board = JSON.parse(res.body);
    expect(board.tickets.length).toBe(7);
    expect(board.columns).toContain("IN_PROGRESS");
  });

  it("gestisce lo spostamento drag-and-drop via POST /api/kanban/move", async () => {
    studioHandle = await startStudioServer({
      port: 4432,
      targetPath: tempDir,
      eventBus: bus,
    });

    const res = await makeRequest(
      `http://127.0.0.1:4432/api/kanban/move?token=${studioHandle.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://127.0.0.1:4432",
        },
        body: JSON.stringify({
          ticketId: "TCK-9.4",
          targetColumn: "IN_PROGRESS",
        }),
      }
    );

    expect(res.statusCode).toBe(200);
    const moveResult = JSON.parse(res.body);
    expect(moveResult.success).toBe(true);
    expect(moveResult.ticketId).toBe("TCK-9.4");
    expect(moveResult.newColumn).toBe("IN_PROGRESS");

    // Verifica persistenza sul file
    const fileContent = await fs.readFile(backlogPath, "utf-8");
    expect(fileContent).toContain("### 🎫 TCK-9.4: Cooperation Metrics (In Corso ⏳)");
  });

  it("blocca POST /api/kanban/move in caso di violazione Origin CSRF", async () => {
    studioHandle = await startStudioServer({
      port: 4433,
      targetPath: tempDir,
      eventBus: bus,
    });

    const res = await makeRequest(
      `http://127.0.0.1:4433/api/kanban/move?token=${studioHandle.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://malicious-website.com",
        },
        body: JSON.stringify({
          ticketId: "TCK-9.4",
          targetColumn: "DONE",
        }),
      }
    );

    expect(res.statusCode).toBe(403);
    const data = JSON.parse(res.body);
    expect(data.error).toContain("Cross-Origin request blocked");
  });
});
