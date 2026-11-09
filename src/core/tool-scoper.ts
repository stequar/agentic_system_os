import {
  type ScopedToolDefinition,
  type ToolScopingResult,
  type ToolScopeLevel,
  ToolScopingResultSchema,
  ScopedToolDefinitionSchema,
} from "../contracts/tools.js";

/**
 * Catalogo canonico degli strumenti di Agentic Company OS categorizzati
 * tra Universal Core Tools (sempre disponibili) e State-Gated Action Tools.
 */
export const DEFAULT_OS_TOOLS: ScopedToolDefinition[] = [
  // 1. Universal Core Tools (Sempre attivi, footprint minimo)
  {
    name: "read_wiki_index",
    description: "Consulta il Master Index architetturale di docs/wiki/INDEX.md (Context as RAM)",
    inputSchema: { type: "object", properties: { section: { type: "string" } } },
    isCoreUniversal: true,
    allowedStates: [],
    allowedLevels: ["L1", "L2", "L3"],
    estimatedSchemaTokens: 250,
  },
  {
    name: "report_status",
    description: "Notifica avanzamento operativo, checkpoint e telemetria all'Event Bus aziendale",
    inputSchema: { type: "object", properties: { status: { type: "string" }, message: { type: "string" } } },
    isCoreUniversal: true,
    allowedStates: [],
    allowedLevels: ["L1", "L2", "L3"],
    estimatedSchemaTokens: 280,
  },
  {
    name: "query_audit",
    description: "Interroga il registro di audit immutabile .company-os/audit.jsonl",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
    isCoreUniversal: true,
    allowedStates: [],
    allowedLevels: ["L1", "L2"],
    estimatedSchemaTokens: 300,
  },

  // 2. State-Gated Action Tools: Fase SPECIFY & TECH_VALIDATION
  {
    name: "decompose_ticket",
    description: "Scompone un'epica o feature in ticket atomici per Leaf Developers",
    inputSchema: { type: "object", properties: { epicId: { type: "string" }, tickets: { type: "array" } }, required: ["epicId"] },
    isCoreUniversal: false,
    allowedStates: ["STANDUP", "SPECIFY", "TECH_VALIDATION", "DELEGATE"],
    allowedLevels: ["L1", "L2"],
    estimatedSchemaTokens: 420,
  },
  {
    name: "validate_contract",
    description: "Valida uno schema Zod o contratto API cross-domain",
    inputSchema: { type: "object", properties: { contractName: { type: "string" } }, required: ["contractName"] },
    isCoreUniversal: false,
    allowedStates: ["SPECIFY", "TECH_VALIDATION"],
    allowedLevels: ["L1", "L2"],
    estimatedSchemaTokens: 350,
  },

  // 3. State-Gated Action Tools: Fase IMPLEMENT (Leaf Devs & Lead)
  {
    name: "read_ast_slice",
    description: "Legge una slice chirurgica del file target tramite coordinate AST senza caricare l'intero file",
    inputSchema: { type: "object", properties: { filePath: { type: "string" }, lineStart: { type: "number" }, lineEnd: { type: "number" } }, required: ["filePath"] },
    isCoreUniversal: false,
    allowedStates: ["IMPLEMENT", "GATEKEEPER", "CODE_REVIEW"],
    allowedLevels: ["L2", "L3"],
    estimatedSchemaTokens: 380,
  },
  {
    name: "apply_atomic_patch",
    description: "Applica una patch POSIX Write-Sync-Rename validata preventivamente da AST Diff Guard",
    inputSchema: { type: "object", properties: { filePath: { type: "string" }, replacement: { type: "string" } }, required: ["filePath"] },
    isCoreUniversal: false,
    allowedStates: ["IMPLEMENT"],
    allowedLevels: ["L2", "L3"],
    estimatedSchemaTokens: 450,
  },
  {
    name: "run_target_test",
    description: "Esegue selettivamente la suite di test associata al file target modificato (Test Impact Analysis)",
    inputSchema: { type: "object", properties: { testFile: { type: "string" } }, required: ["testFile"] },
    isCoreUniversal: false,
    allowedStates: ["IMPLEMENT", "GATEKEEPER"],
    allowedLevels: ["L2", "L3"],
    estimatedSchemaTokens: 340,
  },

  // 4. State-Gated Action Tools: Fase GATEKEEPER & QUALITY
  {
    name: "run_gatekeeper",
    description: "Esegue il Deterministic Gatekeeper completo (typecheck, linter, full tests suite)",
    inputSchema: { type: "object", properties: { targetPath: { type: "string" }, testCommands: { type: "array" } } },
    isCoreUniversal: false,
    allowedStates: ["GATEKEEPER", "CODE_REVIEW"],
    allowedLevels: ["L1", "L2", "L3"],
    estimatedSchemaTokens: 410,
  },
  {
    name: "quarantine_test",
    description: "Isola un test intermittente (flaky) in quarantena verificando l'alternanza PASS/FAIL su N=3 prove",
    inputSchema: { type: "object", properties: { testName: { type: "string" } }, required: ["testName"] },
    isCoreUniversal: false,
    allowedStates: ["GATEKEEPER"],
    allowedLevels: ["L2"],
    estimatedSchemaTokens: 390,
  },

  // 5. State-Gated Action Tools: Fase CODE_REVIEW & RELEASE
  {
    name: "generate_scorecard",
    description: "Genera la Scorecard crittografica del Deterministic Gatekeeper per la Pull Request",
    inputSchema: { type: "object", properties: { branchName: { type: "string" } }, required: ["branchName"] },
    isCoreUniversal: false,
    allowedStates: ["CODE_REVIEW"],
    allowedLevels: ["L1", "L2"],
    estimatedSchemaTokens: 400,
  },
  {
    name: "approve_pr",
    description: "Approva la Pull Request e autorizza il merge una volta accertata la conformità del Gatekeeper",
    inputSchema: { type: "object", properties: { prNumber: { type: "number" } }, required: ["prNumber"] },
    isCoreUniversal: false,
    allowedStates: ["CODE_REVIEW", "MERGE_RELEASE"],
    allowedLevels: ["L1", "L2"],
    estimatedSchemaTokens: 360,
  },
];

