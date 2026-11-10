import { z } from "zod";
export declare const StudioConfigSchema: z.ZodObject<{
    port: z.ZodDefault<z.ZodNumber>;
    host: z.ZodDefault<z.ZodString>;
    token: z.ZodString;
    targetPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    targetPath: string;
    port: number;
    host: string;
    token: string;
}, {
    targetPath: string;
    token: string;
    port?: number | undefined;
    host?: string | undefined;
}>;
export type StudioConfig = z.infer<typeof StudioConfigSchema>;
export declare const StudioCommandSchema: z.ZodObject<{
    action: z.ZodEnum<["pause", "resume", "hint", "abort"]>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "pause" | "resume" | "hint" | "abort";
    message?: string | undefined;
}, {
    action: "pause" | "resume" | "hint" | "abort";
    message?: string | undefined;
}>;
export type StudioCommand = z.infer<typeof StudioCommandSchema>;
export declare const StudioStatusResponseSchema: z.ZodObject<{
    status: z.ZodEnum<["RUNNING", "PAUSE_REQUESTED", "SAFE_PAUSED", "ABORTED"]>;
    activeTickets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    connectedClients: z.ZodNumber;
    targetPath: z.ZodString;
    uptimeSeconds: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "RUNNING" | "PAUSE_REQUESTED" | "SAFE_PAUSED" | "ABORTED";
    targetPath: string;
    activeTickets: string[];
    connectedClients: number;
    uptimeSeconds: number;
}, {
    status: "RUNNING" | "PAUSE_REQUESTED" | "SAFE_PAUSED" | "ABORTED";
    targetPath: string;
    connectedClients: number;
    uptimeSeconds: number;
    activeTickets?: string[] | undefined;
}>;
export type StudioStatusResponse = z.infer<typeof StudioStatusResponseSchema>;
/**
 * Colonne standard della Kanban Board nello Studio
 */
export declare const KanbanColumnSchema: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
export type KanbanColumn = z.infer<typeof KanbanColumnSchema>;
/**
 * Singolo ticket rappresentato nella Kanban Board
 */
export declare const KanbanTicketSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
    epic: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    title: string;
    id: string;
    epic?: string | undefined;
    assignedTo?: string | undefined;
}, {
    status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    title: string;
    id: string;
    epic?: string | undefined;
    assignedTo?: string | undefined;
}>;
export type KanbanTicket = z.infer<typeof KanbanTicketSchema>;
/**
 * Rappresentazione completa della Kanban Board
 */
export declare const KanbanBoardSchema: z.ZodObject<{
    tickets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
        epic: z.ZodOptional<z.ZodString>;
        assignedTo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
        title: string;
        id: string;
        epic?: string | undefined;
        assignedTo?: string | undefined;
    }, {
        status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
        title: string;
        id: string;
        epic?: string | undefined;
        assignedTo?: string | undefined;
    }>, "many">>;
    columns: z.ZodDefault<z.ZodArray<z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>, "many">>;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    tickets: {
        status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
        title: string;
        id: string;
        epic?: string | undefined;
        assignedTo?: string | undefined;
    }[];
    columns: ("BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE")[];
}, {
    updatedAt?: string | undefined;
    tickets?: {
        status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
        title: string;
        id: string;
        epic?: string | undefined;
        assignedTo?: string | undefined;
    }[] | undefined;
    columns?: ("BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE")[] | undefined;
}>;
export type KanbanBoard = z.infer<typeof KanbanBoardSchema>;
/**
 * Richiesta di spostamento drag-and-drop di un ticket
 */
export declare const KanbanMoveRequestSchema: z.ZodObject<{
    ticketId: z.ZodString;
    targetColumn: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
}, "strip", z.ZodTypeAny, {
    ticketId: string;
    targetColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}, {
    ticketId: string;
    targetColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}>;
export type KanbanMoveRequest = z.infer<typeof KanbanMoveRequestSchema>;
/**
 * Risultato dello spostamento atomico del ticket
 */
export declare const KanbanMoveResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    ticketId: z.ZodString;
    previousColumn: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
    newColumn: z.ZodEnum<["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]>;
    message: z.ZodString;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    updatedAt: string;
    success: boolean;
    ticketId: string;
    previousColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    newColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}, {
    message: string;
    success: boolean;
    ticketId: string;
    previousColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    newColumn: "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    updatedAt?: string | undefined;
}>;
export type KanbanMoveResult = z.infer<typeof KanbanMoveResultSchema>;
/**
 * Categoria del nodo di traiettoria decisionale
 */
export declare const TrajectoryNodeCategorySchema: z.ZodEnum<["FSM_TRANSITION", "TOOL_EXECUTION", "QUALITY_GATE", "SELF_HEALING", "STEERING_ACTION", "FINOPS_ALERT", "SYSTEM_EVENT"]>;
export type TrajectoryNodeCategory = z.infer<typeof TrajectoryNodeCategorySchema>;
/**
 * Singolo nodo della traiettoria decisionale estratto da audit.jsonl
 */
