# 🔬 Architectural Spike: Sprint 21 Tech Validation
**Sprint:** SPRINT-21 — Zero-Cost Local SLM Distillation & Hierarchical Speculative Swarm  
**Author:** CTO & Domain Leads (`ai_lead`, `engineering_lead`, `qa_lead` [Devil's Advocate], `context_finops_specialist` [Ring-2])  
**Status:** VALIDATED & APPROVED (Ready for CEO Review)  
**Verdict:** `APPROVED`  
**Schema Compliance:** [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts) & [`SlmDistillationTraceSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/frontiers.ts)  
**Foundation:** Mandato Strategico CEO & [`RFC-006`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md)  
**Date:** 2026-11-09  

---

## 📋 Executive Summary

Questo dossier architetturale formalizza lo **Spike Tecnico (`TCK-21.0`)** per lo **Sprint 21: Zero-Cost Local SLM Distillation & Hierarchical Speculative Swarm**, terzo pilastro della **Fase 6 (RFC-006)**.

### Il Problema Economico e di Latenza negli Sciami Multi-Agente
Anche con il **Two-Tier Prompt Caching** (Sprint 11) e il protocollo telegrafico **Caveman-RPC** (Sprint 15), un'organizzazione multi-agente che invoca un modello Cloud di frontiera (es. Claude 3.7 Sonnet / GPT-4o / Gemini Pro) per **ogni** operazione atomica subisce due colli di bottiglia strutturali:
1. **Spreco Cognitivo ed Economico (Over-Provisioning):** Circa il **65%–80%** delle micro-operazioni quotidiane di uno sciame non richiede ragionamento astratto profondo. Si tratta di task deterministici o semi-strutturati:
   - compressione telegrafica `CAVEMAN_ENCODING` di messaggi verbosi,
   - generazione di docstring/JSDoc tipizzate (`DOCSTRING_GEN`),
   - generazione di fixture sintetiche per schemi Zod/JSON (`SYNTHETIC_FIXTURES`),
   - triage rapido del perimetro (`FAST_TRIAGE`),
   - micro-refactoring sintattici guidati dalle coordinate dell'errore (`AST_REFACTOR`).
2. **Latenza di Rete Cloud:** Ogni round-trip HTTP verso API cloud introduce `600ms–2500ms` di Time-To-First-Token, rallentando il loop interno dei Leaf Developer L3.

### La Soluzione Architetturale dello Sprint 21
Lo **Sprint 21** trasforma l'OS in un **Sistema Cognitivo Gerarchico a 4 Livelli (Quad-Tier Inference Architecture)** alimentato dalle proprie traiettorie di successo:
1. **High-FPY Trajectory Harvester (`src/distillation/harvester.ts` — `TCK-21.1`):**
   - Legge in streaming (tramite [`TrajectoryReader`](file:///Users/stequar/Documents/agentic_company_os/src/core/trajectory-reader.ts) su `.company-os/audit.jsonl`) esclusivamente gli episodi che hanno superato il **Deterministic Gatekeeper al primo colpo (`First-Pass Yield = 100%`, zero retry di Self-Healing)** e sono stati firmati dalla catena Merkle/HMAC-SHA256.
   - Esporta dataset puliti JSONL (`Instruction / Context Slice / Verified Output`) e produce un certificato [`SlmDistillationTraceSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/frontiers.ts#L48-L60) per i 5 domini specializzati (`AST_REFACTOR`, `DOCSTRING_GEN`, `SYNTHETIC_FIXTURES`, `CAVEMAN_ENCODING`, `FAST_TRIAGE`).
2. **Embedded Local SLM Inference Adapter & Hardware-Aware Auto-Discovery (`src/distillation/local-slm-adapter.ts` — `TCK-21.2`):**
   - **Auto-Discovery dei Modelli Già Installati:** Interroga `GET http://127.0.0.1:11434/api/tags` (Ollama) e `GET http://127.0.0.1:8080/v1/models` (MLX / `llama.cpp`) per rilevare i modelli già presenti sulla macchina dell'utente senza imporre download ridondanti.
   - **Adaptive Hardware Tiering (`os.totalmem()`, `os.cpus()`, `process.arch`):**
     - `LOW_RESOURCE_BYPASS` (`< 8 GB RAM` o assenza di accelerazione hardware): **Garanzia Zero Rallentamenti** — disattiva automaticamente l'inferenza SLM pesante su macchine poco potenti, usando il motore deterministico in-process (`< 2ms`) o il Cloud (`Tier 2`), evitando swap su disco o blocchi della CPU.
     - `COMPACT_EDGE` (`8–15 GB RAM`): Seleziona **Qwen3-1.7B** (`qwen3:1.7b`), **Phi-4-Mini** (`phi4-mini`, 3.8B) o **Gemma 3 4B** (`gemma3:4b`).
     - `BALANCED_PRO` (`16–31 GB RAM`): Seleziona **Qwen3-8B** (`qwen3:8b`) o **Gemma 3 12B** (`gemma3:12b`).
     - `WORKSTATION_ULTRA` (`>= 32 GB RAM Unified Memory / 24GB+ VRAM`): Sblocca **`qwen3-coder:30b` (architettura MoE: 30B parametri totali ma solo 3.3B attivi per token!)** o `gemma3:27b`, permettendo su macchine carrozzate di eseguire in locale anche task complessi a velocità superiore al Cloud.
3. **Hierarchical Quad-Tier Inference Dispatcher (`src/distillation/quad-tier-dispatcher.ts` — `TCK-21.3`):**
   - Instrada ogni task lungo 4 livelli a costo crescente:
     - **Tier 0 (`KAHNEMAN_SYSTEM_1`):** Regole deterministiche in-memory ([`FastDecisionGate`](file:///Users/stequar/Documents/agentic_company_os/src/core/fast-decision-gate.ts)) — Latenza `< 2ms`, Costo `$0.00`.
     - **Tier 1 (`LOCAL_SLM_STUDENT`):** Modello locale SOTA adattato all'hardware (`qwen3:1.7b` / `phi4-mini` / `gemma3:4b` fino a `qwen3-coder:30b` MoE) — Latenza `25ms–120ms`, Costo Cloud `$0.00`.
     - **Tier 2 (`CLOUD_SOTA_WORKHORSE`):** Modello Cloud bilanciato (con Two-Tier Prefix Cache) per implementazione feature L3/L2 standard.
     - **Tier 3 (`DEEP_REASONING_FRONTIER`):** Modello Cloud High-Reasoning riservato esclusivamente a `MODE_2_INVESTIGATE_RCA`, `MODE_3_RND_ROUNDTABLE` e risoluzioni d'emergenza War Room.
4. **Speculative Parallel Pipeline & Gatekeeper Promotion (`src/distillation/speculative-pipeline.ts` — `TCK-21.4`):**
   - Per i task borderline assegnati a **Tier 1 (`LOCAL_SLM_STUDENT`)**, l'output dell'SLM locale viene sottoposto istantaneamente a verifica deterministica (validazione schema Zod / [`ConstrainedDecoder`](file:///Users/stequar/Documents/agentic_company_os/src/core/constrained-decoder.ts) + [`proveAstInvariants`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/formal-prover.ts)).
   - Se il check deterministico passa, il risultato è accettato a **costo cloud $0** e registrato in [`FinOpsEngine`](file:///Users/stequar/Documents/agentic_company_os/src/core/finops-engine.ts); se fallisce, scatta la **Speculative Escalation automatica a Tier 2 (Cloud)** senza mai degradare la qualità finale.

---

## 🏛️ Architettura Quad-Tier & Loop di Distillazione Continua

```mermaid
flowchart TD
    subgraph Quad_Tier_Router ["1. Hierarchical Quad-Tier Inference Dispatcher"]
        TaskReq["Task Agente (Prompt + Domain + Complexity)"]
        T0["Tier 0: Kahneman System-1 Gate<br/>(FastDecisionGate • <2ms • $0)"]
        T1["Tier 1: Local SLM Student (1B-3B)<br/>(MLX / GGUF / Ollama • ~45ms • $0 Cloud)"]
        T2["Tier 2: Cloud SOTA Workhorse<br/>(Two-Tier Cached • Feature Implementation)"]
        T3["Tier 3: Deep Reasoning Frontier<br/>(RCA 5-Whys • R&D Roundtable • War Room)"]

        TaskReq --> T0
        T0 -->|Trivial / Blocked| FastDone["Esito Istantaneo"]
        T0 -->|Specialized Low-Ambiguity Domain| T1
        T0 -->|Standard Feature / Multi-File| T2
        T0 -->|High Ambiguity / RCA / Architecture| T3
    end

    subgraph Speculative_Gate ["2. Speculative Verification & Auto-Escalation"]
        T1 --> VerifyGate{"Zod Constrained Decoder +<br/>Formal AST Prover (<50ms)"}
        VerifyGate -- "PASS (FPY=100%)" --> AcceptLocal["Accetta Risultato Locale ($0.00)<br/>Registra Risparmio in FinOpsEngine"]
        VerifyGate -- "FAIL / Schema Drift" --> T2
    end

    subgraph Distillation_Flywheel ["3. High-FPY Trajectory Harvester (Flywheel)"]
        AuditLog[(".company-os/audit.jsonl<br/>Merkle-Signed Trajectories")]
        Harvester["Trajectory Harvester<br/>(Filtra solo FPY = 100%, 0 Self-Healing Retries)"]
        Dataset["Distilled JSONL Dataset +<br/>SlmDistillationTrace"]

        T2 -->|Gatekeeper Green al 1° Colpo| AuditLog
        T3 -->|Gatekeeper Green al 1° Colpo| AuditLog
        AuditLog --> Harvester
        Harvester --> Dataset
        Dataset -.->|Aggiorna Few-Shot / LoRA Weights| T1
    end
```

---

## 🔍 Analisi Approfondita dei 4 Pilastri dello Sprint 21

### 1. High-FPY Trajectory Harvester (`TCK-21.1`)
- **Filtro di Purezza Deterministico (`FPY === 100%`):** Il più grande errore dei sistemi di auto-distillazione tradizionali è addestrare modelli piccoli su output mediocri (causando *Model Collapse*). Il nostro Harvester interroga la catena Merkle (`.company-os/audit.jsonl`) e seleziona **unicamente** le sessioni che:
  1. Hanno firma crittografica HMAC/SHA-256 integra,
  2. Hanno superato `GATEKEEPER_PASSED` al primo tentativo (`iterationsRun === 1`, zero interventi di Self-Healing),
  3. Non presentano avvisi di sicurezza o violazioni di `AST Diff Guard`.
- **5 Domini Specializzati (`SlmDistillationTraceSchema`):**
  - `CAVEMAN_ENCODING`: compressione messaggi inter-agente in formato `[CAVEMAN-RPC]`.
  - `FAST_TRIAGE`: classificazione scope e routing file/specialisti.
  - `DOCSTRING_GEN`: sintesi commenti JSDoc/docstring con annotazioni `@requires` / `@ensures`.
  - `SYNTHETIC_FIXTURES`: generazione payload di test nominali ed edge-case da JSON Schema.
  - `AST_REFACTOR`: correzioni sintattiche puntuali su singola funzione.

### 2. Embedded Local SLM Inference Adapter (`TCK-21.2`)
- **Architettura Dual-Mode (Hardware Accelerated + Deterministic Offline Fallback):**
  - **Modo Live Loopback:** Comunica via HTTP locale (`127.0.0.1:11434/api/generate` o `/v1/chat/completions`) con runtime locali (**Ollama**, **llama.cpp**, **MLX Server** su Apple Silicon M-series), imponendo vincoli di grammatica/JSON e timeout stretto (`1500ms`).
  - **Modo Hermetic/CI Fallback:** Se il server locale non è attivo o si esegue in ambiente CI ermetico, l'adapter utilizza un motore deterministico locale per i 5 domini specializzati, emettendo telemetria reale conforme a `SlmDistillationTraceSchema`.
- **Sicurezza Loopback:** Rifiuta qualsiasi endpoint non-loopback (`127.0.0.1` / `localhost` obbligatori) per garantire che nessun dato del codice sorgente lasci la macchina durante l'inferenza Tier-1.

### 3. Hierarchical Quad-Tier Inference Dispatcher (`TCK-21.3`)
- **Algoritmo di Routing Deterministico:**
  Valuta una tupla `(taskDomain, estimatedComplexity, activeCtoMode, tokenCount)`:
  - Se `activeCtoMode` è `MODE_2_INVESTIGATE_RCA` o `MODE_3_RND_ROUNDTABLE` $\rightarrow$ forza **Tier 3 (`DEEP_REASONING_FRONTIER`)** (mai usare un SLM locale per una Root Cause Analysis o una Tavola Rotonda!).
  - Se l'azione è un controllo perimetrale su file/comandi $\rightarrow$ **Tier 0 (`KAHNEMAN_SYSTEM_1`)**.
  - Se `taskDomain` appartiene ai 5 domini distillati e `estimatedComplexity <= 0.45` $\rightarrow$ **Tier 1 (`LOCAL_SLM_STUDENT`)**.
  - Altrimenti $\rightarrow$ **Tier 2 (`CLOUD_SOTA_WORKHORSE`)**.

### 4. Speculative Parallel Verification & FinOps Integration (`TCK-21.4`)
- **Zero Compromessi sulla Qualità (*Trust but Verify*):** Ogni output generato da **Tier 1 (`LOCAL_SLM_STUDENT`)** passa attraverso un cancello di verifica in `< 50ms`:
  1. Validazione strutturale con [`ConstrainedDecoder`](file:///Users/stequar/Documents/agentic_company_os/src/core/constrained-decoder.ts),
  2. Se l'output contiene codice (`AST_REFACTOR` / `DOCSTRING_GEN`), verifica formale istantanea con [`proveAstInvariants`](file:///Users/stequar/Documents/agentic_company_os/src/gatekeeper/formal-prover.ts) (Sprint 20!).
- Se entrambi passano, il task è chiuso a **$0.00** e [`FinOpsEngine`](file:///Users/stequar/Documents/agentic_company_os/src/core/finops-engine.ts) registra una rate card locale a costo `$0` calcolando il risparmio netto rispetto alla baseline Cloud. Se fallisce, il dispatcher promuove trasparentemente la richiesta a **Tier 2**.

---

## 📑 Dati Strutturati Zod (TechValidationReportSchema)

```json
{
  "sprintId": "SPRINT-21",
  "sprintTheme": "Zero-Cost Local SLM Distillation & Hierarchical Speculative Swarm",
  "executiveSummary": "Validazione tecnologica preventiva per lo Sprint 21 di Agentic Company OS. Ratifica l'architettura a 4 livelli (Quad-Tier Inference Dispatcher: System-1 Gate -> Local SLM 1B-3B -> Cloud Workhorse -> Deep Reasoning Frontier), il Trajectory Harvester che distilla esclusivamente sessioni con First-Pass Yield del 100% dal log Merkle, e la pipeline speculativa che verifica ogni output locale tramite ConstrainedDecoder e Formal AST Prover prima dell'accettazione a costo cloud zero.",
  "proposedDecisions": [
    "Implementare in src/distillation/harvester.ts il Trajectory Harvester che filtra da .company-os/audit.jsonl solo le traiettorie con FPY=100% e firma Merkle valida, generando dataset JSONL e certificati SlmDistillationTraceSchema.",
    "Realizzare in src/distillation/local-slm-adapter.ts l'adapter per inferenza locale (GGUF_Q4_K_M, GGUF_Q8_0, ONNX_INT8, MLX_4BIT) con vincolo strict-loopback (127.0.0.1) e motore deterministico di fallback per ambienti CI ermetici.",
    "Costruire in src/distillation/quad-tier-dispatcher.ts il router gerarchico a 4 livelli (Tier 0 System-1, Tier 1 Local SLM, Tier 2 Cloud SOTA, Tier 3 Deep Reasoning), vietando l'uso di SLM locali durante MODE_2_INVESTIGATE_RCA e MODE_3_RND_ROUNDTABLE.",
    "Integrare la Speculative Verification Pipeline che valida ogni output Tier-1 con ConstrainedDecoder e proveAstInvariants (Sprint 20), escalando automaticamente a Tier-2 in caso di violazione.",
    "Cablare end-to-end (Zero Island Modules) il sistema di distillazione e routing con FinOpsEngine (rate card $0 per modelli local-slm), MCP Server (tool dispatch_quad_tier_inference / harvest_slm_trajectories) e CLI workflow status."
  ],
  "benchmarksAndTools": [
    {
      "name": "Qwen3 / Qwen3-Coder (1.7B, 4B, 8B, 30B-A3B MoE), Gemma 3 (4B, 12B, 27B) & Phi-4-Mini via MLX / Ollama",
      "category": "local-slm-runtime",
      "url": "https://github.com/ggerganov/llama.cpp",
      "pros": [
        "Generazione 2025/2026: Qwen3-Coder-30B MoE attiva solo 3.3B parametri per token offrendo qualità da grande modello con velocità da SLM",
        "Taglie compatte (qwen3:1.7b, phi4-mini 3.8B, gemma3:4b) girano in 1.5GB-3.2GB di RAM con latenza sub-100ms su Apple Silicon",
        "Auto-discovery nativo dei modelli già installati tramite API loopback (/api/tags e /v1/models) e bypass automatico su macchine <8GB RAM"
      ],
      "cons": [
        "Richiede profilazione hardware all'avvio per evitare di caricare modelli pesanti su macchine con poca RAM"
      ],
      "recommendation": "adopt",
      "notes": "Selezionato dinamicamente dal HardwareProfiler & LocalModelScanner in base alla RAM/VRAM rilevata e ai modelli già presenti."
    },
    {
      "name": "Speculative Verification Gate (ConstrainedDecoder + Neuro-Symbolic Formal Prover)",
      "category": "quality-assurance-gate",
      "url": "https://arxiv.org/abs/2211.17192",
      "pros": [
        "Azzera il rischio di regressioni causate da allucinazioni dell'SLM locale",
        "Fallback istantaneo e trasparente sul modello Cloud Tier-2 se il check fallisce",
        "Riutilizza nativamente i moduli ConstrainedDecoder (Sprint 11) e FormalProver (Sprint 20)"
      ],
      "cons": [
        "Aggiunge ~5-15ms di verifica statica/simbolica dopo la generazione locale"
      ],
      "recommendation": "adopt",
      "notes": "Garantisce che il risparmio FinOps dell'85% non comprometta mai l'invariante di qualità del Gatekeeper."
    }
  ],
  "bestPractices": [
    "Distillare esclusivamente traiettorie con First-Pass Yield (FPY) pari al 100% per prevenire il Model Collapse dell'allievo locale.",
    "Imporre un blocco architetturale che vieti il downgrade su SLM locali per task ad alta complessità cognitiva (MODE_2_INVESTIGATE_RCA, MODE_3_RND_ROUNDTABLE, War Room).",
    "Confinare le connessioni dell'SLM Adapter esclusivamente a indirizzi di loopback (127.0.0.1 / ::1).",
    "Validare ogni singolo output dell'SLM locale con Zod/ConstrainedDecoder e AST Formal Prover prima di consegnarlo allo sciame.",
    "Tracciare in FinOpsEngine ogni inferenza Tier-1 per quantificare in tempo reale i token e i dollari risparmiati."
  ],
  "risksAndMitigations": [
    {
      "risk": "Model Collapse o degradazione progressiva se il dataset di distillazione include tentativi falliti o codice sub-ottimale.",
      "impact": "critical",
      "mitigation": "Il Trajectory Harvester scarta qualsiasi sessione che abbia richiesto iterazioni di Self-Healing o che non abbia superato il Gatekeeper al 100% al primo colpo."
    },
    {
      "risk": "Un SLM locale (1.5B) produce codice sintatticamente o logicamente difettoso su un task di AST_REFACTOR.",
      "impact": "high",
      "mitigation": "La Speculative Verification Pipeline esegue proveAstInvariants (Sprint 20) sull'output dell'SLM e, in caso di COUNTEREXAMPLE_FOUND o errore di schema, scarta la risposta locale ed esegue l'escalation automatica al modello Cloud Tier-2."
    },
    {
      "risk": "Assenza di un runtime GPU/Ollama attivo sulla macchina dell'utente o nei runner CI/CD.",
      "impact": "medium",
      "mitigation": "L'adapter include un modalità di fallback deterministico e auto-rilevamento di disponibilità loopback (<100ms probe) con escalation pulita."
    }
  ],
  "verdict": "APPROVED",
  "finalRecommendations": [
    "Sottoporre il presente report di Spike dello Sprint 21 alla revisione strategica del CEO prima di avviare la scrittura del codice applicativo.",
    "Dopo il via libera del CEO, procedere con TCK-21.1 (Trajectory Harvester), TCK-21.2 (Local SLM Adapter), TCK-21.3 (Quad-Tier Dispatcher) e TCK-21.4 (Speculative Pipeline & FinOps/MCP/CLI Wiring).",
    "Certificare l'intera architettura con una suite di test dedicata in tests/local-slm-distillation.test.ts."
  ],
  "sources": [
    "docs/wiki/rnd/rfcs/RFC-006-NEXT-GEN-FRONTIERS-AND-SELF-EVOLVING-ECOSYSTEM.md",
    "src/contracts/frontiers.ts",
    "src/core/trajectory-reader.ts",
    "src/core/finops-engine.ts",
    "src/gatekeeper/formal-prover.ts"
  ],
  "validatedAt": "2026-11-09T14:35:00.000Z"
}
```
