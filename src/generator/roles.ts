import {
  TeamConfigurationSchema,
  type GeneratedRole,
  type TeamConfiguration,
} from "../contracts/roles.js";
import type { ProjectStack } from "../contracts/inspector.js";
import type { TriRingOrgChart } from "../contracts/brownfield.js";
import {
  buildMobileManagerPrompt,
  buildBackendManagerPrompt,
  buildFrontendManagerPrompt,
  buildGoManagerPrompt,
  buildRustManagerPrompt,
  buildLeadEngineerPrompt,
} from "./templates/roles-prompts.js";

/**
 * Renderizza il markdown completo di AGENTS.md secondo l'Executive & R&D Operating Protocol v2
 * (Sprint 17.6 — 100% Self-Hosting DNA):
 * - In Cima (Sezione 0): Identità CTO L1 imperativa in 2ª persona, Greeting Rule a 3 opzioni per il CEO,
 *   le 4 CTO Operating Modes (`MODE 1..4`), le 4 Cognitive Forcing Functions (`CFF-1..4`),
 *   tassonomia Tri-Ring completa (Ring-0 Core Leads, Ring-1 Tech Specialists, Ring-2 Business Domain Experts
 *   con `domainScope` e `domainInvariants`), Matrice RACI Deterministica e le 4 Skill YAML.
 * - Sezioni 1..6: Stack Tecnologico, Organigramma Mermaid Tri-Ring, Matrice dei Ruoli, Karpathy Context as RAM,
 *   Deterministic Gatekeeper e Direttive Operative.
 */
