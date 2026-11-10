import fs from "node:fs/promises";
import path from "node:path";
import { SynthesizedSpecialistSchema, TriRingOrgChartSchema, } from "../contracts/brownfield.js";
import { detectProjectStack, resolveHermeticTestCommands, } from "./detector.js";
import { FITNESS_PILOT_PRESERVED_MAPPINGS, } from "./ontologies/fitness-pilot-ontology.js";
import { SEMANTIC_DOMAIN_CLUSTERS } from "./ontologies/industry-clusters.js";
const IGNORED_SCAN_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    ".build",
    ".next",
    "build",
    "out",
    "venv",
    ".venv",
    "__pycache__",
    ".pytest_cache",
    ".company-os",
    "dataset_raw",
]);
async function collectRepoTextFiles(targetPath, maxDepth = 4) {
    const resolvedRoot = path.resolve(targetPath);
    const results = [];
    async function walk(currentDir, depth) {
        if (depth > maxDepth)
            return;
        let entries;
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (entry.name.startsWith(".") && entry.name !== ".agents")
                continue;
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                if (IGNORED_SCAN_DIRS.has(entry.name))
                    continue;
                await walk(fullPath, depth + 1);
            }
            else if (entry.isFile()) {
                if (entry.name.endsWith(".bak"))
                    continue;
                const ext = path.extname(entry.name).toLowerCase();
                if ([".py", ".swift", ".ts", ".tsx", ".js", ".sql", ".md", ".json", ".toml", ".txt", ".yml", ".yaml"].includes(ext)) {
                    try {
                        const stat = await fs.stat(fullPath);
                        if (stat.size <= 256 * 1024) {
                            const content = await fs.readFile(fullPath, "utf-8");
                            const relativePath = path
                                .relative(resolvedRoot, fullPath)
                                .split(path.sep)
                                .join("/");
                            results.push({ relativePath, content });
                        }
                    }
                    catch {
                        // Ignora file illeggibili
                    }
                }
            }
        }
    }
    await walk(resolvedRoot, 0);
    return results;
}
/**
 * Estrae eventuali ruoli già descritti in `AGENTS.md` o `AGENTS.md.bak`.
 */
function parsePreservedDomainRolesFromAgentsMd(agentsContent, allFilePaths, defaultTestCmd, mappings = FITNESS_PILOT_PRESERVED_MAPPINGS) {
    const preserved = [];
    for (const mapping of mappings) {
        if (!mapping.triggerRegex.test(agentsContent)) {
            continue;
        }
        const scope = allFilePaths.filter((p) => mapping.scopeFilterRegex.test(p));
        preserved.push(SynthesizedSpecialistSchema.parse({
            id: mapping.id,
            title: mapping.title,
            ring: "RING_2_DOMAIN_EXPERT",
            origin: "PRESERVED_EXISTING",
            boundedContext: mapping.boundedContext,
            domainKeywords: mapping.domainKeywords,
            domainScope: scope.length > 0 ? scope : mapping.fallbackScope,
            domainInvariants: mapping.domainInvariants,
            microRoleCard: mapping.microRoleCard,
            testCommand: defaultTestCmd,
        }));
    }
    return preserved;
}
/**
 * Esegue il mining semantico del repository (Fase P1 — `SEMANTIC_DOMAIN_MINING` & `TRI_RING_ORG_SYNTHESIS`)
 * generando l'organigramma Tri-Ring completo:
 * - Ring-0: Core Governance Leads
 * - Ring-1: Catalog Tech Leads + Open-Ended Tech Specialists (es. SQL, Docker, Data Ingestion, MCP/CLI Runtime)
 * - Ring-2: Business Domain Experts (sia preservati da `AGENTS.md` sia inferiti autonomamente da AST/SQL/Wiki)
 */
