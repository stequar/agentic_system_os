import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  RoleTaxonomySchema,
  RaciMatrixSchema,
} from "../src/contracts/roles.js";

function extractAuditJsonBlock(filePath: string): { taxonomy: unknown; raciMatrix: unknown } {
  expect(fs.existsSync(filePath), `File does not exist: ${filePath}`).toBe(true);
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  expect(match, `No JSON code block found in ${filePath}`).not.toBeNull();
  return JSON.parse(match![1]);
}

describe("Sprint R&D-12 — Role Taxonomy, Consolidation & RACI Matrix Compliance", () => {
  const auditPath = path.resolve(
    process.cwd(),
    "docs/wiki/rnd/audits/role-taxonomy-and-consolidation.md"
  );

  it("valida il blocco JSON di tassonomia rispetto a RoleTaxonomySchema", () => {
    const { taxonomy } = extractAuditJsonBlock(auditPath);
    const parsed = RoleTaxonomySchema.parse(taxonomy);

    expect(parsed.version).toBe("1.0.0");
    expect(parsed.coreLeads.length).toBe(5);
    expect(parsed.dynamicDomainLeads.length).toBeGreaterThanOrEqual(4);
    expect(parsed.leafDevelopers.length).toBeGreaterThanOrEqual(1);

    // Verifica la presenza di tutti i 5 Core Leads L2
    const coreIds = parsed.coreLeads.map((r) => r.id);
    expect(coreIds).toContain("engineering_lead");
    expect(coreIds).toContain("product_lead");
    expect(coreIds).toContain("qa_lead");
    expect(coreIds).toContain("ai_lead");
    expect(coreIds).toContain("rnd_lead");

    // Tutti i Core Leads devono avere livello L2 e abilitazione alla delega
    for (const lead of parsed.coreLeads) {
      expect(lead.level).toBe("L2");
      expect(lead.enableSubagentTools).toBe(true);
      expect(lead.microRoleCard.length).toBeGreaterThan(30);
      expect(lead.spikeDomain).toBeDefined();
    }

    // Verifica Dynamic Domain Leads
    const dynamicIds = parsed.dynamicDomainLeads.map((r) => r.id);
    expect(dynamicIds).toContain("backend_manager");
    expect(dynamicIds).toContain("mobile_manager");
    expect(dynamicIds).toContain("frontend_manager");
    expect(dynamicIds).toContain("lead_engineer");

    for (const dLead of parsed.dynamicDomainLeads) {
      expect(dLead.level).toBe("L2");
      expect(dLead.enableSubagentTools).toBe(true);
      expect(dLead.enableWriteTools).toBe(true);
    }

    // Verifica Leaf Developers L3: zero delega subagenti e piena capacità di scrittura
    for (const leaf of parsed.leafDevelopers) {
      expect(leaf.level).toBe("L3");
      expect(leaf.enableSubagentTools).toBe(false);
      expect(leaf.enableWriteTools).toBe(true);
      expect(leaf.category).toBe("LEAF_DEVELOPER");
    }
  });

  it("valida la matrice RACI rispetto a RaciMatrixSchema e garantisce le regole di governance", () => {
    const { raciMatrix } = extractAuditJsonBlock(auditPath);
    const parsed = RaciMatrixSchema.parse(raciMatrix);

    expect(parsed.matrixId).toBe("RACI-AGENTIC-OS-v1");
    expect(parsed.phases.length).toBe(8);

    const phases = parsed.phases.map((p) => p.phase);
    expect(phases).toContain("SPIKE_VALIDATION");
    expect(phases).toContain("BACKLOG_REFINEMENT");
    expect(phases).toContain("CODE_IMPLEMENTATION");
    expect(phases).toContain("GATEKEEPER_VERIFICATION");
    expect(phases).toContain("SELF_HEALING");
    expect(phases).toContain("SECURITY_AUDIT");
    expect(phases).toContain("FINOPS_GOVERNANCE");
    expect(phases).toContain("RELEASE_APPROVAL");

    // Verifica che ogni fase abbia esattamente UN ruolo Accountable
    for (const row of parsed.phases) {
      expect(typeof row.accountable).toBe("string");
      expect(row.accountable.length).toBeGreaterThan(1);
      expect(row.responsible.length).toBeGreaterThanOrEqual(1);
    }

    // Verifica attribuzioni Accountable specifiche
    const phaseMap = new Map(parsed.phases.map((p) => [p.phase, p]));

    expect(phaseMap.get("SPIKE_VALIDATION")!.accountable).toBe("cto");
    expect(phaseMap.get("BACKLOG_REFINEMENT")!.accountable).toBe("product_lead");
    expect(phaseMap.get("CODE_IMPLEMENTATION")!.accountable).toBe("engineering_lead");
    expect(phaseMap.get("GATEKEEPER_VERIFICATION")!.accountable).toBe("qa_lead");
    expect(phaseMap.get("SELF_HEALING")!.accountable).toBe("qa_lead");
    expect(phaseMap.get("SECURITY_AUDIT")!.accountable).toBe("qa_lead");
    expect(phaseMap.get("FINOPS_GOVERNANCE")!.accountable).toBe("ai_lead");
    expect(phaseMap.get("RELEASE_APPROVAL")!.accountable).toBe("ceo");
  });
});
