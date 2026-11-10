import { z } from "zod";
export const StudioConfigSchema = z.object({
    port: z.number().int().positive().default(4321),
    host: z.string().default("127.0.0.1"),
    token: z.string().min(16),
    targetPath: z.string(),
});
export const StudioCommandSchema = z.object({
    action: z.enum(["pause", "resume", "hint", "abort"]),
    message: z.string().optional(),
});
export const StudioStatusResponseSchema = z.object({
    status: z.enum(["RUNNING", "PAUSE_REQUESTED", "SAFE_PAUSED", "ABORTED"]),
    activeTickets: z.array(z.string()).default([]),
    connectedClients: z.number().int().nonnegative(),
    targetPath: z.string(),
    uptimeSeconds: z.number().nonnegative(),
});
/**
 * Colonne standard della Kanban Board nello Studio
 */
export const KanbanColumnSchema = z.enum([
    "BACKLOG",
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "DONE",
]);
/**
 * Singolo ticket rappresentato nella Kanban Board
 */
export const KanbanTicketSchema = z.object({
    id: z.string().describe("Identificativo del ticket (es. TCK-9.3)"),
    title: z.string().describe("Titolo sintetico del ticket"),
    status: KanbanColumnSchema.describe("Colonna corrente"),
    epic: z.string().optional().describe("Epica di appartenenza"),
    assignedTo: z.string().optional().describe("Ruolo o agente assegnatario"),
});
/**
 * Rappresentazione completa della Kanban Board
 */
export const KanbanBoardSchema = z.object({
    tickets: z.array(KanbanTicketSchema).default([]),
    columns: z.array(KanbanColumnSchema).default(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Richiesta di spostamento drag-and-drop di un ticket
 */
export const KanbanMoveRequestSchema = z.object({
    ticketId: z.string(),
    targetColumn: KanbanColumnSchema,
});
/**
 * Risultato dello spostamento atomico del ticket
 */
export const KanbanMoveResultSchema = z.object({
    success: z.boolean(),
    ticketId: z.string(),
    previousColumn: KanbanColumnSchema,
    newColumn: KanbanColumnSchema,
    message: z.string(),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Categoria del nodo di traiettoria decisionale
 */
export const TrajectoryNodeCategorySchema = z.enum([
    "FSM_TRANSITION",
    "TOOL_EXECUTION",
    "QUALITY_GATE",
    "SELF_HEALING",
    "STEERING_ACTION",
    "FINOPS_ALERT",
    "SYSTEM_EVENT",
]);
/**
 * Singolo nodo della traiettoria decisionale estratto da audit.jsonl
 */
export const TrajectoryNodeSchema = z.object({
    id: z.string(),
    sequenceNumber: z.number().int().nonnegative(),
    category: TrajectoryNodeCategorySchema,
    sourceAgent: z.string(),
    type: z.string(),
    summary: z.string(),
    timestamp: z.string().datetime(),
    payload: z.any().optional(),
    merkleHash: z.string().optional(),
    signature: z.string().optional(),
});
/**
 * Risposta paginata della timeline Breadcrumb Trajectory
 */
export const TrajectoryResponseSchema = z.object({
    nodes: z.array(TrajectoryNodeSchema),
    totalCount: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Risposta riassuntiva delle Cerimonie Agili per lo Studio
 */
export const CeremoniesResponseSchema = z.object({
    ceremonies: z.array(z.any()),
    retrospectives: z.array(z.any()).default([]),
    totalCount: z.number().int().nonnegative(),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
/**
 * Risposta stato Live War Room
 */
export const WarRoomStatusResponseSchema = z.object({
    isWriteLocked: z.boolean(),
    activeIncidents: z.array(z.any()),
    pastIncidents: z.array(z.any()),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export const WarRoomResolveRequestSchema = z.object({
    incidentId: z.string(),
    resolutionNotes: z.string().min(5),
});
/**
 * Telemetria Fluff & Caveman Mode
 */
export const FluffTelemetryReportSchema = z.object({
    totalMessagesIntercepted: z.number().int().nonnegative(),
    originalTokens: z.number().int().nonnegative(),
    compressedTokens: z.number().int().nonnegative(),
    fluffTokensEliminated: z.number().int().nonnegative(),
    fluffReductionPercentage: z.number().min(0).max(100),
    estimatedDollarsSavedUsd: z.number().nonnegative(),
    updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
//# sourceMappingURL=studio.js.map