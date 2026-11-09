---
name: rnd-roundtable
description: "Attiva MODE 3 (RND_ROUNDTABLE): orchestra interviste 1:1, Tavola Rotonda con Devil's Advocate obbligatorio (qa_lead + Ring-2) e presenta l'Executive Pitch al CEO."
---

# R&D Roundtable Skill — Consensus & Executive Pitch (`MODE_3_RND_ROUNDTABLE`)

> Protocollo di ricerca R&D, dibattito strutturato Anti-Echo-Chamber a 2 round e approvazione esecutiva del CEO.

---

## 1. Flusso della Tavola Rotonda (`CeremonyDispatcher` + `ConsensusEngine`)

1. Dichiara `[CTO MODE: 3 — RND_ROUNDTABLE]`.
2. **Convocazione Automatica per Scope**:
   - Avvia la cerimonia `ARCHITECTURE_REVIEW_ROUNDTABLE` includendo `rnd_lead`, `engineering_lead`, `product_lead`, `ai_lead`, gli Esperti di Dominio Ring-2 e `qa_lead` nel ruolo obbligatorio di **Devil's Advocate / Red-Teamer**.
3. **Dibattito in 2 Round (`ConsensusEngine`)**:
   - **Round 1 (Red-Team Challenge):** Il Devil's Advocate (`qa_lead` o l'esperto Ring-2 primario) solleva fallacie di sicurezza, performance o dominio (`DevilsAdvocateFeedback`).
   - **Round 2 (Mitigations & Convergence):** I Lead propongono contromisure deterministiche (`mitigations`) fino a `CONSENSUS_REACHED` o `TIE_BREAK_INVOKED` da parte del CTO.

---

## 2. Executive Pitch al CEO & Gate di Approvazione (CFF-4)

1. Sintetizza l'RFC o il `RootCauseAnalysisReport` in un **Executive Pitch** chiaro per il CEO (Problema/Opportunità, Principio Sistemico, Rischi Red-Team mitigati, Piano in Fasi).
2. **Attendi il Go esplicito del CEO (`ceoApproved: true`)** prima di invocare `agentic-company workflow verify-gate` e passare a `MODE_4_BUILD_GATEKEEPER` (`/gatekeeper-audit`).
