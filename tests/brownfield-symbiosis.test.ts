import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { graftManagedSection } from "../src/attach/smart-merge.js";
import { attachWorkspace } from "../src/attach/injector.js";
import { resolveHermeticTestCommands } from "../src/inspector/detector.js";
import { mineRepositoryDomainAndRoles } from "../src/inspector/domain-miner.js";
import { CeremonyDispatcher } from "../src/core/ceremony-dispatcher.js";
import { introspectAndDetectDrift } from "../src/sync/contract-introspector.js";
import { runHolisticWorkspaceBootstrap } from "../src/bootstrap/holistic-bootstrap.js";
import { HolisticBootstrapReportSchema } from "../src/contracts/brownfield.js";
import { createMemoryContext } from "../src/cli/context.js";
import { createCliApp } from "../src/cli/dispatcher.js";

/**
 * Crea un workspace Brownfield sintetico fedele all'architettura poliglotta di `fitness_project`
 * per testare in isolamento deterministico Smart-Merge, Domain Mining, Drift Detection e Holistic Bootstrap.
 */
async function createSyntheticBrownfieldFitnessRepo(): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "brownfield-symbiosis-"));

  // 1. Pre-existing domain docs & science wiki
  await fs.mkdir(path.join(tmpDir, "docs/wiki/product"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "docs/wiki/science"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "docs/wiki/engineering"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "src/ai"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "src/backend/api"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "src/ios/FitnessApp/Models"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, "db/init"), { recursive: true });
  await fs.mkdir(path.join(tmpDir, ".venv/bin"), { recursive: true });

  await fs.writeFile(
    path.join(tmpDir, "AGENTS.md"),
    "# Legacy Domain Agents\n- `medical_manager`: Biomechanics & Rehab\n- `nutrition_manager`: Clinical TDEE\n- `ai_manager`: Adaptive Coaching\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "docs/wiki/product/roadmap.md"),
    "# Custom Fitness Roadmap\n## Epic 0: Dataset Ingestion & Prehab Foundation\n## Epic 2: Clinical Nutrition & TDEE\n## Epic 3: Adaptive AI Coaching\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "docs/wiki/product/backlog.md"),
    "# Custom Fitness Backlog\n- [x] **TCK-0.1**: Dataset ingestion pipeline (`ingest_dataset.py`)\n- [ ] **TCK-3.1**: MedicalCircuitBreaker injury filter\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "docs/wiki/science/rehab_protocols.md"),
    "# Rehab & Prehab Protocols\nMedicalCircuitBreaker rules for shoulder and knee injury prevention.\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "docs/wiki/science/nutrition_protocols.md"),
    "# Therapeutic Nutrition Protocols\nDynamic TDEE, protein synthesis, and anti-inflammatory collagen timing.\n",
    "utf-8"
  );

  // 2. Code & SQL files for Domain Mining & Drift Detection
  await fs.writeFile(
    path.join(tmpDir, "requirements.txt"),
    "fastapi==0.110.0\npydantic==2.6.0\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "docker-compose.yml"),
    "version: '3.8'\nservices:\n  db:\n    image: postgres:15\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "db/init/01-init.sql"),
    "CREATE TABLE exercises (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL\n);\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "src/backend/ingest_dataset.py"),
    "# Dataset ingestion ETL script\ndef ingest_exercises():\n    pass\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "src/ai/decision_engine.py"),
    "class MedicalCircuitBreaker:\n    pass\n\nclass WorkoutGenerator:\n    # Uses RPE feedback and MedicalCircuitBreaker\n    pass\n",
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "src/backend/api/schemas.py"),
    `from pydantic import BaseModel
from typing import Optional

class ExerciseBase(BaseModel):
    name: str
    muscle_group: str
    equipment: Optional[str] = None

class Exercise(ExerciseBase):
    id: int
`,
    "utf-8"
  );
  await fs.writeFile(
    path.join(tmpDir, "src/ios/FitnessApp/Models/Exercise.swift"),
    `import Foundation
import SwiftUI

struct Exercise: Identifiable, Codable {
    let id: UUID
    let name: String
    let muscleGroup: String
}
`,
    "utf-8"
  );

  // 3. Hermetic .venv/bin/pytest marker
  await fs.writeFile(
    path.join(tmpDir, ".venv/bin/pytest"),
    "#!/bin/sh\necho 'pytest mock'\n",
    { encoding: "utf-8", mode: 0o755 }
  );

  return tmpDir;
}

