# 🏛️ Verbale della Tavola Rotonda — RFC-002 (Ciclo 2)

**Data:** 2026-10-16  
**Moderatore:** R&D Lead (`rnd_lead`)  
**Partecipanti:**
- Engineering Lead (`engineering_lead`)
- Product Lead (`product_lead`)
- QA & Security Lead (`qa_lead`)

**Oggetto:** Discussione collegiale, risoluzione dei trade-off e voto formale su **RFC-002: Enterprise Resilience, Security Guardrails, Git-Native PRs & Human-in-the-Loop Steering**.

---

## 📋 Sintesi del Dibattito e Risoluzione dei Trade-Off

La tavola rotonda ha esaminato approfonditamente le proposte nate dalle interviste 1:1, risolvendo in modo deterministico e collegiale 5 trade-off critici:

1. **Secret Scanning vs Latenza di Prompt:**
   - *Trade-off:* La scansione sincrona dei prompt non deve rallentare l'invio all'LLM né generare falsi positivi su stringhe di test.
   - *Risoluzione:* Pattern a due fasi: pre-filtro sincrono ultra-veloce (<2ms) su prefissi noti (`sk-proj`, `ghp_`, `AKIA`, `BEGIN PRIVATE KEY`) e scansione con entropia di Shannon pre-commit; whitelist automatica per directory `tests/`, `fixtures/` e file `.env.example`.
2. **Human-in-the-Loop Safe Steering vs Atomicità POSIX:**
   - *Trade-off:* Un comando `pause` asincrono rischierebbe di congelare il filesystem durante una scrittura o lasciare lock pendenti.
   - *Risoluzione:* Adozione del pattern *Cooperative Safe-Point Interrupts*: la richiesta di pausa completa la transazione atomica corrente (Write-Sync-Rename), rilascia i file lock e congela il task solo a safe-point raggiunto.
3. **Inviolabilità dei Test rispetto a Hint Umani:**
   - *Trade-off:* Un utente umano potrebbe tentare di dare un suggerimento ("ignora il test") per forzare l'avanzamento.
   - *Risoluzione:* L'AST Diff Guard è inserito a livello di kernel e rimane inviolabile: qualsiasi patch che riduca asserzioni o aggiunga skip viene rigettata categoricamente, anche se suggerita dall'utente.
4. **Sicurezza e Leggerezza della Local Web Studio Dashboard:**
   - *Trade-off:* Evitare il bloat di framework web pesanti e prevenire vulnerabilità CSRF o DNS Rebinding su `localhost:4321`.
   - *Risoluzione:* Server leggero basato unicamente su `node:http` nativo e Server-Sent Events (<15MB RAM, avvio <50ms); binding rigoroso su `127.0.0.1`, autenticazione con token crittografico effimero `0600` e validazione degli header `Origin` e `Host`.
5. **Flaky Test Quarantine vs Rischio di Mascherare Bug:**
   - *Trade-off:* La quarantena non deve diventare un modo per nascondere race condition o bug intermittenti nel codice di produzione.
   - *Risoluzione:* Regola di alternanza deterministica su $N=3$: un test è dichiarato flaky solo se alterna PASS e FAIL sullo stesso commit. Se fallisce 3/3 volte è un fallimento deterministico bloccante. La quarantena è limitata, tracciata su audit JSONL e documentata in modo vistoso nella PR finale.

---

## 📑 Dati Strutturati Zod (ManagerFeedbackSchema[])

