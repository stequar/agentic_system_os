import { type CommitMessage, type CommitType, type GatekeeperScorecard, type PullRequest } from "../contracts/git.js";
/**
 * Genera il nome standard di un branch Git per il ticket assegnato
 * es. feat/tck-7.2-git-automation
 */
export declare function generateBranchName(ticketId: string, description: string): string;
/**
 * Formatta un messaggio di commit conforme allo standard Conventional Commits
 */
export declare function formatConventionalCommit(type: CommitType, description: string, scope?: string): CommitMessage;
/**
 * Esegue il parsing di un messaggio di commit per verificare la conformità a Conventional Commits
 */
export declare function parseConventionalCommit(rawMessage: string): CommitMessage;
/**
 * Renderizza la Scorecard di Qualità e Sicurezza del Deterministic Gatekeeper in formato Markdown
 */
export declare function renderScorecardMarkdown(scorecard: GatekeeperScorecard): string;
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
export declare function generatePullRequest(options: GeneratePrOptions): PullRequest;
/**
 * Helper Git: crea e fa il checkout di un nuovo branch isolato
 */
export declare function createFeatureBranch(targetPath: string, branchName: string, baseBranch?: string): Promise<{
    success: boolean;
    branch: string;
    message: string;
}>;
/**
 * Helper Git: esegue un commit con messaggio conforme
 */
export declare function commitChanges(targetPath: string, message: string): Promise<{
    success: boolean;
    commitSha: string;
}>;
//# sourceMappingURL=workflow.d.ts.map