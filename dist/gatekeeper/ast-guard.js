/**
 * Compat shim (P3R-3): la logica del diff-guard (`validatePatch`, `isTestFile`) è stata
 * spostata nel layer neutro `src/utils/diff-guard.ts` per rompere l'inversione di layer
 * (core importava verso gatekeeper). I consumatori di dominio gatekeeper/eval/security
 * possono continuare a importare da qui; `core/` importa direttamente da `utils/diff-guard`.
 */
export * from "../utils/diff-guard.js";
//# sourceMappingURL=ast-guard.js.map