```json
[
  {
    "managerRole": "engineering_lead",
    "topicId": "TOPIC-2-SECURITY-GUARDRAILS",
    "opinion": "Pienamente favorevole a Secret Leak Prevention e Dependency Auditing come prerequisiti enterprise, con pre-filtro rapido a prefissi (<2ms) e whitelist deterministica per mock fixtures di test.",
    "concerns": [
      "Possibile latenza indotta da scansioni regex non ancorate su prompt voluminosi",
      "Falsi positivi su token fittizi presenti legittimamente nei file di test"
    ],
    "proposedTradeOffs": [
      "Architettura a due fasi: pre-filtro sincrono a prefissi (<2ms) e valutazione regex/entropia solo sulle corrispondenze positive",
      "Whitelist automatica per percorsi tests/, fixtures/, *.mock.ts e file .env.example"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "engineering_lead",
    "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
    "opinion": "Favorevole allo steering umano e alla dashboard locale a condizione che il comando pause rispetti l'atomicità POSIX e la dashboard sia nativa a zero bloat.",
    "concerns": [
      "Rischio di blocchi orfani o scritture parziali in caso di interruzione asincrona non controllata",
      "Bloat di megabyte di dipendenze se la dashboard web richiede framework pesanti"
    ],
    "proposedTradeOffs": [
      "Adozione di Cooperative Safe-Point Interrupts: pause completa la transazione atomica corrente prima di fermarsi",
      "Server web locale su localhost:4321 basato esclusivamente su node:http e Server-Sent Events nativi (<15MB RAM)"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "engineering_lead",
    "topicId": "TOPIC-4-BUDGETING-FLAKY-TESTS",
    "opinion": "Favorevole a quarantena flaky test e budget watchdog con regola rigorosa di alternanza PASS/FAIL e riserva del 5% per safe-point checkpoint.",
    "concerns": [
      "Rischio di mascherare race condition reali etichettandole come flaky",
      "Rischio di corruzione dello stato se il watchdog arresta il processo senza salvare il checkpoint"
    ],
    "proposedTradeOffs": [
      "Un test è flaky solo se alterna PASS e FAIL su N=3 run consecutive; 3/3 fallimenti è errore deterministico bloccante",
      "Riserva del 5% di token per completare la scrittura dello State Checkpoint e uscire in modo sicuro"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "product_lead",
    "topicId": "TOPIC-1-SESSION-CHECKPOINTING",
    "opinion": "Pienamente favorevole alla persistenza dello stato e al comando agentic-company resume con zero setup e convention-over-configuration.",
    "concerns": [
      "Possibile complessità di configurazione o necessità di gestire manualmente file di sessione",
      "Rischio di committare accidentalmente cache o file di sessione nel repository Git"
    ],
    "proposedTradeOffs": [
      "Cartella .company-os/sessions/ auto-creata e inserita automaticamente in .gitignore",
      "Comando resume a zero argomenti che seleziona predittivamente l'ultima sessione interrotta"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "product_lead",
    "topicId": "TOPIC-2-SECURITY-GUARDRAILS",
    "opinion": "Favorevole ai controlli di sicurezza purché non creino frizione nell'onboarding o messaggi di errore oscuri.",
    "concerns": [
      "Falsi allarmi su file .env.example o chiavi fittizie di test che frustrano gli sviluppatori",
      "Blocco totale dello sviluppo su vulnerabilità di bassa priorità"
    ],
    "proposedTradeOffs": [
      "Messaggi di blocco espliciti, didattici e azionabili nel terminale con rimedio immediato",
      "Hard Gate bloccante solo su vulnerabilità HIGH/CRITICAL e licenze restrittive; warning informativo su LOW/MODERATE"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "product_lead",
    "topicId": "TOPIC-4-BUDGETING-FLAKY-TESTS",
    "opinion": "Favorevole al watchdog di spesa e alla quarantena con safe-pause interattiva per evitare arresti distruttivi a tradimento.",
    "concerns": [
      "Rischio di cancellazione del lavoro svolto se il budget scatta a metà task",
      "Perdita di visibilità sui test esclusi dalla suite principale"
    ],
    "proposedTradeOffs": [
      "Stato SAFE_PAUSED al raggiungimento del budget con opzione di incremento guidato o salvataggio per resume",
      "Sezione dedicata nella Pull Request finale che evidenzia in modo trasparente i test in quarantena"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "qa_lead",
    "topicId": "TOPIC-1-SESSION-CHECKPOINTING",
    "opinion": "Favorevole allo State Checkpointing subordinatamente al Two-Phase Commit e al rollback deterministico su unclean resume.",
    "concerns": [
      "Rischio di re-iniettare file parzialmente modificati se il crash avviene a metà di una scrittura",
      "Possibile disallineamento tra l'albero Git e il file di sessione"
    ],
    "proposedTradeOffs": [
      "Two-Phase Commit: il checkpoint è promosso a safe-point solo post-validazione AST/Gatekeeper, altrimenti rollback automatico all'ultimo commit pulito",
      "Verifica dell'hash SHA-256 nel checkpoint con principio Fail Loudly in caso di discrepanze"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "qa_lead",
    "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
    "opinion": "Favorevole all'automazione Git e allo steering purché l'AST Diff Guard rimanga insuperabile e la dashboard locale sia protetta da token.",
    "concerns": [
      "Possibilità che prompt o hint umani tentino di sopprimere test o aggirare asserzioni",
      "Rischio di attacchi CSRF o DNS rebinding sul server web locale localhost:4321"
    ],
    "proposedTradeOffs": [
      "AST Diff Guard hard-coded a livello di kernel, inviolabile da comandi di steer",
      "Binding rigoroso su 127.0.0.1 con token crittografico effimero 0600 per HTTP/SSE contro DNS rebinding",
      "Scorecard immutabile del Gatekeeper allegata formalmente al corpo della PR"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "backend_lead",
    "topicId": "TOPIC-1-SESSION-CHECKPOINTING",
    "opinion": "Favorevole allo State Checkpointing deterministico e all'Event Bus JSONL: permette di preservare la consistenza transazionale del backend e semplifica i test di integrazione.",
    "concerns": [
      "Possibili sovraccarichi di serializzazione su strutture dati complesse"
    ],
    "proposedTradeOffs": [
      "Persistenza atomica limitata a safe-points e serializzazione asincrona dei log"
    ],
    "approvalStatus": "APPROVED"
  },
  {
    "managerRole": "mobile_lead",
    "topicId": "TOPIC-3-GIT-AUTOMATION-HITL",
    "opinion": "Favorevole all'automazione Git con branch isolati e scorecard Gatekeeper: fondamentale per evitare corruzioni su codebase native iOS/KMP e sincronizzare i contratti con il backend.",
    "concerns": [
      "Complessità nella gestione di file di progetto generati (es. xcodeproj)"
    ],
    "proposedTradeOffs": [
      "Isolamento delle feature in branch dedicati con pre-check pulito dell'albero Git"
    ],
    "approvalStatus": "APPROVED"
  }
]
```
