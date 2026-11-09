---
name: gatekeeper-audit
description: "Attiva MODE 4 (BUILD & GATEKEEPER): verifica l'autorizzazione del Cognitive Forcing Gate, delega ai Leaf L3, controlla invarianti e certifica il 100% dei test ermetici."
---

# Gatekeeper Audit Skill — Execution & Quality Certification (`MODE_4_BUILD_GATEKEEPER`)

> Protocollo di esecuzione chirurgica L2/L3 e validazione empirica tramite **Deterministic Gatekeeper**.

---

## 1. Pre-Flight Check: Cognitive Forcing Gate

1. Dichiara `[CTO MODE: 4 — BUILD & GATEKEEPER]`.
2. Verifica tramite `agentic-company workflow verify-gate --json` che il passaggio a `MODE_4_BUILD_GATEKEEPER` sia autorizzato (con `ceoApproved === true` in caso di anomalia/RCA).
3. Carica le invarianti attive da `.company-os/invariants.json` e i comandi di test ermetici da `.company-os/config.json`.

---

## 2. Delega Chirurgica L3 & Guardrail AST

1. Scomponi il piano approvato in task atomici assegnati ai Domain Lead L2 / Leaf Developers L3 specificando i file autorizzati (`allowedFiles`).
2. Ogni modifica è sottoposta a:
   - **AST Diff Guard (`validatePatch`)**: Divieto assoluto di rimuovere o commentare asserzioni/test (`Test Preservation Invariant`) e divieto di toccare file fuori scope.
   - **FastDecisionGate**: Blocco sub-10ms di scritture su file sensibili (`.env`, `.git`).
   - **Hermetic Runner Execution**: Esecuzione reale del typecheck (`npm run typecheck`) e del test runner ermetico (`npm test`, `.venv/bin/pytest`, `swift test`) con 100% di test superati.
3. Registra l'esito nel Merkle Audit Log (`.company-os/audit.jsonl`) e aggiorna `docs/CEO_Dashboard.md`.
