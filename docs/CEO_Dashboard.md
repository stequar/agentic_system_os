# 📊 CEO Dashboard — Agentic Company OS

## 🏁 Sprint 1.5: Pre-Sprint Tech Validation Framework
- **Status:** COMPLETATO ✅
- **Obiettivo dello Sprint:** Creare il protocollo deterministico per cui l'Engineering Lead verifica ogni scelta tecnica e tool tramite ricerca web prima dell'implementazione di ogni sprint.
- **Deliverable:** Contratto Zod `TechValidationReportSchema` (`src/contracts/research.ts`), stato `TECH_VALIDATION` nella Macchina a Stati, protocollo operativo in `docs/wiki/engineering/tech-validation-protocol.md`.

---

## 🏁 Sprint 2: Dynamic Role & Team Generator + Workspace Attach
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Obiettivo dello Sprint:** Generare ruoli e prompt Lead specializzati a partire dallo stack rilevato e iniettare in sicurezza l'architettura aziendale su qualsiasi repo target.
- **Deliverable Consegnati:**
  - `TCK-2.1`: Generatore dinamico di ruoli con Kernel Modulare Karpathy (`src/generator/roles.ts`, `src/generator/templates/`).
  - `TCK-2.2`: Modulo sicuro POSIX Write-Sync-Rename (`src/utils/fs-atomic.ts`) e comando CLI `agentic-company attach` (`src/attach/injector.ts`, `src/index.ts`).
- **Deterministic Gatekeeper:** 
  - `npm run typecheck`: 0 errori.
  - `npm test`: 8 suite passate, 74/74 test passati (100%).
  - `npm run build`: compilazione `dist/` completata con successo.
- **Validazione su `fitness_project`:** Simulazione live `--dry-run` eseguita con successo; identificati ed erogati i Domain Lead specializzati `Mobile Engineering Lead [L2]` (Swift MVVM) e `Backend Engineering Lead [L2]` (FastAPI).

---

---

## 🏁 Sprint 3 / Sprint 17: Dogfooding Live Attach & Cross-Domain Contract Handshake
- **Status:** COMPLETATO NELLO SPRINT 17 (FASE 5) ✅
- **Nota:** Sospeso inizialmente per maturare l'infrastruttura dell'OS e portato a compimento integrale nello Sprint 17 su `/Users/stequar/fitness_project`.

---

## 🏁 Sprint 4: Universal Multi-Stack & Modular Plugin Core
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-001 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Trasformare l'Agentic Company OS in un motore universale ed estendibile per l'open source.
- **Deliverable Consegnati:**
  - `TCK-4.1`: **Universal Multi-Stack Scaffolding Engine** (`src/inspector/detector.ts`, `src/generator/roles.ts`, `src/generator/templates/roles-prompts.ts`): supporto completo e idiomatico per **Go** (`go_manager`), **Rust** (`rust_manager`), **Kotlin Multiplatform** e **Flutter/Dart** (`mobile_manager`).
  - `TCK-4.2`: **Modular Plugin Architecture & Zod SDK** (`src/contracts/plugins.ts`, `src/plugins/loader.ts`, `src/plugins/runner.ts`): caricamento dinamico, sandboxing sicuro su `node:worker_threads` (128MB max heap, hard timeout 3000ms via `worker.terminate()`, IPC tipizzato Zod).
  - `TCK-4.3`: **Model Context Protocol (MCP) Server & Client Bridge** (`src/contracts/mcp.ts`, `src/mcp/server.ts`, `src/mcp/client.ts`, comando CLI `agentic-company mcp`): server stdio con stdout pulito (zero inquinamento per Cursor/Claude Desktop) che espone `inspect_stack`, `run_gatekeeper`, `run_doctor`; client bridge con Lazy Tool Discovery ("Context as RAM").
  - `TCK-4.4`: **Test Suites Complete** (`tests/universal-stack.test.ts`, `tests/plugins.test.ts`, `tests/mcp.test.ts`).
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **13/13 test suite passate, 108/108 test passati (100%)**.

---

## 🏁 Sprint 5: Autonomous Self-Healing Gatekeeper & Open-Source DevEx
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-001 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Dotare l'OS di un motore autonomo di auto-guarigione dai test falliti protetto da guardrail ferrei e offrire un'esperienza onboarding open source ultra-rapida.
- **Deliverable Consegnati:**
  - `TCK-5.1`: **Structured Diagnostic Parsers & AST Coordinates** (`src/contracts/healing.ts`, `src/gatekeeper/parsers/`): parser dedicati per `tsc`, `vitest`, `pytest`, `cargo` e `go test` con mappatura su `DiagnosticViolationSchema` (`filePath`, `line`, `column`, `ruleOrCode`, `message`).
  - `TCK-5.2`: **Autonomous Self-Healing Closed Loop Runner** (`src/gatekeeper/self-healing.ts`): loop chiuso di remediation con budget rigoroso di massimo 3 iterazioni, pre-flight snapshot in RAM e atomic rollback automatico al 100% in blocco protetto su mancata convergenza.
  - `TCK-5.3`: **AST Diff Guard & Scope Enforcement Rule Engine** (`src/gatekeeper/ast-guard.ts`): salvaguardia deterministica con `Test Preservation Invariant` (divieto di rimozione/commento di test o asserzioni `expect`/`assert`) e `Scope Enforcement Invariant` (divieto di alterazioni fuori dai file autorizzati dal ticket o su file critici).
  - `TCK-5.4`: **Interactive CLI Scaffolding Wizard** (`src/cli/wizard.ts`, `agentic-company init`): onboarding interattivo ad alta leggibilità con `@clack/prompts`, auto-detection monorepo/multi-workspace (`pnpm`, `npm`, `cargo`) e modalità headless non-bloccante (`--yes`/`--non-interactive`/`--json` e fallback `!process.stdin.isTTY`).
  - `TCK-5.5`: **Test Suites Complete** (`tests/diagnostic-parsers.test.ts`, `tests/diff-guard.test.ts`, `tests/self-healing.test.ts`, `tests/wizard.test.ts`).
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **17/17 test suite passate, 136/136 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🔬 Ciclo 2 R&D: Enterprise Autonomy, Checkpointing & Security Guardrails
- **Status:** CONSENSO RAGGIUNTO & SOTTOSCRITTO DAI LEAD ✅ (`RFC-002`)
- **Origine:** Richiesta strategica del CEO (*"non siamo ancora pronti per il rilascio"*).
- **Processo Multi-Agente Autentico:**
  - 1:1 condotti realmente con i subagenti autonomi (`engineering_lead`, `product_lead`, `qa_lead`).
  - Tavola rotonda con 5 trade-off critici discussi e risolti collegialmente.
- **Decisioni Ratificate in RFC-002:**
  1. **Deterministic State Checkpointing & Session Resume:** WAL su disco (`.company-os/sessions/<id>.json`) con Two-Phase Commit e comando `agentic-company resume` per eliminare l'amnesia post-crash.
  2. **Dual-Tier Secret Leak Prevention & Supply Chain Security:** Intercettore sincrono (<2ms) su prompt e scanner con entropia di Shannon pre-commit; audit vulnerabilità (`npm audit`, etc.) con blocco su `HIGH/CRITICAL` e compliance licenze.
  3. **Git-Native PR Automation & Safe Steering:** Branch automatici `feat/tck-...`, commit convenzionali, PR con Gatekeeper scorecard e comandi cooperativi `pause`, `hint`, `resume`, `abort`.
  4. **Local Web Studio Dashboard:** Server locale su `localhost:4321` con SSE nativi (`node:http`, zero bloat) protetto da token crittografico effimero e strict loopback.
  5. **Token Cost Budget Watchdog & Flaky Test Quarantine ($N=3$):** Hard-cap sui costi API con safe-pause e isolamento deterministico dei test intermittenti per proteggere il Self-Healing.
- **Deterministic Gatekeeper:** 0 errori TypeScript, 141/141 test passati al 100% su 17 suite.

---

---

