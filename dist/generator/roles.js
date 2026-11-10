import path from "node:path";
import { TeamConfigurationSchema, } from "../contracts/roles.js";
import { buildMobileManagerPrompt, buildBackendManagerPrompt, buildFrontendManagerPrompt, buildGoManagerPrompt, buildRustManagerPrompt, buildLeadEngineerPrompt, } from "./templates/roles-prompts.js";
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
export function renderAgentsMarkdown(stack, roles, orgChart) {
    const projectName = path.basename(stack.targetPath) || ".";
    const ring0Nodes = [
        `    CEO["Project Lead (Human Decision-Maker)"] --> L1["Lead Orchestrator (L1)"]`,
        `    L1 --> engineering_lead["Engineering Lead (Ring-0 L2)"]`,
        `    L1 --> product_lead["Product Lead (Ring-0 L2)"]`,
        `    L1 --> qa_lead["QA & Devil's Advocate Lead (Ring-0 L2)"]`,
        `    L1 --> ai_lead["AI & Context Harness Lead (Ring-0 L2)"]`,
        `    L1 --> rnd_lead["R&D & Innovation Lead (Ring-0 L2)"]`,
    ].join("\n");
    const mermaidNodes = roles
        .map((role) => `    L1 --> ${role.id}["${role.name} (${role.id}) [${role.level}]"]\n    ${role.id} --> ${role.id}_leaf["Leaf Engineers L3 (${role.id})"]`)
        .join("\n");
    const ring2MermaidNodes = (orgChart?.ring2DomainExperts ?? [])
        .map((expert) => `    L1 --> ${expert.id}["${expert.title} (${expert.id}) [Ring-2 L2]"]`)
        .join("\n");
    const rolesTableRows = roles
        .map((role) => {
        const stackInfo = [
            ...role.targetLanguages,
            ...role.targetFrameworks.map((f) => `(${f})`),
        ].join(" ") || "Generic";
        const testCmd = role.recommendedTestCommand
            ? `\`${role.recommendedTestCommand}\``
            : "N/A";
        const subagents = role.enableSubagents ? "Yes (L3 Leaf)" : "No";
        const writeTools = role.enableWriteTools ? "Yes" : "No (Read-only)";
        return `| \`${role.id}\` | **${role.name}** | ${role.level} | ${stackInfo} | ${testCmd} | ${subagents} | ${writeTools} |`;
    })
        .join("\n");
    const ring1SpecialistsList = orgChart && orgChart.ring1TechSpecialists.length > 0
        ? orgChart.ring1TechSpecialists
            .map((spec) => `   - **\`${spec.id}\`** (*${spec.title}* — \`${spec.boundedContext}\`): Scope: ${spec.domainScope.slice(0, 6).map((s) => `\`${s}\``).join(", ") || "N/A"} | Invariants: ${spec.domainInvariants.join(" ; ")}`)
            .join("\n")
        : roles
            .map((r) => `   - **\`${r.id}\`** (*${r.name}*): ${r.description}`)
            .join("\n");
    const ring2ExpertsSection = orgChart && orgChart.ring2DomainExperts.length > 0
        ? [
            `5. **Business Domain Experts (Ring-2 — L2 Domain Specialists):**`,
            ``,
            `| Expert ID | Title & Bounded Context | Target Scope (` +
                "`domainScope`" +
                `) | Domain Invariants (` +
                "`domainInvariants`" +
                `) |`,
            `| :--- | :--- | :--- | :--- |`,
            ...orgChart.ring2DomainExperts.map((exp) => `| \`${exp.id}\` | **${exp.title}** (\`${exp.boundedContext}\`) | ${exp.domainScope.slice(0, 6).map((s) => `\`${s}\``).join(", ")} | ${exp.domainInvariants.join(" ")} |`),
            ``,
            ...orgChart.ring2DomainExperts.map((exp) => `   - **\`${exp.id}\`**: \`${exp.microRoleCard}\`\n     - **Mandatory Invariants:** ${exp.domainInvariants.join(" | ")}`),
        ].join("\n")
        : `5. **Business Domain Experts (Ring-2 — L2 Domain Specialists):**\n   - Dynamically synthesized in \`.company-os/org-chart.json\` via \`bootstrap\` and queryable via \`node .company-os/bin/agentic-os.mjs workflow route --scope <files>\`.`;
    const rolesDirectives = roles
        .map((role) => {
        const testCmd = role.recommendedTestCommand
            ? `\`${role.recommendedTestCommand}\``
            : "Not specified";
        const langs = role.targetLanguages.length > 0
            ? role.targetLanguages.join(", ")
            : "All";
        const frameworks = role.targetFrameworks.length > 0
            ? role.targetFrameworks.join(", ")
            : "Standard";
        return `### ${role.name} (\`${role.id}\` — ${role.level})
- **Description**: ${role.description}
- **Target Languages**: ${langs}
- **Target Frameworks**: ${frameworks}
- **Recommended Test Command**: ${testCmd}
- **Subagent Delegation**: ${role.enableSubagents ? "Enabled" : "Disabled"}
- **Write Tools**: ${role.enableWriteTools ? "Enabled" : "Disabled"}

#### Operational System Prompt
\`\`\`markdown
${role.systemPrompt}
\`\`\`
`;
    })
        .join("\n\n");
    const testCommandsSummary = roles
        .filter((r) => r.recommendedTestCommand)
        .map((r) => `- **${r.name}** (\`${r.id}\`): run \`${r.recommendedTestCommand}\``)
        .join("\n");
    return `# AGENTS.md — Agentic Company Organization & Roles

> Auto-generated by **Agentic System OS** for target workspace: \`${projectName}\`.
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
   - Always consult \`docs/CEO_Dashboard.md\`, \`docs/wiki/INDEX.md\`, \`.company-os/settings.json\`, and query the Dual-Brain CLI Bridge (\`node .company-os/bin/agentic-os.mjs workflow status --json\`).

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

### 🏛️ Tri-Ring Organization Architecture (Ring-0, Ring-1, Ring-2, L3)
3. **Core System Leads (Ring-0 — L2 Subagents, \`enable_subagent_tools: true\`):**
   - **\`engineering_lead\`**: System architecture, stack inspector, runtime, compilers, Git Worktree concurrency, supply chain.
   - **\`product_lead\`**: Product vision, backlog refinement, CLI ergonomics, Agentic Studio UI, Git PR workflow, release governance.
   - **\`qa_lead\`**: Deterministic quality, mandatory Devil's Advocate / Red-Teamer in Roundtables, Gatekeeper runner, Self-Healing loop, Regex Diff Guard, War Room.
   - **\`ai_lead\`**: Two-tier prompt caching, anti-rot memory compaction, dynamic tool pruning, JIT MCP synthesis, FinOps cockpit.
   - **\`rnd_lead\`**: Continuous research & innovation, 1:1 interviews, consensus roundtables, Root Cause Analysis (5 Whys), RFC blueprints.
4. **Tech & Stack Specialists (Ring-1 — L2 Stack Specialists):**
${ring1SpecialistsList}
${ring2ExpertsSection}
6. **Leaf Engineers (L3 Subagents — \`enable_subagent_tools: false\`, \`enable_write_tools: true\`):**
   - Atomic TDD executors: modify exclusively the files authorized by the assigned ticket, respect the Regex Diff Guard, and close sessions with 100% green tests.

### 📊 Deterministic RACI Matrix by Lifecycle Phase
- \`ANOMALY_RCA\`: **A:** Lead Orchestrator | **R:** \`rnd_lead\` + Ring-2 Domain Experts | **C:** \`qa_lead\` (Devil's Advocate), \`engineering_lead\` | **I:** Project Lead
- \`RND_ROUNDTABLE\`: **A:** Lead Orchestrator | **R:** \`rnd_lead\`, \`engineering_lead\`, Ring-2 Experts | **C:** \`qa_lead\` (Red-Team), \`product_lead\`, \`ai_lead\` | **I:** Project Lead
- \`SPIKE_VALIDATION\`: **A:** Lead Orchestrator | **R:** Domain Lead + \`rnd_lead\` | **C:** Other L2 Leads | **I:** Project Lead
- \`BACKLOG_REFINEMENT\`: **A:** \`product_lead\` | **R:** \`product_lead\`, Domain Leads | **C:** \`engineering_lead\`, \`qa_lead\`, \`ai_lead\` | **I:** Lead Orchestrator, Project Lead
- \`CODE_IMPLEMENTATION\`: **A:** \`engineering_lead\` / L2 Domain Lead | **R:** \`leaf_developer\` | **C:** \`ai_lead\`, \`product_lead\` | **I:** \`qa_lead\`, Lead Orchestrator
- \`GATEKEEPER_VERIFICATION\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` (Gatekeeper) | **C:** L2 Domain Lead, Ring-2 Experts | **I:** Lead Orchestrator, \`product_lead\`
- \`SELF_HEALING\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` + \`leaf_developer\` | **C:** \`engineering_lead\`, \`ai_lead\` | **I:** Lead Orchestrator
- \`SECURITY_AUDIT\`: **A:** \`qa_lead\` | **R:** \`qa_lead\` (Secret Guard/Auditor) | **C:** \`engineering_lead\`, \`backend_manager\` | **I:** Lead Orchestrator, Project Lead
- \`FINOPS_GOVERNANCE\`: **A:** \`ai_lead\` | **R:** \`ai_lead\` (Watchdog/FinOps) | **C:** \`product_lead\`, \`engineering_lead\` | **I:** Lead Orchestrator, Project Lead
- \`RELEASE_APPROVAL\`: **A:** Project Lead | **R:** Lead Orchestrator, \`product_lead\`, \`qa_lead\` | **C:** \`engineering_lead\`, \`ai_lead\`, \`rnd_lead\` | **I:** All

### 🛠️ The 4 Modular Operational Skills (\`.agents/skills/\`)
- [\`/run-company\`](file:///.agents/skills/run-company/SKILL.md) (\`MODE_1_STANDUP\`): 3-option session greeting, \`docs/CEO_Dashboard.md\` sync, and Tri-Ring alignment.
- [\`/investigate-anomaly\`](file:///.agents/skills/investigate-anomaly/SKILL.md) (\`MODE_2_INVESTIGATE_RCA\`): Stop-the-Line Read-Only, 5 Whys, and \`rnd_lead\` + Ring-2 Experts + Devil's Advocate consultation.
- [\`/rnd-roundtable\`](file:///.agents/skills/rnd-roundtable/SKILL.md) (\`MODE_3_RND_ROUNDTABLE\`): 2-round consensus roundtable, Symptom-to-Principle abstraction, and Executive Pitch.
- [\`/gatekeeper-audit\`](file:///.agents/skills/gatekeeper-audit/SKILL.md) (\`MODE_4_BUILD_GATEKEEPER\`): Cognitive Forcing Gate verification, L3 delegation, invariant checks, and hermetic tests.

---

## 1. Detected Technology Stack
- **Workspace**: \`${projectName}\`
- **Languages**: ${stack.languages.length > 0 ? stack.languages.join(", ") : "None detected"}
- **Frameworks**: ${stack.frameworks.length > 0 ? stack.frameworks.join(", ") : "None detected"}
- **Docker Support**: ${stack.hasDocker ? "Present (Dockerfile or compose)" : "Not detected"}
- **Package Managers**: ${stack.packageManagers.length > 0 ? stack.packageManagers.join(", ") : "None detected"}
- **Detected Test Commands**: ${stack.testCommands.length > 0 ? stack.testCommands.map((c) => `\`${c}\``).join(", ") : "None configured"}

