# Agentic Company OS 🏢⚡

> Enterprise-grade multi-agent autonomous software company orchestrator with typed contracts, deterministic gates, and Karpathy Context as RAM.

## 🚀 Obiettivo
Agentic Company OS è un framework e CLI progettato per orchestrare team autonomi di sviluppo software composti da agenti AI specializzati. Risolve i fallimenti sistemici dei framework multi-agente classici (come i *cascading errors* e l'*overhead di comunicazione quadratico* di MetaGPT e ChatDev) implementando:

- **Topologia a 3 Livelli:** CEO (Umano) $\rightarrow$ CTO (Orchestrator) $\rightarrow$ Domain Leads (Product, Backend, Mobile) $\rightarrow$ Leaf Devs effimeri.
- **Context as RAM (Andrej Karpathy):** Paging chirurgico della memoria via Wiki atomica con master bootloader (`INDEX.md`).
- **Blackboard Pattern & State Machine FSM:** Sostituisce il chiacchiericcio incontrollato con transizioni di stato deterministiche.
- **Contratti Tipizzati Zod:** Nessuna specifica narrativa ambigua; ogni passaggio di consegne è validato a runtime con schemi Zod.
- **Gatekeeper Deterministico:** Compilatori, linter e test automatici come guardrail insormontabili prima della Code Review dell'agente Lead.

## 📦 Struttura del Progetto
- `src/core/`: Macchina a stati, orchestratore e logica dei ruoli.
- `src/contracts/`: Schemi Zod per Product Requirements, Architettura e Report di Code Review.
- `src/gatekeeper/`: Script per l'esecuzione di verifiche deterministiche e sandbox.
- `docs/wiki/`: Knowledge Base permanente secondo la metodologia Karpathy LLM OS.
- `docs/CEO_Dashboard.md`: Vista esecutiva dell'avanzamento degli sprint.
- `COMPANY_SPEC.md`: Specifiche architetturali complete.

## 🛠️ Stack
- **Runtime:** Node.js (v22+) & TypeScript (Strict Mode)
- **Validation:** Zod
- **Testing:** Vitest
- **Tooling:** Model Context Protocol (MCP)
