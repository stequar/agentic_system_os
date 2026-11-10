import { describe, it, expect } from "vitest";
import {
  generateBranchName,
  formatConventionalCommit,
  parseConventionalCommit,
  renderScorecardMarkdown,
  generatePullRequest,
} from "../src/git/workflow.js";
import { PullRequestSchema, GatekeeperScorecardSchema } from "../src/contracts/git.js";

describe("Git-Native Feature Branch, Conventional Commit & Automated PR Generator (TCK-7.2)", () => {
  describe("generateBranchName", () => {
    it("genera nomi di branch conformi e puliti da caratteri speciali", () => {
      const branch = generateBranchName("TCK-7.2", "Git Automation & PR Generator");
      expect(branch).toBe("feat/tck-7-2-git-automation-pr-generator");
    });
  });

  describe("formatConventionalCommit & parseConventionalCommit", () => {
    it("formatta correttamente un commit con scope", () => {
      const commit = formatConventionalCommit("feat", "aggiungi motore di safe-steering", "hitl");
      expect(commit.type).toBe("feat");
      expect(commit.scope).toBe("hitl");
      expect(commit.description).toBe("aggiungi motore di safe-steering");
      expect(commit.fullMessage).toBe("feat(hitl): aggiungi motore di safe-steering");
    });

    it("formatta correttamente un commit senza scope", () => {
      const commit = formatConventionalCommit("fix", "corretto memory leak in worker sandbox");
      expect(commit.type).toBe("fix");
      expect(commit.scope).toBeUndefined();
      expect(commit.fullMessage).toBe("fix: corretto memory leak in worker sandbox");
    });

    it("effettua il parsing di un messaggio convenzionale valido", () => {
      const parsed = parseConventionalCommit("test(gatekeeper): estendi copertura test self-healing");
      expect(parsed.type).toBe("test");
      expect(parsed.scope).toBe("gatekeeper");
      expect(parsed.description).toBe("estendi copertura test self-healing");
    });

    it("solleva un errore se il messaggio di commit non è convenzionale", () => {
      expect(() => parseConventionalCommit("WIP modifiche varie")).toThrow();
    });
  });

  describe("renderScorecardMarkdown & generatePullRequest", () => {
    const mockScorecard = GatekeeperScorecardSchema.parse({
      gatekeeperPassed: true,
      testsTotal: 175,
      testsFailed: 0,
      typecheckPassed: true,
      linterPassed: true,
      secretScanPassed: true,
      dependencyAuditPassed: true,
      commitSha: "c8f12a34567890abcdef1234567890abcdef12",
      sessionSafePoint: "COMMITTED_SAFEPOINT",
    });

    it("renderizza una scorecard Markdown accurata con tutti i check di qualità", () => {
      const md = renderScorecardMarkdown(mockScorecard);
      expect(md).toContain("Deterministic Gatekeeper Scorecard");
      expect(md).toContain("175/175 passati");
      expect(md).toContain("0 errori TypeScript");
      expect(md).toContain("Zero token o chiavi private rilevate");
      expect(md).toContain("Zero falle High/Critical");
      expect(md).toContain("c8f12a3");
    });

    it("genera il payload completo della Pull Request validato con Zod", () => {
      const pr = generatePullRequest({
        ticketId: "TCK-7.2",
        title: "Git-Native Collaboration & PR Scorecard Engine",
        summary: "Implementato isolamento dei branch, convenzione commit semantici e generazione PR.",
        sourceBranch: "feat/tck-7-2-git-automation",
        scorecard: mockScorecard,
        changes: [
          "Definiti contratti Zod per Git e PR Scorecard",
          "Aggiunto workflow di branch e commit convenzionali",
          "Scorecard crittografica integrata nella PR",
        ],
      });

      expect(pr.title).toBe("Git-Native Collaboration & PR Scorecard Engine");
      expect(pr.sourceBranch).toBe("feat/tck-7-2-git-automation");
      expect(pr.targetBranch).toBe("main");
      expect(pr.body).toContain("## 🚀 Pull Request");
      expect(pr.body).toContain("Scorecard");
      expect(pr.body).toContain("Definiti contratti Zod per Git");

      const parsed = PullRequestSchema.safeParse(pr);
      expect(parsed.success).toBe(true);
    });
  });
});
