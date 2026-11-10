import { buildCoreKernelPrompt, type CoreKernelOptions } from "./core-kernel.js";

/**
 * Regole specializzate per Swift / SwiftUI / MVVM
 */
export const SWIFT_MVVM_RULES = [
  "Strict MVVM architecture: SwiftUI Views must stay purely declarative and reactive; all business logic and state mutation belong in ViewModels (@Observable or ObservableObject with @Published).",
  "Memory management: rigorously use [weak self] inside async/escaping closures and delegates to prevent retain cycles and memory leaks in the ARC environment.",
  "Modern Swift Concurrency: adopt async/await, Task, structured concurrency and annotate ViewModels with @MainActor to guarantee safe UI-thread access. Types crossing async boundaries must conform to Sendable.",
  "Dependency Injection & Modularity: inject network/storage Services and Clients into ViewModels via protocols, enabling test isolation.",
  "Unit Testing: keep comprehensive test suites with 'swift test' (XCTest or the modern Swift Testing framework) to validate business logic and ViewModel states without UI dependencies.",
];

/**
 * Regole specializzate per Kotlin Multiplatform (KMP)
 */
export const KMP_RULES = [
  "KMP Source Set separation: organize the codebase into commonMain/commonTest for shared platform-agnostic business logic and platform-specific sets (androidMain, iosMain) for native bindings.",
  "Expect / Actual mechanism: declare expect contracts in commonMain and provide atomic actual implementations for each supported native target.",
  "Asynchronous concurrency with Coroutines: leverage kotlinx.coroutines, StateFlow and SharedFlow for deterministic, reactive async state management.",
];

/**
 * Regole specializzate per Flutter / Dart
 */
export const FLUTTER_RULES = [
  "Declarative Widget Tree: cleanly separate immutable StatelessWidget components from transient-state StatefulWidget ones.",
  "Deterministic, decoupled State Management: adopt proven frameworks (Riverpod, BLoC or Provider), fully decoupling state from the UI widget hierarchy.",
  "Native Sound Null Safety: honor the Dart compiler's null-safety checks without resorting to unsafe '!' force-unwraps.",
  "Automated tests with Flutter Test: ensure unit-test, widget-test and golden-test coverage via 'flutter test'.",
];

/**
 * Regole specializzate per Python / FastAPI / Pydantic
 */
export const PYTHON_FASTAPI_RULES = [
  "Native async architecture: use 'async def' for all I/O-bound route handlers (database interactions, HTTP clients, external service calls) to maximize throughput.",
  "Strict typing and validation with Pydantic: model every request payload, query param and response via strongly-typed Pydantic v2 schemas.",
  "Router modularity and Dependency Injection: organize endpoints into domain-isolated APIRouters and leverage FastAPI's 'Depends' system for database sessions, authentication and configuration.",
  "Standardized error handling: raise semantic HTTP exceptions (HTTPException) with appropriate status codes and structured error payloads; avoid 'except Exception: pass'.",
  "Async testing with pytest: validate APIs via 'pytest' and 'httpx.AsyncClient', ensuring data isolation and proper mocking of external dependencies.",
];

/**
 * Regole specializzate per TypeScript / React
 */
export const TYPESCRIPT_REACT_RULES = [
  "Strict Typing: maintain TypeScript in strict mode ('strict: true'), forbid 'any', and prefer discriminated unions to model UI states (loading, success, error).",
  "Atomic Component Architecture: build pure, composable, encapsulated functional components; cleanly separate presentation components from stateful containers.",
  "React Hooks Discipline: strictly follow rules-of-hooks and exhaustive-deps; extract complex stateful logic into reusable, testable custom hooks.",
  "Rendering Performance: apply memoization judiciously for expensive computations or referential stability.",
  "Validation & Testing: verify correctness by running 'npm test' (Vitest or Jest) and ensuring zero compilation errors with 'tsc --noEmit'.",
];

/**
 * Specialized rules for Angular / TypeScript
 */
export const TYPESCRIPT_ANGULAR_RULES = [
  "Strict Typing: maintain TypeScript in strict mode ('strict: true') and Angular strictTemplates; forbid 'any' and enforce typed reactive forms and contracts.",
  "Signals & Reactive State: prefer Angular Signals (signal, computed, input, output) and ChangeDetectionStrategy.OnPush for deterministic, high-performance rendering.",
  "Standalone & Modular Architecture: organize features around Standalone Components, lazy-loaded routes, and injectable domain services with clear boundaries.",
  "RxJS Interop & Cleanup: manage asynchronous streams cleanly using takeUntilDestroyed or AsyncPipe/toSignal to prevent memory leaks.",
  "Validation & Testing: verify correctness using the repository's configured test runner (e.g. 'pnpm test' / Jest) and strict type checking.",
];

