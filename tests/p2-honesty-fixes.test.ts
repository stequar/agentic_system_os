import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { WarRoomEngine } from "../src/gatekeeper/war-room.js";
import { CompanyStateMachine } from "../src/core/state-machine.js";

describe("P2 honesty & governance regression", () => {
  describe("War Room write-lock is ref-counted over open incidents (not a single boolean)", () => {
    let tempDir: string;
    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "p2-warroom-"));
    });
    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    });

    it("stays locked while any incident is open; unlocks only when the last resolves", async () => {
      expect(WarRoomEngine.isWriteLocked()).toBe(false);

      const incA = await WarRoomEngine.declareIncident({
        targetPath: tempDir,
        trigger: "SELF_HEALING_EXHAUSTED",
        targetTicketId: "TCK-A",
        affectedFiles: ["a.ts"],
        rootCause: "root cause of incident A",
      });
      const incB = await WarRoomEngine.declareIncident({
        targetPath: tempDir,
        trigger: "SELF_HEALING_EXHAUSTED",
        targetTicketId: "TCK-B",
        affectedFiles: ["b.ts"],
        rootCause: "root cause of incident B",
      });
      expect(WarRoomEngine.isWriteLocked()).toBe(true);

      // Resolving ONE incident must NOT release the lock while the other is still open.
      await WarRoomEngine.resolveIncident(tempDir, incA.incident.incidentId, "fixed A");
      expect(WarRoomEngine.isWriteLocked()).toBe(true);

      await WarRoomEngine.resolveIncident(tempDir, incB.incident.incidentId, "fixed B");
      expect(WarRoomEngine.isWriteLocked()).toBe(false);
    });
  });

  describe("CFF-5 spike-checkpoint gate is reachable via the FSM (was never invoked)", () => {
    async function walkToDelegate(sm: CompanyStateMachine): Promise<void> {
      await sm.transitionTo("SPECIFY");
      await sm.transitionTo("DELEGATE");
    }

    it("blocks NORMAL_SPRINT -> IMPLEMENT when spike is unapproved under HITL_SPIKE_REVIEW", async () => {
      const sm = new CompanyStateMachine("STANDUP");
      sm.setStimulusContext({
        stimulusType: "NORMAL_SPRINT",
        spikeApprovedByCeo: false,
        spikeCheckpointMode: "HITL_SPIKE_REVIEW",
      });
      await walkToDelegate(sm);
      await expect(sm.transitionTo("IMPLEMENT")).rejects.toThrow(/SPIKE_CHECKPOINT_GATE_VIOLATION/);
    });

    it("allows NORMAL_SPRINT -> IMPLEMENT once the spike is CEO-approved", async () => {
      const sm = new CompanyStateMachine("STANDUP");
      sm.setStimulusContext({
        stimulusType: "NORMAL_SPRINT",
        spikeApprovedByCeo: true,
        spikeCheckpointMode: "HITL_SPIKE_REVIEW",
      });
      await walkToDelegate(sm);
      await expect(sm.transitionTo("IMPLEMENT")).resolves.toBe(true);
      expect(sm.getState()).toBe("IMPLEMENT");
    });

    it("allows NORMAL_SPRINT -> IMPLEMENT under AUTONOMOUS_FAST_TRACK without approval", async () => {
      const sm = new CompanyStateMachine("STANDUP");
      sm.setStimulusContext({
        stimulusType: "NORMAL_SPRINT",
        spikeApprovedByCeo: false,
        spikeCheckpointMode: "AUTONOMOUS_FAST_TRACK",
      });
      await walkToDelegate(sm);
      await expect(sm.transitionTo("IMPLEMENT")).resolves.toBe(true);
    });

    it("does not block when no spike context is set (default happy path unchanged)", async () => {
      const sm = new CompanyStateMachine("STANDUP");
      await walkToDelegate(sm);
      await expect(sm.transitionTo("IMPLEMENT")).resolves.toBe(true);
    });
  });
});
