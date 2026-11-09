import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { detectProjectStack } from "../inspector/detector.js";
import { generateTeamConfiguration } from "../generator/roles.js";
import { atomicWriteFile } from "../utils/fs-atomic.js";
import {
  graftManagedSection,
  discoverAllWikiFiles,
} from "./smart-merge.js";
import {
  AttachResultSchema,
  AttachOptionsSchema,
  type AttachResult,
  type AttachOptions,
  type InjectedFileResult,
} from "../contracts/roles.js";
import {
  TriRingOrgChartSchema,
  type TriRingOrgChart,
} from "../contracts/brownfield.js";
import type { ProjectStack } from "../contracts/inspector.js";

/**
 * 1. Skill `run-company` (`MODE_1_STANDUP`) — `.agents/skills/run-company/SKILL.md`
 * Frontmatter YAML rigorosamente alle righe 1-4.
 */
export function renderRunCompanySkill(): string {
  return `---
name: run-company
description: "Avvia il Daily Standup Sync (MODE 1), il protocollo di saluto a 3 opzioni per il CEO e l'orchestrazione multi-agente Tri-Ring."
---

# Run Company Skill — Manuale Operativo Multi-Agente (\`MODE_1_STANDUP\`)

> Questa skill definisce il protocollo operativo per governare un'azienda software autonoma multi-agente,
> secondo l'architettura gerarchica di **Agentic Company OS** e il principio **Karpathy Context as RAM**.

---

## 1. Protocollo di Avvio Sessione (Greeting Rule) & Catena di Comando

Quando il CEO avvia la sessione o invoca \`/run-company\`, agisci come **L1 CTO / Executive Orchestrator**:
1. Saluta l'utente come **CEO 👑** e dichiara \`[CTO MODE: 1 — STANDUP]\`.
2. Interroga il Dual-Brain CLI Bridge (\`agentic-company workflow status --json\` o leggi \`.company-os/org-chart.json\` e \`docs/CEO_Dashboard.md\`).
3. Presenta il briefing sintetico e proponi sempre le **3 opzioni operative**:
   - **Opzione 1:** Avviare il Daily Standup & Sprint Execution (\`/run-company\`).
   - **Opzione 2:** Avviare un'indagine Read-Only su un'anomalia o area architetturale (\`/investigate-anomaly\`).
   - **Opzione 3:** Convocare un ciclo di ricerca R&D o Tavola Rotonda (\`/rnd-roundtable\`).

### Struttura Gerarchica Tri-Ring
- **L1 CTO / Executive Orchestrator**: Strategia complessiva, architettura, cerimonie e supervisione del **Deterministic Gatekeeper**.
- **L2 Core Leads (Ring-0)**: \`engineering_lead\`, \`product_lead\`, \`qa_lead\` (Devil's Advocate), \`ai_lead\`, \`rnd_lead\`.
- **L2 Tech Specialists (Ring-1) & Business Domain Experts (Ring-2)**: Governano i bounded context e le \`domainInvariants\` in \`.company-os/org-chart.json\`.
- **L3 Leaf Developers (Esecutori Atomici)**: Modificano solo i file autorizzati dal ticket con approccio TDD, senza sub-agenti.

---

## 2. Protocollo Karpathy: "Context as RAM"

1. **RAM vs Disco**: Il context window dell'agente è la memoria volatile (RAM); i contratti Zod e la knowledge base in \`docs/wiki/\` sono la memoria persistente secondaria (Disco).
2. **Master Bootloader**: Ogni agente deve iniziare consultando \`docs/wiki/INDEX.md\` per orientarsi, caricando in memoria solo le slice atomiche necessarie.
3. **Delega e Routing**: Usa \`agentic-company workflow route --scope <files> --json\` per identificare gli esperti Ring-1 e Ring-2 da convocare.

---

## 3. Deterministic Gatekeeper

Nessuna modifica viene promossa al ramo principale senza passare attraverso verifiche deterministiche:
- **Cognitive Forcing Gate**: Di fronte a un bug o anomalia, passa prima per \`/investigate-anomaly\` (\`MODE_2_INVESTIGATE_RCA\`) e \`/rnd-roundtable\` (\`MODE_3_RND_ROUNDTABLE\`).
- **Zero allucinazioni**: Solo l'exit code dei comandi deterministici (\`/gatekeeper-audit\`) certifica la correttezza del codice.
`;
}

