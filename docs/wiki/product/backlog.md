# Backlog & Ticket Operativi — Agentic Company OS

Tutti i ticket devono rispettare lo schema Zod `ProductTicketSchema` (`src/contracts/product.ts`).

---

## 🏃 Sprint 1: Core Engine & Inspector (Completato ✅)

### 🎫 TCK-1.1: Project Inspector Module (Completato ✅)
- **Epica:** Epic 1 (Stack Detection)
- **Assegnato a:** Backend / Core Engineer
- **File target:** `src/inspector/detector.ts`
- **Obiettivo:** Creare la funzione asincrona `detectProjectStack(targetPath: string)` che scansiona una cartella ed estrae:
  - `languages`: `["typescript" | "python" | "swift" | "sql" | ...]`
  - `frameworks`: `["fastapi" | "swiftui" | "express" | ...]`
  - `hasDocker`: boolean
  - `detectedPackageManagers`: `["npm" | "pip" | "spm" | ...]`
  - `testCommand`: comando raccomandato per i test (es. `pytest`, `npm test`, `swift test`).
- **Criteri di accettazione:**
  - Nessun errore di compilazione TypeScript (`npm run typecheck`).
  - Restituisce una struttura tipizzata con Zod (`ProjectStackSchema`).
- **Esito:** Implementato e verificato con successo.

### 🎫 TCK-1.2: Test Unitari per l'Inspector (Completato ✅)
- **Epica:** Epic 1
- **Assegnato a:** QA / Testing Engineer
- **File target:** `tests/inspector.test.ts`
- **Obiettivo:** Testare `detectProjectStack` con mock di cartelle contenenti diversi manifest (`package.json`, `requirements.txt`, `Package.swift`).
- **Criteri di accettazione:** 100% test passati via `npm test`.
- **Esito:** 8/8 test passati con successo.

### 🎫 TCK-2.1: Deterministic Gatekeeper Runner (Completato ✅)
- **Epica:** Epic 2 (Gatekeeper)
- **Assegnato a:** Backend / DevOps Engineer
- **File target:** `src/gatekeeper/runner.ts`
- **Obiettivo:** Creare la funzione `runGatekeeper(targetPath: string, testCommands: string[])`:
  - Esegue i comandi tramite `node:child_process` (es. `exec` o `spawn`).
  - Cattura exit code e stdout/stderr.
  - Converte il risultato nell'oggetto `GatekeeperResultSchema` (`src/contracts/review.ts`).
- **Criteri di accettazione:** Validato con Zod, gestisce timeout ed errori di esecuzione.
- **Esito:** Implementato con suite `tests/gatekeeper.test.ts` (21/21 test passati con successo).

### 🎫 TCK-3.1: CLI Command `inspect` (Completato ✅)
- **Epica:** Epic 4 (CLI & Tools)
- **Assegnato a:** Frontend / CLI Engineer
- **File target:** `src/index.ts`
- **Obiettivo:** Aggiungere il comando `inspect <path>` che esegue `detectProjectStack` su un percorso dato e stampa a colori (via Chalk) il report dello stack rilevato.
- **Criteri di accettazione:** Eseguibile tramite `npx tsx src/index.ts inspect /Users/stequar/fitness_project`.
- **Esito:** Integrato con flag `--json`, formattazione Chalk e suite `tests/cli.test.ts` (3/3 test passati).

---

## 🏃 Sprint 1.5: Pre-Sprint Tech Validation Framework (Completato ✅)

### 🎫 TCK-1.5.1: Contratto Zod TechValidationReportSchema
- **Epica:** Governance & Core
- **File target:** `src/contracts/research.ts`
- **Esito:** Completato con schema Zod validante strumenti, best practice, rischi, mitigazioni e verdetto.

### 🎫 TCK-1.5.2: Protocollo Operativo Spike & Aggiornamento State Machine
- **File target:** `docs/wiki/engineering/tech-validation-protocol.md`, `src/core/types.ts`, `src/core/state-machine.ts`
- **Esito:** Aggiunto stato `TECH_VALIDATION` e test unitari passati al 100%.

---

## 🏃 Sprint 2: Dynamic Role & Team Generator + Workspace Attach (Completato ✅)

### 🎫 TCK-2.0: Tech Validation Spike (Sprint 2) (Completato ✅)
- **Epica:** Epic 3 & Epic 4
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **Obiettivo:** Condurre ricerca web approfondita su:
  1. Tecniche moderne di generazione di prompt/ruoli (template literals tipizzati TS vs Handlebars/Mustache vs EJS: pro/contro, sicurezza, footprint).
  2. Best practice per CLI workspace scaffolding/injection (idempotenza, gestione file esistenti, backup di sicurezza `.bak`, permissioning).
  3. Formato e struttura di `AGENTS.md` per sub-agenti specializzati (es. Swift MVVM Lead vs FastAPI Backend Lead).
- **Deliverable:** `docs/wiki/engineering/spikes/sprint-2-validation.md` conforme a `TechValidationReportSchema`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Scelta architetturale: TypeScript Typed Template Literals, pattern atomico POSIX Write-Sync-Rename con backup `.bak` e SHA-256, System Prompt minimali a Kernel conforme a Karpathy "Context as RAM".

### 🎫 TCK-2.1: Dynamic Role & Subagent Generator Module (Completato ✅)
- **Epica:** Epic 3
- **Assegnato a:** Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/generator/roles.ts`, `src/generator/templates/core-kernel.ts`, `src/generator/templates/roles-prompts.ts`
- **Obiettivo:** Dato un `ProjectStack`, generare dinamicamente le configurazioni dei Domain Lead e i prompt specializzati conformi a `TeamConfigurationSchema`.
- **Criteri di accettazione:**
  - Supporto per stack iOS Swift/SwiftUI (`mobile_manager`), Python/FastAPI (`backend_manager`), TypeScript/React (`frontend_manager`), e fallback generico (`lead_engineer`).
  - Supporto progetti poliglotti (es. Swift + Python + Docker).
  - Generazione di `AGENTS.md` strutturato con diagramma Mermaid, tabella ruoli, prompt operativi e Deterministic Gatekeeper.
  - Suite di unit test completa in `tests/roles-generator.test.ts` (19/19 superati).
- **Esito:** Implementato e verificato con successo.

### 🎫 TCK-2.2: Workspace Attach & Safe Atomic Module (Completato ✅)
- **Epica:** Epic 4
- **Assegnato a:** Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/utils/fs-atomic.ts`, `src/attach/injector.ts`, `src/index.ts`
- **Obiettivo:**
  - Primitive atomiche POSIX Write-Sync-Rename (`atomicWriteFile`) con durabilità garantita (`fileHandle.sync()`), sibling temporary file, backup preventivo (`.bak`) e idempotenza verificata con digest SHA-256.
  - Modulo `attachWorkspace` per iniettare l'harness di governance aziendale (`AGENTS.md`, `.agents/skills/run-company/SKILL.md`, `docs/wiki/INDEX.md`, roadmap, backlog, architettura).
  - Integrazione comando CLI `agentic-company attach <path>` con supporto `--json`, `--force`, `--dry-run` e output colorato Chalk.
  - Suite di test in `tests/fs-atomic.test.ts` (9/9), `tests/attach.test.ts` (5/5), e `tests/cli.test.ts` (7/7).
- **Esito:** Implementato, convalidato con 0 errori di typecheck e 74/74 test passati globalmente.

---

---

## 🏃 Sprint 3 / Sprint 17: Dogfooding Live Attach & Cross-Domain Contract Handshake (Completato ✅ — Sbloccato e Completato in Sprint 17)
*Nota Storica: Sospeso temporaneamente il 2026-10-16 per maturare l'OS e completato integralmente nello Sprint 17 (Fase 5) su `/Users/stequar/fitness_project`.*

### 🎫 TCK-3.0: Tech Validation Spike (Sprint 3 / Sprint 17) (Completato ✅)
- **Epica:** Enterprise Dogfooding & Multi-Repo Live Attach
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-3-validation.md`
- **Esito:** Completato e approvato (`APPROVED`). Validata l'architettura per Environment Doctor parallelo (`Promise.allSettled` con `execFile` e `AbortSignal.timeout(3000)`), sincronizzatore cross-domain Python Pydantic v2 (`ConfigDict(populate_by_name=True, from_attributes=True)`) $\leftrightarrow$ Swift 6 (`Codable, Sendable, Hashable, Identifiable` con `nonisolated private enum CodingKeys`) e attach idempotente POSIX.

---

## 🏃 Sprint 4: Universal Multi-Stack & Modular Plugin Core (ATTIVO ORA 🚀 — Ratificato da RFC-001)

### 🎫 TCK-4.0: Tech Validation Spike (Sprint 4) (Completato ✅)
- **Epica:** Open Source Core & Universal Engine
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-4-validation.md`
- **Obiettivo:** Ricerca web approfondita e validazione architetturale su:
  1. Pattern idiomatici di scaffolding per **Go** (`go.mod`, package structure, `go test ./...`), **Rust** (`Cargo.toml`, workspace crates, `cargo test`), **Kotlin Multiplatform** (`build.gradle.kts`, `gradlew test`), **Flutter** (`pubspec.yaml`, `flutter test`).
  2. Architettura di sandboxing per i Plugin: Node.js Worker Threads vs Process Isolation con timeout hardware a 3000ms e validazione Zod su I/O.
  3. Standard Model Context Protocol (MCP): integrazione del TypeScript SDK `@modelcontextprotocol/sdk` (Server & Client bivalente) con trasporto `stdio` e isolamento `stdout`/`stderr`.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e suite di test in `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts`. Sbloccate le fasi operative di BUILD (TCK-4.1, TCK-4.2, TCK-4.3, TCK-4.4).