export function renderAgentsMarkdown(
  stack: ProjectStack,
  roles: GeneratedRole[],
  orgChart?: TriRingOrgChart
): string {
  const ring0Nodes = [
    `    CEO["👑 CEO (Utente Umano)"] --> L1["Executive Orchestrator / CTO (L1)"]`,
    `    L1 --> engineering_lead["Engineering Lead (Ring-0 L2)"]`,
    `    L1 --> product_lead["Product Lead (Ring-0 L2)"]`,
    `    L1 --> qa_lead["QA & Devil's Advocate Lead (Ring-0 L2)"]`,
    `    L1 --> ai_lead["AI & Context Harness Lead (Ring-0 L2)"]`,
    `    L1 --> rnd_lead["R&D & Innovation Lead (Ring-0 L2)"]`,
  ].join("\n");

  const mermaidNodes = roles
    .map(
      (role) =>
        `    L1 --> ${role.id}["${role.name} (${role.id}) [${role.level}]"]\n    ${role.id} --> ${role.id}_leaf["Leaf Developers L3 (${role.id})"]`
    )
    .join("\n");

  const ring2MermaidNodes = (orgChart?.ring2DomainExperts ?? [])
    .map(
      (expert) =>
        `    L1 --> ${expert.id}["${expert.title} (${expert.id}) [Ring-2 L2]"]`
    )
    .join("\n");

  const rolesTableRows = roles
    .map((role) => {
      const stackInfo =
        [
          ...role.targetLanguages,
          ...role.targetFrameworks.map((f) => `(${f})`),
        ].join(" ") || "Generico";
      const testCmd = role.recommendedTestCommand
        ? `\`${role.recommendedTestCommand}\``
        : "N/D";
      const subagents = role.enableSubagents ? "Sì (L3 Leaf)" : "No";
      const writeTools = role.enableWriteTools ? "Sì" : "No (Read-only)";

      return `| \`${role.id}\` | **${role.name}** | ${role.level} | ${stackInfo} | ${testCmd} | ${subagents} | ${writeTools} |`;
    })
    .join("\n");

  const ring1SpecialistsList =
    orgChart && orgChart.ring1TechSpecialists.length > 0
      ? orgChart.ring1TechSpecialists
          .map(
            (spec) =>
              `   - **\`${spec.id}\`** (*${spec.title}* — \`${spec.boundedContext}\`): Scope: ${spec.domainScope.slice(0, 6).map((s) => `\`${s}\``).join(", ") || "N/D"} | Invarianti: ${spec.domainInvariants.join(" ; ")}`
          )
          .join("\n")
      : roles
          .map((r) => `   - **\`${r.id}\`** (*${r.name}*): ${r.description}`)
          .join("\n");

  const ring2ExpertsSection =
    orgChart && orgChart.ring2DomainExperts.length > 0
      ? [
          `5. **Business Domain Experts (Ring-2 — Subagenti L2 sintetizzati dal Dominio):**`,
          ``,
          `| Expert ID | Titolo & Bounded Context | File Target (` +
            "`domainScope`" +
            `) | Invarianti di Dominio (` +
            "`domainInvariants`" +
            `) |`,
          `| :--- | :--- | :--- | :--- |`,
          ...orgChart.ring2DomainExperts.map(
            (exp) =>
              `| \`${exp.id}\` | **${exp.title}** (\`${exp.boundedContext}\`) | ${exp.domainScope.slice(0, 6).map((s) => `\`${s}\``).join(", ")} | ${exp.domainInvariants.join(" ")} |`
          ),
          ``,
          ...orgChart.ring2DomainExperts.map(
            (exp) =>
              `   - **\`${exp.id}\`**: \`${exp.microRoleCard}\`\n     - **Invarianti Obbligatorie:** ${exp.domainInvariants.join(" | ")}`
          ),
        ].join("\n")
      : `5. **Business Domain Experts (Ring-2 — Subagenti L2 sintetizzati dal Dominio):**\n   - Sintetizzati dinamicamente in \`.company-os/org-chart.json\` tramite \`agentic-company bootstrap\` e interrogabili con \`agentic-company workflow route --scope <files>\`.`;

  const rolesDirectives = roles
    .map((role) => {
      const testCmd = role.recommendedTestCommand
        ? `\`${role.recommendedTestCommand}\``
        : "Non specificato";
      const langs =
        role.targetLanguages.length > 0
          ? role.targetLanguages.join(", ")
          : "Tutti";
      const frameworks =
        role.targetFrameworks.length > 0
          ? role.targetFrameworks.join(", ")
          : "Standard";

      return `### ${role.name} (\`${role.id}\` — ${role.level})
- **Descrizione**: ${role.description}
- **Linguaggi Target**: ${langs}
- **Frameworks Target**: ${frameworks}
- **Comando di Test Raccomandato**: ${testCmd}
- **Delega Sub-agenti**: ${role.enableSubagents ? "Abilitata" : "Disabilitata"}
- **Strumenti di Modifica**: ${role.enableWriteTools ? "Abilitati" : "Disabilitati"}

#### System Prompt Operativo
\`\`\`markdown
${role.systemPrompt}
\`\`\`
`;
    })
    .join("\n\n");

  const testCommandsSummary = roles
    .filter((r) => r.recommendedTestCommand)
    .map(
      (r) =>
        `- **${r.name}** (\`${r.id}\`): esegui \`${r.recommendedTestCommand}\``
    )
    .join("\n");

  return `# AGENTS.md — Agentic Company Organization & Roles

> Auto-generated by **Agentic Company OS** for target workspace: \`${stack.targetPath}\`.
> Defines the autonomous multi-agent hierarchy, decision contracts, and the Karpathy "Context as RAM" architecture.
> **Primary Language:** English (\`en\`, configurable via \`communication.language\` in \`.company-os/settings.json\`).
> **Persona Preset:** \`ENGINEERING_PROFESSIONAL\` (**Project Lead** & **Lead Orchestrator (L1)**; legacy alias: \`CEO (Utente Umano)\` & \`CTO (Agente Primario — Tu)\`).

---

## 0. Role Hierarchy, Lead Orchestrator (L1) Identity & Session Protocol

1. **Project Lead (Human Decision-Maker / \`CEO (Utente Umano)\`):** Holds final authority. Approves architectural plans, sprint execution, and releases.
2. **Lead Orchestrator (L1 Primary Agent — You / \`CTO (Agente Primario — Tu)\`):**
   - Always act as the **Lead Orchestrator (L1)** of this workspace.
   - Communicate in **English** by default (or the language configured in \`.company-os/settings.json\` -> \`communication.language\`) with a clear, engineering-focused, decision-oriented tone.
   - Do not write low-level application code before verifying contracts and coordinating L2 Domain Leads.
   - Always consult \`docs/CEO_Dashboard.md\`, \`docs/wiki/INDEX.md\`, \`.company-os/settings.json\`, and query the Dual-Brain CLI Bridge (\`npx tsx src/index.ts workflow status --json\` or \`agentic-company workflow status\`).

### Session Startup Protocol (3-Option Greeting Rule)
When the **Project Lead** opens a session or greets you, respond by declaring \`[ORCHESTRATOR MODE: 1 — STANDUP]\` (alias: \`[CTO MODE: 1 — STANDUP]\`) and proposing these **3 operational options**:
1. **Run Daily Standup (\`/run-company\`)** to synchronize state, \`docs/CEO_Dashboard.md\`, backlog, and the Tri-Ring team.
2. **Inspect a specific area or start a Root Cause Investigation (\`/investigate-anomaly\`)** on architecture, bugs/anomalies, contracts, or Wiki (\`docs/wiki/INDEX.md\`).
3. **Convene an R&D Research Cycle or Roundtable (\`/rnd-roundtable\`)** with \`rnd_lead\`, \`qa_lead\` (Devil's Advocate), and Ring-2 Domain Experts.

### The 4 Operating Modes (\`MODE 1..4\`) & The 5 Cognitive Forcing Functions (\`CFF-1..5\`)
- **\`MODE_1_STANDUP\` (\`/run-company\`):** Blackboard synchronization (\`AGENTS.md\`, \`CLAUDE.md\`, \`docs/CEO_Dashboard.md\`, \`docs/wiki/INDEX.md\`), structured briefing to the Project Lead, and strategic alignment.
- **\`MODE_2_INVESTIGATE_RCA\` (\`/investigate-anomaly\` — Stop-the-Line & Read-Only):** Mandatory upon any bug, anomaly, or regression. **Modifying production code is strictly forbidden.** Execute the *5 Whys* and summon \`rnd_lead\`, relevant Ring-2 Domain Experts, and \`qa_lead\`.
- **\`MODE_3_RND_ROUNDTABLE\` (\`/rnd-roundtable\` — Symptom-to-Principle Abstraction & Consensus):** Multi-agent roundtable with mandatory Devil's Advocate (\`qa_lead\` + Ring-2 experts) to abstract from the punctual symptom to a universal architectural principle, draft the \`RootCauseAnalysisReport\`, and present the Executive Pitch to the Project Lead.
- **\`MODE_4_BUILD_GATEKEEPER\` (\`/gatekeeper-audit\` — Execution & Deterministic Gatekeeper):** Unlocked **exclusively** after \`ceoApproved === true\`. Atomic delegation to L2 Leads / L3 Leaf Engineers, verification of invariants in \`.company-os/invariants.json\`, and 100% green hermetic tests.

**Cognitive Forcing Functions (Deterministic Anti-Rush Gate in \`CompanyStateMachine.enforceCognitiveForcingGate\`):**
- **\`CFF-1 (Stop-the-Line Read-Only)\`:** Jumping directly from an anomaly to \`SPECIFY\` / \`DELEGATE\` / \`IMPLEMENT\` is blocked (\`COGNITIVE_FORCING_GATE_VIOLATION\`).
- **\`CFF-2 (Multi-Ring & Devil's Advocate Consultation)\`:** Every investigation must consult at least 2 specialists (including \`rnd_lead\`, \`qa_lead\` as Devil's Advocate, and Ring-2 Domain Experts resolved via \`workflow route --scope\`).
- **\`CFF-3 (Symptom-to-Principle Abstraction)\`:** Every RCA must include at least 3 levels of *5 Whys* (\`fiveWhys.length >= 3\`) and formulate a reusable architectural \`systemicPrinciple\`.
- **\`CFF-4 (Explicit Gatekeeper Approval)\`:** No anomaly fix enters \`MODE_4_BUILD_GATEKEEPER\` until \`ceoApproved === true\` is certified by the Project Lead.
- **\`CFF-5 (Configurable Spike Checkpoint Gate)\`:** Controlled via \`governance.spikeCheckpoint\` in \`.company-os/settings.json\` (\`HITL_SPIKE_REVIEW\` pauses after Spike for Project Lead approval; \`AUTONOMOUS_FAST_TRACK\` proceeds directly to build).

### 🏛️ Architettura Organizzativa Tri-Ring (Ring-0, Ring-1, Ring-2, L3)
3. **Core Leads di Sistema (Ring-0 — Subagenti L2, \`enable_subagent_tools: true\`):**
   - **\`engineering_lead\`**: Architettura di sistema, stack inspector, runtime, compilatori, concorrenza Git Worktrees, supply chain.
   - **\`product_lead\`**: Visione di prodotto, backlog refinement, CLI ergonomics, Agentic Studio UI, Git PR workflow, release governance.
   - **\`qa_lead\`**: Qualità deterministica, Devil's Advocate / Red-Teamer obbligatorio nelle Roundtables, Gatekeeper runner, Self-Healing loop, AST Diff Guard, War Room.
   - **\`ai_lead\`**: Two-tier prompt caching, anti-rot memory compaction, dynamic tool pruning, JIT MCP synthesis, FinOps cockpit.
   - **\`rnd_lead\`**: Ricerca & innovazione continua, interviste 1:1, consensus roundtables, Root Cause Analysis (5 Whys), RFC blueprints.
4. **Tech & Stack Specialists (Ring-1 — Subagenti L2 per lo Stack Tecnologico):**
${ring1SpecialistsList}
${ring2ExpertsSection}
6. **Leaf Developers (Subagenti L3 — \`enable_subagent_tools: false\`, \`enable_write_tools: true\`):**
   - Esecutori atomici TDD: modificano esclusivamente i file autorizzati dal ticket assegnato, rispettano l'AST Diff Guard e chiudono la sessione a test verdi.

### 📊 Matrice RACI Deterministica per Fasi del Ciclo di Vita
- \`ANOMALY_RCA\`: **A:** CTO | **R:** \`rnd_lead\` + Ring-2 Domain Experts | **C:** \`qa_lead\` (Devil's Advocate), \`engineering_lead\` | **I:** CEO
- \`RND_ROUNDTABLE\`: **A:** CTO | **R:** \`rnd_lead\`, \`engineering_lead\`, Ring-2 Experts | **C:** \`qa_lead\` (Red-Team), \`product_lead\`, \`ai_lead\` | **I:** CEO
- \`SPIKE_VALIDATION\`: **A:** CTO | **R:** Lead di Dominio + \`rnd_lead\` | **C:** Altri Lead L2 | **I:** CEO
- \`BACKLOG_REFINEMENT\`: **A:** \`product_lead\` | **R:** \`product_lead\`, Domain Leads | **C:** \`engineering_lead\`, \`qa_lead\`, \`ai_lead\` | **I:** CTO, CEO
- \`CODE_IMPLEMENTATION\`: **A:** \`engineering_lead\` / Domain Lead L2 | **R:** \`leaf_developer\` | **C:** \`ai_lead\`, \`product_lead\` | **I:** \`qa_lead\`, CTO
- \`GATEKEEPER_VERIFICATION\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` (Gatekeeper) | **C:** Domain Lead L2, Ring-2 Experts | **I:** CTO, \`product_lead\`
- \`SELF_HEALING\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` + \`leaf_developer\` | **C:** \`engineering_lead\`, \`ai_lead\` | **I:** CTO
- \`SECURITY_AUDIT\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` (Secret Guard/Auditor) | **C:** \`engineering_lead\`, \`backend_manager\` | **I:** CTO, CEO
- \`FINOPS_GOVERNANCE\`: **A:** \`ai_lead\` | **R:** \`ai_lead\` (Watchdog/FinOps) | **C:** \`product_lead\`, \`engineering_lead\` | **I:** CTO, CEO
- \`RELEASE_APPROVAL\`: **A:** CEO | **R:** CTO, \`product_lead\`, \`qa_lead\` | **C:** \`engineering_lead\`, \`ai_lead\`, \`rnd_lead\` | **I:** Tutti

### 🛠️ Le 4 Skill Operative Modulari (\`.agents/skills/\`)
- [\`/run-company\`](file:///.agents/skills/run-company/SKILL.md) (\`MODE_1_STANDUP\`): Saluto al CEO a 3 opzioni, lettura \`docs/CEO_Dashboard.md\` e sincronizzazione Tri-Ring.
- [\`/investigate-anomaly\`](file:///.agents/skills/investigate-anomaly/SKILL.md) (\`MODE_2_INVESTIGATE_RCA\`): Stop-the-Line Read-Only, 5 Whys e consultazione \`rnd_lead\` + Ring-2 Experts + Devil's Advocate.
- [\`/rnd-roundtable\`](file:///.agents/skills/rnd-roundtable/SKILL.md) (\`MODE_3_RND_ROUNDTABLE\`): Tavola rotonda con consenso a 2 round, astrazione Symptom-to-Principle ed Executive Pitch al CEO.
- [\`/gatekeeper-audit\`](file:///.agents/skills/gatekeeper-audit/SKILL.md) (\`MODE_4_BUILD_GATEKEEPER\`): Verifica Cognitive Forcing Gate, delega L3, controllo invarianti e test ermetici.

---

## 1. Stack Tecnologico Rilevato
- **Target Path**: \`${stack.targetPath}\`
- **Linguaggi**: ${stack.languages.length > 0 ? stack.languages.join(", ") : "Nessuno rilevato"}
- **Frameworks**: ${stack.frameworks.length > 0 ? stack.frameworks.join(", ") : "Nessuno rilevato"}
- **Supporto Docker**: ${stack.hasDocker ? "Presente (Dockerfile o compose)" : "Non rilevato"}
- **Package Managers**: ${stack.packageManagers.length > 0 ? stack.packageManagers.join(", ") : "Nessuno rilevato"}
- **Comandi Test Rilevati**: ${stack.testCommands.length > 0 ? stack.testCommands.map((c) => `\`${c}\``).join(", ") : "Nessuno configurato"}

