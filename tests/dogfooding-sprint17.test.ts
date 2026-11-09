import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DoctorReportSchema } from "../src/contracts/doctor.js";
import { runEnvironmentDoctor } from "../src/doctor/health.js";
import { createMemoryContext } from "../src/cli/context.js";
import { createCliApp } from "../src/cli/dispatcher.js";
import {
  generatePydanticV2Models,
  generateSwiftCodableModels,
  syncCrossDomainContracts,
} from "../src/sync/contract-sync.js";
import {
  FITNESS_PROJECT_UNIFIED_CONTRACT,
  DogfoodingReportSchema,
  runFitnessProjectDogfooding,
} from "../src/dogfooding/fitness-runner.js";

describe("Sprint 17 — Enterprise Dogfooding, Environment Doctor & Cross-Domain Contract Sync", () => {
  describe("TCK-17.1: Environment Doctor & CLI `agentic-company doctor`", () => {
    it("should run parallel environment probes and return a valid DoctorReport", async () => {
      const report = await runEnvironmentDoctor(process.cwd(), { timeoutMs: 2500 });
      const parsed = DoctorReportSchema.parse(report);

      expect(parsed.targetPath).toBe(path.resolve(process.cwd()));
      expect(["ok", "warn", "error"]).toContain(parsed.overallStatus);

      const checkNames = parsed.checks.map((c) => c.checkName);
      expect(checkNames).toContain("git");
      expect(checkNames).toContain("python3");
      expect(checkNames).toContain("venv");
      expect(checkNames).toContain("swiftc");
      expect(checkNames).toContain("docker");

      const gitCheck = parsed.checks.find((c) => c.checkName === "git");
      expect(gitCheck?.status).toBe("ok");
      expect(gitCheck?.version).toBeTruthy();
    });

    it("should execute `doctor [path] --json` in-memory via createCliApp", async () => {
      const ctx = createMemoryContext(process.cwd());
      const app = createCliApp(ctx);

      await app.parseAsync(["node", "agentic-company", "doctor", process.cwd(), "--json"]);

      const stdout = ctx.getStdout();
      const parsed = DoctorReportSchema.parse(JSON.parse(stdout));
      expect(parsed.checks.length).toBeGreaterThanOrEqual(5);
      expect(ctx.getExitCode()).toBeNull();
    });
  });

  describe("TCK-17.2: Cross-Domain Contract Synchronizer (Python Pydantic v2 <-> Swift 6 Codable)", () => {
    it("should generate idiomatic Pydantic v2 models with ConfigDict and camelCase Field aliases", () => {
      const pyCode = generatePydanticV2Models(FITNESS_PROJECT_UNIFIED_CONTRACT);

      expect(pyCode).toContain("from pydantic import BaseModel, ConfigDict, Field");
      expect(pyCode).toContain("class Exercise(BaseModel):");
      expect(pyCode).toContain("class UserProfile(BaseModel):");
      expect(pyCode).toContain("populate_by_name=True");
      expect(pyCode).toContain("from_attributes=True");
      expect(pyCode).toContain('muscle_group: str = Field(..., alias="muscleGroup"');
      expect(pyCode).toContain('created_at: datetime = Field(..., alias="createdAt"');
      expect(pyCode).toContain('weight_kg: float = Field(..., alias="weightKg"');
    });

    it("should generate Swift 6 Codable, Sendable, Hashable, Identifiable structs with nonisolated CodingKeys", () => {
      const swiftCode = generateSwiftCodableModels(FITNESS_PROJECT_UNIFIED_CONTRACT);

      expect(swiftCode).toContain(
        "public struct Exercise: Codable, Sendable, Hashable, Identifiable {"
      );
      expect(swiftCode).toContain(
        "public struct UserProfile: Codable, Sendable, Hashable, Identifiable {"
      );
      expect(swiftCode).toContain("public let muscleGroup: String");
      expect(swiftCode).toContain("public let equipment: String?");
      expect(swiftCode).toContain(
        "nonisolated private enum CodingKeys: String, CodingKey {"
      );
      expect(swiftCode).toContain('case muscleGroup = "muscle_group"');
      expect(swiftCode).toContain('case createdAt = "created_at"');
      expect(swiftCode).toContain('case weightKg = "weight_kg"');
    });

    it("should write synchronized contracts atomically and verify SHA-256 idempotency on second pass", async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "contract-sync-tck17-"));
      try {
        const firstSync = await syncCrossDomainContracts(
          FITNESS_PROJECT_UNIFIED_CONTRACT,
          { targetDir: tmpDir }
        );

        expect(firstSync.modelsSynced).toEqual(["Exercise", "UserProfile"]);
        expect(firstSync.writtenFiles).toHaveLength(2);
        expect(firstSync.writtenFiles.every((f) => f.status === "CREATED")).toBe(true);
        expect(firstSync.sha256Python).toHaveLength(64);
        expect(firstSync.sha256Swift).toHaveLength(64);

        const secondSync = await syncCrossDomainContracts(
          FITNESS_PROJECT_UNIFIED_CONTRACT,
          { targetDir: tmpDir }
        );

        expect(
          secondSync.writtenFiles.every((f) => f.status === "SKIPPED_UNCHANGED")
        ).toBe(true);
        expect(secondSync.sha256Python).toBe(firstSync.sha256Python);
        expect(secondSync.sha256Swift).toBe(firstSync.sha256Swift);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("TCK-17.3: Live Multi-Repo Dogfooding Pipeline on `/Users/stequar/fitness_project`", () => {
    it("should execute all 5 dogfooding phases, verify POSIX idempotency, and sync Exercise & UserProfile models", async () => {
      const realFitnessPath = "/Users/stequar/fitness_project";
      let targetDir = realFitnessPath;
      let usingRealWorkspace = true;

      try {
        await fs.access(realFitnessPath);
      } catch {
        usingRealWorkspace = false;
        targetDir = await fs.mkdtemp(path.join(os.tmpdir(), "fitness-fallback-"));
        await fs.writeFile(
          path.join(targetDir, "requirements.txt"),
          "fastapi\nuvicorn\npydantic\n",
          "utf-8"
        );
        await fs.writeFile(
          path.join(targetDir, "Package.swift"),
          "// swift-tools-version:5.9\nimport SwiftUI\n",
          "utf-8"
        );
        await fs.writeFile(
          path.join(targetDir, "AGENTS.md"),
          "# Legacy AGENTS.md before attach\n",
          "utf-8"
        );
      }

      try {
        const report = await runFitnessProjectDogfooding(targetDir, {
          dryRun: false,
          doctorTimeoutMs: 2500,
        });

        const parsed = DogfoodingReportSchema.parse(report);
        expect(parsed.phasesCompleted).toEqual([
          "INSPECT",
          "DOCTOR",
          "DRY_RUN_ATTACH",
          "LIVE_ATTACH_AND_IDEMPOTENCY",
          "CROSS_DOMAIN_CONTRACT_SYNC",
        ]);

        // Phase 1: Inspect
        expect(parsed.inspectResult.languages).toContain("python");
        expect(parsed.inspectResult.languages).toContain("swift");
        expect(parsed.inspectResult.frameworks).toContain("fastapi");
        expect(parsed.inspectResult.frameworks).toContain("swiftui");

        // Phase 4: Idempotency verified
        expect(parsed.idempotencyVerified).toBe(true);
        expect(
          parsed.idempotencyAttachResult.injectedFiles.every(
            (f) => f.status === "SKIPPED_UNCHANGED"
          )
        ).toBe(true);

        // Phase 5: Cross-Domain Contract Sync on disk
        expect(parsed.contractSyncResult.modelsSynced).toEqual([
          "Exercise",
          "UserProfile",
        ]);

        const pyPath = path.join(targetDir, "src/backend/api/synced_schemas.py");
        const swiftPath = path.join(
          targetDir,
          "src/ios/FitnessApp/Models/SyncedModels.swift"
        );
        const agentsBakPath = path.join(targetDir, "AGENTS.md.bak");

        const pyDisk = await fs.readFile(pyPath, "utf-8");
        const swiftDisk = await fs.readFile(swiftPath, "utf-8");
        expect(pyDisk).toContain("class Exercise(BaseModel):");
        expect(pyDisk).toContain("class UserProfile(BaseModel):");
        expect(swiftDisk).toContain("public struct Exercise:");
        expect(swiftDisk).toContain("public struct UserProfile:");

        const bakStat = await fs.stat(agentsBakPath);
        expect(bakStat.isFile()).toBe(true);
      } finally {
        if (!usingRealWorkspace) {
          await fs.rm(targetDir, { recursive: true, force: true });
        }
      }
    });
  });
});
