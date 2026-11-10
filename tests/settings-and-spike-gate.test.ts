import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CompanySettingsSchema,
  SETTINGS_REFERENCE_CATALOG,
} from "../src/contracts/settings.js";
import { SettingsManager } from "../src/core/settings-manager.js";
import { CompanyStateMachine } from "../src/core/state-machine.js";
import { executeExecutiveVoiceCommand } from "../src/studio/voice-director.js";
import { workflowCommand } from "../src/cli/commands/workflow.js";

describe("Sprint 17.8: Central Settings Configuration (.company-os/settings.json) & CFF-5 Spike Checkpoint Gate", () => {
  it("parses default settings across all 5 logical sections and provides full reference catalog", () => {
    const defaults = SettingsManager.getDefaultSettings();
    expect(defaults.version).toBe("1.0.0");
    expect(defaults.governance.spikeCheckpoint).toBe("HITL_SPIKE_REVIEW");
    expect(defaults.governance.anomalyGate).toBe("STRICT_CFF_4_GATES");
    expect(defaults.localSlm.mode).toBe("AUTO_HARDWARE_ADAPTIVE");
    expect(defaults.gatekeeper.enableHeuristicScanner).toBe(true);
    expect(defaults.communication.cavemanMode).toBe(true);
    expect(defaults.finops.maxSessionBudgetUsd).toBe(5);

    const catalog = SettingsManager.getReferenceCatalog();
    expect(catalog.length).toBe(SETTINGS_REFERENCE_CATALOG.length);
    expect(catalog.length).toBeGreaterThanOrEqual(15);
    const spikeEntry = catalog.find(
      (c) => c.key === "governance.spikeCheckpoint"
    );
    expect(spikeEntry?.possibleValues).toEqual([
      "HITL_SPIKE_REVIEW",
      "AUTONOMOUS_FAST_TRACK",
    ]);
  });

  it("persists and updates settings by dot-path with type coercion and strict Zod validation", () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "company-settings-test-")
    );
    try {
      const initial = SettingsManager.ensureSettingsFile(tmpDir);
      expect(initial.governance.spikeCheckpoint).toBe("HITL_SPIKE_REVIEW");

      const res1 = SettingsManager.updateSettingByPath(
        tmpDir,
        "governance.spikeCheckpoint",
        "AUTONOMOUS_FAST_TRACK"
      );
      expect(res1.previousValue).toBe("HITL_SPIKE_REVIEW");
      expect(res1.newValue).toBe("AUTONOMOUS_FAST_TRACK");

      const res2 = SettingsManager.updateSettingByPath(
        tmpDir,
        "gatekeeper.selfHealingMaxRetries",
        "4"
      );
      expect(res2.newValue).toBe(4);

      const res3 = SettingsManager.updateSettingByPath(
        tmpDir,
        "localSlm.preferredModelOverride",
        "qwen3-coder:30b-a3b-q4_K_M"
      );
      expect(res3.newValue).toBe("qwen3-coder:30b-a3b-q4_K_M");

      const res4 = SettingsManager.updateSettingByPath(
        tmpDir,
        "localSlm.preferredModelOverride",
        "null"
      );
      expect(res4.newValue).toBeNull();

      // Rejects invalid enum values
      expect(() =>
        SettingsManager.updateSettingByPath(
          tmpDir,
          "governance.spikeCheckpoint",
          "INVALID_MODE"
        )
      ).toThrow();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("enforces CFF-5 (Configurable Spike Checkpoint Gate) in CompanyStateMachine", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cff5-gate-test-"));
    try {
      const fsm = new CompanyStateMachine("STANDUP");

      // Default mode is HITL_SPIKE_REVIEW -> blocks when spikeApprovedByCeo === false
      expect(() =>
        fsm.enforceCognitiveForcingGate({
          stimulusType: "NORMAL_SPRINT",
          persistToTargetPath: tmpDir,
          spikeApprovedByCeo: false,
        })
      ).toThrow(/SPIKE_CHECKPOINT_GATE_VIOLATION \(CFF-5\)/);

      // Allows when spikeApprovedByCeo === true
      const approvedRes = fsm.enforceCognitiveForcingGate({
        stimulusType: "NORMAL_SPRINT",
        persistToTargetPath: tmpDir,
        spikeApprovedByCeo: true,
      });
      expect(approvedRes.allowed).toBe(true);

      // Switch setting to AUTONOMOUS_FAST_TRACK -> allows even when spikeApprovedByCeo === false
      SettingsManager.updateSettingByPath(
        tmpDir,
        "governance.spikeCheckpoint",
        "AUTONOMOUS_FAST_TRACK"
      );
      const fastTrackRes = fsm.enforceCognitiveForcingGate({
        stimulusType: "NORMAL_SPRINT",
        persistToTargetPath: tmpDir,
        spikeApprovedByCeo: false,
      });
      expect(fastTrackRes.allowed).toBe(true);
      expect(fastTrackRes.reason).toContain("AUTONOMOUS_FAST_TRACK");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("wires Voice Director and CLI workflow settings / set-setting to .company-os/settings.json", async () => {
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "cli-voice-settings-")
    );
    try {
      await executeExecutiveVoiceCommand({
        targetPath: tmpDir,
        transcript: "Disattiva il punto intermedio sugli spike in automatico",
      });

      const afterVoice = SettingsManager.loadSettings(tmpDir);
      expect(afterVoice.governance.spikeCheckpoint).toBe(
        "AUTONOMOUS_FAST_TRACK"
      );

      const outputs: string[] = [];
      const ctx = {
        cwd: tmpDir,
        stdout: (msg: string) => outputs.push(msg),
        stderr: (msg: string) => outputs.push(msg),
        exit: () => {},
      };

      await workflowCommand(ctx, "set-setting", tmpDir, {
        key: "governance.spikeCheckpoint",
        value: "HITL_SPIKE_REVIEW",
        json: true,
      });
      const setPayload = JSON.parse(outputs[outputs.length - 1]);
      expect(setPayload.newValue).toBe("HITL_SPIKE_REVIEW");

      await workflowCommand(ctx, "settings", tmpDir, { json: true });
      const settingsPayload = JSON.parse(outputs[outputs.length - 1]);
      expect(
        CompanySettingsSchema.parse(settingsPayload.settings).governance
          .spikeCheckpoint
      ).toBe("HITL_SPIKE_REVIEW");
      expect(settingsPayload.referenceCatalog.length).toBeGreaterThanOrEqual(
        15
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
