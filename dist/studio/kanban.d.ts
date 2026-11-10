import { type KanbanBoard, type KanbanColumn, type KanbanMoveResult } from "../contracts/studio.js";
import type { CompanyEventBus } from "../core/event-bus.js";
/**
 * Esegue il parsing di backlog.md estraendo i ticket e popolando una KanbanBoard tipizzata.
 */
export declare function parseBacklogToKanban(backlogContent: string): KanbanBoard;
/**
 * Sposta deterministicamente un ticket in una colonna target aggiornando atomicamente backlog.md.
 */
export declare function moveTicketInBacklog(backlogPath: string, ticketId: string, targetColumn: KanbanColumn, eventBus?: CompanyEventBus): Promise<KanbanMoveResult>;
//# sourceMappingURL=kanban.d.ts.map