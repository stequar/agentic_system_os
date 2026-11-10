# 🔬 Architectural Spike: Sprint 20 Tech Validation
**Sprint:** SPRINT-20 — Neuro-Symbolic Formal AST Verification & Invariant Prover  
**Author:** CTO & Domain Leads (`qa_lead`, `engineering_lead`, `rnd_lead`, `ast_gatekeeper_specialist`)  
**Status:** VALIDATED & APPROVED  
**Verdict:** `APPROVED`  
**Schema Compliance:** [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts)  
**Foundation:** Mandato Strategico CEO & [`RFC-006`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md)  
**Date:** 2026-11-09  

---

## 📋 Executive Summary

Questo dossier architetturale formalizza la **validazione tecnologica preventiva (`TCK-20.0`)** per lo **Sprint 20: Neuro-Symbolic Formal AST Verification & Invariant Prover**, secondo pilastro della **Fase 6 (Next-Gen Autonomous Frontiers & Self-Evolving Ecosystem — RFC-006)**.

I test unitari tradizionali verificano unicamente gli input campionati; nelle sezioni critiche del codice (transazioni, guardie di stato, calcoli aritmetici, manipolazione puntatori/oggetti nullable), un agente L3 può generare codice che supera i test felici ma nasconde divisioni per zero, dereferenziazioni nulle o violazioni di invarianti di dominio su stati di frontiera.

