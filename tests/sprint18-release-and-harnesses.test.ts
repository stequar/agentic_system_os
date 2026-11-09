import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SettingsManager } from "../src/core/settings-manager.js";
import { setupAgentHarnesses } from "../src/attach/harness-adapter.js";
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
      expect(mcpJson.mcpServers["agentic-company-os"].command).toBe(
        "agentic-company"
      );
      expect(mcpJson.mcpServers["agentic-company-os"].args).toEqual(["mcp"]);

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
    expect(pkg.bin["agentic-os"]).toBe("dist/index.js");
    expect(pkg.bin["agentic-company"]).toBe("dist/index.js");
    expect(pkg.scripts.prepare).toBe("npm run build");

    const indexTs = fs.readFileSync(
      path.join(rootDir, "src", "index.ts"),
      "utf-8"
    );
    expect(indexTs.startsWith("#!/usr/bin/env node")).toBe(true);

    expect(fs.existsSync(path.join(rootDir, "LICENSE"))).toBe(true);
    const readme = fs.readFileSync(path.join(rootDir, "README.md"), "utf-8");
    expect(readme).toContain("Installing & Testing on Another Machine");
    expect(readme).toContain("Anthropic Claude Code");
    expect(readme).toContain("OpenAI Codex");
    expect(readme).toContain("governance.spikeCheckpoint");
  });
});
