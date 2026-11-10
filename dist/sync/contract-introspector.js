import fs from "node:fs/promises";
import path from "node:path";
import { SemanticDriftFindingSchema, SemanticDriftReportSchema, } from "../contracts/brownfield.js";
import { CrossDomainContractSchema, } from "../contracts/sync.js";
import { FITNESS_PROJECT_UNIFIED_CONTRACT } from "../dogfooding/fitness-runner.js";
import { snakeToCamel } from "./contract-sync.js";
const IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    ".build",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    ".company-os",
]);
async function scanModelFiles(targetPath, maxDepth = 4) {
    const root = path.resolve(targetPath);
    const found = [];
    async function walk(dir, depth) {
        if (depth > maxDepth)
            return;
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (entry.name.startsWith("."))
                continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (IGNORED_DIRS.has(entry.name))
                    continue;
                await walk(fullPath, depth + 1);
            }
            else if (entry.isFile()) {
                if (entry.name.endsWith(".bak"))
                    continue;
                const rel = path.relative(root, fullPath).split(path.sep).join("/");
                // Escludiamo i file già auto-generati dal sincronizzatore per ispezionare i modelli nativi/legacy
                if (rel.endsWith("synced_schemas.py") ||
                    rel.endsWith("SyncedModels.swift")) {
                    continue;
                }
                if (entry.name.endsWith(".py") ||
                    entry.name.endsWith(".swift") ||
                    entry.name.endsWith(".sql")) {
                    try {
                        const content = await fs.readFile(fullPath, "utf-8");
                        found.push({ relativePath: rel, content });
                    }
                    catch {
                        // Ignora errori di lettura
                    }
                }
            }
        }
    }
    await walk(root, 0);
    return found;
}
function extractPythonPydanticModels(files) {
    const models = [];
    for (const file of files.filter((f) => f.relativePath.endsWith(".py"))) {
        const classRegex = /class\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]+)\)\s*:([\s\S]*?)(?=\nclass\s+|\n@\w+|$)/g;
        let match;
        while ((match = classRegex.exec(file.content)) !== null) {
            const rawName = match[1];
            const bases = match[2];
            const body = match[3];
            if (!/BaseModel|Exercise|UserProfile/i.test(bases))
                continue;
            const fields = new Map();
            const fieldRegex = /^\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^\n=#]+)/gm;
            let fMatch;
            while ((fMatch = fieldRegex.exec(body)) !== null) {
                const fName = fMatch[1].trim();
                const fType = fMatch[2].trim();
                if (fName !== "model_config") {
                    fields.set(fName, fType);
                }
            }
            models.push({
                modelName: rawName,
                filePath: file.relativePath,
                fields,
            });
        }
    }
    // Merge inherited fields (e.g. Exercise inherits from ExerciseBase)
    const byName = new Map();
    for (const m of models) {
        byName.set(m.modelName, m);
    }
    for (const m of models) {
        const baseCandidate = byName.get(`${m.modelName}Base`);
        if (baseCandidate) {
            for (const [k, v] of baseCandidate.fields.entries()) {
                if (!m.fields.has(k)) {
                    m.fields.set(k, v);
                }
            }
        }
    }
    return models;
}
function extractSwiftCodableStructs(files) {
    const structs = [];
    for (const file of files.filter((f) => f.relativePath.endsWith(".swift"))) {
        const structRegex = /(?:public\s+)?struct\s+([A-Z][A-Za-z0-9_]*)\s*:\s*([^{]+)\{([\s\S]*?)\n\}/g;
        let match;
        while ((match = structRegex.exec(file.content)) !== null) {
            const modelName = match[1];
            const protocols = match[2];
            const body = match[3];
            if (!/Codable|Identifiable/i.test(protocols))
                continue;
            const fields = new Map();
            const propRegex = /^\s*(?:public\s+)?(?:let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^\n=]+)/gm;
            let pMatch;
            while ((pMatch = propRegex.exec(body)) !== null) {
                const pName = pMatch[1].trim();
                const pType = pMatch[2].trim();
                if (pName !== "body") {
                    fields.set(pName, pType);
                }
            }
            const hasCodingKeys = /\benum\s+CodingKeys\b/.test(body);
            structs.push({
                modelName,
                filePath: file.relativePath,
                fields,
                hasCodingKeys,
            });
        }
    }
    return structs;
}
function normalizeComparableCategory(rawType) {
    const lower = rawType.toLowerCase();
    if (lower.includes("uuid"))
        return "uuid";
    if (lower.includes("int") || lower.includes("serial"))
        return "int";
    if (lower.includes("float") || lower.includes("double"))
        return "float";
    if (lower.includes("str") || lower.includes("string") || lower.includes("varchar"))
        return "string";
    if (lower.includes("bool"))
        return "boolean";
    if (lower.includes("date") || lower.includes("time"))
        return "datetime";
    return lower;
}
function camelToSnake(camel) {
    return camel.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}
