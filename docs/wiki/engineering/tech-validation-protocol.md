# 🔬 Protocollo di Validazione Tecnologica & Pre-Sprint Spike

## 🎯 Obiettivo
Nessuno sprint ingegneristico può entrare nella fase `SPECIFY` o `DELEGATE` senza prima aver validato le scelte tecnologiche e architetturali.
L'**Engineering Lead (Domain Lead L2)** ha la responsabilità di condurre un **Architectural Spike** supportato da ricerca web per verificare:
1. Validità dei tool e delle librerie candidate (stato di manutenzione, compatibilità TypeScript ESM, popolarità, alternative più leggere).
2. Best practices moderne (standard correnti del settore, performance, sicurezza).
3. Potenziali rischi di implementazione o anti-pattern.

---

## 🔄 Il Flusso Operativo (Fase `TECH_VALIDATION`)

```
   [ STANDUP ] (Go del CEO)
        │
        ▼
[ TECH_VALIDATION ] ──► Ricerca Web (Tool, Benchmark, Pattern)
        │           ──► Compilazione TechValidationReportSchema
        ▼
   [ SPECIFY ]     ──► Aggiornamento contratti Zod & criteri ticket
        │
        ▼
   [ DELEGATE ]    ──► Assegnazione ai Leaf Developers L3
```

---

## 📋 Requisiti del Report di Validazione
Il report finale deve essere serializzato e validato secondo lo schema Zod [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts) (`src/contracts/research.ts`) e salvare il dossier in `docs/wiki/engineering/spikes/sprint-<N>-validation.md`.

Campi obbligatori:
- **`sprintId`**: Identificativo dello sprint da validare.
- **`proposedDecisions`**: Scelte architetturali e tecniche ipotizzate.
- **`benchmarksAndTools`**: Strumenti analizzati con pros, cons e raccomandazione (`adopt`, `evaluate`, `avoid`).
- **`bestPractices`**: Pattern raccomandati emersi dall'indagine.
- **`risksAndMitigations`**: Analisi dei rischi e contromisure.
- **`verdict`**: 
  - `APPROVED`: Le scelte sono solide e allineate allo stato dell'arte.
  - `ADJUSTMENTS_RECOMMENDED`: Le scelte sono valide con correzioni di rotta sui ticket.
  - `REJECTED`: L'approccio presenta gravi criticità e va ripensato con il CTO.
- **`finalRecommendations`**: Direttive per i Leaf Devs.

---

## 🔍 Regole di Ricerca Web per l'Engineering Lead
1. **Verificare la freschezza:** Privilegiare documentazioni ufficiali, GitHub issues/releases recenti e standard Node/TypeScript attuali (ESM puro, Zod v3, Node 20+).
2. **Evitare l'Over-Engineering:** Preferire soluzioni native di Node/TS (es. template literals tipizzati o fs nativo) rispetto a dipendenze pesanti a meno che non siano strettamente necessarie.
3. **Fail Loudly:** Se un tool ha deprecazioni critiche o incompatibilità note con l'architettura aziendale, bocciarlo esplicitamente nel report.