---

## 2. Organigramma Aziendale (Multi-Agent Hierarchy)

\`\`\`mermaid
graph TD
${ring0Nodes}
${mermaidNodes}${ring2MermaidNodes ? `\n${ring2MermaidNodes}` : ""}
\`\`\`

---

## 3. Matrice dei Ruoli Assegnati

| Ruolo ID | Nome Ruolo | Livello | Target Stack | Test Command Raccomandato | Sub-agenti | Modifica File |
|---|---|---|---|---|---|---|
${rolesTableRows}

---

## 4. Principio Fondamentale: Karpathy Context as RAM

L'architettura cognitiva di tutti gli agenti operanti nel workspace segue scrupolosamente il principio **Karpathy Context as RAM**:

1. **Finestra di Contesto come RAM**: la finestra di contesto dell'LLM è una risorsa preziosa, finita e volatile (RAM), mentre il file system locale e il repository rappresentano la memoria secondaria persistente (Disk).
2. **Puntatori e Indici**: per orientarsi nell'architettura, le convenzioni aziendali e i contratti, consultare sempre in prima istanza la documentazione centralizzata partendo da \`docs/wiki/INDEX.md\`.
3. **Ispezione Atomica**: non caricare o dumpare mai interi alberi di directory o file non correlati. Caricare unicamente le slice di codice e i contratti atomici indispensabili per il ticket in lavorazione.
4. **Delega Chirurgica**: i Domain Lead L2 scompongono le iniziative in task atomici indirizzati a specifici Leaf Developer L3, garantendo che ogni agente mantenga nel proprio contesto solo le informazioni strettamente necessarie all'esecuzione.
5. **Rilascio della Memoria**: al termine di ogni fase esecutiva o verifica di test, rilasciare le informazioni transitorie trattenendo solo il report di esito per il Gatekeeper.

---

## 5. Deterministic Gatekeeper & Quality Protocol

Nessuna modifica, feature o refactoring è considerata pronta o ammessa al merge senza la validazione empirica del **Deterministic Gatekeeper**:

1. **Compilazione & Type Checking**: assenza totale di errori nei compilatori e nei type checker di riferimento (es. \`tsc --noEmit\`, strong typing Swift, mypy/Pydantic).
2. **Suite di Test Automatizzata**: tutti i test devono passare al 100% (zero fallimenti, zero regressioni).
3. **Comandi di Test Raccomandati per Dominio**:
${testCommandsSummary || "- Nessun comando specifico configurato."}
4. **Zero Allucinazioni**: è severamente vietato fare assunzioni o presupporre comportamenti non verificati direttamente dall'output dei comandi deterministici o dai file sorgente.

---

## 6. Direttive Operative e System Prompts dei Ruoli

${rolesDirectives}
`;
}

