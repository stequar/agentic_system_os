import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { detectProjectStack } from "../src/inspector/detector.js";
import { generateTeamConfiguration } from "../src/generator/roles.js";
import {
  buildGoManagerPrompt,
  buildRustManagerPrompt,
  buildMobileManagerPrompt,
} from "../src/generator/templates/roles-prompts.js";
import { TeamConfigurationSchema } from "../src/contracts/roles.js";

describe("Universal Multi-Stack Scaffolding Engine (TCK-4.1)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "stack-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup best effort
    }
  });

  describe("Inspector: Go Stack Detection", () => {
    it("rileva correttamente un progetto Go con go.mod, go.sum e main.go", async () => {
      const goModContent = `module github.com/example/goservice\n\ngo 1.22\n`;
      await fs.writeFile(path.join(tempDir, "go.mod"), goModContent);
      await fs.writeFile(path.join(tempDir, "go.sum"), "");
      await fs.writeFile(path.join(tempDir, "main.go"), "package main\nfunc main() {}\n");

      const stack = await detectProjectStack(tempDir);

      expect(stack.languages).toContain("go");
      expect(stack.packageManagers).toContain("go");
      expect(stack.testCommands).toContain("go test ./...");
      expect(stack.entryPoints).toContain("main.go");
    });
  });

  describe("Inspector: Rust Stack Detection", () => {
    it("rileva correttamente un progetto Rust con Cargo.toml, src/main.rs e src/lib.rs", async () => {
      const cargoTomlContent = `[package]\nname = "rust_engine"\nversion = "0.1.0"\nedition = "2021"\n`;
      await fs.writeFile(path.join(tempDir, "Cargo.toml"), cargoTomlContent);
      await fs.writeFile(path.join(tempDir, "Cargo.lock"), "");
      await fs.mkdir(path.join(tempDir, "src"), { recursive: true });
      await fs.writeFile(path.join(tempDir, "src/main.rs"), "fn main() {}\n");
      await fs.writeFile(path.join(tempDir, "src/lib.rs"), "pub fn add(a: i32, b: i32) -> i32 { a + b }\n");

      const stack = await detectProjectStack(tempDir);

      expect(stack.languages).toContain("rust");
      expect(stack.packageManagers).toContain("cargo");
      expect(stack.testCommands).toContain("cargo test");
      expect(stack.entryPoints).toContain("src/main.rs");
      expect(stack.entryPoints).toContain("src/lib.rs");
    });
  });

  describe("Inspector: Kotlin Multiplatform (KMP) Detection", () => {
    it("rileva correttamente un progetto KMP con build.gradle.kts e plugin multiplatform", async () => {
      const gradleKtsContent = `
        plugins {
            kotlin("multiplatform") version "1.9.22"
        }
        kotlin {
            jvm()
            iosArm64()
        }
      `;
      await fs.writeFile(path.join(tempDir, "build.gradle.kts"), gradleKtsContent);
      await fs.mkdir(path.join(tempDir, "src/commonMain/kotlin"), { recursive: true });
      await fs.writeFile(path.join(tempDir, "src/commonMain/kotlin/App.kt"), "class App\n");

      const stack = await detectProjectStack(tempDir);

      expect(stack.languages).toContain("kotlin");
      expect(stack.frameworks).toContain("kmp");
      expect(stack.packageManagers).toContain("gradle");
      expect(stack.testCommands).toContain("./gradlew test");
    });
  });

  describe("Inspector: Flutter / Dart Detection", () => {
    it("rileva correttamente un progetto Flutter con pubspec.yaml e lib/main.dart", async () => {
      const pubspecContent = `
        name: flutter_super_app
        description: A new Flutter project.
        environment:
          sdk: '>=3.0.0 <4.0.0'
        dependencies:
          flutter:
            sdk: flutter
      `;
      await fs.writeFile(path.join(tempDir, "pubspec.yaml"), pubspecContent);
      await fs.mkdir(path.join(tempDir, "lib"), { recursive: true });
      await fs.writeFile(path.join(tempDir, "lib/main.dart"), "void main() {}\n");

      const stack = await detectProjectStack(tempDir);

      expect(stack.languages).toContain("dart");
      expect(stack.frameworks).toContain("flutter");
      expect(stack.packageManagers).toContain("flutter");
      expect(stack.testCommands).toContain("flutter test");
      expect(stack.entryPoints).toContain("lib/main.dart");
    });
  });

  describe("Dynamic Roles: Generation for Go, Rust, KMP and Flutter", () => {
    it("genera go_manager per stack Go con prompt specializzato", async () => {
      const goStack = {
        targetPath: tempDir,
        languages: ["go"],
        frameworks: [],
        hasDocker: false,
        packageManagers: ["go"],
        testCommands: ["go test ./..."],
        entryPoints: ["main.go"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(goStack);
      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];

      expect(role.id).toBe("go_manager");
      expect(role.level).toBe("L2");
      expect(role.recommendedTestCommand).toBe("go test ./...");
      expect(role.systemPrompt).toContain("goroutine");
      expect(role.systemPrompt).toContain("if err != nil");
      expect(role.systemPrompt).toContain("go test ./...");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("genera rust_manager per stack Rust con prompt specializzato su borrow checker", async () => {
      const rustStack = {
        targetPath: tempDir,
        languages: ["rust"],
        frameworks: [],
        hasDocker: false,
        packageManagers: ["cargo"],
        testCommands: ["cargo test"],
        entryPoints: ["src/main.rs"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(rustStack);
      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];

      expect(role.id).toBe("rust_manager");
      expect(role.level).toBe("L2");
      expect(role.recommendedTestCommand).toBe("cargo test");
      expect(role.systemPrompt).toContain("borrow checker");
      expect(role.systemPrompt).toContain("unsafe");
      expect(role.systemPrompt).toContain("clippy");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("genera mobile_manager per stack KMP con regole expect/actual", async () => {
      const kmpStack = {
        targetPath: tempDir,
        languages: ["kotlin"],
        frameworks: ["kmp"],
        hasDocker: false,
        packageManagers: ["gradle"],
        testCommands: ["./gradlew test"],
        entryPoints: [],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(kmpStack);
      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];

      expect(role.id).toBe("mobile_manager");
      expect(role.recommendedTestCommand).toBe("./gradlew test");
      expect(role.systemPrompt).toContain("Kotlin Multiplatform");
      expect(role.systemPrompt).toContain("Expect / Actual");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("genera mobile_manager per stack Flutter con regole widget reattivi e null safety", async () => {
      const flutterStack = {
        targetPath: tempDir,
        languages: ["dart"],
        frameworks: ["flutter"],
        hasDocker: false,
        packageManagers: ["flutter"],
        testCommands: ["flutter test"],
        entryPoints: ["lib/main.dart"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(flutterStack);
      expect(team.roles).toHaveLength(1);
      const role = team.roles[0];

      expect(role.id).toBe("mobile_manager");
      expect(role.recommendedTestCommand).toBe("flutter test");
      expect(role.systemPrompt).toContain("Flutter");
      expect(role.systemPrompt).toContain("StatelessWidget");
      expect(role.systemPrompt).toContain("Sound Null Safety");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });

    it("genera molteplici Domain Lead dedicati per un ecosistema poliglotto complesso", async () => {
      const polyglotStack = {
        targetPath: tempDir,
        languages: ["go", "rust", "dart"],
        frameworks: ["flutter"],
        hasDocker: true,
        packageManagers: ["go", "cargo", "flutter"],
        testCommands: ["go test ./...", "cargo test", "flutter test"],
        entryPoints: ["main.go", "src/main.rs", "lib/main.dart"],
        detectedAt: new Date().toISOString(),
      };

      const team = await generateTeamConfiguration(polyglotStack);
      expect(team.roles).toHaveLength(3);

      const roleIds = team.roles.map((r) => r.id);
      expect(roleIds).toContain("go_manager");
      expect(roleIds).toContain("rust_manager");
      expect(roleIds).toContain("mobile_manager");
      expect(() => TeamConfigurationSchema.parse(team)).not.toThrow();
    });
  });
});
