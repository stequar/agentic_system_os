import { describe, it, expect } from "vitest";
import { generateTeamConfiguration, renderAgentsMarkdown } from "../src/generator/roles.js";
import {
  buildContextAsRamSection,
  buildGatekeeperSection,
  buildSubagentsProtocolSection,
  buildCoreKernelPrompt,
} from "../src/generator/templates/core-kernel.js";
import {
  buildMobileManagerPrompt,
  buildBackendManagerPrompt,
  buildFrontendManagerPrompt,
  buildLeadEngineerPrompt,
} from "../src/generator/templates/roles-prompts.js";
import { TeamConfigurationSchema, GeneratedRoleSchema } from "../src/contracts/roles.js";
import type { ProjectStack } from "../src/contracts/inspector.js";

describe("Role & Subagent Generator Module", () => {
  describe("Templates: Core Kernel Builder", () => {
    it("genera la sezione Context as RAM con puntatore a docs/wiki/INDEX.md", () => {
      const section = buildContextAsRamSection();
      expect(section).toContain("Context as RAM");
      expect(section).toContain("docs/wiki/INDEX.md");
      expect(section).toContain("RAM volatile e limitata");
      expect(section).toContain("Ispezione atomica");
    });

    it("genera la sezione Context as RAM con path wiki personalizzato", () => {
      const section = buildContextAsRamSection("custom/wiki/INDEX.md");
      expect(section).toContain("custom/wiki/INDEX.md");
    });

    it("genera la sezione Deterministic Gatekeeper con comando di test raccomandato", () => {
      const section = buildGatekeeperSection("pytest -v");
      expect(section).toContain("Deterministic Gatekeeper");
      expect(section).toContain("`pytest -v`");
      expect(section).toContain("Zero Allucinazioni");
      expect(section).toContain("Zero Regressioni");
    });

    it("genera la sezione Deterministic Gatekeeper di fallback senza comando esplicito", () => {
      const section = buildGatekeeperSection();
      expect(section).toContain("Deterministic Gatekeeper");
      expect(section).toContain("la suite di test del progetto");
    });

    it("genera la sezione di delega per Domain Lead L2 (enableSubagents: true)", () => {
      const section = buildSubagentsProtocolSection("L2", true);
      expect(section).toContain("Protocollo di Delega e Coordinamento (Domain Lead L2)");
      expect(section).toContain("Scomposizione Atomica");
      expect(section).toContain("enableSubagents: false");
    });

    it("genera la sezione operativa per Leaf Developer L3 (enableSubagents: false)", () => {
      const section = buildSubagentsProtocolSection("L3", false);
      expect(section).toContain("Protocollo Operativo Atomico (Leaf Developer L3)");
      expect(section).toContain("Nessun Sub-agente");
      expect(section).toContain("Test Unitari Completi");
    });

    it("assembla un core kernel prompt completo e valido", () => {
      const prompt = buildCoreKernelPrompt({
        roleId: "test_role",
        roleName: "Test Role",
        level: "L2",
        description: "Ruolo di test per assemblaggio prompt.",
        targetLanguages: ["typescript"],
        targetFrameworks: ["react"],
        recommendedTestCommand: "npm test",
        enableSubagents: true,
        enableWriteTools: true,
        domainRules: ["Regola 1 di test", "Regola 2 di test"],
      });

      expect(prompt).toContain("Test Role");
      expect(prompt).toContain("test_role");
      expect(prompt).toContain("Context as RAM");
      expect(prompt).toContain("Deterministic Gatekeeper");
      expect(prompt).toContain("Regola 1 di test");
      expect(prompt.length).toBeGreaterThan(20);
    });
  });

  describe("Templates: Specialized Roles Prompts", () => {
    it("buildMobileManagerPrompt genera prompt conforme a Swift/MVVM/[weak self]", () => {
      const prompt = buildMobileManagerPrompt();
      expect(prompt).toContain("Mobile Engineering Lead");
      expect(prompt).toContain("mobile_manager");
      expect(prompt).toContain("MVVM");
      expect(prompt).toContain("[weak self]");
      expect(prompt).toContain("swift test");
      expect(prompt).toContain("Swift Concurrency");
      expect(prompt.length).toBeGreaterThan(100);
    });

    it("buildBackendManagerPrompt genera prompt conforme a Python/FastAPI/async/Pydantic", () => {
      const prompt = buildBackendManagerPrompt();
      expect(prompt).toContain("Backend Engineering Lead");
      expect(prompt).toContain("backend_manager");
      expect(prompt).toContain("FastAPI");
      expect(prompt).toContain("Pydantic");
      expect(prompt).toContain("async def");
      expect(prompt).toContain("pytest");
      expect(prompt.length).toBeGreaterThan(100);
    });

    it("buildFrontendManagerPrompt genera prompt conforme a TypeScript/React/hooks/typecheck", () => {
      const prompt = buildFrontendManagerPrompt();
      expect(prompt).toContain("Frontend Engineering Lead");
      expect(prompt).toContain("frontend_manager");
      expect(prompt).toContain("React");
      expect(prompt).toContain("strict mode");
      expect(prompt).toContain("React Hooks");
      expect(prompt).toContain("npm test");
      expect(prompt.length).toBeGreaterThan(100);
    });

    it("buildLeadEngineerPrompt genera prompt fallback per Lead Systems Engineer", () => {
      const prompt = buildLeadEngineerPrompt({
        targetLanguages: ["go"],
        recommendedTestCommand: "go test ./...",
      });
      expect(prompt).toContain("Lead Systems Engineer");
      expect(prompt).toContain("lead_engineer");
      expect(prompt).toContain("SOLID");
      expect(prompt).toContain("go test ./...");
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  describe("generateTeamConfiguration — Scenari Architetturali", () => {
    it("Scenario 1: Stack Swift puro (iOS/macOS)", async () => {
      const swiftStack: ProjectStack = {
        targetPath: "/workspace/swift_project",
        languages: ["swift"],
        frameworks: ["swiftui"],
        hasDocker: false,
        packageManagers: ["spm"],
        testCommands: ["swift test"],
        entryPoints: ["Package.swift"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(swiftStack);

      expect(team.targetPath).toBe(swiftStack.targetPath);
      expect(team.roles).toHaveLength(1);

      const role = team.roles[0];
      expect(role.id).toBe("mobile_manager");
      expect(role.level).toBe("L2");
      expect(role.enableSubagents).toBe(true);
      expect(role.enableWriteTools).toBe(true);
      expect(role.recommendedTestCommand).toBe("swift test");
      expect(role.targetLanguages).toContain("swift");
      expect(role.targetFrameworks).toContain("swiftui");
      expect(role.systemPrompt).toContain("MVVM");
      expect(role.systemPrompt).toContain("[weak self]");

      // Validazione formale Zod
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
      expect(() => GeneratedRoleSchema.parse(role)).not.toThrow();

      // Verifica renderedAgentsMarkdown
      expect(team.renderedAgentsMarkdown.length).toBeGreaterThan(50);
      expect(team.renderedAgentsMarkdown).toContain("mobile_manager");
      expect(team.renderedAgentsMarkdown).toContain("swift test");
      expect(team.renderedAgentsMarkdown).toContain("Context as RAM");
      expect(team.renderedAgentsMarkdown).toContain("docs/wiki/INDEX.md");
      expect(team.renderedAgentsMarkdown).toContain("Deterministic Gatekeeper");
    });

    it("Scenario 2: Stack Python / FastAPI puro", async () => {
      const pythonStack: ProjectStack = {
        targetPath: "/workspace/backend_api",
        languages: ["python"],
        frameworks: ["fastapi"],
        hasDocker: false,
        packageManagers: ["pip"],
        testCommands: ["pytest"],
        entryPoints: ["main.py"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(pythonStack);

      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];
      expect(role.id).toBe("backend_manager");
      expect(role.level).toBe("L2");
      expect(role.enableSubagents).toBe(true);
      expect(role.enableWriteTools).toBe(true);
      expect(role.recommendedTestCommand).toBe("pytest");
      expect(role.targetLanguages).toContain("python");
      expect(role.targetFrameworks).toContain("fastapi");
      expect(role.systemPrompt).toContain("async def");
      expect(role.systemPrompt).toContain("Pydantic");

      // Validazione formale Zod
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();

      // Verifica renderedAgentsMarkdown
      expect(team.renderedAgentsMarkdown.length).toBeGreaterThan(50);
      expect(team.renderedAgentsMarkdown).toContain("backend_manager");
      expect(team.renderedAgentsMarkdown).toContain("pytest");
      expect(team.renderedAgentsMarkdown).toContain("Context as RAM");
      expect(team.renderedAgentsMarkdown).toContain("docs/wiki/INDEX.md");
    });

    it("Scenario 3: Stack TypeScript / React puro", async () => {
      const reactStack: ProjectStack = {
        targetPath: "/workspace/frontend_app",
        languages: ["typescript"],
        frameworks: ["react"],
        hasDocker: false,
        packageManagers: ["npm"],
        testCommands: ["npm test"],
        entryPoints: ["src/index.tsx"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(reactStack);

      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];
      expect(role.id).toBe("frontend_manager");
      expect(role.level).toBe("L2");
      expect(role.enableSubagents).toBe(true);
      expect(role.enableWriteTools).toBe(true);
      expect(role.recommendedTestCommand).toBe("npm test");
      expect(role.targetLanguages).toContain("typescript");
      expect(role.targetFrameworks).toContain("react");
      expect(role.systemPrompt).toContain("React Hooks");
      expect(role.systemPrompt).toContain("strict mode");

      // Validazione formale Zod
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();

      // Verifica renderedAgentsMarkdown
      expect(team.renderedAgentsMarkdown.length).toBeGreaterThan(50);
      expect(team.renderedAgentsMarkdown).toContain("frontend_manager");
      expect(team.renderedAgentsMarkdown).toContain("npm test");
      expect(team.renderedAgentsMarkdown).toContain("Context as RAM");
      expect(team.renderedAgentsMarkdown).toContain("docs/wiki/INDEX.md");
    });

    it("Scenario 4: Stack poliglotto (Swift + Python + Docker come fitness_project)", async () => {
      const fitnessProjectStack: ProjectStack = {
        targetPath: "/workspace/fitness_project",
        languages: ["swift", "python"],
        frameworks: ["swiftui", "fastapi"],
        hasDocker: true,
        packageManagers: ["spm", "pip"],
        testCommands: ["swift test", "pytest"],
        entryPoints: ["Package.swift", "backend/main.py"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(fitnessProjectStack);

      // Deve generare entrambi i domain lead rilevanti
      expect(team.roles).toHaveLength(2);
      const roleIds = team.roles.map((r) => r.id);
      expect(roleIds).toContain("mobile_manager");
      expect(roleIds).toContain("backend_manager");

      const mobileRole = team.roles.find((r) => r.id === "mobile_manager")!;
      const backendRole = team.roles.find((r) => r.id === "backend_manager")!;

      expect(mobileRole.level).toBe("L2");
      expect(mobileRole.enableSubagents).toBe(true);
      expect(mobileRole.recommendedTestCommand).toBe("swift test");

      expect(backendRole.level).toBe("L2");
      expect(backendRole.enableSubagents).toBe(true);
      expect(backendRole.recommendedTestCommand).toBe("pytest");

      // Validazione formale Zod
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();

      // Verifica renderedAgentsMarkdown
      expect(team.renderedAgentsMarkdown.length).toBeGreaterThan(50);
      expect(team.renderedAgentsMarkdown).toContain("mobile_manager");
      expect(team.renderedAgentsMarkdown).toContain("backend_manager");
      expect(team.renderedAgentsMarkdown).toContain("swift test");
      expect(team.renderedAgentsMarkdown).toContain("pytest");
      expect(team.renderedAgentsMarkdown).toContain("Docker");
      expect(team.renderedAgentsMarkdown).toContain("Context as RAM");
      expect(team.renderedAgentsMarkdown).toContain("docs/wiki/INDEX.md");
    });

    it("Scenario 5: Stack generico / unknown (C legacy system senza framework noti)", async () => {
      const genericStack: ProjectStack = {
        targetPath: "/workspace/c_legacy",
        languages: ["c"],
        frameworks: [],
        hasDocker: false,
        packageManagers: [],
        testCommands: ["make test"],
        entryPoints: ["main.c"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(genericStack);

      // Deve fare fallback su lead_engineer L2
      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];
      expect(role.id).toBe("lead_engineer");
      expect(role.level).toBe("L2");
      expect(role.enableSubagents).toBe(true);
      expect(role.enableWriteTools).toBe(true);
      expect(role.recommendedTestCommand).toBe("make test");
      expect(role.targetLanguages).toContain("c");

      // Validazione formale Zod
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();

      // Verifica renderedAgentsMarkdown
      expect(team.renderedAgentsMarkdown.length).toBeGreaterThan(50);
      expect(team.renderedAgentsMarkdown).toContain("lead_engineer");
      expect(team.renderedAgentsMarkdown).toContain("make test");
      expect(team.renderedAgentsMarkdown).toContain("Context as RAM");
    });

    it("Scenario 6: Stack completo trifase (Swift + Python + TypeScript/React)", async () => {
      const fullStack: ProjectStack = {
        targetPath: "/workspace/super_app",
        languages: ["swift", "python", "typescript"],
        frameworks: ["swiftui", "fastapi", "react"],
        hasDocker: true,
        packageManagers: ["spm", "pip", "npm"],
        testCommands: ["swift test", "pytest", "npm test"],
        entryPoints: ["Package.swift", "api/main.py", "web/src/index.tsx"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(fullStack);

      expect(team.roles).toHaveLength(3);
      const roleIds = team.roles.map((r) => r.id);
      expect(roleIds).toContain("mobile_manager");
      expect(roleIds).toContain("backend_manager");
      expect(roleIds).toContain("frontend_manager");

      // Verifica organigramma in markdown con 3 collegamenti da L1
      expect(team.renderedAgentsMarkdown).toContain("mobile_manager");
      expect(team.renderedAgentsMarkdown).toContain("backend_manager");
      expect(team.renderedAgentsMarkdown).toContain("frontend_manager");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("Scenario 7: Normalizzazione case-insensitive dei linguaggi e frameworks", async () => {
      const caseStack: ProjectStack = {
        targetPath: "/workspace/case_project",
        languages: ["SWIFT", "PYTHON"],
        frameworks: ["SWIFTUI", "FASTAPI"],
        hasDocker: false,
        packageManagers: [],
        testCommands: [],
        entryPoints: [],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(caseStack);

      expect(team.roles).toHaveLength(2);
      const roleIds = team.roles.map((r) => r.id);
      expect(roleIds).toContain("mobile_manager");
      expect(roleIds).toContain("backend_manager");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("Scenario 8: Test isolato di renderAgentsMarkdown", () => {
      const mockStack: ProjectStack = {
        targetPath: "/workspace/render_test",
        languages: ["python"],
        frameworks: ["fastapi"],
        hasDocker: true,
        packageManagers: ["pip"],
        testCommands: ["pytest"],
        entryPoints: ["main.py"],
        detectedAt: new Date().toISOString(),
      };

      const mockRole = {
        id: "backend_manager",
        name: "Backend Engineering Lead",
        level: "L2" as const,
        description: "Responsabile backend.",
        systemPrompt: "Sei il Backend Lead. Esegui pytest.",
        recommendedTestCommand: "pytest",
        targetLanguages: ["python"],
        targetFrameworks: ["fastapi"],
        enableSubagents: true,
        enableWriteTools: true,
      };

      const markdown = renderAgentsMarkdown(mockStack, [mockRole]);

      expect(markdown.length).toBeGreaterThan(50);
      expect(markdown).toContain("# AGENTS.md — Agentic Company Organization & Roles");
      expect(markdown).toContain("```mermaid");
      expect(markdown).toContain("backend_manager");
      expect(markdown).toContain("pytest");
      expect(markdown).toContain("docs/wiki/INDEX.md");
      expect(markdown).toContain("Karpathy Context as RAM");
    });
  });
});