## 🏁 Sprint 6: Enterprise Resilience & Security Guardrails
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-002 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Risolvere la fragilità dell'amnesia da crash e proteggere l'OS da fughe di credenziali e vulnerabilità nella supply chain.
- **Deliverable Consegnati:**
  - `TCK-6.1`: **Deterministic State Checkpoint & Session Resume Engine** (`src/contracts/session.ts`, `src/core/session-store.ts`, `agentic-company resume`): WAL su disco in `.company-os/sessions/<id>.json`, Two-Phase Commit (`DIRTY_IN_PROGRESS` -> `COMMITTED_SAFEPOINT`), rollback automatico al commit pulito in caso di unclean safe-point.
  - `TCK-6.2`: **Typed Enterprise Event Bus & JSONL Audit Logger** (`src/contracts/events.ts`, `src/core/event-bus.ts`, `src/core/audit-logger.ts`): bus asincrono tipizzato Zod e log audit append-only immutabile su `.company-os/audit.jsonl`.
  - `TCK-6.3`: **Dual-Tier Secret & PII Leak Prevention Gate** (`src/contracts/security.ts`, `src/security/secret-guard.ts`): Tier 1 sincrono in-flight (<2ms) a monte delle chiamate LLM per prefissi noti (`sk-proj`, `ghp_`, `AKIA`, `BEGIN PRIVATE KEY`) e Tier 2 differenziale pre-commit ad entropia di Shannon ($H > 4.5$), con whitelist automatica mock/fixtures.
  - `TCK-6.4`: **Dependency Vulnerability & License Compliance Auditor** (`src/contracts/audit.ts`, `src/security/dependency-auditor.ts`): scanner multi-ecosistema (`npm audit`, `cargo audit`, etc.) con blocco su `HIGH/CRITICAL` e verifica licenze consentite (MIT, Apache-2.0, BSD, ISC).
  - `TCK-6.5`: **Test Suites Complete**: `tests/session-store.test.ts`, `tests/event-bus.test.ts`, `tests/secret-guard.test.ts`, `tests/dependency-auditor.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **21/21 test suite passate, 175/175 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 7: Git-Native Collaboration & Quality Governance
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-002 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Aprire l'OS alla collaborazione ergonomica Human-in-the-Loop senza compromettere l'integrità del codice, implementare flussi Git aziendali nativi con PR Scorecard immutabile, dashboard visiva web locale a zero dipendenze esterne, isolamento test intermittenti e governance finanziaria dei token.
- **Deliverable Consegnati:**
  - `TCK-7.0`: **Tech Validation Spike (Sprint 7)** (`docs/wiki/engineering/spikes/sprint-7-validation.md`): dossier conforme a Zod con validazione architetturale di HITL steering cooperativo, web studio SSE su `node:http`, algoritmo di alternanza $N=3$ e FinOps watchdog.
  - `TCK-7.1`: **Cooperative Safe-Point HITL Steering Engine** (`src/contracts/steering.ts`, `src/core/steering-engine.ts`): comandi cooperativi `pause`, `hint`, `resume`, `abort`. Sospensione controllata al safe-point atomico POSIX con rilascio lock. AST Diff Guard inviolabile a livello kernel: respinta categorica con `HINT_VIOLATES_AST_GUARD` per qualsiasi suggerimento che tenti di saltare o rimuovere test/asserzioni.
  - `TCK-7.2`: **Git-Native Feature Branch, Conventional Commit & Automated PR Generator** (`src/contracts/git.ts`, `src/git/workflow.ts`): isolamento ticket su branch `feat/tck-<id>-<slug>`, commit conformi a Conventional Commits e generazione del body della Pull Request con **Cryptographic Scorecard Tabellare** del Deterministic Gatekeeper.
  - `TCK-7.3`: **Zero-Dependency Embedded Local Web Studio Dashboard** (`src/contracts/studio.ts`, `src/studio/server.ts`, `src/studio/ui.ts`, CLI `agentic-company studio`): server embedded su `127.0.0.1:4321` basato unicamente su `node:http` e Server-Sent Events (SSE) su `/api/events` (<15MB RAM, avvio <30ms, zero dipendenze esterne). Autenticazione con bearer token effimero `0600` in `.agents/.studio-token`, protezione anti-CSRF e DNS rebinding.
  - `TCK-7.4`: **Flaky Test N=3 Detection & Quarantine Engine** (`src/contracts/quarantine.ts`, `src/gatekeeper/quarantine.ts`): campionamento su $N=3$ iterazioni consecutive sullo stesso commit. Quarantena in `.gatekeeper/quarantine.json` **solo** se il test alterna `PASS` e `FAIL`. Se fallisce $3/3$, è classificato come regressione deterministica reale (`DETERMINISTIC_BUG`). Auto-escalation con creazione ticket nel backlog ed evento `FLAKY_TEST_QUARANTINED`.
  - `TCK-7.5`: **Token Cost Budget Watchdog with Safe-Pause & Grace Margin** (`src/contracts/budget.ts`, `src/core/budget-watchdog.ts`): tracciamento token in-flight e calcolo costi in USD multi-modello. Warning all'80% (`BUDGET_WARNING`) e transizione a `SAFE_PAUSED` al 100% con **buffer di grazia del 5%** per completare in sicurezza la transazione POSIX e il checkpoint atomico su disco.
  - `TCK-7.6`: **Comprehensive Test Suites Complete**: `tests/steering.test.ts`, `tests/git-workflow.test.ts`, `tests/studio.test.ts`, `tests/quarantine.test.ts`, `tests/budget-watchdog.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **26/26 test suite passate, 204/204 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

---

## 🔬 Ciclo 3 R&D: Technical Debt Audit, Multi-Agent Collaboration & Agentic Workflow
- **Status:** CONSENSO RAGGIUNTO & RATIFICATO DAL CTO ✅ (`RFC-003`)
- **Origine:** Mandato strategico del CEO (*"audit su technical debt e cooperazione tra i team... con occhio all'agenti workflow"*).
- **Processo Multi-Agente Autentico:**
  - Audit indipendenti condotti da `engineering_lead`, `product_lead` e `qa_lead`.
  - Tre interviste 1:1 formalizzate (`1ON1-2026-10-C3-ENG`, `1ON1-2026-10-C3-PROD`, `1ON1-2026-10-C3-QA`).
  - Tavola rotonda con 4 trade-off architetturali discussi e risolti congiuntamente.
- **Decisioni Ratificate in RFC-003:**
  1. **Test Impact Analysis (TIA) & CLI Modularization:** Gatekeeper a due stadi: inner-loop TIA (<400ms) durante lo sviluppo e full suite pre-merge; scomposizione del monolite `src/index.ts` in comandi isolati.
  2. **Git Worktree Multi-Agent Pool:** Isolamento della concorrenza parallela fino a 4 Leaf Developers simultanei in `.company-os/worktrees/<id>`, azzerando collisioni di file e lockfile.
  3. **Runtime Contract Interceptor & Cryptographic Handoff:** Middleware Zod immediato sui payload inter-agente (*Fail Loudly*) con notarizzazione hash SHA-256 in audit trail e tracciamento First-Pass Yield (FPY).
  4. **Visual Multi-Agent Kanban & Studio Orchestrator:** Kanban board reattiva nativa HTML5/CSS Grid integrata su `localhost:4321` con drag-and-drop e sincronizzazione atomica bidirezionale su disco.
- **Deterministic Gatekeeper:** 0 errori TypeScript, 209/209 test passati al 100% su 26 suite (inclusi i 15 test del ciclo R&D in `tests/rnd-cycle.test.ts`).

---

## 🔬 Ciclo 4 Straordinario R&D: Advanced AI Harness, Context Engineering & Token Optimization
- **Status:** CONSENSO RAGGIUNTO & RATIFICATO DAL CTO ✅ (`RFC-004`)
- **Origine:** Mandato straordinario del CEO (*"ottimizzazione token, managing context window, AI harness... istituire AI Lead"*).
- **Nuovo Ruolo Istituito:** **`ai_lead`** (AI & Context Harness Lead L2).
- **Processo Multi-Agente Autentico:**
  - Audit indipendenti condotti da `ai_lead`, `engineering_lead`, `product_lead` e `qa_lead`.
  - Quattro interviste 1:1 formalizzate (`cycle4-ai-lead.md`, `cycle4-engineering-lead.md`, `cycle4-product-lead.md`, `cycle4-qa-lead.md`).
  - Tavola rotonda con 3 trade-off architetturali discussi e risolti congiuntamente dai 7 Lead.
- **Decisioni Ratificate in RFC-004:**
  1. **Two-Tier Prompt Architecture & Prefix Caching:** Prefisso Tier 1 immutabile con checkpoint di cache effimero (>1024 token) e Tier 2 dinamico per input ed esecuzione, garantendo oltre l'80% di cache hit rate e Time-To-First-Token a <800ms.
  2. **Deterministic Context Compaction & Anti-Rot Memory:** Compattazione a soglia (40k token) vincolata all'Invariant Protection Guardrail: divieto di perdita di file, test o vincoli di ticket; Epistemic Clean-Slate nei loop di self-healing.
  3. **State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder:** Pruning a due fasce dei tool in base all'FSM state (Universal Core Tools + State-Gated Action Tools) e JSON Schema forzato sui logit per eliminare JSON malformati.
  4. **Live Token FinOps Cockpit & Breadcrumb Trajectory:** Monitoraggio visivo in tempo reale dei costi LLM in dollari, differenziazione token cache read/write, tachimetro Context Health (0-100%) e timeline a briciole di pane per ispezionare visivamente le decisioni degli agenti.
- **Deterministic Gatekeeper:** 0 errori TypeScript, 215/215 test passati al 100% su 26 suite (inclusi i 21 test del ciclo R&D in `tests/rnd-cycle.test.ts`).

---