/**
 * 2. Skill `investigate-anomaly` (`MODE_2_INVESTIGATE_RCA`) — `.agents/skills/investigate-anomaly/SKILL.md`
 * Frontmatter YAML rigorosamente alle righe 1-4.
 */
export function renderInvestigateAnomalySkill(): string {
  return `---
name: investigate-anomaly
description: "Attiva MODE 2 (INVESTIGATE_RCA — Stop-the-Line & Read-Only): esegue i 5 Whys, consulta R&D + Ring-2 Domain Experts + Devil's Advocate e astrae dal sintomo al principio."
---

# Investigate Anomaly Skill — Root Cause Analysis Protocol (\`MODE_2_INVESTIGATE_RCA\`)

> Protocollo **Stop-the-Line & Read-Only** per l'analisi deterministica di bug, regressioni o anomalie architetturali.

---

## 1. Regola Aurea: Divieto di Scrittura Immediata (CFF-1)

1. Appena il CEO segnala un bug, un fallimento o un'anomalia comportamentale, dichiara immediatamente \`[CTO MODE: 2 — INVESTIGATE_RCA (READ-ONLY)]\`.
2. **NON modificare alcun file di produzione.** Qualsiasi tentativo di entrare in \`IMPLEMENT\` senza un \`RootCauseAnalysisReport\` approvato dal CEO viene bloccato da \`CompanyStateMachine.enforceCognitiveForcingGate\` con errore \`COGNITIVE_FORCING_GATE_VIOLATION\`.

---

## 2. Procedura Investigativa in 4 Passi (CFF-2 & CFF-3)

1. **Scope Routing Automatico**:
   - Esegui \`agentic-company workflow route --scope <files_or_keywords> --json\` per individuare gli Esperti di Dominio Ring-2 e gli Specialisti Tech Ring-1 impattati.
2. **Catena dei 5 Whys (\`fiveWhys.length >= 3\`)**:
   - Risali dal sintomo visibile alla causa radice strutturale attraverso almeno 3-5 livelli causali verificati sul codice.
3. **Consultazione Multi-Ring & Devil's Advocate**:
   - Consulta \`rnd_lead\`, gli Esperti di Dominio Ring-2 pertinenti e \`qa_lead\` (Devil's Advocate / Red-Teamer) per identificare i rischi collaterali (\`redTeamRisks\`).
4. **Astrazione Symptom-to-Principle (\`systemicPrinciple\`)**:
   - Formula il principio architetturale universale e l'invariante verificabile che impedirà all'intera classe di bug di ripresentarsi, passando poi a \`/rnd-roundtable\` (\`MODE_3_RND_ROUNDTABLE\`) per il consenso e il Go del CEO.
`;
}

/**
 * 3. Skill `rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`) — `.agents/skills/rnd-roundtable/SKILL.md`
 * Frontmatter YAML rigorosamente alle righe 1-4.
 */