---

## 2. Multi-Agent Organization Chart

\`\`\`mermaid
graph TD
${ring0Nodes}
${mermaidNodes}${ring2MermaidNodes ? `\n${ring2MermaidNodes}` : ""}
\`\`\`

---

## 3. Assigned Role Matrix

| Role ID | Role Name | Level | Target Stack | Recommended Test Command | Subagents | File Edits |
|---|---|---|---|---|---|---|
${rolesTableRows}

---

## 4. Core Principle: Karpathy Context as RAM

The cognitive architecture of all agents operating in this workspace strictly follows the **Karpathy Context as RAM** principle:

1. **Context Window as RAM**: the LLM context window is finite, volatile working memory (RAM), while the local repository filesystem represents persistent secondary storage (Disk).
2. **Pointers & Indices**: to navigate the architecture, conventions, and contracts, always consult the centralized documentation starting from \`docs/wiki/INDEX.md\`.
3. **Atomic Inspection**: never dump entire directory trees or unrelated files into context. Load only the code slices and atomic contracts required for the active ticket.
4. **Surgical Delegation**: L2 Domain Leads decompose initiatives into atomic tasks assigned to L3 Leaf Engineers, keeping each agent's context focused on its execution scope.
5. **Memory Release**: upon completing each execution or verification phase, release transient details and retain only the structured Gatekeeper report.

---

## 5. Deterministic Gatekeeper & Quality Protocol

No change, feature, or refactoring is ready for merge without empirical validation by the **Deterministic Gatekeeper**:

1. **Compilation & Type Checking**: zero errors across compilers and static type checkers (e.g. \`tsc --noEmit\`, Swift strict typing, mypy/Pydantic).
2. **Automated Test Suite**: 100% of automated tests must pass (zero failures, zero regressions).
3. **Recommended Test Commands by Domain**:
${testCommandsSummary || "- No specific command configured."}
4. **Zero Hallucinations**: never assume unverified behavior; rely exclusively on deterministic command outputs and source files.

---

## 6. Operational Directives & Role System Prompts

${rolesDirectives}
`;
}
/**
 * Genera la configurazione del team aziendale in base allo stack tecnologico rilevato.
 * Rispetta rigorosamente TeamConfigurationSchema in src/contracts/roles.ts.
 */
