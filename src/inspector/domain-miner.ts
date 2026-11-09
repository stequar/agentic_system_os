import fs from "node:fs/promises";
import path from "node:path";
import {
  SynthesizedSpecialistSchema,
  TriRingOrgChartSchema,
  type SynthesizedSpecialist,
  type TriRingOrgChart,
} from "../contracts/brownfield.js";
import type { ProjectStack } from "../contracts/inspector.js";
import {
  detectProjectStack,
  resolveHermeticTestCommands,
} from "./detector.js";

export interface DomainMinerOptions {
  ignoreExistingAgentsMd?: boolean;
  maxDomainExperts?: number;
}

interface RepoFileEntry {
  relativePath: string;
  content: string;
}

const IGNORED_SCAN_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".build",
  ".next",
  "build",
  "out",
  "venv",
  ".venv",
  "__pycache__",
  ".pytest_cache",
  ".company-os",
  "dataset_raw",
]);

async function collectRepoTextFiles(
  targetPath: string,
  maxDepth = 4
): Promise<RepoFileEntry[]> {
  const resolvedRoot = path.resolve(targetPath);
  const results: RepoFileEntry[] = [];

  async function walk(currentDir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".agents") continue;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_SCAN_DIRS.has(entry.name)) continue;
        await walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        if (entry.name.endsWith(".bak")) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (
          [".py", ".swift", ".ts", ".tsx", ".js", ".sql", ".md", ".json", ".toml", ".txt", ".yml", ".yaml"].includes(
            ext
          )
        ) {
          try {
            const stat = await fs.stat(fullPath);
            if (stat.size <= 256 * 1024) {
              const content = await fs.readFile(fullPath, "utf-8");
              const relativePath = path
                .relative(resolvedRoot, fullPath)
                .split(path.sep)
                .join("/");
              results.push({ relativePath, content });
            }
          } catch {
            // Ignora file illeggibili
          }
        }
      }
    }
  }

  await walk(resolvedRoot, 0);
  return results;
}

interface SemanticDomainClusterRule {
  id: string;
  title: string;
  boundedContext: string;
  keywords: string[];
  regexTriggers: RegExp[];
  invariants: string[];
  microRoleCard: string;
  selfHostingCluster?: boolean;
}