export class ToolScoper {
  private toolRegistry: Map<string, ScopedToolDefinition> = new Map();

  constructor(initialTools: ScopedToolDefinition[] = DEFAULT_OS_TOOLS) {
    for (const tool of initialTools) {
      const validated = ScopedToolDefinitionSchema.parse(tool);
      this.toolRegistry.set(validated.name, validated);
    }
  }

  /**
   * Registra uno strumento personalizzato nel registry aziendale.
   */
  registerTool(tool: ScopedToolDefinition): void {
    const validated = ScopedToolDefinitionSchema.parse(tool);
    this.toolRegistry.set(validated.name, validated);
  }

  /**
   * Restituisce tutti gli strumenti censiti.
   */
  getAllTools(): ScopedToolDefinition[] {
    return Array.from(this.toolRegistry.values());
  }

  /**
   * Filtra gli strumenti ammessi per l'esecuzione in base allo stato della FSM e al livello dell'agente.
   */
  filterTools(
    fsmState: string,
    level: ToolScopeLevel,
    tools: ScopedToolDefinition[] = this.getAllTools()
  ): ScopedToolDefinition[] {
    return tools.filter((tool) => {
      // 1. Controllo di livello gerarchico (L1, L2, L3)
      if (!tool.allowedLevels.includes(level)) {
        return false;
      }

      // 2. Gli Universal Core Tools sono sempre abilitati se il livello lo consente
      if (tool.isCoreUniversal) {
        return true;
      }

      // 3. Gli Action Tools sono abilitati solo se lo stato FSM è consentito
      return tool.allowedStates.includes(fsmState);
    });
  }

  /**
   * Esegue il Dynamic Tool Scoping deterministico calcolando strumenti attivi,
   * strumenti prunati e stima dei token risparmiati.
   */
  scopeTools(fsmState: string, level: ToolScopeLevel): ToolScopingResult {
    const all = this.getAllTools();
    const active = this.filterTools(fsmState, level, all);
    const activeNames = new Set(active.map((t) => t.name));

    const pruned = all.filter((t) => !activeNames.has(t.name));
    const prunedNames = pruned.map((t) => t.name);

    // Stima dei token risparmiati rimuovendo gli schemi prunati dal context prompt
    const tokensSavedEstimate = pruned.reduce((acc, t) => acc + (t.estimatedSchemaTokens || 350), 0);

    return ToolScopingResultSchema.parse({
      activeTools: Array.from(activeNames),
      prunedTools: prunedNames,
      totalToolsCount: all.length,
      activeToolsCount: active.length,
      tokensSavedEstimate,
      fsmState,
      level,
    });
  }
}
