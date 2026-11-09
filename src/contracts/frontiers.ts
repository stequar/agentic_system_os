import { z } from "zod";

/**
 * 🛠️ 1. Dynamic JIT MCP Synthesis Schema
 * Rappresenta un tool o adapter MCP sintetizzato al volo da un agente R&D / AI Lead
 * per colmare una carenza di capability senza intervento umano.
 */
export const DynamicMcpToolSchema = z.object({
  toolId: z.string().describe("Identificativo univoco del tool (es. tool_dyn_clickhouse_query)"),
  name: z.string().min(3),
  description: z.string().min(10),
  generatedByRole: z.string().default("ai_lead"),
  sandboxType: z.enum(["NODE_WORKER", "WASM_SANDBOX", "IN_PROCESS_RESTRICTED"]),
  permissions: z.array(z.string()).default([]).describe("Capacità esplicite concesse (es. read:network, fs:read)"),
  inputSchemaJson: z.string().describe("Stringa JSON Schema validante gli input del tool"),
  ttlSeconds: z.number().int().positive().default(3600).describe("Time-to-live del tool effimero prima della revoca o promozione"),
  status: z.enum(["SYNTHESIZED", "TEST_PASSED", "HOT_LOADED", "PROMOTED_PERMANENT", "QUARANTINED", "EXPIRED"]),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type DynamicMcpTool = z.infer<typeof DynamicMcpToolSchema>;

/**
 * 📐 2. Neuro-Symbolic AST Invariant Proof Schema
 * Risultato della verifica formale di correttezza AST condotta tramite solver logico (SMT/SAT).
 */
export const NeuroSymbolicProofSchema = z.object({
  proofId: z.string().describe("ID della prova formale (es. PROOF-AST-2026-001)"),
  targetFilePath: z.string().describe("File target sottoposto a verifica formale"),
  targetSymbol: z.string().describe("Funzione, classe o contratto verificato"),
  solverBackend: z.enum(["Z3_SMT", "CVC5", "AST_TREE_SITTER_SAT", "BUILTIN_PROVER"]),
  invariantsChecked: z.array(z.string()).min(1).describe("Invarianti logiche verificate (es. memory_bounds, non_null, pre_post)"),
  status: z.enum(["FORMALLY_PROVED", "COUNTEREXAMPLE_FOUND", "SOLVER_TIMEOUT", "UNSATISFIABLE"]),
  counterexampleTrace: z.object({
    inputState: z.record(z.any()).optional(),
    failingPath: z.array(z.string()).optional(),
    reproducibleFixtureCode: z.string().optional(),
  }).optional().describe("Traccia di controesempio generata per il self-healing deterministico"),
  executionTimeMs: z.number().nonnegative(),
  verifiedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type NeuroSymbolicProof = z.infer<typeof NeuroSymbolicProofSchema>;

/**
 * ⚡ 3. On-Device SLM Distillation Trace Schema
 * Tracciamento della distillazione di traiettorie ad alto rendimento (FPY=100%)
 * dai modelli cloud di frontiera verso Small Language Models locali a costo zero.
 */
export const SlmDistillationTraceSchema = z.object({
  traceId: z.string().describe("ID del trace di addestramento/distillazione (es. DISTILL-SLM-001)"),
  sourceTeacherModel: z.string().describe("Modello maestro cloud (es. claude-3-7-sonnet, gpt-4.5)"),
  targetStudentModel: z.string().describe("Modello allievo locale (es. llama-3.2-1b-q4, qwen-2.5-coder-1.5b)"),
  specializedDomain: z.enum(["AST_REFACTOR", "DOCSTRING_GEN", "SYNTHETIC_FIXTURES", "CAVEMAN_ENCODING", "FAST_TRIAGE"]),
  datasetSampleCount: z.number().int().positive(),
  fpyVerificationRate: z.number().min(0).max(100).describe("Tasso di First-Pass Yield del set distillato"),
  quantizationFormat: z.enum(["GGUF_Q4_K_M", "GGUF_Q8_0", "ONNX_INT8", "MLX_4BIT"]),
  averageInferenceLatencyMs: z.number().positive(),
  cloudCostSavingsPercentage: z.number().min(0).max(100),
  distilledAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type SlmDistillationTrace = z.infer<typeof SlmDistillationTraceSchema>;

/**
 * 🐒 4. Chaos Fault Injection & Antifragile Resilience Schema
 * Rappresenta un'iniezione di guasto sintetico deliberata per stress-testare la War Room e il Self-Healing.
 */
export const ChaosFaultInjectionSchema = z.object({
  faultId: z.string().describe("ID dell'esperimento di caos (es. CHAOS-2026-FAULT-07)"),
  faultType: z.enum([
    "AST_MUTATION_OFF_BY_ONE",
    "RACE_CONDITION_ASYNC_QUEUE",
    "ADVERSARIAL_PROMPT_INJECTION",
    "DISK_WAL_PARTIAL_CORRUPT",
    "NETWORK_LATENCY_SPIKE",
    "CIRCULAR_DEPENDENCY_DEADLOCK",
  ]),
  targetSubsystem: z.string().describe("Modulo dell'OS bersagliato (es. gatekeeper, session-store, worktrees)"),
  detectionTimeMs: z.number().nonnegative().describe("Tempo impiegato dal sistema per rilevare l'anomalia"),
  recoveryTimeMs: z.number().nonnegative().describe("Tempo impiegato per il ripristino o rollback atomico"),
  containmentSuccess: z.boolean().describe("Indica se il guasto è stato confinato senza corrompere main"),
  resilienceScore: z.number().min(0).max(100).describe("Punteggio di antifragilità calcolato (0-100)"),
  warRoomActivated: z.boolean(),
  injectedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type ChaosFaultInjection = z.infer<typeof ChaosFaultInjectionSchema>;

/**
 * 🗺️ 5. Creative Horizon Scanning Dossier Schema
 * Schema aggregato che valida l'intero dossier R&D di horizon scanning per la roadmap 2026+.
 */
export const CreativeHorizonDossierSchema = z.object({
  version: z.string().default("2026.1.0"),
  authorRole: z.string().default("rnd_lead"),
  visionTheme: z.string().min(20),
  strategicPillars: z.array(z.object({
    id: z.string(),
    title: z.string().min(5),
    objective: z.string().min(10),
    breakthroughInnovation: z.string().min(10),
    targetSprint: z.string(),
    estimatedImpact: z.string().min(10),
  })).min(3),
  proposedPhase: z.object({
    phaseNumber: z.number().int().min(6),
    phaseName: z.string().min(5),
    tagline: z.string().min(10),
    sprints: z.array(z.object({
      sprintNumber: z.number().int(),
      title: z.string().min(5),
      focusArea: z.string().min(5),
      coreTickets: z.array(z.string()).min(2),
    })).min(3),
  }),
  sampleArtifacts: z.object({
    dynamicTool: DynamicMcpToolSchema.optional(),
    formalProof: NeuroSymbolicProofSchema.optional(),
    slmTrace: SlmDistillationTraceSchema.optional(),
    chaosExperiment: ChaosFaultInjectionSchema.optional(),
  }).optional(),
  evaluatedAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type CreativeHorizonDossier = z.infer<typeof CreativeHorizonDossierSchema>;
