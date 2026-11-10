import * as p from "@clack/prompts";
import chalk from "chalk";
import path from "node:path";
import fs from "node:fs/promises";
import { detectProjectStack } from "../inspector/detector.js";
import { attachWorkspace } from "../attach/injector.js";
/**
 * Rileva automaticamente se il targetPath è un monorepo o multi-repo
 * e individua i relativi sub-workspace.
 */
export async function detectMonorepoWorkspaces(targetPath) {
    const resolvedPath = path.resolve(targetPath);
    const workspaces = [];
    // 1. Verifica pnpm-workspace.yaml
    try {
        const pnpmWorkspaceContent = await fs.readFile(path.join(resolvedPath, "pnpm-workspace.yaml"), "utf-8");
        const lines = pnpmWorkspaceContent.split("\n");
        for (const line of lines) {
            const match = line.match(/-\s*['"]?([^'"]+)['"]?/);
            if (match) {
                workspaces.push(match[1].trim());
            }
        }
        if (workspaces.length > 0) {
            return { isMonorepo: true, type: "pnpm", workspaces };
        }
    }
    catch {
        // Non è un workspace pnpm
    }
    // 2. Verifica package.json con campo workspaces
    try {
        const pkgContent = await fs.readFile(path.join(resolvedPath, "package.json"), "utf-8");
        const pkg = JSON.parse(pkgContent);
        if (Array.isArray(pkg.workspaces)) {
            return { isMonorepo: true, type: "npm/yarn", workspaces: pkg.workspaces };
        }
    }
    catch {
        // Non è un workspace npm
    }
    // 3. Verifica Cargo.toml con [workspace]
    try {
        const cargoContent = await fs.readFile(path.join(resolvedPath, "Cargo.toml"), "utf-8");
        if (cargoContent.includes("[workspace]")) {
            const membersMatch = cargoContent.match(/members\s*=\s*\[([\s\S]*?)\]/);
            if (membersMatch) {
                const rawMembers = membersMatch[1]
                    .split(",")
                    .map((m) => m.replace(/["'\s]/g, ""))
                    .filter(Boolean);
                return { isMonorepo: true, type: "cargo", workspaces: rawMembers };
            }
            return { isMonorepo: true, type: "cargo", workspaces: ["crates/*"] };
        }
    }
    catch {
        // Non è un workspace cargo
    }
    // 4. Scansione directory comuni (packages/, apps/, services/)
    const commonDirs = ["packages", "apps", "services", "backend", "frontend", "mobile"];
    const detectedSubDirs = [];
    for (const dir of commonDirs) {
        try {
            const s = await fs.stat(path.join(resolvedPath, dir));
            if (s.isDirectory()) {
                detectedSubDirs.push(dir);
            }
        }
        catch {
            // Non esiste
        }
    }
    if (detectedSubDirs.length >= 2) {
        return { isMonorepo: true, type: "directory-structure", workspaces: detectedSubDirs };
    }
    return { isMonorepo: false, workspaces: [] };
}
/**
 * Interactive Scaffolding Wizard moderno basato su @clack/prompts.
 * Supporta esecuzione interattiva e modalità headless non bloccante per CI/CD.
 */
export async function runScaffoldingWizard(targetPath = process.cwd(), options) {
    const resolvedPath = path.resolve(targetPath);
    const isHeadless = Boolean(options?.yes) ||
        Boolean(options?.nonInteractive) ||
        Boolean(options?.json) ||
        !process.stdin.isTTY;
    // 1. Scansione preliminare dello stack
    const stack = await detectProjectStack(resolvedPath);
    const monorepoInfo = await detectMonorepoWorkspaces(resolvedPath);
    // 2. Esecuzione in modalità Headless (CI/CD o flag --json / --yes)
    if (isHeadless) {
        const attachResult = await attachWorkspace(resolvedPath, { force: true });
        const payload = {
            targetPath: resolvedPath,
            stack,
            monorepo: monorepoInfo,
            attachResult,
            mode: "headless",
            completedAt: new Date().toISOString(),
        };
        if (options?.json) {
            console.log(JSON.stringify(payload, null, 2));
        }
        else {
            console.log(chalk.green(`✔ Setup completed successfully in non-interactive mode for ${resolvedPath}`));
        }
        return payload;
    }
    // 3. Esecuzione in modalità Interattiva (@clack/prompts)
    p.intro(chalk.bold.cyan("🚀 Agentic Company OS — Universal Scaffolding Wizard"));
    const langsSummary = stack.languages.length > 0 ? stack.languages.join(", ") : "None detected";
    const fwsSummary = stack.frameworks.length > 0 ? stack.frameworks.join(", ") : "Standard";
    const testCmdSummary = stack.testCommands.length > 0 ? stack.testCommands.join(", ") : "None configured";
    p.note(`Percorso: ${chalk.yellow(resolvedPath)}\n` +
        `Linguaggi: ${chalk.green(langsSummary)}\n` +
        `Frameworks: ${chalk.magenta(fwsSummary)}\n` +
        `Comandi Test: ${chalk.cyan(testCmdSummary)}\n` +
        `Docker: ${stack.hasDocker ? chalk.green("Yes") : chalk.gray("No")}`, "Detected Tech Stack");
    // Se è un monorepo, consente di selezionare i sub-workspace
    let selectedWorkspaces = monorepoInfo.workspaces;
    if (monorepoInfo.isMonorepo && monorepoInfo.workspaces.length > 0) {
        const wsChoices = await p.multiselect({
            message: `Rilevato Monorepo (${monorepoInfo.type}). Seleziona i workspace da orchestrare:`,
            options: monorepoInfo.workspaces.map((ws) => ({
                value: ws,
                label: ws,
            })),
            initialValues: monorepoInfo.workspaces,
        });
        if (p.isCancel(wsChoices)) {
            p.cancel("Operazione annullata.");
            process.exit(0);
        }
        selectedWorkspaces = wsChoices;
    }
    // Conferma finale per l'iniezione della governance
    const proceed = await p.confirm({
        message: "Inizializzare Agentic Company OS con generazione di AGENTS.md e Knowledge Base?",
        initialValue: true,
    });
    if (p.isCancel(proceed) || !proceed) {
        p.cancel("Inizializzazione annullata dall'utente.");
        process.exit(0);
    }
    const s = p.spinner();
    s.start("Injecting company governance, org chart, and Knowledge Base...");
    const attachResult = await attachWorkspace(resolvedPath, { force: true });
    s.stop(chalk.green("Company governance and typed contracts configured successfully!"));
    p.note(`• AGENTS.md: Definisce ruoli, prompt operativi e Gatekeeper\n` +
        `• docs/wiki/INDEX.md: Master Index per Karpathy Context as RAM\n` +
        `• .agents/skills/: Skill operative eseguibili`, "Artefatti Generati");
    p.outro(chalk.bold.green("✨ Setup complete! The OS is active and ready to orchestrate your team."));
    return {
        targetPath: resolvedPath,
        stack,
        monorepo: { ...monorepoInfo, selectedWorkspaces },
        attachResult,
        mode: "interactive",
        completedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=wizard.js.map