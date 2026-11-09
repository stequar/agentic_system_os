# 🔬 Architectural Spike: Sprint 3 Tech Validation
**Sprint:** SPRINT-3 — Dogfooding Live Attach & Cross-Domain Contract Handshake  
**Author:** Engineering Lead (Domain Lead L2)  
**Status:** VALIDATED & APPROVED  
**Verdict:** `APPROVED`  
**Schema Compliance:** [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts)  
**Date:** 2026-10-16  

---

## 📋 Executive Summary

Questo dossier architetturale valida le scelte tecnologiche e i pattern operativi per lo **Sprint 3** ("Dogfooding Live Attach & Cross-Domain Contract Handshake"). L'obiettivo dello sprint è completare l'ecosistema dell'Agentic Company OS attraverso tre direttrici integrate:

1. **CLI Environment Doctor (`agentic-company doctor`):** Diagnostica di salute della toolchain di sviluppo locale prima dell'orchestrazione degli agenti o delle pipeline di gatekeeping. L'architettura adotta un pattern di esecuzione parallelo e non bloccante basato su `Promise.allSettled`, con timeout deterministici (`execFile` con `AbortSignal.timeout(3000)`) sui binari di sistema (`python3`, `swiftc`, `docker`, `git`). Il modulo produce un report tipizzato Zod (`DoctorReportSchema`), corredato sia da visualizzazione human-friendly a colori su console (Chalk) sia da output macchina serializzato via flag `--json`.
2. **Cross-Domain Contract Synchronization (API Handshake):** Generatore funzionale in TypeScript puro a partire dal contratto unificato `ApiContractSchema` (`src/contracts/engineering.ts`). Genera in modo simmetrico e deterministico:
   - Modelli Python **Pydantic v2** (`ConfigDict(populate_by_name=True, from_attributes=True)`, `Field(..., alias=...)`, tipi nativi `datetime`, `UUID`).
   - Strutture Swift **`Codable, Sendable`** (Swift 6 Concurrency compliant) con enum `CodingKeys: String, CodingKey` espliciti per la conversione biunivoca `snake_case` $\leftrightarrow$ `camelCase`.
   - Rifiuto categorico di compilatori binari esterni (es. OpenAPI Generator CLI Java-based o script Python esterni), garantendo zero dipendenze esterne a runtime e generazione istantanea in memoria.
3. **Live Attach & Dogfooding su `fitness_project`:** Strategia di esecuzione sicura per l'attach definitivo e non-dry-run sul workspace reale `/Users/stequar/fitness_project`. La strategia capitalizza il rilevamento poliglotto dell'Inspector (iOS SwiftUI + Python FastAPI + Docker) e le primitive atomiche POSIX *Write-Sync-Rename* con backup automatico `.bak` (fondamentale data la presenza di un file preesistente `AGENTS.md`) e garanzia di idempotenza a costo zero I/O tramite hash SHA-256.

Il verdetto architetturale è **`APPROVED`**.

---

## 🏛️ Valutazione delle Scelte Architetturali

### 1. CLI Environment Doctor: Diagnostica Parallela e Resiliente

#### Il Problema: Fallimenti Opachi e Daemon Bloccati
Quando un sistema agentico viene collegato a un workspace target poliglotto come `fitness_project`, l'assenza o il malfunzionamento dei tool di compilazione (`swiftc`), degli interpreti runtime (`python3`, virtualenv `.venv`) o dei daemon di containerizzazione (`docker`) causa fallimenti catastrofici a metà del ciclo di esecuzione. Errori comuni includono:
- Hanging indefinito di chiamate CLI verso daemon non attivi (es. Docker daemon non avviato, socket Unix `/var/run/docker.sock` inaccessibile).
- Errate versioni dei runtime (es. Python 2.x o Python 3.8 invece di 3.11+ per Pydantic v2).
- Crash a catena di pipeline asincrone quando una singola verifica lancia un'eccezione non gestita.

#### La Soluzione: `Promise.allSettled` + `execFile` con Timeout Deterministico

```
                     ┌──► Check Python (python3 --version) ──────┐
                     │                                           │
agentic-company      ├──► Check Swift (swiftc --version) ────────┼──► Promise.allSettled()
     doctor          │                                           │            │
                     ├──► Check Docker (docker info) [Timeout] ──┤            ▼
                     │                                           │   Aggregazione Tipizzata
                     └──► Check Git (git --version) ─────────────┘    (DoctorReportSchema)
                                                                              │
                                       ┌──────────────────────────────────────┴──────────────────────────────────────┐
                                       ▼                                                                             ▼
                             Console Human-Friendly                                                             JSON Output
                          (Chalk icone, colori, fix)                                                            (--json flag)
```

