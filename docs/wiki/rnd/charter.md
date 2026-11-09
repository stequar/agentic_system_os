# 🔬 Reparto R&D — Charter & Protocollo Operativo

## 🎯 Missione
Il reparto **R&D (Research & Development)** dell'Agentic Company OS è il motore di innovazione continua, ascolto orizzontale e convergenza strategica dell'azienda.

A differenza dei dipartimenti esecutivi (che si concentrano sull'avanzamento dei singoli ticket di sprint), l'R&D:
1. **Ascolta i Domain Lead (1:1 Discovery):** Conduce incontri periodici 1:1 con i manager (`backend_manager`, `mobile_manager`, `qa_lead`, `product_lead`) per identificare attriti nascosti, debito tecnico e aspirazioni architettoniche.
2. **Promuove il Dibattito Cross-Team (Consensus Roundtable):** Sintetizza le necessità in proposte strutturate (RFC), stimola il dibattito critico incrociato e risolve i trade-off.
3. **Consolida la Visione Condivisa (Consensus Blueprint):** Formalizza documenti di consenso firmati congiuntamente da tutti i Lead e ratificati dal CTO per trasformarli in nuove roadmap ed epiche per il CEO.
4. **Esplora l'Orizzonte Tecnologico (Horizon Scanning & Spikes):** Monitora lo stato dell'arte open source, librerie all'avanguardia e protocolli emergenti (es. MCP, multi-agent frameworks) prototipandoli in sandbox prima della produzione.

---

## 🔄 Il Protocollo di Allineamento a 4 Fasi

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  1. 1:1 NEEDS DISCOVERY                     │
   │  R&D Lead intervista i Domain Lead L2 su attriti e bisogni  │
   │  Output: docs/wiki/rnd/interviews/<role>-interview.md       │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  2. SYNTHESIZED RFC DRAFT                   │
   │  R&D unifica i punti, mappa le dipendenze e propone roadmap │
   │  Output: docs/wiki/rnd/rfcs/RFC-XXX-<title>.md              │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │               3. CROSS-REVIEW ROUNDTABLE                    │
   │  Ogni Lead valuta e commenta le proposte degli altri team   │
   │  Risoluzione trade-off (performance vs flessibilità vs QA)  │
   │  Output: docs/wiki/rnd/roundtables/<date>-roundtable.md     │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             4. CONSENSUS BLUEPRINT & RATIFICA               │
   │  Sottoscrizione congiunta dei Lead e ratifica CTO / CEO     │
   │  Conversione deterministica in ticket di Backlog            │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Vincoli e Standard Contrattuali Zod
Tutti gli artefatti prodotti dal reparto R&D devono essere rigorosamente convalidati tramite gli schemi Zod definiti in [`src/contracts/rnd.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts):
- [`OneOnOneInterviewSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts#L3-L13): validazione delle interviste individuali.
- [`ManagerFeedbackSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts#L15-L22): validazione dei pareri e delle criticità sollevate dai singoli manager.
- [`ConsensusRfcSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts#L33-L52): validazione del documento di consenso finale completo di firme digitali.