### 🎫 TCK-4.1: Universal Multi-Stack Detector & Scaffolding Engine (Completato ✅)
- **Epica:** Universal Scaffolding Engine
- **Assegnato a:** Core / Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/inspector/detector.ts`, `src/generator/roles.ts`, `src/generator/templates/roles-prompts.ts`
- **Obiettivo:**
  - Estendere `detectProjectStack` per rilevare Go, Rust, KMP, Flutter oltre a Swift, Python, TS e Docker.
  - Generare dinamicamente i Domain Lead dedicati: `go_manager` (concorrenza goroutine/channel, idiomatic Go), `rust_manager` (borrow checker, zero-cost abstractions, safety), `mobile_manager` (KMP / Flutter).
- **Esito:** Implementato con successo. Supporto Go (`go.mod`, `go.sum`, `go test ./...`), Rust (`Cargo.toml`, `Cargo.lock`, `cargo test`), KMP (`build.gradle.kts`, `./gradlew test`), Flutter (`pubspec.yaml`, `flutter test`). Generati ruoli dinamici e prompt kernel.

### 🎫 TCK-4.2: Modular Plugin Architecture & Zod Plugin SDK (Completato ✅)
- **Epica:** Plugin Ecosystem
- **Assegnato a:** Architecture Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/plugins.ts`, `src/plugins/loader.ts`, `src/plugins/runner.ts`
- **Obiettivo:**
  - Definire il contratto Zod `AgenticPluginSchema` per consentire alla community di estendere l'OS con custom detector, custom role templates e custom gatekeeper.
  - Implementare il plugin loader con sandboxing su `Worker Threads` isolati e timeout di sicurezza.
- **Esito:** Implementato con successo. Validazione Zod di manifest ed IPC, sandboxing su `node:worker_threads` con `resourceLimits` (128MB heap) e hard timeout a 3000ms con `worker.terminate()`.

### 🎫 TCK-4.3: Model Context Protocol (MCP) Server & Client Bridge (Completato ✅)
- **Epica:** MCP Interoperability
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/mcp.ts`, `src/mcp/server.ts`, `src/mcp/client.ts`, `src/index.ts`
- **Obiettivo:**
  - Implementare un MCP Server per esporre le capability dell'OS (Gatekeeper, Doctor, Inspector) a client MCP esterni.
  - Implementare un MCP Client confinato per connettere server MCP di terze parti agli agenti dell'OS.
- **Esito:** Implementato con successo. MCP Server su trasporto `stdio` con stdout protetto e log su stderr; comando CLI `agentic-company mcp`; MCP Client Bridge con Lazy Tool Discovery per preservare il contesto RAM.

### 🎫 TCK-4.4: Test Suite Universal Engine, Plugins & MCP (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/universal-stack.test.ts`, `tests/plugins.test.ts`, `tests/mcp.test.ts`
- **Obiettivo:** Garantire il 100% di copertura e zero regressioni sui nuovi moduli.
- **Esito:** Implementate le tre suite di test. 108/108 test passati (100% successo su 13 test suite), 0 errori TypeScript in `npm run typecheck`.

---

## 🏃 Sprint 5: Autonomous Self-Healing Gatekeeper & Open-Source DevEx (ATTIVO ORA 🚀 — Ratificato da RFC-001)

### 🎫 TCK-5.0: Tech Validation Spike (Sprint 5) (Completato ✅)
- **Epica:** Autonomous Reliability & DevEx
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-5-validation.md`
- **Obiettivo:** Validazione architetturale e ricerca di mercato preventiva su:
  1. Diagnostic Parsers: parsing semantico delle emissioni di compilatori e test runner (`tsc`, `vitest`, `pytest`, `cargo`, `go test`) estraendo coordinate AST (`file`, `line`, `col`, `code`, `message`).
  2. Closed Loop Self-Healing: pattern di riparazione guidata a budget deterministico (max 3 iterazioni) e protocollo di rollback atomico in blocco `finally`.
  3. AST Diff Guard & Scope Enforcement: prevenzione delle allucinazioni (divieto di cancellazione di test case e divieto di modifica fuori dallo scope target del ticket).
  4. Interactive DevEx Wizard: benchmark `@clack/prompts` vs `inquirer` per onboarding rapido (<60s) e flag headless `--non-interactive`/`--json` per CI/CD.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e aggiornamento di `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts` (4/4 test passati). Sbloccate le fasi operative di BUILD (TCK-5.1 - TCK-5.5).

### 🎫 TCK-5.1: Structured Diagnostic Parsers & AST Coordinates Engine (Completato ✅)
- **Epica:** Self-Healing Gatekeeper
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/healing.ts`, `src/gatekeeper/parsers/` (`tsc.ts`, `vitest.ts`, `pytest.ts`, `cargo.ts`, `go.ts`, `index.ts`)
- **Obiettivo:**
  - Definire contratti Zod per coordinate diagnostiche (`DiagnosticViolationSchema`, `DiagnosticReportSchema`).
  - Implementare parser robusti per `tsc`, `vitest`/`jest`, `pytest`, `cargo` e `go test` con deduplicazione ed estrazione coordinate AST (`filePath`, `line`, `column`, `ruleOrCode`, `message`, `severity`).
- **Esito:** Implementato con successo e validato al 100% via Zod in `src/contracts/healing.ts` e `src/gatekeeper/parsers/index.ts`. Coperto da suite dedicata in `tests/diagnostic-parsers.test.ts`.

### 🎫 TCK-5.2: Autonomous Self-Healing Closed Loop Runner (Completato ✅)
- **Epica:** Self-Healing Gatekeeper
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/gatekeeper/self-healing.ts`
- **Obiettivo:**
  - Eseguire il loop di guarigione autonomo: esecuzione test $\rightarrow$ cattura diagnostica $\rightarrow$ prompt chirurgico di fix $\rightarrow$ ri-esecuzione.
  - Vincolo rigido di sicurezza: budget massimo di 3 tentativi. Se non converge entro 3 tentativi, arresto immediato con Fail Loudly.
  - Rollback atomico dello snapshot del codice su fallimento finale o violazione dei guardrail (garantito in `finally`).
- **Esito:** Implementato con successo in `src/gatekeeper/self-healing.ts`. Supporta convergenza multi-step, snapshot pre-flight e rollback atomico su disco testato in `tests/self-healing.test.ts`.

### 🎫 TCK-5.3: AST Diff Guard & Scope Enforcement Rule Engine (Completato ✅)
- **Epica:** Deterministic Quality & Guardrails
- **Assegnato a:** Security/QA Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/gatekeeper/ast-guard.ts`
- **Obiettivo:**
  - Analisi diff prima e dopo la proposta di fix: verificare che nessun test case o asserzione sia stata eliminata o commentata (Test Preservation Invariant).
  - Verificare che nessun file al di fuori dell'elenco consentito dal ticket sia stato modificato (Scope Enforcement Invariant) e proteggere i file di configurazione (`package.json`, `Cargo.toml`, ecc.).
- **Esito:** Implementato con successo in `src/gatekeeper/ast-guard.ts`. Strip intelligente dei commenti, conteggio deterministico test/asserzioni e verifica scope rigida validata in `tests/diff-guard.test.ts`.

### 🎫 TCK-5.4: Interactive CLI Scaffolding Wizard (@clack/prompts) (Completato ✅)
- **Epica:** Open-Source DevEx
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/cli/wizard.ts`, `src/index.ts`
- **Obiettivo:**
  - Implementare il comando `agentic-company init` con `@clack/prompts` per onboarding guidato, selezione stack automatica o manuale, configurazione ruoli e governance.
  - Supporto per monorepo / multi-progetto con rilevamento automatico workspace (`pnpm`, `npm/yarn`, `cargo`, directory-structure).
  - Modalità non interattiva `--yes`, `--non-interactive`, `--json` per pipeline CI/CD headless.
- **Esito:** Implementato con successo in `src/cli/wizard.ts` e integrato nel comando `init` in `src/index.ts`. Validato per monorepo e modalità headless/JSON in `tests/wizard.test.ts`.

### 🎫 TCK-5.5: Test Suite Self-Healing, Diff Guard & Wizard (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/diagnostic-parsers.test.ts`, `tests/self-healing.test.ts`, `tests/diff-guard.test.ts`, `tests/wizard.test.ts`
- **Obiettivo:** Garantire il 100% di copertura e zero regressioni su tutti i componenti di Sprint 5.
- **Esito:** Completato con successo. 136/136 test passati (100% successo su 17 test file), 0 errori TypeScript in `npm run typecheck`. Tutti i criteri di accettazione e guardrail verificati.

---

## 🏃 Sprint 6: Enterprise Resilience & Security Guardrails (ATTIVO ORA 🚀 — Ratificato da RFC-002)

