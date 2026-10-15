# Roadmap di Prodotto — Agentic Company OS (Extractable Engine)

## Vision & Obiettivo
Creare un motore di orchestrazione autonomo ed **estraibile** in grado di analizzare qualsiasi repository software (es. `fitness_project` o progetti futuri), iniettare una governance a tre livelli (*CEO -> CTO -> Domain Leads -> Leaf Devs*) e guidare lo sviluppo tramite contratti tipizzati Zod e verifiche deterministiche (linter + test).

---

## Le Epiche (Epics)

### 🚀 Epic 1: Project Inspector & Stack Detector
**Obiettivo:** Creare il modulo di scansione che analizza una cartella target e ne identifica lo stack tecnologico:
- Rilevamento linguaggi: Swift (`Package.swift`, `.xcodeproj`), Python (`pyproject.toml`, `requirements.txt`), TypeScript/JavaScript (`package.json`), Docker (`docker-compose.yml`).
- Rilevamento test runner e comandi di verifica: `pytest`, `swift test`, `npm test`, `cargo test`.
- Rilevamento architettura documentale pre-esistente.

### 🛡️ Epic 2: Deterministic Gatekeeper Runner
**Obiettivo:** Costruire lo strumento che esegue comandi di test deterministici sul codebase target:
- Esecuzione controllata dei comandi shell del linter e dei test unitari.
- Parsing dell'exit code e dell'output.
- Validazione con lo schema Zod `GatekeeperResultSchema` (`src/contracts/review.ts`).
- Blocco automatico della Code Review in caso di fallimento dei test.

### 👥 Epic 3: Dynamic Role & Team Generator
**Obiettivo:** Generare a runtime i ruoli e i prompt degli agenti Lead in base allo stack rilevato:
- Se il progetto contiene Swift/iOS $\rightarrow$ genera `mobile_manager` con regole Apple MVVM.
- Se contiene FastAPI/Python $\rightarrow$ genera `backend_manager` con regole SQLAlchemy/Pydantic.
- Se contiene Node/Next.js $\rightarrow$ genera `frontend_manager` con regole React/TypeScript.

### 🔌 Epic 4: CLI Attach & Workspace Injector
**Obiettivo:** Fornire l'interfaccia a riga di comando per collegare il motore a qualsiasi cartella:
- Comando `agentic-company attach <path-to-target-repo>`.
- Iniezione chirurgica di `AGENTS.md` (con il ruolo CTO configurato), della skill `/run-company` e della wiki di memoria.

### 🏋️ Epic 5: End-to-End Validation (Dogfooding su `fitness_project`)
**Obiettivo:** Testare il comando `attach` direttamente sul progetto fitness ([`/Users/stequar/fitness_project`](file:///Users/stequar/fitness_project)):
- Verificare la corretta rilevazione di Swift + FastAPI + PostgreSQL.
- Eseguire il primo standup integrato e il lancio di un micro-sprint.
