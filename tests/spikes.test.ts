import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { TechValidationReportSchema } from "../src/contracts/research.js";

describe("Tech Validation Spikes Compliance", () => {
  it("valida che il dossier dello Sprint 2 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-2-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-2");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 3 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-3-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-3");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 4 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-4-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-4");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 5 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-5-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-5");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 6 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-6-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-6");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 7 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-7-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-7");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 8 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-8-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-8");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 9 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-9-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-9");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 10 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-10-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-10");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 11 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-11-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-11");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint R&D-13 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-rnd-13-ai-tooling.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-RND-13");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 19 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-19-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-19");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 17.5 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-17-5-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-17.5");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 20 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-20-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-20");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 21 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-21-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-21");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 22 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-22-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-22");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 23 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-23-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-23");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 17.8 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-17-8-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-17.8");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });

  it("valida che il dossier dello Sprint 18 rispetti TechValidationReportSchema", () => {
    const spikePath = path.resolve(process.cwd(), "docs/wiki/engineering/spikes/sprint-18-validation.md");
    expect(fs.existsSync(spikePath)).toBe(true);

    const content = fs.readFileSync(spikePath, "utf8");
    const match = content.match(/```json\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();

    const jsonContent = match![1];
    const parsedData = JSON.parse(jsonContent);

    const validationResult = TechValidationReportSchema.safeParse(parsedData);
    expect(validationResult.success).toBe(true);

    if (validationResult.success) {
      expect(validationResult.data.sprintId).toBe("SPRINT-18");
      expect(validationResult.data.verdict).toBe("APPROVED");
      expect(validationResult.data.proposedDecisions.length).toBeGreaterThan(0);
      expect(validationResult.data.benchmarksAndTools.length).toBeGreaterThan(0);
      expect(validationResult.data.bestPractices.length).toBeGreaterThan(0);
      expect(validationResult.data.risksAndMitigations.length).toBeGreaterThan(0);
      expect(validationResult.data.finalRecommendations.length).toBeGreaterThan(0);
    }
  });
});




