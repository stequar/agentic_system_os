# 🎛️ Reference Manual: `.company-os/settings.json` — Interruttori & Valori Possibili

> **Percorso del file di configurazione:** `.company-os/settings.json`  
> **Contratto di validazione Zod:** [`src/contracts/settings.ts`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/settings.ts) (`CompanySettingsSchema`)  
> **Gestore Runtime:** [`src/core/settings-manager.ts`](file:///Users/stequar/Documents/agentic_company_os/src/core/settings-manager.ts) (`SettingsManager`)

Questo documento elenca **tutti gli interruttori configurabili** della libreria **Agentic Company OS**, i loro **valori possibili**, il **valore di default** e il comportamento esatto che attivano sia nel motore TypeScript sia nel CTO Orchestrator L1.

---

## 📄 1. Esempio Completo di `.company-os/settings.json`

```json
{
  "version": "1.0.0",
  "governance": {
    "spikeCheckpoint": "HITL_SPIKE_REVIEW",
    "anomalyGate": "STRICT_CFF_4_GATES",
    "releaseApproval": "CEO_MANDATORY",
    "roundtableDevilsAdvocate": true
  },
  "localSlm": {
    "mode": "AUTO_HARDWARE_ADAPTIVE",
    "preferredModelOverride": null,
    "ollamaEndpoint": "http://127.0.0.1:11434",
    "slaTimeoutMs": 800
  },
  "gatekeeper": {
    "enableFormalAstProver": true,
    "formalProverTimeoutMs": 500,
    "selfHealingMaxRetries": 3,
    "enableWarRoomCircuitBreaker": true,
    "useTiaTargetedTests": true
  },
  "communication": {
    "cavemanMode": true,
    "language": "it",
    "greetingRule3Options": true
  },
  "finops": {
    "maxSessionBudgetUsd": 5.0,
    "safePauseOnBudgetExceeded": true,
    "enableTwoTierPromptCache": true
  }
}
```

---

## 🧭 2. Tabella Completa dei Parametri e dei Valori Possibili

### A. Sezione `governance` (Checkpoint Decisionale CEO $\leftrightarrow$ CTO Orchestrator)

| Chiave Dot-Path | Tipo | Valori Possibili | Default | Cosa fa l'interruttore |
| :--- | :--- | :--- | :--- | :--- |
| **`governance.spikeCheckpoint`** | `enum` | • `"HITL_SPIKE_REVIEW"`<br>• `"AUTONOMOUS_FAST_TRACK"` | **`"HITL_SPIKE_REVIEW"`** | **Regola `CFF-5` (Punto intermedio Spike $\rightarrow$ Sviluppo):**<br>• **`"HITL_SPIKE_REVIEW"`**: Dopo aver scritto lo Spike (`TCK-X.0`), il CTO **si ferma obbligatoriamente**, presenta il report dello Spike al CEO e attende la sua conferma prima di scrivere codice.<br>• **`"AUTONOMOUS_FAST_TRACK"`**: Il CTO valida lo Spike e procede direttamente in autonomia allo sviluppo e al Gatekeeper senza fermarsi. |
| **`governance.anomalyGate`** | `enum` | • `"STRICT_CFF_4_GATES"`<br>• `"ADVISORY"` | **`"STRICT_CFF_4_GATES"`** | **Gestione Bug / Anomalie (`CFF-1..4`):**<br>• **`"STRICT_CFF_4_GATES"`**: Obbliga il blocco Stop-the-Line Read-Only (`MODE 2` 5-Whys $\rightarrow$ `MODE 3` Roundtable $\rightarrow$ Approvazione CEO) prima di qualsiasi bugfix.<br>• **`"ADVISORY"`**: Emette un avviso diagnostico ma consente hotfix rapidi senza bloccare la macchina a stati. |
| **`governance.releaseApproval`** | `enum` | • `"CEO_MANDATORY"`<br>• `"GATEKEEPER_AUTO"` | **`"CEO_MANDATORY"`** | • **`"CEO_MANDATORY"`**: Richiede il via libera esplicito del CEO prima di rilasci o merge finali.<br>• **`"GATEKEEPER_AUTO"`**: Consente il merge automatico se il Deterministic Gatekeeper è al 100% verde. |
| **`governance.roundtableDevilsAdvocate`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, rende obbligatoria la presenza di `qa_lead` come *Devil's Advocate* contraddittorio in ogni Tavola Rotonda R&D. |

---

### B. Sezione `localSlm` (Modelli Locali SOTA & Profilazione Hardware — Sprint 21)

| Chiave Dot-Path | Tipo | Valori Possibili | Default | Cosa fa l'interruttore |
| :--- | :--- | :--- | :--- | :--- |
| **`localSlm.mode`** | `enum` | • `"AUTO_HARDWARE_ADAPTIVE"`<br>• `"FORCE_ENABLED"`<br>• `"DISABLED_CLOUD_ONLY"` | **`"AUTO_HARDWARE_ADAPTIVE"`** | • **`"AUTO_HARDWARE_ADAPTIVE"`**: Analizza RAM/CPU della macchina: se `< 8GB RAM` disattiva gli SLM locali (zero rallentamenti); se `8-15GB` usa `qwen3:1.7b`/`phi4-mini`; se `16-31GB` usa `qwen3:8b`; se `>=32GB` sblocca `qwen3-coder:30b` (MoE).<br>• **`"FORCE_ENABLED"`**: Forza l'uso del modello locale anche su macchine sotto soglia.<br>• **`"DISABLED_CLOUD_ONLY"`**: Disattiva completamente il Tier-1 locale e invia tutti i task ai modelli Cloud. |
| **`localSlm.preferredModelOverride`** | `string \| null` | • `null` *(auto)*<br>• `"qwen3:1.7b"`<br>• `"phi4-mini"`<br>• `"gemma3:4b"`<br>• `"qwen3:8b"`<br>• `"gemma3:12b"`<br>• `"qwen3-coder:30b"`<br>• `"gemma3:27b"` | **`null`** | Se impostato a `null`, usa il modello scelto automaticamente dal `HardwareProfiler` o trovato tra quelli già installati (`scanInstalledLocalModels`). Se valorizzato con una stringa, forza quel modello specifico. |
| **`localSlm.ollamaEndpoint`** | `string` *(loopback)* | • `"http://127.0.0.1:11434"`<br>• `"http://localhost:11434"`<br>• `"http://127.0.0.1:8080"` | **`"http://127.0.0.1:11434"`** | Endpoint locale per Ollama / MLX / `llama.cpp`. Per sicurezza sono ammessi **solo** indirizzi di loopback (`127.0.0.1` o `localhost`). |
| **`localSlm.slaTimeoutMs`** | `number` (`100..10000`) | Qualsiasi intero tra `100` e `10000` (ms) | **`800`** | Tempo massimo (in millisecondi) concesso al modello locale prima di interrompere la chiamata e passare automaticamente al Cloud (`Tier 2`). |

---

### C. Sezione `gatekeeper` (Verifica Formale Neuro-Simbolica, Self-Healing & War Room)

| Chiave Dot-Path | Tipo | Valori Possibili | Default | Cosa fa l'interruttore |
| :--- | :--- | :--- | :--- | :--- |
| **`gatekeeper.enableFormalAstProver`** | `boolean` | • `true`<br>• `false` | **`true`** | Attiva/disattiva il **Neuro-Symbolic Formal AST Prover** (Hoare Logic `{P} C {Q}`, Sprint 20) sulle patch proposte e sulla verifica speculativa degli SLM locali. |
| **`gatekeeper.formalProverTimeoutMs`** | `number` (`50..5000`) | Intero tra `50` e `5000` (ms) | **`500`** | Budget temporale massimo per il solver formale prima di restituire `SOLVER_TIMEOUT`. |
| **`gatekeeper.selfHealingMaxRetries`** | `number` (`1..5`) | `1`, `2`, `3`, `4`, `5` | **`3`** | Numero massimo di iterazioni del loop di auto-riparazione (`runSelfHealingLoop`) prima del rollback atomico. |
| **`gatekeeper.enableWarRoomCircuitBreaker`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, apre automaticamente la **Incident War Room** con blocco di scrittura e rollback SHA-256 quando il Self-Healing esaurisce i tentativi. |
| **`gatekeeper.useTiaTargetedTests`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, usa il **Test Impact Analyzer (`TIA`)** per eseguire nell'inner-loop solo i test impattati dalle modifiche prima della verifica finale completa. |

---

### D. Sezione `communication` (Protocollo Caveman-RPC & Stile CTO)

| Chiave Dot-Path | Tipo | Valori Possibili | Default | Cosa fa l'interruttore |
| :--- | :--- | :--- | :--- | :--- |
| **`communication.cavemanMode`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, comprime tutti i messaggi tra sub-agenti L2/L3 con l'envelope telegrafico `[CAVEMAN-RPC]` eliminando i convenevoli e tracciando il risparmio in `FluffTelemetry`. |
| **`communication.language`** | `enum` | • `"it"`<br>• `"en"` | **`"it"`** | Lingua ufficiale con cui il CTO Orchestrator e il Voice Director comunicano con il CEO. |
| **`communication.greetingRule3Options`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, all'apertura di sessione il CTO saluta il CEO presentando sempre le 3 opzioni operative (`Standup`, `Investigate Anomaly`, `R&D Roundtable`). |

---

### E. Sezione `finops` (Budget Token & Caching)

| Chiave Dot-Path | Tipo | Valori Possibili | Default | Cosa fa l'interruttore |
| :--- | :--- | :--- | :--- | :--- |
| **`finops.maxSessionBudgetUsd`** | `number` (`> 0`) | Qualsiasi numero positivo (es. `2.5`, `5.0`, `20.0`) | **`5.0`** | Tetto massimo di spesa Cloud (in dollari USD) per singola sessione monitorato dal `BudgetWatchdog`. |
| **`finops.safePauseOnBudgetExceeded`** | `boolean` | • `true`<br>• `false` | **`true`** | Se `true`, mette automaticamente in `SAFE_PAUSE` gli agenti al raggiungimento del 100% del budget. |
| **`finops.enableTwoTierPromptCache`** | `boolean` | • `true`<br>• `false` | **`true`** | Abilita il **Two-Tier Prefix Caching** (Tier-1 Statico + Tier-2 Dinamico) per risparmiare fino al 90% sui token di input. |

---

## 🛠️ 3. Come Visualizzare e Modificare i Settings da CLI o Voce

1. **Visualizzare la configurazione attuale e tutti i valori possibili via CLI:**
   ```bash
   npx tsx src/index.ts workflow settings --json
   ```
2. **Modificare un singolo interruttore da CLI (dot-notation):**
   ```bash
   # Attivare la pausa di revisione CEO dopo ogni Spike (default):
   npx tsx src/index.ts workflow set-setting --key governance.spikeCheckpoint --value HITL_SPIKE_REVIEW

   # Passare alla modalità autonoma Fast-Track (Spike + Sviluppo senza fermarsi):
   npx tsx src/index.ts workflow set-setting --key governance.spikeCheckpoint --value AUTONOMOUS_FAST_TRACK

   # Disattivare i modelli locali su una macchina o forzare il Cloud:
   npx tsx src/index.ts workflow set-setting --key localSlm.mode --value DISABLED_CLOUD_ONLY
   ```
3. **Modificare a voce tramite Executive Voice Director (`POST /api/voice-director` o MCP `execute_voice_command`):**
   - *"Attiva il checkpoint spike"* $\rightarrow$ imposta `governance.spikeCheckpoint = "HITL_SPIKE_REVIEW"`
   - *"Disattiva checkpoint spike, procedi in automatico"* $\rightarrow$ imposta `governance.spikeCheckpoint = "AUTONOMOUS_FAST_TRACK"`