1. **Isolamento dei Fallimenti (`Promise.allSettled`):**
   A differenza di `Promise.all`, che si interrompe al primo rifiuto (*fail-fast*), `Promise.allSettled` raccoglie tutti i verdetti indipendentemente dal successo o dal fallimento dei singoli check. L'ambiente dell'utente viene diagnosticato nella sua interezza, fornendo una panoramica completa di tutti i problemi presenti in un'unica esecuzione.
2. **Timeout Rigorosi su Singolo Binario (`execFile` con AbortSignal):**
   Per evitare che un binario bloccato (es. Docker o un prompt interattivo di Git) congeli il CLI doctor, ogni comando viene eseguito tramite `node:child_process.execFile` con un timeout perentorio di 3.000 ms e `AbortSignal.timeout(3000)`. L'utilizzo di `execFile` al posto di `exec` disabilita lo shell wrapper (`/bin/sh`), azzerando vulnerabilità di shell injection ed overhead di fork.
3. **Contratto Zod per la Diagnostica (`DoctorReportSchema`):**
   Il report è formalizzato in `src/contracts/doctor.ts` con i seguenti campi:
   - `status`: `"ok" | "warn" | "error" | "skipped"`
   - `category`: `"runtime" | "compiler" | "daemon" | "vcs" | "workspace"`
   - `checkName`: identificativo del controllo (es. `"python3"`, `"swiftc"`, `"docker"`, `"git"`, `"venv"`)
   - `version`: versione rilevata (estratta tramite regex semver sicura)
   - `message`: spiegazione sintetica dell'esito
   - `fixSuggested`: comando shell o azione correttiva consigliata per risolvere l'anomalia (es. `"brew install python@3.11"`, `"open -a Docker"`, `"xcode-select --install"`)
4. **Output Bivalente (Human-Friendly & `--json`):**
   - **Console:** icone Chalk (✔ verde per ok, ⚠ giallo per warning, ✖ rosso per error), sezioni raggruppate per categoria e riepilogo "Remediation Actions" con comandi copia-incolla.
   - **Machine-to-Machine:** con il flag `--json`, l'output su stdout è un JSON valido conforme a `DoctorReportSchema`, integrabile direttamente nelle pipeline CI/CD o letto dai Domain Lead L2.

---

### 2. Cross-Domain Contract Synchronization (API Handshake)

#### Il Problema: Asimmetria Contrattuale tra Backend e Mobile
Nei progetti moderni con architettura ibrida (come `fitness_project` con backend FastAPI e frontend iOS SwiftUI), le discrepanze tra modelli dati rappresentano la principale fonte di bug a runtime:
- **Convenzioni di naming:** Python usa `snake_case` (`user_id`, `muscle_group`, `created_at`), mentre Swift richiede `camelCase` (`userId`, `muscleGroup`, `createdAt`).
- **Limiti di `JSONDecoder.keyDecodingStrategy = .convertFromSnakeCase`:** La strategia automatica di Swift fallisce su acronimi o prefissi/suffissi numerici (es. `oauth_token` $\rightarrow$ `oAuthToken` vs `oauthToken`, `api_v1_endpoint` $\rightarrow$ `apiV1Endpoint`, `user_id_1` $\rightarrow$ runtime decoding error). Inoltre, non offre alcuna garanzia a compile-time: un disallineamento nei tipi causa crash silenziosi o fallimenti di decodifica solo a runtime.
- **Swift 6 Strict Concurrency:** In Swift 6, tutti i modelli scambiati tra thread, attori (`@MainActor`) e task asincroni devono conformarsi al protocollo `Sendable`. Se i modelli generati non sono `Sendable`, il compilatore Swift blocca la compilazione.
- **Pydantic v2 Aliasing & Validation:** In Pydantic v2, i modelli devono configurare `model_config = ConfigDict(populate_by_name=True, from_attributes=True)` e annotare i campi con `Field(..., alias=...)` per accettare sia payload snake_case che camelCase senza sollevare `ValidationError`.

#### La Soluzione: Pure Functional Code Generation in TypeScript (Zero Runtime Dependencies)

Anziché ricorrere a generatori monolitici esterni (es. OpenAPI Generator CLI che richiede Java Runtime Environment o script Python invocati via shell), Agentic Company OS adotta un **generatore funzionale puro in TypeScript** (`src/sync/contract-sync.ts`) che traduce direttamente `ApiContractSchema` in codice sorgente Python e Swift:

