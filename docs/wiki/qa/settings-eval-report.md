# 🧪 Settings Behavioral Evaluation Report (`S1..S5`)

> **Valutazione Sperimentale Multi-Workspace & Cross-Stack delle Configurazioni Centrali (`.company-os/settings.json`)**  
> Eseguita il: 2026-11-09 | Piattaforma: macOS Apple Silicon | Runner: `SettingsEvalHarness`

---

## 📊 Sintesi Esecutiva dei Risultati

| Metrica Globale | Risultato Certificato | Target di Successo | Verdetto |
| :--- | :---: | :---: | :---: |
| **Punteggio Complessivo** | **100 / 100** | $\ge 90$ | **`SETTINGS_VERIFIED` ✅** |
| **Scenari Validati** | **4 / 4 (100%)** | 4 / 4 | **PASSED** |
| **Asserzioni di Invariante** | **12 / 12 (100%)** | 12 / 12 | **PASSED** |
| **First-Pass Yield (FPY)** | **100%** | $\ge 95\%$ | **ECCELLENTE** |
| **Rigetto Valori Non Validi** | **100% (Strict Zod)** | 100% | **PASSED** |

---

## 🔬 Dettaglio degli Scenari Multi-Workspace

### Scenario A: Python FastAPI Microservice (`SCENARIO_A_CEO_MAX_CONTROL`)
- **Workspace:** Repository effimero Python/FastAPI (`app/main.py`)
- **Settings Configurate:**
  ```json
  {
    "governance": {
      "spikeCheckpoint": "HITL_SPIKE_REVIEW",
      "anomalyGate": "STRICT_CFF_4_GATES",
      "releaseApproval": "CEO_MANDATORY",
      "roundtableDevilsAdvocate": true
    },
    "localSlm": {
      "mode": "DISABLED_CLOUD_ONLY"
    }
  }
  ```
- **Esito delle Verifiche Comportamentali:**
  1. `[CHECK 1]` Persistenza e rilettura atomica di `.company-os/settings.json`: **SUPERATO**.
  2. `[CHECK 2]` Enforcement di **`CFF-5`**: il tentativo di passare da Spike a `MODE_4_BUILD_GATEKEEPER` con `spikeApprovedByCeo === false` lancia un'eccezione deterministica `SPIKE_CHECKPOINT_GATE_VIOLATION`: **SUPERATO**.
  3. `[CHECK 3]` L'autorizzazione esplicita del CEO (`spikeApprovedByCeo === true`) sblocca immediatamente il passaggio a `MODE_4_BUILD_GATEKEEPER`: **SUPERATO**.

---

### Scenario B: High-Velocity Node/TypeScript Frontend (`SCENARIO_B_AUTONOMOUS_FAST_TRACK`)
- **Workspace:** Repository effimero Node.js/TypeScript (`src/index.ts`)
- **Settings Configurate:**
  ```json
  {
    "governance": {
      "spikeCheckpoint": "AUTONOMOUS_FAST_TRACK",
      "anomalyGate": "ADVISORY",
      "releaseApproval": "GATEKEEPER_AUTO"
    },
    "communication": {
      "cavemanMode": true
    }
  }
  ```
- **Esito delle Verifiche Comportamentali:**
  1. `[CHECK 1]` In modalità `AUTONOMOUS_FAST_TRACK`, `CFF-5` consente la transizione diretta alla build anche con `spikeApprovedByCeo === false`: **SUPERATO**.
  2. `[CHECK 2]` `CavemanFormatter.stripFluff` e `TelegraphicMessage` eliminano i convenevoli conversazionali preservando le istruzioni atomiche e i path: **SUPERATO**.
  3. `[CHECK 3]` Aggiornamento dinamico dot-path (`SettingsManager.updateSettingByPath`) di `communication.cavemanMode` a `false` con persistenza e validazione Zod immediata: **SUPERATO**.

---

### Scenario C: Air-Gapped / Low-Spec Environment (`SCENARIO_C_LOCAL_FIRST_AIRGAP`)
- **Workspace:** Worker sandbox isolato a zero connessioni esterne
- **Settings Configurate:**
  ```json
  {
    "localSlm": {
      "mode": "FORCE_ENABLED",
      "preferredModelOverride": "phi4-mini:3.8b-q4_K_M",
      "slaTimeoutMs": 500
    },
    "finops": {
      "maxSessionBudgetUsd": 1.0,
      "safePauseOnBudgetExceeded": true
    }
  }
  ```
- **Esito delle Verifiche Comportamentali:**
  1. `[CHECK 1]` `FastDecisionGate` System-1 valuta l'azione deterministica in sub-millisecondi (<0.1ms, costo token $0): **SUPERATO**.
  2. `[CHECK 2]` `BudgetWatchdog` rileva il superamento del cap configurato a $1.0 e scatta a stato `HALTED` / `EXCEEDED_GRACE`: **SUPERATO**.
  3. `[CHECK 3]` Validazione Zod respinge un valore numerico non conforme (`slaTimeoutMs: 50` sotto il minimo di 100ms): **SUPERATO**.

---

### Scenario D: Brownfield Anomaly & Chaos Immunity (`SCENARIO_D_STRICT_IMMUNE_DEFENSE`)
- **Workspace:** Codice Brownfield con mutazioni AST e falle logiche
- **Settings Configurate:**
  ```json
  {
    "gatekeeper": {
      "enableFormalAstProver": true,
      "formalProverTimeoutMs": 500,
      "selfHealingMaxRetries": 2,
      "enableWarRoomCircuitBreaker": true
    }
  }
  ```
- **Esito delle Verifiche Comportamentali:**
  1. `[CHECK 1]` `FormalAstProver` (Neuro-Symbolic Z3 SMT) identifica matematicamente una divisione per zero e sintetizza il controesempio prima del merge: **SUPERATO**.
  2. `[CHECK 2]` Iniezione di guasto Chaos in arena effimera (`os.tmpdir()`) confinata con successo e punteggio di resilienza $100/100$: **SUPERATO**.
  3. `[CHECK 3]` Configurazione specifica `gatekeeper.selfHealingMaxRetries: 2` caricata e rispettata: **SUPERATO**.

---

## 🛠️ Comando CLI per Esecuzione Continua

Il CEO e il team possono rieseguire in qualsiasi momento l'intero ciclo di valutazione con:
```bash
agentic-company workflow eval-settings --json
```
oppure con il bridge TypeScript diretto:
```bash
npx tsx src/index.ts workflow eval-settings
```