### 🎫 TCK-6.0: Tech Validation Spike (Sprint 6) (Completato ✅)
- **Epica:** Enterprise Resilience & Security
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-6-validation.md`
- **Obiettivo:** Ricerca e validazione architetturale preventiva su:
  1. Pattern Two-Phase Commit e Write-Ahead Logging (WAL) per State Checkpointing in Node.js/TypeScript senza dipendenze binarie pesanti.
  2. Architettura in-memory Typed Event Bus ad alte prestazioni con flush append-only su stream JSONL.
  3. Pre-filtri sincroni (<2ms) ad alta efficienza per pattern noti di credenziali/API key e calcolo differenziale dell'entropia di Shannon pre-commit.
  4. Toolchain di dependency auditing (`npm audit`, `cargo audit`, `pip-audit`, `govulncheck`) con normalizzazione output e parsing licenze.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e aggiornamento di `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts` (5/5 test passati). Sbloccate le fasi operative di BUILD (TCK-6.1, TCK-6.2, TCK-6.3, TCK-6.4, TCK-6.5).

### 🎫 TCK-6.1: Deterministic State Checkpoint & Session Resume Engine (Completato ✅)
- **Epica:** Crash Resilience
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/session.ts`, `src/core/session-store.ts`, `src/index.ts`
- **Obiettivo:**
  - Definire contratti Zod per session snapshot (`SessionSnapshotSchema`).
  - Implementare il salvataggio atomico su `.company-os/sessions/<id>.json` a ogni transizione FSM e safe-point.
  - Implementare il comando CLI `agentic-company resume [session-id]` con Two-Phase Commit e rollback automatico a commit pulito in caso di unclean safe-point.
- **Esito:** Implementato con successo in `src/core/session-store.ts` e CLI `resume`. Supporto Two-Phase Commit (`DIRTY_IN_PROGRESS` -> `COMMITTED_SAFEPOINT`), persistenza POSIX atomica e rollback automatico verificato in `tests/session-store.test.ts`.

### 🎫 TCK-6.2: Typed Enterprise Event Bus & JSONL Audit Trail Logger (Completato ✅)
- **Epica:** Enterprise Telemetry & Audit
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/events.ts`, `src/core/event-bus.ts`, `src/core/audit-logger.ts`
- **Obiettivo:**
  - Definire contratti Zod per eventi aziendali tipizzati (`CompanyEventSchema`).
  - Implementare `CompanyEventBus` asincrono con observer pattern per loggare eventi di ciclo di vita.
  - Implementare il logger immutabile append-only su `.company-os/audit.jsonl`.
- **Esito:** Implementato con successo in `src/core/event-bus.ts` e `src/core/audit-logger.ts`. Supporto pub/sub tipizzato, listener wildcard `*`, e persistenza append-only JSONL validata in `tests/event-bus.test.ts`.

### 🎫 TCK-6.3: Dual-Tier Secret & PII Leak Prevention Gate (Completato ✅)
- **Epica:** Security & Data Protection
- **Assegnato a:** Security Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/security.ts`, `src/security/secret-guard.ts`
- **Obiettivo:**
  - Tier 1: Intercettore sincrono in-flight (<2ms) a monte delle chiamate LLM per bloccare prefissi noti (`sk-proj`, `ghp_`, `AKIA`, `BEGIN PRIVATE KEY`, ecc.).
  - Tier 2: Scanner differenziale ad entropia di Shannon sul diff pre-commit ($H > 4.5$).
  - Whitelist automatica per file di test, mock fixtures (`tests/`, `fixtures/`, `mock_`) e `.env.example`.
- **Esito:** Implementato con successo in `src/security/secret-guard.ts`. Protezione a due stadi con scansione sincrona prefissi (<2ms), calcolo matematico dell'Entropia di Shannon e whitelist automatica validata in `tests/secret-guard.test.ts`.

### 🎫 TCK-6.4: Dependency Vulnerability & License Compliance Auditor (Completato ✅)
- **Epica:** Supply Chain Security
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/audit.ts`, `src/security/dependency-auditor.ts`
- **Obiettivo:**
  - Auditing integrato nel Gatekeeper per `npm audit`, `cargo audit`, `pip-audit`, `govulncheck`.
  - Policy bloccante su vulnerabilità con severità `HIGH` o `CRITICAL`.
  - Verifica conformità licenze software rispetto a whitelist approvata (MIT, Apache-2.0, BSD, ISC).
- **Esito:** Implementato con successo in `src/security/dependency-auditor.ts`. Parsing formati npm audit v6/v7+, cargo audit, timeout a 5000ms, fallback offline graceful e verifica licenze validata in `tests/dependency-auditor.test.ts`.

### 🎫 TCK-6.5: Test Suites & Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/session-store.test.ts`, `tests/event-bus.test.ts`, `tests/secret-guard.test.ts`, `tests/dependency-auditor.test.ts`
- **Obiettivo:** Garantire il 100% di copertura e zero regressioni su tutti i componenti di Sprint 6.
- **Esito:** Completato con successo. 175/175 test passati (100% successo su 21 test suite), 0 errori TypeScript in `npm run typecheck` e build pulita in `npm run build`.

---

## 🏃 Sprint 7: Git-Native Collaboration & Quality Governance (Completato ✅ — Ratificato da RFC-002)

### 🎫 TCK-7.0: Tech Validation Spike (Sprint 7) (Completato ✅)
- **Epica:** Human-Agent Collaboration & Quality Governance
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-7-validation.md`
- **Obiettivo:** Ricerca e validazione architetturale preventiva su:
  1. Pattern Cooperative Safe-Point Interrupts per Human-in-the-Loop steering (`pause`, `hint`, `resume`, `abort`) senza violare l'atomicità POSIX né l'inviolabilità dell'AST Diff Guard.
  2. Automazione Git-Native: creazione deterministica di branch (`feat/tck-...`), convenzione commit semantici e generazione PR con Scorecard crittografica del Gatekeeper.
  3. Server locale leggero ad alta sicurezza basato esclusivamente su `node:http` e Server-Sent Events (SSE) su `localhost:4321`, con binding `127.0.0.1`, token crittografico effimero `0600` e validazione Origin/Host contro CSRF e DNS rebinding.
  4. Flaky Test Quarantine Engine con protocollo $N=3$ su alternanza deterministica PASS/FAIL.
  5. Token Cost Budget Watchdog con hard-cap di spesa, avviso all'80% e stato `SAFE_PAUSED` con grace margin del 5%.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e aggiornamento di `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts` (6/6 test passati). Sbloccate le fasi operative di BUILD (TCK-7.1, TCK-7.2, TCK-7.3, TCK-7.4, TCK-7.5, TCK-7.6).

### 🎫 TCK-7.1: Cooperative Safe-Point Human-in-the-Loop Steering Engine (Completato ✅)
- **Epica:** Human-Agent Collaboration
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/steering.ts`, `src/core/steering-engine.ts`, `src/index.ts`
- **Obiettivo:**
  - Definire contratti Zod per lo steering (`SteeringCommandSchema`, `SteeringStateSchema`).
  - Implementare comandi `pause`, `hint`, `resume`, `abort`.
  - Pattern Safe-Point: la pausa attende il completamento della transazione atomica corrente prima di passare a `PAUSED`.
  - Iniezione sicura degli hint: verifica dell'AST Diff Guard hard-coded a livello di kernel affinché nessun hint umano possa indebolire o sopprimere test.
- **Esito:** Implementato con successo in `src/contracts/steering.ts` e `src/core/steering-engine.ts`. Supporta comandi cooperativi `pause`, `hint`, `resume`, `abort`, safe-point transaction lock e guardrail kernel-level inviolabile su AST Diff Guard con validazione patch prima dell'applicazione dell'hint. Coperto da `tests/steering.test.ts`.

### 🎫 TCK-7.2: Git-Native Feature Branch, Conventional Commit & Automated PR Generator (Completato ✅)
- **Epica:** Git Collaboration
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/git.ts`, `src/git/workflow.ts`
- **Obiettivo:**
  - Creazione e isolamento automatico in branch `feat/tck-<id>-<description>`.
  - Generazione di commit convenzionali atomici (`feat(scope): message`).
  - Generazione del payload della Pull Request con Scorecard tabellare immutabile del Deterministic Gatekeeper (test, typecheck, lint, audit CVE, secret scan).
- **Esito:** Implementato con successo in `src/contracts/git.ts` e `src/git/workflow.ts`. Gestisce branching deterministico `feat/tck-...`, messaggi Conventional Commits e generazione PR con Tabella Scorecard del Deterministic Gatekeeper (test, typecheck, lint, audit CVE, secret scan). Coperto da `tests/git-workflow.test.ts`.

### 🎫 TCK-7.3: Zero-Dependency Embedded Local Web Studio Dashboard (localhost:4321) (Completato ✅)
- **Epica:** DevEx & Visual Studio
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/studio/server.ts`, `src/studio/ui.ts`, `src/index.ts`
- **Obiettivo:**
  - Server embedded ultra-leggero basato su `node:http` e Server-Sent Events (SSE) senza dipendenze esterne (<15MB RAM, avvio <50ms).
  - Binding rigoroso su `127.0.0.1` con token crittografico effimero 0600 (`.agents/.studio-token`).
  - Visualizzazione in tempo reale di: grafo stati FSM, Kanban board dei ticket, streaming telemetria e pulsanti Safe Steering.
  - Comando CLI `agentic-company studio`.
- **Esito:** Implementato con successo in `src/contracts/studio.ts`, `src/studio/server.ts`, `src/studio/ui.ts` e comando CLI `agentic-company studio` in `src/index.ts`. Server embedded zero-dependency (solo `node:http`) con SSE, binding esclusivo `127.0.0.1:4321`, token auth POSIX 0600 effimero e mitigazione CSRF/DNS rebinding. Coperto da `tests/studio.test.ts`.