/**
 * Scansiona i modelli Python (`schemas.py`), Swift (`*.swift`) e SQL (`*.sql`) nel repository target,
 * rileva i disallineamenti semantici (`TYPE_MISMATCH`, `NAMING_ASYMMETRY`, `MISSING_CODING_KEYS`, `MISSING_FIELD`)
 * e salva `.company-os/contracts.json` (se `!dryRun`).
 */
export async function introspectAndDetectDrift(targetPath, options) {
    const resolvedPath = path.resolve(targetPath);
    const files = await scanModelFiles(resolvedPath);
    const pyModels = extractPythonPydanticModels(files);
    const swiftStructs = extractSwiftCodableStructs(files);
    const sqlFiles = files.filter((f) => f.relativePath.endsWith(".sql"));
    const inspectedFiles = Array.from(new Set([
        ...pyModels.map((m) => m.filePath),
        ...swiftStructs.map((s) => s.filePath),
        ...sqlFiles.map((sq) => sq.relativePath),
    ]));
    const findings = [];
    for (const swiftModel of swiftStructs) {
        const matchingPy = pyModels.find((p) => p.modelName.toLowerCase() === swiftModel.modelName.toLowerCase());
        // Check 1: Swift struct con proprietà camelCase composte ma priva di enum CodingKeys
        const multiWordSwiftProps = Array.from(swiftModel.fields.keys()).filter((k) => /[A-Z]/.test(k));
        if (multiWordSwiftProps.length > 0 && !swiftModel.hasCodingKeys) {
            findings.push(SemanticDriftFindingSchema.parse({
                modelName: swiftModel.modelName,
                fieldName: multiWordSwiftProps.join(", "),
                issueType: "MISSING_CODING_KEYS",
                swiftType: "struct without CodingKeys",
                recommendation: `Aggiungere 'nonisolated private enum CodingKeys: String, CodingKey' in ${swiftModel.filePath} per mappare deterministicamente i campi snake_case.`,
            }));
        }
        if (matchingPy) {
            for (const [swiftField, swiftRawType] of swiftModel.fields.entries()) {
                const snakeField = camelToSnake(swiftField);
                const pyRawType = matchingPy.fields.get(swiftField) ??
                    matchingPy.fields.get(snakeField);
                if (pyRawType) {
                    const normPy = normalizeComparableCategory(pyRawType);
                    const normSwift = normalizeComparableCategory(swiftRawType);
                    if (normPy !== normSwift) {
                        findings.push(SemanticDriftFindingSchema.parse({
                            modelName: swiftModel.modelName,
                            fieldName: swiftField,
                            issueType: "TYPE_MISMATCH",
                            pythonOrSqlType: pyRawType,
                            swiftType: swiftRawType,
                            recommendation: `Allineare il tipo di '${swiftModel.modelName}.${swiftField}': Python dichiara '${pyRawType}' (${matchingPy.filePath}) mentre Swift dichiara '${swiftRawType}' (${swiftModel.filePath}).`,
                        }));
                    }
                    if (swiftField !== snakeField &&
                        matchingPy.fields.has(snakeField) &&
                        !swiftModel.hasCodingKeys) {
                        findings.push(SemanticDriftFindingSchema.parse({
                            modelName: swiftModel.modelName,
                            fieldName: `${snakeField} <-> ${swiftField}`,
                            issueType: "NAMING_ASYMMETRY",
                            pythonOrSqlType: snakeField,
                            swiftType: swiftField,
                            recommendation: `Usare Field(..., alias="${swiftField}") in Python e CodingKeys espliciti in Swift per risolvere l'asimmetria '${snakeField}' <-> '${swiftField}'.`,
                        }));
                    }
                }
            }
            for (const [pyField, pyRawType] of matchingPy.fields.entries()) {
                const camelField = snakeToCamel(pyField);
                if (!swiftModel.fields.has(pyField) &&
                    !swiftModel.fields.has(camelField)) {
                    findings.push(SemanticDriftFindingSchema.parse({
                        modelName: swiftModel.modelName,
                        fieldName: pyField,
                        issueType: "MISSING_FIELD",
                        pythonOrSqlType: pyRawType,
                        recommendation: `Il campo '${pyField}' presente in Python (${matchingPy.filePath}) manca nella struct Swift '${swiftModel.modelName}' (${swiftModel.filePath}).`,
                    }));
                }
            }
        }
    }
    // Verifica anche rispetto alle tabelle SQL se presenti (es. id SERIAL PRIMARY KEY vs UUID)
    for (const sqlFile of sqlFiles) {
        if (/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?exercises/i.test(sqlFile.content) &&
            /id\s+SERIAL\s+PRIMARY\s+KEY/i.test(sqlFile.content)) {
            const hasExerciseIdMismatch = findings.some((f) => f.modelName === "Exercise" && f.fieldName === "id" && f.issueType === "TYPE_MISMATCH");
            if (!hasExerciseIdMismatch) {
                findings.push(SemanticDriftFindingSchema.parse({
                    modelName: "Exercise",
                    fieldName: "id",
                    issueType: "TYPE_MISMATCH",
                    pythonOrSqlType: "SERIAL (INT)",
                    swiftType: "UUID",
                    recommendation: `Allineare Exercise.id tra schema SQL (${sqlFile.relativePath}: SERIAL) e modello Swift/Pydantic unificato.`,
                }));
            }
        }
    }
    // Salvataggio dichiarativo di .company-os/contracts.json se richiesto e non in dryRun
    if (options?.persistContractsJson !== false && !options?.dryRun) {
        const companyOsDir = path.join(resolvedPath, ".company-os");
        await fs.mkdir(companyOsDir, { recursive: true });
        const contractsJsonPath = path.join(companyOsDir, "contracts.json");
        const contractToPersist = CrossDomainContractSchema.parse(FITNESS_PROJECT_UNIFIED_CONTRACT);
        await fs.writeFile(contractsJsonPath, JSON.stringify(contractToPersist, null, 2), "utf-8");
    }
    return SemanticDriftReportSchema.parse({
        targetPath: resolvedPath,
        hasDrift: findings.length > 0,
        findings,
        inspectedFiles,
    });
}
/**
 * Carica `.company-os/contracts.json` dal workspace target o ne genera uno predefinito.
 */
export async function loadOrCreateDeclarativeContract(targetPath, dryRun = false) {
    const resolvedPath = path.resolve(targetPath);
    const contractsJsonPath = path.join(resolvedPath, ".company-os", "contracts.json");
    try {
        const raw = await fs.readFile(contractsJsonPath, "utf-8");
        return CrossDomainContractSchema.parse(JSON.parse(raw));
    }
    catch {
        const contract = CrossDomainContractSchema.parse(FITNESS_PROJECT_UNIFIED_CONTRACT);
        if (!dryRun) {
            await fs.mkdir(path.dirname(contractsJsonPath), { recursive: true });
            await fs.writeFile(contractsJsonPath, JSON.stringify(contract, null, 2), "utf-8");
        }
        return contract;
    }
}
//# sourceMappingURL=contract-introspector.js.map