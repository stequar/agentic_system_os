import path from "node:path";
import { SecretScanResultSchema, } from "../contracts/security.js";
/**
 * Calcola l'entropia di Shannon di una stringa:
 * H(X) = - sum( P(x_i) * log2( P(x_i) ) )
 */
export function calculateShannonEntropy(text) {
    if (!text || text.length === 0)
        return 0;
    const frequencies = new Map();
    for (const char of text) {
        frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }
    let entropy = 0;
    const len = text.length;
    for (const count of frequencies.values()) {
        const p = count / len;
        entropy -= p * Math.log2(p);
    }
    return Math.round(entropy * 1000) / 1000;
}
/**
 * Verifica se un percorso file appartiene alla whitelist di test o fixture
 */
export function isWhitelistedPath(filePath) {
    if (!filePath)
        return false;
    const norm = filePath.split(path.sep).join("/").toLowerCase();
    return (norm.includes("tests/") ||
        norm.includes("__tests__/") ||
        norm.includes("fixtures/") ||
        norm.includes("mock") ||
        norm.includes("testdata/") ||
        norm.includes(".mock.") ||
        norm.includes(".test.") ||
        norm.includes(".spec.") ||
        norm.endsWith(".env.example") ||
        norm.endsWith(".env.sample"));
}
/**
 * Verifica se un token è palesemente un valore fittizio di mock
 */
function isWhitelistedValue(token) {
    const lower = token.toLowerCase();
    return (/(?:^|[_\-./])(?:fake|mock|dummy|test|example|sample)(?:[_\-./]|$)/i.test(token) ||
        lower.startsWith("mock_") ||
        lower.startsWith("fake_") ||
        lower.startsWith("dummy_") ||
        /^sk-proj-0+$/.test(lower) ||
        /^0+$/.test(lower) ||
        /^([a-z0-9])\1+$/i.test(token));
}
/**
 * Offusca una stringa segreta lasciando visibili solo i primi 4 e gli ultimi 3 caratteri
 */
function obfuscateSnippet(val) {
    if (val.length <= 10)
        return "***";
    return `${val.slice(0, 7)}...${val.slice(-4)}`;
}
const KNOWN_PATTERNS = [
    {
        name: "OPENAI_PROJECT_KEY",
        regex: /\bsk-proj-[A-Za-z0-9_-]{20,}\b/g,
    },
    {
        name: "OPENAI_STANDARD_KEY",
        regex: /\bsk-[A-Za-z0-9]{20,}\b/g,
    },
    {
        name: "ANTHROPIC_KEY",
        regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
    },
    {
        name: "AWS_ACCESS_KEY",
        regex: /\bAKIA[0-9A-Z]{16}\b/g,
    },
    {
        name: "GITHUB_TOKEN",
        regex: /\b(?:ghp|gho|ghu|ghs)_[A-Za-z0-9_]{36}\b/g,
    },
    {
        name: "PRIVATE_KEY",
        regex: /-----BEGIN (?:[A-Za-z0-9_-]+\s+)*PRIVATE KEY-----/g,
    },
    {
        name: "DATABASE_URI_PASSWORD",
        regex: /(?:postgres|mysql|mongodb|redis):\/\/[^:\/\s]+:([^@\/\s]{4,})@/g,
    },
];
/**
 * Tier 1: Scansione sincrona ultra-rapida (<2ms) sul payload del prompt
 * prima dell'invio ad API LLM esterne.
 */
export function scanPromptForSecrets(text, options) {
    if (options?.allowWhitelisted && options.filePath && isWhitelistedPath(options.filePath)) {
        return SecretScanResultSchema.parse({
            passed: true,
            tier: "tier1-prompt",
            violations: [],
            message: `File '${options.filePath}' in whitelist di test. Scansione bypassata.`,
        });
    }
    const violations = [];
    for (const pattern of KNOWN_PATTERNS) {
        const matches = text.matchAll(pattern.regex);
        for (const match of matches) {
            const matchStr = match[0];
            if (!isWhitelistedValue(matchStr)) {
                violations.push({
                    secretType: pattern.name,
                    snippet: obfuscateSnippet(matchStr),
                });
            }
        }
    }
    const passed = violations.length === 0;
    return SecretScanResultSchema.parse({
        passed,
        tier: "tier1-prompt",
        violations,
        message: passed
            ? "Nessun segreto noto rilevato nel prompt."
            : `Trovate ${violations.length} violazioni di segreti nel prompt prima dell'invio LLM.`,
    });
}
/**
 * Tier 2: Scansione differenziale pre-commit basata su Entropia di Shannon (H > 4.5).
 */
export function scanDiffForSecrets(diffText, options) {
    const filePath = options?.filePath;
    if (filePath && isWhitelistedPath(filePath)) {
        return SecretScanResultSchema.parse({
            passed: true,
            tier: "tier2-precommit",
            violations: [],
            message: `File '${filePath}' in whitelist di test/fixture. Diff scansione bypassata.`,
        });
    }
    const violations = [];
    const entropyThreshold = options?.entropyThreshold ?? 4.5;
    // 1. Eseguiamo prima i pattern noti (Tier 1)
    const tier1Check = scanPromptForSecrets(diffText, { filePath, allowWhitelisted: false });
    violations.push(...tier1Check.violations);
    // 2. Analisi Entropia di Shannon per righe aggiunte nel diff (che iniziano con '+')
    const lines = diffText.split("\n");
    let lineNum = 0;
    for (const line of lines) {
        lineNum++;
        // Analizza solo righe aggiunte nel diff Git (o tutto il testo se non è un diff unificato)
        const targetLine = line.startsWith("+") ? line.slice(1) : line;
        // Cerca token alfanumerici continui di almeno 21 caratteri
        const tokenRegex = /\b[A-Za-z0-9_\-+/=]{21,}\b/g;
        const tokens = targetLine.match(tokenRegex) || [];
        for (const token of tokens) {
            if (isWhitelistedValue(token))
                continue;
            // Escludi hash esadecimali lunghi a bassa entropia (es. commit SHA o sha256 con charset ridotto)
            const isPureHex = /^[0-9a-fA-F]+$/.test(token);
            const entropy = calculateShannonEntropy(token);
            // Le chiavi ad alta casualità crittografica (Base64 / Alphanumeric) hanno solitamente H > 4.5
            // mentre gli hash esadecimali hex hanno H tipicamente < 4.0
            if (entropy > entropyThreshold && !isPureHex) {
                // Evita duplicati
                const alreadyFlagged = violations.some((v) => v.snippet === obfuscateSnippet(token));
                if (!alreadyFlagged) {
                    violations.push({
                        secretType: "HIGH_ENTROPY_TOKEN",
                        snippet: obfuscateSnippet(token),
                        line: lineNum,
                        entropy,
                    });
                }
            }
        }
    }
    const passed = violations.length === 0;
    return SecretScanResultSchema.parse({
        passed,
        tier: "tier2-precommit",
        violations,
        message: passed
            ? "Diff pre-commit pulito: nessuna chiave ad alta entropia o segreto rilevato."
            : `Rilevate ${violations.length} potenziali credenziali o token ad alta entropia nel diff pre-commit.`,
    });
}
//# sourceMappingURL=secret-guard.js.map