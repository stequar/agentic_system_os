import { buildCoreKernelPrompt, type CoreKernelOptions } from "./core-kernel.js";

/**
 * Regole specializzate per Swift / SwiftUI / MVVM
 */
export const SWIFT_MVVM_RULES = [
  "Architettura MVVM rigorosa: le View SwiftUI devono rimanere puramente dichiarative e reattive; tutta la logica di business e la mutazione di stato appartengono ai ViewModel (@Observable o ObservableObject con @Published).",
  "Gestione della memoria: impiega rigorosamente [weak self] all'interno di closures asincrone, escaping o delegati per prevenire retain cycles e memory leaks nell'ambiente ARC.",
  "Swift Concurrency moderna: adotta async/await, Task, structured concurrency e annota i ViewModel con @MainActor per garantire l'accesso safe al thread UI. I tipi scambiati tra confini asincroni devono conformarsi a Sendable.",
  "Dependency Injection & Modularità: inietta i Service e i Client di rete/storage nei ViewModel mediante protocolli, facilitando l'isolamento nei test.",
  "Unit Testing: mantieni suite di test complete con 'swift test' (utilizzando XCTest o il moderno framework Swift Testing) per validare la logica di business e gli stati del ViewModel senza dipendenze UI.",
];

/**
 * Regole specializzate per Kotlin Multiplatform (KMP)
 */
export const KMP_RULES = [
  "Separazione Source Sets in KMP: organizza la codebase in commonMain/commonTest per la logica di business condivisa agnostica dalla piattaforma e platform-specific sets (androidMain, iosMain) per binding nativi.",
  "Meccanismo Expect / Actual: dichiara contratti expect in commonMain e fornisci implementazioni actual atomiche per ciascun target nativo supportato.",
  "Concorrenza asincrona con Coroutine: sfrutta kotlinx.coroutines, StateFlow e SharedFlow per una gestione deterministica e reattiva dello stato asincrono.",
];

/**
 * Regole specializzate per Flutter / Dart
 */
export const FLUTTER_RULES = [
  "Widget Tree dichiarativo: separa nettamente i componenti immutabili StatelessWidget dai widget con stato transitorio StatefulWidget.",
  "State Management deterministico e disaccoppiato: adotta framework collaudati (Riverpod, BLoC o Provider) disaccoppiando completamente lo stato dalla gerarchia dei widget UI.",
  "Sound Null Safety nativa: rispetta i controlli di null safety del compilatore Dart senza ricorrere a forzature operatore '!' non sicure.",
  "Test automatizzati con Flutter Test: garantisci la copertura di unit test, widget test e golden test tramite 'flutter test'.",
];

/**
 * Regole specializzate per Python / FastAPI / Pydantic
 */
export const PYTHON_FASTAPI_RULES = [
  "Architettura asincrona nativa: utilizza 'async def' per tutti gli handler di route I/O-bound (interazioni database, client HTTP, chiamate a servizi esterni) per massimizzare il throughput.",
  "Tipizzazione e validazione rigorosa con Pydantic: modella ogni payload di richiesta, query params e risposta tramite schemi Pydantic v2 fortemente tipizzati.",
  "Modularità a router e Dependency Injection: organizza gli endpoint in APIRouter isolati per dominio e sfrutta il sistema 'Depends' di FastAPI per database session, autenticazione e configurazioni.",
  "Error handling standardizzato: genera eccezioni HTTP semantiche (HTTPException) con status code appropriati e payload di errore strutturati; evita 'except Exception: pass'.",
  "Testing asincrono con pytest: valida le API mediante 'pytest' e 'httpx.AsyncClient', garantendo l'isolamento dei dati e il mock appropriato delle dipendenze esterne.",
];

/**
 * Regole specializzate per TypeScript / React
 */
