import { z } from "zod";

export const CommitTypeSchema = z.enum(["feat", "fix", "test", "refactor", "chore", "docs", "perf", "ci"]);
export type CommitType = z.infer<typeof CommitTypeSchema>;

export const CommitMessageSchema = z.object({
  type: CommitTypeSchema,
  scope: z.string().optional(),
  description: z.string().min(1),
  fullMessage: z.string(),
});
export type CommitMessage = z.infer<typeof CommitMessageSchema>;

export const GitBranchSchema = z.object({
  branchName: z.string(),
  baseBranch: z.string().default("main"),
  ticketId: z.string().optional(),
  isClean: z.boolean().default(true),
});
export type GitBranch = z.infer<typeof GitBranchSchema>;

export const GatekeeperScorecardSchema = z.object({
  gatekeeperPassed: z.boolean(),
  testsTotal: z.number().int().nonnegative(),
  testsFailed: z.number().int().nonnegative(),
  typecheckPassed: z.boolean(),
  linterPassed: z.boolean(),
  secretScanPassed: z.boolean(),
  dependencyAuditPassed: z.boolean(),
  commitSha: z.string(),
  sessionSafePoint: z.string().default("COMMITTED_SAFEPOINT"),
});
export type GatekeeperScorecard = z.infer<typeof GatekeeperScorecardSchema>;

export const PullRequestSchema = z.object({
  title: z.string(),
  body: z.string(),
  sourceBranch: z.string(),
  targetBranch: z.string().default("main"),
  scorecard: GatekeeperScorecardSchema,
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type PullRequest = z.infer<typeof PullRequestSchema>;