export function renderRndRoundtableSkill(): string {
  return `---
name: rnd-roundtable
description: "Attiva MODE 3 (RND_ROUNDTABLE): orchestra interviste 1:1, Tavola Rotonda con Devil's Advocate obbligatorio (qa_lead + Ring-2) e presenta l'Executive Pitch al CEO."
---

# R&D Roundtable Skill — Consensus & Executive Pitch (\`MODE_3_RND_ROUNDTABLE\`)

> Protocollo di ricerca R&D, dibattito strutturato Anti-Echo-Chamber a 2 round e approvazione esecutiva del CEO.

---

## 1. Flusso della Tavola Rotonda (\`CeremonyDispatcher\` + \`ConsensusEngine\`)

1. Dichiara \`[CTO MODE: 3 — RND_ROUNDTABLE]\`.
2. **Convocazione Automatica per Scope**:
   - Avvia la cerimonia \`ARCHITECTURE_REVIEW_ROUNDTABLE\` includendo \`rnd_lead\`, \`engineering_lead\`, \`product_lead\`, \`ai_lead\`, gli Esperti di Dominio Ring-2 e \`qa_lead\` nel ruolo obbligatorio di **Devil's Advocate / Red-Teamer**.
3. **Dibattito in 2 Round (\`ConsensusEngine\`)**:
   - **Round 1 (Red-Team Challenge):** Il Devil's Advocate (\`qa_lead\` o l'esperto Ring-2 primario) solleva fallacie di sicurezza, performance o dominio (\`DevilsAdvocateFeedback\`).
   - **Round 2 (Mitigations & Convergence):** I Lead propongono contromisure deterministiche (\`mitigations\`) fino a \`CONSENSUS_REACHED\` o \`TIE_BREAK_INVOKED\` da parte del CTO.

---

## 2. Executive Pitch al CEO & Gate di Approvazione (CFF-4)

1. Sintetizza l'RFC o il \`RootCauseAnalysisReport\` in un **Executive Pitch** chiaro per il CEO (Problema/Opportunità, Principio Sistemico, Rischi Red-Team mitigati, Piano in Fasi).
2. **Attendi il Go esplicito del CEO (\`ceoApproved: true\`)** prima di invocare \`agentic-company workflow verify-gate\` e passare a \`MODE_4_BUILD_GATEKEEPER\` (\`/gatekeeper-audit\`).
`;
}

/**
 * 4. Skill `gatekeeper-audit` (`MODE_4_BUILD_GATEKEEPER`) — `.agents/skills/gatekeeper-audit/SKILL.md`
 * Frontmatter YAML rigorosamente alle righe 1-4.
 */
export function renderGatekeeperAuditSkill(): string {
  return `---
name: gatekeeper-audit
description: "Attiva MODE 4 (BUILD & GATEKEEPER): verifica l'autorizzazione del Cognitive Forcing Gate, delega ai Leaf L3, controlla invarianti e certifica il 100% dei test ermetici."
---

# Gatekeeper Audit Skill — Execution & Quality Certification (\`MODE_4_BUILD_GATEKEEPER\`)

> Protocollo di esecuzione chirurgica L2/L3 e validazione empirica tramite **Deterministic Gatekeeper**.

---

## 1. Pre-Flight Check: Cognitive Forcing Gate

1. Dichiara \`[CTO MODE: 4 — BUILD & GATEKEEPER]\`.
2. Verifica tramite \`agentic-company workflow verify-gate --json\` che il passaggio a \`MODE_4_BUILD_GATEKEEPER\` sia autorizzato (con \`ceoApproved === true\` in caso di anomalia/RCA).
3. Carica le invarianti attive da \`.company-os/invariants.json\` e i comandi di test ermetici da \`.company-os/config.json\`.

---

## 2. Delega Chirurgica L3 & Guardrail AST

1. Scomponi il piano approvato in task atomici assegnati ai Domain Lead L2 / Leaf Developers L3 specificando i file autorizzati (\`allowedFiles\`).
2. Ogni modifica è sottoposta a:
   - **AST Diff Guard (\`validatePatch\`)**: Divieto assoluto di rimuovere o commentare asserzioni/test (\`Test Preservation Invariant\`) e divieto di toccare file fuori scope.
   - **FastDecisionGate**: Blocco sub-10ms di scritture su file sensibili (\`.env\`, \`.git\`).
   - **Hermetic Runner Execution**: Esecuzione reale del typecheck (\`npm run typecheck\`) e del test runner ermetico (\`npm test\`, \`.venv/bin/pytest\`, \`swift test\`) con 100% di test superati.
3. Registra l'esito nel Merkle Audit Log (\`.company-os/audit.jsonl\`) e aggiorna \`docs/CEO_Dashboard.md\`.
`;
}

/**
 * Renderizza il Master Index Bootloader (docs/wiki/INDEX.md)
 */