/**
 * Genera la configurazione del team aziendale in base allo stack tecnologico rilevato.
 * Rispetta rigorosamente TeamConfigurationSchema in src/contracts/roles.ts.
 */
export async function generateTeamConfiguration(
  stack: ProjectStack,
  orgChart?: TriRingOrgChart
): Promise<TeamConfiguration> {
  const normalizedLangs = new Set(stack.languages.map((l) => l.toLowerCase().trim()));
  const normalizedFrameworks = new Set(stack.frameworks.map((f) => f.toLowerCase().trim()));

  const roles: GeneratedRole[] = [];

  // 1. Mobile Lead (Swift / SwiftUI / iOS / macOS / KMP / Flutter)
  const isMobileSwift =
    normalizedLangs.has("swift") ||
    normalizedFrameworks.has("swiftui") ||
    normalizedFrameworks.has("uikit");
  const isKmp =
    normalizedFrameworks.has("kmp") ||
    (normalizedLangs.has("kotlin") && !normalizedFrameworks.has("spring"));
  const isFlutter =
    normalizedFrameworks.has("flutter") ||
    normalizedLangs.has("dart");

  if (isMobileSwift || isKmp || isFlutter) {
    const mobileLangs = stack.languages.filter((l) =>
      ["swift", "kotlin", "dart"].includes(l.toLowerCase())
    );
    const targetLangs = mobileLangs.length > 0 ? mobileLangs : ["swift"];
    const mobileFws = stack.frameworks.filter((f) =>
      ["swiftui", "uikit", "kmp", "flutter"].includes(f.toLowerCase())
    );
    const targetFws = mobileFws.length > 0 ? mobileFws : (isKmp ? ["kmp"] : (isFlutter ? ["flutter"] : ["swiftui"]));

    let testCmd = "swift test";
    if (isFlutter) {
      testCmd = "flutter test";
    } else if (isKmp) {
      testCmd = "./gradlew test";
    }

    const prompt = buildMobileManagerPrompt({
      targetLanguages: targetLangs,
      targetFrameworks: targetFws,
      recommendedTestCommand: testCmd,
    });

    roles.push({
      id: "mobile_manager",
      name: "Mobile Engineering Lead",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dell'architettura mobile (iOS/macOS Swift, Kotlin Multiplatform KMP, Flutter/Dart) con pattern reattivi, memory management e standard di qualità nativi.",
      systemPrompt: prompt,
      recommendedTestCommand: testCmd,
      targetLanguages: targetLangs,
      targetFrameworks: targetFws,
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 2. Backend Lead (Python / FastAPI / backend frameworks)
  const isPythonBackend =
    normalizedLangs.has("python") ||
    normalizedFrameworks.has("fastapi") ||
    normalizedFrameworks.has("flask") ||
    normalizedFrameworks.has("django");

  if (isPythonBackend) {
    const targetLangs = stack.languages.filter((l) => l.toLowerCase() === "python");
    const pythonLangs = targetLangs.length > 0 ? targetLangs : ["python"];
    const targetFws = stack.frameworks.filter((f) =>
      ["fastapi", "flask", "django"].includes(f.toLowerCase())
    );
    const pythonFws = targetFws.length > 0 ? targetFws : ["fastapi"];

    const prompt = buildBackendManagerPrompt({
      targetLanguages: pythonLangs,
      targetFrameworks: pythonFws,
      recommendedTestCommand: "pytest",
    });

    roles.push({
      id: "backend_manager",
      name: "Backend Engineering Lead",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dei servizi backend Python/FastAPI con architettura asincrona, validazione tipizzata con Pydantic e dependency injection.",
      systemPrompt: prompt,
      recommendedTestCommand: "pytest",
      targetLanguages: pythonLangs,
      targetFrameworks: pythonFws,
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 3. Frontend Lead (TypeScript / JavaScript + React / frontend frameworks)
  const hasTsOrJs = normalizedLangs.has("typescript") || normalizedLangs.has("javascript");
  const hasReactOrFrontendFw =
    normalizedFrameworks.has("react") ||
    normalizedFrameworks.has("next.js") ||
    normalizedFrameworks.has("vue") ||
    normalizedFrameworks.has("angular") ||
    normalizedFrameworks.has("svelte") ||
    normalizedLangs.has("react");

  const isFrontendReact = hasReactOrFrontendFw && (hasTsOrJs || normalizedLangs.has("react"));

  if (isFrontendReact) {
    const targetLangs = stack.languages.filter((l) =>
      ["typescript", "javascript"].includes(l.toLowerCase())
    );
    const tsJsLangs = targetLangs.length > 0 ? targetLangs : ["typescript"];
    const targetFws = stack.frameworks.filter((f) =>
      ["react", "next.js", "vue", "angular", "svelte"].includes(f.toLowerCase())
    );
    const reactFws = targetFws.length > 0 ? targetFws : ["react"];

    const prompt = buildFrontendManagerPrompt({
      targetLanguages: tsJsLangs,
      targetFrameworks: reactFws,
      recommendedTestCommand: "npm test",
    });

    roles.push({
      id: "frontend_manager",
      name: "Frontend Engineering Lead",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dell'interfaccia utente React/TypeScript, component architecture atomica, custom hooks e validazione statica e dinamica.",
      systemPrompt: prompt,
      recommendedTestCommand: "npm test",
      targetLanguages: tsJsLangs,
      targetFrameworks: reactFws,
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 4. Go Lead (Go / microservizi / goroutines)
  const isGo = normalizedLangs.has("go");
  if (isGo) {
    const targetLangs = stack.languages.filter((l) => l.toLowerCase() === "go");
    const goLangs = targetLangs.length > 0 ? targetLangs : ["go"];
    const prompt = buildGoManagerPrompt({
      targetLanguages: goLangs,
      targetFrameworks: [],
      recommendedTestCommand: "go test ./...",
    });

    roles.push({
      id: "go_manager",
      name: "Go Engineering Lead",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dell'architettura dei servizi Go con concorrenza goroutine/channel, error handling esplicito e layout idiomatico a package.",
      systemPrompt: prompt,
      recommendedTestCommand: "go test ./...",
      targetLanguages: goLangs,
      targetFrameworks: [],
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 5. Rust Lead (Rust / system programming / memory safety)
  const isRust = normalizedLangs.has("rust");
  if (isRust) {
    const targetLangs = stack.languages.filter((l) => l.toLowerCase() === "rust");
    const rustLangs = targetLangs.length > 0 ? targetLangs : ["rust"];
    const prompt = buildRustManagerPrompt({
      targetLanguages: rustLangs,
      targetFrameworks: [],
      recommendedTestCommand: "cargo test",
    });

    roles.push({
      id: "rust_manager",
      name: "Rust Systems Lead",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dell'architettura dei sistemi Rust, borrow checker, zero unsafe, memory safety e quality gates con cargo clippy.",
      systemPrompt: prompt,
      recommendedTestCommand: "cargo test",
      targetLanguages: rustLangs,
      targetFrameworks: [],
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 6. Fallback: se nessun lead specializzato è stato identificato (es. C, generic stack)
  if (roles.length === 0) {
    const defaultTestCmd = stack.testCommands.length > 0 ? stack.testCommands[0] : "npm test";
    const prompt = buildLeadEngineerPrompt({
      targetLanguages: stack.languages.length > 0 ? stack.languages : ["generic"],
      targetFrameworks: stack.frameworks,
      recommendedTestCommand: defaultTestCmd,
    });

    roles.push({
      id: "lead_engineer",
      name: "Lead Systems Engineer",
      level: "L2",
      description:
        "Domain Lead L2 responsabile dell'architettura ingegneristica complessiva, coordinamento tecnico multi-stack, qualità del software e Deterministic Gatekeeper.",
      systemPrompt: prompt,
      recommendedTestCommand: defaultTestCmd,
      targetLanguages: stack.languages.length > 0 ? stack.languages : ["generic"],
      targetFrameworks: stack.frameworks,
      enableSubagents: true,
      enableWriteTools: true,
    });
  }

  // 5. Renderizza il file markdown AGENTS.md (includendo orgChart Tri-Ring se presente)
  const renderedAgentsMarkdown = renderAgentsMarkdown(stack, roles, orgChart);

  // 6. Costruisce e valida la configurazione completa
  const teamConfigurationData = {
    targetPath: stack.targetPath,
    stack,
    roles,
    renderedAgentsMarkdown,
    generatedAt: new Date().toISOString(),
  };

  return TeamConfigurationSchema.parse(teamConfigurationData);
}
