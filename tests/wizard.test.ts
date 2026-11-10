import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  detectMonorepoWorkspaces,
  runScaffoldingWizard,
} from "../src/cli/wizard.js";

describe("Interactive Scaffolding Wizard & Monorepo Detection (TCK-5.4)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "wizard-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe("detectMonorepoWorkspaces", () => {
    it("rileva un monorepo pnpm tramite pnpm-workspace.yaml", async () => {
      const pnpmConfig = `packages:
  - 'packages/*'
  - 'apps/*'
`;
      await fs.writeFile(path.join(tempDir, "pnpm-workspace.yaml"), pnpmConfig, "utf-8");

      const result = await detectMonorepoWorkspaces(tempDir);
      expect(result.isMonorepo).toBe(true);
      expect(result.type).toBe("pnpm");
      expect(result.workspaces).toEqual(["packages/*", "apps/*"]);
    });

    it("rileva un monorepo npm/yarn tramite package.json con campo workspaces", async () => {
      const packageJson = {
        name: "my-npm-monorepo",
        workspaces: ["packages/*", "tools/*"],
      };
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify(packageJson, null, 2),
        "utf-8"
      );

      const result = await detectMonorepoWorkspaces(tempDir);
      expect(result.isMonorepo).toBe(true);
      expect(result.type).toBe("npm/yarn");
      expect(result.workspaces).toEqual(["packages/*", "tools/*"]);
    });

    it("rileva un workspace Cargo tramite Cargo.toml con [workspace]", async () => {
      const cargoToml = `[workspace]
members = [
    "crates/core",
    "crates/cli",
]
`;
      await fs.writeFile(path.join(tempDir, "Cargo.toml"), cargoToml, "utf-8");

      const result = await detectMonorepoWorkspaces(tempDir);
      expect(result.isMonorepo).toBe(true);
      expect(result.type).toBe("cargo");
      expect(result.workspaces).toEqual(["crates/core", "crates/cli"]);
    });

    it("rileva un monorepo basato su struttura directory standard (apps/ e packages/)", async () => {
      await fs.mkdir(path.join(tempDir, "apps"), { recursive: true });
      await fs.mkdir(path.join(tempDir, "packages"), { recursive: true });

      const result = await detectMonorepoWorkspaces(tempDir);
      expect(result.isMonorepo).toBe(true);
      expect(result.type).toBe("directory-structure");
      expect(result.workspaces).toContain("apps");
      expect(result.workspaces).toContain("packages");
    });

    it("restituisce isMonorepo: false per repository standard a singolo package", async () => {
      const packageJson = {
        name: "single-package-repo",
        version: "1.0.0",
      };
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify(packageJson, null, 2),
        "utf-8"
      );

      const result = await detectMonorepoWorkspaces(tempDir);
      expect(result.isMonorepo).toBe(false);
      expect(result.workspaces).toHaveLength(0);
    });
  });

  describe("runScaffoldingWizard (Headless Execution)", () => {
    it("esegue il wizard headless con { nonInteractive: true } e genera la struttura Agentic Company OS", async () => {
      // Setup progetto TypeScript target
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "wizard-target", scripts: { test: "vitest run" } }, null, 2),
        "utf-8"
      );
      await fs.writeFile(path.join(tempDir, "tsconfig.json"), "{}", "utf-8");

      const result = await runScaffoldingWizard(tempDir, { nonInteractive: true });

      expect(result.mode).toBe("headless");
      expect(result.targetPath).toBe(tempDir);
      expect(result.stack.languages).toContain("typescript");
      expect(result.attachResult.success).toBe(true);

      // Verifica creazione file di governance e knowledge base
      const agentsExists = await fs
        .stat(path.join(tempDir, "AGENTS.md"))
        .then(() => true)
        .catch(() => false);
      expect(agentsExists).toBe(true);

      const skillExists = await fs
        .stat(path.join(tempDir, ".agents", "skills", "run-company", "SKILL.md"))
        .then(() => true)
        .catch(() => false);
      expect(skillExists).toBe(true);

      const wikiExists = await fs
        .stat(path.join(tempDir, "docs", "wiki", "INDEX.md"))
        .then(() => true)
        .catch(() => false);
      expect(wikiExists).toBe(true);
    });

    it("supporta output JSON strutturato con { json: true }", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "json-target" }, null, 2),
        "utf-8"
      );

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await runScaffoldingWizard(tempDir, { json: true });

      expect(result.mode).toBe("headless");
      expect(result.targetPath).toBe(tempDir);
      expect(consoleSpy).toHaveBeenCalled();

      // Verifica che sia stato stampato un JSON valido
      const loggedJson = consoleSpy.mock.calls.find((call) => {
        try {
          const parsed = JSON.parse(call[0]);
          return parsed.mode === "headless";
        } catch {
          return false;
        }
      });
      expect(loggedJson).toBeDefined();
    });

    it("funziona con il flag rapido { yes: true }", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "yes-target" }, null, 2),
        "utf-8"
      );

      const result = await runScaffoldingWizard(tempDir, { yes: true });
      expect(result.mode).toBe("headless");
      expect(result.attachResult.success).toBe(true);
    });
  });
});