export const TYPESCRIPT_REACT_RULES = [
  "Strict Typing assoluto: mantieni TypeScript in strict mode ('strict: true'), vieta categoricamente l'uso di 'any' e prediligi union types discriminati per modellare gli stati UI (loading, success, error).",
  "Architettura a componenti atomici: sviluppa componenti funzionali puri, componibili e incapsulati; separa nettamente i componenti di presentazione pura da quelli con gestione di stato.",
  "Disciplina dei React Hooks: rispetta rigidamente le regole degli Hooks (rules-of-hooks, exhaustive-deps); estrai logiche di stato complesse in custom hooks riutilizzabili e testabili.",
  "Performance e Rendering: applica useMemo e useCallback con parsimonia solo in presenza di computazioni pesanti o per preservare l'identità referenziale di callback critiche.",
  "Validazione e Test: convalida la correttezza del codice eseguendo 'npm test' (Vitest o Jest con React Testing Library) e verificando l'assenza di errori di compilazione con 'tsc --noEmit'.",
];

/**
 * Regole specializzate per Go (goroutines, explicit errors, standard layout)
 */
export const GO_MANAGER_RULES = [
  "Concorrenza con goroutine e canali: sincronizzazione deterministica tramite sync.WaitGroup, canali tipizzati e context.Context per la propagazione di timeout e cancellazione.",
  "Gestione esplicita degli errori: adotta il pattern idiomatico 'if err != nil { return fmt.Errorf(...) }' con error wrapping semantico (%w); divieto di 'panic' in librerie o codice di produzione.",
  "Architettura idiomatica Go: organizza il progetto secondo il layout standard (cmd/, internal/, pkg/), favorendo interfacce minime implementate implicitamente.",
  "Zero Memory Leaks: chiudi sempre le risorse con 'defer resp.Body.Close()', 'defer cancel()' e assicurati che ogni goroutine creata abbia una condizione di uscita deterministica.",
  "Test deterministici e Benchmark: valida il codice con 'go test ./...' includendo il flag '-race' per il rilevamento di data race concorrenti e bench per le performance critiche.",
];

/**
 * Regole specializzate per Rust (ownership, borrow checker, zero unsafe, Result/Option)
 */
export const RUST_MANAGER_RULES = [
  "Ownership, Borrowing e Lifetime: rispetta rigidamente le regole del borrow checker (&T immutabile condiviso vs &mut T mutabile esclusivo) per garantire memory safety a compile-time senza garbage collector.",
  "Zero Unsafe: divieto categorico di utilizzare blocchi 'unsafe' salvo casi eccezionali con documentazione formale delle invarianti di sicurezza e approvazione L2.",
  "Pattern Matching esaustivo su Result e Option: gestisci tutti gli errori e i valori opzionali in modo esplicito (match, if let o operatore ?); vieta l'uso di .unwrap() in codice di produzione.",
  "Zero-Cost Abstractions & Tratti: sfrutta il sistema dei trait (Clone, Copy, Send, Sync) e i generics monomorfizzati per massimizzare le prestazioni a runtime a zero overhead.",
  "Gatekeeper e Clippy: mantieni la conformità assoluta ai test con 'cargo test' e applica il linter con 'cargo clippy -- -D warnings' a zero warning tollerati.",
];

/**
 * Regole per Lead Engineer generico/fallback
 */
export const LEAD_ENGINEER_RULES = [
  "Principi SOLID e Clean Architecture: progetta moduli coesi, a basso accoppiamento e con contratti tipizzati ben definiti.",
  "Deterministic Gatekeeper: accerta che ogni commit superi l'intera suite di verifiche automatizzate (compilazione, linter e test).",
  "Integrazione di Sistema: coordina e supervisiona l'interoperabilità tra i diversi moduli, servizi e tecnologie dell'ecosistema aziendale.",
  "Delega Atomica: scompone feature complesse in ticket chirurgici per Leaf Developers L3 con perimetro chiaro e file target determinati.",
];

/**
 * Costruisce il system prompt per il Mobile Manager (L2, Swift/SwiftUI, KMP, Flutter)
 */
