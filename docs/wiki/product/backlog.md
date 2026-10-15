# Backlog & Ticket Operativi — Agentic Company OS

Tutti i ticket devono rispettare lo schema Zod `ProductTicketSchema` (`src/contracts/product.ts`).

---

## 🏃 Sprint 1: Core Engine & Inspector (In Corso)

### 🎫 TCK-1.1: Project Inspector Module
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

### 🎫 TCK-1.2: Test Unitari per l'Inspector
- **Epica:** Epic 1
- **Assegnato a:** QA / Testing Engineer
- **File target:** `tests/inspector.test.ts`
- **Obiettivo:** Testare `detectProjectStack` con mock di cartelle contenenti diversi manifest (`package.json`, `requirements.txt`, `Package.swift`).
- **Criteri di accettazione:** 100% test passati via `npm test`.

### 🎫 TCK-2.1: Deterministic Gatekeeper Runner
- **Epica:** Epic 2 (Gatekeeper)
- **Assegnato a:** Backend / DevOps Engineer
- **File target:** `src/gatekeeper/runner.ts`
- **Obiettivo:** Creare la funzione `runGatekeeper(targetPath: string, testCommands: string[])`:
  - Esegue i comandi tramite `node:child_process` (es. `exec` o `spawn`).
  - Cattura exit code e stdout/stderr.
  - Converte il risultato nell'oggetto `GatekeeperResultSchema` (`src/contracts/review.ts`).
- **Criteri di accettazione:** Validato con Zod, gestisce timeout ed errori di esecuzione.

### 🎫 TCK-3.1: CLI Command `inspect`
- **Epica:** Epic 4 (CLI & Tools)
- **Assegnato a:** Frontend / CLI Engineer
- **File target:** `src/index.ts`
- **Obiettivo:** Aggiungere il comando `inspect <path>` che esegue `detectProjectStack` su un percorso dato e stampa a colori (via Chalk) il report dello stack rilevato.
- **Criteri di accettazione:** Eseguibile tramite `npx tsx src/index.ts inspect /Users/stequar/fitness_project`.