### 🎫 TCK-7.4: Flaky Test N=3 Detection & Quarantine Engine with Backlog Escalation (Completato ✅)
- **Epica:** Deterministic Quality Assurance
- **Assegnato a:** QA Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/quarantine.ts`, `src/gatekeeper/quarantine.ts`
- **Obiettivo:**
  - Protocollo di verifica a 3 esecuzioni ($N=3$): un test è marcato flaky solo se alterna PASS e FAIL sullo stesso commit.
  - Isolamento in `.gatekeeper/quarantine.json` e apertura automatica di ticket prioritario nel backlog.
  - Emissione evento `FLAKY_TEST_QUARANTINED` su Event Bus e trasparenza nella PR finale.
- **Esito:** Implementato con successo in `src/contracts/quarantine.ts` e `src/gatekeeper/quarantine.ts`. Algoritmo di rilevazione flakiness N=3 (richiede alternanza PASS/FAIL sullo stesso commit; i fallimenti deterministici 3/3 vengono respinti come bug), persistenza in `.gatekeeper/quarantine.json`, generazione automatica ticket di backlog e notifica su Event Bus. Coperto da `tests/quarantine.test.ts`.

### 🎫 TCK-7.5: Token Cost Budget Watchdog with Safe-Pause & Grace Margin (Completato ✅)
- **Epica:** Financial Governance & Resource Watchdog
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/budget.ts`, `src/core/budget-watchdog.ts`
- **Obiettivo:**
  - Monitoraggio real-time del consumo token e calcolo costi in USD per modello.
  - Soglia di warning all'80% e transizione a `SAFE_PAUSED` al 100% con margine di grazia del 5% per completare il safe-point checkpoint.
  - Menù interattivo guidato per incremento budget o resume successivo.
- **Esito:** Implementato con successo in `src/contracts/budget.ts` e `src/core/budget-watchdog.ts`. Tracciamento real-time del consumo token (prompt/completion/cached), pricing multi-modello, alert 80% su Event Bus, hard cap al 100% con grace buffer del 5% per safe-point checkpoint, transizione automatica a `SAFE_PAUSED` e API `resumeWithBudgetIncrement`. Coperto da `tests/budget-watchdog.test.ts`.

### 🎫 TCK-7.6: Comprehensive Test Suites & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/steering.test.ts`, `tests/git-workflow.test.ts`, `tests/studio.test.ts`, `tests/quarantine.test.ts`, `tests/budget-watchdog.test.ts`
- **Obiettivo:** Garantire il 100% di copertura e zero regressioni su tutti i componenti di Sprint 7.
- **Esito:** Implementate le cinque suite di test dedicate (`tests/steering.test.ts`, `tests/git-workflow.test.ts`, `tests/studio.test.ts`, `tests/quarantine.test.ts`, `tests/budget-watchdog.test.ts`). Risultato gatekeeper globale: 204/204 test passati (100% successo su 26 test suite), 0 errori TypeScript in `npm run typecheck`, build di produzione pulita in `npm run build`.

---

## 🏃 Sprint 8: Execution Speed, Test Impact Analysis & Safe Concurrency Sandbox (Completato ✅ — Ratificato da RFC-003)

### 🎫 TCK-8.0: Tech Validation Spike (Sprint 8) (Completato ✅)
- **Epica:** Architectural Research & Pre-Sprint Validation
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-8-validation.md`
- **Obiettivo:** Ricerca e validazione preventiva su Test Impact Analysis (static import dependency crawler vs ts-morph), Git Worktree lifecycle pool (concorrenza L3 a zero collisioni) e disaccoppiamento modulare CLI.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e aggiornamento di `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts` (8/8 test passati). Sbloccate le fasi operative di BUILD (TCK-8.1, TCK-8.2, TCK-8.3, TCK-8.4).

### 🎫 TCK-8.1: Test Impact Analysis (TIA) Engine & Dependency Graph Mapper (Completato ✅)
- **Epica:** Execution Speed & Developer Experience
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/tia.ts`, `src/gatekeeper/tia.ts`, `src/gatekeeper/runner.ts`
- **Obiettivo:**
  - Costruire la mappatura statica delle dipendenze tra file di implementazione e test suite.
  - Esecuzione inner-loop mirata (<400ms) durante i cicli di Self-Healing, riservando la full suite al pre-merge.
  - Matrice di invalidazione transitiva: riesecuzione globale immediata se cambiano i contratti Zod in `src/contracts/`.
- **Esito:** Implementato con successo in `src/contracts/tia.ts` e `src/gatekeeper/tia.ts`. Crawler statico bidirezionale delle dipendenze, calcolo dei test impattati per modifiche mirate (<400ms), matrice di invalidazione globale transitiva su `src/contracts/` e configurazioni, e integrazione con `runner.ts` e `self-healing.ts` (Two-Stage Gatekeeper). Testato in `tests/tia.test.ts` (10/10 test passati).

