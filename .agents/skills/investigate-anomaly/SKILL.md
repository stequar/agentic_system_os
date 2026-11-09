---
name: investigate-anomaly
description: "Attiva MODE 2 (INVESTIGATE_RCA — Stop-the-Line & Read-Only): esegue i 5 Whys, consulta R&D + Ring-2 Domain Experts + Devil's Advocate e astrae dal sintomo al principio."
---

# Investigate Anomaly Skill — Root Cause Analysis Protocol (`MODE_2_INVESTIGATE_RCA`)

> Protocollo **Stop-the-Line & Read-Only** per l'analisi deterministica di bug, regressioni o anomalie architetturali.

---

## 1. Regola Aurea: Divieto di Scrittura Immediata (CFF-1)

1. Appena il CEO segnala un bug, un fallimento o un'anomalia comportamentale, dichiara immediatamente `[CTO MODE: 2 — INVESTIGATE_RCA (READ-ONLY)]`.
2. **NON modificare alcun file di produzione.** Qualsiasi tentativo di entrare in `IMPLEMENT` senza un `RootCauseAnalysisReport` approvato dal CEO viene bloccato da `CompanyStateMachine.enforceCognitiveForcingGate` con errore `COGNITIVE_FORCING_GATE_VIOLATION`.

---

## 2. Procedura Investigativa in 4 Passi (CFF-2 & CFF-3)

1. **Scope Routing Automatico**:
   - Esegui `agentic-company workflow route --scope <files_or_keywords> --json` per individuare gli Esperti di Dominio Ring-2 e gli Specialisti Tech Ring-1 impattati.
2. **Catena dei 5 Whys (`fiveWhys.length >= 3`)**:
   - Risali dal sintomo visibile alla causa radice strutturale attraverso almeno 3-5 livelli causali verificati sul codice.
3. **Consultazione Multi-Ring & Devil's Advocate**:
   - Consulta `rnd_lead`, gli Esperti di Dominio Ring-2 pertinenti e `qa_lead` (Devil's Advocate / Red-Teamer) per identificare i rischi collaterali (`redTeamRisks`).
4. **Astrazione Symptom-to-Principle (`systemicPrinciple`)**:
   - Formula il principio architetturale universale e l'invariante verificabile che impedirà all'intera classe di bug di ripresentarsi, passando poi a `/rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`) per il consenso e il Go del CEO.
