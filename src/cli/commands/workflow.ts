import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { ExecutionContext } from "../context.js";
import { CompanyStateMachine } from "../../core/state-machine.js";
import { SettingsManager } from "../../core/settings-manager.js";
import { SettingsEvalHarness } from "../../eval/settings-eval-harness.js";
import { setupAgentHarnesses } from "../../attach/harness-adapter.js";
import { CeremonyDispatcher } from "../../core/ceremony-dispatcher.js";
import { AuditLogger } from "../../core/audit-logger.js";
import { ToolScoper } from "../../core/tool-scoper.js";
import { PromptCacheAdapter } from "../../core/prompt-cache-adapter.js";
import { buildTwoTierPromptBundle } from "../../generator/templates/cached-kernel.js";
import { ContextHealthMeter } from "../../core/context-health.js";
import { FluffTelemetry } from "../../core/fluff-telemetry.js";
import { proveAstInvariants } from "../../gatekeeper/formal-prover.js";
import { profileHostHardware } from "../../distillation/local-slm-adapter.js";
import { calculateResilienceScore } from "../../security/chaos-engine.js";
import { TriRingOrgChartSchema, type TriRingOrgChart } from "../../contracts/brownfield.js";
import {
  CtoOperatingModeSchema,
  RootCauseAnalysisReportSchema,
  WorkflowPersistedStateSchema,
  WorkflowStimulusTypeSchema,
  type CtoOperatingMode,
  type RootCauseAnalysisReport,
  type WorkflowStimulusType,
} from "../../contracts/workflow-eval.js";

export interface WorkflowCommandOptions {
  scope?: string;
  mode?: string;
  stimulus?: string;
  rcaFile?: string;
  key?: string;
  value?: string;
  json?: boolean;
}