```
                          ┌──────────────────────────┐
                          │    ApiContractSchema     │
                          │ (src/contracts/engine... │
                          └────────────┬─────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
      ┌───────────────────────────┐         ┌───────────────────────────┐
      │   Python Pydantic v2      │         │   Swift Codable/Sendable  │
      │   Generator (TS Function) │         │   Generator (TS Function) │
      └─────────────┬─────────────┘         └─────────────┬─────────────┘
                    ▼                                     ▼
        schemas.py (FastAPI)                     Models.swift (iOS)
  - ConfigDict(populate_by_name)            - Codable, Sendable, Hashable
  - Field(..., alias="...")                 - nonisolated CodingKeys
  - datetime, UUID, typing                  - camelCase <-> snake_case
```

#### Regole di Generazione Pydantic v2 (Python)
1. Intestazione con import rigorosi:
   ```python
   from datetime import datetime
   from typing import Optional, List, Dict
   from uuid import UUID
   from pydantic import BaseModel, ConfigDict, Field
   ```
2. Configurazione centralizzata su ogni modello:
   ```python
   model_config = ConfigDict(
       populate_by_name=True,
       from_attributes=True
   )
   ```
3. Mapping dei campi con alias camelCase per interoperabilità:
   ```python
   muscle_group: str = Field(..., alias="muscleGroup")
   created_at: datetime = Field(..., alias="createdAt")
   ```

#### Regole di Generazione Swift Codable & Sendable
1. Intestazione con import e protocolli di concorrenza moderna:
   ```swift
   import Foundation

   public struct Exercise: Codable, Sendable, Hashable {
       public let id: UUID
       public let name: String
       public let muscleGroup: String
       public let createdAt: Date
   ```
2. Generazione esplicita dell'enum `CodingKeys` con marcatura `nonisolated`:
   ```swift
       nonisolated private enum CodingKeys: String, CodingKey {
           case id
           case name
           case muscleGroup = "muscle_group"
           case createdAt = "created_at"
       }
   }
   ```
3. **Vantaggi dell'Enum `CodingKeys` Esplicito:**
   - **Determinismo Assoluto:** Nessuna euristica magica a runtime. La corrispondenza `muscleGroup` $\leftrightarrow$ `muscle_group` è codificata a livello di AST.
   - **Zero Configurazione Client:** L'app iOS può utilizzare un `JSONDecoder()` standard senza dover impostare `.convertFromSnakeCase`.
   - **Swift 6 Concurrency:** L'annotazione `nonisolated` impedisce che l'enum erediti l'isolamento di contesto (es. `@MainActor`) quando il modello viene utilizzato all'interno di ViewModels SwiftUI.

#### Universal Primitive Type Map (TypeScript $\rightarrow$ Python $\rightarrow$ Swift)

| Tipo Universale | Zod / JSON Schema | Python (Pydantic v2) | Swift (Codable/Sendable) |
| :--- | :--- | :--- | :--- |
| **String** | `z.string()` | `str` | `String` |
| **UUID** | `z.string().uuid()` | `UUID` (modulo `uuid`) | `UUID` (modulo `Foundation`) |
| **DateTime** | `z.string().datetime()` | `datetime` (modulo `datetime`) | `Date` (modulo `Foundation`) |
| **Integer** | `z.number().int()` | `int` | `Int` |
| **Float / Double** | `z.number()` | `float` | `Double` |
| **Boolean** | `z.boolean()` | `bool` | `Bool` |
| **Optional Type** | `.optional()` | `Optional[T] = None` | `T?` |
| **Array** | `z.array(T)` | `List[T]` | `[T]` |
| **Nested Object** | `z.object({...})` | `NestedModel` (sotto-classe) | `NestedModel` (sotto-struct) |

---

### 3. Live Attach & Dogfooding su `fitness_project`

#### L'Ispezione sul Campo di `/Users/stequar/fitness_project`
L'analisi empirica del repository target `/Users/stequar/fitness_project` ha rivelato:
- **Stack Rilevato:** Poliglotto (`docker`, `python`, `swift`) con framework `fastapi` e `swiftui`, comandi test raccomandati `pytest` e `swift test`.
- **File Preesistenti Sensibili:** È presente una directory `.venv/`, un file `docker-compose.yml`, un file `AGENTS.md` (3.147 byte, modificato il 15 settembre), e codice applicativo in `app/schemas.py` e `app/Models/Exercise.swift`.
- **Discrepanza Contrattuale Concreta:**
  - In `app/schemas.py`: `Exercise` usa `muscle_group: str` e `id: int`.
  - In `app/Models/Exercise.swift`: `Exercise` usa `let muscleGroup: String` e `let id: UUID` senza `CodingKeys`.
  Questo dimostra in modo inconfutabile l'utilità immediata del modulo di sincronizzazione contratti dello Sprint 3.