const SEMANTIC_DOMAIN_CLUSTERS: SemanticDomainClusterRule[] = [
  {
    id: "medical_rehab_specialist",
    title: "Medical, Biomechanics & Rehab Specialist",
    boundedContext: "Biomechanical Rehab & Injury Prevention",
    keywords: [
      "rehab",
      "prehab",
      "injury",
      "infortuni",
      "medicalcircuitbreaker",
      "circuit_breaker",
      "biomeccanica",
      "joint",
      "pain",
    ],
    regexTriggers: [
      /\bMedicalCircuitBreaker\b/i,
      /\brehab_protocols\b/i,
      /\binjury\b/i,
      /\bcircuit_breaker\b/i,
    ],
    invariants: [
      "Zero esercizi ad alto carico articolare su distretti corporei segnalati come infortunati (MedicalCircuitBreaker attivo).",
      "Ogni sostituzione d'esercizio per infortunio deve rispettare i protocolli biomeccanici in docs/wiki/science/rehab_protocols.md.",
    ],
    microRoleCard:
      "[RING-2: medical_rehab_specialist] Custode della sicurezza biomeccanica e del MedicalCircuitBreaker. Vieta esercizi incompatibili con infortuni attivi e impone protocolli Rehab/Prehab.",
  },
  {
    id: "nutrition_metabolic_specialist",
    title: "Clinical & Therapeutic Nutrition Specialist",
    boundedContext: "Clinical Nutrition, TDEE & Anti-Inflammatory Recovery",
    keywords: [
      "nutrition",
      "nutrizione",
      "tdee",
      "macro",
      "protein",
      "proteico",
      "collagen",
      "therapeutic_nutrition",
      "weight_kg",
    ],
    regexTriggers: [
      /\bnutrition_protocols\b/i,
      /\btherapeutic_nutrition\b/i,
      /\bTDEE\b/,
      /\bepic2_nutrition_spec\b/i,
    ],
    invariants: [
      "Il calcolo TDEE e dei macronutrienti deve adattarsi dinamicamente al carico del workout giornaliero e allo stato di infortunio.",
      "Preservare il target proteico anti-catabolico durante le fasi di Recovery Mode documentate in docs/wiki/science/nutrition_protocols.md.",
    ],
    microRoleCard:
      "[RING-2: nutrition_metabolic_specialist] Esperto di nutrizione clinica, TDEE dinamico e Nutrient Timing per il recupero muscolare e tendineo.",
  },
  {
    id: "ai_coaching_specialist",
    title: "Adaptive AI Coaching & Workout Recommendation Specialist",
    boundedContext: "Adaptive AI Workout Generation & Intra-Workout RPE",
    keywords: [
      "workoutgenerator",
      "decision_engine",
      "recommendation_algorithm",
      "rpe",
      "bandit",
      "workout",
      "coaching",
      "epic3_training_ai_spec",
    ],
    regexTriggers: [
      /\bWorkoutGenerator\b/i,
      /\bdecision_engine\b/i,
      /\brecommendation_algorithm\b/i,
      /\bRPE\b/,
    ],
    invariants: [
      "Il motore AI (WorkoutGenerator / decision_engine.py) deve sempre invocare il filtro infortuni prima di restituire qualsiasi piano di allenamento.",
      "Il micro-adattamento intra-workout deve fornire regressioni deterministiche basate sul feedback RPE dell'utente.",
    ],
    microRoleCard:
      "[RING-2: ai_coaching_specialist] Architetto del motore adattivo di allenamento (Decision Trees + RL) e calibrazione RPE intra/post-workout.",
  },
  {
    id: "fintech_ledger_specialist",
    title: "Fintech Ledger & Payment Domain Specialist",
    boundedContext: "Double-Entry Accounting, Billing & Payment Settlement",
    keywords: ["ledger", "invoice", "payment", "settlement", "idempotency_key", "currency"],
    regexTriggers: [/\bledger\b/i, /\bpayment_intent\b/i, /\bdouble_entry\b/i],
    invariants: [
      "Ogni transazione finanziaria deve garantire idempotenza tramite chiave univoca e quadratura a partita doppia.",
    ],
    microRoleCard:
      "[RING-2: fintech_ledger_specialist] Garante dell'integrità contabile, idempotenza dei pagamenti e precisione decimale.",
  },
  {
    id: "commerce_fulfillment_specialist",
    title: "E-Commerce Catalog & Order Fulfillment Specialist",
    boundedContext: "Inventory Reservation, Cart & Order Lifecycle",
    keywords: ["checkout", "inventory", "order_fulfillment", "sku", "cart_item"],
    regexTriggers: [/\border_fulfillment\b/i, /\binventory_reservation\b/i],
    invariants: [
      "Nessun ordine può essere confermato senza prenotazione atomica dello stock disponibile.",
    ],
    microRoleCard:
      "[RING-2: commerce_fulfillment_specialist] Custode del ciclo d'ordine, allocazione stock e coerenza del catalogo.",
  },
  {
    id: "governance_workflow_specialist",
    title: "Multi-Agent Governance, Ceremonies & Consensus Specialist",
    boundedContext: "Agile Ceremonies, Anti-Echo-Chamber Consensus & Cognitive Forcing Functions",
    keywords: [
      "ceremony-dispatcher",
      "consensus-engine",
      "state-machine",
      "workflow-eval",
      "ceremonies",
      "governance",
    ],
    regexTriggers: [
      /\bCeremonyDispatcher\b/,
      /\bConsensusEngine\b/,
      /\benforceCognitiveForcingGate\b/,
    ],
    invariants: [
      "Ogni anomalia o bug deve superare il Cognitive Forcing Gate (MODE_2_INVESTIGATE_RCA -> MODE_3_RND_ROUNDTABLE) con approvazione CEO prima di entrare in MODE_4_BUILD_GATEKEEPER.",
      "Tutte le cerimonie agili devono convocare dinamicamente gli esperti Ring-1 e Ring-2 tramite resolveDomainAttendeesForScope.",
    ],
    microRoleCard:
      "[RING-2: governance_workflow_specialist] Custode della macchina a stati CTO, delle Cognitive Forcing Functions, di CeremonyDispatcher e del ConsensusEngine.",
    selfHostingCluster: true,
  },
  {
    id: "ast_gatekeeper_specialist",
    title: "Deterministic AST Gatekeeper, Self-Healing & Sandbox Security Specialist",
    boundedContext: "AST Diff Guard, Self-Healing Loop, Incident War Room & Worker Sandbox",
    keywords: [
      "ast-guard",
      "self-healing",
      "war-room",
      "sandbox-runner",
      "gatekeeper",
      "quarantine",
    ],
    regexTriggers: [
      /\bvalidatePatch\b/,
      /\bIncidentWarRoom\b/,
      /\bDynamicToolAstGuard\b/,
    ],
    invariants: [
      "L'AST Diff Guard deve bloccare qualsiasi rimozione di test o asserzioni (Test Preservation Invariant) e modifiche fuori scope.",
      "Ogni fallimento 3/3 del loop di Self-Healing deve attivare l'Incident War Room con rollback atomico SHA-256.",
    ],
    microRoleCard:
      "[RING-2: ast_gatekeeper_specialist] Garante del Deterministic Gatekeeper, dell'AST Diff Guard, dell'Incident War Room e della sicurezza delle sandbox Worker.",
    selfHostingCluster: true,
  },
  {
    id: "context_finops_specialist",
    title: "Karpathy Context-as-RAM, Prompt Caching & FinOps Specialist",
    boundedContext: "Two-Tier Prefix Caching, Anti-Rot Compaction & Token FinOps Telemetry",
    keywords: [
      "finops-engine",
      "context-compactor",
      "prompt-cache-adapter",
      "context-health",
      "budget-watchdog",
      "finops",
    ],
    regexTriggers: [
      /\bContextCompactor\b/,
      /\bFinOpsEngine\b/,
      /\bPromptCacheAdapter\b/,
    ],
    invariants: [
      "La compattazione del contesto a soglia deve preservare il 100% degli invariant di ticket e file target (verifyContextInvariants).",
      "Il budget token deve rispettare il BudgetWatchdog con Safe-Pause al 100% e tracciamento FinOps real-time.",
    ],
    microRoleCard:
      "[RING-2: context_finops_specialist] Architetto del principio Karpathy Context-as-RAM, Prompt Caching Tier-1/Tier-2, Anti-Rot Compaction e FinOps.",
    selfHostingCluster: true,
  },
];

