---
name: run-company
description: "Avvia il Daily Standup Sync e l'orchestrazione multi-agente per il CEO. Genera lo status report e richiede l'approvazione per far partire lo sprint."
---

# Skill: Run Company (Daily Standup & Multi-Agent Orchestration)

Questa skill orchestra il flusso di lavoro dell'Agentic Company OS.

## Workflow

1. **Lettura Stato (Blackboard Sync):**
   - Leggi `AGENTS.md` per l'organigramma e `docs/wiki/INDEX.md` per i contratti.
   - Analizza `docs/CEO_Dashboard.md`.

2. **Briefing per il CEO (Output):**
   Genera il report strutturato:
   - **📋 Team Product:** Stato requisiti e contratti Zod.
   - **⚙️ Team Backend:** Stato API e persistenza.
   - **📱 Team Frontend/Mobile:** Stato interfacce e integrazione.
   - **👑 Richiesta CEO:** Richiedi il Go formale per la transizione allo stato `SPECIFY`/`DELEGATE`.

3. **Esecuzione Autonoma:**
   Appena il CEO approva, usa `invoke_subagent` per lanciare i Domain Leads in parallelo.