Lo **Sprint 20** introduce [`src/gatekeeper/formal-prover.ts`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/formal-prover.ts), conforme a [`NeuroSymbolicProofSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/frontiers.ts), con:
1. **Estrazione Simbolica di Precondizioni (`{P}`) e Postcondizioni (`{Q}`):** traduzione automatica di firme tipizzate, contratti Zod e invarianti `.company-os/invariants.json` in vincoli formali Hoare Logic `{P} C {Q}`.
2. **Motore di Risoluzione Simbolica (`BUILTIN_PROVER` / `AST_TREE_SITTER_SAT` / `Z3_SMT` / `CVC5`):** verifica deterministica con hard-timeout a `500ms` (`SOLVER_TIMEOUT`) e rilevazione di assiomi contraddittori (`UNSATISFIABLE`).
3. **Generatore Automatico di Controesempi Eseguibili (`COUNTEREXAMPLE_FOUND`):** quando una proprietà formale è violata, il prover sintetizza lo stato di input minimale (`inputState`), il cammino di esecuzione (`failingPath`) e un test riproducibile Vitest/Pytest (`reproducibleFixtureCode`) iniettato nel loop di Self-Healing ([`src/gatekeeper/self-healing.ts`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/self-healing.ts)).

---

## 📑 Dati Strutturati Zod (TechValidationReportSchema)

```json
{
  "sprintId": "SPRINT-20",
  "sprintTheme": "Neuro-Symbolic Formal AST Verification & Invariant Prover",
  "executiveSummary": "Validazione tecnologica per lo Sprint 20 di Agentic Company OS. Ratifica il motore di verifica formale neuro-simbolica (src/gatekeeper/formal-prover.ts) conforme a NeuroSymbolicProofSchema, capace di estrarre precondizioni e postcondizioni Hoare Logic {P} C {Q} da AST e contratti Zod, verificare invarianti matematiche e di dominio entro 500ms, e sintetizzare controesempi eseguibili Vitest/Pytest per il loop di Self-Healing.",
  "proposedDecisions": [
    "Implementare src/gatekeeper/formal-prover.ts conforme a NeuroSymbolicProofSchema con supporto per BUILTIN_PROVER, AST_TREE_SITTER_SAT, Z3_SMT e CVC5.",
    "Estrarre automaticamente predicati Hoare Logic {P} C {Q} da firme TypeScript/Python, schemi Zod e invarianti di dominio.",
    "Imporre un hard-timeout deterministico di 500ms (SOLVER_TIMEOUT) per garantire zero colli di bottiglia nella pipeline del Gatekeeper.",
    "Sintetizzare automaticamente reproducibleFixtureCode (test Vitest/Pytest) per ogni stato COUNTEREXAMPLE_FOUND.",
    "Cablare il prover end-to-end (Zero Island Modules) in src/gatekeeper/self-healing.ts, src/mcp/server.ts (prove_ast_invariants) e src/cli/commands/workflow.ts."
  ],
  "benchmarksAndTools": [
    {
      "name": "Hoare Logic & Symbolic AST Constraint Solver (Builtin Neuro-Symbolic Prover)",
      "category": "formal-verification",
      "url": "https://en.wikipedia.org/wiki/Hoare_logic",
      "pros": [
        "Zero dipendenze binarie native esterne obbligatorie e avvio istantaneo sub-millisecondo",
        "Estrazione diretta di invarianti da AST TypeScript/JavaScript/Python e contratti Zod",
        "Generazione deterministica di controesempi eseguibili (inputState + reproducibleFixtureCode)"
      ],
      "cons": [
        "Richiede limiti di profondità sui cammini ciclici per evitare esplosione combinatoria"
      ],
      "recommendation": "adopt",
      "notes": "Motore primario per il Gatekeeper deterministico con SLA < 500ms."
    },
    {
      "name": "Z3 Theorem Prover / SMT-LIB 2.0",
      "category": "smt-solver",
      "url": "https://github.com/Z3Prover/z3",
      "pros": [
        "Standard industriale per la risoluzione di vincoli aritmetici lineari e bit-vector",
        "Piena compatibilità con il campo solverBackend di NeuroSymbolicProofSchema"
      ],
      "cons": [
        "Overhead di serializzazione e tempo di risoluzione variabile su formule quantificate"
      ],
      "recommendation": "adopt",
      "notes": "Supportato come backend nel contratto NeuroSymbolicProofSchema con fallback deterministico in-process."
    }
  ],
  "bestPractices": [
    "Confinare il budget di verifica formale a 500ms per simbolo con ritorno deterministico SOLVER_TIMEOUT oltre soglia.",
    "Convertire ogni controesempio formale in una fixture di test eseguibile (Vitest/Pytest) iniettabile nel prompt di Self-Healing dell'agente L3.",
    "Verificare preventivamente la consistenza degli assiomi di ingresso per intercettare precondizioni contraddittorie (UNSATISFIABLE).",
    "Mantenere la tracciabilità crittografica di ogni prova tramite proofId, executionTimeMs e timestamp ISO."
  ],
  "risksAndMitigations": [
    {
      "risk": "Esplosione dello spazio degli stati (Path Explosion) su funzioni con molteplici diramazioni condizionali.",
      "impact": "high",
      "mitigation": "Bounded Symbolic Execution con limite di profondità e hard-timeout deterministico a 500ms (SOLVER_TIMEOUT)."
    },
    {
      "risk": "Controesempi astratti difficili da interpretare per i Leaf Developer L3 durante il Self-Healing.",
      "impact": "medium",
      "mitigation": "Il generatore produce direttamente codice di test Vitest/Pytest pronto all'esecuzione in reproducibleFixtureCode."
    },
    {
      "risk": "Precondizioni di dominio o regole custom mutuamente esclusive che rendono vacua la verifica.",
      "impact": "medium",
      "mitigation": "Rilevamento esplicito di inconsistenze logiche nelle precondizioni con stato UNSATISFIABLE."
    }
  ],
  "verdict": "APPROVED",
  "finalRecommendations": [
    "Approvare formalmente lo spike dello Sprint 20 (TCK-20.0) e procedere all'implementazione di src/gatekeeper/formal-prover.ts.",
    "Integrare il Formal Prover nel loop di Self-Healing (src/gatekeeper/self-healing.ts) per arricchire i feedback diagnostici con i controesempi simbolici.",
    "Esporre il tool prove_ast_invariants nel server MCP (src/mcp/server.ts) e lo stato di readiness in workflow status (src/cli/commands/workflow.ts).",
    "Certificare l'intera suite di test in tests/formal-prover.test.ts con 100% di pass rate sul Deterministic Gatekeeper."
  ],
  "sources": [
    "docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md",
    "src/contracts/frontiers.ts",
    "src/gatekeeper/self-healing.ts"
  ],
  "validatedAt": "2026-11-09T14:20:00.000Z"
}
```