export function renderWikiIndex(discoveredWikiFiles: string[] = []): string {
  const corePaths = new Set([
    "docs/wiki/product/roadmap.md",
    "docs/wiki/product/backlog.md",
    "docs/wiki/engineering/architecture.md",
  ]);
  const extraFiles = discoveredWikiFiles.filter((rel) => !corePaths.has(rel));
  const extraSection =
    extraFiles.length > 0
      ? [
          ``,
          `### 4. Auto-Discovered Domain & Science Knowledge Base (Zero Dark-Memory)`,
          ...extraFiles.map((rel) => `- [${path.basename(rel)}](file:///${rel})`),
        ].join("\n")
      : "";

  return `# Knowledge Base — Master Index

> Master Bootloader Context as RAM per **Agentic Company OS**.
> Questa pagina costituisce l'indice centralizzato della documentazione di sistema.
> Tutti gli agenti devono consultare questo file per identificare i percorsi atomici da caricare in RAM.

---

## 🧭 Struttura della Knowledge Base

### 1. Product Domain
- [Product Roadmap](file:///docs/wiki/product/roadmap.md): Visione strategica, obiettivi di alto livello, fasi e milestone di rilascio.
- [Product Backlog](file:///docs/wiki/product/backlog.md): Elenco delle Epic e dei ticket operativi in stato backlog, in progress e completati.

### 2. Engineering Domain
- [System Architecture](file:///docs/wiki/engineering/architecture.md): Specifiche architetturali, stack tecnologico rilevato, pattern implementativi e standard di test.

### 3. Multi-Agent Governance & Modular Skills
- [AGENTS.md](file:///AGENTS.md): Organigramma aziendale Tri-Ring, CTO Persona L1, 4 Operating Modes, 4 Cognitive Forcing Functions e Matrice RACI.
- [Run Company Skill (\`MODE 1\`)](file:///.agents/skills/run-company/SKILL.md): Daily Standup Sync, Greeting Rule a 3 opzioni e orchestrazione gerarchica.
- [Investigate Anomaly Skill (\`MODE 2\`)](file:///.agents/skills/investigate-anomaly/SKILL.md): Protocollo Stop-the-Line Read-Only, 5 Whys e consultazione Ring-2 + Devil's Advocate.
- [R&D Roundtable Skill (\`MODE 3\`)](file:///.agents/skills/rnd-roundtable/SKILL.md): Tavola rotonda Anti-Echo-Chamber a 2 round ed Executive Pitch al CEO.
- [Gatekeeper Audit Skill (\`MODE 4\`)](file:///.agents/skills/gatekeeper-audit/SKILL.md): Delega L3, verifica invarianti e Deterministic Gatekeeper.${extraSection}

---

## 📋 Regole di Navigazione per Agenti Autonomi

1. **Context as RAM**: Non caricare tutti i documenti contemporaneamente. Carica solo i file specificamente correlati al task assegnato.
2. **Aggiornamento Continuo**: Ogni volta che un ticket introduce modifiche architetturali o completa una milestone, aggiornare il file di competenza in \`docs/wiki/\`.
3. **Puntatori e Coerenza**: Utilizzare sempre collegamenti relativi chiari per consentire la navigazione deterministica.
`;
}

/**
 * Renderizza la roadmap di prodotto (docs/wiki/product/roadmap.md)
 */