/**
 * Estrae eventuali ruoli già descritti in `AGENTS.md` o `AGENTS.md.bak`.
 */
function parsePreservedDomainRolesFromAgentsMd(
  agentsContent: string,
  allFilePaths: string[],
  defaultTestCmd: string
): SynthesizedSpecialist[] {
  const preserved: SynthesizedSpecialist[] = [];

  if (/\bmedical_manager\b/i.test(agentsContent)) {
    const scope = allFilePaths.filter((p) =>
      /rehab|circuit_breaker|decision_engine|science/i.test(p)
    );
    preserved.push(
      SynthesizedSpecialistSchema.parse({
        id: "medical_rehab_specialist",
        title: "Medical & Biomechanical Rehab Specialist (medical_manager)",
        ring: "RING_2_DOMAIN_EXPERT",
        origin: "PRESERVED_EXISTING",
        boundedContext: "Biomechanical Rehab & Injury Prevention",
        domainKeywords: [
          "rehab",
          "prehab",
          "injury",
          "medical_manager",
          "medicalcircuitbreaker",
          "circuit_breaker",
        ],
        domainScope:
          scope.length > 0 ? scope : ["docs/wiki/science/rehab_protocols.md"],
        domainInvariants: [
          "Escludere deterministicamente esercizi incompatibili con infortuni attivi tramite MedicalCircuitBreaker.",
          "Validare ogni modifica algoritmica contro docs/wiki/science/rehab_protocols.md.",
        ],
        microRoleCard:
          "[RING-2: medical_rehab_specialist] Presidio medico-biomeccanico e validazione MedicalCircuitBreaker su infortuni e riabilitazione.",
        testCommand: defaultTestCmd,
      })
    );
  }

  if (/\bnutrition_manager\b/i.test(agentsContent)) {
    const scope = allFilePaths.filter((p) => /nutrition|epic2/i.test(p));
    preserved.push(
      SynthesizedSpecialistSchema.parse({
        id: "nutrition_metabolic_specialist",
        title: "Clinical & Therapeutic Nutrition Specialist (nutrition_manager)",
        ring: "RING_2_DOMAIN_EXPERT",
        origin: "PRESERVED_EXISTING",
        boundedContext: "Clinical Nutrition, TDEE & Anti-Inflammatory Recovery",
        domainKeywords: [
          "nutrition",
          "nutrition_manager",
          "tdee",
          "macro",
          "therapeutic_nutrition",
        ],
        domainScope:
          scope.length > 0
            ? scope
            : ["docs/wiki/science/nutrition_protocols.md"],
        domainInvariants: [
          "Calibrare TDEE e macronutrienti in base al carico di allenamento e allo stato infiammatorio/infortunio.",
        ],
        microRoleCard:
          "[RING-2: nutrition_metabolic_specialist] Presidio nutrizionale clinico, TDEE adattivo e Nutrient Timing.",
        testCommand: defaultTestCmd,
      })
    );
  }

  if (/\bai_manager\b/i.test(agentsContent)) {
    const scope = allFilePaths.filter((p) =>
      /src\/ai|recommendation_algorithm|epic3|ai_algorithms/i.test(p)
    );
    preserved.push(
      SynthesizedSpecialistSchema.parse({
        id: "ai_coaching_specialist",
        title: "Adaptive AI & Workout Recommendation Specialist (ai_manager)",
        ring: "RING_2_DOMAIN_EXPERT",
        origin: "PRESERVED_EXISTING",
        boundedContext: "Adaptive AI Workout Generation & Intra-Workout RPE",
        domainKeywords: [
          "ai_manager",
          "workoutgenerator",
          "decision_engine",
          "recommendation_algorithm",
          "rpe",
        ],
        domainScope:
          scope.length > 0 ? scope : ["src/ai/decision_engine.py"],
        domainInvariants: [
          "Garantire che WorkoutGenerator rispetti i vincoli MedicalCircuitBreaker e adatti il piano in base all'RPE.",
        ],
        microRoleCard:
          "[RING-2: ai_coaching_specialist] Responsabile di WorkoutGenerator, Decision Trees + RL e micro-adattamento RPE.",
        testCommand: defaultTestCmd,
      })
    );
  }

  return preserved;
}