export function buildMobileManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const targetLangs = overrides?.targetLanguages ?? ["swift"];
  const targetFws = overrides?.targetFrameworks ?? ["swiftui"];

  const combinedRules = [...SWIFT_MVVM_RULES];
  if (targetLangs.includes("kotlin") || targetFws.includes("kmp")) {
    combinedRules.push(...KMP_RULES);
  }
  if (targetLangs.includes("dart") || targetFws.includes("flutter")) {
    combinedRules.push(...FLUTTER_RULES);
  }

  const options: CoreKernelOptions = {
    roleId: "mobile_manager",
    roleName: "Mobile Engineering Lead",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dell'architettura mobile (iOS/macOS Swift/SwiftUI, Kotlin Multiplatform KMP, Flutter/Dart), pattern reattivi, gestione della memoria e qualità del software client.",
    targetLanguages: targetLangs,
    targetFrameworks: targetFws,
    recommendedTestCommand: overrides?.recommendedTestCommand ?? "swift test",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: combinedRules,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}

/**
 * Costruisce il system prompt per il Backend Manager (L2, Python/FastAPI, async/Pydantic)
 */
export function buildBackendManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const options: CoreKernelOptions = {
    roleId: "backend_manager",
    roleName: "Backend Engineering Lead",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dei servizi backend Python/FastAPI, architettura asincrona non bloccante, validazione dati con Pydantic, dependency injection e API design robusto.",
    targetLanguages: ["python"],
    targetFrameworks: ["fastapi"],
    recommendedTestCommand: "pytest",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: PYTHON_FASTAPI_RULES,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}

/**
 * Costruisce il system prompt per il Frontend Manager (L2, TypeScript/React, hooks/typecheck)
 */
export function buildFrontendManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const options: CoreKernelOptions = {
    roleId: "frontend_manager",
    roleName: "Frontend Engineering Lead",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dell'interfaccia utente React/TypeScript, component architecture atomica, custom hooks, tipizzazione strict e pipeline di test e typecheck.",
    targetLanguages: ["typescript"],
    targetFrameworks: ["react"],
    recommendedTestCommand: "npm test",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: TYPESCRIPT_REACT_RULES,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}

/**
 * Costruisce il system prompt per il Go Manager (L2, Go, goroutine/canali, explicit error handling)
 */
export function buildGoManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const options: CoreKernelOptions = {
    roleId: "go_manager",
    roleName: "Go Engineering Lead",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dell'architettura dei servizi Go, concorrenza nativa con goroutine e canali, gestione esplicita degli errori, layout idiomatico a package e pipeline deterministiche.",
    targetLanguages: ["go"],
    targetFrameworks: overrides?.targetFrameworks ?? [],
    recommendedTestCommand: "go test ./...",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: GO_MANAGER_RULES,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}

/**
 * Costruisce il system prompt per il Rust Systems Lead (L2, Rust, borrow checker, memory safety, zero unsafe)
 */
export function buildRustManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const options: CoreKernelOptions = {
    roleId: "rust_manager",
    roleName: "Rust Systems Lead",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dell'architettura dei sistemi Rust, garanzie matematiche di memory safety, borrow checker, zero unsafe, astrazioni a costo zero e Deterministic Gatekeeper rigoroso.",
    targetLanguages: ["rust"],
    targetFrameworks: overrides?.targetFrameworks ?? [],
    recommendedTestCommand: "cargo test",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: RUST_MANAGER_RULES,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}

/**
 * Costruisce il system prompt per il Lead Engineer (L2 fallback / generico)
 */
export function buildLeadEngineerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const options: CoreKernelOptions = {
    roleId: "lead_engineer",
    roleName: "Lead Systems Engineer",
    level: "L2",
    description:
      "Domain Lead L2 responsabile dell'architettura ingegneristica complessiva, coordinamento tecnico multi-linguaggio, standard di qualità e integrazione di sistema.",
    targetLanguages: overrides?.targetLanguages ?? ["generic"],
    targetFrameworks: overrides?.targetFrameworks ?? [],
    recommendedTestCommand: overrides?.recommendedTestCommand ?? "npm test",
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: LEAD_ENGINEER_RULES,
    ...overrides,
  };

  return buildCoreKernelPrompt(options);
}