describe("Sprint 17.5 — Brownfield Symbiosis, Autonomous Domain Expert Synthesis & 5-Phase Holistic Bootstrap (RFC-007)", () => {
  describe("TCK-17.5.1: Non-Destructive Brownfield Smart-Merge (`graftManagedSection` & `attachWorkspace`)", () => {
    it("should preserve 100% of pre-existing domain content, graft sentinel block, and achieve byte-level idempotency", async () => {
      const tmpDir = await createSyntheticBrownfieldFitnessRepo();
      try {
        // First pass: Brownfield attach
        const firstAttach = await attachWorkspace(tmpDir, { backup: true });
        expect(firstAttach.success).toBe(true);

        const roadmapAfter = await fs.readFile(
          path.join(tmpDir, "docs/wiki/product/roadmap.md"),
          "utf-8"
        );
        const backlogAfter = await fs.readFile(
          path.join(tmpDir, "docs/wiki/product/backlog.md"),
          "utf-8"
        );
        const indexAfter = await fs.readFile(
          path.join(tmpDir, "docs/wiki/INDEX.md"),
          "utf-8"
        );
        const agentsAfter = await fs.readFile(
          path.join(tmpDir, "AGENTS.md"),
          "utf-8"
        );

        // Domain content must be 100% preserved
        expect(roadmapAfter).toContain("Epic 0: Dataset Ingestion & Prehab Foundation");
        expect(roadmapAfter).toContain("Epic 2: Clinical Nutrition & TDEE");
        expect(roadmapAfter).toContain(
          '<!-- AGENTIC-OS:MANAGED:START id="product-roadmap-governance"'
        );

        expect(backlogAfter).toContain("TCK-0.1");
        expect(backlogAfter).toContain("MedicalCircuitBreaker injury filter");
        expect(backlogAfter).toContain(
          '<!-- AGENTIC-OS:MANAGED:START id="product-backlog-governance"'
        );

        expect(agentsAfter).toContain("medical_manager");
        expect(agentsAfter).toContain(
          '<!-- AGENTIC-OS:MANAGED:START id="agents-governance"'
        );

        // Zero Dark-Memory: INDEX.md must auto-index docs/wiki/science/rehab_protocols.md
        expect(indexAfter).toContain("rehab_protocols.md");
        expect(indexAfter).toContain("nutrition_protocols.md");

        // Second pass: must be 100% SKIPPED_UNCHANGED
        const secondAttach = await attachWorkspace(tmpDir, { backup: true });
        expect(
          secondAttach.injectedFiles.every((f) => f.status === "SKIPPED_UNCHANGED")
        ).toBe(true);

        // Direct unit check on graftManagedSection idempotency
        const graftedOnce = graftManagedSection(
          "# Existing Header\nCustom notes.",
          "test-sec",
          "Managed body v1"
        );
        const graftedTwice = graftManagedSection(
          graftedOnce,
          "test-sec",
          "Managed body v1"
        );
        expect(graftedTwice).toBe(graftedOnce);
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("TCK-17.5.2: Deep Polyglot Crawler, Hermetic Runner & Autonomous Domain Miner", () => {
    it("should autonomously discover Ring-2 Domain Experts and Ring-1 Tech Specialists even when AGENTS.md is absent", async () => {
      const tmpDir = await createSyntheticBrownfieldFitnessRepo();
      try {
        // Delete AGENTS.md completely to prove autonomous discovery from code/SQL/wiki
        await fs.rm(path.join(tmpDir, "AGENTS.md"), { force: true });

        const orgChart = await mineRepositoryDomainAndRoles(tmpDir, undefined, {
          ignoreExistingAgentsMd: true,
        });

        const ring1Ids = orgChart.ring1TechSpecialists.map((s) => s.id);
        expect(ring1Ids).toContain("backend_manager");
        expect(ring1Ids).toContain("mobile_manager");
        expect(ring1Ids).toContain("database_sql_specialist");
        expect(ring1Ids).toContain("data_pipeline_specialist");
        expect(ring1Ids).toContain("devops_container_specialist");

        const ring2Ids = orgChart.ring2DomainExperts.map((s) => s.id);
        expect(ring2Ids).toContain("medical_rehab_specialist");
        expect(ring2Ids).toContain("nutrition_metabolic_specialist");
        expect(ring2Ids).toContain("ai_coaching_specialist");

        for (const expert of orgChart.ring2DomainExperts) {
          expect(expert.origin).toBe("SEMANTIC_MINED");
          expect(expert.domainScope.length).toBeGreaterThan(0);
          expect(expert.domainInvariants.length).toBeGreaterThan(0);
          // Micro Role Card < 150 tokens (~600 chars)
          expect(expert.microRoleCard.split(/\s+/).length).toBeLessThan(150);
        }

        // Verify hermetic runner precedence (.venv/bin/pytest)
        const hermeticCmds = await resolveHermeticTestCommands(tmpDir, [
          "pytest",
          "swift test",
        ]);
        expect(hermeticCmds).toContain(".venv/bin/pytest");
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("TCK-17.5.3: Active Domain-Expert Ceremony Routing & Invariant Injection", () => {
    it("should automatically summon Ring-2 Domain Experts and inject their domainInvariants when ceremony touches their scope", async () => {
      const tmpDir = await createSyntheticBrownfieldFitnessRepo();
      try {
        const orgChart = await mineRepositoryDomainAndRoles(tmpDir);
        const dispatcher = new CeremonyDispatcher(tmpDir);

        const routing = dispatcher.resolveDomainAttendeesForScope(
          ["src/ai/decision_engine.py", "docs/wiki/science/rehab_protocols.md"],
          orgChart
        );

        expect(routing.matchedAttendeeIds).toContain("medical_rehab_specialist");
        expect(routing.matchedAttendeeIds).toContain("ai_coaching_specialist");
        expect(routing.injectedInvariants.length).toBeGreaterThan(0);

        const ceremony = await dispatcher.startCeremony({
          type: "ARCHITECTURE_REVIEW_ROUNDTABLE",
          chairRole: "cto",
          attendeeRoles: ["engineering_lead"],
          affectedFilesOrKeywords: ["src/ai/decision_engine.py"],
          orgChart,
        });

        expect(ceremony.attendeeRoles).toContain("engineering_lead");
        expect(ceremony.attendeeRoles).toContain("medical_rehab_specialist");
        expect(ceremony.attendeeRoles).toContain("ai_coaching_specialist");
        expect(ceremony.summary).toContain("Active Domain Invariants:");
        expect(ceremony.summary).toContain("MedicalCircuitBreaker");
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("TCK-17.5.4: Semantic Drift Detector & 5-Phase Holistic Workspace Bootstrap (`P0..P4`)", () => {
    it("should detect cross-language drift (`Exercise.id` int vs UUID, missing CodingKeys) and execute full P0..P4 bootstrap via API and CLI", async () => {
      const tmpDir = await createSyntheticBrownfieldFitnessRepo();
      try {
        const driftReport = await introspectAndDetectDrift(tmpDir, {
          dryRun: true,
        });

        expect(driftReport.hasDrift).toBe(true);
        expect(
          driftReport.findings.some(
            (f) =>
              f.modelName === "Exercise" &&
              f.fieldName === "id" &&
              f.issueType === "TYPE_MISMATCH"
          )
        ).toBe(true);
        expect(
          driftReport.findings.some(
            (f) =>
              f.modelName === "Exercise" &&
              f.issueType === "MISSING_CODING_KEYS"
          )
        ).toBe(true);

        // Execute full 5-Phase Holistic Bootstrap via CLI `bootstrap [path] --json`
        const ctx = createMemoryContext(tmpDir);
        const app = createCliApp(ctx);
        await app.parseAsync([
          "node",
          "agentic-company",
          "bootstrap",
          tmpDir,
          "--json",
        ]);

        const report = HolisticBootstrapReportSchema.parse(
          JSON.parse(ctx.getStdout())
        );

        expect(report.phasesCompleted).toEqual([
          "P0_DEEP_RECONNAISSANCE",
          "P1_SEMANTIC_DOMAIN_MINING",
          "P2_TRI_RING_ORG_SYNTHESIS",
          "P3_HOLISTIC_TOOLING_PROVISIONING",
          "P4_INAUGURAL_ALIGNMENT_CEREMONY",
        ]);
        expect(report.idempotencyVerified).toBe(true);
        expect(report.hermeticTestCommands).toContain(".venv/bin/pytest");
        expect(report.synthesizedMcpTools).toHaveLength(1);
        expect(report.synthesizedMcpTools[0]?.status).toBe("HOT_LOADED");

        // Verify all .company-os artifacts exist on disk
        const artifacts = [
          ".company-os/org-chart.json",
          ".company-os/contracts.json",
          ".company-os/invariants.json",
          ".company-os/config.json",
          ".company-os/bootstrap-report.json",
        ];
        for (const rel of artifacts) {
          const stat = await fs.stat(path.join(tmpDir, rel));
          expect(stat.isFile()).toBe(true);
        }
      } finally {
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
