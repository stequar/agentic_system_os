import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SettingsManager } from "../src/core/settings-manager.js";
import { setupAgentHarnesses } from "../src/attach/harness-adapter.js";
import { runHolisticWorkspaceBootstrap } from "../src/bootstrap/holistic-bootstrap.js";
import { workflowCommand } from "../src/cli/commands/workflow.js";

describe("Sprint 18: Open Source Public Release (v1.0.0), Professional Persona Taxonomy, English-First Localization & Claude Code / Codex Adapter", () => {
  it("sets English ('en') and 'ENGINEERING_PROFESSIONAL' ('Project Lead' & 'Lead Orchestrator L1') as primary defaults in settings", () => {
    const defaults = SettingsManager.getDefaultSettings();
    expect(defaults.communication.language).toBe("en");
    expect(defaults.communication.personaPreset).toBe(
      "ENGINEERING_PROFESSIONAL"
    );

    const catalog = SettingsManager.getReferenceCatalog();
    const presetEntry = catalog.find(
      (e) => e.key === "communication.personaPreset"
    );
    expect(presetEntry).toBeDefined();
    expect(presetEntry?.possibleValues).toEqual([
      "ENGINEERING_PROFESSIONAL",
      "STARTUP_EXECUTIVE",
    ]);

    const langEntry = catalog.find((e) => e.key === "communication.language");
    expect(langEntry?.defaultValue).toBe("en");
  });

  it("generates CLAUDE.md, .claude/commands/*.md, and .mcp.json for Anthropic Claude Code & OpenAI Codex", async () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "claude-codex-harness-")
    );
    try {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "demo-app", scripts: { test: "vitest run" } }),
        "utf-8"
      );

      const res = await setupAgentHarnesses(tmpDir);
      expect(res.personaPreset).toBe("ENGINEERING_PROFESSIONAL");
      expect(res.language).toBe("en");
      expect(res.humanTitle).toBe("Project Lead");
      expect(res.orchestratorTitle).toBe("Lead Orchestrator (L1)");
      expect(res.generatedFiles).toHaveLength(6);

      const claudeMd = fs.readFileSync(path.join(tmpDir, "CLAUDE.md"), "utf-8");
      expect(claudeMd).toContain("Project Lead (Human Decision-Maker)");
      expect(claudeMd).toContain("Lead Orchestrator (L1) (Primary Agent — You)");
      expect(claudeMd).toContain("[ORCHESTRATOR MODE: 1 — STANDUP]");
      expect(claudeMd).toContain("CFF-5 (Configurable Spike Checkpoint Gate)");

      const mcpJson = JSON.parse(
        fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")
      );
      expect(mcpJson.mcpServers["agentic-system-os"].command).toBe("node");
      expect(mcpJson.mcpServers["agentic-system-os"].args).toEqual([
        ".company-os/bin/agentic-os.mjs",
        "mcp",
      ]);
      expect(mcpJson.mcpServers["agentic-company-os"]).toBeUndefined();
      expect(
        fs.existsSync(path.join(tmpDir, ".company-os", "settings.json"))
      ).toBe(true);

      const localShimPath = path.join(
        tmpDir,
        ".company-os",
        "bin",
        "agentic-os.mjs"
      );
      expect(fs.existsSync(localShimPath)).toBe(true);
      const shimContent = fs.readFileSync(localShimPath, "utf-8");
      expect(shimContent).toContain("github:stequar/agentic_system_os");

      const expectedCommands = [
        "run-company.md",
        "investigate-anomaly.md",
        "rnd-roundtable.md",
        "gatekeeper-audit.md",
      ];
      for (const cmdFile of expectedCommands) {
        const fullCmdPath = path.join(tmpDir, ".claude", "commands", cmdFile);
        expect(fs.existsSync(fullCmdPath)).toBe(true);
        const content = fs.readFileSync(fullCmdPath, "utf-8");
        expect(content).toContain("Lead Orchestrator (L1)");
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("supports switching to STARTUP_EXECUTIVE preset via workflow CLI and re-rendering harnesses", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "preset-switch-test-"));
    try {
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ name: "startup-app" }),
        "utf-8"
      );

      SettingsManager.updateSettingByPath(
        tmpDir,
        "communication.personaPreset",
        "STARTUP_EXECUTIVE"
      );

      const outputs: string[] = [];
      const ctx = {
        cwd: tmpDir,
        stdout: (msg: string) => outputs.push(msg),
        stderr: (msg: string) => outputs.push(msg),
        exit: () => {},
      };

      await workflowCommand(ctx, "setup-harnesses", tmpDir, { json: true });
      const parsed = JSON.parse(outputs[outputs.length - 1]);
      expect(parsed.personaPreset).toBe("STARTUP_EXECUTIVE");
      expect(parsed.humanTitle).toBe("CEO");

      const claudeMd = fs.readFileSync(path.join(tmpDir, "CLAUDE.md"), "utf-8");
      expect(claudeMd).toContain("CEO (Human Decision-Maker)");
      expect(claudeMd).toContain("[CTO MODE: 1 — STANDUP]");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("verifies package.json v1.0.0 portability, shebang, LICENSE, and English README.md", () => {
    const rootDir = process.cwd();
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf-8")
    );
    expect(pkg.name).toBe("@stequar/agentic-system-os");
    expect(pkg.version).toBe("1.0.0");
    expect(pkg.bin["agentic-system-os"]).toBe("dist/index.js");
    expect(pkg.bin["agentic_system_os"]).toBe("dist/index.js");
    expect(pkg.bin["agentic-os"]).toBe("dist/index.js");
    expect(pkg.bin["agentic-company"]).toBe("dist/index.js");

    const indexTs = fs.readFileSync(
      path.join(rootDir, "src", "index.ts"),
      "utf-8"
    );
    expect(indexTs.startsWith("#!/usr/bin/env node")).toBe(true);

    expect(fs.existsSync(path.join(rootDir, "LICENSE"))).toBe(true);
    const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf-8");
    expect(readme).toContain("Install & Run (Zero-Clone");
    expect(readme).toContain("Anthropic Claude Code");
    expect(readme).toContain("OpenAI Codex");
    expect(readme).toContain("governance.spikeCheckpoint");
    // Capability-honesty: the README must not resurrect the removed "formal prover" claim.
    expect(readme).not.toContain("Neuro-Symbolic Formal");
  });

  it("preserves existing CLAUDE.md, .mcp.json servers, avoids Fitness fixtures, and accurately mines Angular + pnpm + Jest brownfield repos (xfarm-client regression test)", async () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "xfarm-brownfield-regression-")
    );
    try {
      // 1. Existing Angular + pnpm + Jest setup
      fs.writeFileSync(
        path.join(tmpDir, "package.json"),
        JSON.stringify({
          name: "xfarm-client",
          dependencies: { "@angular/core": "^18.0.0" },
          devDependencies: { jest: "^29.0.0", "jest-preset-angular": "^14.0.0" },
          scripts: { test: "jest" },
        }),
        "utf-8"
      );
      fs.writeFileSync(
        path.join(tmpDir, "pnpm-lock.yaml"),
        "lockfileVersion: '9.0'\n",
        "utf-8"
      );
      fs.writeFileSync(
        path.join(tmpDir, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { strict: true } }),
        "utf-8"
      );

      // 2. Existing CLAUDE.md & .mcp.json
      const originalClaudeMd =
        "# xFarm Team Guide\n## Hard Rules\n- Use Angular Signals.\n## Routing\nSee @AGENTS.md and docs/wiki.\n";
      fs.writeFileSync(path.join(tmpDir, "CLAUDE.md"), originalClaudeMd, "utf-8");

      const originalMcpJson = {
        mcpServers: {
          "angular-cli": { command: "npx", args: ["@angular/cli", "mcp"] },
          primeng: { command: "npx", args: ["primeng-mcp"] },
          context7: { command: "npx", args: ["@upstash/context7-mcp"] },
        },
      };
      fs.writeFileSync(
        path.join(tmpDir, ".mcp.json"),
        JSON.stringify(originalMcpJson, null, 2),
        "utf-8"
      );

      // 3. Domain folders ('nutrition/' for crop nutrition, 'invoices/' for farming invoices, plus UI plumbing folders 'pipe/' & 'graph/' that must be ignored, plus .claude/wiki/)
      fs.mkdirSync(path.join(tmpDir, "src/app/nutrition"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "src/app/nutrition/crop-nutrition.service.ts"),
        "export class CropNutritionService {}\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, "src/app/invoices"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "src/app/invoices/invoice-list.component.ts"),
        "export class InvoiceListComponent {}\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, "src/app/pipe"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "src/app/pipe/date-format.pipe.ts"),
        "export class DateFormatPipe {}\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, "src/app/graph"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "src/app/graph/chart.component.ts"),
        "export class ChartComponent {}\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, ".claude/wiki"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".claude/wiki/agronomy-domain.md"),
        "# Agronomy Domain Guide\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, ".git/info"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, ".git/info/exclude"),
        "# git ls-files --others --exclude-from=.git/info/exclude\n",
        "utf-8"
      );
      fs.mkdirSync(path.join(tmpDir, "tools"), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, "tools/i18n_helper.py"),
        "print('helper')\n",
        "utf-8"
      );

      const report = await runHolisticWorkspaceBootstrap(tmpDir, {
        doctorTimeoutMs: 1500,
      });

      // Verify 1: CLAUDE.md preserved existing Hard Rules, Routing, and @AGENTS.md, with zero hardcoded /Users/ paths
      const mergedClaude = fs.readFileSync(
        path.join(tmpDir, "CLAUDE.md"),
        "utf-8"
      );
      expect(mergedClaude).toContain("# xFarm Team Guide");
      expect(mergedClaude).toContain("## Hard Rules");
      expect(mergedClaude).toContain("See @AGENTS.md and docs/wiki.");
      expect(mergedClaude).toContain(
        '<!-- AGENTIC-OS:MANAGED:START id="claude-code-governance"'
      );
      expect(mergedClaude).not.toContain(tmpDir);

      // Verify 1b: Portable shim has zero hardcoded /Users/ paths and uses os.homedir()
      const shimText = fs.readFileSync(
        path.join(tmpDir, ".company-os/bin/agentic-os.mjs"),
        "utf-8"
      );
      expect(shimText).toContain("os.homedir()");
      expect(shimText).not.toContain("/Users/");

      // Verify 1c: Generated docs (AGENTS.md, roadmap.md, backlog.md, CEO_Dashboard.md) are in English and frontend_manager uses Angular + pnpm test
      const agentsMd = fs.readFileSync(
        path.join(tmpDir, "AGENTS.md"),
        "utf-8"
      );
      expect(agentsMd).toContain("## 1. Detected Technology Stack");
      expect(agentsMd).toContain("Angular Signals");
      expect(agentsMd).toContain("pnpm test");
      expect(agentsMd).not.toContain("React Hooks");

      const roadmapMd = fs.readFileSync(
        path.join(tmpDir, "docs/wiki/product/roadmap.md"),
        "utf-8"
      );
      expect(roadmapMd).toContain("## 🎯 Product Vision");

      const indexMd = fs.readFileSync(
        path.join(tmpDir, "docs/wiki/INDEX.md"),
        "utf-8"
      );
      expect(indexMd).toContain(".claude/wiki/agronomy-domain.md");

      const gitExclude = fs.readFileSync(
        path.join(tmpDir, ".git/info/exclude"),
        "utf-8"
      );
      expect(gitExclude).toContain(".company-os/");

      // Verify 2: .mcp.json preserved angular-cli, primeng, context7 and added agentic-system-os
      const mergedMcp = JSON.parse(
        fs.readFileSync(path.join(tmpDir, ".mcp.json"), "utf-8")
      );
      expect(mergedMcp.mcpServers["angular-cli"]).toBeDefined();
      expect(mergedMcp.mcpServers["primeng"]).toBeDefined();
      expect(mergedMcp.mcpServers["context7"]).toBeDefined();
      expect(mergedMcp.mcpServers["agentic-system-os"]).toBeDefined();
      expect(mergedMcp.mcpServers["agentic-company-os"]).toBeUndefined();

      // Verify 3: .company-os/settings.json exists on disk
      expect(
        fs.existsSync(path.join(tmpDir, ".company-os", "settings.json"))
      ).toBe(true);

      // Verify 4: No Fitness Project files leaked into the Angular repo
      expect(
        fs.existsSync(path.join(tmpDir, "src/backend/api/synced_schemas.py"))
      ).toBe(false);
      expect(fs.existsSync(path.join(tmpDir, "src/ios"))).toBe(false);

      // Verify 5: Stack detected as TypeScript + Angular + Jest + pnpm test (NOT Python/Dart/Flutter)
      expect(report.stack.languages).toContain("typescript");
      expect(report.stack.languages).not.toContain("python");
      expect(report.stack.languages).not.toContain("dart");
      expect(report.stack.frameworks).toContain("angular");
      expect(report.stack.frameworks).toContain("jest");
      expect(report.hermeticTestCommands).toContain("pnpm test");
      expect(report.hermeticTestCommands).not.toContain("pytest");
      expect(report.hermeticTestCommands).not.toContain("flutter test");

      // Verify 6: Ring-2 Domain Experts reflect real repo modules (ignoring UI folders 'pipe' and 'graph'), NOT clinical diet or fintech ledger
      const ring2Ids = report.orgChart.ring2DomainExperts.map((e) => e.id);
      expect(ring2Ids).not.toContain("nutrition_metabolic_specialist");
      expect(ring2Ids).not.toContain("fintech_ledger_specialist");
      expect(ring2Ids).not.toContain("pipe_domain_specialist");
      expect(ring2Ids).not.toContain("graph_domain_specialist");
      expect(ring2Ids).toContain("nutrition_domain_specialist");
      expect(ring2Ids).toContain("invoices_domain_specialist");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