#### Strategia di Attach Sicura in 5 Fasi

```
1. INSPECT        ──► Validazione stack e package manager (detectProjectStack)
       │
2. DOCTOR         ──► Diagnostica toolchain (python3, swiftc, docker, venv)
       │
3. DRY-RUN        ──► Simulazione attach (nessun byte scritto su disco)
       │
4. LIVE ATTACH    ──► Iniezione atomica (Write-Sync-Rename)
       │              ├── Backup automatico di AGENTS.md in AGENTS.md.bak
       │              ├── Scrittura governance (.agents/, docs/wiki/, backlog)
       │              └── Idempotenza SHA-256 (status SKIPPED_UNCHANGED se identico)
       ▼
5. CONTRACT SYNC  ──► Generazione bidirezionale schemas.py e Models.swift
```

1. **Pre-Flight Inspection (`inspect`):**
   Verifica che la directory target esista, contenga codice leggibile e restituisca i metadati corretti.
2. **Environment Doctor Check (`doctor`):**
   Esecuzione di `agentic-company doctor /Users/stequar/fitness_project`. Se i tool critici (es. `python3` e `git`) sono operativi, il gatekeeper sblocca la procedura. Se `swiftc` o `docker` non sono presenti, viene emesso un warning chiaro senza bloccare l'attach della governance.
3. **Dry-Run Preview (`attach --dry-run`):**
   Simula l'iniezione calcolando la lista completa dei file da creare o aggiornare, mostrando all'utente il piano di esecuzione e rilevando in anticipo quali file richiederanno backup `.bak`.
4. **Live Atomic Injection:**
   Esecuzione reale tramite `attachWorkspace` con `atomicWriteFile`:
   - Riconoscimento del preesistente `AGENTS.md` $\rightarrow$ creazione automatica della copia di sicurezza `AGENTS.md.bak`.
   - Iniezione delle competenze `.agents/skills/run-company/SKILL.md` e della documentazione `docs/wiki/`.
   - Scrittura sicura con fsync e atomic rename POSIX.
   - Calcolo degli hash SHA-256: riesecuzioni successive dell'attach produrranno `SKIPPED_UNCHANGED`, azzerando inutili I/O o modifiche a timestamp git.
5. **Contract Handshake Injection:**
   Esecuzione del sincronizzatore per esportare i modelli Pydantic v2 e Swift `Codable/Sendable` nei rispettivi package applicativi (`fitness_project/app/schemas/` e `fitness_project/app/Models/`).

---

## 📊 Matrice di Benchmark & Analisi Strumenti

| Strumento | Categoria | Pros | Cons | Raccomandazione |
| :--- | :--- | :--- | :--- | :--- |
| **TypeScript Native Functional Code Generator** | Contract Code Generation | Zero dipendenze binarie, 100% portabile (Node.js nativo), supporto immediato a Pydantic v2 e Swift 6 Concurrency (`Sendable`), determinismo assoluto. | Richiede manutenzione del generatore all'interno della codebase TS. | **`adopt`** |
| **OpenAPI Generator CLI (`@openapitools/openapi-generator-cli`)** | Contract Code Generation | Supporta 50+ linguaggi, ampiamente diffuso per API monolitiche. | Richiede JRE (Java 11+) installato sulla macchina host; pacchetto pesante (>20MB); genera codice Pydantic v1 obsoleto e Swift non compliant con Swift 6 senza complessi template custom. | **`avoid`** |
| **`datamodel-code-generator` (Python CLI)** | Contract Code Generation | Ottimo supporto Pydantic v2 nel mondo Python. | Supporta solo Python (nessun supporto Swift per iOS); richiede runtime Python e dipendenza pip globale; impossibile da includere in un CLI npm autonomo. | **`avoid`** |
| **Node.js Native `child_process.execFile` + `Promise.allSettled`** | Environment Diagnostics | Zero dipendenze esterne, isolamento dei fallimenti concorrenti, protezione da shell injection, supporto nativo a timeout e `AbortSignal`. | Richiede parsing manuale di stdout/stderr e regex per l'estrazione delle versioni. | **`adopt`** |
| **`systeminformation` / `node-doctor`** | Environment Diagnostics | Fornisce diagnostica approfondita su hardware, CPU, memoria e batteria. | Dipendenza pesante con moduli nativi; overhead di scansione elevato (diversi secondi); fuori perimetro per semplici check di toolchain sviluppatore. | **`avoid`** |
| **Swift Explicit `CodingKeys` (nonisolated)** | Swift Serialization | Mapping deterministico 1:1 dei campi `snake_case` $\leftrightarrow$ `camelCase`, immunità a bug di decodifica su acronimi (`oauth_token`, `api_v1`), safe con Swift 6 Concurrency (`Sendable`). | Richiede la generazione del blocco enum all'interno della struct. | **`adopt`** |
| **Swift `keyDecodingStrategy = .convertFromSnakeCase`** | Swift Serialization | Nessun boilerplate `CodingKeys` richiesto nel codice Swift. | Fallisce su acronimi e convenzioni non standard; obbliga il client a configurare il decoder; nessuna garanzia a compile-time su disallineamenti di naming. | **`avoid`** |