export async function workflowCommand(
  ctx: ExecutionContext,
  action: string,
  targetPath?: string,
  options?: WorkflowCommandOptions
): Promise<void> {
  const resolvedPath = path.resolve(targetPath || ctx.cwd);
  const companyOsDir = path.join(resolvedPath, ".company-os");
  await fs.mkdir(companyOsDir, { recursive: true });

  const statePath = path.join(companyOsDir, "workflow-state.json");
  const orgChartPath = path.join(companyOsDir, "org-chart.json");
  const invariantsPath = path.join(companyOsDir, "invariants.json");

  let orgChart: TriRingOrgChart | undefined;
  try {
    const rawChart = await fs.readFile(orgChartPath, "utf-8");
    orgChart = TriRingOrgChartSchema.parse(JSON.parse(rawChart));
  } catch {
    orgChart = undefined;
  }

  let invariantsData: { criticalPaths?: string[]; domainInvariants?: unknown[] } = {};
  try {
    const rawInv = await fs.readFile(invariantsPath, "utf-8");
    invariantsData = JSON.parse(rawInv);
  } catch {
    invariantsData = {};
  }

  const fsm = new CompanyStateMachine("STANDUP");
  const auditLogger = new AuditLogger(resolvedPath);

  if (action === "status") {
    const requestedMode: CtoOperatingMode = options?.mode
      ? CtoOperatingModeSchema.parse(options.mode)
      : "MODE_1_STANDUP";

    let persisted = await fsm.persistWorkflowState(resolvedPath, {
      activeMode: requestedMode,
    });

    try {
      const rawExisting = await fs.readFile(statePath, "utf-8");
      const parsedExisting = WorkflowPersistedStateSchema.safeParse(
        JSON.parse(rawExisting)
      );
      if (parsedExisting.success && !options?.mode) {
        persisted = parsedExisting.data;
      }
    } catch {
      // Usa il default appena persistito
    }

    const toolScoper = new ToolScoper();
    const scopedTools = toolScoper.scopeTools(persisted.fsmState, "L1");
    const promptBundle = buildTwoTierPromptBundle({
      roleId: "cto",
      roleName: "Executive Orchestrator / CTO",
      level: "L2",
      description: "Primary Executive Orchestrator & Gatekeeper Supervisor",
      targetLanguages: ["typescript"],
      targetFrameworks: [],
      enableWriteTools: persisted.activeMode === "MODE_4_BUILD_GATEKEEPER",
      enableSubagents: true,
      recommendedTestCommand: "npm test",
      domainRules: (invariantsData.criticalPaths ?? []).slice(0, 3),
    });
    const cachedPrompt = PromptCacheAdapter.adapt(promptBundle, "anthropic");
    const contextHealth = ContextHealthMeter.getInstance().getReport(
      promptBundle.estimatedTotalTokens
    );
    const fluffReport = FluffTelemetry.getInstance().getReport(resolvedPath);

    const payload = {
      action: "status",
      targetPath: resolvedPath,
      activeMode: persisted.activeMode,
      fsmState: persisted.fsmState,
      stimulusType: persisted.stimulusType,
      ring0CoreLeads: orgChart?.ring0CoreLeads ?? [
        "cto",
        "engineering_lead",
        "product_lead",
        "qa_lead",
        "ai_lead",
        "rnd_lead",
      ],
      ring1TechSpecialists:
        orgChart?.ring1TechSpecialists.map((s) => s.id) ?? [],
      ring2DomainExperts:
        orgChart?.ring2DomainExperts.map((s) => s.id) ?? [],
      criticalPaths: invariantsData.criticalPaths ?? [],
      scopedTools: {
        activeTools: scopedTools.activeTools,
        tokensSavedEstimate: scopedTools.tokensSavedEstimate,
      },
      promptCache: {
        sha256Tier1: cachedPrompt.sha256Tier1,
        estimatedCacheHitRate: cachedPrompt.estimatedCacheHitRate,
      },
      contextHealth: {
        score: contextHealth.healthScore,
        status: contextHealth.status,
      },
      fluffTelemetry: {
        totalMessagesIntercepted: fluffReport.totalMessagesIntercepted,
        fluffTokensEliminated: fluffReport.fluffTokensEliminated,
      },
      formalProver: (() => {
        const selfProof = proveAstInvariants({
          targetFilePath: "src/gatekeeper/formal-prover.ts",
          sourceCode: "export function verifyIdentity(x: number): number {\n  return x;\n}",
          targetSymbol: "verifyIdentity",
        });
        return {
          enabled: true,
          solverBackend: selfProof.solverBackend,
          selfTestStatus: selfProof.status,
        };
      })(),
      localSlmSwarm: (() => {
        const hw = profileHostHardware();
        return {
          hardwareTier: hw.tier,
          totalMemoryGb: hw.totalMemoryGb,
          bypassLocalSlm: hw.bypassLocalSlm,
          recommendedModel: hw.recommendedModel,
          preferredQuantization: hw.preferredQuantization,
        };
      })(),
      chaosResilience: {
        arenaMode: "EPHEMERAL_TMPDIR",
        baselineResilienceScore: calculateResilienceScore({
          containmentSuccess: true,
          detectionTimeMs: 5,
          recoveryTimeMs: 12,
        }),
      },
      settings: SettingsManager.loadSettings(resolvedPath),
      workflowStatePath: statePath,
    };

    await auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_STARTED",
      sourceAgent: "cto",
      level: "info",
      payload: {
        bridgeAction: "WORKFLOW_STATUS",
        activeMode: payload.activeMode,
      },
    });

    if (options?.json) {
      ctx.stdout(JSON.stringify(payload, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW STATUS] mode=${payload.activeMode} fsm=${payload.fsmState} ring1=${payload.ring1TechSpecialists.join(",")} ring2=${payload.ring2DomainExperts.join(",")}`
      );
    }
    return;
  }

  if (action === "route") {
    const scopeItems = (options?.scope || "")
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const dispatcher = new CeremonyDispatcher(resolvedPath);
    const routing = dispatcher.resolveDomainAttendeesForScope(
      scopeItems,
      orgChart
    );

    const persisted = await fsm.persistWorkflowState(resolvedPath, {
      lastRoutedScope: scopeItems,
      lastSummonedSpecialists: routing.matchedAttendeeIds,
    });

    await auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "CEREMONY_STARTED",
      sourceAgent: "cto",
      level: "info",
      payload: {
        bridgeAction: "WORKFLOW_ROUTE",
        scopeItems,
        matchedAttendeeIds: routing.matchedAttendeeIds,
      },
    });

    const payload = {
      action: "route",
      targetPath: resolvedPath,
      scopeItems,
      matchedAttendeeIds: routing.matchedAttendeeIds,
      injectedInvariants: routing.injectedInvariants,
      microRoleCards: routing.microRoleCards,
      activeMode: persisted.activeMode,
    };

    if (options?.json) {
      ctx.stdout(JSON.stringify(payload, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW ROUTE] scope=${scopeItems.join(",")} -> attendees=${routing.matchedAttendeeIds.join(",")} (${routing.injectedInvariants.length} invariants)`
      );
    }
    return;
  }

  if (action === "verify-gate") {
    const stimulusType: WorkflowStimulusType = options?.stimulus
      ? WorkflowStimulusTypeSchema.parse(options.stimulus)
      : "NORMAL_SPRINT";

    let rcaReport: RootCauseAnalysisReport | undefined;
    if (options?.rcaFile) {
      const rcaPath = path.resolve(resolvedPath, options.rcaFile);
      const rawRca = await fs.readFile(rcaPath, "utf-8");
      rcaReport = RootCauseAnalysisReportSchema.parse(JSON.parse(rawRca));
    } else {
      try {
        const rawState = await fs.readFile(statePath, "utf-8");
        const parsedState = WorkflowPersistedStateSchema.parse(
          JSON.parse(rawState)
        );
        rcaReport = parsedState.activeRcaReport;
      } catch {
        rcaReport = undefined;
      }
    }

    try {
      const gateResult = fsm.enforceCognitiveForcingGate({
        stimulusType,
        rcaReport,
      });

      await fsm.persistWorkflowState(resolvedPath, {
        activeMode: gateResult.activeMode,
        fsmState: "SPECIFY",
        stimulusType,
        activeRcaReport: rcaReport,
      });

      await auditLogger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "GATEKEEPER_PASSED",
        sourceAgent: "cto",
        level: "info",
        payload: {
          bridgeAction: "WORKFLOW_VERIFY_GATE",
          allowed: true,
          stimulusType,
          rcaId: gateResult.rcaId,
        },
      });

      const payload = {
        action: "verify-gate",
        targetPath: resolvedPath,
        ...gateResult,
      };

      if (options?.json) {
        ctx.stdout(JSON.stringify(payload, null, 2));
      } else {
        ctx.stdout(`[WORKFLOW GATE] ALLOWED -> ${gateResult.reason}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      await auditLogger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: "CONTRACT_VIOLATION",
        sourceAgent: "cto",
        level: "error",
        payload: {
          bridgeAction: "WORKFLOW_VERIFY_GATE",
          allowed: false,
          stimulusType,
          error: message,
        },
      });

      const payload = {
        action: "verify-gate",
        targetPath: resolvedPath,
        allowed: false,
        activeMode: "MODE_2_INVESTIGATE_RCA" as const,
        stimulusType,
        reason: message,
      };

      if (options?.json) {
        ctx.stdout(JSON.stringify(payload, null, 2));
      } else {
        ctx.stderr(`[WORKFLOW GATE BLOCKED] ${message}`);
      }
    }
    return;
  }

  if (action === "settings") {
    const currentSettings = SettingsManager.ensureSettingsFile(resolvedPath);
    const catalog = SettingsManager.getReferenceCatalog();
    const payload = {
      action: "settings",
      targetPath: resolvedPath,
      settingsPath: SettingsManager.getSettingsPath(resolvedPath),
      settings: currentSettings,
      referenceCatalog: catalog,
    };

    if (options?.json) {
      ctx.stdout(JSON.stringify(payload, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW SETTINGS] spikeCheckpoint=${currentSettings.governance.spikeCheckpoint} localSlm.mode=${currentSettings.localSlm.mode} formalProver=${currentSettings.gatekeeper.enableFormalAstProver}`
      );
    }
    return;
  }

  if (action === "set-setting") {
    if (!options?.key || options.value === undefined) {
      throw new Error(
        "Missing required options for 'set-setting': provide both --key <section.property> and --value <newValue>."
      );
    }

    const result = SettingsManager.updateSettingByPath(
      resolvedPath,
      options.key,
      options.value
    );

    await auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "STEERING_HINT",
      sourceAgent: "cto",
      level: "info",
      payload: {
        bridgeAction: "WORKFLOW_SET_SETTING",
        key: result.key,
        previousValue: result.previousValue,
        newValue: result.newValue,
      },
    });

    const payload = {
      action: "set-setting",
      targetPath: resolvedPath,
      key: result.key,
      previousValue: result.previousValue,
      newValue: result.newValue,
      settings: result.updatedSettings,
    };

    if (options?.json) {
      ctx.stdout(JSON.stringify(payload, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW SET-SETTING] ${result.key}: ${String(result.previousValue)} -> ${String(result.newValue)}`
      );
    }
    return;
  }

  if (action === "eval-settings") {
    const scorecard = await SettingsEvalHarness.runFullEvalSuite();

    await auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_COMPLETED",
      sourceAgent: "cto",
      level: "info",
      payload: {
        bridgeAction: "WORKFLOW_EVAL_SETTINGS",
        evalSessionId: scorecard.evalSessionId,
        overallScore: scorecard.overallScore,
        verdict: scorecard.verdict,
      },
    });

    if (options?.json) {
      ctx.stdout(JSON.stringify(scorecard, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW EVAL-SETTINGS] Verdict: ${scorecard.verdict} (${scorecard.passedScenarios}/${scorecard.totalScenarios} passed, Score: ${scorecard.overallScore}/100)`
      );
    }
    return;
  }

  if (action === "setup-harnesses") {
    const result = await setupAgentHarnesses(resolvedPath);
    const payload = {
      action: "setup-harnesses",
      ...result,
    };

    if (options?.json) {
      ctx.stdout(JSON.stringify(payload, null, 2));
    } else {
      ctx.stdout(
        `[WORKFLOW SETUP-HARNESSES] Generated ${result.generatedFiles.length} harness files for Claude Code & OpenAI Codex (${result.personaPreset}, lang=${result.language})`
      );
    }
    return;
  }

  throw new Error(
    `Unknown workflow action '${action}'. Supported actions: status, route, verify-gate, settings, set-setting, eval-settings, setup-harnesses.`
  );
}
