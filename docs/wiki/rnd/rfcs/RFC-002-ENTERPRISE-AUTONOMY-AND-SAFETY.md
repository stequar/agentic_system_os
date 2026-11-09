# 📜 RFC-002: Enterprise Resilience, Security Guardrails, Git-Native PRs & Human-in-the-Loop Steering

**RFC ID:** `RFC-002`  
**Titolo:** *Agentic Company OS: Enterprise Resilience, Security Guardrails, Git-Native PRs & Human-in-the-Loop Steering*  
**Autore:** R&D Lead (`rnd_lead`)  
**Data:** 2026-10-16  
**Stato:** `CONSENSUS_REACHED` (Pronto per la Ratifica del CTO)  
**Schema Compliance:** [`ConsensusRfcSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/rnd.ts)  

---

## 📋 Executive Summary & Motivazione
In conformità alla direttiva del CEO (*"non siamo ancora pronti per il rilascio"*), il 2° Ciclo di Ascolto e Innovazione R&D ha condotto interviste 1:1 e una tavola rotonda con i Domain Lead (`engineering_lead`, `product_lead`, `qa_lead`) per colmare i deficit di affidabilità, sicurezza e fruibilità che impediscono l'impiego di Agentic Company OS in ambienti di produzione e nella community open source.

L'RFC-002 definisce la roadmap per trasformare l'OS da un eccellente prototipo tecnologico a una **piattaforma autonoma mission-critical di grado enterprise**, fondata su:
1. **Crash-Only Resilience & State Checkpointing:** Nessuna perdita di lavoro in caso di crash o interruzione improvvisa; resume istantaneo con Two-Phase Commit e Write-Ahead Logging su `.company-os/sessions/`.
2. **Dual-Tier Secret Leak Prevention & Supply Chain Audit:** Intercettore sincrono in-flight (<2ms) su prompt e scanner con entropia di Shannon pre-commit per impedire la fuga di credenziali; audit sistematico delle CVE e conformità licenze.
3. **Git-Native PR Automation & Safe Steering:** Creazione automatica di branch isolati `feat/tck-...`, commit convenzionali atomici, PR con scorecard del Gatekeeper e comandi cooperativi `pause`, `hint`, `resume`, `abort`.
4. **Local Web Studio Dashboard:** Interfaccia visiva su `localhost:4321` con Server-Sent Events nativi (`node:http`, zero bloat) protetta da token crittografico effimero e strict loopback binding.
5. **Token Cost Budget Watchdog & Flaky Test Quarantine:** Controllo del budget con safe-pause e isolamento deterministico dei test intermittenti con protocollo $N=3$ per preservare l'integrità del Self-Healing.

---

```json
{
  "rfcId": "RFC-002-ENTERPRISE-AUTONOMY-AND-SAFETY",
  "title": "Agentic Company OS: Enterprise Resilience, Security Guardrails, Git-Native PRs & Human-in-the-Loop Steering",
  "authorRole": "rnd_lead",
  "status": "CONSENSUS_REACHED",
  "sharedVision": "Trasformare Agentic Company OS in una piattaforma software enterprise mission-critical a zero allucinazioni e zero fughe di dati, dove l'umano è il Direttore d'Orchestra con controllo trasparente (Safe Steering & Dashboard live) e l'OS è un esecutore resiliente che preserva lo stato post-crash, protegge la supply chain e consegna Pull Request impeccabili su branch isolati.",
  "topics": [
    {
      "id": "TOPIC-1-SESSION-CHECKPOINTING",
      "title": "Deterministic State Checkpointing, Session Resume & Typed Event Bus",
      "originatingInterviews": [
        "1ON1-CYCLE2-ENG",
        "1ON1-CYCLE2-QA"
      ],
      "problemStatement": "La memoria operativa volatile di Node.js azzera tutto il progresso dei task in caso di interruzione improvvisa o crash, costringendo a ripartire da freddo e rischiando corruzioni del workspace.",
      "proposedSolution": "Implementare il salvataggio persistente su disco dello stato di sessione (.company-os/sessions/<id>.json) con Two-Phase Commit (DIRTY_IN_PROGRESS -> COMMITTED_SAFEPOINT) e il comando 'agentic-company resume' con rollback automatico in caso di unclean safe-point. Integrare un Event Bus tipizzato con log audit immutabile append-only (.company-os/audit.jsonl).",
      "managerFeedbacks": [
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-1-STATE-CHECKPOINTING-EVENT-BUS",
          "opinion": "Fondamentale per una Crash-Only Architecture che permetta all'OS di essere arrestato in qualunque millisecondo senza perdita di coerenza.",
          "concerns": [
            "Overhead di I/O se i checkpoint vengono serializzati troppo frequentemente"
          ],
          "proposedTradeOffs": [
            "Serializzazione limitata alle transizioni di stato della FSM e al completamento dei tentativi di self-healing con scritture atomiche POSIX"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-1-STATE-CHECKPOINTING-EVENT-BUS",
          "opinion": "Pienamente favorevole: zero setup per l'utente, auto-inserimento di .company-os/ in .gitignore e comando resume predittivo a zero argomenti.",
          "concerns": [
            "Complessità nell'onboarding se l'utente deve gestire file di sessione"
          ],
          "proposedTradeOffs": [
            "Invisibilità del checkpointing di default e selezione interattiva rapida con @clack/prompts solo se esistono sessioni multiple"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-1-STATE-CHECKPOINTING-EVENT-BUS",
          "opinion": "Approvato con Two-Phase Commit: il checkpoint è promosso a safe-point solo post-validazione AST/Gatekeeper, altrimenti rollback automatico all'ultimo commit pulito in fase di resume.",
          "concerns": [
            "Rischio di re-iniettare file parzialmente modificati se il crash avviene a metà di una scrittura"
          ],
          "proposedTradeOffs": [
            "Rollback deterministico automatico a commit pulito su unclean resume e verifica SHA-256 nel file di snapshot"
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-2-SECURITY-GUARDRAILS",
      "title": "Dual-Tier Secret Leak Prevention & Dependency Vulnerability Auditor",
      "originatingInterviews": [
        "1ON1-CYCLE2-QA",
        "1ON1-CYCLE2-ENG"
      ],
      "problemStatement": "Nessun meccanismo impedisce ad API key, token o certificati di finire nei contesti inviati a provider LLM esterni o nei commit Git, e manca il controllo su CVE note e licenze nelle dipendenze.",
      "proposedSolution": "Implementare un'architettura di sicurezza a due livelli: Tier 1 sincrono in-flight (<2ms) su prompt per prefissi noti di chiavi e Tier 2 con entropia di Shannon pre-commit; modulo polimorfico di audit delle dipendenze (npm audit, cargo audit, etc.) con blocco su HIGH/CRITICAL e whitelist licenze.",
      "managerFeedbacks": [
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-2-SECURITY-GUARDRAILS",
          "opinion": "Gatekeeper vitale e non negoziabile per impedire data-breach e conformità aziendale enterprise.",
          "concerns": [
            "Fughe di credenziali non intercettate in prompt asincroni"
          ],
          "proposedTradeOffs": [
            "Intercettore sincrono bloccante collocato a monte del protocollo di serializzazione di rete"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-2-SECURITY-GUARDRAILS",
          "opinion": "Approvato con pre-filtro rapido su prefissi noti e whitelist contestuale deterministica per file di test e fixtures.",
          "concerns": [
            "Latenza di prompt su scansioni regex non ancorate e falsi positivi su stringhe di test"
          ],
          "proposedTradeOffs": [
            "Valutazione regex solo su corrispondenze positive del pre-filtro e bypass per percorsi tests/, fixtures/, *.mock.ts e .env.example"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-2-SECURITY-GUARDRAILS",
          "opinion": "Approvato con messaggi di errore chiari e didattici nel terminale e gradualità sull'audit (blocco su HIGH/CRITICAL, warning su LOW/MODERATE).",
          "concerns": [
            "Blocco frustrante dello sviluppatore a causa di falsi positivi su file di esempio"
          ],
          "proposedTradeOffs": [
            "Esclusione automatica di .env.example e token prefissati con mock_ o test_"
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-3-GIT-AUTOMATION-HITL",
      "title": "Git-Native PR Automation, Cooperative Safe-Point Steering & Local Web Studio",
      "originatingInterviews": [
        "1ON1-CYCLE2-PROD",
        "1ON1-CYCLE2-ENG",
        "1ON1-CYCLE2-QA"
      ],
      "problemStatement": "Gli agenti operano sul working tree locale senza isolamento Git, l'utente umano non ha controlli per mettere in pausa o dare indicazioni correttive se non con un Ctrl+C brutale, e lo stato è confinato a markdown statici.",
      "proposedSolution": "Automatizzare il ciclo Git (branch feat/tck-..., commit convenzionali e PR con scorecard del Gatekeeper), implementare i comandi di steering 'pause', 'hint', 'resume', 'abort', e un server dashboard web locale su localhost:4321 con Server-Sent Events nativi (node:http, zero dipendenze esterne) protetto da token effimero.",
      "managerFeedbacks": [
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
          "opinion": "Requisito chiave di prodotto per trasformare l'OS da una scatola nera a un cockpit di controllo trasparente ed eliminare l'ansia da perdita di controllo.",
          "concerns": [
            "Interfacce complesse che appesantiscono la CLI"
          ],
          "proposedTradeOffs": [
            "Interfaccia web locale leggera su localhost:4321 avviabile con un comando unico 'agentic-company studio'"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
          "opinion": "Approvato con adozione di Cooperative Safe-Point Interrupts per preservare l'atomicità POSIX e server dashboard basato unicamente su node:http nativo senza bloat.",
          "concerns": [
            "Rischio di lock pendenti se pause congela il processo a metà scrittura e bloat di framework web"
          ],
          "proposedTradeOffs": [
            "Il comando pause completa l'operazione atomica corrente prima di fermarsi ed entra in stato PAUSED salvando il checkpoint"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
          "opinion": "Approvato con AST Diff Guard invariabile e non scavalcabile da hint umani, scorecard immutabile nella PR e token crittografico effimero 0600 sulla dashboard.",
          "concerns": [
            "Tentativi umani di indebolire i test tramite hint e vulnerabilità CSRF/DNS rebinding su localhost:4321"
          ],
          "proposedTradeOffs": [
            "AST Diff Guard hard-coded a livello di kernel, strict loopback su 127.0.0.1 con token auth obbligatoria per SSE/HTTP"
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    },
    {
      "id": "TOPIC-4-BUDGETING-FLAKY-TESTS",
      "title": "Token Cost Budget Watchdog & Flaky Test N=3 Quarantine Engine",
      "originatingInterviews": [
        "1ON1-CYCLE2-QA",
        "1ON1-CYCLE2-ENG",
        "1ON1-CYCLE2-PROD"
      ],
      "problemStatement": "I test intermittenti (flaky) innescano inutilmente il loop di self-healing provocando modifiche allucinate su codice corretto, mentre l'assenza di un tetto di spesa rischia bollette cloud fuori controllo.",
      "proposedSolution": "Implementare il protocollo di verifica flaky su N=3 esecuzioni (se alterna PASS e FAIL, quarantena temporanea in .gatekeeper/quarantine.json e ticket di backlog); integrare un Token Cost Watchdog con allarme all'80% e stato SAFE_PAUSED al 100% con riserva del 5% per safe-checkpoint.",
      "managerFeedbacks": [
        {
          "managerRole": "qa_lead",
          "topicId": "TOPIC-4-BUDGETING-FLAKY-TESTS",
          "opinion": "Indispensabile per evitare sprechi di token e per non far passare fallimenti deterministici come falsi positivi.",
          "concerns": [
            "Rischio che race condition reali vengano trattate come flaky"
          ],
          "proposedTradeOffs": [
            "Regola di alternanza PASS/FAIL rigorosa su N=3; se fallisce 3/3 volte è errore deterministico bloccante"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "engineering_lead",
          "topicId": "TOPIC-4-BUDGETING-FLAKY-TESTS",
          "opinion": "Approvato con riserva del 5% di token per completare la scrittura dello State Checkpoint e notifica automatica sull'Event Bus.",
          "concerns": [
            "Arresto del processo che lascia sessioni a metà senza flush dei log"
          ],
          "proposedTradeOffs": [
            "Grace margin del 5% per consentire il commit del safe-point e la serializzazione del report di spesa"
          ],
          "approvalStatus": "APPROVED"
        },
        {
          "managerRole": "product_lead",
          "topicId": "TOPIC-4-BUDGETING-FLAKY-TESTS",
          "opinion": "Approvato con stato SAFE_PAUSED e menù interattivo per incremento guidato del budget, evitando crash distruttivi a tradimento.",
          "concerns": [
            "Frustrazione dell'utente se il task viene interrotto bruscamente eliminando il lavoro svolto"
          ],
          "proposedTradeOffs": [
            "Tutto il lavoro è preservato nel checkpoint locale con scelta guidata: incrementa budget, ispeziona o chiudi pulito"
          ],
          "approvalStatus": "APPROVED"
        }
      ],
      "consensusReached": true
    }
  ],
  "resolvedTradeOffs": [
    "Secret Scanning a due fasi: pre-filtro sincrono a prefissi noti (<2ms) e scansione differenziale pre-commit, con bypass automatico per percorsi di test, mock fixtures e .env.example.",
    "Cooperative Safe-Point Interrupts per Human-in-the-Loop steering: il comando pause completa l'operazione atomica corrente prima di fermarsi, rilasciando i lock e preservando l'atomicità POSIX.",
    "Inviolabilità dell'AST Diff Guard a livello di kernel: i comandi di hint dell'utente non possono in alcun caso indebolire o sopprimere asserzioni o test.",
    "Server web locale per la dashboard basato unicamente su node:http e Server-Sent Events (zero dipendenze esterne, <15MB RAM, avvio <50ms) con binding su 127.0.0.1 e autenticazione con token crittografico effimero 0600 contro attacchi CSRF e DNS rebinding.",
    "Regola di alternanza su N=3 per la quarantena dei test intermittenti (un test è flaky solo se alterna PASS e FAIL sullo stesso commit, altrimenti è errore deterministico bloccante) con documentazione esplicita nella PR finale.",
    "Safe-Pause al 100% del budget token con margine di grazia del 5% per salvare lo State Checkpoint atomico ed evitare crash distruttivi a tradimento."
  ],
  "signatures": [
    {
      "role": "rnd_lead",
      "signedAt": "2026-10-16T16:20:00.000Z"
    },
    {
      "role": "engineering_lead",
      "signedAt": "2026-10-16T16:23:08.000Z"
    },
    {
      "role": "product_lead",
      "signedAt": "2026-10-16T16:23:54.000Z"
    },
    {
      "role": "qa_lead",
      "signedAt": "2026-10-16T16:24:20.000Z"
    },
    {
      "role": "backend_lead",
      "signedAt": "2026-10-16T16:24:35.000Z"
    },
    {
      "role": "mobile_lead",
      "signedAt": "2026-10-16T16:24:45.000Z"
    }
  ],
  "actionableBacklogTickets": [
    "TCK-6.1: Deterministic State Checkpoint & Session Resume Engine (WAL & Atomic Safe-Points)",
    "TCK-6.2: Typed Enterprise Event Bus & JSONL Audit Trail Logger",
    "TCK-6.3: Dual-Tier Secret & PII Leak Prevention Gate (In-Flight Sync & Pre-Commit)",
    "TCK-6.4: Dependency Vulnerability & License Compliance Auditor (npm/cargo/pip/go audit)",
    "TCK-7.1: Cooperative Safe-Point Human-in-the-Loop Steering Engine (pause, hint, resume, abort)",
    "TCK-7.2: Git-Native Feature Branch, Conventional Commit & Automated PR Generator",
    "TCK-7.3: Zero-Dependency Embedded Local Web Studio Dashboard (localhost:4321 with SSE & Token Auth)",
    "TCK-7.4: Flaky Test N=3 Detection & Quarantine Engine with Backlog Escalation",
    "TCK-7.5: Token Cost Budget Watchdog with Safe-Pause & Grace Margin"
  ],
  "createdAt": "2026-10-16T16:18:00.000Z",
  "updatedAt": "2026-10-16T16:25:00.000Z"
}
```
