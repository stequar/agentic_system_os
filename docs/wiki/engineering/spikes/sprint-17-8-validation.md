# 🔬 Architectural Spike: Sprint 17.8 Tech Validation
**Sprint:** SPRINT-17.8 — Central Settings Configuration (`.company-os/settings.json`) & Configurable Spike Checkpoint Gate (`CFF-5`)  
**Author:** CTO & Domain Leads (`governance_workflow_specialist` [Ring-2], `engineering_lead`, `product_lead`, `qa_lead` [Devil's Advocate])  
**Status:** VALIDATED & APPROVED  
**Verdict:** `APPROVED`  
**Schema Compliance:** [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts)  
**Date:** 2026-11-09  

---

## 📋 Executive Summary

Questo dossier architetturale formalizza la **validazione tecnologica (`TCK-17.8.0`)** per lo **Sprint 17.8: Central Settings Configuration (`.company-os/settings.json`) & Configurable Spike Checkpoint Gate (`CFF-5`)**.

Nato dall'osservazione strategica del CEO (*"stai iniziando a darmi lo spike report solo perché te l'ho chiesto... pensavo a un file json dove configurare i settings della libreria, approfittandone anche per altri interruttori e creando la documentazione per visualizzare i valori possibili"*), lo Sprint 17.8 introduce:
1. **Contratto Tipizzato `CompanySettingsSchema` (`src/contracts/settings.ts`):** schema Zod con defaults completi e catalogo descrittivo dei valori ammessi (`SETTINGS_REFERENCE_CATALOG`) suddiviso in 5 sezioni (`governance`, `localSlm`, `gatekeeper`, `communication`, `finops`).
2. **Gestore Atomico `SettingsManager` (`src/core/settings-manager.ts`):** persistenza in `.company-os/settings.json`, aggiornamento puntuale via dot-notation (es. `governance.spikeCheckpoint`) e auto-inizializzazione.
3. **5ª Cognitive Forcing Function (`CFF-5: Configurable Spike Checkpoint Gate`):** cablata in `CompanyStateMachine.enforceCognitiveForcingGate()`, che blocca il passaggio dallo Spike alla Build se `governance.spikeCheckpoint === "HITL_SPIKE_REVIEW"` e lo Spike non è ancora stato approvato dal CEO (`spikeApprovedByCeo === false`), mentre consente l'esecuzione diretta se impostato su `"AUTONOMOUS_FAST_TRACK"`.
4. **Documentazione di Riferimento Completa (`docs/wiki/engineering/settings-reference.md`):** manuale esecutivo con tabelle di tutti i parametri, valori possibili, default ed esempi CLI/JSON.

---

## 📑 Dati Strutturati Zod (TechValidationReportSchema)

```json
{
  "sprintId": "SPRINT-17.8",
  "sprintTheme": "Central Settings Configuration (.company-os/settings.json) & Configurable Spike Checkpoint Gate (CFF-5)",
  "executiveSummary": "Validazione tecnologica per lo Sprint 17.8 di Agentic Company OS. Ratifica il file dichiarativo centralizzato .company-os/settings.json validato da CompanySettingsSchema (5 domini: governance, localSlm, gatekeeper, communication, finops), il SettingsManager, la Cognitive Forcing Function CFF-5 (HITL_SPIKE_REVIEW vs AUTONOMOUS_FAST_TRACK) e la documentazione di riferimento completa in docs/wiki/engineering/settings-reference.md.",
  "proposedDecisions": [
    "Creare src/contracts/settings.ts con CompanySettingsSchema e il catalogo metadati SETTINGS_REFERENCE_CATALOG che espone tutti i valori possibili per ciascun interruttore.",
    "Implementare src/core/settings-manager.ts per leggere, validare, inizializzare e aggiornare atomicamente .company-os/settings.json.",
    "Estendere CompanyStateMachine.enforceCognitiveForcingGate con la regola CFF-5 (Spike Checkpoint Gate) basata su settings.governance.spikeCheckpoint.",
    "Cablare SettingsManager in workflow CLI (status, settings, set-setting), Voice Director, QuadTierDispatcher e SelfHealingLoop.",
    "Redigere e indicizzare docs/wiki/engineering/settings-reference.md con la tabella completa di tutte le chiavi, tipi, default e valori enum ammessi."
  ],
  "benchmarksAndTools": [
    {
      "name": "Zod Declarative Settings Schema with Default Fallbacks",
      "category": "configuration-management",
      "url": "https://zod.dev/",
      "pros": [
        "Validazione rigorosa a runtime con messaggi d'errore espliciti se l'utente inserisce un valore non valido nel JSON",
        "Auto-popolamento dei campi mancanti tramite .default() garantendo retrocompatibilità totale",
        "Introspezione immediata dei valori enum per generare documentazione e output CLI"
      ],
      "cons": [
        "Richiede sincronizzazione tra schema TypeScript e tabella Markdown di riferimento"
      ],
      "recommendation": "adopt",
      "notes": "Spina dorsale di .company-os/settings.json."
    }
  ],
  "bestPractices": [
    "Garantire che .company-os/settings.json sia sempre valido anche se parzialmente compilato dall'utente grazie ai default Zod per ogni sezione.",
    "Esporre via CLI (workflow settings) il catalogo completo dei valori possibili per ogni interruttore.",
    "Sincronizzare qualsiasi modifica vocale o CLI direttamente dentro .company-os/settings.json."
  ],
  "risksAndMitigations": [
    {
      "risk": "L'utente scrive un valore non valido o corrompe la sintassi di .company-os/settings.json.",
      "impact": "medium",
      "mitigation": "SettingsManager intercetta gli errori di parsing Zod/JSON segnalando esattamente il campo errato e i valori consentiti, con fallback sicuro ai default in modalità read-only."
    }
  ],
  "verdict": "APPROVED",
  "finalRecommendations": [
    "Procedere all'implementazione di src/contracts/settings.ts, src/core/settings-manager.ts e docs/wiki/engineering/settings-reference.md.",
    "Integrare CFF-5 in src/core/state-machine.ts e nei comandi CLI workflow.",
    "Certificare con la suite di test tests/settings-and-spike-gate.test.ts."
  ],
  "sources": [
    "src/core/state-machine.ts",
    "src/cli/commands/workflow.ts",
    "docs/wiki/engineering/settings-reference.md"
  ],
  "validatedAt": "2026-11-09T15:56:00.000Z"
}
```
