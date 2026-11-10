import { type ScopedToolDefinition, type ToolScopingResult, type ToolScopeLevel } from "../contracts/tools.js";
/**
 * Catalogo canonico degli strumenti di Agentic Company OS categorizzati
 * tra Universal Core Tools (sempre disponibili) e State-Gated Action Tools.
 */
export declare const DEFAULT_OS_TOOLS: ScopedToolDefinition[];
export declare class ToolScoper {
    private toolRegistry;
    constructor(initialTools?: ScopedToolDefinition[]);
    /**
     * Registra uno strumento personalizzato nel registry aziendale.
     */
    registerTool(tool: ScopedToolDefinition): void;
    /**
     * Restituisce tutti gli strumenti censiti.
     */
    getAllTools(): ScopedToolDefinition[];
    /**
     * Filtra gli strumenti ammessi per l'esecuzione in base allo stato della FSM e al livello dell'agente.
     */
    filterTools(fsmState: string, level: ToolScopeLevel, tools?: ScopedToolDefinition[]): ScopedToolDefinition[];
    /**
     * Esegue il Dynamic Tool Scoping deterministico calcolando strumenti attivi,
     * strumenti prunati e stima dei token risparmiati.
     */
    scopeTools(fsmState: string, level: ToolScopeLevel): ToolScopingResult;
}
//# sourceMappingURL=tool-scoper.d.ts.map