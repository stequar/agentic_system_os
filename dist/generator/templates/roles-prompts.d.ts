import { type CoreKernelOptions } from "./core-kernel.js";
/**
 * Regole specializzate per Swift / SwiftUI / MVVM
 */
export declare const SWIFT_MVVM_RULES: string[];
/**
 * Regole specializzate per Kotlin Multiplatform (KMP)
 */
export declare const KMP_RULES: string[];
/**
 * Regole specializzate per Flutter / Dart
 */
export declare const FLUTTER_RULES: string[];
/**
 * Regole specializzate per Python / FastAPI / Pydantic
 */
export declare const PYTHON_FASTAPI_RULES: string[];
/**
 * Regole specializzate per TypeScript / React
 */
export declare const TYPESCRIPT_REACT_RULES: string[];
/**
 * Specialized rules for Angular / TypeScript
 */
export declare const TYPESCRIPT_ANGULAR_RULES: string[];
/**
 * Regole specializzate per Go (goroutines, explicit errors, standard layout)
 */
export declare const GO_MANAGER_RULES: string[];
/**
 * Regole specializzate per Rust (ownership, borrow checker, zero unsafe, Result/Option)
 */
export declare const RUST_MANAGER_RULES: string[];
/**
 * Regole per Lead Engineer generico/fallback
 */
export declare const LEAD_ENGINEER_RULES: string[];
/**
 * Costruisce il system prompt per il Mobile Manager (L2, Swift/SwiftUI, KMP, Flutter)
 */
export declare function buildMobileManagerPrompt(overrides?: Partial<CoreKernelOptions>): string;
/**
 * Costruisce il system prompt per il Backend Manager (L2, Python/FastAPI, async/Pydantic)
 */
export declare function buildBackendManagerPrompt(overrides?: Partial<CoreKernelOptions>): string;
/**
 * Costruisce il system prompt per il Frontend Manager (L2, TypeScript / Angular / React / Vue)
 */
export declare function buildFrontendManagerPrompt(overrides?: Partial<CoreKernelOptions>): string;
/**
 * Costruisce il system prompt per il Go Manager (L2, Go, goroutine/canali, explicit error handling)
 */
export declare function buildGoManagerPrompt(overrides?: Partial<CoreKernelOptions>): string;
/**
 * Costruisce il system prompt per il Rust Systems Lead (L2, Rust, borrow checker, memory safety, zero unsafe)
 */
export declare function buildRustManagerPrompt(overrides?: Partial<CoreKernelOptions>): string;
/**
 * Costruisce il system prompt per il Lead Engineer (L2 fallback / generico)
 */
export declare function buildLeadEngineerPrompt(overrides?: Partial<CoreKernelOptions>): string;
//# sourceMappingURL=roles-prompts.d.ts.map