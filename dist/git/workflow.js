import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CommitMessageSchema, GatekeeperScorecardSchema, PullRequestSchema, } from "../contracts/git.js";
// Git senza shell (argv diretto) per eliminare la shell injection.
const execFileAsync = promisify(execFile);
async function git(cwd, args) {
    return execFileAsync("git", args, { cwd });
}
/**
 * Valida un riferimento Git prima di passarlo a `git` (difesa in profondità sopra execFile):
 * niente leading dash, `..`, caratteri fuori dal set sicuro o slash malformati.
 */
function assertSafeGitRef(ref, kind) {
    if (typeof ref !== "string" ||
        ref.length === 0 ||
        ref.startsWith("-") ||
        ref.includes("..") ||
        ref.includes("//") ||
        ref.endsWith("/") ||
        !/^[A-Za-z0-9._\/-]+$/.test(ref)) {
        throw new Error(`INVALID_GIT_REF: '${ref}' non è un ${kind} Git valido.`);
    }
}
/**
 * Converte testo in slug alfanumerico per branch name
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
/**
 * Genera il nome standard di un branch Git per il ticket assegnato
 * es. feat/tck-7.2-git-automation
 */
export function generateBranchName(ticketId, description) {
    const cleanTicket = slugify(ticketId);
    const cleanDesc = slugify(description);
    return `feat/${cleanTicket}-${cleanDesc}`;
}
/**
 * Formatta un messaggio di commit conforme allo standard Conventional Commits
 */
export function formatConventionalCommit(type, description, scope) {
    const cleanDesc = description.trim();
    const cleanScope = scope ? slugify(scope) : undefined;
    const fullMessage = cleanScope ? `${type}(${cleanScope}): ${cleanDesc}` : `${type}: ${cleanDesc}`;
    return CommitMessageSchema.parse({
        type,
        scope: cleanScope,
        description: cleanDesc,
        fullMessage,
    });
}
/**
 * Esegue il parsing di un messaggio di commit per verificare la conformità a Conventional Commits
 */
export function parseConventionalCommit(rawMessage) {
    const trimmed = rawMessage.trim();
    const regex = /^([a-z]+)(?:\(([^)]+)\))?!?: (.+)$/i;
    const match = trimmed.match(regex);
    if (!match) {
        throw new Error(`Commit message not Conventional-Commits compliant: '${rawMessage}'`);
    }
    const type = match[1].toLowerCase();
    const scope = match[2]?.trim();
    const description = match[3]?.trim();
    return CommitMessageSchema.parse({
        type,
        scope,
        description,
        fullMessage: trimmed,
    });
}
/**
 * Renderizza la Scorecard di Qualità e Sicurezza del Deterministic Gatekeeper in formato Markdown
 */
export function renderScorecardMarkdown(scorecard) {
    const validated = GatekeeperScorecardSchema.parse(scorecard);
    const passEmoji = (p) => (p ? "✅ PASSED" : "❌ FAILED");
    return `### 🛡️ Deterministic Gatekeeper Scorecard

| Controllo di Qualità & Sicurezza | Esito Deterministico | Dettagli |
| :--- | :--- | :--- |
| **Test Suite Globale** | ${passEmoji(validated.testsFailed === 0 && validated.gatekeeperPassed)} | ${validated.testsTotal - validated.testsFailed}/${validated.testsTotal} passati (${validated.testsFailed} falliti) |
| **Typecheck Statico (tsc)** | ${passEmoji(validated.typecheckPassed)} | 0 errori TypeScript |
| **Linter Determinante** | ${passEmoji(validated.linterPassed)} | Regole di stile e formattazione |
| **Secret Scan (Dual-Tier)** | ${passEmoji(validated.secretScanPassed)} | Zero token o chiavi private rilevate |
| **Dependency CVE & Licenze** | ${passEmoji(validated.dependencyAuditPassed)} | Zero falle High/Critical, licenze ammesse |
| **Safe-Point Checkpoint** | 🔒 COMMITTED | Commit SHA: \`${validated.commitSha.slice(0, 7)}\` |
`;
}
/**
 * Genera il payload completo della Pull Request con descrizione e Scorecard
 */
export function generatePullRequest(options) {
    const targetBranch = options.targetBranch || "main";
    const changesSection = options.changes && options.changes.length > 0
        ? `\n### 📝 Modifiche Implementate\n${options.changes.map((c) => `- ${c}`).join("\n")}\n`
        : "";
    const scorecardMd = renderScorecardMarkdown(options.scorecard);
    const body = `## 🚀 Pull Request: ${options.title}
**Ticket Collegato:** \`${options.ticketId}\`  
**Branch Origine:** \`${options.sourceBranch}\` $\\rightarrow$ **Branch Destinazione:** \`${targetBranch}\`

### 📋 Sintesi Operativa
${options.summary}
${changesSection}
${scorecardMd}

---
*Generato automaticamente da Agentic Company OS (Git-Native Collaboration Engine).*
`;
    return PullRequestSchema.parse({
        title: options.title,
        body,
        sourceBranch: options.sourceBranch,
        targetBranch,
        scorecard: options.scorecard,
        createdAt: new Date().toISOString(),
    });
}
/**
 * Helper Git: crea e fa il checkout di un nuovo branch isolato
 */
export async function createFeatureBranch(targetPath, branchName, baseBranch = "main") {
    try {
        assertSafeGitRef(branchName, "branch name");
        assertSafeGitRef(baseBranch, "base branch");
        await git(targetPath, ["checkout", "-b", branchName, baseBranch]);
        return {
            success: true,
            branch: branchName,
            message: `Branch '${branchName}' creato con successo da '${baseBranch}'.`,
        };
    }
    catch (err) {
        return {
            success: false,
            branch: branchName,
            message: err.message || String(err),
        };
    }
}
/**
 * Helper Git: esegue un commit con messaggio conforme
 */
export async function commitChanges(targetPath, message) {
    try {
        await git(targetPath, ["add", "-A"]);
        // Il messaggio è passato come argv (nessuna shell): niente escaping, niente injection.
        await git(targetPath, ["commit", "-m", message]);
        const { stdout } = await git(targetPath, ["rev-parse", "HEAD"]);
        return {
            success: true,
            commitSha: stdout.trim(),
        };
    }
    catch {
        return {
            success: false,
            commitSha: "0000000000000000000000000000000000000000",
        };
    }
}
//# sourceMappingURL=workflow.js.map