## 🏁 Sprint 10: AI Harness Infrastructure & Anti-Rot Memory Core
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Prioritizzato in via straordinaria dal CEO e ratificato in RFC-004.
- **Obiettivo dello Sprint:** Dotare l'OS di un'infrastruttura AI Harness all'avanguardia con Prompt Caching a prefisso immutabile, compattazione del contesto con Invariant Protection e decodifica vincolata a schema.
- **Deliverable Consegnati:**
  - `TCK-10.0`: **Tech Validation Spike (Sprint 10)** (`docs/wiki/engineering/spikes/sprint-10-validation.md`): dossier validato con Zod e verdetto `APPROVED`.
  - `TCK-10.1`: **Two-Tier Prompt Engine & Universal Prefix Caching** (`src/generator/templates/cached-kernel.ts`, `src/core/prompt-cache-adapter.ts`, `src/contracts/prompts.ts`): prefisso immutabile Tier 1 a token 0 (>1250 token) con supporto per Anthropic (`cache_control: ephemeral`), OpenAI e Gemini (-80% costi token, TTFT <250ms).
  - `TCK-10.2`: **Invariant-Protected Context Compaction & Anti-Rot Memory Core** (`src/core/context-compactor.ts`, `src/contracts/compaction.ts`, `src/gatekeeper/self-healing.ts`): compattazione a soglia (40k token) protetta da `verifyContextInvariants()` non-LLM ed Epistemic Clean-Slate Protocol nel self-healing (<120 token per violazione).
  - `TCK-10.3`: **State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder** (`src/core/tool-scoper.ts`, `src/core/constrained-decoder.ts`, `src/contracts/tools.ts`): pruning FSM a due fasce (>1500 token risparmiati a turno) e decodifica vincolata a strict JSON Schema con auto-riparazione fences.
  - `TCK-10.4`: **Test Suites Complete**: `tests/prompt-caching.test.ts`, `tests/context-compactor.test.ts`, `tests/tool-governor.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **29/29 test suite passate, 240/240 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

---

## 🏁 Sprint 8: Execution Speed, Test Impact Analysis & Safe Concurrency Sandbox
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-003 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Abbattere drasticamente la latenza di feedback del Gatekeeper tramite Test Impact Analysis mirato, disaccoppiare la CLI monolitica in comandi modulari e abilitare la concorrenza parallela a zero collisioni con i Git Worktrees.
- **Deliverable Consegnati:**
  - `TCK-8.0`: **Tech Validation Spike (Sprint 8)** (`docs/wiki/engineering/spikes/sprint-8-validation.md`): dossier conforme a Zod con validazione architetturale di TIA, disaccoppiamento CLI e Git Worktree pool.
  - `TCK-8.1`: **Test Impact Analysis (TIA) Engine & Dependency Graph Mapper** (`src/contracts/tia.ts`, `src/gatekeeper/tia.ts`): crawler AST statico bidirezionale, inner-loop <400ms durante i micro-fix di self-healing (-87.5% di latenza), matrice di invalidazione transitiva se cambiano contratti Zod o file di configurazione, e two-stage verification pre-merge.
  - `TCK-8.2`: **CLI Modular Refactor & Command Dispatcher Decoupling** (`src/cli/context.ts`, `src/cli/dispatcher.ts`, `src/cli/commands/*`, `src/index.ts`): scomposizione di `src/index.ts` in comandi isolati coordinati da `CommandDispatcher`, interfaccia `ExecutionContext` programmabile, eliminazione di `process.exit()` e test CLI in-memory in ~11ms (-99.5% di latenza).
  - `TCK-8.3`: **Git Worktree Multi-Agent Pool & Safe Concurrency Sandbox** (`src/contracts/worktree.ts`, `src/core/worktree-manager.ts`): gestione sicura dei worktree in `.company-os/worktrees/<id>` per consentire fino a 4 Leaf Developers simultanei a zero collisioni, garanzia atomica `withWorktree` in blocco `try/finally`, rebase sequenziale deterministico su `main` e pruning orfani all'avvio dell'OS.
  - `TCK-8.4`: **Test Suites Complete**: `tests/tia.test.ts`, `tests/cli-modular.test.ts`, `tests/worktree.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **32/32 test suite passate, 267/267 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 9: Runtime Contract Integrity, Cryptographic Handoff & Visual Studio Kanban
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-003 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Eliminare il drift silenzioso dei dati a runtime con validazione Zod immediata, garantire la non-ripudiabilità forense degli handoff inter-agente con Merkle Hash-Chaining su disco, fornire una Kanban Board drag-and-drop nativa HTML5/CSS Grid integrata nello Studio Web locale con sync atomico bidirezionale su markdown, e tracciare le metriche aziendali di cooperazione (First-Pass Yield % e cicli medi di self-healing).
- **Deliverable Consegnati:**
  - `TCK-9.0`: **Tech Validation Spike (Sprint 9)** (`docs/wiki/engineering/spikes/sprint-9-validation.md`): dossier conforme a Zod con validazione architetturale di Runtime Contract Interceptor, Merkle Trail, HTML5 Kanban drag-and-drop e First-Pass Yield (FPY).
  - `TCK-9.1`: **Runtime Contract Interceptor Middleware with Zod Fast Validation** (`src/contracts/interceptor.ts`, `src/core/contract-interceptor.ts`, `src/core/state-machine.ts`): validazione Zod `.strict()` su ogni transizione FSM e payload inter-agente con arresto deterministico Fail Loudly ed evento `CONTRACT_VIOLATION`.
  - `TCK-9.2`: **Cryptographic Handoff Notarization & Merkle Trail Logger** (`src/contracts/audit.ts`, `src/core/audit-logger.ts`): catena crittografica lineare ($H_n = \text{SHA256}(H_{n-1} + \text{canonicalJson}(E_n))$), segreto POSIX `0600` in `.company-os/.audit.secret`, firma HMAC-SHA256 per record e verifica deterministica $O(N)$ `verifyAuditChain()`.
  - `TCK-9.3`: **Interactive Visual Kanban Board & Drag-and-Drop Workflow Studio** (`src/contracts/studio.ts`, `src/studio/kanban.ts`, `src/studio/server.ts`, `src/studio/ui.ts`): board reattiva nativa HTML5/CSS Grid (<10KB, zero dipendenze npm), Server-Sent Events (SSE) in tempo reale per `TICKET_STATUS_CHANGED`, e sincronizzazione atomica bidirezionale su `docs/wiki/product/backlog.md` via `atomicWriteFile`.
  - `TCK-9.4`: **Cooperation & Quality Metrics Aggregator** (`src/contracts/metrics.ts`, `src/core/metrics-aggregator.ts`): tracciamento continuo di First-Pass Yield (FPY %), cicli medi di self-healing, tasso di conformità contrattuale e stato di integrità Merkle esposti via `GET /api/metrics` e schede KPI nella Web Dashboard.
  - `TCK-9.5`: **Test Suites Complete**: `tests/contract-interceptor.test.ts`, `tests/audit-merkle.test.ts`, `tests/kanban-studio.test.ts`, `tests/cooperation-metrics.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **36/36 test suite passate, 294/294 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 11: FinOps Observability & Cognitive Trajectory Studio
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-004 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Rendere pienamente visibile, quantificabile e trasparente l'efficienza invisibile introdotta dallo Sprint 10: tracciamento in dollari del costo effettivo e del risparmio netto da Prompt Caching Tier-1, Context Health Meter per prevenire il Context Rot, e visualizzatore di traiettoria cognitiva con lettura inversa tail-first (<5MB).
- **Deliverable Consegnati:**
  - `TCK-11.0`: **Tech Validation Spike (Sprint 11)** (`docs/wiki/engineering/spikes/sprint-11-validation.md`): dossier conforme a Zod con validazione architetturale di FinOps quadri-fascia, algoritmo Context Health continuo piecewise e virtualizzazione tail-first di `audit.jsonl`.
  - `TCK-11.1`: **Live Token FinOps Dashboard & Real-Time Dollar Cost Tracker** (`src/contracts/finops.ts`, `src/core/finops-engine.ts`, `src/core/budget-watchdog.ts`): calcolo real-time di token uncached, cache-read, cache-write e output; quantificazione matematica del risparmio netto ($\Delta_{\text{savings}} = C_{\text{baseline}} - C_{\text{actual}}$) e del Cache Savings Ratio ($\eta$ %), con endpoint `GET /api/finops`.
  - `TCK-11.2`: **Context Health Meter & Proactive Compaction Alerting System** (`src/contracts/health.ts`, `src/core/context-health.ts`): tachimetro visuale (0-100%) con bande operative (EXCELLENT, NOMINAL, ROT_RISK, CRITICAL_ROT) ed emissione automatica di `CONTEXT_HEALTH_ALERT` sul bus con trigger proattivo per `ContextCompactor` a 40k token, con endpoint `GET /api/context-health`.
  - `TCK-11.3`: **Interactive Breadcrumb Trajectory Visualizer & Decision Inspector** (`src/contracts/studio.ts`, `src/core/trajectory-reader.ts`, `src/studio/server.ts`, `src/studio/ui.ts`): reader a ritroso a chunk fissi da 64KB (footprint browser e server costantemente <5MB), classificazione tassonomica dei nodi decisionali (FSM, QUALITY_GATE, SELF_HEALING, FINOPS, STEERING, TOOL), endpoint `GET /api/trajectory` e drawer di ispezione crittografica Merkle/HMAC.
  - `TCK-11.4`: **Test Suites Complete**: `tests/finops.test.ts`, `tests/context-health.test.ts`, `tests/trajectory.test.ts`, `tests/finops-studio.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **40/40 test suite passate, 311/311 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🔬 Ciclo R&D Triplo Straordinario: Leads Taxonomy, AI Tooling & Agile Ceremonies
- **Status:** COMPLETATO & RATIFICATO IN RFC-005 ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Mandato strategico del CEO per ridefinire la tassonomia dei Lead, investigare i tool AI in hype (Caveman Mode, Jev/System-1) ed estendere la meeting topology a cerimonie agili native e protocolli anti-echo-chamber.
- **Deliverable Consegnati:**
  - **Sprint R&D-12 (Tassonomia & Consolidamento Lead):** Audit organigramma in `docs/wiki/rnd/audits/role-taxonomy-and-consolidation.md`, contratti Zod `RoleTaxonomySchema` e `RaciMatrixSchema` in `src/contracts/roles.ts`, matrice RACI deterministica a 8 fasi con Accountable univoco, standardizzazione Micro Role Cards (<150 token per ruolo su Tier-2 prompt caching). Test: `tests/role-taxonomy.test.ts`.
  - **Sprint R&D-13 (Next-Gen AI Tooling Spike):** Dossier di ricerca in `docs/wiki/engineering/spikes/sprint-rnd-13-ai-tooling.md` con validazione Caveman Mode (taglio del 77.6% dei token di output su machine-to-machine handoffs), Kahneman System-1 fast decision gate (Jev model approach a latenza sub-10ms e costo $0 per routing deterministico), Aider Architect/Editor pattern per separare pianificazione da patching diff, e DSPy-style typed signatures. Test: `tests/spikes.test.ts`.
  - **Sprint R&D-14 (Agile Ceremonies & Inter-Agent Protocol):** Dossier in `docs/wiki/rnd/audits/agile-ceremonies-and-communication-efficiency.md` e RFC-005 ratificato in `docs/wiki/rnd/rfcs/RFC-005-AGILE-CEREMONIES-AND-COLLABORATION-PROTOCOL.md`. Codificate 5 cerimonie native (`BRAINSTORMING_KICKOFF`, `BACKLOG_REFINEMENT_1ON1`, `ARCHITECTURE_REVIEW_ROUNDTABLE`, `INCIDENT_WAR_ROOM`, `SPRINT_RETROSPECTIVE`), protocollo Caveman-RPC machine-facing (-75% token bloat), ruolo obbligatorio Devil's Advocate / Red-Teamer per evitare echo-chambers, limite di convergenza a 2 round con CTO Tie-Break Rule, e trigger deterministico Incident War Room con rollback atomico su failure 3/3. Contratti: `src/contracts/ceremonies.ts`. Test: `tests/ceremonies.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **42/42 test suite passate, 325/325 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

## 🏁 Sprint 15: Agile Ceremonies Engine & Caveman-RPC Core
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & E2E Autonomous Verified)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-005 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Rendere gli agenti pienamente autonomi attraverso l'orchestrazione nativa delle 5 cerimonie agili, il protocollo Caveman-RPC machine-to-machine, il routing System-1 a costo $0, il dissenso strutturato con Devil's Advocate e l'Incident War Room con rollback atomico su failure 3/3, eliminando la necessità di micromonitoraggio da parte del CEO.
- **Deliverable Consegnati:**
  - `TCK-15.1`: **Caveman-RPC Telegraphic Formatter & Zero-Fluff Enforcer** (`src/core/caveman-formatter.ts`, `tests/caveman-formatter.test.ts`): envelope `[CAVEMAN-RPC]` conforme a `TelegraphicMessageSchema`. Eliminazione automatica di convenevoli e preamboli con preservazione verificata al 100% di codice, path, hash SHA-256 e comandi (`verifyPreservation`).
  - `TCK-15.2`: **Kahneman System-1 Fast Decision Gate** (`src/core/fast-decision-gate.ts`, `tests/fast-decision-gate.test.ts`): classificatore deterministico non-autoregressivo per triage e sicurezza in sub-10ms a costo token nullo ($0): FAST_APPROVE su azioni sicure/deterministico, FAST_REJECT immediato su secret leak o percorsi protetti (.git, .env, node_modules), ed ESCALATE_TO_SYSTEM2 su complessità architetturale.
  - `TCK-15.3`: **Agile Ceremonies Dispatcher & Lifecycle Orchestrator** (`src/core/ceremony-dispatcher.ts`, `tests/ceremony-dispatcher.test.ts`): automazione delle 5 cerimonie agili native (Brainstorming, Refinement 1:1, Architecture Review, War Room, Retrospective). Persistenza di verbali JSON e Markdown in `.company-os/ceremonies/` ed emissione eventi su `CompanyEventBus`.
  - `TCK-15.4`: **Incident War Room Circuit Breaker & Rollback Engine** (`src/gatekeeper/war-room.ts`, `src/gatekeeper/self-healing.ts`, `tests/war-room.test.ts`): scatto automatico su Self-Healing 3/3 failure o violazione di sicurezza con revoca immediata del write lock, rollback atomico allo snapshot integro SHA-256, convocazione War Room e piano di remediation guidato.
  - `TCK-15.5`: **Anti-Echo-Chamber Consensus Engine con Devil's Advocate & Tie-Break** (`src/core/consensus-engine.ts`, `tests/consensus-engine.test.ts`): convergenza rigorosa a 2 round con Devil's Advocate obbligatorio (`DevilsAdvocateFeedbackSchema`) e Tie-Break decisionale automatico del CTO per sbloccare ogni dissenso orizzontale senza coinvolgere il CEO.
  - `TCK-15.6`: **E2E Autonomous Agile Simulation** (`tests/e2e-autonomous-agile.test.ts`): simulazione end-to-end con esecuzione reale e sequenziale delle 5 cerimonie, interazione multi-agente, risoluzione dissenso e ripristino da incidente senza alcun intervento del CEO.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **48/48 test suite passate, 345/345 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

## 🏁 Sprint 16: Studio Pro — Agile Ceremony Board, Live War-Room & Fluff Telemetry
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità da tutti i Lead nell'RFC-005 (`RATIFIED_BY_CTO`).
- **Obiettivo dello Sprint:** Potenziare l'Agentic Web Studio locale (`localhost:4321`) con gli strumenti di visualizzazione agili ed emergenziali, rendendo accessibili e trasparenti le cerimonie, lo stato della War Room e l'efficienza token di Caveman Mode.
- **Deliverable Consegnati:**
  - `TCK-16.1`: **Agile Ceremony Board & Meeting Timeline** (`src/studio/agile-handler.ts`, `src/studio/server.ts`, `src/studio/ui.ts`): endpoint `GET /api/ceremonies` con scansione e restituzione paginata/ordinata delle cerimonie agili e retrospettive in `.company-os/ceremonies/`. Sezione visiva responsive nel Local Web Studio con badge cromatici per ciascuna cerimonia (Brainstorming, Refinement, Roundtable, War Room, Retrospective) e indicatori FPY % per le retrospettive.
  - `TCK-16.2`: **Live Incident War-Room Cockpit & Interactive Rollback Controller**: endpoint `GET /api/war-room` e `POST /api/war-room/resolve` per il monitoraggio e la risoluzione guidata degli incidenti critici. Banner di emergenza pulsante rosso ad alta visibilità nella dashboard web attivo in presenza di Write Lock, con visualizzazione della causa radice, hash SHA-256 ripristinato, piano di contenimento e pulsante interattivo per la risoluzione e sblocco.
  - `TCK-16.3`: **Token Fluff Telemetry & Caveman Compression Gauge** (`src/core/fluff-telemetry.ts`): calcolo deterministico cumulativo dei token verbose intercettati, token eliminati dal Caveman Formatter, percentuale di fluff tagliato e stima dei dollari risparmiati. Endpoint `GET /api/fluff-telemetry` e tachimetro a 5 colonne nella griglia FinOps della dashboard.
  - `TCK-16.4`: **Test Suite Sprint 16**: suite completa in `tests/studio-agile-pro.test.ts`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **49/49 test suite passate, 349/349 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

## 🔬 Ciclo R&D Creativo Straordinario: Horizon Scanning & Self-Evolving Ecosystem
- **Status:** COMPLETATO & RATIFICATO IN RFC-006 ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Mandato straordinario del CEO (*"arricchire la roadmap, convoca R&D, stavolta senza particolari indicazioni, fallo lavorare in modo creativo"*).
- **Deliverable Consegnati:**
  - **Dossier di Ricerca di Frontiera:** [`docs/wiki/rnd/audits/horizon-scanning-creative-frontiers.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/audits/horizon-scanning-creative-frontiers.md) con indagine su 5 breakthrough tecnologici per il 2026+.
  - **Consensus Blueprint RFC-006:** [`docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md) approvato all'unanimità dai 7 Lead con risoluzione di 4 trade-off e 19 ticket operativi.
  - **Contratti Zod Tipizzati:** [`src/contracts/frontiers.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/frontiers.ts) (`DynamicMcpToolSchema`, `NeuroSymbolicProofSchema`, `SlmDistillationTraceSchema`, `ChaosFaultInjectionSchema`, `CreativeHorizonDossierSchema`).
  - **Nuova Macro-Fase Ratificata nella Roadmap:** **FASE 6: Next-Gen Autonomous Frontiers & Self-Evolving Ecosystem** (Sprint 19-23: JIT MCP Tool Synthesis, Neuro-Symbolic Invariant Prover, Zero-Cost Local SLM Distillation, Antifragile Chaos Monkey, Living Spatial Canvas & Voice Director).
  - **Test Suite Vitest:** [`tests/horizon-frontiers.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/horizon-frontiers.test.ts) (6 test passati).
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori (Strict Mode)**.
  - `npm test`: **50/50 test suite passate, 355/355 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 19: Self-Evolving Tooling & Dynamic Just-In-Time MCP Synthesis
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green)
- **Origine:** Ratificato all'unanimità nell'RFC-006 (Next-Gen Frontiers Blueprint 2026+).
- **Obiettivo dello Sprint:** Permettere agli agenti di colmare autonomamente le proprie lacune operative sintetizzando micro-server e tool MCP tipizzati in TypeScript, testati preventivamente ed eseguiti in sandbox isolate con ciclo di vita effimero e promozione automatica.
- **Deliverable Consegnati:**
  - `TCK-19.0`: **Tech Validation Spike (Sprint 19)** ([`docs/wiki/engineering/spikes/sprint-19-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-19-validation.md)): dossier conforme al 100% a `TechValidationReportSchema` e validato in [`tests/spikes.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spikes.test.ts).
  - `TCK-19.1`: **Capability Gap Detector & Dynamic Tool Synthesizer** ([`src/mcp/synthesizer.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/synthesizer.ts)): rilevamento deterministico dei gap di capability rispetto al catalogo attivo (`detectCapabilityGap`), inferenza automatica dei permessi secondo il principio del minimo privilegio e sintesi di metadati `DynamicMcpToolSchema` + codice ESM con validazione JSON Schema draft-07 (`synthesizeDynamicMcpTool`).
  - `TCK-19.2`: **AST Security Guard & Isolated Worker-Thread Sandbox Runner** ([`src/mcp/sandbox-runner.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/sandbox-runner.ts)): scansione statica preventiva `verifyDynamicToolAst` / `DynamicToolAstGuard` (blocco di `child_process`, `cluster`, `vm`, `v8`, `eval`, `new Function`, ed esfiltrazione non autorizzata di `process.env`, filesystem o rete) ed esecuzione isolata in `node:worker_threads` (`runDynamicToolInSandbox`) con memory cap V8 (max 128MB old gen, 32MB young gen), stdout silenziato per proteggere JSON-RPC e hard timeout deterministico (`worker.terminate()`).
  - `TCK-19.3`: **Dynamic MCP Registry, Lazy Discovery & TTL Eviction** ([`src/mcp/dynamic-registry.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/dynamic-registry.ts)): registro a caldo `DynamicMcpRegistry` con blocco *Fail Loudly* per qualsiasi tool privo di stato `TEST_PASSED`, Lazy Tool Discovery conforme a Karpathy *"Context as RAM"* (`discoverLazyMetadata`), auto-promozione a `PROMOTED_PERMANENT` dopo $N$ invocazioni senza errori e garbage collection `evictExpiredTools` con transizione a `EXPIRED`.
  - `TCK-19.4`: **Synthetic Fixture Generator, Pre-Flight Verification & Test Suite** ([`src/mcp/fixture-generator.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/fixture-generator.ts), [`tests/dynamic-mcp.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/dynamic-mcp.test.ts)): generatore automatico di fixture `HAPPY_PATH`, `BOUNDARY_EDGE` e `NEGATIVE_MALFORMED` da `inputSchemaJson`, gate pre-volo `runPreFlightVerification` (*"Zero Unverified Dynamic Code"*) e suite completa con 14 test unitari e d'integrazione.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **51/51 test suite passate, 370/370 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 17: Enterprise Dogfooding & Multi-Repo Live Attach (`fitness_project`)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Live Verified)
- **Origine:** Fase 5 della Master Roadmap & sblocco operativo del dogfooding sul repository poliglotto reale [`/Users/stequar/fitness_project`](file:///Users/stequar/fitness_project).
- **Obiettivo dello Sprint:** Validare sul campo l'intero Agentic Company OS su un progetto reale multi-stack (Python FastAPI + iOS SwiftUI + Docker), dotando la CLI dell'Environment Doctor parallelo e del sincronizzatore deterministico di contratti cross-domain Python Pydantic v2 $\leftrightarrow$ Swift 6 `Codable`/`Sendable`.
- **Deliverable Consegnati:**
  - `TCK-17.1`: **Environment Doctor & CLI `agentic-company doctor`** ([`src/contracts/doctor.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/doctor.ts), [`src/doctor/health.ts`](file:///Users/stequar/Documents/agentic_company_os/src/doctor/health.ts), [`src/cli/commands/doctor.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/doctor.ts), [`src/cli/dispatcher.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/dispatcher.ts)): diagnostica parallela (`Promise.allSettled`) con `execFile` (zero shell injection) e `AbortSignal.timeout(3000)` per `git`, `python3`, `.venv`, `swiftc` e `docker`. Supporto `--json` e test in-memory tramite `ExecutionContext`.
  - `TCK-17.2`: **Cross-Domain Contract Synchronizer (Python Pydantic v2 <-> Swift 6)** ([`src/contracts/sync.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/sync.ts), [`src/sync/contract-sync.ts`](file:///Users/stequar/Documents/agentic_company_os/src/sync/contract-sync.ts)): generazione deterministica di modelli Python Pydantic v2 (`ConfigDict(populate_by_name=True, from_attributes=True)` e `Field(..., alias="camelCase")`) e struct Swift 6 (`Codable, Sendable, Hashable, Identifiable` con `nonisolated private enum CodingKeys: String, CodingKey`), salvati atomicamente via `atomicWriteFile` con verifica SHA-256.
  - `TCK-17.3`: **Live Multi-Repo Dogfooding Pipeline su `/Users/stequar/fitness_project`** ([`src/dogfooding/fitness-runner.ts`](file:///Users/stequar/Documents/agentic_company_os/src/dogfooding/fitness-runner.ts)): esecuzione reale delle 5 fasi (`INSPECT`, `DOCTOR`, `DRY_RUN_ATTACH`, `LIVE_ATTACH_AND_IDEMPOTENCY`, `CROSS_DOMAIN_CONTRACT_SYNC`) su `/Users/stequar/fitness_project`, con backup `AGENTS.md.bak`, idempotenza certificata (`6/6 SKIPPED_UNCHANGED` al secondo passaggio) e modelli `Exercise` e `UserProfile` scritti in [`synced_schemas.py`](file:///Users/stequar/fitness_project/src/backend/api/synced_schemas.py) e [`SyncedModels.swift`](file:///Users/stequar/fitness_project/src/ios/FitnessApp/Models/SyncedModels.swift).
  - `TCK-17.4`: **Test Suite Sprint 17** ([`tests/dogfooding-sprint17.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/dogfooding-sprint17.test.ts)): 6/6 test unitari e di integrazione live passati al 100%.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **52/52 test suite passate, 376/376 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 17.5: Brownfield Symbiosis, Autonomous Domain Expert Synthesis & 5-Phase Holistic Bootstrap (`RFC-007`)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Live Verified)
- **Origine:** Direttiva strategica del CEO post-Dogfooding (*"non basta trovare i punti e definire i ticket. dobbiamo approfittare di questa prima analisi per portare i principi scoperti nella nostra libreria, capire quali sono le best practices per loro, analizzare le tecniche, fare ricerca"*).
- **Deliverable Consegnati:**
  - `TCK-17.5.0`: **Retrospettiva Dogfooding, Consensus Blueprint `RFC-007` & Tech Validation Spike** ([`docs/wiki/rnd/audits/sprint-17-dogfooding-retrospective.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/audits/sprint-17-dogfooding-retrospective.md), [`docs/wiki/rnd/rfcs/RFC-007-BROWNFIELD-SYMBIOSIS-AND-SMART-ADOPTION.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/rfcs/RFC-007-BROWNFIELD-SYMBIOSIS-AND-SMART-ADOPTION.md), [`docs/wiki/engineering/spikes/sprint-17-5-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-17-5-validation.md)).
  - `TCK-17.5.1`: **Hybrid AST Section Grafting & Non-Destructive Smart-Merge** ([`src/attach/smart-merge.ts`](file:///Users/stequar/Documents/agentic_company_os/src/attach/smart-merge.ts), [`src/attach/injector.ts`](file:///Users/stequar/Documents/agentic_company_os/src/attach/injector.ts)): blocchi sentinella `<!-- AGENTIC-OS:MANAGED:START/END -->` con digest SHA-256 che preservano al 100% Epiche, Ticket e documentazione preesistente (`docs/wiki/science/`), auto-indicizzano tutti i file in `INDEX.md` (zero *Dark Memory*) e garantiscono idempotenza byte-per-byte (`SKIPPED_UNCHANGED`).
  - `TCK-17.5.2`: **Deep Polyglot Crawler, Hermetic Runner & Autonomous Domain Miner** ([`src/contracts/brownfield.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/brownfield.ts), [`src/inspector/detector.ts`](file:///Users/stequar/Documents/agentic_company_os/src/inspector/detector.ts), [`src/inspector/domain-miner.ts`](file:///Users/stequar/Documents/agentic_company_os/src/inspector/domain-miner.ts)): rilevamento SQL (`.sql`), precedenza ermetica `.venv/bin/pytest > uv run pytest > poetry run pytest > pytest`, e sintesi autonoma Tri-Ring di specialisti tech Ring-1 (`database_sql_specialist`, `data_pipeline_specialist`, `devops_container_specialist`) ed esperti di dominio Ring-2 (`medical_rehab_specialist`, `nutrition_metabolic_specialist`, `ai_coaching_specialist`) anche in totale assenza di `AGENTS.md`.
  - `TCK-17.5.3`: **Active Domain-Expert Ceremony Routing** ([`src/core/ceremony-dispatcher.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/ceremony-dispatcher.ts)): convocazione automatica degli esperti Ring-1/Ring-2 e iniezione delle loro `domainInvariants` quando una cerimonia tocca file nel loro `domainScope`.
  - `TCK-17.5.4`: **Semantic Drift Detector & 5-Phase Holistic Workspace Bootstrap (`P0..P4`)** ([`src/sync/contract-introspector.ts`](file:///Users/stequar/Documents/agentic_company_os/src/sync/contract-introspector.ts), [`src/bootstrap/holistic-bootstrap.ts`](file:///Users/stequar/Documents/agentic_company_os/src/bootstrap/holistic-bootstrap.ts), CLI `agentic-company bootstrap`): introspezione cross-language (`Exercise.id` `int` vs `UUID`, `MISSING_CODING_KEYS`), pre-sintesi tool MCP JIT (`HOT_LOADED`), generazione di `.company-os/{org-chart,contracts,invariants,config,bootstrap-report}.json` e cerimonia inaugurale `BRAINSTORMING_KICKOFF`.
  - `TCK-17.5.5`: **Test Suite Sprint 17.5 & Zero-Hint Integration Eval Harness (`E1..E6`)** ([`src/contracts/eval.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/eval.ts), [`src/eval/integration-harness.ts`](file:///Users/stequar/Documents/agentic_company_os/src/eval/integration-harness.ts), [`tests/brownfield-symbiosis.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/brownfield-symbiosis.test.ts), [`tests/integration-eval.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/integration-eval.test.ts), [`docs/wiki/qa/fitness-project-eval-report.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/qa/fitness-project-eval-report.md)): Clean-Slate Reset + Blind 5-Phase Bootstrap + Application Sprint (`TCK-1.2`, `TCK-4.2`) con punteggio **100/100 (`CERTIFIED_EXCELLENT`)** su tutti i 6 assi (`E1..E6`) ed esecuzione reale di `.venv/bin/pytest -v`.
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **54/54 test suite passate, 383/383 test passati (100%)**.
  - `npm run build`: compilazione `dist/` completata con successo.

---

## 🏁 Sprint 17.6 & 17.7: Executive & R&D Operating Protocol v2, Core Dogfooding ("Zero Island Modules") & Workflow Behavioral Eval (`W1..W7`)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & `100/100 WORKFLOW_CERTIFIED`)
- **Origine:** Richiesta strategica del CEO (*"prima di applicare i concetti che sbandieriamo, in altre repo, che siano green o brownfield, dobbiamo verificare che li applichiamo anche nella nostra stessa libreria. procediamo quindi con una tavola rotonda."*).
- **RCA Eseguita (5 Whys & Root Causes Identificate):**
  1. *Perché rispondeva come un chatbot generico?* Il file `AGENTS.md` generato conteneva testo descrittivo in 3ª persona passiva senza definire in testa all'agente primario la propria identità imperativa di **CTO Co-Founder L1**.
  2. *Perché non scattava il protocollo di saluto a 3 opzioni?* Le skill operative in `.agents/skills/` (es. `run-company/SKILL.md`) mancavano del frontmatter YAML obbligatorio (`--- name: run-company ... ---`) alle righe 1-4, venendo scartate dal loader Antigravity.
  3. *Perché il blocco gestionale non aveva priorità nel contesto?* Lo Smart-Merge iniettava il blocco sentinella `<!-- AGENTIC-OS:MANAGED:START -->` in append a riga 117 invece che in cima (`prepend`), perdendo la *top-of-file primacy* per il modello LLM.
  4. *Perché c'era discrasia tra TypeScript engine e chat conversazionale (Dual-Brain Split)?* L'agente conversazionale legge Markdown/YAML, mentre i contratti risiedevano nel motore runtime TypeScript. Mancava il CLI Bridge deterministico (`agentic-company workflow status|route|verify-gate`) che sincronizza `.company-os/workflow-state.json` e la catena di notarizzazione crittografica in `.company-os/audit.jsonl`.
  5. *Perché alcuni moduli core erano "Moduli Isola" e `W5` falliva al 91/100?* `canonicalJsonStringify` serializzava chiavi `undefined` in RAM divergendo da `JSON.stringify` su disco, mentre primitive come `FastDecisionGate`, `ToolScoper`, `PromptCacheAdapter`, `CavemanFormatter` e `FluffTelemetry` erano testate in isolamento ma non cablate nel flusso di esecuzione di `self-healing.ts`, `ceremony-dispatcher.ts`, `consensus-engine.ts`, `workflow.ts` e `mcp/server.ts`.
- **Deliverable Consegnati & Certificati:**
  - `TCK-17.6.1..5`: **Workflow Behavioral Evaluation Contract & Harness (`W1..W7`)** ([`src/contracts/workflow-eval.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/workflow-eval.ts), [`src/eval/workflow-eval-harness.ts`](file:///Users/stequar/Documents/agentic_company_os/src/eval/workflow-eval-harness.ts)), **Cognitive Forcing Gate (`CFF-1..4`)** in [`src/core/state-machine.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/state-machine.ts) e **4 Skill YAML-compliant** in `.agents/skills/`.
  - `TCK-17.7.1`: **Canonical JSON Parity in `AuditLogger`** ([`src/core/audit-logger.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/audit-logger.ts)): esclusione deterministica di chiavi `undefined` in `canonicalJsonStringify()`, garantendo parità 100% RAM/Disco e portando `W5` a `100/100`.
  - `TCK-17.7.2`: **Cablaggio di `FastDecisionGate` nel Loop di Self-Healing** ([`src/gatekeeper/self-healing.ts`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/self-healing.ts)): blocco System-1 (<10ms, $0 token) a monte di `validatePatch` su path proibiti (`.env`, `.git`, `.ssh`) e secret leak.
  - `TCK-17.7.3`: **Cablaggio di `CavemanFormatter` & `FluffTelemetry` in `CeremonyDispatcher` e `ConsensusEngine`** ([`src/core/ceremony-dispatcher.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/ceremony-dispatcher.ts), [`src/core/consensus-engine.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/consensus-engine.ts), [`src/core/fluff-telemetry.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/fluff-telemetry.ts)): compressione teleografica automatica e tracciamento token/dollari risparmiati senza leak cross-test.
  - `TCK-17.7.4`: **Cablaggio di `ToolScoper`, `PromptCacheAdapter`, `DynamicMcpRegistry` e `runEnvironmentDoctor`** in [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts) e [`src/mcp/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/server.ts) (rimozione di `exec()` shell legacy a favore di `runEnvironmentDoctor()` basato su `execFile`).
- **Deterministic Gatekeeper:**
  - `npm run typecheck`: **0 errori**.
  - `npm test`: **55/55 test suite passate, 386/386 test passati (100%)**.
  - `Workflow Behavioral Eval (W1..W7)`: **100/100 (`WORKFLOW_CERTIFIED`)** sia su `agentic_company_os` (Self-Hosting) sia su `fitness_project`.

---

## 🏁 Sprint 20: Neuro-Symbolic Formal AST Verification & Invariant Prover (RFC-006)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Zero-Island Kernel Wiring)
- **Origine:** Direttrice B selezionata dal CEO per l'avanzamento della **Fase 6 (Next-Gen Autonomous Frontiers & Self-Evolving Ecosystem — RFC-006)**.
- **Obiettivo dello Sprint:** Integrare nel Deterministic Gatekeeper un motore di verifica formale neuro-simbolica basato su Hoare Logic `{P} C {Q}` e vincoli simbolici AST/Zod per dimostrare matematicamente l'assenza di bug sui cammini di esecuzione o generare automaticamente fixture di controesempio eseguibili (`Vitest`/`Pytest`).
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-20.0`: **Tech Validation Spike Dossier** ([`docs/wiki/engineering/spikes/sprint-20-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-20-validation.md), indicizzato in [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md) e validato in [`tests/spikes.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spikes.test.ts)).
  - `TCK-20.1 & TCK-20.2`: **Neuro-Symbolic Formal AST Prover & Counterexample Generator** ([`src/gatekeeper/formal-prover.ts`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/formal-prover.ts)): estrazione di parametri tipizzati, precondizioni `@requires`/Zod e postcondizioni `@ensures`; verifica di `division_by_zero_guard`, `non_null_dereference`, `array_index_bounds` e `no_negative_balance`; sintesi automatica di `reproducibleFixtureCode` (Vitest/Pytest), gestione timeout a `500ms` (`SOLVER_TIMEOUT`) e rilevamento assiomi contraddittori (`UNSATISFIABLE`).
  - `TCK-20.3`: **Zero-Island Kernel Wiring** in [`src/gatekeeper/self-healing.ts`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/self-healing.ts) (`enableFormalProver`), [`src/mcp/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/server.ts) (tool `prove_ast_invariants`) e [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts) (telemetria `formalProver` in `workflow status`).
  - `TCK-20.4`: **Test Suite Completa** ([`tests/formal-prover.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/formal-prover.test.ts)).

---

## 🏁 Sprint 21: Zero-Cost Local SLM Distillation & Hierarchical Speculative Swarm (RFC-006)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Hardware-Adaptive Auto-Discovery)
- **Origine:** Direttrice B approvata dal CEO dopo revisione dello Spike Tecnico e aggiornamento alla lineup SOTA 2025/2026 (`Qwen3 / Qwen3-Coder 30B MoE`, `Gemma 3`, `Phi-4-Mini`).
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-21.0`: **Tech Validation Spike Dossier** ([`docs/wiki/engineering/spikes/sprint-21-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-21-validation.md), indicizzato in [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md) e validato in [`tests/spikes.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spikes.test.ts)).
  - `TCK-21.1`: **High-FPY Trajectory Harvester** ([`src/distillation/harvester.ts`](file:///Users/stequar/Documents/agentic_company_os/src/distillation/harvester.ts)): estrazione esclusiva di traiettorie con `FPY = 100%` (zero retry di Self-Healing e firma Merkle integra) per prevenire il *Model Collapse*, esportazione JSONL e certificazione [`SlmDistillationTraceSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/frontiers.ts#L48-L60).
  - `TCK-21.2`: **Hardware-Adaptive Profiler & Installed Model Auto-Discovery** ([`src/distillation/local-slm-adapter.ts`](file:///Users/stequar/Documents/agentic_company_os/src/distillation/local-slm-adapter.ts)): classificazione in 4 fasce (`LOW_RESOURCE_BYPASS` con zero rallentamenti per macchine `<8GB RAM`, `COMPACT_EDGE` con `qwen3:1.7b`/`phi4-mini`, `BALANCED_PRO` con `qwen3:8b`/`gemma3:12b`, `WORKSTATION_ULTRA` con `qwen3-coder:30b` MoE e `gemma3:27b`) e scansione automatica dei modelli già installati via loopback (`/api/tags`).
  - `TCK-21.3 & TCK-21.4`: **Hierarchical Quad-Tier Inference Dispatcher & Speculative Formal Gate** ([`src/distillation/quad-tier-dispatcher.ts`](file:///Users/stequar/Documents/agentic_company_os/src/distillation/quad-tier-dispatcher.ts)): routing a 4 livelli (`Tier 0` Kahneman Gate $\rightarrow$ `Tier 1` Local SLM $\rightarrow$ `Tier 2` Cloud Workhorse $\rightarrow$ `Tier 3` Deep Reasoning obbligatorio per RCA e Roundtable), verifica speculativa tramite `proveAstInvariants` (Sprint 20) con escalation automatica a Cloud su controesempio, e cablaggio Zero-Island in `FinOpsEngine`, [`src/mcp/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/server.ts) (`dispatch_quad_tier_inference`) e [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts) (`localSlmSwarm`).
  - `TCK-21.5`: **Test Suite Completa** ([`tests/local-slm-distillation.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/local-slm-distillation.test.ts)).

---

## 🏁 Sprint 22: Antifragile Chaos Swarm & Synthetic Fault Injection Engine (RFC-006)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & 6/6 Chaos Vectors Contained)
- **Origine:** Direttrice B approvata dal CEO dopo revisione dello Spike Tecnico per testare e certificare l'antifragilità del sistema immunitario dell'OS.
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-22.0`: **Tech Validation Spike Dossier** ([`docs/wiki/engineering/spikes/sprint-22-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-22-validation.md), indicizzato in [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md) e validato in [`tests/spikes.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spikes.test.ts)).
  - `TCK-22.1..4`: **Antifragile Chaos Engine & Campaign Runner** ([`src/security/chaos-engine.ts`](file:///Users/stequar/Documents/agentic_company_os/src/security/chaos-engine.ts)): esecuzione isolata in Ephemeral Chaos Arena (`os.tmpdir()`, zero impatto sul repository) dei 6 vettori di guasto (`AST_MUTATION_OFF_BY_ONE`, `ADVERSARIAL_PROMPT_INJECTION`, `DISK_WAL_PARTIAL_CORRUPT`, `RACE_CONDITION_ASYNC_QUEUE`, `NETWORK_LATENCY_SPIKE`, `CIRCULAR_DEPENDENCY_DEADLOCK`), stress-test automatico di [`WarRoomEngine`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/war-room.ts), calcolo matematico di `resilienceScore (0-100)` e cablaggio Zero-Island in [`src/mcp/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/server.ts) (`run_chaos_experiment`) e [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts) (`chaosResilience`).
  - `TCK-22.5`: **Test Suite Completa** ([`tests/chaos-swarm.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/chaos-swarm.test.ts)).

---

## 🏁 Sprint 23: Living Spatial Architecture Canvas & Executive Voice Director (Chiusura Fase 6 — RFC-006)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Fase 6 Integralmente Completata)
- **Origine:** Direttrice B approvata dal CEO dopo revisione dello Spike Tecnico e inserimento in Roadmap dello **Sprint 17.8 (`Configurable Spike Checkpoint Gate`)**.
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-23.0`: **Tech Validation Spike Dossier** ([`docs/wiki/engineering/spikes/sprint-23-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-23-validation.md), indicizzato in [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md) e validato in [`tests/spikes.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spikes.test.ts)).
  - `TCK-23.1 & TCK-23.2`: **Living Spatial Architecture Graph & Trajectory Heatmap** ([`src/studio/spatial-canvas.ts`](file:///Users/stequar/Documents/agentic_company_os/src/studio/spatial-canvas.ts)): grafo radiale concentrico 2D/3D (Centro L1 $\rightarrow$ Ring-0 $\rightarrow$ Ring-1/Ring-2 $\rightarrow$ Subsystem Clusters) con `heatIntensity` calcolato in tempo reale da [`TrajectoryReader`](file:///Users/stequar/Documents/agentic_company_os/src/core/trajectory-reader.ts), esposto su `GET /api/spatial-graph` in [`src/studio/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/studio/server.ts).
  - `TCK-23.3`: **Executive Voice Director in Italiano** ([`src/studio/voice-director.ts`](file:///Users/stequar/Documents/agentic_company_os/src/studio/voice-director.ts)): parser Speech-to-Intent in italiano (`RUN_STANDUP`, `READ_STATUS_BRIEFING`, `TOGGLE_SPIKE_CHECKPOINT`, `RUN_CHAOS_AUDIT`, `PAUSE_SWARM`, `RESUME_SWARM`) con sintesi vocale esecutiva (`spokenBriefingIt`), persistenza `.company-os/spike-checkpoint.json` (`HITL_SPIKE_REVIEW` vs `AUTONOMOUS_FAST_TRACK`), esposto su `POST /api/voice-director` in Web Studio e come tool `execute_voice_command` in [`src/mcp/server.ts`](file:///Users/stequar/Documents/agentic_company_os/src/mcp/server.ts).
  - `TCK-23.4`: **Test Suite Completa** ([`tests/spatial-voice-studio.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/spatial-voice-studio.test.ts)).

---

## 🏁 Sprint 17.8: Central Settings Configuration (`.company-os/settings.json`) & Configurable Spike Checkpoint Gate (`CFF-5`)
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Reference Catalog Documented)
- **Origine:** Direttiva del CEO per centralizzare tutti gli interruttori operativi della libreria in `.company-os/settings.json` con documentazione completa dei valori ammessi.
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-17.8.0`: **Tech Validation Spike & Reference Manual** ([`docs/wiki/engineering/spikes/sprint-17-8-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-17-8-validation.md) e [`docs/wiki/engineering/settings-reference.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/settings-reference.md), indicizzati in [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md)).
  - `TCK-17.8.1`: **Central Settings Schema & Manager** ([`src/contracts/settings.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/settings.ts), [`src/core/settings-manager.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/settings-manager.ts) e [`.company-os/settings.json`](file:///Users/stequar/Documents/agentic_company_os/.company-os/settings.json)) con 5 sezioni (`governance`, `localSlm`, `gatekeeper`, `communication`, `finops`) e catalogo programmatico `SETTINGS_REFERENCE_CATALOG`.
  - `TCK-17.8.2`: **CFF-5 Gate & CLI/Voice Wiring** in [`src/core/state-machine.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/state-machine.ts) (`SPIKE_CHECKPOINT_GATE_VIOLATION`), [`src/studio/voice-director.ts`](file:///Users/stequar/Documents/agentic_company_os/src/studio/voice-director.ts) e [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts) (`workflow settings` e `workflow set-setting --key <dot.path> --value <val>`).
  - `TCK-17.8.3`: **Test Suite Completa** ([`tests/settings-and-spike-gate.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/settings-and-spike-gate.test.ts)).
  - `TCK-17.8.4`: **Settings Behavioral Eval Suite (`S1..S5`)** ([`src/eval/settings-eval-harness.ts`](file:///Users/stequar/Documents/agentic_company_os/src/eval/settings-eval-harness.ts), [`tests/settings-eval.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/settings-eval.test.ts), [`docs/wiki/qa/settings-eval-report.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/qa/settings-eval-report.md) e CLI `agentic-company workflow eval-settings --json`). Punteggio: **100/100 (`SETTINGS_VERIFIED`)**.

---

## 🏁 Sprint 18: Open Source Public Release (`v1.0.0`), Professional Persona Taxonomy & Claude Code / Codex Adapter
- **Status:** COMPLETATO ✅ (Deterministic Gatekeeper 100% Green & Ready for Private GitHub Field Testing)
- **Deliverable Consegnati & Cablati End-to-End:**
  - `TCK-18.0`: **Tech Validation Spike Dossier** ([`docs/wiki/engineering/spikes/sprint-18-validation.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/engineering/spikes/sprint-18-validation.md)).
  - `TCK-18.1`: **Professional Engineering Taxonomy & English-First Default** (`communication.personaPreset: "ENGINEERING_PROFESSIONAL"` con **`Project Lead`** & **`Lead Orchestrator (L1)`** e `communication.language: "en"` come default in [`src/contracts/settings.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/settings.ts), [`.company-os/settings.json`](file:///Users/stequar/Documents/agentic_company_os/.company-os/settings.json) e [`src/generator/roles.ts`](file:///Users/stequar/Documents/agentic_company_os/src/generator/roles.ts)).
  - `TCK-18.2`: **Claude Code & OpenAI Codex Dual-Harness Adapter** ([`src/attach/harness-adapter.ts`](file:///Users/stequar/Documents/agentic_company_os/src/attach/harness-adapter.ts), [`CLAUDE.md`](file:///Users/stequar/Documents/agentic_company_os/CLAUDE.md), `.claude/commands/*.md`, [`.mcp.json`](file:///Users/stequar/Documents/agentic_company_os/.mcp.json) e comando CLI `agentic-company workflow setup-harnesses`).
  - `TCK-18.3 & TCK-18.4`: **Packaging v1.0.0, MIT License, English GitHub Documentation & Test Suite** ([`package.json`](file:///Users/stequar/Documents/agentic_company_os/package.json), [`LICENSE`](file:///Users/stequar/Documents/agentic_company_os/LICENSE), [`README.md`](file:///Users/stequar/Documents/agentic_company_os/README.md), [`tests/sprint18-release-and-harnesses.test.ts`](file:///Users/stequar/Documents/agentic_company_os/tests/sprint18-release-and-harnesses.test.ts)).

---

## 🏁 RFC-008 & Sprint 18.1: Zero-Clone `npx` Distribution, Brownfield Safe-Bootstrap & Field Testing Live su `xfarm-client` (Claude Code)
- **Status:** COMPLETATO ✅ (Commits `36e2a8f`, `724d774`, `872311c` pushati su `origin/main` — `433/433` test verdi)
- **Origine:** Ricerca web + R&D (`RFC-008`) sulla distribuzione Zero-Clone (`npx --yes --package github:stequar/agentic_system_os agentic-os bootstrap --path .`) e 3 iterazioni di field-testing reale su un'altra macchina con **Anthropic Claude Code** sul repository enterprise Angular + `pnpm` + `Jest` (**`xfarm-client`**).
- **Deliverable Consegnati & Verificati sul Campo:**
  1. **RFC-008 Zero-Clone `npx` & Portable Local Shim (`36e2a8f`):**
     - `dist/` pre-compilata tracciata in Git per esecuzione istantanea via `npx github:stequar/agentic_system_os` senza `git clone`.
     - Shim locale `.company-os/bin/agentic-os.mjs` (<50ms latency) 100% portabile tra macchine diverse tramite `os.homedir()` (zero path `/Users/...` cablati).
  2. **Brownfield Safe-Bootstrap & Anti-Contamination (`724d774`):**
     - Smart-Merge non distruttivo (`graftManagedSection`) su `CLAUDE.md` (preserva le regole esistenti del team) e merge non distruttivo di `mcpServers` in `.mcp.json`.
     - Creazione garantita di `.company-os/settings.json` durante `bootstrap` e isolamento dei contratti demo (`synced_schemas.py` / `SyncedModels.swift`) così da non contaminare mai repo di terze parti.
     - Rilevamento accurato di `angular`, `jest`, `vitest`, `nx`, `vue`, `svelte`, `nestjs` e `pnpm test` / `yarn test` senza falsi positivi Python/Dart/Flutter in [`src/inspector/detector.ts`](file:///Users/stequar/Documents/agentic_company_os/src/inspector/detector.ts).
     - Esclusione di cartelle UI/plumbing (`pipe`, `graph`, `components`, `directives`, `services`, `models`) e rimozione di falsi positivi `fintech`/`fitness` in [`src/inspector/domain-miner.ts`](file:///Users/stequar/Documents/agentic_company_os/src/inspector/domain-miner.ts).
  3. **100% English Generated Docs & Angular-Aware Specialist (`872311c`):**
     - Tutte le documentazioni generate (`AGENTS.md`, `CLAUDE.md`, `docs/wiki/*`, `docs/CEO_Dashboard.md`, `.agents/skills/*/SKILL.md`) sono ora **100% in inglese (`en`)**.
     - `frontend_manager` ora riconosce nativamente Angular e i file `.component.ts` / `.service.ts` / `.module.ts`.

---

## 📌 CHECKPOINT DI SESSIONE — Da Riprendere Domani (`Sprint 18.2` + Test 2..6 Claude Code)

### 1. Prossimo Sprint Immediato: `Sprint 18.2 — Ultra-Clean Brownfield Ergonomics`
Dall'analisi del **Test #3 di Claude Code su `xfarm-client`** (dove `[ORCHESTRATOR MODE: 1 — STANDUP]` si è attivato con successo in inglese con Angular + `pnpm test`), restano **4 miglioramenti chirurgici di qualità enterprise** da implementare alla ripresa:
1. **`TCK-18.2.1` — Glob-Based `domainScope` in `domain-miner.ts`:**
   - Sostituire `files.slice(0, 15)` (che prende i primi 15 file in ordine alfabetico come `jest.config.ts` o `agm-map`) con **glob pattern per modulo** (`src/app/<module>/**`) nei file `AGENTS.md` / `CLAUDE.md` e in `.company-os/org-chart.json`, così ogni specialista Ring-1/Ring-2 ha confini di modulo reali.
2. **`TCK-18.2.2` — Compact Brownfield Pointer Block (~35 righe) in `AGENTS.md` / `CLAUDE.md`:**
   - Quando `AGENTS.md` o `CLAUDE.md` esistono già nel repo ospite (brownfield), iniettare un blocco compatto di ~35 righe (Karpathy pointer verso `.company-os/` e `.claude/commands/`) in coda invece di +198 righe in cima, preservando la priorità delle regole native del team e risparmiando ~160 righe di contesto a ogni sessione.
3. **`TCK-18.2.3` — Wiki Path Auto-Discovery (`.claude/wiki/index.md` vs `docs/wiki/INDEX.md`):**
   - Se il repository ospite possiede già `.claude/wiki/index.md` (o `docs/wiki/index.md`), puntare al catalogo esistente senza generare una seconda wiki duplicata.
4. **`TCK-18.2.4` — Flag `--stealth` / `--local` per `.git/info/exclude`:**
   - Non aggiungere `.company-os/` a `.git/info/exclude` di default (così `.company-os/bin/agentic-os.mjs` referenziato da `.mcp.json` può essere committato se il team adotta il tool), attivando l'esclusione silente solo con `--stealth`.

### 2. Test Comportamentali Claude Code Rimasti da Eseguire (Test 2..6)
Dopo il rilascio di `Sprint 18.2`:
- **Test 2 (`MODE 2` & `CFF-1..3`):** Stop-the-Line Read-Only & 5 Whys RCA (`/investigate-anomaly`).
- **Test 3 (`MODE 3` & `CFF-2`):** R&D Roundtable & Devil's Advocate (`/rnd-roundtable`).
- **Test 4 (`CFF-5`):** Verifica del blocco `SPIKE_CHECKPOINT_GATE_VIOLATION` su feature non-triviale.
- **Test 5 (`MODE 4` & `CFF-4`):** Approvazione del Project Lead e audit del Deterministic Gatekeeper (`/gatekeeper-audit`).
- **Test 6 (Runtime Settings):** Modifica live di `.company-os/settings.json` (`workflow set-setting`).

---

## 🎯 Stato Globale della Piattaforma
- **Repository Remoto:** `https://github.com/stequar/agentic_system_os.git` (`origin/main` sincronizzato al commit `872311c`)
- **Test Suites:** **62 passed / 62 total (100%)**
- **Test Unitari & Integrazione:** **433 passed / 433 total (100%)**
- **Settings Behavioral Eval (`S1..S5`):** **100/100 (`SETTINGS_VERIFIED`)**
- **Workflow Behavioral Eval (`W1..W7`):** **100/100 (`WORKFLOW_CERTIFIED`)**
- **Zero-Hint Integration Eval (`E1..E6`):** **100/100 (`CERTIFIED_EXCELLENT`)**
- **TypeScript Typecheck:** **0 errori (Strict Mode)**

---

<!-- AGENTIC-OS:MANAGED:START id="ceo-dashboard-governance" sha256="027cb57a3769cb2b14ff52f896e5e4b263a027a79e95e869e6ef555d03e19383" -->
# 📊 CEO Dashboard — Executive & R&D Operating Status

> Dashboard esecutiva sincronizzata da **Agentic Company OS** per il workspace: `/Users/stequar/Documents/agentic_company_os`.

---

## 👑 Stato Operativo CTO & Governance Tri-Ring
- **Protocollo Attivo:** Executive & R&D Operating Protocol v2 (`MODE 1..4` & `CFF-1..4`)
- **Stack Rilevato:** Linguaggi: typescript, javascript | Frameworks: N/D
- **Comandi Gatekeeper:** `npm test`
- **Core Leads (Ring-0):** `cto`, `engineering_lead`, `product_lead`, `qa_lead` (Devil's Advocate), `ai_lead`, `rnd_lead`

### 🔧 Tech Specialists (Ring-1)
- `frontend_manager`: **Frontend & TypeScript Engineering Lead** (`TypeScript Modules, Contracts & Web Studio UI`)
- `mcp_cli_runtime_specialist`: **MCP Server, Worker Sandbox & CLI Runtime Specialist** (`MCP JSON-RPC Transport, JIT Tool Synthesis & CLI Dispatcher`)

### 🧠 Business Domain Experts (Ring-2)
- `governance_workflow_specialist`: **Multi-Agent Governance, Ceremonies & Consensus Specialist** (`Agile Ceremonies, Anti-Echo-Chamber Consensus & Cognitive Forcing Functions`) — Invarianti: Ogni anomalia o bug deve superare il Cognitive Forcing Gate (MODE_2_INVESTIGATE_RCA -> MODE_3_RND_ROUNDTABLE) con approvazione CEO prima di entrare in MODE_4_BUILD_GATEKEEPER. ; Tutte le cerimonie agili devono convocare dinamicamente gli esperti Ring-1 e Ring-2 tramite resolveDomainAttendeesForScope.
- `ast_gatekeeper_specialist`: **Deterministic AST Gatekeeper, Self-Healing & Sandbox Security Specialist** (`AST Diff Guard, Self-Healing Loop, Incident War Room & Worker Sandbox`) — Invarianti: L'AST Diff Guard deve bloccare qualsiasi rimozione di test o asserzioni (Test Preservation Invariant) e modifiche fuori scope. ; Ogni fallimento 3/3 del loop di Self-Healing deve attivare l'Incident War Room con rollback atomico SHA-256.
- `context_finops_specialist`: **Karpathy Context-as-RAM, Prompt Caching & FinOps Specialist** (`Two-Tier Prefix Caching, Anti-Rot Compaction & Token FinOps Telemetry`) — Invarianti: La compattazione del contesto a soglia deve preservare il 100% degli invariant di ticket e file target (verifyContextInvariants). ; Il budget token deve rispettare il BudgetWatchdog con Safe-Pause al 100% e tracciamento FinOps real-time.

---

## 🛠️ Le 4 Skill Operative Disponibili per il CEO
1. `/run-company` (`MODE_1_STANDUP`): Sincronizzazione stato, backlog e team Tri-Ring.
2. `/investigate-anomaly` (`MODE_2_INVESTIGATE_RCA`): Indagine Read-Only, 5 Whys e consultazione Ring-2 + Devil's Advocate.
3. `/rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`): Tavola rotonda multi-agente, astrazione Symptom-to-Principle ed Executive Pitch.
4. `/gatekeeper-audit` (`MODE_4_BUILD_GATEKEEPER`): Delega L3, controllo invarianti e test ermetici al 100%.
<!-- AGENTIC-OS:MANAGED:END id="ceo-dashboard-governance" -->