export async function generateTeamConfiguration(stack, orgChart) {
    const normalizedLangs = new Set(stack.languages.map((l) => l.toLowerCase().trim()));
    const normalizedFrameworks = new Set(stack.frameworks.map((f) => f.toLowerCase().trim()));
    const roles = [];
    // 1. Mobile Lead (Swift / SwiftUI / iOS / macOS / KMP / Flutter)
    const isMobileSwift = normalizedLangs.has("swift") ||
        normalizedFrameworks.has("swiftui") ||
        normalizedFrameworks.has("uikit");
    const isKmp = normalizedFrameworks.has("kmp") ||
        (normalizedLangs.has("kotlin") && !normalizedFrameworks.has("spring"));
    const isFlutter = normalizedFrameworks.has("flutter") ||
        normalizedLangs.has("dart");
    if (isMobileSwift || isKmp || isFlutter) {
        const mobileLangs = stack.languages.filter((l) => ["swift", "kotlin", "dart"].includes(l.toLowerCase()));
        const targetLangs = mobileLangs.length > 0 ? mobileLangs : ["swift"];
        const mobileFws = stack.frameworks.filter((f) => ["swiftui", "uikit", "kmp", "flutter"].includes(f.toLowerCase()));
        const targetFws = mobileFws.length > 0 ? mobileFws : (isKmp ? ["kmp"] : (isFlutter ? ["flutter"] : ["swiftui"]));
        let testCmd = "swift test";
        if (isFlutter) {
            testCmd = "flutter test";
        }
        else if (isKmp) {
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
            description: "L2 Domain Lead responsible for mobile architecture (iOS/macOS Swift, Kotlin Multiplatform KMP, Flutter/Dart) with reactive patterns, memory management, and native quality standards.",
            systemPrompt: prompt,
            recommendedTestCommand: testCmd,
            targetLanguages: targetLangs,
            targetFrameworks: targetFws,
            enableSubagents: true,
            enableWriteTools: true,
        });
    }
    // 2. Backend Lead (Python / FastAPI / backend frameworks)
    const isPythonBackend = normalizedLangs.has("python") ||
        normalizedFrameworks.has("fastapi") ||
        normalizedFrameworks.has("flask") ||
        normalizedFrameworks.has("django");
    if (isPythonBackend) {
        const targetLangs = stack.languages.filter((l) => l.toLowerCase() === "python");
        const pythonLangs = targetLangs.length > 0 ? targetLangs : ["python"];
        const targetFws = stack.frameworks.filter((f) => ["fastapi", "flask", "django"].includes(f.toLowerCase()));
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
            description: "L2 Domain Lead responsible for Python/FastAPI backend services with async architecture, typed Pydantic validation, and dependency injection.",
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
    const hasReactOrFrontendFw = normalizedFrameworks.has("react") ||
        normalizedFrameworks.has("next.js") ||
        normalizedFrameworks.has("vue") ||
        normalizedFrameworks.has("angular") ||
        normalizedFrameworks.has("svelte") ||
        normalizedLangs.has("react");
    const isFrontendReact = hasReactOrFrontendFw && (hasTsOrJs || normalizedLangs.has("react"));
    if (isFrontendReact) {
        const targetLangs = stack.languages.filter((l) => ["typescript", "javascript"].includes(l.toLowerCase()));
        const tsJsLangs = targetLangs.length > 0 ? targetLangs : ["typescript"];
        const targetFws = stack.frameworks.filter((f) => ["react", "next.js", "vue", "angular", "svelte", "jest", "vitest", "nx"].includes(f.toLowerCase()));
        const frontendFws = targetFws.length > 0 ? targetFws : ["react"];
        const frontendTestCmd = stack.testCommands.find((c) => /pnpm test|yarn test|npm test|vitest|jest/.test(c)) ?? "npm test";
        const isAngular = frontendFws.some((f) => f.toLowerCase() === "angular");
        const prompt = buildFrontendManagerPrompt({
            targetLanguages: tsJsLangs,
            targetFrameworks: frontendFws,
            recommendedTestCommand: frontendTestCmd,
        });
        roles.push({
            id: "frontend_manager",
            name: "Frontend Engineering Lead",
            level: "L2",
            description: isAngular
                ? `L2 Domain Lead responsible for Angular/TypeScript architecture, Signals, Standalone Components, OnPush change detection, and ${frontendTestCmd} validation.`
                : `L2 Domain Lead responsible for TypeScript/Frontend UI architecture, component modularity, strict typing, and ${frontendTestCmd} validation.`,
            systemPrompt: prompt,
            recommendedTestCommand: frontendTestCmd,
            targetLanguages: tsJsLangs,
            targetFrameworks: frontendFws,
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
            description: "L2 Domain Lead responsible for Go service architecture with goroutine/channel concurrency, explicit error handling, and idiomatic package layout.",
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
            description: "L2 Domain Lead responsible for Rust systems architecture, borrow checker, zero unsafe, memory safety, and quality gates with cargo clippy.",
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
            description: "L2 Domain Lead responsible for overall engineering architecture, multi-stack technical coordination, software quality, and the Deterministic Gatekeeper.",
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
//# sourceMappingURL=roles.js.map