/**
 * Regole specializzate per Go (goroutines, explicit errors, standard layout)
 */
export const GO_MANAGER_RULES = [
  "Concurrency with goroutines and channels: deterministic synchronization via sync.WaitGroup, typed channels and context.Context for timeout and cancellation propagation.",
  "Explicit error handling: adopt the idiomatic 'if err != nil { return fmt.Errorf(...) }' pattern with semantic error wrapping (%w); forbid 'panic' in libraries or production code.",
  "Idiomatic Go architecture: organize the project following the standard layout (cmd/, internal/, pkg/), favoring minimal, implicitly-implemented interfaces.",
  "Zero Memory Leaks: always close resources with 'defer resp.Body.Close()', 'defer cancel()' and ensure every spawned goroutine has a deterministic exit condition.",
  "Deterministic tests and Benchmarks: validate code with 'go test ./...' including the '-race' flag for concurrent data-race detection and benchmarks for performance-critical paths.",
];

/**
 * Regole specializzate per Rust (ownership, borrow checker, zero unsafe, Result/Option)
 */
export const RUST_MANAGER_RULES = [
  "Ownership, Borrowing and Lifetimes: strictly respect the borrow checker rules (shared immutable &T vs exclusive mutable &mut T) to guarantee compile-time memory safety without a garbage collector.",
  "Zero Unsafe: categorically forbid 'unsafe' blocks except in exceptional cases with formal documentation of the safety invariants and L2 approval.",
  "Exhaustive Pattern Matching on Result and Option: handle all errors and optional values explicitly (match, if let or the ? operator); forbid .unwrap() in production code.",
  "Zero-Cost Abstractions & Traits: leverage the trait system (Clone, Copy, Send, Sync) and monomorphized generics to maximize runtime performance at zero overhead.",
  "Gatekeeper and Clippy: keep absolute test conformance with 'cargo test' and run the linter with 'cargo clippy -- -D warnings' at zero tolerated warnings.",
];

/**
 * Regole per Lead Engineer generico/fallback
 */
export const LEAD_ENGINEER_RULES = [
  "SOLID principles and Clean Architecture: design cohesive, loosely-coupled modules with well-defined typed contracts.",
  "Deterministic Gatekeeper: ensure every commit passes the full automated verification suite (compilation, linter and tests).",
  "System Integration: coordinate and oversee interoperability across the different modules, services and technologies of the company ecosystem.",
  "Atomic Delegation: decompose complex features into surgical tickets for L3 Leaf Developers with a clear perimeter and determined target files.",
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
      "L2 Domain Lead responsible for mobile architecture (iOS/macOS Swift/SwiftUI, Kotlin Multiplatform KMP, Flutter/Dart), reactive patterns, memory management, and client software quality.",
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
      "L2 Domain Lead responsible for Python/FastAPI backend services, non-blocking async architecture, Pydantic data validation, dependency injection, and robust API design.",
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
 * Costruisce il system prompt per il Frontend Manager (L2, TypeScript / Angular / React / Vue)
 */
export function buildFrontendManagerPrompt(overrides?: Partial<CoreKernelOptions>): string {
  const targetFws = (overrides?.targetFrameworks ?? ["react"]).map((f) =>
    f.toLowerCase()
  );
  const isAngular = targetFws.includes("angular");
  const testCmd = overrides?.recommendedTestCommand ?? "npm test";

  const defaultRules = isAngular
    ? TYPESCRIPT_ANGULAR_RULES
    : TYPESCRIPT_REACT_RULES;
  const defaultDesc = isAngular
    ? `L2 Domain Lead responsible for Angular/TypeScript architecture, Signals, Standalone Components, OnPush change detection, and ${testCmd} verification.`
    : `L2 Domain Lead responsible for React/TypeScript UI architecture, atomic components, React Hooks, strict typing, and ${testCmd} verification.`;

  const options: CoreKernelOptions = {
    roleId: "frontend_manager",
    roleName: "Frontend Engineering Lead",
    level: "L2",
    description: defaultDesc,
    targetLanguages: ["typescript"],
    targetFrameworks: overrides?.targetFrameworks ?? ["react"],
    recommendedTestCommand: testCmd,
    enableSubagents: true,
    enableWriteTools: true,
    domainRules: defaultRules,
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
      "L2 Domain Lead responsible for Go service architecture, native concurrency with goroutines and channels, explicit error handling, idiomatic package layout, and deterministic pipelines.",
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
      "L2 Domain Lead responsible for Rust systems architecture, mathematical memory-safety guarantees, borrow checker, zero unsafe, zero-cost abstractions, and a rigorous Deterministic Gatekeeper.",
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
      "L2 Domain Lead responsible for overall engineering architecture, multi-language technical coordination, quality standards, and system integration.",
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