export async function mineRepositoryDomainAndRoles(targetPath, stack, options) {
    const resolvedPath = path.resolve(targetPath);
    const resolvedStack = stack ?? (await detectProjectStack(resolvedPath, { hermetic: true }));
    const hermeticCommands = await resolveHermeticTestCommands(resolvedPath, resolvedStack.testCommands);
    const pyTestCmd = hermeticCommands.find((c) => c.includes("pytest")) ?? "pytest";
    const swiftTestCmd = hermeticCommands.find((c) => c.includes("swift test")) ?? "swift test";
    const tsTestCmd = hermeticCommands.find((c) => c.includes("pnpm test") ||
        c.includes("yarn test") ||
        c.includes("npm test") ||
        c.includes("vitest") ||
        c.includes("jest")) ?? "npm test";
    const repoFiles = await collectRepoTextFiles(resolvedPath);
    const allFilePaths = repoFiles.map((f) => f.relativePath);
    const isSelfHostingOsRepo = allFilePaths.includes("src/inspector/domain-miner.ts") &&
        allFilePaths.includes("src/core/ceremony-dispatcher.ts");
    // 1. Ring-0 Core Governance Leads
    const ring0CoreLeads = [
        "cto",
        "engineering_lead",
        "product_lead",
        "qa_lead",
        "ai_lead",
        "rnd_lead",
    ];
    // 2. Ring-1 Tech Specialists (Catalog + Open-Ended Tech Synthesis)
    const ring1TechSpecialists = [];
    const langs = new Set(resolvedStack.languages.map((l) => l.toLowerCase()));
    if (langs.has("python") || langs.has("go") || langs.has("rust")) {
        const backendScope = allFilePaths.filter((p) => p.endsWith(".py") || p.startsWith("app/") || p.startsWith("src/backend/"));
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "backend_manager",
            title: "Backend Engineering Lead",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "CATALOG",
            boundedContext: "Backend APIs, Persistence & Service Layer",
            domainKeywords: ["fastapi", "python", "api", "pydantic", "backend"],
            domainScope: backendScope.slice(0, 15),
            domainInvariants: [
                "Every endpoint must validate schemas via Pydantic v2 with ConfigDict(populate_by_name=True).",
            ],
            microRoleCard: "[RING-1: backend_manager] Python/FastAPI backend lead responsible for APIs, Pydantic v2 schemas, and hermetic tests.",
            testCommand: pyTestCmd,
        }));
    }
    if (langs.has("swift") || langs.has("kotlin") || langs.has("dart")) {
        const mobileScope = allFilePaths.filter((p) => p.endsWith(".swift"));
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "mobile_manager",
            title: "Mobile Engineering Lead",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "CATALOG",
            boundedContext: "iOS SwiftUI Views, MVVM ViewModels & Codable DTOs",
            domainKeywords: ["swift", "swiftui", "ios", "codable", "sendable", "mvvm"],
            domainScope: mobileScope.slice(0, 15),
            domainInvariants: [
                "All models exchanged between Swift 6 actors must conform to Codable, Sendable, Hashable with nonisolated CodingKeys.",
            ],
            microRoleCard: "[RING-1: mobile_manager] iOS Swift 6 / SwiftUI mobile lead responsible for MVVM, Sendable concurrency, and Codable models.",
            testCommand: swiftTestCmd,
        }));
    }
    if (langs.has("typescript") || langs.has("javascript")) {
        const tsScope = allFilePaths.filter((p) => p.endsWith(".ts") || p.endsWith(".tsx"));
        const fwsLower = resolvedStack.frameworks.map((f) => f.toLowerCase());
        const isAngular = fwsLower.includes("angular");
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "frontend_manager",
            title: isAngular
                ? "Angular & TypeScript Engineering Lead"
                : "Frontend & TypeScript Engineering Lead",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "CATALOG",
            boundedContext: isAngular
                ? "Angular Signals, Standalone Components & TypeScript Architecture"
                : "TypeScript Modules, Contracts & Frontend UI",
            domainKeywords: isAngular
                ? ["typescript", "angular", "signals", "rxjs", "jest"]
                : ["typescript", "react", "frontend", "zod", "studio"],
            domainScope: tsScope.slice(0, 15),
            domainInvariants: [
                `Strict TypeScript compilation with zero errors and 100% passing ${tsTestCmd} verification.`,
            ],
            microRoleCard: isAngular
                ? `[RING-1: frontend_manager] Angular/TypeScript Lead responsible for Signals, Standalone Components, OnPush change detection, and ${tsTestCmd}.`
                : `[RING-1: frontend_manager] TypeScript/Frontend Lead responsible for strict typing, module contracts, and ${tsTestCmd}.`,
            testCommand: tsTestCmd,
        }));
    }
    // Open-Ended Tech Synthesis: Node.js CLI & MCP Runtime Specialist (Self-Hosting / Agentic Platform)
    const mcpCliFiles = allFilePaths.filter((p) => p.startsWith("src/mcp/") || p.startsWith("src/cli/"));
    if (mcpCliFiles.length > 0) {
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "mcp_cli_runtime_specialist",
            title: "MCP Server, Worker Sandbox & CLI Runtime Specialist",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "OPEN_ENDED_SYNTHESIS",
            boundedContext: "MCP JSON-RPC Transport, JIT Tool Synthesis & CLI Dispatcher",
            domainKeywords: ["mcp", "cli", "dispatcher", "synthesizer", "worker"],
            domainScope: mcpCliFiles.slice(0, 15),
            domainInvariants: [
                "The MCP stdio transport must never be polluted by non-JSON-RPC logs, and dynamic tools must pass the pre-flight test in the Worker Sandbox.",
            ],
            microRoleCard: "[RING-1: mcp_cli_runtime_specialist] Synthesized specialist for the MCP Server/Client, JIT Tool Synthesis, and modular CLI architecture.",
            testCommand: tsTestCmd,
        }));
    }
    // Open-Ended Tech Synthesis: SQL / Relational Database Specialist
    const sqlFiles = allFilePaths.filter((p) => p.endsWith(".sql") || /database|db_models/i.test(p));
    if (langs.has("sql") || sqlFiles.length > 0) {
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "database_sql_specialist",
            title: "Database & Relational SQL Schema Specialist",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "OPEN_ENDED_SYNTHESIS",
            boundedContext: "Relational PostgreSQL/Supabase Schema & Migrations",
            domainKeywords: ["sql", "postgres", "supabase", "schema", "database", "migration"],
            domainScope: sqlFiles,
            domainInvariants: [
                "Every change to SQL tables (exercises, muscles, equipments, users) must preserve referential integrity and parity with the ORM/Pydantic models.",
            ],
            microRoleCard: "[RING-1: database_sql_specialist] Synthesized specialist for relational SQL architecture, migrations, and ORM alignment.",
            testCommand: pyTestCmd,
        }));
    }
    // Open-Ended Tech Synthesis: Data Ingestion / ETL Specialist
    const etlFiles = allFilePaths.filter((p) => /ingest|dataset|etl/i.test(p));
    if (etlFiles.length > 0) {
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "data_pipeline_specialist",
            title: "Data Ingestion & ETL Pipeline Specialist",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "OPEN_ENDED_SYNTHESIS",
            boundedContext: "Dataset Parsing, Normalization & Batch Ingestion",
            domainKeywords: ["ingest", "dataset", "etl", "batch", "hasaneyldrm"],
            domainScope: etlFiles,
            domainInvariants: [
                "Ingestion scripts must be idempotent (ON CONFLICT DO NOTHING / UPSERT) and validate records before insertion.",
            ],
            microRoleCard: "[RING-1: data_pipeline_specialist] Synthesized specialist for dataset ingestion pipelines and media/metadata normalization.",
            testCommand: pyTestCmd,
        }));
    }
    // Open-Ended Tech Synthesis: Docker & Container Specialist
    if (resolvedStack.hasDocker || langs.has("docker")) {
        const dockerScope = allFilePaths.filter((p) => /docker|compose/i.test(p));
        ring1TechSpecialists.push(SynthesizedSpecialistSchema.parse({
            id: "devops_container_specialist",
            title: "Container & DevOps Runtime Specialist",
            ring: "RING_1_TECH_SPECIALIST",
            origin: "OPEN_ENDED_SYNTHESIS",
            boundedContext: "Docker Compose Topology & Local Service Orchestration",
            domainKeywords: ["docker", "compose", "container", "postgres"],
            domainScope: dockerScope.length > 0 ? dockerScope : ["docker-compose.yml"],
            domainInvariants: [
                "Database containers must mount init scripts reproducibly and expose deterministic healthchecks.",
            ],
            microRoleCard: "[RING-1: devops_container_specialist] Synthesized specialist for Docker containerized infrastructure and service orchestration.",
        }));
    }
    // 3. Ring-2 Business Domain Experts (Preserved + Autonomous DDD Semantic Mining)
    const ring2Map = new Map();
    if (!options?.ignoreExistingAgentsMd && !isSelfHostingOsRepo) {
        const agentsEntry = repoFiles.find((f) => f.relativePath === "AGENTS.md");
        let agentsContent = agentsEntry?.content ?? "";
        try {
            const bakContent = await fs.readFile(path.join(resolvedPath, "AGENTS.md.bak"), "utf-8");
            agentsContent += "\n" + bakContent;
        }
        catch {
            // Nessun .bak presente
        }
        if (agentsContent) {
            const preserved = parsePreservedDomainRolesFromAgentsMd(agentsContent, allFilePaths, pyTestCmd);
            for (const p of preserved) {
                ring2Map.set(p.id, p);
            }
        }
    }
    // Autonomous DDD Bounded Context Mining da codice, SQL e documentazione
    // (opera anche quando AGENTS.md non esiste o viene ignorato!)
    const filesWithoutAgents = repoFiles.filter((f) => f.relativePath !== "AGENTS.md");
    const activeClusters = isSelfHostingOsRepo
        ? SEMANTIC_DOMAIN_CLUSTERS.filter((c) => c.selfHostingCluster === true)
        : SEMANTIC_DOMAIN_CLUSTERS.filter((c) => !c.selfHostingCluster);
    for (const cluster of activeClusters) {
        // Richiediamo che almeno un file del repository contenga una firma regex specifica
        // del cluster (evitando falsi positivi su cartelle omonime come 'nutrition/' in ambito agritech)
        const hasStrongSignature = filesWithoutAgents.some((file) => {
            if (isSelfHostingOsRepo && file.relativePath.startsWith("tests/")) {
                return false;
            }
            const pathAndContent = `${file.relativePath}\n${file.content}`;
            return cluster.regexTriggers.some((rx) => rx.test(pathAndContent));
        });
        if (!hasStrongSignature) {
            continue;
        }
        const matchedFiles = [];
        for (const file of filesWithoutAgents) {
            if (isSelfHostingOsRepo && file.relativePath.startsWith("tests/")) {
                continue;
            }
            const pathAndContent = `${file.relativePath}\n${file.content}`;
            const matchedByRegex = cluster.regexTriggers.some((rx) => rx.test(pathAndContent));
            const matchedByKeyword = cluster.keywords.some((kw) => file.relativePath.toLowerCase().includes(kw.toLowerCase()));
            if (matchedByRegex || matchedByKeyword) {
                matchedFiles.push(file.relativePath);
            }
        }
        if (matchedFiles.length > 0) {
            const existing = ring2Map.get(cluster.id);
            if (existing) {
                // Arricchisce il domainScope con tutti i file reali scoperti dal miner
                const mergedScope = Array.from(new Set([...existing.domainScope, ...matchedFiles]));
                ring2Map.set(cluster.id, {
                    ...existing,
                    domainScope: mergedScope,
                });
            }
            else {
                ring2Map.set(cluster.id, SynthesizedSpecialistSchema.parse({
                    id: cluster.id,
                    title: cluster.title,
                    ring: "RING_2_DOMAIN_EXPERT",
                    origin: "SEMANTIC_MINED",
                    boundedContext: cluster.boundedContext,
                    domainKeywords: cluster.keywords,
                    domainScope: matchedFiles,
                    domainInvariants: cluster.invariants,
                    microRoleCard: cluster.microRoleCard,
                    testCommand: isSelfHostingOsRepo ? tsTestCmd : pyTestCmd,
                }));
            }
        }
    }
    // Fallback dinamico per repository Brownfield generici (es. Angular/React/Node/Enterprise):
    // estrae i Bounded Context reali dalle directory di feature del progetto senza inventare domini estranei.
    if (ring2Map.size === 0) {
        const primaryTestCmd = langs.has("typescript") || langs.has("javascript") ? tsTestCmd : pyTestCmd;
        const ignoredBuckets = new Set([
            "shared",
            "core",
            "common",
            "utils",
            "assets",
            "environments",
            "styles",
            "types",
            "contracts",
            "config",
            "test",
            "tests",
            "docs",
            ".agents",
            "pipe",
            "pipes",
            "directive",
            "directives",
            "component",
            "components",
            "service",
            "services",
            "model",
            "models",
            "dialog",
            "dialogs",
            "modal",
            "modals",
            "guard",
            "guards",
            "interceptor",
            "interceptors",
            "helper",
            "helpers",
            "widget",
            "widgets",
            "chart",
            "charts",
            "graph",
            "graphs",
            "layout",
            "layouts",
            "icon",
            "icons",
            "animation",
            "animations",
            "i18n",
            "mock",
            "mocks",
            "fixture",
            "fixtures",
            "store",
            "state",
            "reducers",
            "actions",
            "selectors",
            "effects",
            "pages",
            "views",
            "containers",
            "ui",
            "table",
            "tables",
            "form",
            "forms",
        ]);
        const bucketMap = new Map();
        for (const relPath of allFilePaths) {
            if (relPath.startsWith(".") || relPath.startsWith("docs/"))
                continue;
            const parts = relPath.split("/");
            let domainKey;
            if (parts[0] === "src" &&
                parts[1] === "app" &&
                (parts[2] === "features" ||
                    parts[2] === "modules" ||
                    parts[2] === "domains" ||
                    parts[2] === "pages" ||
                    parts[2] === "views") &&
                parts.length >= 5) {
                domainKey = parts[3];
            }
            else if (parts[0] === "src" &&
                (parts[1] === "app" ||
                    parts[1] === "features" ||
                    parts[1] === "modules" ||
                    parts[1] === "domains" ||
                    parts[1] === "pages") &&
                parts.length >= 4) {
                domainKey = parts[2];
            }
            else if ((parts[0] === "libs" || parts[0] === "packages" || parts[0] === "apps") &&
                parts.length >= 3) {
                domainKey = parts[1];
            }
            else if (parts[0] === "src" && parts.length >= 3) {
                domainKey = parts[1];
            }
            if (domainKey) {
                const cleanKey = domainKey.toLowerCase().replace(/[^a-z0-9_]/g, "_");
                if (cleanKey.length >= 3 && !ignoredBuckets.has(cleanKey)) {
                    const list = bucketMap.get(cleanKey) ?? [];
                    list.push(relPath);
                    bucketMap.set(cleanKey, list);
                }
            }
        }
        const sortedBuckets = Array.from(bucketMap.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3);
        for (const [bucketName, files] of sortedBuckets) {
            const specialistId = `${bucketName}_domain_specialist`;
            const humanName = bucketName
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            ring2Map.set(specialistId, SynthesizedSpecialistSchema.parse({
                id: specialistId,
                title: `${humanName} Domain Specialist`,
                ring: "RING_2_DOMAIN_EXPERT",
                origin: "SEMANTIC_MINED",
                boundedContext: `${humanName} Module & Domain Logic`,
                domainKeywords: [bucketName],
                domainScope: files.slice(0, 15),
                domainInvariants: [
                    `All changes within the ${bucketName} bounded context must preserve module contracts and pass ${primaryTestCmd}.`,
                ],
                microRoleCard: `[RING-2: ${specialistId}] Domain specialist responsible for the ${bucketName} module boundaries, state consistency, and test coverage.`,
                testCommand: primaryTestCmd,
            }));
        }
    }
    const maxExperts = options?.maxDomainExperts ?? 5;
    const ring2DomainExperts = Array.from(ring2Map.values()).slice(0, maxExperts);
    return TriRingOrgChartSchema.parse({
        targetPath: resolvedPath,
        generatedAt: new Date().toISOString(),
        ring0CoreLeads,
        ring1TechSpecialists,
        ring2DomainExperts,
    });
}
//# sourceMappingURL=domain-miner.js.map