### 🎫 TCK-8.2: CLI Modular Refactor & Command Dispatcher Decoupling (Completato ✅)
- **Epica:** Architecture & Maintainability
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/cli/commands/`, `src/index.ts`
- **Obiettivo:**
  - Scomporre il monolite `src/index.ts` in comandi isolati (`init`, `inspect`, `attach`, `status`, `resume`, `studio`, `mcp`).
  - Introdurre `ExecutionContext` programmabile che astrae `stdout`/`stderr` e rimozione di `process.exit()` hardcoded dalle action per testing in-memory ultra-veloce.
- **Esito:** Implementato con successo in `src/cli/context.ts`, `src/cli/dispatcher.ts`, `src/cli/commands/*` (`status.ts`, `init.ts`, `inspect.ts`, `attach.ts`, `mcp.ts`, `resume.ts`, `studio.ts`) e `src/index.ts` (ridotto a 7 righe di bootstrap). Rimossi tutti i `process.exit()` e abilitato il testing in-memory ultra-veloce senza spawn di processi Node.js esterni. Testato in `tests/cli-modular.test.ts` (9/9 test passati) e compatibile con `tests/cli.test.ts` (7/7 test passati).

### 🎫 TCK-8.3: Git Worktree Multi-Agent Pool & Safe Concurrency Sandbox (Completato ✅)
- **Epica:** Concurrency & Isolation
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/worktree.ts`, `src/core/worktree-manager.ts`
- **Obiettivo:**
  - Managed Worktree Lifecycle Pool per consentire l'esecuzione concorrente fino a 4 Leaf Developers simultanei.
  - Allocazione dinamica in `.company-os/worktrees/<agent-id>`, prevenendo collisioni su file contigui e conflitti di lockfile.
  - Garbage collection atomica dei worktree orfani e rebase deterministico sul branch target prima dell'apertura PR.
- **Esito:** Implementato con successo in `src/contracts/worktree.ts` e `src/core/worktree-manager.ts`. Pool dinamico gestito in `.company-os/worktrees/<agent-id>`, hard limit di concorrenza a 4 agenti simultanei, pattern `withWorktree` con rimozione atomica garantita in blocco `finally`, rebase sequenziale deterministico sul branch principale e potatura automatica degli orfani (`pruneOrphanWorktrees`). Testato in `tests/worktree.test.ts` (7/7 test passati).

### 🎫 TCK-8.4: Test Suite Sprint 8 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/tia.test.ts`, `tests/cli-modular.test.ts`, `tests/worktree.test.ts`
- **Obiettivo:** Garantire il 100% di copertura e zero regressioni sui moduli di Sprint 8.
- **Esito:** Implementate le tre nuove suite di test (`tests/tia.test.ts`, `tests/cli-modular.test.ts`, `tests/worktree.test.ts`). Risultato gatekeeper globale: 32/32 test suite passate, 267/267 test verdi (100% successo), 0 errori TypeScript in `npm run typecheck`, build di produzione compilata con successo in `dist/` via `npm run build`.

---

## 🏃 Sprint 9: Runtime Contract Integrity, Cryptographic Handoff & Visual Studio Kanban (Completato ✅ — Ratificato da RFC-003)

### 🎫 TCK-9.0: Tech Validation Spike (Sprint 9) (Completato ✅)
- **Epica:** Pre-Sprint Validation
- **Assegnato a:** Engineering Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-9-validation.md`
- **Obiettivo:** Ricerca e validazione preventiva su Runtime Contract Interceptor (Zod strict safeParse), Merkle Hash-Chaining con HMAC su audit.jsonl, Interactive HTML5 Kanban con sync atomico su backlog.md e First-Pass Yield (FPY) metrics aggregator.
- **Deliverable:** Dossier conforme a `TechValidationReportSchema` (`src/contracts/research.ts`) e aggiornamento di `tests/spikes.test.ts`.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts` (9/9 test passati). Sbloccate le fasi operative di BUILD (TCK-9.1, TCK-9.2, TCK-9.3, TCK-9.4, TCK-9.5).

### 🎫 TCK-9.1: Runtime Contract Interceptor Middleware with Zod Fast Validation (Completato ✅)
- **Epica:** System Reliability & Zero Drift
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/interceptor.ts`, `src/core/contract-interceptor.ts`, `src/core/state-machine.ts`
- **Obiettivo:** Validazione `safeParse` rigorosa a runtime di ogni payload transitato tra agenti e nelle guardie FSM con arresto Fail Loudly immediato.
- **Esito:** Implementato `ContractInterceptor` con validazione Zod `.strict()`, emissione di eventi `CONTRACT_VIOLATION` su `CompanyEventBus`, e integrazione trasparente in `StateMachine.registerTransitionSchema()` e `transitionTo()`. Testato in `tests/contract-interceptor.test.ts` (7/7 test passati).

### 🎫 TCK-9.2: Cryptographic Handoff Notarization & SHA-256 Digest Trail Logger (Completato ✅)
- **Epica:** Forensics & Quality Governance
- **Assegnato a:** Security Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/audit.ts`, `src/core/audit-logger.ts`
- **Obiettivo:** Catena Merkle di hash SHA-256 su `audit.jsonl` per certificare l'integrità e non-ripudiabilità degli handoff inter-agente.
- **Esito:** Implementato Merkle Hash-Chaining lineare ($H_n = \text{SHA-256}(H_{n-1} + \text{canonicalJson}(E_n))$), generazione di segreto crittografico POSIX `0600` in `.company-os/.audit.secret`, notarizzazione HMAC-SHA256 e metodo deterministico di verifica `verifyAuditChain()`. Testato in `tests/audit-merkle.test.ts` (7/7 test passati).

### 🎫 TCK-9.3: Interactive Visual Kanban Board & Drag-and-Drop Workflow Studio (Completato ✅)
- **Epica:** DevEx & Visual Management
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/studio.ts`, `src/studio/kanban.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Kanban board reattiva nativa HTML5/CSS Grid integrata su `localhost:4321` con drag-and-drop e sync atomico su disco.
- **Esito:** Implementato il parser markdown `parseBacklogToKanban`, la funzione di spostamento atomico `moveTicketInBacklog` con scrittura POSIX durabile (`atomicWriteFile`), gli endpoint `GET /api/kanban` e `POST /api/kanban/move`, e l'interfaccia responsive HTML5 con drag-and-drop ed eventi `TICKET_STATUS_CHANGED` via SSE in tempo reale. Testato in `tests/kanban-studio.test.ts` (7/7 test passati).

### 🎫 TCK-9.4: Cooperation & Quality Metrics Aggregator (First-Pass Yield & Mean Cycles) (Completato ✅)
- **Epica:** Enterprise Telemetry & Process Quality
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/metrics.ts`, `src/core/metrics-aggregator.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Calcolo e visualizzazione delle metriche di cooperazione inter-agente: First-Pass Yield (FPY) e cicli medi per il merge.
- **Esito:** Implementati i contratti Zod `FirstPassYieldReportSchema` e `ProcessQualityMetricsSchema`, la classe `MetricsAggregator` con calcolo deterministico di FPY %, mean self-healing iterations, contract compliance rate, verifica Merkle e l'endpoint `GET /api/metrics` collegato alle KPI card della dashboard. Testato in `tests/cooperation-metrics.test.ts` (5/5 test passati).

### 🎫 TCK-9.5: Test Suite Sprint 9 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione Engineering Lead L2)
- **File target:** `tests/contract-interceptor.test.ts`, `tests/audit-merkle.test.ts`, `tests/kanban-studio.test.ts`, `tests/cooperation-metrics.test.ts`
- **Obiettivo:** Copertura completa dei nuovi moduli Sprint 9 e verifica con Gatekeeper deterministico.
- **Esito:** 4 nuove suite di test implementate e superate con successo (26 test dedicati). Risultato globale: 36 test suite passate, 294 test passati al 100%, 0 errori in `npm run typecheck` e build pulita compilata in `dist/` tramite `npm run build`.

---

## 🏃 Sprint 10: AI Harness Infrastructure & Anti-Rot Memory Core (Completato ✅ — Ratificato da RFC-004)

### 🎫 TCK-10.0: Tech Validation Spike (Sprint 10) (Completato ✅)
- **Epica:** AI Architecture Pre-Sprint Validation
- **Assegnato a:** AI & Context Harness Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-10-validation.md`
- **Obiettivo:** Validazione architetturale su Prefix Prompt Caching nei diversi provider (Anthropic, OpenAI, Gemini), algoritmi di Compaction a soglia 40k token con Invariant Protection e decodifica vincolata schema-guided.
- **Esito:** Completato con successo. Verdetto `APPROVED` validato al 100% rispetto a `TechValidationReportSchema`.

### 🎫 TCK-10.1: Two-Tier Prompt Engine & Universal Prefix Caching Transport Adapter (Completato ✅)
- **Epica:** Token Economics & Latency Optimization
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/generator/templates/core-kernel.ts`, `src/generator/templates/cached-kernel.ts`, `src/core/prompt-cache-adapter.ts`, `src/contracts/prompts.ts`
- **Obiettivo:** Strutturazione del prompt con Tier 1 statico immutabile (Kernel OS + contratti >1024 token byte-identici) per massimizzare il cache hit rate (>80%) e abbattere il Time-To-First-Token a <250ms.
- **Esito:** Implementato `UNIVERSAL_TIER1_PREFIX` (>1250 token), `buildTwoTierPromptBundle` e `PromptCacheAdapter` con supporto nativo per Anthropic (`cache_control: ephemeral`), OpenAI e Gemini.

### 🎫 TCK-10.2: Invariant-Protected Context Compaction & Anti-Rot Memory Engine (Completato ✅)
- **Epica:** Cognitive Reliability & Anti-Rot Memory
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/core/context-compactor.ts`, `src/contracts/compaction.ts`, `src/gatekeeper/self-healing.ts`
- **Obiettivo:** Compattazione attiva della context window a 40k token con Invariant Protection Guardrail: divieto di perdita di file, test o vincoli di ticket; Epistemic Clean-Slate nei loop di self-healing.
- **Esito:** Implementato `ContextCompactor` con `verifyContextInvariants()` non-LLM, `sliceDiagnostics()` (<120 token per errore) ed Epistemic Clean-Slate integrato in `runSelfHealingLoop`.

### 🎫 TCK-10.3: State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder (Completato ✅)
- **Epica:** Dynamic Scoping & Decoding Reliability
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/core/tool-scoper.ts`, `src/core/constrained-decoder.ts`, `src/contracts/tools.ts`
- **Obiettivo:** Pruning a due fasce dei tool in base allo stato della macchina a stati FSM (Universal Core Tools + State-Gated Action Tools) e JSON Schema forzato per eliminare JSON malformati.
- **Esito:** Implementato `ToolScoper` con oltre 1500 token risparmiati per turno e `ConstrainedDecoder` con strict JSON Schema e auto-riparazione code fences.

### 🎫 TCK-10.4: Test Suite Sprint 10 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione QA Lead L2)
- **File target:** `tests/prompt-caching.test.ts`, `tests/context-compactor.test.ts`, `tests/tool-governor.test.ts`
- **Esito:** 24/24 test passati nelle 3 nuove suite. Suite globale dell'OS: 29/29 test suite passate, 240/240 test passati (100%), 0 errori typecheck.

---

## 🏃 Sprint 11: FinOps Observability & Cognitive Trajectory Studio (Completato ✅ — Ratificato da RFC-004)

### 🎫 TCK-11.0: Tech Validation Spike (Sprint 11) (Completato ✅)
- **Epica:** DevEx & Observability Pre-Sprint Validation
- **Assegnato a:** AI & Context Harness Lead (Domain Lead L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-11-validation.md`
- **Obiettivo:** Validazione architetturale preventiva per FinOps multi-tier con calcolo del risparmio netto in dollari, Context Health Score continuo (0-100%) con proactive alerting e Trajectory Reader virtualizzato tail-first (<5MB).
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% rispetto a `TechValidationReportSchema` e testato in `tests/spikes.test.ts`.

### 🎫 TCK-11.1: Live Token FinOps Dashboard & Real-Time Dollar Cost Tracker (Completato ✅)
- **Epica:** Financial Observability
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/contracts/finops.ts`, `src/core/finops-engine.ts`, `src/core/budget-watchdog.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Monitoraggio visivo in tempo reale dei costi LLM in dollari con matrice quadri-fascia (uncached, cacheRead, cacheWrite, output), contatore del risparmio netto generato da Prompt Caching Tier-1 e Cache Savings Ratio.
- **Esito:** Implementati contratti Zod `MultiTierTokenUsageRecordSchema` e `FinOpsSummarySchema`, `FinOpsEngine` con tariffe ufficiali dei modelli 2026, integrazione bidirezionale con `BudgetWatchdog`, endpoint `GET /api/finops` e widget visuale nel Local Web Studio. Testato in `tests/finops.test.ts` (4/4 test passati).

### 🎫 TCK-11.2: Context Health Meter & Proactive Compaction Alerting System (Completato ✅)
- **Epica:** Context Window Reliability
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/contracts/health.ts`, `src/core/context-health.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Tachimetro visuale Context Health (0-100%) nello Studio Web con bande operative (EXCELLENT, NOMINAL, ROT_RISK, CRITICAL_ROT) e allarme proattivo automatico `CONTEXT_HEALTH_ALERT` all'ingresso nella zona di rischio a 40k token.
- **Esito:** Implementati contratti Zod `ContextHealthReportSchema`, classe `ContextHealthMeter` con formula continua piecewise conforme alla ricerca empirica "Lost in the Middle", endpoint `GET /api/context-health` e barra dinamica con allarme cromatico nella dashboard. Testato in `tests/context-health.test.ts` (5/5 test passati).

### 🎫 TCK-11.3: Interactive Breadcrumb Trajectory Visualizer & Decision Inspector (Completato ✅)
- **Epica:** Fleet Decision Transparency
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Product Lead L2)
- **File target:** `src/contracts/studio.ts`, `src/core/trajectory-reader.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Timeline interattiva a briciole di pane per ispezionare visivamente ogni singolo passaggio cognitivo, decisione e tool call della flotta di agenti, con lettura inversa tail-first (<5MB RAM) e drawer crittografico Merkle/HMAC.
- **Esito:** Implementato `TrajectoryReader` con lettura inversa a ritroso a chunk fissi da 64KB su `.company-os/audit.jsonl`, classificazione deterministica degli eventi (FSM, QUALITY_GATE, SELF_HEALING, FINOPS, STEERING, TOOL), endpoint `GET /api/trajectory` con supporto filtri e paginazione, e UI con chips e drawer dettagli. Testato in `tests/trajectory.test.ts` (3/3 test passati).

### 🎫 TCK-11.4: Test Suite Sprint 11 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Engineer L3 (Supervisione QA Lead L2)
- **File target:** `tests/finops.test.ts`, `tests/context-health.test.ts`, `tests/trajectory.test.ts`, `tests/finops-studio.test.ts`
- **Obiettivo:** Copertura completa dei nuovi moduli Sprint 11 e verifica con Gatekeeper deterministico.
- **Esito:** 4 nuove suite di test implementate e superate con successo (16 test dedicati). Risultato globale: 40 test suite passate, 311 test passati al 100%, 0 errori in `npm run typecheck` e build pulita compilata in `dist/` tramite `npm run build`.

---

## 🏃 Sprint 15: Agile Ceremonies Engine & Caveman-RPC Core (Completato ✅ — Ratificato da RFC-005)

### 🎫 TCK-15.1: Caveman-RPC Telegraphic Formatter & Zero-Fluff Enforcer (Completato ✅)
- **Epica:** Inter-Agent Protocol & Token Efficiency
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/core/caveman-formatter.ts`, `tests/caveman-formatter.test.ts`
- **Obiettivo:** Serializzazione telegrafica ad envelope `[CAVEMAN-RPC]` conforme a `TelegraphicMessageSchema`. Eliminazione sistematica di convenevoli e preamboli con preservazione verificata al 100% di blocchi di codice, path, hash SHA-256 e comandi (`verifyPreservation`).
- **Esito:** Implementato con successo e validato con 5 unit test dedicati (risparmio token fluff confermato).

### 🎫 TCK-15.2: Kahneman System-1 Fast Decision Gate (Completato ✅)
- **Epica:** Cognitive Speed & Deterministic Triage
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/core/fast-decision-gate.ts`, `tests/fast-decision-gate.test.ts`
- **Obiettivo:** Classificatore deterministico non-autoregressivo per triage micro-decisionale in sub-10ms a costo token nullo ($0): FAST_APPROVE su azioni sicure/deterministico, FAST_REJECT immediato su secret leak o percorsi protetti (.git, .env, node_modules), ed ESCALATE_TO_SYSTEM2 su complessità architetturale.
- **Esito:** Implementato con successo con benchmark di latenza <10ms e 5 test dedicati superati al 100%.

### 🎫 TCK-15.3: Agile Ceremonies Dispatcher & Lifecycle Orchestrator (Completato ✅)
- **Epica:** Autonomous Agile Lifecycle
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Product Lead L2)
- **File target:** `src/core/ceremony-dispatcher.ts`, `tests/ceremony-dispatcher.test.ts`
- **Obiettivo:** Orchestrazione automatica e persistenza delle 5 cerimonie agili native (Brainstorming, Refinement 1:1, Architecture Review, War Room, Retrospective). Generazione automatica di verbali JSON e Markdown in `.company-os/ceremonies/` ed emissione eventi su `CompanyEventBus`.
- **Esito:** Implementato e validato con 3 test dedicati comprensivi di retrospettiva con First-Pass Yield (FPY %).

### 🎫 TCK-15.4: Incident War Room Circuit Breaker & Rollback Engine (Completato ✅)
- **Epica:** Emergency Circuit Breaker & Resilience
- **Assegnato a:** Reliability Leaf Developer L3 (Supervisione QA & Security Lead L2)
- **File target:** `src/gatekeeper/war-room.ts`, `src/gatekeeper/self-healing.ts`, `tests/war-room.test.ts`
- **Obiettivo:** Scatto d'emergenza su `SELF_HEALING_EXHAUSTED` (3/3 fallimenti) o violazioni di sicurezza. Attivazione automatica del blocco globale di scrittura, esecuzione immediata del rollback atomico allo snapshot SHA-256 integro e convocazione formale della War Room.
- **Esito:** Implementato ed integrato in `runSelfHealingLoop` con 2 test di integrazione superati.

### 🎫 TCK-15.5: Anti-Echo-Chamber Consensus Engine con Devil's Advocate & Tie-Break (Completato ✅)
- **Epica:** Multi-Agent Consensus & Bias Prevention
- **Assegnato a:** Core Leaf Developer L3 (Supervisione R&D Lead L2)
- **File target:** `src/core/consensus-engine.ts`, `tests/consensus-engine.test.ts`
- **Obiettivo:** Convergenza rigorosa in massimo 2 round con Devil's Advocate / Red-Teamer obbligatorio (`DevilsAdvocateFeedbackSchema`) e Tie-Break decisionale automatico del CTO per prevenire stalli orizzontali senza coinvolgere il CEO.
- **Esito:** Implementato e verificato con successo in `tests/consensus-engine.test.ts` (4/4 test passati).

### 🎫 TCK-15.6: Test Suite Sprint 15 & End-to-End Autonomous Simulation (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Lead L2
- **File target:** `tests/e2e-autonomous-agile.test.ts`
- **Obiettivo:** Simulazione end-to-end autonoma dell'intero ciclo delle 5 cerimonie agili con cooperazione multi-agente, risoluzione dissenso e gestione incidenti senza alcun intervento umano.
- **Esito:** Tutte le 6 nuove suite passate (20 nuovi test). Risultato globale dell'OS: **48 test suite passate al 100%, 345/345 test passati, 0 errori TypeScript e build pulita compilata in `dist/`**.

---

## 🏃 Sprint 16: Studio Pro — Agile Ceremony Board, Live War-Room & Fluff Telemetry (Completato ✅)

### 🎫 TCK-16.1: Agile Ceremony Board & Meeting Timeline (Completato ✅)
- **Epica:** Web Studio & Agile Observability
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Product Lead L2)
- **File target:** `src/studio/agile-handler.ts`, `src/studio/server.ts`, `src/studio/ui.ts`, `src/contracts/studio.ts`
- **Obiettivo:** Endpoint `GET /api/ceremonies` con scansione e restituzione paginata/ordinata delle cerimonie agili e retrospettive in `.company-os/ceremonies/`. Sezione visiva responsive nel Local Web Studio con badge cromatici per ciascuna cerimonia (Brainstorming, Refinement, Roundtable, War Room, Retrospective) e indicatori FPY % per le retrospettive.
- **Esito:** Implementato e verificato con successo in `tests/studio-agile-pro.test.ts`.

### 🎫 TCK-16.2: Live Incident War-Room Cockpit & Interactive Rollback Controller (Completato ✅)
- **Epica:** Emergency Resilience & HITL Safety
- **Assegnato a:** Reliability Leaf Developer L3 (Supervisione QA & Security Lead L2)
- **File target:** `src/studio/agile-handler.ts`, `src/studio/server.ts`, `src/studio/ui.ts`
- **Obiettivo:** Endpoint `GET /api/war-room` e `POST /api/war-room/resolve` per il monitoraggio e la risoluzione guidata degli incidenti critici. Banner di emergenza pulsante rosso ad alta visibilità nella dashboard web attivo in presenza di Write Lock, con visualizzazione della causa radice, hash SHA-256 ripristinato, piano di contenimento e pulsante interattivo per la risoluzione e sblocco.
- **Esito:** Implementato e testato con round-trip completo in `tests/studio-agile-pro.test.ts`.

### 🎫 TCK-16.3: Token Fluff Telemetry & Caveman Compression Gauge (Completato ✅)
- **Epica:** Token Economics & Telemetry
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/core/fluff-telemetry.ts`, `src/studio/server.ts`, `src/studio/ui.ts`, `src/contracts/studio.ts`
- **Obiettivo:** Modulo `FluffTelemetry` con calcolo deterministico cumulativo dei token verbose intercettati, token eliminati dal Caveman Formatter, percentuale di fluff tagliato e stima dei dollari risparmiati. Endpoint `GET /api/fluff-telemetry` e tachimetro dedicato a 5 colonne nella griglia FinOps della dashboard.
- **Esito:** Implementato con successo e validato con test dedicati in `tests/studio-agile-pro.test.ts`.

### 🎫 TCK-16.4: Test Suite Sprint 16 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA Lead L2
- **File target:** `tests/studio-agile-pro.test.ts`
- **Obiettivo:** Copertura completa dei nuovi endpoint REST, contratti Zod, logica di sblocco War Room e rendering UI del Web Studio Pro.
- **Esito:** 4 nuovi test passati al 100%. Risultato globale: **49 test suite passate su 49, 349/349 test passati (100%), 0 errori in `npm run typecheck` e build pulita compilata in `dist/`**.

---

## 🏃 Sprint 19: Self-Evolving Tooling & Dynamic Just-In-Time MCP Synthesis (Completato ✅ — Ratificato da RFC-006)

### 🎫 TCK-19.0: Tech Validation Spike (Sprint 19) (Completato ✅)
- **Epica:** Self-Evolving Tooling & JIT MCP
- **Assegnato a:** Engineering Lead & AI Lead (Domain Leads L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-19-validation.md`
- **Obiettivo:** Ricerca e validazione architetturale su sandboxing `node:worker_threads`, scansione statica AST pre-esecuzione (`DynamicToolAstGuard`), Pre-Flight Verification Gate con fixture sintetiche e registro MCP a caldo con TTL ed evizione automatica.
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato al 100% via Zod e `tests/spikes.test.ts`.

### 🎫 TCK-19.1: Capability Gap Detector & Dynamic Tool Synthesizer (Completato ✅)
- **Epica:** Self-Evolving Tooling & JIT MCP
- **Assegnato a:** Core Leaf Developer L3 (Supervisione AI & Context Harness Lead L2)
- **File target:** `src/mcp/synthesizer.ts`
- **Obiettivo:** Rilevare automaticamente i gap di capability rispetto al catalogo attivo (`detectCapabilityGap`), inferire il minimo privilegio (`fs:read`, `fs:write`, `network:loopback`, `env:read`) e sintetizzare metadati `DynamicMcpToolSchema` + codice ESM con validazione JSON Schema draft-07 (`synthesizeDynamicMcpTool`).
- **Esito:** Implementato con successo e validato in `tests/dynamic-mcp.test.ts`.

### 🎫 TCK-19.2: AST Security Guard & Isolated Worker-Thread Sandbox Runner (Completato ✅)
- **Epica:** Deterministic Security & Sandboxing
- **Assegnato a:** Security Leaf Developer L3 (Supervisione Engineering Lead & QA Lead L2)
- **File target:** `src/mcp/sandbox-runner.ts`
- **Obiettivo:** Scansione statica preventiva `verifyDynamicToolAst` (`DynamicToolAstGuard`) per bloccare `child_process`, `eval`, `new Function`, `process.env`, scritture disco e rete non autorizzate; esecuzione isolata in `node:worker_threads` (`runDynamicToolInSandbox`) con memory cap V8 (128MB old gen) e hard timeout deterministico.
- **Esito:** Implementato con successo e validato in `tests/dynamic-mcp.test.ts`.

### 🎫 TCK-19.3: Dynamic MCP Hot-Reload Registry, Lazy Discovery & TTL Lifecycle (Completato ✅)
- **Epica:** MCP Interoperability & Context as RAM
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/mcp/dynamic-registry.ts`
- **Obiettivo:** Registro a caldo `DynamicMcpRegistry` con blocco Fail Loudly per tool non certificati `TEST_PASSED`, Lazy Tool Discovery (`discoverLazyMetadata` espone solo `name` e `description`), auto-promozione a `PROMOTED_PERMANENT` e auto-evizione TTL (`evictExpiredTools`) a stato `EXPIRED`.
- **Esito:** Implementato con successo e validato in `tests/dynamic-mcp.test.ts`.

### 🎫 TCK-19.4: Synthetic Fixture Generator, Pre-Flight Verification & Test Suite (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA & Security Lead L2
- **File target:** `src/mcp/fixture-generator.ts`, `tests/dynamic-mcp.test.ts`
- **Obiettivo:** Generazione automatica di 3 categorie di fixture sintetiche (`HAPPY_PATH`, `BOUNDARY_EDGE`, `NEGATIVE_MALFORMED`) da `inputSchemaJson`, gate pre-volo `runPreFlightVerification` ("Zero Unverified Dynamic Code") e test suite completa di Sprint 19.
- **Esito:** 14/14 test passati in `tests/dynamic-mcp.test.ts`. Risultato globale: **51/51 test suite passate, 370/370 test passati (100%), 0 errori TypeScript in `npm run typecheck` e build pulita in `dist/`**.

---

## 🏃 Sprint 17: Enterprise Dogfooding & Multi-Repo Live Attach (`fitness_project`) (Completato ✅ — Fase 5)

### 🎫 TCK-17.1: Environment Doctor & CLI `agentic-company doctor` (Completato ✅)
- **Epica:** Toolchain Diagnostics & DevEx
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/doctor.ts`, `src/doctor/health.ts`, `src/cli/commands/doctor.ts`, `src/cli/dispatcher.ts`
- **Obiettivo:** Diagnostica parallela (`Promise.allSettled`) con `execFile` e `AbortSignal.timeout(3000)` per `git`, `python3`, `.venv`, `swiftc`, `docker`, e comando CLI `agentic-company doctor [path] --json`.
- **Esito:** Implementato con successo e validato in `tests/dogfooding-sprint17.test.ts`.

### 🎫 TCK-17.2: Cross-Domain Contract Synchronizer (Python Pydantic v2 <-> Swift 6 Codable/Sendable) (Completato ✅)
- **Epica:** Cross-Domain Interoperability
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/contracts/sync.ts`, `src/sync/contract-sync.ts`
- **Obiettivo:** Generazione deterministica di modelli Python Pydantic v2 (`ConfigDict(populate_by_name=True, from_attributes=True)` e `Field(..., alias="camelCase")`) e struct Swift 6 (`Codable, Sendable, Hashable, Identifiable` con `nonisolated private enum CodingKeys: String, CodingKey`), con scrittura atomica POSIX e verifica d'idempotenza SHA-256.
- **Esito:** Implementato con successo e validato in `tests/dogfooding-sprint17.test.ts`.

### 🎫 TCK-17.3: Live Multi-Repo Dogfooding Runner su `/Users/stequar/fitness_project` (Completato ✅)
- **Epica:** Enterprise Dogfooding (Fase 5)
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/dogfooding/fitness-runner.ts`
- **Obiettivo:** Esecuzione reale delle 5 fasi (`INSPECT`, `DOCTOR`, `DRY_RUN_ATTACH`, `LIVE_ATTACH_AND_IDEMPOTENCY`, `CROSS_DOMAIN_CONTRACT_SYNC`) su `/Users/stequar/fitness_project`, generando i Domain Lead `mobile_manager` (Swift MVVM) e `backend_manager` (FastAPI), verificando `AGENTS.md.bak` e sincronizzando i modelli `Exercise` e `UserProfile` in `src/backend/api/synced_schemas.py` e `src/ios/FitnessApp/Models/SyncedModels.swift`.
- **Esito:** Completato e verificato live sul workspace `/Users/stequar/fitness_project` (`idempotencyVerified: true`).

### 🎫 TCK-17.4: Test Suite Sprint 17 & Deterministic Gatekeeper Verification (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA & Security Lead L2
- **File target:** `tests/dogfooding-sprint17.test.ts`
- **Obiettivo:** Copertura rigorosa di Environment Doctor, CLI `doctor`, Cross-Domain Contract Synchronizer e pipeline in 5 fasi su `/Users/stequar/fitness_project`.
- **Esito:** 6/6 test passati in `tests/dogfooding-sprint17.test.ts`. Risultato globale: **52/52 test suite passate, 376/376 test passati (100%), 0 errori TypeScript in `npm run typecheck` e build pulita in `dist/`**.

---

## 🏃 Sprint 17.5: Brownfield Symbiosis, Autonomous Domain Expert Synthesis & 5-Phase Holistic Bootstrap (Completato ✅ — Ratificato da RFC-007)

### 🎫 TCK-17.5.0: Tech Validation Spike & Brownfield Symbiosis Audit (Completato ✅)
- **Epica:** Brownfield Symbiosis & Smart Adoption (`RFC-007`)
- **Assegnato a:** R&D Lead & Engineering Lead (Domain Leads L2)
- **File target:** `docs/wiki/engineering/spikes/sprint-17-5-validation.md`, `docs/wiki/rnd/rfcs/RFC-007-BROWNFIELD-SYMBIOSIS-AND-SMART-ADOPTION.md`
- **Obiettivo:** Validazione architetturale per Hybrid AST Section Grafting (`<!-- AGENTIC-OS:MANAGED:START/END -->`), ontologia organizzativa Tri-Ring (`Ring-0`, `Ring-1`, `Ring-2`), Semantic Domain Mining da codice/SQL/wiki, Semantic Drift Detector e ciclo olistico in 5 fasi (`P0..P4`).
- **Esito:** Completato con successo. Verdetto: `APPROVED`. Validato via Zod in `tests/spikes.test.ts`.

### 🎫 TCK-17.5.1: Non-Destructive Brownfield Smart-Merge & Managed Sentinel Blocks (Completato ✅)
- **Epica:** Brownfield Symbiosis & Zero Dark-Memory
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/attach/smart-merge.ts`, `src/attach/injector.ts`
- **Obiettivo:** Implementare `graftManagedSection` con blocchi sentinella `<!-- AGENTIC-OS:MANAGED:START id="..." sha256="..." -->` per preservare al 100% la documentazione, le epiche e i ticket preesistenti nei progetti Brownfield, indicizzando automaticamente tutti i file in `docs/wiki/**` (`discoverAllWikiFiles`) e garantendo idempotenza assoluta (`SKIPPED_UNCHANGED`).
- **Esito:** Implementato con successo e validato in `tests/brownfield-symbiosis.test.ts`.

### 🎫 TCK-17.5.2: Deep Polyglot Crawler, Hermetic Runner & Autonomous Domain Miner (Completato ✅)
- **Epica:** Tri-Ring Org Synthesis & Hermetic Toolchain
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione AI Lead & Engineering Lead L2)
- **File target:** `src/contracts/brownfield.ts`, `src/inspector/detector.ts`, `src/inspector/domain-miner.ts`
- **Obiettivo:** Rilevamento nativo di `.sql` e manifest annidati, catena di precedenza ermetica `.venv/bin/pytest > uv run pytest > poetry run pytest > pytest` (`resolveHermeticTestCommands`), e `mineRepositoryDomainAndRoles` capace di sintetizzare autonomamente specialisti tech Ring-1 (`database_sql_specialist`, `data_pipeline_specialist`, `devops_container_specialist`) ed esperti di dominio Ring-2 (`medical_rehab_specialist`, `nutrition_metabolic_specialist`, `ai_coaching_specialist`) anche in totale assenza di `AGENTS.md`.
- **Esito:** Implementato con successo e validato in `tests/brownfield-symbiosis.test.ts`.

### 🎫 TCK-17.5.3: Active Domain-Expert Ceremony Routing & Invariant Injection (Completato ✅)
- **Epica:** Autonomous Agile Lifecycle & Domain Governance
- **Assegnato a:** Core Leaf Developer L3 (Supervisione Product Lead & AI Lead L2)
- **File target:** `src/core/ceremony-dispatcher.ts`
- **Obiettivo:** Estendere `CeremonyDispatcher` con `resolveDomainAttendeesForScope` per convocare automaticamente gli esperti Ring-1/Ring-2 quando una cerimonia tocca file nel loro `domainScope` e iniettare le relative `domainInvariants`.
- **Esito:** Implementato con successo e validato in `tests/brownfield-symbiosis.test.ts`.

### 🎫 TCK-17.5.4: Semantic Drift Detector & 5-Phase Holistic Workspace Bootstrap (`P0..P4`) (Completato ✅)
- **Epica:** Holistic Workspace Bootstrap & Contract Reverse-Engineering
- **Assegnato a:** Integrations Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/sync/contract-introspector.ts`, `src/bootstrap/holistic-bootstrap.ts`, `src/cli/commands/bootstrap.ts`, `src/cli/dispatcher.ts`
- **Obiettivo:** Implementare `introspectAndDetectDrift` (rilevazione automatica di `TYPE_MISMATCH` come `Exercise.id` `int` vs `UUID` e `MISSING_CODING_KEYS`) e l'orchestratore `runHolisticWorkspaceBootstrap` + CLI `agentic-company bootstrap [path] --json` che esegue le 5 fasi `P0..P4`, pre-sintetizza un tool MCP JIT (`HOT_LOADED`) e genera `.company-os/{org-chart,contracts,invariants,config,bootstrap-report}.json`.
- **Esito:** Implementato e verificato live su `/Users/stequar/fitness_project` e nella test suite.

### 🎫 TCK-17.5.5: Test Suite Sprint 17.5 & Zero-Hint Integration Eval Harness (Completato ✅)
- **Epica:** QA & Deterministic Gatekeeper
- **Assegnato a:** QA & Security Lead L2
- **File target:** `src/contracts/eval.ts`, `src/eval/integration-harness.ts`, `tests/brownfield-symbiosis.test.ts`, `tests/integration-eval.test.ts`, `docs/wiki/qa/integration-eval-plan.md`, `docs/wiki/qa/fitness-project-eval-report.md`
- **Obiettivo:** Verifica deterministica di Smart-Merge, Domain Mining senza `AGENTS.md`, Ceremony Routing con invarianti di dominio, Drift Detection, Holistic Bootstrap `P0..P4`, e Zero-Hint Integration Evaluation Framework (`E1..E6`) con Clean-Slate Reset e Blind Application Sprint su `fitness_project`.
- **Esito:** 4/4 test passati in `tests/brownfield-symbiosis.test.ts` e 2/2 test passati in `tests/integration-eval.test.ts` (Scorecard `100/100 CERTIFIED_EXCELLENT`). Risultato globale: **54/54 test suite passate, 383/383 test passati (100%), 0 errori TypeScript in `npm run typecheck` e build pulita in `dist/`**.

---

## 🏃 Sprint 17.6: The Executive & R&D Operating Protocol v2 & Workflow Eval Harness (`W1..W7`) (In Corso ⏳)

### 🎫 TCK-17.6.1: Workflow Behavioral Evaluation Contract & Harness (In Corso ⏳)
- **Epica:** Autonomous Multi-Agent Governance & Behavioral Eval
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione Engineering Lead & QA Lead L2)
- **File target:** `src/contracts/workflow-eval.ts`, `src/eval/workflow-eval-harness.ts`, `docs/wiki/qa/workflow-eval-plan.md`
- **Obiettivo:** Definire i 7 assi comportamentali (`W1..W7`) e l'harness di valutazione deterministica per certificare l'identità del CTO Co-Founder, il Cognitive Forcing Gate, il routing Tri-Ring e le cerimonie agili.
- **Stato:** `IN_PROGRESS` (Test implementato in `tests/workflow-eval.test.ts`).

### 🎫 TCK-17.6.2: Deterministic Cognitive Forcing Gate in State Machine (Completato ✅)
- **Epica:** Cognitive Forcing Functions & Anti-Rush Gate
- **Assegnato a:** Core Leaf Developer L3 (Supervisione CTO & QA Lead L2)
- **File target:** `src/core/state-machine.ts`, `src/core/types.ts`
- **Obiettivo:** Impedire salti non autorizzati a `SPECIFY` o `IMPLEMENT` di fronte ad anomalie o bug senza RootCauseAnalysisReport completo (3+ Whys, 2+ specialisti, systemic principle) e approvazione CEO (`ceoApproved === true`).
- **Esito:** Implementato e verificato in `tests/workflow-eval.test.ts`.

### 🎫 TCK-17.6.3: Top-of-File CTO Persona & YAML Skills Alignment (Completato ✅)
- **Epica:** Executive CTO Operating Protocol & Conversational Ergonomics
- **Assegnato a:** DevEx Leaf Developer L3 (Supervisione Product Lead L2)
- **File target:** `AGENTS.md`, `.agents/skills/*/SKILL.md`
- **Obiettivo:** Aggiornare l'identità CTO in 2ª persona imperativa, protocollo di saluto a 3 opzioni e dotare le 4 skill (`run-company`, `investigate-anomaly`, `rnd-roundtable`, `gatekeeper-audit`) di frontmatter YAML standardizzato alle prime 4 righe.
- **Esito:** Aggiornato e verificato per `agentic_company_os`.

### 🎫 TCK-17.6.4: Dual-Brain CLI Bridge & Merkle Canonical Serializer (In Corso ⏳)
- **Epica:** Deterministic Dual-Brain & Cryptographic Audit Trail
- **Assegnato a:** Backend Leaf Developer L3 (Supervisione Engineering Lead L2)
- **File target:** `src/cli/commands/workflow.ts`, `src/core/audit-logger.ts`
- **Obiettivo:** Fornire il comando CLI `agentic-company workflow (status|route|verify-gate)` per sincronizzare lo stato runtime con la chat, e correggere la discrepanza tra `canonicalJsonStringify` e `JSON.stringify` sulle proprietà `undefined` per garantire integrità Merkle al 100%.
- **Stato:** `TODO` (Root cause identificata e verificata).

### 🎫 TCK-17.6.5: Self-Hosting Generator Synchronization & Target Verification (In Corso ⏳)
- **Epica:** 100% Self-Hosting DNA Symmetry
- **Assegnato a:** Systems Leaf Developer L3 (Supervisione CTO & Engineering Lead L2)
- **File target:** `src/generator/roles.ts`, `src/attach/smart-merge.ts`, `src/attach/injector.ts`
- **Obiettivo:** Allineare i generatori di bootstrap affinché `fitness_project` e qualunque altro target ricevano la medesima struttura di governance di `agentic_company_os`. Eseguire test live su terminale.
- **Stato:** `TODO`.

---

<!-- AGENTIC-OS:MANAGED:START id="product-backlog-governance" sha256="ff1867d7e25f48ed68e3e20c8053237542e5e9acd55906dff1d70b295881b06f" -->
# Product & Engineering Backlog

> Operational registry of epics, spikes, and atomic development tickets for the workspace.

---

## 📌 Ticket Conventions

- `EPIC-X`: High-level strategic initiative.
- `TCK-X.Y`: Atomic ticket assignable to an L2 Domain Lead or L3 Leaf Engineer.
- **Allowed States**: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.

---

## 🚀 Initial Project Tickets

### EPIC-1: Workspace Initialization & Multi-Agent Governance
- [x] **TCK-1.1**: Execute Agentic System OS workspace bootstrap.
  - *Status*: `DONE`
  - *Description*: Configure `AGENTS.md`, `CLAUDE.md`, operational skills, and Knowledge Base in `docs/wiki/`.
- [ ] **TCK-1.2**: Verify and calibrate deterministic test commands.
  - *Status*: `TODO`
  - *Description*: Validate that the detected stack test commands run cleanly in local and CI environments.

### EPIC-2: Domain Architecture & Module Contracts
- [ ] **TCK-2.1**: Define domain data contracts and typed interfaces.
  - *Status*: `TODO`
  - *Description*: Specify typed schemas and models for core business entities.
- [ ] **TCK-2.2**: Implement core domain services and application logic.
  - *Status*: `TODO`
  - *Description*: Develop primary components in accordance with architectural invariants.

### EPIC-3: Testing, Quality Assurance & Hardening
- [ ] **TCK-3.1**: Expand unit test suite for domain logic.
  - *Status*: `TODO`
  - *Description*: Cover logical branches and edge cases across critical domain paths.
- [ ] **TCK-3.2**: Integrate Deterministic Gatekeeper into the development workflow.
  - *Status*: `TODO`
  - *Description*: Ensure no merge occurs without passing all automated verification checks.
<!-- AGENTIC-OS:MANAGED:END id="product-backlog-governance" -->
