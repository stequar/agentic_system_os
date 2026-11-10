import fs from "node:fs/promises";
import crypto from "node:crypto";
import {
  KanbanBoardSchema,
  KanbanTicketSchema,
  KanbanMoveResultSchema,
  type KanbanBoard,
  type KanbanColumn,
  type KanbanMoveResult,
  type KanbanTicket,
} from "../contracts/studio.js";
import { atomicWriteFile } from "../utils/fs-atomic.js";
import type { CompanyEventBus } from "../core/event-bus.js";

const STATUS_TAG_REGEX = /\s*\((?:Completato ✅|COMPLETATO ✅|In Review 🔍|REVIEW|In Revisione|In Corso ⏳|In Corso 🚀|IN_PROGRESS|In Sviluppo|Da Fare 📋|TODO|Backlog 📦|BACKLOG)\)\s*$/i;

const COLUMN_TO_TAG: Record<KanbanColumn, string> = {
  DONE: "(Completato ✅)",
  REVIEW: "(In Review 🔍)",
  IN_PROGRESS: "(In Corso ⏳)",
  TODO: "(Da Fare 📋)",
  BACKLOG: "(Backlog 📦)",
};

/**
 * Risolve la colonna Kanban analizzando il titolo del ticket o lo stato dello sprint.
 */
function resolveTicketColumn(
  rawTitle: string,
  currentSprintStatus: "DONE" | "ACTIVE" | "PLANNED" | "UNKNOWN"
): KanbanColumn {
  if (/\(Completato ✅\)|\(COMPLETATO ✅\)/i.test(rawTitle)) {
    return "DONE";
  }
  if (/\(In Review 🔍\)|\(REVIEW\)|\(In Revisione\)/i.test(rawTitle)) {
    return "REVIEW";
  }
  if (/\(In Corso ⏳\)|\(In Corso 🚀\)|\(IN_PROGRESS\)|\(In Sviluppo\)/i.test(rawTitle)) {
    return "IN_PROGRESS";
  }
  if (/\(Da Fare 📋\)|\(TODO\)/i.test(rawTitle)) {
    return "TODO";
  }
  if (/\(Backlog 📦\)|\(BACKLOG\)/i.test(rawTitle)) {
    return "BACKLOG";
  }

  // Fallback in base allo sprint
  if (currentSprintStatus === "DONE") return "DONE";
  if (currentSprintStatus === "ACTIVE") return "TODO";
  if (currentSprintStatus === "PLANNED") return "BACKLOG";
  return "TODO";
}

/**
 * Esegue il parsing di backlog.md estraendo i ticket e popolando una KanbanBoard tipizzata.
 */
