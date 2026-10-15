# 🏢 AGENTIC COMPANY OS — Architectural Specification

> **Standard Industriale per l'Ingegneria di Reparti Software Multi-Agente Autonomi.**  
> Ispirato al paradigma *LLM OS* di Andrej Karpathy, al pattern *Orchestrator-Workers* di Anthropic e all'eliminazione sistematica dei *Cascading Errors* documentati negli studi su MetaGPT e ChatDev.

---

## 1. Topologia Gerarchica & Ruoli

L'architettura separa rigorosamente l'**Orchestrazione Strategica** dall'**Esecuzione Chirurgica**:

```
👑 CEO (Utente Umano)
    │
    ▼ [Sprint Sync & Approval]
🧠 CTO (Agente Primario / Orchestrator)
    │
    ├──────────────────────────┬──────────────────────────┐
    ▼                          ▼                          ▼
📋 Product Lead            ⚙️ Backend Manager         📱 Mobile / Frontend Manager
[enable_subagent_tools:T]  [enable_subagent_tools:T]  [enable_subagent_tools:T]
    │                          │                          │
    ▼                          ▼                          ▼
📝 PRD / Zod Specs         💻 Leaf Backend Devs       💻 Leaf Frontend/UI Devs
                           [enable_subagent_tools:F]  [enable_subagent_tools:F]
```

### Ruoli e Livelli di Autorizzazione

| Livello | Ruolo | `enable_subagent_tools` | `enable_write_tools` | Modello Consigliato | Responsabilità |
|---|---|:---:|:---:|---|---|
| **L0** | **CEO (Utente)** | N/A | N/A | Umano | Visione di business, roadmap macro, gate go/no-go degli sprint. |
| **L1** | **CTO** | `true` | `true` | Deep Reasoning (Pro / Opus / Thinking) | Conduce il Daily Standup (`/run-company`), governa l'architettura globale, istanzia i Manager e monitora il budget dei token. **Non scrive codice applicativo**. |
| **L2** | **Domain Leads** (Product, Backend, Mobile, QA) | `true` | `true` | Reasoning (Pro / Sonnet) | Architetti di reparto. Formulano i contratti tipizzati (Zod / OpenAPI / SQL), delegano task ai dev foglia, eseguono Code Review formale. |
| **L3** | **Leaf Developers** (Python Dev, Swift Dev, SQL Dev) | `false` | `true` | Fast / Codegen (Flash / Sonnet) | Agenti effimeri con compiti circoscritti (1 ticket, 2-3 file). Eseguono modifiche in sandbox e si chiudono dopo la consegna. Zero *context rot*. |

---

## 2. Paradigma "Context as RAM" (Andrej Karpathy)

1. **Context Window = RAM volatile:** La context window non deve mai essere saturata con l'intero codebase o con log verbosi.
2. **Docs & Wiki = Memoria Secondaria Persistente:** Tutta la conoscenza aziendale risiede in `docs/wiki/`.
3. **Master Bootloader (`docs/wiki/INDEX.md`):** Il punto di accesso unico per gli agenti. Gli agenti leggono l'indice e caricano chirurgicamente solo il modulo necessario al task corrente (*Progressive Disclosure*).
4. **Fail Loudly:** Se una regola o un'assunzione non è coperta dalla documentazione, l'agente non improvvisa: si arresta immediatamente e scala al proprio Lead.

---

## 3. Blackboard Pattern & State Machine Deterministica (FSM)

Per evitare l'overhead quadratico ($O(N^2)$) e i loop infiniti di chiacchiericcio scoperti su ChatDev, **gli agenti non conversano in testo libero tra loro**. Comunicano esclusivamente attraverso **transizioni di stato su una Blackboard condivisa** (il filesystem Git).

### Ciclo di Vita di uno Sprint:
$$\text{STANDUP} \xrightarrow{\text{CEO Go}} \text{SPECIFY} \xrightarrow{\text{Contracts Ready}} \text{DELEGATE} \xrightarrow{\text{Code Written}} \text{GATEKEEPER} \xrightarrow{\text{Tests Pass}} \text{REVIEW} \xrightarrow{\text{Approved}} \text{MERGE}$$

1. **Stato 1: STANDUP** — Il CTO legge lo stato attuale e presenta il briefing per team al CEO via `/run-company`. Attende l'OK formale.
2. **Stato 2: SPECIFY** — Il Product Lead e i Tech Lead generano i contratti tipizzati Zod / schemi DB prima di scrivere una sola riga di logica.
3. **Stato 3: DELEGATE & IMPLEMENT** — I Lead invocano i Leaf Devs, passando il ticket e il contratto tipizzato. I Dev operano su branch git dedicati.
4. **Stato 4: DETERMINISTIC GATEKEEPER** — Script automatico (linter + typechecker + test unitari). Se fallisce, il Dev riceve l'output del compiler e corregge. Nessun umano o Lead spreca tempo se i test falliscono.
5. **Stato 5: CODE REVIEW & MERGE** — Il Lead verifica conformità architetturale (MVVM, async/await, security). Se approvato, il codice passa su `main`.

---

## 4. Typed Contracts over Prose (Zod Schemas)

I passaggi di consegne non sono paragrafi narrativi, ma strutture TypeScript validate con Zod:
* **`ProductTicketSchema`**: `id`, `epicId`, `acceptanceCriteria`, `inputSchema`, `outputSchema`.
* **`ApiContractSchema`**: Endpoints, DTO di richiesta/risposta, codici di errore HTTP, vincoli di validazione.
* **`ReviewReportSchema`**: `status: "APPROVED" | "CHANGES_REQUESTED"`, `linterExitCode: 0`, `violations: []`.

---

## 5. Model Context Protocol (MCP)

Tutti gli strumenti esterni (accesso al terminale, sandbox Docker, letture repository, metriche Langfuse) sono esposti tramite server MCP conformi alla specifica `@modelcontextprotocol/sdk`.