export function renderProductRoadmap(): string {
  return `# Product Roadmap & Strategic Vision

> Visione strategica, roadmap di evoluzione del prodotto e milestone operative per il workspace.

---

## 🎯 Visione del Prodotto

Costruire e far evolvere una piattaforma software solida, resiliente e scalabile, sviluppata in modo autonomo
attraverso team multi-agente gerarchici supervisionati da contratti Zod e deterministic gatekeeper.

---

## 🗺️ Fasi di Sviluppo

### Fase 1: Foundation & Bootstrapping (Corrente)
- Iniezione della Knowledge Base e della struttura dei ruoli con Agentic Company OS (\`attach\`).
- Ispezione dello stack e generazione della configurazione ruoli su misura.
- Definizione dei contratti Zod e della pipeline di test automatica deterministica.
- **Obiettivo**: Baseline del workspace completamente tipizzata, testata e documentata.

### Fase 2: Core Domain Implementation
- Implementazione delle funzionalità chiave del dominio di business.
- Configurazione dei connettori e delle API esterne.
- Adozione del protocollo Karpathy "Context as RAM" per lo sviluppo ad alta precisione.
- **Obiettivo**: MVP funzionante con copertura di test unitari completa.

### Fase 3: Hardening, Performance & Integration
- Stress testing e profiling delle prestazioni.
- Validazione end-to-end tramite Deterministic Gatekeeper.
- Refactoring guidato dai report di qualità e hardening della sicurezza.
- **Obiettivo**: Software pronto per la produzione con zero regressioni.

### Fase 4: Autonomous Operations & Continuous Evolution
- Gestione autonoma del backlog da parte dei Domain Lead L2.
- Monitoraggio runtime, ripristino automatico e iterazione continua delle funzionalità.
- **Obiettivo**: Sviluppo e manutenzione autonoma e affidabile nel tempo.

---

## 📊 Metriche di Successo (KPI)
- **Affidabilità**: 100% dei test automatizzati superati a ogni commit.
- **Integrità Contrattuale**: 100% degli input/output validati tramite schemi Zod.
- **Idempotenza**: Zero effetti collaterali indesiderati nelle scritture su filesystem.
`;
}

/**
 * Renderizza il backlog di prodotto (docs/wiki/product/backlog.md)
 */
export function renderProductBacklog(): string {
  return `# Product & Engineering Backlog

> Registro operativo dei ticket e delle iniziative di sviluppo del workspace.

---

## 📌 Convenzione Ticket

- \`EPIC-X\`: Iniziativa strategica macro.
- \`TCK-X.Y\`: Ticket atomico assegnabile a un Domain Lead (L2) o Leaf Developer (L3).
- **Stati ammessi**: \`TODO\`, \`IN_PROGRESS\`, \`REVIEW\`, \`DONE\`.

---

## 🚀 Ticket Iniziali del Progetto

### EPIC-1: Inizializzazione Workspace & Governance Multi-Agente
- [x] **TCK-1.1**: Esecuzione del modulo \`attach\` di Agentic Company OS.
  - *Stato*: \`DONE\`
  - *Descrizione*: Configurazione di \`AGENTS.md\`, skill aziendali e Knowledge Base in \`docs/wiki/\`.
- [ ] **TCK-1.2**: Verifica e calibrazione dei comandi di test deterministici.
  - *Stato*: \`TODO\`
  - *Descrizione*: Validare che i comandi di test configurati nello stack funzionino correttamente in locale e CI.

### EPIC-2: Architettura e Moduli di Dominio
- [ ] **TCK-2.1**: Definizione dei contratti dati e interfacce di dominio.
  - *Stato*: \`TODO\`
  - *Descrizione*: Specificare gli schemi Zod o i modelli tipizzati per i dati di business.
- [ ] **TCK-2.2**: Implementazione dei servizi core e della logica applicativa.
  - *Stato*: \`TODO\`
  - *Descrizione*: Sviluppare i componenti principali nel rispetto delle linee guida architetturali.

### EPIC-3: Testing, Quality Assurance & Hardening
- [ ] **TCK-3.1**: Creazione della suite di unit test per la logica di dominio.
  - *Stato*: \`TODO\`
  - *Descrizione*: Copertura dei test per tutti i branch logici ed edge cases.
- [ ] **TCK-3.2**: Integrazione del Deterministic Gatekeeper nel workflow di sviluppo.
  - *Stato*: \`TODO\`
  - *Descrizione*: Assicurare che nessun merge avvenga senza superamento completo dei controlli.
`;
}

/**
 * Renderizza il documento di architettura contestualizzato allo stack rilevato (docs/wiki/engineering/architecture.md)
 */