export function parseBacklogToKanban(backlogContent: string): KanbanBoard {
  const lines = backlogContent.split(/\r?\n/);
  const tickets: KanbanTicket[] = [];

  let currentSprintStatus: "DONE" | "ACTIVE" | "PLANNED" | "UNKNOWN" = "UNKNOWN";
  let currentTicket: Partial<KanbanTicket> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Rileva testata Sprint (es. ## 🏃 Sprint 9: ...)
    const sprintMatch = line.match(/^##\s*(?:🏃|⏸️|📅)?\s*(Sprint\s+[^:\n]+):?\s*(.*)$/i);
    if (sprintMatch) {
      const sprintHeader = line;
      if (/\(Completato ✅\)/i.test(sprintHeader)) {
        currentSprintStatus = "DONE";
      } else if (/\(ATTIVO ORA 🚀\)|\(In Corso\)/i.test(sprintHeader)) {
        currentSprintStatus = "ACTIVE";
      } else if (/\(Pianificato 📋\)|\(SOSPESO\)/i.test(sprintHeader)) {
        currentSprintStatus = "PLANNED";
      } else {
        currentSprintStatus = "UNKNOWN";
      }
      continue;
    }

    // Rileva testata Ticket (es. ### 🎫 TCK-9.1: Titolo...)
    const ticketMatch = line.match(/^### 🎫\s*([A-Za-z0-9\.\-_]+):\s*(.*)$/);
    if (ticketMatch) {
      if (currentTicket && currentTicket.id && currentTicket.title && currentTicket.status) {
        tickets.push(KanbanTicketSchema.parse(currentTicket));
      }

      const id = ticketMatch[1].trim();
      const rawTitle = ticketMatch[2].trim();
      const status = resolveTicketColumn(rawTitle, currentSprintStatus);
      const cleanTitle = rawTitle.replace(STATUS_TAG_REGEX, "").trim();

      currentTicket = {
        id,
        title: cleanTitle,
        status,
      };
      continue;
    }

    // Estrae metadati dal blocco del ticket corrente
    if (currentTicket) {
      const epicMatch = line.match(/^-\s*\*\*Epica:\*\*\s*(.+)$/i);
      if (epicMatch) {
        currentTicket.epic = epicMatch[1].trim();
        continue;
      }

      const assigneeMatch = line.match(/^-\s*\*\*Assegnato a:\*\*\s*(.+)$/i);
      if (assigneeMatch) {
        currentTicket.assignedTo = assigneeMatch[1].trim();
        continue;
      }
    }
  }

  // Push dell'ultimo ticket se presente
  if (currentTicket && currentTicket.id && currentTicket.title && currentTicket.status) {
    tickets.push(KanbanTicketSchema.parse(currentTicket));
  }

  return KanbanBoardSchema.parse({
    tickets,
    columns: ["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"],
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Sposta deterministicamente un ticket in una colonna target aggiornando atomicamente backlog.md.
 */
export async function moveTicketInBacklog(
  backlogPath: string,
  ticketId: string,
  targetColumn: KanbanColumn,
  eventBus?: CompanyEventBus
): Promise<KanbanMoveResult> {
  const content = await fs.readFile(backlogPath, "utf-8");
  const board = parseBacklogToKanban(content);

  const existingTicket = board.tickets.find((t) => t.id === ticketId);
  if (!existingTicket) {
    throw new Error(`Ticket '${ticketId}' not found in backlog at '${backlogPath}'.`);
  }

  const previousColumn = existingTicket.status;

  // Se la colonna è identica, ritorna successo immediato senza riscrittura I/O
  if (previousColumn === targetColumn) {
    return KanbanMoveResultSchema.parse({
      success: true,
      ticketId,
      previousColumn,
      newColumn: targetColumn,
      message: `Il ticket ${ticketId} si trova già nella colonna ${targetColumn}.`,
      updatedAt: new Date().toISOString(),
    });
  }

  // Costruisce la regex per individuare la linea dell'header del ticket
  const escapedId = ticketId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ticketHeaderRegex = new RegExp(`^(### 🎫\\s*${escapedId}:\\s*)(.*)$`, "m");

  const match = content.match(ticketHeaderRegex);
  if (!match) {
    throw new Error(`Impossibile individuare la testata markdown per il ticket '${ticketId}'.`);
  }

  const prefix = match[1];
  const rawTitle = match[2];
  const cleanTitle = rawTitle.replace(STATUS_TAG_REGEX, "").trim();
  const newTag = COLUMN_TO_TAG[targetColumn];
  const replacementLine = `${prefix}${cleanTitle} ${newTag}`;

  const newContent = content.replace(ticketHeaderRegex, replacementLine);

  // Scrittura atomica POSIX durabile
  await atomicWriteFile(backlogPath, newContent);

  // Notifica sul bus aziendale per aggiornare tutti i client connessi via SSE
  if (eventBus) {
    eventBus.emit({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TICKET_STATUS_CHANGED",
      sourceAgent: "kanban_studio",
      level: "info",
      payload: {
        ticketId,
        previousColumn,
        newColumn: targetColumn,
      },
    });
  }

  return KanbanMoveResultSchema.parse({
    success: true,
    ticketId,
    previousColumn,
    newColumn: targetColumn,
    message: `Ticket ${ticketId} spostato da ${previousColumn} a ${targetColumn} con successo.`,
    updatedAt: new Date().toISOString(),
  });
}
