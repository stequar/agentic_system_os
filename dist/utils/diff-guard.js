import path from "node:path";
import { DiffGuardResultSchema } from "../contracts/healing.js";
/**
 * File di configurazione e dipendenze protetti che non possono essere modificati
 * durante le sessioni di self-healing, a meno che non siano esplicitamente inclusi in allowedFiles.
 */
const PROTECTED_CONFIG_FILES = new Set([
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "Cargo.toml",
    "Cargo.lock",
    "go.mod",
    "go.sum",
    "build.gradle.kts",
    "settings.gradle.kts",
]);
/**
 * Normalizza un percorso file per comparazioni deterministiche.
 */
function normalizePath(filePath) {
    return filePath.split(path.sep).join("/").replace(/^\.\//, "").trim();
}
/**
 * Verifica se un file appartiene alla categoria dei file di test.
 */
export function isTestFile(filePath) {
    const norm = normalizePath(filePath).toLowerCase();
    return (norm.includes(".test.") ||
        norm.includes(".spec.") ||
        norm.includes("__tests__/") ||
        norm.includes("/tests/") ||
        norm.startsWith("tests/") ||
        norm.endsWith("_test.go") ||
        norm.endsWith("test.go") ||
        norm.includes("test_") ||
        norm.endsWith("test.kt"));
}
/**
 * Rimuove i commenti a riga singola (//, #) e su piu righe (/* ... *\/)
 * per evitare falsi positivi quando il codice di test viene commentato.
 */
function stripComments(content) {
    return content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/#.*$/gm, "");
}
/**
 * Conta il numero di test case definiti in un file sorgente.
 */
function countTestCases(content) {
    const cleanContent = stripComments(content);
    const testRegex = /\b(?:it|test)\s*\(/g;
    const pyTestRegex = /\bdef\s+test_\w+\s*\(/g;
    const goTestRegex = /\bfunc\s+Test\w+\s*\(/g;
    const itMatches = cleanContent.match(testRegex)?.length || 0;
    const pyMatches = cleanContent.match(pyTestRegex)?.length || 0;
    const goMatches = cleanContent.match(goTestRegex)?.length || 0;
    return itMatches + pyMatches + goMatches;
}
/**
 * Conta il numero di asserzioni di test presenti in un file sorgente.
 */
function countAssertions(content) {
    const cleanContent = stripComments(content);
    const assertRegex = /\b(?:expect|assert|assert_eq|assertEquals|assertTrue|assertFalse)\s*\(/g;
    const pyAssertRegex = /\bassert\s+[^\n]+/g;
    const matcherRegex = /\b\.(?:toBe|toEqual|toStrictEqual|toBeTruthy|toBeFalsy|toContain|toThrow)\s*\(/g;
    const expectMatches = cleanContent.match(assertRegex)?.length || 0;
    const pyMatches = cleanContent.match(pyAssertRegex)?.length || 0;
    const matcherMatches = cleanContent.match(matcherRegex)?.length || 0;
    return expectMatches + pyMatches + matcherMatches;
}
/**
 * Conta la presenza di skip o soppressioni di test.
 */
function countTestSkips(content) {
    const cleanContent = stripComments(content);
    const skipRegex = /\b(?:it\.skip|test\.skip|describe\.skip|xit|xtest|@pytest\.mark\.skip|@unittest\.skip)\b/g;
    return cleanContent.match(skipRegex)?.length || 0;
}
/**
 * Valida una patch proposta confrontando lo stato originale dei file con quello modificato.
 * Applica i due invarianti deterministici di sicurezza:
 * 1. Test Preservation Invariant: vieta l'eliminazione/commento di test o asserzioni, o l'aggiunta di .skip.
 * 2. Scope Enforcement Invariant: vieta modifiche a file esterni ad allowedFiles o a config protette.
 */
export function validatePatch(originalFiles, modifiedFiles, options) {
    const violations = [];
    let testsPreserved = true;
    let scopePreserved = true;
    const allowedNormalized = options?.allowedFiles
        ? new Set(options.allowedFiles.map(normalizePath))
        : null;
    for (const [filePath, newContent] of modifiedFiles.entries()) {
        const normPath = normalizePath(filePath);
        const basename = path.basename(normPath);
        // --- INVARIANTE 2: SCOPE ENFORCEMENT ---
        if (allowedNormalized !== null) {
            const isAllowed = allowedNormalized.has(normPath) ||
                Array.from(allowedNormalized).some((allowed) => normPath.endsWith(allowed) || allowed.endsWith(normPath));
            if (!isAllowed) {
                scopePreserved = false;
                violations.push(`SCOPE_ENFORCEMENT_VIOLATION: File modificato non incluso nell'elenco consentito del ticket: '${filePath}'`);
            }
        }
        // Protezione per file di configurazione critici
        if (PROTECTED_CONFIG_FILES.has(basename)) {
            const explicitlyAllowed = allowedNormalized !== null &&
                Array.from(allowedNormalized).some((af) => af.endsWith(basename));
            if (!explicitlyAllowed) {
                scopePreserved = false;
                violations.push(`SCOPE_ENFORCEMENT_VIOLATION: Modifica non autorizzata al file di configurazione protetto: '${filePath}'`);
            }
        }
        // --- INVARIANTE 1: TEST PRESERVATION ---
        if (isTestFile(normPath)) {
            let originalContent = originalFiles.get(filePath) ?? originalFiles.get(normPath);
            if (originalContent === undefined) {
                for (const [origKey, content] of originalFiles.entries()) {
                    const normOrigKey = normalizePath(origKey);
                    if (normOrigKey === normPath ||
                        normOrigKey.endsWith("/" + normPath) ||
                        normPath.endsWith("/" + normOrigKey)) {
                        originalContent = content;
                        break;
                    }
                }
            }
            originalContent = originalContent ?? "";
            if (originalContent) {
                const origTests = countTestCases(originalContent);
                const newTests = countTestCases(newContent);
                if (newTests < origTests) {
                    testsPreserved = false;
                    violations.push(`TEST_PRESERVATION_VIOLATION: Numero di test case ridotto da ${origTests} a ${newTests} nel file '${filePath}'`);
                }
                const origAssertions = countAssertions(originalContent);
                const newAssertions = countAssertions(newContent);
                if (newAssertions < origAssertions) {
                    testsPreserved = false;
                    violations.push(`TEST_PRESERVATION_VIOLATION: Numero di asserzioni ridotto da ${origAssertions} a ${newAssertions} nel file '${filePath}'`);
                }
                const origSkips = countTestSkips(originalContent);
                const newSkips = countTestSkips(newContent);
                if (newSkips > origSkips) {
                    testsPreserved = false;
                    violations.push(`TEST_PRESERVATION_VIOLATION: Rilevata aggiunta non autorizzata di test skip (.skip/xit) nel file '${filePath}'`);
                }
            }
        }
    }
    const passed = testsPreserved && scopePreserved && violations.length === 0;
    return DiffGuardResultSchema.parse({
        passed,
        violations,
        testsPreserved,
        scopePreserved,
    });
}
//# sourceMappingURL=diff-guard.js.map