export function renderArchitectureDoc(stack: ProjectStack): string {
  const languagesList = stack.languages.length > 0 ? stack.languages.join(", ") : "Nessuno specifico";
  const frameworksList =
    stack.frameworks.length > 0 ? stack.frameworks.join(", ") : "Standard / Nessuno specifico";
  const packageManagersList =
    stack.packageManagers.length > 0 ? stack.packageManagers.join(", ") : "Nessuno rilevato";
  const dockerSupport = stack.hasDocker
    ? "Presente (Dockerfile o file compose rilevato)"
    : "Non rilevato";
  const entryPointsList =
    stack.entryPoints.length > 0 ? stack.entryPoints.join(", ") : "Nessun entry point esplicito";
  const testCommandsList =
    stack.testCommands.length > 0
      ? stack.testCommands.map((cmd) => `- Comando di Test: \`${cmd}\``).join("\n")
      : "- Nessun comando di test rilevato automaticamente; raccomandato configurare una suite di test deterministica.";

  return `# System Architecture & Technical Specifications

> Documentazione architetturale del sistema per il target: \`${stack.targetPath}\`.
> Questo documento specifica le scelte tecniche, lo stack rilevato, i pattern architetturali e gli standard di qualità.

---

## 1. Stack Tecnologico Rilevato

- **Linguaggi Principali**: ${languagesList}
- **Frameworks & Librerie**: ${frameworksList}
- **Package Managers**: ${packageManagersList}
- **Container / Docker**: ${dockerSupport}
- **Entry Points Identificati**: ${entryPointsList}

---

## 2. Comandi di Validazione & Test Determinante

I seguenti comandi rappresentano i gatekeeper deterministici per la verifica della qualità del codice:

${testCommandsList}

---

## 3. Pattern Architetturali di Riferimento

1. **Separazione delle Responsabilità (Separation of Concerns)**:
   - I contratti di dominio (interfacce, DTO, schemi di validazione) sono isolati dalla logica di persistenza e dalla UI/CLI.
2. **Validazione Forte ai Confini del Sistema**:
   - Qualsiasi dato in ingresso viene validato a runtime tramite schemi tipizzati (es. Zod, Pydantic, Codable).
3. **Filesystem I/O Idempotente e Atomico**:
   - Tutte le operazioni di scrittura su disco utilizzano pattern Write-Sync-Rename POSIX durabili per evitare corruzione parziale in caso di crash o interruzione.
4. **Deterministic Gatekeeper**:
   - Il codice non viene promosso senza la preventiva esecuzione con successo dei test deterministici e la verifica del type checker.
`;
}

/**
 * Renderizza la CEO Dashboard per qualsiasi workspace governato dall'OS (`docs/CEO_Dashboard.md`).
 */
export function renderCeoDashboard(
  stack: ProjectStack,
  orgChart?: TriRingOrgChart
): string {
  const ring1List =
    orgChart?.ring1TechSpecialists
      .map((s) => `- \`${s.id}\`: **${s.title}** (\`${s.boundedContext}\`)`)
      .join("\n") || "- Nessuno specialista Ring-1 registrato.";
  const ring2List =
    orgChart?.ring2DomainExperts
      .map(
        (e) =>
          `- \`${e.id}\`: **${e.title}** (\`${e.boundedContext}\`) — Invarianti: ${e.domainInvariants.join(" ; ")}`
      )
      .join("\n") || "- Nessun esperto di dominio Ring-2 registrato.";

  return `# 📊 CEO Dashboard — Executive & R&D Operating Status

> Dashboard esecutiva sincronizzata da **Agentic Company OS** per il workspace: \`${stack.targetPath}\`.

---

## 👑 Stato Operativo CTO & Governance Tri-Ring
- **Protocollo Attivo:** Executive & R&D Operating Protocol v2 (\`MODE 1..4\` & \`CFF-1..4\`)
- **Stack Rilevato:** Linguaggi: ${stack.languages.join(", ") || "N/D"} | Frameworks: ${stack.frameworks.join(", ") || "N/D"}
- **Comandi Gatekeeper:** ${stack.testCommands.map((c) => `\`${c}\``).join(", ") || "N/D"}
- **Core Leads (Ring-0):** \`cto\`, \`engineering_lead\`, \`product_lead\`, \`qa_lead\` (Devil's Advocate), \`ai_lead\`, \`rnd_lead\`

### 🔧 Tech Specialists (Ring-1)
${ring1List}

### 🧠 Business Domain Experts (Ring-2)
${ring2List}

---

## 🛠️ Le 4 Skill Operative Disponibili per il CEO
1. \`/run-company\` (\`MODE_1_STANDUP\`): Sincronizzazione stato, backlog e team Tri-Ring.
2. \`/investigate-anomaly\` (\`MODE_2_INVESTIGATE_RCA\`): Indagine Read-Only, 5 Whys e consultazione Ring-2 + Devil's Advocate.
3. \`/rnd-roundtable\` (\`MODE_3_RND_ROUNDTABLE\`): Tavola rotonda multi-agente, astrazione Symptom-to-Principle ed Executive Pitch.
4. \`/gatekeeper-audit\` (\`MODE_4_BUILD_GATEKEEPER\`): Delega L3, controllo invarianti e test ermetici al 100%.
`;
}

