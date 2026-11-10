import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { ConsensusEngine } from "../src/core/consensus-engine.js";
import { CeremonyDispatcher } from "../src/core/ceremony-dispatcher.js";
import { ContractInterceptor, ContractViolationError } from "../src/core/contract-interceptor.js";
import { CompanyStateMachine } from "../src/core/state-machine.js";

const RT_FEEDBACK = {
  redTeamerRole: "qa_lead",
  targetProposalId: "RFC-X",
  identifiedFallacies: [
    { category: "ARCHITECTURAL" as const, description: "unbounded growth risk", worstCaseScenario: "memory exhaustion in prod" },
  ],
  stressTestConditions: ["10k concurrent sessions"],
  proposedCounterMeasures: ["add eviction"],
  verdict: "UNRESOLVED_BLOCKER" as const,
};

describe("GOV governance fail-closed regression", () => {
  beforeEach(() => ConsensusEngine.clear());

  describe("GOV-1 consensus is fail-closed", () => {
    it("escalates to CEO (does NOT auto-approve) on an unresolved blocker with no tie-break authority", async () => {
      const s = ConsensusEngine.initRoundtable({ topic: "T", proposerRole: "backend_manager" });
      expect(s.convergence.redTeamChallenged).toBe(false); // honest at init
      ConsensusEngine.submitRound1RedTeam(s.roundtableId, RT_FEEDBACK);

      const { convergence } = await ConsensusEngine.concludeRoundtable({
        roundtableId: s.roundtableId,
        mitigations: {},
        redTeamVerdict: "UNRESOLVED_BLOCKER",
        // no ctoTieBreakDecision supplied
      });

      expect(convergence.escalatedToCeo).toBe(true);
      expect(convergence.decidedByRole).toBe("ESCALATED_TO_CEO");
      expect(convergence.tieBreakDecision).toContain("NOT auto-approved");
      expect(convergence.tieBreakDecision).not.toMatch(/Proceeding without CEO intervention/);
    });

    it("refuses to conclude a roundtable whose Red Team round never ran (CFF-2 mandatory)", async () => {
      const s = ConsensusEngine.initRoundtable({ topic: "T", proposerRole: "backend_manager" });
      await expect(
        ConsensusEngine.concludeRoundtable({
          roundtableId: s.roundtableId,
          mitigations: { x: "y" },
          redTeamVerdict: "MITIGATION_ACCEPTED",
        })
      ).rejects.toThrow(/MANDATORY_RED_TEAM_MISSING/);
    });

    it("a Round-1 blocker cannot become consensus with zero mitigations", async () => {
      const s = ConsensusEngine.initRoundtable({ topic: "T", proposerRole: "backend_manager" });
      ConsensusEngine.submitRound1RedTeam(s.roundtableId, RT_FEEDBACK); // UNRESOLVED_BLOCKER
      const { convergence } = await ConsensusEngine.concludeRoundtable({
        roundtableId: s.roundtableId,
        mitigations: {},
        redTeamVerdict: "MITIGATION_ACCEPTED", // caller claims accepted, but no mitigations
      });
      expect(convergence.status).not.toBe("CONSENSUS_REACHED");
      expect(convergence.escalatedToCeo).toBe(true);
    });
  });

  describe("GOV-2 ceremony always convenes the Devil's Advocate", () => {
    it("injects qa_lead into an ARCHITECTURE_REVIEW_ROUNDTABLE even if the caller omits it", async () => {
      const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "gov-cer-"));
      const dispatcher = new CeremonyDispatcher(tmp);
      const ceremony = await dispatcher.startCeremony({
        type: "ARCHITECTURE_REVIEW_ROUNDTABLE",
        chairRole: "engineering_lead",
        attendeeRoles: ["engineering_lead", "product_lead"], // no qa_lead
      });
      expect(ceremony.attendeeRoles).toContain("qa_lead");
    });
  });

  describe("GOV-3 contract-interceptor", () => {
    it("rejects hallucinated keys inside a REFINED (ZodEffects) schema", () => {
      const schema = z
        .object({ a: z.number(), b: z.string() })
        .refine((v) => v.a > 0, "a must be positive");
      expect(() =>
        ContractInterceptor.enforce(schema, { a: 1, b: "ok", hallucinated: true }, { contractName: "Refined" })
      ).toThrow(ContractViolationError);
    });

    it("FSM requireRegisteredSchema makes an unvalidated payload fail-closed", async () => {
      const sm = new CompanyStateMachine("STANDUP");
      sm.setRequireRegisteredSchema(true);
      await expect(sm.transitionTo("TECH_VALIDATION", { some: "payload" })).rejects.toThrow(
        /UNVALIDATED_TRANSITION_PAYLOAD/
      );
    });
  });
});