---

## 🛡️ Matrice Rischi e Mitigazioni

| Rischio Identificato | Impatto | Strategia di Mitigazione |
| :--- | :---: | :--- |
| **Hanging del CLI Doctor su daemon bloccati (es. Docker down)** | **Critico** | Adozione perentoria di timeout a 3.000 ms con `AbortSignal.timeout(3000)` su ogni invocazione `execFile` e aggregazione tramite `Promise.allSettled`. |
| **Asimmetria di decodifica JSON tra Backend Python e App iOS** | **Alto** | Generazione simmetrica guidata da `ApiContractSchema`: Pydantic v2 con `populate_by_name=True` e campi `Field(alias=...)` speculari a struct Swift con `CodingKeys` espliciti. |
| **Violazioni di Swift 6 Concurrency sui modelli generati** | **Alto** | Conformità esplicita a `Codable, Sendable, Hashable` su tutte le struct Swift generate e marcatura `nonisolated` su enum `CodingKeys`. |
| **Corruzione o perdita del file preesistente `AGENTS.md` su `fitness_project`** | **Critico** | Garanzia del backup preventivo `.bak` tramite il modulo atomico POSIX `atomicWriteFile` prima di qualsiasi sovrascrittura nel repository reale. |
| **Incompatibilità di ambiente in macchine senza toolchain completa (es. solo Python, no Swift)** | **Medio** | Classificazione dei controlli del Doctor: distinzione tra errori bloccanti (`git`, interprete primario dello stack) e avvisi non bloccanti (`warn` / `skipped` per tool secondari). |

---

## 📑 Report Strutturato Zod (`TechValidationReportSchema`)