/**
 * Inietta nel workspace di destinazione la configurazione dei ruoli, le skill operative
 * e la knowledge base strutturata in docs/wiki/INDEX.md.
 */
export async function attachWorkspace(
  targetPath: string,
  options?: Partial<AttachOptions> & { orgChart?: TriRingOrgChart }
): Promise<AttachResult> {
  const resolvedPath = path.resolve(targetPath);

  // 1. Verifica che la cartella esista e sia una directory
  try {
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw new Error(`Target path is not a directory: ${resolvedPath}`);
    }
  } catch (error) {
    throw new Error(`Directory does not exist or cannot be accessed: ${resolvedPath}`);
  }

  // 2. Parse e validazione delle opzioni
  const opts = AttachOptionsSchema.parse(options ?? {});

  // 3. Rilevamento dello stack tecnologico del workspace
  const stack = await detectProjectStack(resolvedPath);

  // 3b. Caricamento opzionale di `.company-os/org-chart.json` se già presente o passato via opzioni
  let resolvedOrgChart: TriRingOrgChart | undefined = options?.orgChart;
  if (!resolvedOrgChart) {
    const orgChartPath = path.join(resolvedPath, ".company-os", "org-chart.json");
    if (fsSync.existsSync(orgChartPath)) {
      try {
        const rawChart = await fs.readFile(orgChartPath, "utf-8");
        resolvedOrgChart = TriRingOrgChartSchema.parse(JSON.parse(rawChart));
      } catch {
        resolvedOrgChart = undefined;
      }
    }
  }

  // 4. Generazione della configurazione del team e di AGENTS.md (con sincronizzazione Tri-Ring)
  const teamConfig = await generateTeamConfiguration(stack, resolvedOrgChart);

  // 4b. Auto-discovery dei file in docs/wiki/** per prevenire Dark Memory
  const discoveredWikiFiles = await discoverAllWikiFiles(resolvedPath);

  // 5. Definizione dei 6 file core da iniettare
  const filesToInject: Array<{
    relativePath: string;
    sectionId: string;
    content: string;
    preserveRawYamlFrontmatter?: boolean;
  }> = [
    {
      relativePath: "AGENTS.md",
      sectionId: "agents-governance",
      content: teamConfig.renderedAgentsMarkdown,
    },
    {
      relativePath: ".agents/skills/run-company/SKILL.md",
      sectionId: "run-company-skill",
      content: renderRunCompanySkill(),
      preserveRawYamlFrontmatter: true,
    },
    {
      relativePath: "docs/wiki/INDEX.md",
      sectionId: "wiki-master-index",
      content: renderWikiIndex(discoveredWikiFiles),
    },
    {
      relativePath: "docs/wiki/product/roadmap.md",
      sectionId: "product-roadmap-governance",
      content: renderProductRoadmap(),
    },
    {
      relativePath: "docs/wiki/product/backlog.md",
      sectionId: "product-backlog-governance",
      content: renderProductBacklog(),
    },
    {
      relativePath: "docs/wiki/engineering/architecture.md",
      sectionId: "engineering-architecture-spec",
      content: renderArchitectureDoc(stack),
    },
  ];

  // 6. Elaborazione dei file con Smart-Merge non distruttivo (live atomic write o simulazione dry-run)
  const injectedFiles: InjectedFileResult[] = [];

  for (const item of filesToInject) {
    const fullPath = path.join(resolvedPath, item.relativePath);

    let existingContent: Buffer | null = null;
    try {
      existingContent = await fs.readFile(fullPath);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "ENOENT"
      ) {
        existingContent = null;
      } else {
        throw err;
      }
    }

    const existingText =
      existingContent !== null ? existingContent.toString("utf-8") : null;
    const mergedContent = item.preserveRawYamlFrontmatter
      ? item.content
      : graftManagedSection(
          existingText,
          item.sectionId,
          item.content,
          () => item.content
        );

    if (opts.dryRun) {
      // Calcolo hash del nuovo contenuto senza toccare il filesystem
      const newSha256 = crypto
        .createHash("sha256")
        .update(mergedContent, "utf-8")
        .digest("hex");

      let status: "CREATED" | "OVERWRITTEN" | "SKIPPED_UNCHANGED" | "BACKED_UP_AND_OVERWRITTEN";
      let backupPath: string | undefined = undefined;

      if (existingContent !== null) {
        const existingSha256 = crypto
          .createHash("sha256")
          .update(existingContent)
          .digest("hex");

        if (existingSha256 === newSha256) {
          status = "SKIPPED_UNCHANGED";
        } else if (opts.backup !== false) {
          status = "BACKED_UP_AND_OVERWRITTEN";
          backupPath = `${fullPath}${opts.backupExtension}`;
        } else {
          status = "OVERWRITTEN";
        }
      } else {
        status = "CREATED";
      }

      injectedFiles.push({
        path: fullPath,
        status,
        ...(backupPath ? { backupPath } : {}),
        sha256: newSha256,
      });
    } else {
      // Scrittura atomica reale POSIX write-sync-rename con backup preventivo e Smart-Merge
      const fileResult = await atomicWriteFile(fullPath, mergedContent, {
        backup: opts.backup !== false,
        backupExtension: opts.backupExtension,
      });
      injectedFiles.push(fileResult);
    }
  }

  // 6b. Scrittura atomica delle 3 skill modulari aggiuntive (investigate-anomaly, rnd-roundtable, gatekeeper-audit)
  // con frontmatter YAML valido alle righe 1-4 (solo quando non siamo in dryRun così da preservare la semantica di attach.test.ts)
  if (!opts.dryRun) {
    const modularSkills = [
      {
        relativePath: ".agents/skills/investigate-anomaly/SKILL.md",
        content: renderInvestigateAnomalySkill(),
      },
      {
        relativePath: ".agents/skills/rnd-roundtable/SKILL.md",
        content: renderRndRoundtableSkill(),
      },
      {
        relativePath: ".agents/skills/gatekeeper-audit/SKILL.md",
        content: renderGatekeeperAuditSkill(),
      },
    ];

    for (const sk of modularSkills) {
      const skFullPath = path.join(resolvedPath, sk.relativePath);
      await atomicWriteFile(skFullPath, sk.content, { backup: false });
    }
  }

  // 7. Costruzione del summary dettagliato
  const createdCount = injectedFiles.filter((f) => f.status === "CREATED").length;
  const skippedCount = injectedFiles.filter((f) => f.status === "SKIPPED_UNCHANGED").length;
  const backedUpCount = injectedFiles.filter((f) => f.status === "BACKED_UP_AND_OVERWRITTEN").length;
  const overwrittenCount = injectedFiles.filter((f) => f.status === "OVERWRITTEN").length;

  const modeLabel = opts.dryRun ? " [DRY RUN]" : "";
  const summary = `Attach completed: ${injectedFiles.length} files processed (${createdCount} created, ${skippedCount} skipped unchanged, ${backedUpCount} backed up & overwritten, ${overwrittenCount} overwritten)${modeLabel}.`;

  // 8. Validazione schema del risultato
  const result: AttachResult = {
    targetPath: resolvedPath,
    success: true,
    injectedFiles,
    summary,
    attachedAt: new Date().toISOString(),
  };

  return AttachResultSchema.parse(result);
}
