import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  CommitMessageSchema,
  GatekeeperScorecardSchema,
  PullRequestSchema,
  type CommitMessage,
  type CommitType,
  type GatekeeperScorecard,
  type PullRequest,
} from "../contracts/git.js";

const execAsync = promisify(exec);

/**
 * Converte testo in slug alfanumerico per branch name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Genera il nome standard di un branch Git per il ticket assegnato
 * es. feat/tck-7.2-git-automation
 */
export function generateBranchName(ticketId: string, description: string): string {
  const cleanTicket = slugify(ticketId);
  const cleanDesc = slugify(description);
  return `feat/${cleanTicket}-${cleanDesc}`;
}

/**
 * Formatta un messaggio di commit conforme allo standard Conventional Commits
 */
export function formatConventionalCommit(
  type: CommitType,
  description: string,
  scope?: string
): CommitMessage {
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
export function parseConventionalCommit(rawMessage: string): CommitMessage {
  const trimmed = rawMessage.trim();
  const regex = /^([a-z]+)(?:\(([^)]+)\))?!?: (.+)$/i;
  const match = trimmed.match(regex);

  if (!match) {
    throw new Error(`Messaggio di commit non conforme a Conventional Commits: '${rawMessage}'`);
  }

  const type = match[1].toLowerCase() as CommitType;
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
export function renderScorecardMarkdown(scorecard: GatekeeperScorecard): string {
  const validated = GatekeeperScorecardSchema.parse(scorecard);
  const passEmoji = (p: boolean) => (p ? "✅ PASSED" : "❌ FAILED");

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

export interface GeneratePrOptions {
  ticketId: string;
  title: string;
  summary: string;
  sourceBranch: string;
  targetBranch?: string;
  scorecard: GatekeeperScorecard;
  changes?: string[];
}

/**
 * Genera il payload completo della Pull Request con descrizione e Scorecard
 */
export function generatePullRequest(options: GeneratePrOptions): PullRequest {
  const targetBranch = options.targetBranch || "main";
  const changesSection =
    options.changes && options.changes.length > 0
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
export async function createFeatureBranch(
  targetPath: string,
  branchName: string,
  baseBranch: string = "main"
): Promise<{ success: boolean; branch: string; message: string }> {
  try {
    await execAsync(`git checkout -b ${branchName} ${baseBranch}`, { cwd: targetPath });
    return {
      success: true,
      branch: branchName,
      message: `Branch '${branchName}' creato con successo da '${baseBranch}'.`,
    };
  } catch (err: any) {
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
export async function commitChanges(
  targetPath: string,
  message: string
): Promise<{ success: boolean; commitSha: string }> {
  try {
    await execAsync("git add -A", { cwd: targetPath });
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: targetPath });
    const { stdout } = await execAsync("git rev-parse HEAD", { cwd: targetPath });
    return {
      success: true,
      commitSha: stdout.trim(),
    };
  } catch {
    return {
      success: false,
      commitSha: "0000000000000000000000000000000000000000",
    };
  }
}