```json
{
  "sprintId": "SPRINT-3",
  "sprintTheme": "Dogfooding Live Attach & Cross-Domain Contract Handshake",
  "executiveSummary": "Tech Validation Spike per lo Sprint 3 focalizzato su tre pilastri architetturali: (1) Architettura CLI Environment Doctor basata su esecuzione parallela non bloccante (Promise.allSettled) e timeout controllati con AbortSignal su binari nativi (python3, swiftc, docker, git), formalizzata con DoctorReportSchema tipizzato Zod e rendering duplice (console Chalk e flag --json); (2) Cross-Domain Contract Synchronizer basato su generazione funzionale pura in TypeScript a partire da ApiContractSchema, azzerando dipendenze binarie a runtime (rifiuto di OpenAPI Generator Java CLI) e garantendo simmetria perfetta tra modelli Python Pydantic v2 (ConfigDict, Field alias) e Swift 6 Codable/Sendable con CodingKeys espliciti nonisolated; (3) Strategia sicura di Live Attach e dogfooding su /Users/stequar/fitness_project con pipeline in 5 fasi, protezione file esistenti (AGENTS.md.bak), idempotenza SHA-256 e sincronizzazione schemi. Verdetto finale: APPROVED.",
  "proposedDecisions": [
    "Implementazione del modulo CLI Environment Doctor in src/doctor/health.ts utilizzando Promise.allSettled ed execFile con AbortSignal.timeout(3000) per prevenire blocchi da daemon Docker o binari hanging.",
    "Definizione dei contratti Zod per la diagnostica in src/contracts/doctor.ts (DoctorCheckResultSchema, DoctorReportSchema, DiagnosticCategorySchema).",
    "Adozione di un generatore funzionale puro di contratti in puro TypeScript in src/sync/contract-sync.ts, rifiutando generatori esterni basati su Java o wrapper Python.",
    "Standardizzazione dei modelli Python su Pydantic v2 con ConfigDict(populate_by_name=True, from_attributes=True), tipi nativi datetime e UUID, e Field(..., alias=...).",
    "Standardizzazione delle strutture Swift su Codable, Sendable (Swift 6 strict concurrency) con enum CodingKeys espliciti e nonisolated per mapping trasparente snake_case <-> camelCase.",
    "Esecuzione dell'attach definitivo non-dry-run su /Users/stequar/fitness_project capitalizzando il modulo POSIX Write-Sync-Rename (atomicWriteFile) con backup preventivo automatico di AGENTS.md in AGENTS.md.bak e verifica di idempotenza via SHA-256."
  ],
  "benchmarksAndTools": [
    {
      "name": "TypeScript Native Functional Code Generator",
      "category": "Contract Code Generation",
      "url": "https://www.typescriptlang.org/",
      "pros": [
        "Zero dipendenze binarie o runtime esterne (nessun requisito JRE né Python a livello CLI core)",
        "Controllo deterministico e simmetrico al 100% sulla generazione di Pydantic v2 e Swift 6 Codable/Sendable",
        "Esecuzione istantanea in memoria con zero overhead di fork",
        "Piena integrazione con la suite di test Vitest e typecheck TypeScript"
      ],
      "cons": [
        "Richiede la stesura e manutenzione dei template funzionali all'interno del modulo src/sync/"
      ],
      "recommendation": "adopt",
      "notes": "Scelta architetturale approvata. Garantisce massima stabilità, affidabilità e assenza di attrito supply-chain."
    },
    {
      "name": "OpenAPI Generator CLI (@openapitools/openapi-generator-cli)",
      "category": "Contract Code Generation",
      "url": "https://openapi-generator.tech/",
      "pros": [
        "Ecosistema maturo con supporto a decine di target linguistici",
        "Ampio set di configurazioni template basate su Mustache"
      ],
      "cons": [
        "Richiede l'installazione di Java (JRE 11+) sulla macchina dell'utente",
        "Pacchetto npm pesante con download dinamico di JAR da oltre 20 MB",
        "Genera codice Python spesso fermo a Pydantic v1 e codice Swift privo dei requisiti Sendable di Swift 6",
        "Overhead di avvio JVM lento e fragile da orchestrare in un CLI ultra-rapido"
      ],
      "recommendation": "avoid",
      "notes": "Scartato formalmente: l'introduzione di dipendenza da Java e JAR esterni viola le linee guida architetturali."
    },
    {
      "name": "datamodel-code-generator (Python CLI)",
      "category": "Contract Code Generation",
      "url": "https://github.com/koxudaxi/datamodel-code-generator",
      "pros": [
        "Generazione eccellente di modelli Pydantic v2 a partire da JSON Schema / OpenAPI",
        "Supporto accurato a tipi e annotazioni Python moderne"
      ],
      "cons": [
        "Genera unicamente modelli Python (nessun supporto per Swift/iOS)",
        "Richiede un ambiente Python installato e configurato globalmente con pip",
        "Incompatibile con l'obiettivo di fornire un tooling autonomo in TypeScript"
      ],
      "recommendation": "avoid",
      "notes": "Scartato: non risolve la generazione per Swift e richiede dipendenze runtime non garantite."
    },
    {
      "name": "Node.js Native child_process.execFile + Promise.allSettled",
      "category": "Environment Diagnostics",
      "url": "https://nodejs.org/api/child_process.html",
      "pros": [
        "Incluso nel runtime Node.js nativo senza alcuna dipendenza",
        "Previene vulnerabilità di shell injection disabilitando la shell intermedia",
        "Isolamento completo dei fallimenti tramite Promise.allSettled",
        "Supporto granulare a timeout e cancellazione mediante AbortSignal.timeout"
      ],
      "cons": [
        "Richiede parsing manuale dell'output e gestione esplicita delle regex semver"
      ],
      "recommendation": "adopt",
      "notes": "Soluzione ideale per il comando doctor: resiliente, ultra-veloce e priva di dipendenze."
    },
    {
      "name": "Swift Explicit CodingKeys (nonisolated)",
      "category": "Swift Serialization",
      "url": "https://developer.apple.com/documentation/swift/codingkey",
      "pros": [
        "Mapping deterministico al 100% tra snake_case del server e camelCase di Swift",
        "Immune a fallimenti su acronimi o prefissi numerici (es. oauth_token, api_v1, user_id)",
        "Nessun vincolo di configurazione runtime su JSONDecoder",
        "Pienamente compatibile con Swift 6 Concurrency (Sendable e nonisolated)"
      ],
      "cons": [
        "Genera qualche riga di codice in più nella definizione della struct"
      ],
      "recommendation": "adopt",
      "notes": "Scelta raccomandata per garantire robustezza e assenza di regressioni sui modelli iOS."
    },
    {
      "name": "Swift keyDecodingStrategy = .convertFromSnakeCase",
      "category": "Swift Serialization",
      "url": "https://developer.apple.com/documentation/foundation/jsondecoder/keydecodingstrategy/convertfromsnakecase",
      "pros": [
        "Elimina il codice boilerplate dell'enum CodingKeys"
      ],
      "cons": [
        "Euristica a runtime inaffidabile su acronimi (URL, ID, OAuth) e suffissi numerici",
        "Richiede che ogni consumer del modello configuri manualmente il decoder",
        "Nessuna segnalazione di errore a tempo di compilazione"
      ],
      "recommendation": "avoid",
      "notes": "Scartato come meccanismo principale per i modelli generati: l'esplicitezza dei CodingKeys è fondamentale per contratti enterprise."
    }
  ],
  "bestPractices": [
    "Health Probes Parallele Non Bloccanti: Eseguire tutti i controlli diagnostici contemporaneamente con Promise.allSettled, garantendo che il fallimento o blocco di uno strumento non mascheri lo stato degli altri.",
    "Timeout Perentori sui Binari: Impostare un timeout massimo di 3.000 ms con AbortSignal per qualsiasi invocazione di comando shell o binario di sistema.",
    "Contratto Diagnostico Tipizzato: Definire univocamente i risultati del Doctor tramite Zod (DoctorReportSchema), consentendo automazione CI/CD e integrazione subagenti con --json.",
    "Generazione Contratti Pure TS: Generare codice sorgente Python e Swift tramite funzioni pure TypeScript, azzerando runtime esterni (Java, container Docker aggiuntivi, compilatori esterni).",
    "Pydantic v2 Modern Compliance: Utilizzare ConfigDict(populate_by_name=True, from_attributes=True) e Field(..., alias=...) per garantire compatibilità con convenzioni client e serializzazione bidirezionale.",
    "Swift 6 Strict Concurrency: Implementare Codable, Sendable e Hashable su tutte le strutture Swift, accompagnate da enum CodingKeys contrassegnati come nonisolated.",
    "Universal Type Matrix: Mappare rigorosamente i tipi primitivi (string, uuid, datetime, int, float, bool) su costrutti nativi di ciascun linguaggio target.",
    "Dry-Run Preview Obbligatorio: Consentire sempre la preventiva ispezione delle modifiche pianificate con flag --dry-run prima di eseguire l'attach effettivo su un progetto reale.",
    "Preservazione dei Dati Preesistenti: Creare sistematicamente copie .bak di file di configurazione preesistenti (come AGENTS.md su fitness_project) prima di applicare modifiche.",
    "Idempotenza Verificata: Calcolare il digest SHA-256 dei file generati rispetto a quelli presenti su disco per restituire SKIPPED_UNCHANGED senza alterare timestamp o sporcare la history di Git."
  ],
  "risksAndMitigations": [
    {
      "risk": "Blocco indefinito del comando doctor a causa di un daemon Docker non responsivo o socket Unix bloccato.",
      "impact": "critical",
      "mitigation": "Applicazione di AbortSignal.timeout(3000) su execFile con cattura dell'errore di timeout e marcatura del check con status error e remediation dedicata."
    },
    {
      "risk": "Disallineamento nei tipi o nei campi tra l'API FastAPI in Python e il client iOS SwiftUI durante lo sviluppo concorrente.",
      "impact": "high",
      "mitigation": "Single Source of Truth tramite ApiContractSchema e generazione automatica simmetrica di schemas.py (Pydantic v2) e Models.swift (Codable/Sendable)."
    },
    {
      "risk": "Errori di compilazione in Swift 6 dovuti a violazioni dei limiti di concorrenza degli attori sui DTO.",
      "impact": "high",
      "mitigation": "Conformità esplicita a Sendable su tutte le struct e dichiarazione nonisolated su tutti gli enum CodingKeys."
    },
    {
      "risk": "Sovrascrittura accidentale delle istruzioni storiche in AGENTS.md presente su /Users/stequar/fitness_project.",
      "impact": "critical",
      "mitigation": "Pattern POSIX Write-Sync-Rename con backup automatico AGENTS.md.bak e opzione di diff visualizzabile."
    },
    {
      "risk": "Falsi positivi o fallimenti bloccanti del Doctor in ambienti privi di uno dei compilatori dello stack (es. Docker non avviato in fase di sviluppo mobile puro).",
      "impact": "medium",
      "mitigation": "Categorizzazione granulare: solo i tool indispensabili sollevano errori critici; i servizi ausiliari generano avvisi (warn) lasciando all'utente la decisione."
    }
  ],
  "verdict": "APPROVED",
  "finalRecommendations": [
    "Approvare il dossier architetturale dello Sprint 3 e procedere alle fasi SPECIFY e DELEGATE.",
    "Creare i contratti Zod in src/contracts/doctor.ts (DoctorCheckResultSchema, DoctorReportSchema) e src/contracts/sync.ts (ContractSyncOptionsSchema, ContractSyncResultSchema).",
    "Implementare src/doctor/health.ts per i controlli di python3, swiftc, docker, git e venv con supporto a Promise.allSettled ed execFile con timeout.",
    "Integrare il comando CLI `agentic-company doctor [path]` in src/index.ts con output Chalk a colori e flag `--json`.",
    "Implementare src/sync/contract-sync.ts con generatori puri TypeScript per Pydantic v2 e Swift Codable/Sendable.",
    "Eseguire la suite di test in tests/doctor.test.ts e tests/sync.test.ts.",
    "Eseguire l'Attach Dogfooding su /Users/stequar/fitness_project verificando la creazione di AGENTS.md.bak, l'idempotenza e il passaggio di `agentic-company doctor`."
  ],
  "sources": [
    "https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback",
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled",
    "https://docs.pydantic.dev/latest/concepts/models/#model-configuration",
    "https://docs.pydantic.dev/latest/concepts/fields/#field-aliases",
    "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/",
    "https://developer.apple.com/documentation/swift/sendable",
    "https://developer.apple.com/documentation/swift/codingkey"
  ],
  "validatedAt": "2026-10-16T12:00:00.000Z"
}
```

