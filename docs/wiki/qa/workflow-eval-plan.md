# 🧭 Piano di Valutazione Comportamentale del Workflow (`W1..W7`) — Executive & R&D Operating Protocol v2

> **Sprint 17.6:** *The Executive & R&D Operating Protocol v2, 100% Self-Hosting DNA & Workflow Behavioral Eval Harness (`W1..W7`)*.
> Questo documento definisce il protocollo formale di valutazione comportamentale e deterministica del workflow multi-agente, applicato simmetricamente sia al repository madre (`agentic_company_os`) sia ai repository target adottati (`fitness_project`).

---

## 🎯 Obiettivo Architetturale

Garantire che ogni workspace governato da **Agentic Company OS** operi secondo:
1. **Identità CTO Co-Founder in 2ª persona imperativa (Top-of-File)** e **Protocollo di Avvio Sessione a 3 Opzioni** per il CEO.
2. **4 Modalità Operative del CTO (`MODE 1..4`)** e **4 Cognitive Forcing Functions (`CFF-1..4`)** per impedire che l'agente salti prematuramente alla scrittura del codice di fronte a un bug o a un'anomalia senza prima aver condotto una Root Cause Analysis (`MODE_2_INVESTIGATE_RCA`), consultato gli Esperti di Dominio Ring-2 + `rnd_lead` + Devil's Advocate (`qa_lead`), astratto dal sintomo al principio (`MODE_3_RND_ROUNDTABLE`) e ottenuto il Go esplicito del CEO (`ceoApproved === true`).
3. **Zero Ghost Roles:** 100% di sincronizzazione tra `.company-os/org-chart.json` (Ring-0, Ring-1, Ring-2) e `AGENTS.md`, così che l'agente conversazionale veda immediatamente gli esperti di dominio e le loro `domainInvariants`.
4. **Dual-Brain Bridge (`agentic-company workflow`):** Connessione diretta tra le 4 Skill conversazionali (`.agents/skills/*/SKILL.md`) e il motore deterministico TypeScript (`CompanyStateMachine`, `CeremonyDispatcher`, `AuditLogger`).

---

## 📊 I 7 Assi di Valutazione (`W1..W7`)

| Asse | ID | Titolo | Peso | Criterio di Superamento (100/100) |
| :--- | :--- | :--- | :---: | :--- |
| **W1** | `W1_SESSION_BOOT_AND_CTO_PERSONA` | Top-of-File CTO L1 Persona, Greeting Rule & 4 YAML Skills | 15% | `AGENTS.md` presenta in cima l'identità CTO in 2ª persona, il saluto a 3 opzioni per il CEO e tutte le 4 skill in `.agents/skills/` hanno frontmatter YAML valido alle righe 1-4. |
| **W2** | `W2_COGNITIVE_FORCING_FUNCTIONS_GATE` | 4 CFFs, 4 CTO Modes & Deterministic Anti-Rush Gate | 15% | Presenza delle 4 CFFs e delle 4 Modes; `CompanyStateMachine.enforceCognitiveForcingGate` blocca con `COGNITIVE_FORCING_GATE_VIOLATION` il passaggio a `IMPLEMENT`/`SPECIFY` su anomalia senza RCA approvata dal CEO e lo sblocca con RCA valida. |
| **W3** | `W3_TRI_RING_SYNC_AND_SCOPE_ROUTING` | Zero Ghost Roles (Org-Chart $\leftrightarrow$ `AGENTS.md`) & Scope Routing | 15% | Ogni specialista Ring-1 e Ring-2 in `.company-os/org-chart.json` è documentato per ID e con le sue `domainInvariants` in `AGENTS.md`; routing preciso su 3 scenari di scope. |
| **W4** | `W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY` | 5 Agile Ceremonies & Mandatory Devil's Advocate (`qa_lead` + Ring-2) | 15% | Esecuzione e persistenza delle 5 cerimonie agili con iniezione di `domainInvariants` e convergenza `ConsensusEngine` a 2 round con Devil's Advocate obbligatorio. |
| **W5** | `W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE` | CLI `workflow` (`status`, `route`, `verify-gate`) & Merkle Trail | 15% | Funzionamento end-to-end del comando CLI `agentic-company workflow`, persistenza di `.company-os/workflow-state.json` e integrità crittografica di `.company-os/audit.jsonl`. |
| **W6** | `W6_SELF_HOSTING_SYMMETRY` | 100% Self-Hosting DNA Symmetry (`agentic_company_os` $\leftrightarrow$ Target) | 15% | Presenza simmetrica di Kernel CTO L1, 4 Modes, 4 CFFs, 5 Core Leads Ring-0, Ring-1, Ring-2, RACI con `ANOMALY_RCA`, 4 Skills YAML, `docs/CEO_Dashboard.md` e `.company-os/`. |
| **W7** | `W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT` | AST Diff Guard, Scope Enforcement, FastDecisionGate & Hermetic Runner | 10% | Blocco deterministico di rimozione asserzioni, modifiche fuori scope, scrittura su `.env` e superamento dei controlli sul runner ermetico. |

---

## 🛠️ Contratti & Implementazione

- **Contratto Zod:** [`src/contracts/workflow-eval.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/workflow-eval.ts)
- **Harness di Esecuzione:** [`src/eval/workflow-eval-harness.ts`](file:///Users/stequar/Documents/agentic_company_os/src/eval/workflow-eval-harness.ts)
- **Dual-Brain CLI Command:** [`src/cli/commands/workflow.ts`](file:///Users/stequar/Documents/agentic_company_os/src/cli/commands/workflow.ts)
