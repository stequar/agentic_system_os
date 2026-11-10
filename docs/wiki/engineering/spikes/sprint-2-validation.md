# 🔬 Architectural Spike: Sprint 2 Tech Validation
**Sprint:** SPRINT-2 — Dynamic Role & Team Generator + Workspace Attach  
**Author:** Engineering Lead (Domain Lead L2)  
**Status:** VALIDATED & APPROVED  
**Verdict:** `APPROVED`  
**Schema Compliance:** [`TechValidationReportSchema`](file:///Users/stequar/Documents/agentic_company_os/src/contracts/research.ts)  
**Date:** 2026-10-15  

---

## 📋 Executive Summary

Questo dossier architetturale valida le scelte tecnologiche e i pattern operativi per lo **Sprint 2** ("Dynamic Role & Team Generator + Workspace Attach"). L'obiettivo dello sprint è abilitare l'Agentic Company OS a scansionare un repository eterogeneo (iOS Swift, Python FastAPI, TypeScript Fullstack, o poliglotto), generare dinamicamente la gerarchia di agenti con i relativi Domain Lead specializzati, ed eseguire il comando CLI `attach <target-path>` per iniettare l'harness di governance in modo sicuro, atomico e idempotente.

L'analisi tecnica e la ricerca condotta hanno esaminato tre aspetti critici:
1. **Motore di Generazione Prompt & Ruoli:** Scelta tra *TypeScript Typed Template Literals* vs motori esterni (*Handlebars*, *Mustache*, *EJS*), analizzando collisioni sintattiche con linguaggi target (Swift, Python, JSX, Tailwind) e rischi di sicurezza.
2. **Strategia di Iniezione File per `attach`:** Progettazione del pattern POSIX *Write-Sync-Rename*, backup preventivo non distruttivo (`.bak`) e verifica di idempotenza a costo zero I/O mediante hashing SHA-256.
3. **Architettura dei Prompt dei Domain Lead:** Strutturazione modulare a Kernel dei System Prompt conforme al principio di Andrej Karpathy *"Context as RAM"*, trasformando il prompt in un bootloader minimale che punta a memoria persistente (`docs/wiki/INDEX.md`) e contratti Zod.

Il verdetto architetturale è **`APPROVED`**.

---

## 🏛️ Valutazione delle Scelte Architetturali

### 1. Templating Engine: Typed Template Literals vs Motori Esterni (Handlebars / EJS)

#### Il Problema: Collisioni Sintattiche e HTML-Escaping nei Codebase Moderni
La generazione dinamica di ruoli e file di configurazione (`AGENTS.md`, prompt di sistema, regole di architettura) richiede di iniettare frammenti di codice e istruzioni per stack eterogenei:
- **Swift / SwiftUI:** L'interpolazione di stringhe in Swift usa la sintassi `\(variable)`. Le macro e i tipi generici fanno largo uso di parentesi angolari `<T>` e graffe `{}` per le closure.
- **Python / FastAPI:** Le f-strings in Python (`f"User: {user.name}"`) e i dizionari usano le parentesi graffe `{}`. Se il template del prompt deve mostrare esempi di codice Python, qualsiasi motore che usa doppie graffe (`{{...}}`) interpreta tali blocchi come espressioni da risolvere, sollevando eccezioni a runtime a meno di pesanti escape `{{{{raw}}}}...{{{{/raw}}}}`.
- **React / JSX / Tailwind:** In JSX l'iniezione di props o stili inline (`style={{ minHeight: '100%' }}`) e le varianti arbitrarie di Tailwind (`w-[calc(100%-2rem)]`, `[&[data-state=open]]:bg-blue-500`) collidono apertamente con i parser basati su regex o tag.
- **HTML-Escaping Trap (Handlebars/Mustache):** I motori come Handlebars nascono per la generazione di HTML e applicano automaticamente l'escape a caratteri come `<`, `>`, `&`. In un prompt LLM, questo corrompe i tag XML di delimitazione contesto (`<context>`, `<rules>`) in `&lt;context&gt;` e i tipi generici (`Promise<void>` in `Promise&lt;void&gt;`). Disabilitare l'escape con le triple graffe (`{{{...}}}`) rimuove ogni sanitizzazione ed espone l'agente a **Structural Role Injection** se variabili arbitrarie contengono demarcatori come `###` o `[INST]`.

#### La Soluzione: TypeScript Typed Template Literals (Pure Functional Builders)
L'approccio raccomandato consiste nell'utilizzare funzioni pure in TypeScript che sfruttano i **Tagged Template Literals** e i **Template Literal Types** nativi del linguaggio:
- **Type-Safety Assoluta:** I parametri del generatore sono tipizzati tramite gli schemi Zod (es. `ProjectStackSchema`). Se un campo del modello cambia o manca, il compilatore TypeScript solleva un errore a tempo di build (`npm run typecheck`), prevenendo bug a runtime.
- **Zero Collisioni Sintattiche:** L'interpolazione avviene esclusivamente nei punti designati tramite `${expression}` a livello JavaScript. Qualsiasi sequenza di caratteri `{{...}}`, `\(...)`, `f"{...}"` o classi Tailwind nel corpo della stringa rimane inalterata come testo puro.
- **Zero Dipendenze Esterne:** Nessuna libreria di terze parti da aggiungere al bundle (`node_modules`), azzerando vulnerabilità storiche di prototype pollution tipiche dei compilatori AST di Handlebars (es. CVE-2021-23369).
- **Zero Overhead a Runtime:** Nessun parsing AST né compilazione di template a runtime; la concatenazione di stringhe nativa di V8 è istantanea.

---

### 2. Strategia di Iniezione File Atomica e Sicura (`attach`)

#### Il Problema: Rischio di Corruzione e Perdita di Dati
Il comando `agentic-company attach <target-path>` inietta la struttura aziendale (`AGENTS.md`, `docs/wiki/`, directory di governance) in un repository bersaglio. Se il processo viene interrotto (SIGINT, crash, fine dello spazio su disco), un'operazione di scrittura convenzionale (`fs.writeFile`) può lasciare file parziali o troncati a 0 byte. Inoltre, sovrascrivere file esistenti senza backup rischia di cancellare istruzioni personalizzate configurate dall'utente.

#### La Soluzione: Il Pattern POSIX Write-Sync-Rename + Backup `.bak` + Idempotenza SHA-256

```
[ Target File ] ──► Esiste già?
       │
       ├──► SI ──► SHA-256 identico al nuovo contenuto?
       │             ├──► SI: [ SKIPPED_UNCHANGED ] (Idempotente, nessun I/O su disco)
       │             └──► NO: Backup preventivo su <target>.bak
       │
       └──► NO ──► Procedi alla scrittura
                     │
                     ▼
       1. Scrittura su Sibling Temp File (.<target>.tmp.<pid>.<timestamp>)
       2. fsync esplicito del file descriptor (fileHandle.sync())
       3. Chiusura del descrittore
       4. POSIX fs.rename() atomico sulla destinazione
       5. Cleanup garantito in blocco `try ... finally`
```

1. **Sibling Temporary File:** Il file temporaneo DEVE essere creato nella stessa cartella del file di destinazione (con nome nascosto es. `.${filename}.tmp.${process.pid}.${Date.now()}`). Questo garantisce che file temporaneo e file target risiedano sullo stesso filesystem/partizione fisica: condizione vincolante affinché la chiamata di sistema `rename` sia atomica secondo lo standard POSIX.
2. **Durabilità tramite `fsync`:** Scrivere un file in Node.js trasferisce i dati nei buffer di pagina del kernel (RAM). Prima di rinominare il file, è obbligatorio invocare `fileHandle.sync()`. Questo forza il flush dei buffer fisici sul disco (storage non volatile), impedendo la creazione di file corrotti o a 0 byte in caso di blackout o freeze.
3. **Atomic Rename (`fs.rename`):** L'operazione `rename` di POSIX sostituisce atomicamente il file di destinazione; nessun processo concorrente potrà mai osservare uno stato intermedio o parziale.
4. **Backup Preventivo (`.bak`):** Se il file target esiste già e il suo contenuto differisce dal nuovo payload, viene creata una copia di sicurezza `target.bak` (o timestamped) prima di sovrascriverlo.
5. **Idempotenza tramite SHA-256:** Prima di qualsiasi operazione di I/O, viene calcolato l'hash SHA-256 del buffer di memoria e confrontato con quello del file esistente. Se gli hash coincidono, l'operazione restituisce immediatamente lo status `SKIPPED_UNCHANGED`, preservando gli inode e i timestamp di modifica (`mtime`).

---

### 3. Architettura Modulare dei Prompt dei Domain Lead & "Context as RAM"

#### Il Principio di Karpathy: "Context as RAM"
Andrej Karpathy ha formulato la metafora fondamentale per l'ingegneria dei sistemi agentici:
> *"The context window of an LLM is like RAM; the external filesystem and docs are like persistent Hard Disk. You should never load the entire hard disk into RAM on boot."*

Nei sistemi agentici ingenui, i prompt di sistema tendono a diventare monolitici: si inietta l'intera documentazione aziendale, decine di regole e ampi stralci di codice. Questo produce il fenomeno del **Prompt Bloating**, che degrada l'attenzione del modello ("Lost in the Middle"), incrementa drasticamente i costi di inferenza e moltiplica le allucinazioni.

#### Architettura a Kernel per i Domain Lead L2
Per Agentic Company OS, ogni prompt generato dinamicamente è progettato come un **Kernel Minimalista**:
1. **Core Governance Kernel (Invariante):**
   - Ruolo e Livello Gerarchico (Domain Lead L2).
   - Autorità e Linea di Comando: risponde al CTO, non scrive codice atomico ma delega ai programmatori specializzati L3.
   - Fail Loudly & Gatekeeper: obbligo di rifiutare merge se `typecheck` e comandi di test falliscono.
2. **Persistent Memory Pointers (Bootloader verso docs/wiki/):**
   - Nessun testo di documentazione o backlog duplicato nel prompt.
   - Puntamento esplicito: *"Per il backlog operativo consulta atomicamente [`docs/wiki/product/backlog.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/product/backlog.md). Per l'architettura consulta l'indice [`docs/wiki/INDEX.md`](file:///Users/stequar/Documents/agentic_company_os/docs/wiki/INDEX.md). Carica solo i file necessari al ticket."*
3. **Zod Contracts Pointers:**
   - I Domain Lead non ricevono JSON schemas nel prompt ma puntano a `src/contracts/` per validare le interfacce con Zod.
4. **Stack-Aware Gatekeeper Commands (Dinamici):**
   - Generati dall'Inspector:
     - Stack iOS/macOS (`swift`): `swift test`
     - Stack Python (`python`, `fastapi`): `pytest` (o `poetry run pytest`)
     - Stack Node/TS (`typescript`): `npm run typecheck && npm test`
5. **L3 Leaf Developer Delegation Template:**
   - Istruzioni tassative con cui il Lead L2 deve istituire i Leaf Developers: `enable_subagent_tools: false`, `enable_write_tools: true`, perimetro atomico ristretto ai soli file del ticket, obbligo di eseguire i test locali prima di completare la sessione.

---

## 📊 Matrice di Benchmark & Analisi Strumenti

| Strumento | Categoria | Pros | Cons | Raccomandazione |
| :--- | :--- | :--- | :--- | :--- |
| **TypeScript Typed Template Literals** | Code & Prompt Generation | Type-safe al 100%, zero overhead runtime, zero collisioni con Swift/Python/JSX/Tailwind, nessun escape HTML indesiderato, zero dipendenze. | Logica complessa gestita con funzioni TS anziché file di template dichiarativi. | **`adopt`** |
| **Handlebars.js / Mustache** | Templating Engine | File `.hbs` separati, noto nel templating HTML classico. | Escape HTML di default (rompe XML e generics `<T>`), gravi collisioni con Python f-strings e JSX, vulnerabilità di sicurezza storiche. | **`avoid`** |
| **EJS (Embedded JavaScript)** | Templating Engine | Esegue codice JS nei tag `<% %>`. | Esecuzione dinamica a runtime con rischi injection, sintassi verbosa, assenza di type safety statica. | **`avoid`** |
| **Native Node.js Write-Sync-Rename (`node:fs/promises`)** | Atomic I/O & Scaffolding | Zero dipendenze, atomicità POSIX garantita da `fs.rename`, durabilità garantita da `fileHandle.sync()`, piena integrazione con `node:crypto`. | Richiede gestione del cleanup in blocco `try...finally`. | **`adopt`** |
| **`write-file-atomic`** | Atomic I/O & Scaffolding | Battle-tested (libreria interna npm), gestione permessi POSIX avanzati. | Dipendenza esterna, non supporta backup `.bak` né hash SHA-256 nativi. | **`evaluate`** |

---

## 🛡️ Matrice Rischi e Mitigazioni

| Rischio Identificato | Impatto | Strategia di Mitigazione |
| :--- | :---: | :--- |
| **Collisioni Sintattiche nei Prompt Generati** | **Alto** | Utilizzo esclusivo di Typed Template Literals in TypeScript con interpolazione esplicita `${...}`, evitando parsing di graffe o caratteri speciali. |
| **Corruzione Parziale o Scrittura a 0 Byte (`attach`)** | **Critico** | Implementazione del pattern atomico POSIX Write-Sync-Rename con `fileHandle.sync()` obbligatorio prima del rename e cleanup su eccezione. |
| **Sovrascrittura Accidentale di Modifiche Utente** | **Alto** | Backup preventivo non distruttivo (`.bak`) per ogni file modificato e controllo di idempotenza a costo zero con hash SHA-256. |
| **Prompt Bloating & Allucinazioni nei Domain Lead** | **Alto** | Aderenza al principio Karpathy "Context as RAM": System Prompt ridotto a Kernel minimale con puntamento a `docs/wiki/INDEX.md` e contratti Zod. |
| **Disallineamento Stack e Gatekeeper** | **Medio** | Derivazione deterministica del comando di test dall'oggetto `ProjectStack` tipizzato restituito dall'Inspector (`detectProjectStack`). |

---

## 📑 Report Strutturato Zod (`TechValidationReportSchema`)

```json
{
  "sprintId": "SPRINT-2",
  "sprintTheme": "Dynamic Role & Team Generator + Workspace Attach",
  "executiveSummary": "Tech Validation Spike per lo Sprint 2 focalizzato su tre direttrici architetturali: (1) Selezione di TypeScript Typed Template Literals come motore di generazione prompt e ruoli, scartando motori esterni (Handlebars/EJS) per azzerare rischi di collisione sintattica (Swift, Python, JSX, Tailwind) ed evitare HTML-escaping accidentale; (2) Strategia di iniezione file atomica per il comando attach basata sul pattern POSIX Write-Sync-Rename su file temporaneo sibling con fsync, backup preventivo .bak su file modificati e idempotenza verificata tramite hashing SHA-256; (3) Architettura modulare dei prompt dei Domain Lead allineata al principio Karpathy Context-as-RAM (System Prompt come bootloader minimale e progressivo caricamento atomico da docs/wiki/INDEX.md). Verdetto finale: APPROVED.",
  "proposedDecisions": [
    "Adozione esclusiva di Typed Template Literals in puro TypeScript (src/generator/templates/) per la generazione di prompt, configurazioni dei ruoli e file AGENTS.md, respingendo dipendenze esterne come Handlebars o EJS.",
    "Implementazione del pattern atomico POSIX Write-Sync-Rename in src/utils/fs-atomic.ts (scrittura su file temporaneo sibling .<target>.tmp.<pid>.<timestamp>, fsync esplicito tramite fileHandle.sync(), rename atomico finale).",
    "Adozione del meccanismo di backup preventivo (.bak) per ogni file esistente prima della sovrascrittura, evitando perdite di configurazioni utente personalizzate.",
    "Idempotenza garantita al 100% nel comando attach tramite confronto hash SHA-256 tra contenuto generato e file su disco (status SKIPPED_UNCHANGED se identici).",
    "Standardizzazione dell'architettura dei prompt dei Domain Lead secondo il principio di Karpathy Context-as-RAM: System Prompt minimale (Core Kernel L2), puntatori atomici a docs/wiki/INDEX.md, puntatori a contratti Zod (src/contracts/), comandi di test deterministici e template di delega L3 restrittivo."
  ],
  "benchmarksAndTools": [
    {
      "name": "TypeScript Typed Template Literals & Functional Builders",
      "category": "Templating & Code Generation",
      "url": "https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html",
      "pros": [
        "100% Type-Safety a compile-time integrata con Zod e TypeScript",
        "Zero dipendenze esterne (nessun rischio supply-chain né CVE di prototype pollution)",
        "Nessuna collisione sintattica con Swift \\(...), Python f\"{...}\", JSX {props} e sintassi arbitraria Tailwind",
        "Nessun HTML escaping automatico indesiderato (preservazione intatta di generics <T> e tag XML)",
        "Refactoring assistito da IDE e zero overhead di compilazione AST a runtime"
      ],
      "cons": [
        "Richiede logica TypeScript/JavaScript per costrutti complessi (loops, conditionals) anziché sintassi dichiarativa da file esterno"
      ],
      "recommendation": "adopt",
      "notes": "Soluzione ottimale per Agentic Company OS. Massima robustezza, manutenibilità e prestazioni."
    },
    {
      "name": "Handlebars.js / Mustache",
      "category": "Templating Engine",
      "url": "https://handlebarsjs.com/",
      "pros": [
        "Sintassi template dichiarativa basata su file .hbs",
        "Ampiamente diffuso per templating HTML tradizionale"
      ],
      "cons": [
        "HTML-escaping attivo di default: trasforma <T> in &lt;T&gt;, corrompendo generic types e tag XML di prompt",
        "Disabilitare l'escape con {{{...}}} apre a rischi critici di Structural Role Injection nei prompt",
        "Gravi collisioni sintattiche con Python f-strings f\"{var}\", dizionari, JSX style={{...}} e Vue/Angular",
        "Dipendenza esterna pesante e storico di falle di sicurezza (prototype pollution CVE-2021-23369)",
        "Nessuna garanzia sui tipi delle variabili iniettate a tempo di compilazione"
      ],
      "recommendation": "avoid",
      "notes": "Scartato formalmente: inadatto a codebase poliglotti e a prompt engineering avanzato."
    },
    {
      "name": "EJS (Embedded JavaScript)",
      "category": "Templating Engine",
      "url": "https://ejs.co/",
      "pros": [
        "Esegue JavaScript inline nei tag <% %>"
      ],
      "cons": [
        "Richiede compilazione dinamica a runtime assimilabile a eval(), con rischio RCE in caso di input untrusted",
        "Sintassi invadente e incline a typo a runtime",
        "Nessun type checking statico né integrazione nativa con Zod",
        "Aggiunge dipendenze esterne non necessarie"
      ],
      "recommendation": "avoid",
      "notes": "Scartato: viola le best practice di sicurezza e zero-dependency del core engine."
    },
    {
      "name": "Native Node.js Write-Sync-Rename (node:fs/promises)",
      "category": "Atomic File Operations",
      "url": "https://nodejs.org/api/fs.html",
      "pros": [
        "Zero dipendenze esterne, massima portabilità su Node.js 20+",
        "Garantisce atomicità POSIX mediante fs.rename() su file temporanei sibling (stesso filesystem)",
        "Durabilità assoluta grazie a fileHandle.sync() (fsync del descrittore prima della chiusura)",
        "Integrazione diretta con node:crypto per calcolo hash SHA-256 e idempotenza",
        "Gestione sicura degli errori e cleanup dei file temporanei residui in blocco finally"
      ],
      "cons": [
        "Richiede implementazione manuale accurata e test unitari esaustivi per gestire i casi limite"
      ],
      "recommendation": "adopt",
      "notes": "Soluzione preferita: implementare src/utils/fs-atomic.ts con test unitari completi."
    },
    {
      "name": "write-file-atomic",
      "category": "Atomic File Operations",
      "url": "https://github.com/npm/write-file-atomic",
      "pros": [
        "Libreria battle-tested manutenuta dal team npm",
        "Gestione nativa di permessi e ownership (chown/chmod)"
      ],
      "cons": [
        "Dipendenza esterna aggiuntiva",
        "Non include il pattern di backup preventivo .bak né l'hashing SHA-256 per l'idempotenza"
      ],
      "recommendation": "evaluate",
      "notes": "Valutata come valida opzione di fallback solo se emergessero incompatibilità con filesystem specifici."
    }
  ],
  "bestPractices": [
    "Prompt as Code: I prompt e le configurazioni dei ruoli devono essere funzioni TypeScript pure e tipizzate, validando gli argomenti contro gli schemi Zod (ProjectStackSchema, GeneratedRoleSchema).",
    "Pattern Sibling Temp File: Posizionare sempre il file temporaneo nella directory genitrice della destinazione (es. .<file>.tmp.<pid>.<timestamp>) per garantire che sorgente e destinazione risiedano sullo stesso filesystem, precondizione necessaria per l'atomic rename.",
    "Durabilità tramite fsync: Invocare fileHandle.sync() prima della chiusura del file temporaneo per assicurare la persistenza su disco fisico contro crash di sistema o mancate alimentazioni.",
    "Idempotenza basata su SHA-256: Calcolare preventivamente l'hash del file esistente e confrontarlo con il payload target. Se identici, interrompere l'operazione con status SKIPPED_UNCHANGED senza toccare timestamp o inode.",
    "Backup Preventivo Non-Distruttivo: Creare una copia con suffisso .bak prima di modificare qualsiasi file preesistente nel workspace dell'utente.",
    "Principio Karpathy Context as RAM: Progettare i System Prompt dei Domain Lead come Bootloader/Kernel minimali. Nessun file sorgente o documento corposo nel prompt; solo identità gerarchica, puntatore a docs/wiki/INDEX.md, puntatori ai contratti Zod e regole di delega L3.",
    "Progressive Disclosure: I subagenti devono caricare documentazione e contratti in maniera atomica e puntuale secondo il principio di 'Context as RAM', evitando prompt bloating.",
    "Gatekeeper Deterministico Stack-Aware: Configurare il comando di test del Domain Lead derivandolo univocamente dal campo testCommand di ProjectStack (es. swift test, pytest, npm test)."
  ],
  "risksAndMitigations": [
    {
      "risk": "Collisioni sintattiche o corruzione del codice generato da parte di motori di template tradizionali.",
      "impact": "high",
      "mitigation": "Adozione esclusiva di Typed Template Literals in TypeScript, immuni a collisioni con caratteri speciali (Swift \\(...), Python f-strings, JSX {props}, Tailwind)."
    },
    {
      "risk": "Corruzione parziale o scrittura a 0 byte dei file di governance in caso di crash o kill del processo durante il comando attach.",
      "impact": "critical",
      "mitigation": "Applicazione del pattern Write-Sync-Rename atomico con fsync obbligatorio sul file temporaneo sibling e cleanup in blocco finally."
    },
    {
      "risk": "Perdita di configurazioni personalizzate dell'utente in seguito a sovrascritture non controllate durante attach.",
      "impact": "high",
      "mitigation": "Creazione sistematica di backup .bak prima della sovrascrittura e controllo di idempotenza tramite hash SHA-256."
    },
    {
      "risk": "Prompt Bloating e allucinazioni dei Domain Lead causati da system prompt monolitici sovradimensionati.",
      "impact": "high",
      "mitigation": "Architettura Context-as-RAM: System Prompt ristretto a Kernel/Bootloader con link a docs/wiki/INDEX.md e contratti Zod, lasciando l'esplorazione a caricamenti atomici."
    },
    {
      "risk": "Disallineamento tra lo stack tecnologico rilevato e i comandi di verifica eseguiti dai Lead e dai Leaf Devs.",
      "impact": "medium",
      "mitigation": "Accoppiamento tipizzato tra ProjectStack e Gatekeeper, ereditando testCommand validato da Zod per l'esecuzione dei controlli automatici."
    }
  ],
  "verdict": "APPROVED",
  "finalRecommendations": [
    "Approvare formalmente l'architettura dello Sprint 2 e procedere alle fasi SPECIFY e DELEGATE.",
    "Creare il file src/utils/fs-atomic.ts implementando atomicWriteFile con supporto a fsync, backup .bak e hash SHA-256.",
    "Definire i contratti Zod dei ruoli e dell'attach in src/contracts/roles.ts (GeneratedRoleSchema, RolePromptTemplateSchema, AttachOptionsSchema, AttachResultSchema).",
    "Implementare src/generator/roles.ts tramite TypeScript Template Builders componibili per Swift, Python/FastAPI e TypeScript/Fullstack.",
    "Implementare src/attach/injector.ts e registrare il comando attach nella CLI (src/index.ts).",
    "Scrivere una suite di test esaustiva in tests/fs-atomic.test.ts, tests/roles-generator.test.ts e tests/attach.test.ts con copertura di atomicità, idempotenza e backup."
  ],
  "sources": [
    "https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html",
    "https://nodejs.org/api/fs.html#filehandlesync",
    "https://lwn.net/Articles/457667/",
    "https://github.com/npm/write-file-atomic",
    "https://arxiv.org/abs/2403.14789",
    "https://twitter.com/karpathy/status/1707437820049981697"
  ],
  "validatedAt": "2026-10-15T20:07:30.000Z"
}
```

---

## 🎯 Direttive Operative per la Fase BUILD (Leaf Developers L3)

1. **Ticket TCK-2.1 (`src/generator/roles.ts`):**
   - Creare i generatori di prompt e ruoli come pure functions tipizzate.
   - Non introdurre Handlebars o EJS.
   - Strutturare i Domain Lead con sezioni chiare: Identità L2, puntatori a `docs/wiki/INDEX.md`, puntatori ai contratti Zod, comando test e regole di delega L3.
2. **Ticket TCK-2.2 (`src/attach/injector.ts` & `src/utils/fs-atomic.ts`):**
   - Utilizzare `node:fs/promises` e `node:crypto`.
   - Garantire la creazione di file temporanei nella stessa cartella (`path.dirname(target)`), invocare `fileHandle.sync()`, chiudere il descriptor e invocare `rename`.
   - In caso di file esistente con contenuto differente, copiare su `.bak` prima della sovrascrittura.
   - Calcolare l'hash SHA-256 del buffer di destinazione per garantire l'idempotenza.
3. **Gatekeeper Deterministico:**
   - Ogni modulo deve essere coperto da test unitari con Vitest.
   - Prima della conclusione dello sprint, `npm run typecheck` e `npm test` devono passare con il 100% di esito positivo.