---

## 🎯 Direttive Operative per la Fase BUILD (Leaf Developers L3)

1. **Ticket TCK-3.1: Environment Doctor (`src/doctor/health.ts` & `src/contracts/doctor.ts`):**
   - Definire gli schemi Zod per il report diagnostico in `src/contracts/doctor.ts`.
   - Implementare controlli per:
     - `git`: esecuzione di `git --version`, regex `git version (\S+)`.
     - `python3`: esecuzione di `python3 --version`. Se presente directory `.venv`, verificare anche `.venv/bin/python`.
     - `swiftc`: esecuzione di `swiftc --version` su mac/linux, estrazione della versione Swift.
     - `docker`: esecuzione di `docker info --format '{{.ServerVersion}}'` con timeout controllato a 3.000 ms.
   - Rendere tutti i check asincroni e aggregarli con `Promise.allSettled`.
   - Formattare l'output console con icone Chalk e supportare il flag `--json`.
2. **Ticket TCK-3.3: Cross-Domain Contract Generator (`src/sync/contract-sync.ts`):**
   - Ricevere un oggetto conforme a `ApiContractSchema`.
   - Generare il file `schemas.py`:
     - Import di `BaseModel`, `ConfigDict`, `Field`, `Optional`, `List`, `datetime`, `UUID`.
     - `model_config = ConfigDict(populate_by_name=True, from_attributes=True)`.
     - Campi `snake_case` con alias camelCase (`Field(..., alias="...")`).
   - Generare il file `Models.swift`:
     - Protocolli `Codable, Sendable, Hashable`.
     - Proprietà in `camelCase`.
     - Enum `nonisolated private enum CodingKeys: String, CodingKey` con binding a `snake_case`.
3. **Ticket TCK-3.2: Live Attach Dogfooding (`/Users/stequar/fitness_project`):**
   - Eseguire prima `inspect` e `doctor` per verificare l'ambiente.
   - Eseguire `attach --dry-run /Users/stequar/fitness_project` per confermare le azioni.
   - Eseguire `attach /Users/stequar/fitness_project` verificando:
     - Preservazione di `AGENTS.md` originale in `AGENTS.md.bak`.
     - Iniezione della governance OS (`.agents/`, `docs/wiki/`).
     - Seconda esecuzione con status `SKIPPED_UNCHANGED` su tutti i file (idempotenza SHA-256).
4. **Gatekeeper Deterministico:**
   - Tutti i nuovi moduli devono essere coperti da test unitari con Vitest.
   - Prima di chiudere lo sprint, `npm run typecheck` e `npm test` devono passare con il 100% di esito positivo e zero errori.