export declare const TrajectoryNodeSchema: z.ZodObject<{
    id: z.ZodString;
    sequenceNumber: z.ZodNumber;
    category: z.ZodEnum<["FSM_TRANSITION", "TOOL_EXECUTION", "QUALITY_GATE", "SELF_HEALING", "STEERING_ACTION", "FINOPS_ALERT", "SYSTEM_EVENT"]>;
    sourceAgent: z.ZodString;
    type: z.ZodString;
    summary: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodOptional<z.ZodAny>;
    merkleHash: z.ZodOptional<z.ZodString>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    sourceAgent: string;
    timestamp: string;
    id: string;
    summary: string;
    category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
    sequenceNumber: number;
    payload?: any;
    merkleHash?: string | undefined;
    signature?: string | undefined;
}, {
    type: string;
    sourceAgent: string;
    timestamp: string;
    id: string;
    summary: string;
    category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
    sequenceNumber: number;
    payload?: any;
    merkleHash?: string | undefined;
    signature?: string | undefined;
}>;
export type TrajectoryNode = z.infer<typeof TrajectoryNodeSchema>;
/**
 * Risposta paginata della timeline Breadcrumb Trajectory
 */
export declare const TrajectoryResponseSchema: z.ZodObject<{
    nodes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sequenceNumber: z.ZodNumber;
        category: z.ZodEnum<["FSM_TRANSITION", "TOOL_EXECUTION", "QUALITY_GATE", "SELF_HEALING", "STEERING_ACTION", "FINOPS_ALERT", "SYSTEM_EVENT"]>;
        sourceAgent: z.ZodString;
        type: z.ZodString;
        summary: z.ZodString;
        timestamp: z.ZodString;
        payload: z.ZodOptional<z.ZodAny>;
        merkleHash: z.ZodOptional<z.ZodString>;
        signature: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        summary: string;
        category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
        sequenceNumber: number;
        payload?: any;
        merkleHash?: string | undefined;
        signature?: string | undefined;
    }, {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        summary: string;
        category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
        sequenceNumber: number;
        payload?: any;
        merkleHash?: string | undefined;
        signature?: string | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
    hasMore: z.ZodBoolean;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    nodes: {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        summary: string;
        category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
        sequenceNumber: number;
        payload?: any;
        merkleHash?: string | undefined;
        signature?: string | undefined;
    }[];
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}, {
    nodes: {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        summary: string;
        category: "FINOPS_ALERT" | "SELF_HEALING" | "FSM_TRANSITION" | "TOOL_EXECUTION" | "QUALITY_GATE" | "STEERING_ACTION" | "SYSTEM_EVENT";
        sequenceNumber: number;
        payload?: any;
        merkleHash?: string | undefined;
        signature?: string | undefined;
    }[];
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    updatedAt?: string | undefined;
}>;
export type TrajectoryResponse = z.infer<typeof TrajectoryResponseSchema>;
/**
 * Risposta riassuntiva delle Cerimonie Agili per lo Studio
 */
export declare const CeremoniesResponseSchema: z.ZodObject<{
    ceremonies: z.ZodArray<z.ZodAny, "many">;
    retrospectives: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
    totalCount: z.ZodNumber;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    totalCount: number;
    ceremonies: any[];
    retrospectives: any[];
}, {
    totalCount: number;
    ceremonies: any[];
    updatedAt?: string | undefined;
    retrospectives?: any[] | undefined;
}>;
export type CeremoniesResponse = z.infer<typeof CeremoniesResponseSchema>;
/**
 * Risposta stato Live War Room
 */
export declare const WarRoomStatusResponseSchema: z.ZodObject<{
    isWriteLocked: z.ZodBoolean;
    activeIncidents: z.ZodArray<z.ZodAny, "many">;
    pastIncidents: z.ZodArray<z.ZodAny, "many">;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    isWriteLocked: boolean;
    activeIncidents: any[];
    pastIncidents: any[];
}, {
    isWriteLocked: boolean;
    activeIncidents: any[];
    pastIncidents: any[];
    updatedAt?: string | undefined;
}>;
export type WarRoomStatusResponse = z.infer<typeof WarRoomStatusResponseSchema>;
export declare const WarRoomResolveRequestSchema: z.ZodObject<{
    incidentId: z.ZodString;
    resolutionNotes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    incidentId: string;
    resolutionNotes: string;
}, {
    incidentId: string;
    resolutionNotes: string;
}>;
export type WarRoomResolveRequest = z.infer<typeof WarRoomResolveRequestSchema>;
/**
 * Telemetria Fluff & Caveman Mode
 */
export declare const FluffTelemetryReportSchema: z.ZodObject<{
    totalMessagesIntercepted: z.ZodNumber;
    originalTokens: z.ZodNumber;
    compressedTokens: z.ZodNumber;
    fluffTokensEliminated: z.ZodNumber;
    fluffReductionPercentage: z.ZodNumber;
    estimatedDollarsSavedUsd: z.ZodNumber;
    updatedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    updatedAt: string;
    totalMessagesIntercepted: number;
    originalTokens: number;
    compressedTokens: number;
    fluffTokensEliminated: number;
    fluffReductionPercentage: number;
    estimatedDollarsSavedUsd: number;
}, {
    totalMessagesIntercepted: number;
    originalTokens: number;
    compressedTokens: number;
    fluffTokensEliminated: number;
    fluffReductionPercentage: number;
    estimatedDollarsSavedUsd: number;
    updatedAt?: string | undefined;
}>;
export type FluffTelemetryReport = z.infer<typeof FluffTelemetryReportSchema>;
//# sourceMappingURL=studio.d.ts.map