/**
 * Esegue il mining semantico del repository (Fase P1 — `SEMANTIC_DOMAIN_MINING` & `TRI_RING_ORG_SYNTHESIS`)
 * generando l'organigramma Tri-Ring completo:
 * - Ring-0: Core Governance Leads
 * - Ring-1: Catalog Tech Leads + Open-Ended Tech Specialists (es. SQL, Docker, Data Ingestion, MCP/CLI Runtime)
 * - Ring-2: Business Domain Experts (sia preservati da `AGENTS.md` sia inferiti autonomamente da AST/SQL/Wiki)
 */
export async function mineRepositoryDomainAndRoles(
  targetPath: string,
  stack?: ProjectStack,
  options?: DomainMinerOptions
): Promise<TriRingOrgChart> {
  const resolvedPath = path.resolve(targetPath);
  const resolvedStack =
    stack ?? (await detectProjectStack(resolvedPath, { hermetic: true }));
  const hermeticCommands = await resolveHermeticTestCommands(
    resolvedPath,
    resolvedStack.testCommands
  );

  const pyTestCmd =
    hermeticCommands.find((c) => c.includes("pytest")) ?? "pytest";
  const swiftTestCmd =
    hermeticCommands.find((c) => c.includes("swift test")) ?? "swift test";
  const tsTestCmd =
    hermeticCommands.find((c) => c.includes("npm test") || c.includes("vitest")) ??
    "npm test";

  const repoFiles = await collectRepoTextFiles(resolvedPath);
  const allFilePaths = repoFiles.map((f) => f.relativePath);
  const isSelfHostingOsRepo =
    allFilePaths.includes("src/inspector/domain-miner.ts") &&
    allFilePaths.includes("src/core/ceremony-dispatcher.ts");

  // 1. Ring-0 Core Governance Leads
  const ring0CoreLeads = [
    "cto",
    "engineering_lead",
    "product_lead",
    "qa_lead",
    "ai_lead",
    "rnd_lead",
  ];

  // 2. Ring-1 Tech Specialists (Catalog + Open-Ended Tech Synthesis)
  const ring1TechSpecialists: SynthesizedSpecialist[] = [];
  const langs = new Set(resolvedStack.languages.map((l) => l.toLowerCase()));

  if (langs.has("python") || langs.has("go") || langs.has("rust")) {
    const backendScope = allFilePaths.filter((p) =>
      p.endsWith(".py") || p.startsWith("app/") || p.startsWith("src/backend/")
    );
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "backend_manager",
        title: "Backend Engineering Lead",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "CATALOG",
        boundedContext: "Backend APIs, Persistence & Service Layer",
        domainKeywords: ["fastapi", "python", "api", "pydantic", "backend"],
        domainScope: backendScope.slice(0, 15),
        domainInvariants: [
          "Tutti gli endpoint devono validare gli schemi tramite Pydantic v2 con ConfigDict(populate_by_name=True).",
        ],
        microRoleCard:
          "[RING-1: backend_manager] Lead Backend Python/FastAPI responsabile di API, schemi Pydantic v2 e test ermetici.",
        testCommand: pyTestCmd,
      })
    );
  }

  if (langs.has("swift") || langs.has("kotlin") || langs.has("dart")) {
    const mobileScope = allFilePaths.filter((p) => p.endsWith(".swift"));
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "mobile_manager",
        title: "Mobile Engineering Lead",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "CATALOG",
        boundedContext: "iOS SwiftUI Views, MVVM ViewModels & Codable DTOs",
        domainKeywords: ["swift", "swiftui", "ios", "codable", "sendable", "mvvm"],
        domainScope: mobileScope.slice(0, 15),
        domainInvariants: [
          "Tutti i modelli scambiati tra attori Swift 6 devono conformarsi a Codable, Sendable, Hashable con CodingKeys nonisolated.",
        ],
        microRoleCard:
          "[RING-1: mobile_manager] Lead Mobile iOS Swift 6 / SwiftUI responsabile di MVVM, concorrenza Sendable e modelli Codable.",
        testCommand: swiftTestCmd,
      })
    );
  }

  if (langs.has("typescript") || langs.has("javascript")) {
    const tsScope = allFilePaths.filter(
      (p) => p.endsWith(".ts") || p.endsWith(".tsx")
    );
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "frontend_manager",
        title: "Frontend & TypeScript Engineering Lead",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "CATALOG",
        boundedContext: "TypeScript Modules, Contracts & Web Studio UI",
        domainKeywords: ["typescript", "react", "frontend", "zod", "studio"],
        domainScope: tsScope.slice(0, 15),
        domainInvariants: ["Compilazione TypeScript strict con zero errori e validazione contratti Zod."],
        microRoleCard:
          "[RING-1: frontend_manager] Lead TypeScript/Frontend con responsabilità su tipizzazione strict, contratti Zod e Web Studio UI.",
        testCommand: tsTestCmd,
      })
    );
  }

  // Open-Ended Tech Synthesis: Node.js CLI & MCP Runtime Specialist (Self-Hosting / Agentic Platform)
  const mcpCliFiles = allFilePaths.filter(
    (p) => p.startsWith("src/mcp/") || p.startsWith("src/cli/")
  );
  if (mcpCliFiles.length > 0) {
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "mcp_cli_runtime_specialist",
        title: "MCP Server, Worker Sandbox & CLI Runtime Specialist",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "OPEN_ENDED_SYNTHESIS",
        boundedContext: "MCP JSON-RPC Transport, JIT Tool Synthesis & CLI Dispatcher",
        domainKeywords: ["mcp", "cli", "dispatcher", "synthesizer", "worker"],
        domainScope: mcpCliFiles.slice(0, 15),
        domainInvariants: [
          "Il trasporto stdio MCP non deve mai essere inquinato da log non-JSON-RPC e i tool dinamici devono superare il pre-flight test in Worker Sandbox.",
        ],
        microRoleCard:
          "[RING-1: mcp_cli_runtime_specialist] Specialista sintetizzato per MCP Server/Client, JIT Tool Synthesis e architettura CLI modulare.",
        testCommand: tsTestCmd,
      })
    );
  }

  // Open-Ended Tech Synthesis: SQL / Relational Database Specialist
  const sqlFiles = allFilePaths.filter(
    (p) => p.endsWith(".sql") || /database|db_models/i.test(p)
  );
  if (langs.has("sql") || sqlFiles.length > 0) {
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "database_sql_specialist",
        title: "Database & Relational SQL Schema Specialist",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "OPEN_ENDED_SYNTHESIS",
        boundedContext: "Relational PostgreSQL/Supabase Schema & Migrations",
        domainKeywords: ["sql", "postgres", "supabase", "schema", "database", "migration"],
        domainScope: sqlFiles,
        domainInvariants: [
          "Ogni modifica alle tabelle SQL (exercises, muscles, equipments, users) deve mantenere l'integrità referenziale e la parità con i modelli ORM/Pydantic.",
        ],
        microRoleCard:
          "[RING-1: database_sql_specialist] Specialista sintetizzato per l'architettura SQL relazionale, migrazioni e allineamento ORM.",
        testCommand: pyTestCmd,
      })
    );
  }

  // Open-Ended Tech Synthesis: Data Ingestion / ETL Specialist
  const etlFiles = allFilePaths.filter((p) => /ingest|dataset|etl/i.test(p));
  if (etlFiles.length > 0) {
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "data_pipeline_specialist",
        title: "Data Ingestion & ETL Pipeline Specialist",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "OPEN_ENDED_SYNTHESIS",
        boundedContext: "Dataset Parsing, Normalization & Batch Ingestion",
        domainKeywords: ["ingest", "dataset", "etl", "batch", "hasaneyldrm"],
        domainScope: etlFiles,
        domainInvariants: [
          "Gli script di ingestione devono essere idempotenti (ON CONFLICT DO NOTHING / UPSERT) e validare i record prima dell'inserimento.",
        ],
        microRoleCard:
          "[RING-1: data_pipeline_specialist] Specialista sintetizzato per pipeline di ingestione dataset e normalizzazione media/metadati.",
        testCommand: pyTestCmd,
      })
    );
  }

  // Open-Ended Tech Synthesis: Docker & Container Specialist
  if (resolvedStack.hasDocker || langs.has("docker")) {
    const dockerScope = allFilePaths.filter((p) =>
      /docker|compose/i.test(p)
    );
    ring1TechSpecialists.push(
      SynthesizedSpecialistSchema.parse({
        id: "devops_container_specialist",
        title: "Container & DevOps Runtime Specialist",
        ring: "RING_1_TECH_SPECIALIST",
        origin: "OPEN_ENDED_SYNTHESIS",
        boundedContext: "Docker Compose Topology & Local Service Orchestration",
        domainKeywords: ["docker", "compose", "container", "postgres"],
        domainScope:
          dockerScope.length > 0 ? dockerScope : ["docker-compose.yml"],
        domainInvariants: [
          "I container di database devono montare gli script di init in modo riproducibile ed esporre healthcheck deterministici.",
        ],
        microRoleCard:
          "[RING-1: devops_container_specialist] Specialista sintetizzato per l'infrastruttura containerizzata Docker e orchestrazione servizi.",
      })
    );
  }

  // 3. Ring-2 Business Domain Experts (Preserved + Autonomous DDD Semantic Mining)
  const ring2Map = new Map<string, SynthesizedSpecialist>();

  if (!options?.ignoreExistingAgentsMd && !isSelfHostingOsRepo) {
    const agentsEntry = repoFiles.find((f) => f.relativePath === "AGENTS.md");
    let agentsContent = agentsEntry?.content ?? "";
    try {
      const bakContent = await fs.readFile(
        path.join(resolvedPath, "AGENTS.md.bak"),
        "utf-8"
      );
      agentsContent += "\n" + bakContent;
    } catch {
      // Nessun .bak presente
    }

    if (agentsContent) {
      const preserved = parsePreservedDomainRolesFromAgentsMd(
        agentsContent,
        allFilePaths,
        pyTestCmd
      );
      for (const p of preserved) {
        ring2Map.set(p.id, p);
      }
    }
  }

  // Autonomous DDD Bounded Context Mining da codice, SQL e documentazione
  // (opera anche quando AGENTS.md non esiste o viene ignorato!)
  const filesWithoutAgents = repoFiles.filter(
    (f) => f.relativePath !== "AGENTS.md"
  );

  const activeClusters = isSelfHostingOsRepo
    ? SEMANTIC_DOMAIN_CLUSTERS.filter((c) => c.selfHostingCluster === true)
    : SEMANTIC_DOMAIN_CLUSTERS.filter((c) => !c.selfHostingCluster);

  for (const cluster of activeClusters) {
    const matchedFiles: string[] = [];

    for (const file of filesWithoutAgents) {
      if (isSelfHostingOsRepo && file.relativePath.startsWith("tests/")) {
        continue;
      }
      const pathAndContent = `${file.relativePath}\n${file.content}`;
      const matchedByRegex = cluster.regexTriggers.some((rx) =>
        rx.test(pathAndContent)
      );
      const matchedByKeyword = cluster.keywords.some((kw) =>
        file.relativePath.toLowerCase().includes(kw.toLowerCase())
      );

      if (matchedByRegex || matchedByKeyword) {
        matchedFiles.push(file.relativePath);
      }
    }

    if (matchedFiles.length > 0) {
      const existing = ring2Map.get(cluster.id);
      if (existing) {
        // Arricchisce il domainScope con tutti i file reali scoperti dal miner
        const mergedScope = Array.from(
          new Set([...existing.domainScope, ...matchedFiles])
        );
        ring2Map.set(cluster.id, {
          ...existing,
          domainScope: mergedScope,
        });
      } else {
        ring2Map.set(
          cluster.id,
          SynthesizedSpecialistSchema.parse({
            id: cluster.id,
            title: cluster.title,
            ring: "RING_2_DOMAIN_EXPERT",
            origin: "SEMANTIC_MINED",
            boundedContext: cluster.boundedContext,
            domainKeywords: cluster.keywords,
            domainScope: matchedFiles,
            domainInvariants: cluster.invariants,
            microRoleCard: cluster.microRoleCard,
            testCommand: isSelfHostingOsRepo ? tsTestCmd : pyTestCmd,
          })
        );
      }
    }
  }

  const maxExperts = options?.maxDomainExperts ?? 5;
  const ring2DomainExperts = Array.from(ring2Map.values()).slice(0, maxExperts);

  return TriRingOrgChartSchema.parse({
    targetPath: resolvedPath,
    generatedAt: new Date().toISOString(),
    ring0CoreLeads,
    ring1TechSpecialists,
    ring2DomainExperts,
  });
}
