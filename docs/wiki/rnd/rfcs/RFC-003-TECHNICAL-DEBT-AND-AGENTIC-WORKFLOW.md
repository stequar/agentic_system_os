# 📄 RFC-003: Technical Debt Audit, Multi-Agent Collaboration & Agentic Workflow Optimization

**RFC ID:** `RFC-003-TECHNICAL-DEBT-AND-AGENTIC-WORKFLOW`  
**Titolo:** Technical Debt Audit, Multi-Agent Collaboration & Agentic Workflow Optimization  
**Autore:** R&D Lead (`rnd_lead`)  
**Stato:** `RATIFIED_BY_CTO` (Ratificato formalmente dal CTO)  
**Data Creazione:** 2026-10-16T16:50:00.000Z  
**Data Aggiornamento:** 2026-10-16T17:25:00.000Z  
**Schema di Riferimento:** [`ConsensusRfcSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts)

---

## 🧭 Visione Condivisa (Shared Vision)
Risolvere radicalmente il debito tecnico accumulato nel codice e nei flussi di lavoro, introducendo Test Impact Analysis deterministica per abbattere i tempi di feedback della suite da 204+ test, garantendo concorrenza parallela al 100% libera da collisioni tramite Git Worktree isolati, certificando l'integrità dei contratti a runtime con interceptor Zod e firme SHA-256, e offrendo al CEO e ai manager una cabina di pilotaggio visiva integrata con Kanban reattiva.

---

## 🏛️ Sintesi Architetturale dei 4 Topic

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│             AGENTIC COMPANY OS — TECHNICAL DEBT & AGENTIC WORKFLOW               │
├─────────────────────────┬──────────────────────────────┬─────────────────────────┤
│  TOPIC 1: SPEED & CORE  │    TOPIC 2: CONCURRENCY      │   TOPIC 3: INTEGRITY    │
│  Test Impact Analysis   │  Isolated Git Worktrees      │  Runtime Interceptor    │
│  • Mappa Dipendenze     │  • Worktree Pool (max 4)     │  • Zod fast safeParse   │
│  • Inner-Loop (<400ms)  │  • Zero Lock Collisions      │  • SHA-256 Handoff      │
│  • CLI Decoupling       │  • Rebase Deterministico     │  • First-Pass Yield FPY │
├─────────────────────────┴──────────────────────────────┴─────────────────────────┤
│                      TOPIC 4: VISUAL WORKFLOW & GOVERNANCE                       │
│    Interactive Visual Kanban Board • Real-Time Web Studio (HTML5/CSS Grid SSE)   │
│    Deterministic Team Handoff Protocol • Zero-Bloat Core Maintenance             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Topic 1: Architectural Decoupling & Test Impact Analysis Gatekeeper (`TOPIC-1-ARCHITECTURAL-DECOUPLING-TIA`)
- **Interviste di Origine:** `1ON1-2026-10-C3-ENG`
- **Problema:** L'esecuzione integrale della suite da 204+ test su 26 file ad ogni micro-step del Gatekeeper introduce un'inutile latenza cumulativa (fino a 5s per run). Inoltre, il punto d'ingresso principale `src/index.ts` è diventato un monolite congestionato da troppe responsabilità eterogenee.
- **Soluzione Proposta:**
  - Implementazione di un motore di **Test Impact Analysis (TIA)** nel Gatekeeper che mappa staticamente i file di codice ai relativi file di test ed esegue in modalità inner-loop solo i test impattati dal diff corrente (<400ms), riservando l'esecuzione della suite completa alla fase di pre-merge.
  - Rifattorizzazione modulare della CLI con architettura a comandi indipendenti e disaccoppiati in `src/cli/commands/*`.

## 📌 Topic 2: Multi-Agent Parallelism via Isolated Git Worktrees (`TOPIC-2-GIT-WORKTREES-PARALLELISM`)
- **Interviste di Origine:** `1ON1-2026-10-C3-ENG`, `1ON1-2026-10-C3-PROD`
- **Problema:** Quando più Leaf Developer operano in concorrenza sulla medesima working directory fisica, si verificano collisioni su file contigui, race condition sui lockfile (`package-lock.json`, `Cargo.lock`) e sovrascritture distruttive prima del commit.
- **Soluzione Proposta:**
  - Creazione di un **Managed Worktree Lifecycle Pool** che alloca dinamicamente una working tree Git isolata (`.agents/worktrees/<agent-id>`) per ciascun agente operativo.
  - Isolamento totale dell'ambiente di lavoro, garbage collection automatica in blocco `finally` e rebase sequenziale deterministico sul branch target prima dell'apertura della PR.

## 📌 Topic 3: Runtime Contract Interceptor & Cryptographic Handoff Integrity (`TOPIC-3-RUNTIME-CONTRACT-INTERCEPTOR`)
- **Interviste di Origine:** `1ON1-2026-10-C3-QA`
- **Problema:** Discrepanza tra gli schemi Zod dichiarati in `src/contracts/` e i messaggi non convalidati scambiati a runtime tra sub-agenti, con rischio di contract drift, propagazione di allucinazioni e assenza di tracciabilità crittografica e metriche oggettive di cooperazione (First-Pass Yield).
- **Soluzione Proposta:**
  - Introduzione del **Runtime Contract Interceptor Middleware**: intercettazione trasparente di ogni messaggio inter-agente con validazione rapida `safeParse` e arresto rumoroso immediato (*Fail Loudly*) in caso di violazione dello schema.
  - Notarizzazione crittografica degli handoff con digest SHA-256 e firma dell'agente memorizzata in append-only log.
  - Aggregatore di metriche di processo per monitorare il First-Pass Yield (FPY) e i tempi medi di convergenza dei ticket.

## 📌 Topic 4: Visual Multi-Agent Kanban & Interactive Studio Orchestrator (`TOPIC-4-VISUAL-STUDIO-KANBAN`)
- **Interviste di Origine:** `1ON1-2026-10-C3-PROD`
- **Problema:** Il management aziendale (CEO e Domain Lead) non dispone di una vista d'insieme visiva e interattiva sull'avanzamento dei ticket, sull'assegnazione degli agenti e sui colli di bottiglia, dovendo dipendere da log CLI o file markdown statici.
- **Soluzione Proposta:**
  - Sviluppo di una **Visual Kanban Board** integrata nell'Agentic Studio (`/studio`) costruita con standard web leggeri (HTML5 / CSS Grid nativo) e sincronizzazione in tempo reale tramite Server-Sent Events (SSE).
  - Supporto per interattività drag-and-drop, filtri per team/agente e sincronizzazione bidirezionale atomica con i file di backlog su disco.

---

## ⚖️ Trade-Off Risolti (Resolved Trade-Offs)
1. **Two-Stage Gatekeeper:** Inner-loop ultra-veloce con Test Impact Analysis (TIA <400ms) durante i cicli di modifica iterativa e Full Suite (204+ test) obbligatoria prima di qualsiasi merge, con riesecuzione globale se vengono modificati i contratti Zod.
2. **Managed Worktree Lifecycle Pool:** Concorrenza parallela fino a 4 agenti con pulizia garantita post-merge e rebase deterministico, azzerando le collisioni di file e lockfile sul filesystem principale.
3. **Lightweight Fast Runtime Interceptor:** Schemi Zod precompilati in memoria con validazione rapida `safeParse` e diagnostica sintetica per azzerare il contract drift a runtime senza penalizzare il throughput.
4. **Zero-Bloat Visual Kanban Studio:** Interfaccia utente interattiva in puro HTML5/CSS Grid senza framework npm pesanti, servita dall'endpoint HTTP nativo con latenza minima e avvio istantaneo.

---

## ✍️ Firme dei Lead (Signatures)
- `rnd_lead`: 2026-10-16T17:10:00.000Z
- `engineering_lead`: 2026-10-16T17:12:00.000Z
- `product_lead`: 2026-10-16T17:14:00.000Z
- `qa_lead`: 2026-10-16T17:16:00.000Z
- `backend_lead`: 2026-10-16T17:18:00.000Z
- `mobile_lead`: 2026-10-16T17:20:00.000Z

---

## 🎫 Ticket di Backlog Azionabili (Actionable Backlog Tickets)
- `TCK-8.1`: Test Impact Analysis (TIA) Engine & Dependency Graph Mapper for Gatekeeper
- `TCK-8.2`: CLI Modular Refactor & Command Dispatcher Decoupling (`src/cli/commands/*`)
- `TCK-8.3`: Git Worktree Multi-Agent Pool & Safe Concurrency Sandbox
- `TCK-9.1`: Runtime Contract Interceptor Middleware with Zod Fast Validation
- `TCK-9.2`: Cryptographic Handoff Notarization & SHA-256 Digest Trail Logger
- `TCK-9.3`: Interactive Visual Kanban Board & Drag-and-Drop Workflow Studio
- `TCK-9.4`: Cooperation & Quality Metrics Aggregator (First-Pass Yield & Mean Cycles to Merge)

---

## 📑 Dati Strutturati Zod (ConsensusRfcSchema)

```json
{
  "rfcId": "RFC-003-TECHNICAL-DEBT-AND-AGENTIC-WORKFLOW",
  "title": "Technical Debt Audit, Multi-Agent Collaboration & Agentic Workflow Optimization",
  "authorRole": "rnd_lead",
  "status": "RATIFIED_BY_CTO",
  "sharedVision": "Risolvere radicalmente il debito tecnico accumulato nel codice e nei flussi di lavoro, introducendo Test Impact Analysis deterministica per abbattere i tempi di feedback della suite da 204+ test, garantendo concorrenza parallela al 100% libera da collisioni tramite Git Worktree isolati, certificando l'integrità dei contratti a runtime con interceptor Zod e firme SHA-256, e offrendo al CEO e ai manager una cabina di pilotaggio visiva integrata con Kanban reattiva.",
  "topics": [
    {
      "id": "TOPIC-1-ARCHITECTURAL-DECOUPLING-TIA",
      "title": "Architectural Decoupling & Test Impact Analysis Gatekeeper",
      "originatingInterviews": [
        "1ON1-2026-10-C3-ENG"
      ],
      "problemStatement": "L'esecuzione integrale della suite da 204+ test su 26 file ad ogni micro-step del Gatekeeper genera latenza cumulativa eccessiva, e la root CLI src/index.ts accumula troppe responsabilità eterogenee.",
      "proposedSolution": "Implementare Test Impact Analysis (TIA) nel Gatekeeper con mappatura statica del grafo delle dipendenze per eseguire solo i test impattati durante lo sviluppo, e disaccoppiare la CLI in comandi modulari src/cli/commands/*.",
      "managerFeedbacks": [
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-1-ARCHITECTURAL-DECOUPLING-TIA",
          "opinion": "Indispensabile per scalare la velocità di sviluppo man mano che la test suite cresce oltre i 200 test.",
          "concerns": [
            "Assicurarsi che la mappa delle dipendenze del TIA riconosca anche i contratti Zod condivisi."
          ],
          "proposedTradeOffs": [
            "Includere una matrice di invalidazione transitiva: se un file in src/contracts/ cambia, rieseguire l'intera suite."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-2-GIT-WORKTREES-PARALLELISM",
      "title": "Multi-Agent Parallelism via Isolated Git Worktrees",
      "originatingInterviews": [
        "1ON1-2026-10-C3-ENG",
        "1ON1-2026-10-C3-PROD"
      ],
      "problemStatement": "Più Leaf Developer operanti in parallelo sulla medesima working tree causano conflitti su file contigui e collisioni di lockfile condivisi.",
      "proposedSolution": "Introdurre un Managed Worktree Lifecycle Pool che isola ciascun agente in una working tree Git separata con pulizia automatica post-merge e rebase deterministico.",
      "managerFeedbacks": [
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-2-GIT-WORKTREES-PARALLELISM",
          "opinion": "L'unico pattern industriale serio per abilitare la vera concorrenza parallela tra Leaf Developers senza interferenze sul filesystem.",
          "concerns": [
            "Accumulo di cartelle temporanee orfane su macchine con spazio disco ridotto."
          ],
          "proposedTradeOffs": [
            "Implementare un garbage collector automatico dei worktree al riavvio dell'OS e a fine sprint."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "backend_lead",
          "topicId": "TOPIC-2-GIT-WORKTREES-PARALLELISM",
          "opinion": "Permette a sviluppatori Leaf backend di lavorare su modelli e query in parallelo con i frontend senza conflitti su database o migrazioni locali.",
          "concerns": [
            "Porte di rete o database locali in conflitto se due worktree avviano microservizi contemporaneamente."
          ],
          "proposedTradeOffs": [
            "Allocare porte dinamiche isolate per ciascun worktree tramite variabili di ambiente temporanee."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-3-RUNTIME-CONTRACT-INTERCEPTOR",
      "title": "Runtime Contract Interceptor & Cryptographic Handoff Integrity",
      "originatingInterviews": [
        "1ON1-2026-10-C3-QA"
      ],
      "problemStatement": "Mancanza di validazione sistematica a runtime dei messaggi inter-agente con rischio di contract drift e allucinazioni, e assenza di tracciabilità crittografica e metriche di cooperazione.",
      "proposedSolution": "Sviluppare un interceptor middleware per validare ogni payload con schema Zod, notarizzazione crittografica degli handoff con digest SHA-256 e aggregatore delle metriche di First-Pass Yield (FPY).",
      "managerFeedbacks": [
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-3-RUNTIME-CONTRACT-INTERCEPTOR",
          "opinion": "Salto qualitativo fondamentale: elimina alla radice il contract drift tra agenti e certifica matematicamente l'integrità degli handoff.",
          "concerns": [
            "Messaggi di errore Zod troppo prolissi che potrebbero consumare token se rimbalzati nei prompt."
          ],
          "proposedTradeOffs": [
            "Formattare l'errore di contract drift in un sommario diagnostico sintetico con percorso del campo e tipo atteso."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "mobile_lead",
          "topicId": "TOPIC-3-RUNTIME-CONTRACT-INTERCEPTOR",
          "opinion": "Garantisce che i modelli e le risposte generate rispettino sempre le interfacce Codable/Pydantic prima di essere scritte su disco.",
          "concerns": [
            "Verificare compatibilità con tipi opzionali complessi e strutture annidate."
          ],
          "proposedTradeOffs": [
            "Coprire gli interceptor con una suite dedicata di test su contratti eterogenei."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-4-VISUAL-STUDIO-KANBAN",
      "title": "Visual Multi-Agent Kanban & Interactive Studio Orchestrator",
      "originatingInterviews": [
        "1ON1-2026-10-C3-PROD"
      ],
      "problemStatement": "Assenza di una vista visiva e reattiva in stile Kanban per monitorare e gestire in tempo reale lo stato dei ticket e l'allocazione della flotta agentica per CEO e Domain Lead.",
      "proposedSolution": "Costruire una Kanban interattiva drag-and-drop nell'Agentic Studio in puro HTML5/CSS Grid sincronizzata in tempo reale tramite Server-Sent Events (SSE) e integrata con i file di backlog su disco.",
      "managerFeedbacks": [
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-4-VISUAL-STUDIO-KANBAN",
          "opinion": "Trasforma l'esperienza del CEO e dei Lead fornendo una sala di controllo visiva completa per l'intera flotta aziendale.",
          "concerns": [
            "Garantire che le azioni eseguite sulla Kanban (es. cambio priorità ticket) vengano riflesse deterministicamente nei file markdown di backlog."
          ],
          "proposedTradeOffs": [
            "Sincronizzazione bidirezionale atomica: ogni azione UI invoca atomicWriteFile sul backlog.md."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    }
  ],
  "resolvedTradeOffs": [
    "Two-Stage Gatekeeper: Inner-loop veloce con Test Impact Analysis (TIA <400ms) durante le modifiche e Full Suite (204+ test) obbligatoria pre-merge, con invalidazione globale automatica se cambiano i contratti Zod.",
    "Managed Worktree Lifecycle Pool: Limite a 4 worktree concorrenti isolati con rimozione automatica post-fusione e rebase deterministico per evitare collisioni di file e lockfile.",
    "Lightweight Fast Runtime Interceptor: Compilazione statica degli schemi Zod con validazione safeParse non bloccante e diagnostica sintetica per azzerare il contract drift tra agenti.",
    "Zero-Bloat Visual Kanban Studio: Componenti web nativi in puro HTML5/CSS Grid serviti direttamente dall'endpoint HTTP nativo dello Studio e sincronizzati via SSE, preservando la leggerezza del core."
  ],
  "signatures": [
    {
      "role": "rnd_lead",
      "signedAt": "2026-10-16T17:10:00.000Z"
    },
    {
      "role": "engineering_lead",
      "signedAt": "2026-10-16T17:12:00.000Z"
    },
    {
      "role": "product_lead",
      "signedAt": "2026-10-16T17:14:00.000Z"
    },
    {
      "role": "qa_lead",
      "signedAt": "2026-10-16T17:16:00.000Z"
    },
    {
      "role": "backend_lead",
      "signedAt": "2026-10-16T17:18:00.000Z"
    },
    {
      "role": "mobile_lead",
      "signedAt": "2026-10-16T17:20:00.000Z"
    }
  ],
  "actionableBacklogTickets": [
    "TCK-8.1: Test Impact Analysis (TIA) Engine & Dependency Graph Mapper for Gatekeeper",
    "TCK-8.2: CLI Modular Refactor & Command Dispatcher Decoupling (src/cli/commands/*)",
    "TCK-8.3: Git Worktree Multi-Agent Pool & Safe Concurrency Sandbox",
    "TCK-9.1: Runtime Contract Interceptor Middleware with Zod Fast Validation",
    "TCK-9.2: Cryptographic Handoff Notarization & SHA-256 Digest Trail Logger",
    "TCK-9.3: Interactive Visual Kanban Board & Drag-and-Drop Workflow Studio",
    "TCK-9.4: Cooperation & Quality Metrics Aggregator (First-Pass Yield & Mean Cycles to Merge)"
  ],
  "createdAt": "2026-10-16T16:50:00.000Z",
  "updatedAt": "2026-10-16T17:20:00.000Z"
}
```
