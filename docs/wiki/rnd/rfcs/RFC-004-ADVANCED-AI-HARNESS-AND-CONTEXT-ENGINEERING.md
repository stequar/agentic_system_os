# 📄 RFC-004: Advanced Agentic Workflow, Context Window Engineering, Token Optimization & Modern AI Harness

**RFC ID:** `RFC-004-ADVANCED-AI-HARNESS-AND-CONTEXT-ENGINEERING`  
**Titolo:** Advanced Agentic Workflow, Context Window Engineering, Token Optimization & Modern AI Harness  
**Autore:** R&D Lead (`rnd_lead`)  
**Stato:** `RATIFIED_BY_CTO` (Ratificato formalmente dal CTO)  
**Data Creazione:** 2026-10-16T18:30:00.000Z  
**Data Aggiornamento:** 2026-10-16T19:05:00.000Z  
**Schema di Riferimento:** [`ConsensusRfcSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts)

---

## 🧭 Visione Condivisa (Shared Vision)
Costruire il sistema operativo per agenti autonomi con il più avanzato AI harness del settore: token optimization radicale con oltre l'80% di prompt caching hit rate, memoria attiva anti-rot a compattazione deterministica che preserva il 100% dei vincoli critici, dynamic tool pruning con decodifica guidata da schema per azzerare gli errori sintattici, e una sala di controllo FinOps e Context Health in tempo reale per CEO e sviluppatori.

---

## 🏛️ Sintesi Architetturale dei 4 Topic

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              AGENTIC COMPANY OS — ADVANCED AI HARNESS & CONTEXT CORE             │
├─────────────────────────┬──────────────────────────────┬─────────────────────────┤
│  TOPIC 1: PROMPT CACHE  │    TOPIC 2: ANTI-ROT MEMORY  │   TOPIC 3: TOOL PRUNING │
│  Two-Tier Architecture  │  Deterministic Compaction    │  State-Driven Pruner    │
│  • Tier 1: Static Prefix│  • Invariant Guardrail       │  • Universal Core Tools │
│  • Cache Hit Rate >80%  │  • Threshold at 40k Tokens   │  • State-Gated Actions  │
│  • Sub-second TTFT      │  • File & Test Coordinates   │  • Constrained Decoding │
├─────────────────────────┴──────────────────────────────┴─────────────────────────┤
│                      TOPIC 4: FINOPS & CONTEXT HEALTH COCKPIT                    │
│    Live Token FinOps (Real-time $ cost) • Context Health Index (0-100%)          │
│    Interactive Breadcrumb Trajectory • Virtualized Decision Timeline             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Topic 1: Two-Tier Prompt Architecture & Prefix Prompt Caching (`TOPIC-1-TWO-TIER-PROMPT-CACHING`)
- **Interviste di Origine:** `1ON1-2026-10-C4-AI`, `1ON1-2026-10-C4-ENG`
- **Problema:** L'invio ripetuto dell'intero system prompt, delle convenzioni e dei contratti Zod senza un prefisso statico immutabile impedisce ai provider (Anthropic, OpenAI, DeepSeek) di riutilizzare la cache, quadruplicando i costi vivi e portando il Time-To-First-Token a oltre 4-6 secondi nelle conversazioni lunghe.
- **Soluzione Proposta:**
  - Progettazione della **Two-Tier Prompt Architecture**: suddivisione formale del prompt in Tier 1 (Prefisso statico invariante con Kernel OS e regole di governance con checkpoint di cache effimero) e Tier 2 (Contesto dinamico di task e input).
  - Implementazione di un adapter nativo nel client LLM che garantisce un cache hit rate >80% e abbatte i costi di elaborazione fino al 90%.

## 📌 Topic 2: Deterministic Context Compaction & Anti-Rot Memory Engine (`TOPIC-2-CONTEXT-COMPACTION-ANTI-ROT`)
- **Interviste di Origine:** `1ON1-2026-10-C4-AI`, `1ON1-2026-10-C4-QA`
- **Problema:** Il fenomeno del *Context Rot* provoca dispersione dell'attenzione (needle-in-a-haystack decay) su sessioni oltre i 50k token, causando allucinazioni e dimenticanze di istruzioni fondazionali, mentre compattazioni euristiche rischiano di cancellare vincoli di test cruciali.
- **Soluzione Proposta:**
  - Creazione dell'**Anti-Rot Memory Engine** con compattazione deterministica a soglia (es. 40k token) basato sul paradigma Karpathy "Context as RAM".
  - Introduzione dell'**Invariant Protection Guardrail**: congelamento deterministico in tabelle immutabili delle coordinate di file, dei requisiti di backlog e delle asserzioni di test, con rigetto automatico di sintesi che omettono vincoli di verità.

## 📌 Topic 3: Dynamic Tool Pruning & Schema-Guided Structured Decoding (`TOPIC-3-DYNAMIC-TOOL-PRUNING`)
- **Interviste di Origine:** `1ON1-2026-10-C4-AI`, `1ON1-2026-10-C4-QA`
- **Problema:** L'iniezione dell'intero catalogo di tool a ogni sub-agente spreca decine di migliaia di token e aumenta la probabilità di chiamate di tool allucinate; inoltre, le risposte in formato libero sono vulnerabili a JSON malformati o non convalidati.
- **Soluzione Proposta:**
  - Implementazione di un **State-Driven Tool Pruner** a due fasce: Universal Core Tools sempre attivi per compiti di base (lettura, messaggi) e State-Gated Action Tools sbloccati solo negli stati pertinenti della state machine.
  - Adozione di **Schema-Guided Constrained Decoding** (JSON Schema forzato sui logit del provider) per azzerare gli errori sintattici a runtime.

## 📌 Topic 4: Observability Cockpit: Context Health, Live Token FinOps & Breadcrumb Trajectory (`TOPIC-4-OBSERVABILITY-FINOPS-COCKPIT`)
- **Interviste di Origine:** `1ON1-2026-10-C4-PROD`
- **Problema:** Mancanza di visibilità per CEO e manager sui costi vivi generati dai modelli, invisibilità del livello di saturazione della context window e assenza di tracciabilità grafica delle decisioni e delle invocazioni dei tool.
- **Soluzione Proposta:**
  - Sviluppo di un **FinOps & Context Health Cockpit** integrato nell'Agentic Studio: grafici di spesa in dollari con differenziazione Cache Read / Cache Write / Completion, indicatore del Context Health Index (0-100%) con alert preventivo di compattazione.
  - Visualizzazione interattiva della **Breadcrumb Trajectory**: timeline a briciole di pane per ispezionare visivamente ogni singolo passaggio cognitivo e tool call della flotta.

---

## ⚖️ Trade-Off Risolti (Resolved Trade-Offs)
1. **Two-Tier Prompt Architecture:** Separazione netta tra Tier 1 (Prefisso statico invariante con checkpoint di cache effimero) e Tier 2 (Dinamico / Ephemeral), garantendo >80% cache hit rate e azzerando i costi di reinvio del Kernel OS.
2. **Invariant Protection Guardrail per Context Compaction:** Compattazione a soglia (40k token) vincolata deterministicamente alla preservazione immutabile delle coordinate AST, dei casi di test e dei requisiti di backlog, con rigetto automatico se un'invariante viene omessa.
3. **Two-Tier Capability Pruning:** Set di Universal Core Tools sempre disponibili affiancato da State-Gated Action Tools abilitati selettivamente dalla state machine, azzerando il tool bloat senza limitare la flessibilità dell'agente.
4. **Live FinOps & Context Health Cockpit:** Strumentazione in tempo reale nello Studio Web con metriche di spesa in dollari, risparmio da caching, indice di saturazione della memoria (0-100%) e timeline a briciole di pane virtualizzata.

---

## ✍️ Firme dei Lead (Signatures)
- `rnd_lead`: 2026-10-16T18:50:00.000Z
- `ai_lead`: 2026-10-16T18:51:00.000Z
- `engineering_lead`: 2026-10-16T18:52:00.000Z
- `product_lead`: 2026-10-16T18:53:00.000Z
- `qa_lead`: 2026-10-16T18:54:00.000Z
- `backend_lead`: 2026-10-16T18:55:00.000Z
- `mobile_lead`: 2026-10-16T18:56:00.000Z

---

## 🎫 Ticket di Backlog Azionabili (Actionable Backlog Tickets)
- `TCK-10.1`: Two-Tier Prompt Engine & Universal Prefix Caching Transport Adapter
- `TCK-10.2`: Invariant-Protected Context Compaction & Anti-Rot Memory Engine
- `TCK-10.3`: State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder
- `TCK-11.1`: Live Token FinOps Dashboard & Real-Time Dollar Cost Tracker
- `TCK-11.2`: Context Health Meter & Proactive Compaction Alerting System
- `TCK-11.3`: Interactive Breadcrumb Trajectory Visualizer & Decision Inspector

---

## 📑 Dati Strutturati Zod (ConsensusRfcSchema)

```json
{
  "rfcId": "RFC-004-ADVANCED-AI-HARNESS-AND-CONTEXT-ENGINEERING",
  "title": "Advanced Agentic Workflow, Context Window Engineering, Token Optimization & Modern AI Harness",
  "authorRole": "rnd_lead",
  "status": "RATIFIED_BY_CTO",
  "sharedVision": "Costruire il sistema operativo per agenti autonomi con il più avanzato AI harness del settore: token optimization radicale con oltre l'80% di prompt caching hit rate, memoria attiva anti-rot a compattazione deterministica che preserva il 100% dei vincoli critici, dynamic tool pruning con decodifica guidata da schema per azzerare gli errori sintattici, e una sala di controllo FinOps e Context Health in tempo reale per CEO e sviluppatori.",
  "topics": [
    {
      "id": "TOPIC-1-TWO-TIER-PROMPT-CACHING",
      "title": "Two-Tier Prompt Architecture & Prefix Prompt Caching",
      "originatingInterviews": [
        "1ON1-2026-10-C4-AI",
        "1ON1-2026-10-C4-ENG"
      ],
      "problemStatement": "L'invio ripetuto di prompt monolitici senza separazione del prefisso statico impedisce l'utilizzo del prompt caching dei provider, quadruplicando i costi e aumentando la latenza TTFT.",
      "proposedSolution": "Implementare una Two-Tier Prompt Architecture con prefisso Tier 1 immutabile protetto da cache checkpoint e Tier 2 dinamico per input ed esecuzione, garantendo oltre l'80% di cache hit rate.",
      "managerFeedbacks": [
        {
          "managerRole": "ai_lead",
          "topicId": "TOPIC-1-TWO-TIER-PROMPT-CACHING",
          "opinion": "La Two-Tier Architecture è il moltiplicatore di efficienza fondamentale per abbattere i costi e scalare la velocità dell'OS a livelli industriali.",
          "concerns": [
            "Assicurarsi che gli sviluppatori di plugin rispettino il confine tra Tier 1 e Tier 2 senza inserire variabili dinamiche nel prefisso."
          ],
          "proposedTradeOffs": [
            "Inserire un linter deterministico che verifichi l'immutabilità del Tier 1 a tempo di build con hash SHA-256."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-1-TWO-TIER-PROMPT-CACHING",
          "opinion": "Rivoluziona il throughput dell'OS: abbattimento del Time-To-First-Token da oltre 5 secondi a meno di 800ms sui turni avanzati.",
          "concerns": [
            "Divergenze nelle implementazioni di prompt caching tra i diversi provider (Anthropic vs OpenAI vs DeepSeek)."
          ],
          "proposedTradeOffs": [
            "Costruire un adapter layer universale nel client LLM che mappa i breakpoint di cache in base al provider attivo."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-2-CONTEXT-COMPACTION-ANTI-ROT",
      "title": "Deterministic Context Compaction & Anti-Rot Memory Engine",
      "originatingInterviews": [
        "1ON1-2026-10-C4-AI",
        "1ON1-2026-10-C4-QA"
      ],
      "problemStatement": "Il decadimento attentivo (Context Rot) su sessioni oltre i 50k token genera allucinazioni e perdita di istruzioni fondazionali, mentre compattazioni euristiche rischiano di cancellare vincoli di test cruciali.",
      "proposedSolution": "Sviluppare l'Anti-Rot Memory Engine con compattazione deterministica a soglia (40k token) e Invariant Protection Guardrail per congelare coordinate di file, test e decisioni di backlog.",
      "managerFeedbacks": [
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-2-CONTEXT-COMPACTION-ANTI-ROT",
          "opinion": "L'introduzione dell'Invariant Protection Guardrail rende la compattazione della memoria sicura e a prova di regressione.",
          "concerns": [
            "Possibili loop di rigetto se l'algoritmo di compattazione fallisce ripetutamente nel preservare le invarianti."
          ],
          "proposedTradeOffs": [
            "Fallback grazioso su sliding window conservativa con avviso esplicito al Domain Lead."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-3-DYNAMIC-TOOL-PRUNING",
      "title": "Dynamic Tool Pruning & Schema-Guided Structured Decoding",
      "originatingInterviews": [
        "1ON1-2026-10-C4-AI",
        "1ON1-2026-10-C4-QA"
      ],
      "problemStatement": "Il passaggio indiscriminato dell'intero arsenale di tool a ogni agente spreca token e favorisce allucinazioni di tool call, mentre output in formato libero rischiano JSON non conformi.",
      "proposedSolution": "Costruire un Dynamic Tool Pruner a due fasce (Universal Core Tools + State-Gated Action Tools) e forzare Schema-Guided Constrained Decoding direttamente sui logit del provider.",
      "managerFeedbacks": [
        {
          "managerRole": "backend_lead",
          "topicId": "TOPIC-3-DYNAMIC-TOOL-PRUNING",
          "opinion": "La riduzione dell'overhead dei tool velocizza le risposte e rende il modello molto meno incline ad allucinare chiamate di tool errate.",
          "concerns": [
            "Assicurarsi che il pruning sia sincronizzato con lo stato transizionale del task."
          ],
          "proposedTradeOffs": [
            "Accoppiare il selettore di tool direttamente alla state-machine deterministica del core."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-4-OBSERVABILITY-FINOPS-COCKPIT",
      "title": "Observability Cockpit: Context Health, Live Token FinOps & Breadcrumb Trajectory",
      "originatingInterviews": [
        "1ON1-2026-10-C4-PROD"
      ],
      "problemStatement": "Opacità totale sui costi LLM vivi, assenza di visibilità sulla saturazione della context window e mancata rappresentazione visiva dei ragionamenti degli agenti.",
      "proposedSolution": "Costruire una sezione FinOps & Context Health Cockpit nell'Agentic Studio con calcolo costi in tempo reale, Context Health Index (0-100%) e mappa interattiva Breadcrumb Trajectory.",
      "managerFeedbacks": [
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-4-OBSERVABILITY-FINOPS-COCKPIT",
          "opinion": "Il Cockpit FinOps e l'indicatore di Context Health danno al CEO e ai manager il pieno controllo economico e operativo della flotta.",
          "concerns": [
            "Evitare sovraccarico visivo con troppi grafici complessi nella dashboard."
          ],
          "proposedTradeOffs": [
            "Presentare una vista sintetica ad alto livello con switch per dettagli tecnici avanzati."
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "mobile_lead",
          "topicId": "TOPIC-4-OBSERVABILITY-FINOPS-COCKPIT",
          "opinion": "La Breadcrumb Trajectory rende finalmente comprensibile e trasparente ogni decisione presa dagli agenti durante lo sviluppo.",
          "concerns": [
            "Consumo memoria del browser per sessioni con migliaia di passaggi."
          ],
          "proposedTradeOffs": [
            "Paginazione virtualizzata della timeline con caricamento on-demand dei dettagli."
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    }
  ],
  "resolvedTradeOffs": [
    "Two-Tier Prompt Architecture: Separazione netta tra Tier 1 (Prefisso statico invariante con checkpoint di cache effimero) e Tier 2 (Dinamico / Ephemeral), garantendo >80% cache hit rate e azzerando i costi di reinvio del Kernel OS.",
    "Invariant Protection Guardrail per Context Compaction: Compattazione a soglia (40k token) vincolata deterministicamente alla preservazione immutabile delle coordinate AST, dei casi di test e dei requisiti di backlog, con rigetto automatico se un'invariante viene omessa.",
    "Two-Tier Capability Pruning: Set di Universal Core Tools sempre disponibili affiancato da State-Gated Action Tools abilitati selettivamente dalla state machine, azzerando il tool bloat senza limitare la flessibilità dell'agente.",
    "Live FinOps & Context Health Cockpit: Strumentazione in tempo reale nello Studio Web con metriche di spesa in dollari, risparmio da caching, indice di saturazione della memoria (0-100%) e timeline a briciole di pane virtualizzata."
  ],
  "signatures": [
    {
      "role": "rnd_lead",
      "signedAt": "2026-10-16T18:50:00.000Z"
    },
    {
      "role": "ai_lead",
      "signedAt": "2026-10-16T18:51:00.000Z"
    },
    {
      "role": "engineering_lead",
      "signedAt": "2026-10-16T18:52:00.000Z"
    },
    {
      "role": "product_lead",
      "signedAt": "2026-10-16T18:53:00.000Z"
    },
    {
      "role": "qa_lead",
      "signedAt": "2026-10-16T18:54:00.000Z"
    },
    {
      "role": "backend_lead",
      "signedAt": "2026-10-16T18:55:00.000Z"
    },
    {
      "role": "mobile_lead",
      "signedAt": "2026-10-16T18:56:00.000Z"
    }
  ],
  "actionableBacklogTickets": [
    "TCK-10.1: Two-Tier Prompt Engine & Universal Prefix Caching Transport Adapter",
    "TCK-10.2: Invariant-Protected Context Compaction & Anti-Rot Memory Engine",
    "TCK-10.3: State-Driven Dynamic Tool Pruner & Schema-Guided Constrained Decoder",
    "TCK-11.1: Live Token FinOps Dashboard & Real-Time Dollar Cost Tracker",
    "TCK-11.2: Context Health Meter & Proactive Compaction Alerting System",
    "TCK-11.3: Interactive Breadcrumb Trajectory Visualizer & Decision Inspector"
  ],
  "createdAt": "2026-10-16T18:30:00.000Z",
  "updatedAt": "2026-10-16T19:00:00.000Z"
}
```
