# 📄 RFC-001: Agentic Company OS — Open Source Foundation & Universal Multi-Agent OS

**RFC ID:** `RFC-001-OPEN-SOURCE-OS-FOUNDATION`  
**Titolo:** Universal Multi-Agent OS & Open Source Foundation  
**Autore:** R&D Lead (`rnd_lead`)  
**Stato:** `RATIFIED_BY_CTO` (Ratificato dal CTO co-founder)  
**Data Creazione:** 2026-10-16T11:40:00.000Z  
**Data Ratifica:** 2026-10-16T12:51:00.000Z  
**Schema di Riferimento:** [`ConsensusRfcSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts)

---

## 🧭 Visione Condivisa (Shared Vision)
Trasformare Agentic Company OS nel sistema operativo multi-agente universale, modulare e open-source di riferimento per l'ingegneria del software moderna: un kernel deterministico ed estendibile compatibile con qualsiasi stack (Go, Rust, Swift, Python, TypeScript, KMP, Flutter), aperto ai contributi della community tramite architettura a plugin e Model Context Protocol (MCP), arricchito da una DevEx ergonomica zero-config e protetto da un Gatekeeper autonomo auto-riparante basato su analisi AST e rollback atomico.

---

## 🏛️ Sintesi Architetturale & Topic

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             AGENTIC COMPANY OS KERNEL                            │
├─────────────────────────┬──────────────────────────────┬─────────────────────────┤
│  TOPIC 1: MULTI-STACK   │    TOPIC 2: PLUGINS & MCP    │   TOPIC 3: SELF-HEALING │
│  Universal Scaffolding  │  Open Plugin SDK (Zod)       │  Autonomous AST Loop    │
│  • Go, Rust, KMP, etc.  │  • MCP Server & Client       │  • Structured Parsers   │
│  • Idiomatic Prompts    │  • Worker Threads Sandbox    │  • Max 3 Fix Iterations │
│  • Zero Toolchain Bloat │  • stdio / SSE Transport     │  • AST Diff Guard + .bak│
├─────────────────────────┴──────────────────────────────┴─────────────────────────┤
│                 TOPIC 4: DEVEX, INTERACTIVE WIZARD & MONOREPO                    │
│    npx agentic-os init • Interactive CLI Prompts • Multi-Repo Workspace Map      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Topic 1: Universal Multi-Stack Scaffolding Engine (`TOPIC-1-UNIVERSAL-SCAFFOLDING`)
- **Interviste di Origine:** `1ON1-2026-10-ENG`
- **Problema:** L'attuale inspector supporta un set rigido di linguaggi (Python, Swift, TypeScript, Docker). I moderni ecosistemi software si basano sempre più su Go per microservizi ultra-performanti, Rust per system programming e sicurezza della memoria, Kotlin Multiplatform (KMP) e Flutter per mobile cross-platform. Senza questi, l'OS non può coprire la maggioranza dei progetti open-source.
- **Soluzione Proposta:** Espansione dell'inspector e del generator con moduli dedicati: Go (ispezione `go.mod`, test con `go test ./...`, Lead `go_manager`), Rust (ispezione `Cargo.toml`, test con `cargo test`, Lead `rust_manager`), KMP (`build.gradle.kts`, `gradlew test`, Lead `mobile_manager`), Flutter (`pubspec.yaml`, `flutter test`, Lead `mobile_manager`).

## 📌 Topic 2: Modular Plugin & Model Context Protocol (MCP) Architecture (`TOPIC-2-MODULAR-PLUGINS-MCP`)
- **Interviste di Origine:** `1ON1-2026-10-ENG`, `1ON1-2026-10-QA`
- **Problema:** Il core monolitico non consente alla community open-source di estendere l'OS senza forkare la codebase. Inoltre, l'assenza di conformità con il Model Context Protocol (MCP) isola Agentic Company OS dai moderni ecosistemi di agenti e tool esterni.
- **Soluzione Proposta:** Creazione di una Plugin API tipizzata con contratti Zod (`AgenticPluginSchema`) che consente il dynamic loading di detector, role templates e tool. Integrazione di un adattatore bivalente MCP: (1) MCP Server per esporre le capacità dell'OS (Gatekeeper, Doctor, Inspector) a client MCP esterni, e (2) MCP Client per consumare server MCP di terze parti in modo sicuro e confinato.

## 📌 Topic 3: Autonomous Self-Healing Deterministic Gatekeeper (`TOPIC-3-SELF-HEALING-GATEKEEPER`)
- **Interviste di Origine:** `1ON1-2026-10-QA`, `1ON1-2026-10-ENG`
- **Problema:** Il Gatekeeper attuale agisce come un blocco cieco basato su exit code. Quando i test o i linter falliscono, gli sviluppatori o i Lead devono intervenire manualmente analizzando log grezzi non strutturati, con elevato rischio di allucinazioni e tentativi di aggiramento delle asserzioni di test.
- **Soluzione Proposta:** Evoluzione del Gatekeeper in un closed-loop autonomo di Self-Healing: (a) Diagnostic Parsers strutturati che traducono i fallimenti in coordinate AST (file, line, error code); (b) Closed-loop repair engine con massimo 3 iterazioni di micro-fix circoscritto; (c) AST Diff Guard che impedisce alterazioni di test esistenti o file di configurazione protetti; (d) Rollback atomico automatico in caso di mancata convergenza.

## 📌 Topic 4: Developer Experience, Interactive Scaffolding Wizard & Multi-Repo (`TOPIC-4-DEVEX-INTERACTIVE-WIZARD`)
- **Interviste di Origine:** `1ON1-2026-10-PROD`
- **Problema:** L'onboarding attuale richiede la conoscenza preliminare di comandi CLI e flag specifici, scoraggiando la community open-source. Inoltre, i repository complessi con monorepo (es. microservizi Go + app Flutter + frontend Next.js) non possono essere orchestrati chirurgicamente da un unico root attach.
- **Soluzione Proposta:** (a) Introduzione di un Interactive Scaffolding Wizard (`npx agentic-os init`) con interfaccia a terminale moderna (Clack/Inquirer), anteprima visiva dell'organigramma e confirmation prompts; (b) Monorepo & Multi-Repo Workspace Orchestration con capacità di rilevare directory innestate e mappare ciascun sottoprogetto su un Master Index unificato; (c) Generatore automatico di documentazione Markdown/Mermaid aggiornata a partire dagli schemi Zod.

---

## ⚖️ Trade-Off Risolti (Resolved Trade-Offs)
1. **Sandboxing dei Plugin delegato a Node Worker Threads leggeri:** timeout hardware a 3000ms e validazione Zod su I/O, evitando il sovraccarico di pesanti container Docker ma garantendo protezione da crash o memory leak.
2. **Ergonomia a due livelli "Convention over Configuration":** wizard interattivo rapido per onboarding standard con file facoltativo `agentic.config.ts` per configurazioni enterprise avanzate.
3. **Sicurezza del Self-Healing Loop garantita da 3 vincoli:** budget massimo di 3 tentativi, AST Diff Guard per bloccare mutazioni fuori scope o rimozione di test, e rollback atomico automatico in caso di mancata convergenza.

---

## ✍️ Firme dei Lead (Signatures)
- `rnd_lead`: 2026-10-16T12:00:00.000Z
- `engineering_lead`: 2026-10-16T12:02:00.000Z
- `product_lead`: 2026-10-16T12:04:00.000Z
- `qa_lead`: 2026-10-16T12:06:00.000Z
- `backend_lead`: 2026-10-16T12:08:00.000Z
- `mobile_lead`: 2026-10-16T12:10:00.000Z
- `cto`: 2026-10-16T12:51:00.000Z (Ratifica Architetturale)

---

## 🎫 Ticket di Backlog Azionabili (Actionable Backlog Tickets)
- `TCK-4.1`: Universal Multi-Stack Detector & Scaffolding Engine (Go, Rust, KMP, Flutter)
- `TCK-4.2`: Modular Plugin Architecture & Zod Plugin SDK
- `TCK-4.3`: Model Context Protocol (MCP) Server & Client Bridge
- `TCK-5.1`: Structured Diagnostic Parsers & AST Coordinates Engine
- `TCK-5.2`: Autonomous Self-Healing Closed Loop Runner (Max 3 iterations + Atomic Rollback)
- `TCK-5.3`: AST Diff Guard & Scope Enforcement Rule Engine
- `TCK-5.4`: Interactive CLI Scaffolding Wizard (@clack/prompts) with Monorepo/Multi-Repo Support

---

## 📑 Dati Strutturati Zod (ConsensusRfcSchema)

```json
{
  "rfcId": "RFC-001-OPEN-SOURCE-OS-FOUNDATION",
  "title": "Universal Multi-Agent OS & Open Source Foundation",
  "authorRole": "rnd_lead",
  "status": "RATIFIED_BY_CTO",
  "sharedVision": "Trasformare Agentic Company OS nel sistema operativo multi-agente universale, modulare e open-source di riferimento per l'ingegneria del software moderna: un kernel deterministico ed estendibile compatibile con qualsiasi stack (Go, Rust, Swift, Python, TypeScript, KMP, Flutter), aperto ai contributi della community tramite architettura a plugin e Model Context Protocol (MCP), arricchito da una DevEx ergonomica zero-config e protetto da un Gatekeeper autonomo auto-riparante basato su analisi AST e rollback atomico.",
  "topics": [
    {
      "id": "TOPIC-1-UNIVERSAL-SCAFFOLDING",
      "title": "Universal Multi-Stack Scaffolding Engine",
      "originatingInterviews": [
        "1ON1-2026-10-ENG"
      ],
      "problemStatement": "L'attuale inspector supporta solo Swift, Python, TypeScript e Docker, escludendo linguaggi ad alta adozione come Go, Rust, Kotlin Multiplatform e Flutter.",
      "proposedSolution": "Estendere il detector e il generator per supportare Go (go.mod), Rust (Cargo.toml), KMP (build.gradle.kts) e Flutter (pubspec.yaml) con prompt idiomatici per ciascun ecosistema.",
      "managerFeedbacks": [
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-1-UNIVERSAL-SCAFFOLDING",
          "opinion": "Completamente favorevole all'inclusione nativa di Go, Rust, KMP e Flutter nel core scaffolding engine.",
          "concerns": [
            "Mantenere il footprint leggero e non appesantire il pacchetto npm con binari esterni."
          ],
          "proposedTradeOffs": [
            "Ispezione statica basata sui manifest (go.mod, Cargo.toml) senza richiedere l'installazione delle toolchain a tempo di scaffolding."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "backend_lead",
          "topicId": "TOPIC-1-UNIVERSAL-SCAFFOLDING",
          "opinion": "L'inclusione di Go e Rust è fondamentale per supportare backend ad alto throughput oltre a Python.",
          "concerns": [
            "Garantire che i contratti Zod possano compilare verso struct Go e tipi Rust con la stessa accuratezza di Pydantic v2."
          ],
          "proposedTradeOffs": [
            "Definire generatori dedicati Zod-to-Go e Zod-to-Rust nel modulo sync."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "mobile_lead",
          "topicId": "TOPIC-1-UNIVERSAL-SCAFFOLDING",
          "opinion": "L'estensione a Flutter e Kotlin Multiplatform permette di coprire l'intero spettro applicativo mobile insieme a Swift nativo.",
          "concerns": [
            "Differenziazione chiara dei prompt per Lead Android/KMP vs Lead Flutter vs Lead SwiftUI."
          ],
          "proposedTradeOffs": [
            "Generare prompt specializzati rispettando le best practice idiomatiche di ciascun framework."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-2-MODULAR-PLUGINS-MCP",
      "title": "Modular Plugin & Model Context Protocol (MCP) Architecture",
      "originatingInterviews": [
        "1ON1-2026-10-ENG",
        "1ON1-2026-10-QA"
      ],
      "problemStatement": "Il core chiuso impedisce alla community open-source di estendere l'OS con nuovi detector o tool e manca l'interoperabilità con lo standard MCP.",
      "proposedSolution": "Creare un'architettura a plugin tipizzata con Zod per registrare detector e tool di terze parti in Worker Threads isolati, e implementare un bridge MCP Server/Client bidirezionale.",
      "managerFeedbacks": [
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-2-MODULAR-PLUGINS-MCP",
          "opinion": "Strategico per posizionare l'OS come riferimento universale nel panorama multi-agente open source.",
          "concerns": [
            "Possibili overhead di latenza nella comunicazione via MCP stdio/SSE."
          ],
          "proposedTradeOffs": [
            "Adottare trasporto stdio ad alte prestazioni per plugin locali e Worker Threads isolati."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-2-MODULAR-PLUGINS-MCP",
          "opinion": "Favorevole all'integrazione di MCP purché l'invocazione dei tool esterni sia rigidamente validata con Zod e non comprometta il Gatekeeper.",
          "concerns": [
            "Comportamenti imprevisti o freeze causati da server MCP instabili di terze parti."
          ],
          "proposedTradeOffs": [
            "Timeout rigido di 5000ms su chiamate MCP esterne e circuito di fallback esplicito."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-3-SELF-HEALING-GATEKEEPER",
      "title": "Autonomous Self-Healing Deterministic Gatekeeper",
      "originatingInterviews": [
        "1ON1-2026-10-QA",
        "1ON1-2026-10-ENG"
      ],
      "problemStatement": "L'attuale Gatekeeper è un blocco binario cieco che restituisce log grezzi senza localizzazione semantica degli errori né loop di correzione automatica.",
      "proposedSolution": "Sviluppare un motore di Self-Healing a ciclo chiuso guidato da parser diagnostici strutturati, coordinate AST, vincolo a max 3 iterazioni, AST Diff Guard e rollback atomico.",
      "managerFeedbacks": [
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-3-SELF-HEALING-GATEKEEPER",
          "opinion": "Salto generazionale per la qualità: trasforma il gatekeeper da ostacolo passivo a partner attivo di stabilità.",
          "concerns": [
            "Rischio di rimozione indebita di asserzioni di test o loop infiniti di correzione."
          ],
          "proposedTradeOffs": [
            "Vincolo deterministico a massimo 3 iterazioni, AST Diff Guard bloccante e rollback atomico in blocco finally."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-3-SELF-HEALING-GATEKEEPER",
          "opinion": "Piena approvazione con il vincolo del budget a 3 tentativi e AST Diff Guard per salvaguardare il consumo token.",
          "concerns": [
            "Consumo eccessivo di token LLM su errori complessi non riparabili localmente."
          ],
          "proposedTradeOffs": [
            "Arresto immediato e notifica Fail Loudly al Domain Lead in caso di mancata convergenza."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-4-DEVEX-INTERACTIVE-WIZARD",
      "title": "Developer Experience, Interactive Scaffolding Wizard & Multi-Repo Governance",
      "originatingInterviews": [
        "1ON1-2026-10-PROD"
      ],
      "problemStatement": "Onboarding ostico per gli sviluppatori esterni e assenza di supporto nativo per monorepo e multi-repo con cartelle eterogenee.",
      "proposedSolution": "Introdurre un wizard CLI interattivo ('npx agentic-os init'), supporto first-class per architetture monorepo/multi-repo con master index sincronizzato, e documentazione viva generata da Zod.",
      "managerFeedbacks": [
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-4-DEVEX-INTERACTIVE-WIZARD",
          "opinion": "Indispensabile per attrarre la community open source e garantire un onboarding inferiore a 60 secondi.",
          "concerns": [
            "Evitare interfacce CLI dispersive con troppe domande ridondanti."
          ],
          "proposedTradeOffs": [
            "Menu con selezioni smart pre-compilate basate sull'ispezione automatica preventiva."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-4-DEVEX-INTERACTIVE-WIZARD",
          "opinion": "Approvato con adozione del paradigma Convention over Configuration: wizard semplice con file di config opzionale per utenti avanzati.",
          "concerns": [
            "Possibile rigidità in contesti CI/CD non interattivi."
          ],
          "proposedTradeOffs": [
            "Mantenere il flag --non-interactive o --json per l'automazione CI/CD headless."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    }
  ],
  "resolvedTradeOffs": [
    "Sandboxing dei plugin delegato a Node Worker Threads leggeri con timeout hardware a 3000ms e validazione Zod su I/O, evitando il sovraccarico di container pesanti.",
    "Ergonomia a due livelli 'Convention over Configuration': wizard interattivo rapido per onboarding standard con file facoltativo agentic.config.ts per configurazioni enterprise avanzate.",
    "Sicurezza del self-healing loop garantita da 3 vincoli: budget massimo di 3 tentativi, AST Diff Guard per bloccare mutazioni fuori scope o rimozione di test, e rollback atomico automatico in caso di mancata convergenza."
  ],
  "signatures": [
    {
      "role": "rnd_lead",
      "signedAt": "2026-10-16T12:00:00.000Z"
    },
    {
      "role": "engineering_lead",
      "signedAt": "2026-10-16T12:02:00.000Z"
    },
    {
      "role": "product_lead",
      "signedAt": "2026-10-16T12:04:00.000Z"
    },
    {
      "role": "qa_lead",
      "signedAt": "2026-10-16T12:06:00.000Z"
    },
    {
      "role": "backend_lead",
      "signedAt": "2026-10-16T12:08:00.000Z"
    },
    {
      "role": "mobile_lead",
      "signedAt": "2026-10-16T12:10:00.000Z"
    },
    {
      "role": "cto",
      "signedAt": "2026-10-16T12:51:00.000Z"
    }
  ],
  "actionableBacklogTickets": [
    "TCK-4.1: Universal Multi-Stack Detector & Scaffolding Engine (Go, Rust, KMP, Flutter)",
    "TCK-4.2: Modular Plugin Architecture & Zod Plugin SDK",
    "TCK-4.3: Model Context Protocol (MCP) Server & Client Bridge",
    "TCK-5.1: Structured Diagnostic Parsers & AST Coordinates Engine",
    "TCK-5.2: Autonomous Self-Healing Closed Loop Runner (Max 3 iterations + Atomic Rollback)",
    "TCK-5.3: AST Diff Guard & Scope Enforcement Rule Engine",
    "TCK-5.4: Interactive CLI Scaffolding Wizard (@clack/prompts) with Monorepo/Multi-Repo Support"
  ],
  "createdAt": "2026-10-16T11:40:00.000Z",
  "updatedAt": "2026-10-16T12:15:00.000Z"
}
```
