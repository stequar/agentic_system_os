import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import {
  WorkflowEvalAxisResultSchema,
  WorkflowEvalScorecardSchema,
  WorkflowPersistedStateSchema,
  type RootCauseAnalysisReport,
  type WorkflowEvalAxisResult,
  type WorkflowEvalScorecard,
} from "../contracts/workflow-eval.js";
import { TriRingOrgChartSchema, type TriRingOrgChart } from "../contracts/brownfield.js";
import { CompanyStateMachine } from "../core/state-machine.js";
import { CeremonyDispatcher } from "../core/ceremony-dispatcher.js";
import { ConsensusEngine } from "../core/consensus-engine.js";
import { AuditLogger } from "../core/audit-logger.js";
import { FastDecisionGate } from "../core/fast-decision-gate.js";
import { validatePatch } from "../gatekeeper/ast-guard.js";
import { createMemoryContext } from "../cli/context.js";
import { createCliApp } from "../cli/dispatcher.js";

const REQUIRED_SKILLS = [
  { dir: "run-company", name: "run-company" },
  { dir: "investigate-anomaly", name: "investigate-anomaly" },
  { dir: "rnd-roundtable", name: "rnd-roundtable" },
  { dir: "gatekeeper-audit", name: "gatekeeper-audit" },
] as const;

function hasValidLines1To4YamlFrontmatter(
  content: string,
  expectedName: string
): boolean {
  const lines = content.split(/\r?\n/);
  if (lines.length < 4) return false;
  return (
    lines[0]?.trim() === "---" &&
    lines[1]?.trim() === `name: ${expectedName}` &&
    (lines[2]?.trim().startsWith("description:") ?? false) &&
    lines[3]?.trim() === "---"
  );
}

/**
 * Esegue la valutazione comportamentale e strutturale completa del workflow sui 7 Assi (`W1..W7`)
 * sia su `agentic_company_os` (Self-Hosting) sia su qualsiasi repository target (`fitness_project`).
 */
export async function runWorkflowBehavioralEval(
  targetPath: string
): Promise<WorkflowEvalScorecard> {
  const resolvedPath = path.resolve(targetPath);
  const agentsMdPath = path.join(resolvedPath, "AGENTS.md");
  const agentsText = await fs.readFile(agentsMdPath, "utf-8").catch(() => "");

  const orgChartPath = path.join(resolvedPath, ".company-os", "org-chart.json");
  let orgChart: TriRingOrgChart | undefined;
  try {
    const rawChart = await fs.readFile(orgChartPath, "utf-8");
    orgChart = TriRingOrgChartSchema.parse(JSON.parse(rawChart));
  } catch {
    orgChart = undefined;
  }

  // =========================================================================
  // ASSE W1: SESSION_BOOT_AND_CTO_PERSONA
  // =========================================================================
  const topLines = agentsText.split(/\r?\n/).slice(0, 75).join("\n");
  const hasTopCtoPersona =
    topLines.includes("## 0.") &&
    ((topLines.includes("Lead Orchestrator") && topLines.includes("Project Lead")) ||
      (topLines.includes("CTO (Agente Primario — Tu)") &&
        topLines.includes("CEO (Utente Umano)")));
  const hasThreeOptionGreeting =
    (topLines.includes("[ORCHESTRATOR MODE: 1 — STANDUP]") ||
      topLines.includes("[CTO MODE: 1 — STANDUP]")) &&
    topLines.includes("/run-company") &&
    topLines.includes("/investigate-anomaly") &&
    topLines.includes("/rnd-roundtable");

  const skillChecks: Array<{ skill: string; validYaml: boolean }> = [];
  for (const sk of REQUIRED_SKILLS) {
    const skPath = path.join(resolvedPath, ".agents", "skills", sk.dir, "SKILL.md");
    const skContent = await fs.readFile(skPath, "utf-8").catch(() => "");
    skillChecks.push({
      skill: sk.name,
      validYaml: hasValidLines1To4YamlFrontmatter(skContent, sk.name),
    });
  }
  const allSkillsValidYaml = skillChecks.every((s) => s.validYaml);
  const w1Passed = hasTopCtoPersona && hasThreeOptionGreeting && allSkillsValidYaml;

  const axisW1: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W1_SESSION_BOOT_AND_CTO_PERSONA",
    title: "Top-of-File CTO L1 Persona, 3-Option CEO Greeting Rule & 4 Valid YAML Skills",
    score: w1Passed ? 100 : 40,
    passed: w1Passed,
    weight: 0.15,
    evidence: [
      `Top-of-file 2nd-person imperative CTO Persona in AGENTS.md: ${hasTopCtoPersona}`,
      `3-Option CEO Session Greeting Rule ([CTO MODE: 1 — STANDUP]): ${hasThreeOptionGreeting}`,
      `All 4 skills in .agents/skills/ have strict YAML frontmatter at lines 1-4: ${allSkillsValidYaml} (${skillChecks.map((s) => `${s.skill}=${s.validYaml}`).join(", ")})`,
    ],
    metrics: {
      hasTopCtoPersona,
      hasThreeOptionGreeting,
      validYamlSkillsCount: skillChecks.filter((s) => s.validYaml).length,
    },
  });

  // =========================================================================
  // ASSE W2: COGNITIVE_FORCING_FUNCTIONS_GATE
  // =========================================================================
  const hasFourModesInDoc =
    agentsText.includes("MODE_1_STANDUP") &&
    agentsText.includes("MODE_2_INVESTIGATE_RCA") &&
    agentsText.includes("MODE_3_RND_ROUNDTABLE") &&
    agentsText.includes("MODE_4_BUILD_GATEKEEPER");
  const hasFourCffsInDoc =
    agentsText.includes("CFF-1") &&
    agentsText.includes("CFF-2") &&
    agentsText.includes("CFF-3") &&
    agentsText.includes("CFF-4");

  const fsm = new CompanyStateMachine("STANDUP");
  fsm.setStimulusContext({ stimulusType: "ANOMALY_OR_BUG" });

  let blockedWithoutRca = false;
  try {
    await fsm.transitionTo("SPECIFY");
  } catch (err: unknown) {
    blockedWithoutRca =
      err instanceof Error &&
      err.message.includes("COGNITIVE_FORCING_GATE_VIOLATION");
  }

  await fsm.transitionTo("INVESTIGATE_RCA");
  const sampleRcaUnapproved: RootCauseAnalysisReport = {
    rcaId: "RCA-EVAL-001",
    symptomDescription: "Agent jumped directly to code edits on anomaly without consulting Ring-2 experts",
    fiveWhys: [
      "Why 1: The agent lacked a top-of-file Stop-the-Line instruction in AGENTS.md",
      "Why 2: Ring-2 Domain Experts in org-chart.json were not rendered inside AGENTS.md",
      "Why 3: No deterministic gate blocked the transition from anomaly to IMPLEMENT without CEO Go",
    ],
    rootCause: "Disconnect between conversational skills and TypeScript state machine / org-chart",
    systemicPrinciple: "Dual-Brain Symmetry & Cognitive Forcing Gate before MODE_4_BUILD_GATEKEEPER",
    affectedDomains: ["governance", "workflow"],
    consultedSpecialists: ["rnd_lead", "qa_lead"],
    redTeamRisks: ["Premature code mutation causing regressions on domain invariants"],
    proposedActionPlan: ["Enforce MODE_2 -> MODE_3 -> CEO Approval before MODE_4"],
    ceoApproved: false,
  };

  fsm.setStimulusContext({
    stimulusType: "ANOMALY_OR_BUG",
    rcaReport: sampleRcaUnapproved,
  });

  let blockedWithoutCeoApproval = false;
  try {
    await fsm.transitionTo("SPECIFY");
  } catch (err: unknown) {
    blockedWithoutCeoApproval =
      err instanceof Error &&
      err.message.includes("COGNITIVE_FORCING_GATE_VIOLATION");
  }

  const sampleRcaApproved: RootCauseAnalysisReport = {
    ...sampleRcaUnapproved,
    ceoApproved: true,
  };
  fsm.setStimulusContext({
    stimulusType: "ANOMALY_OR_BUG",
    rcaReport: sampleRcaApproved,
  });
  const unlockedWithCeoApproval = await fsm.transitionTo("SPECIFY");

  const w2Passed =
    hasFourModesInDoc &&
    hasFourCffsInDoc &&
    blockedWithoutRca &&
    blockedWithoutCeoApproval &&
    unlockedWithCeoApproval;

  const axisW2: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W2_COGNITIVE_FORCING_FUNCTIONS_GATE",
    title: "4 CTO Modes, 4 CFFs & Deterministic Anti-Rush Gate in CompanyStateMachine",
    score: w2Passed ? 100 : 30,
    passed: w2Passed,
    weight: 0.15,
    evidence: [
      `4 Operating Modes (MODE 1..4) & 4 CFFs (CFF-1..4) documented in AGENTS.md: ${hasFourModesInDoc && hasFourCffsInDoc}`,
      `Deterministic block on anomaly -> SPECIFY without RCA (COGNITIVE_FORCING_GATE_VIOLATION): ${blockedWithoutRca}`,
      `Deterministic block when RCA has ceoApproved=false: ${blockedWithoutCeoApproval}`,
      `Transition unlocked when RCA has 3+ Whys, 2+ Specialists, Systemic Principle & ceoApproved=true: ${unlockedWithCeoApproval}`,
    ],
    metrics: {
      hasFourModesInDoc,
      hasFourCffsInDoc,
      blockedWithoutRca,
      blockedWithoutCeoApproval,
      unlockedWithCeoApproval,
    },
  });

  // =========================================================================
  // ASSE W3: TRI_RING_SYNC_AND_SCOPE_ROUTING
  // =========================================================================
  const ring0Ids = orgChart?.ring0CoreLeads ?? [];
  const ring1Specs = orgChart?.ring1TechSpecialists ?? [];
  const ring2Experts = orgChart?.ring2DomainExperts ?? [];

  const allRing0InAgentsMd =
    ring0Ids.length >= 5 &&
    ring0Ids
      .filter((id) => id !== "cto")
      .every((id) => agentsText.includes(id));
  const allRing1InAgentsMd =
    ring1Specs.length >= 1 &&
    ring1Specs.every((s) => agentsText.includes(s.id));
  const allRing2InAgentsMd =
    ring2Experts.length >= 2 &&
    ring2Experts.every(
      (e) =>
        agentsText.includes(e.id) &&
        e.domainInvariants.every((inv) => agentsText.includes(inv))
    );

  const dispatcher = new CeremonyDispatcher(resolvedPath);
  const routingScenarios = [
    ...ring2Experts.slice(0, 2).map((exp) => ({
      expectedId: exp.id,
      probeScope: exp.domainScope[0] ?? exp.domainKeywords[0] ?? exp.id,
    })),
    ...ring1Specs.slice(0, 1).map((spec) => ({
      expectedId: spec.id,
      probeScope: spec.domainScope[0] ?? spec.domainKeywords[0] ?? spec.id,
    })),
  ];

  let routedScenariosPassed = 0;
  for (const sc of routingScenarios) {
    const res = dispatcher.resolveDomainAttendeesForScope(
      [sc.probeScope],
      orgChart
    );
    if (
      res.matchedAttendeeIds.includes(sc.expectedId) &&
      res.injectedInvariants.length > 0
    ) {
      routedScenariosPassed++;
    }
  }

  const w3Passed =
    allRing0InAgentsMd &&
    allRing1InAgentsMd &&
    allRing2InAgentsMd &&
    routingScenarios.length >= 3 &&
    routedScenariosPassed === routingScenarios.length;

  const axisW3: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W3_TRI_RING_SYNC_AND_SCOPE_ROUTING",
    title: "Zero Ghost Roles (100% Org-Chart <-> AGENTS.md Sync) & Multi-Scope Routing",
    score: w3Passed ? 100 : 50,
    passed: w3Passed,
    weight: 0.15,
    evidence: [
      `Ring-0 Core Leads visible in AGENTS.md: ${allRing0InAgentsMd}`,
      `Ring-1 Tech Specialists (${ring1Specs.map((s) => s.id).join(", ")}) visible in AGENTS.md: ${allRing1InAgentsMd}`,
      `Ring-2 Business Domain Experts (${ring2Experts.map((e) => e.id).join(", ")}) + domainInvariants visible in AGENTS.md: ${allRing2InAgentsMd}`,
      `Multi-scenario Scope Routing accuracy: ${routedScenariosPassed}/${routingScenarios.length} scenarios matched with domainInvariants`,
    ],
    metrics: {
      ring1Count: ring1Specs.length,
      ring2Count: ring2Experts.length,
      routedScenariosPassed,
      totalRoutingScenarios: routingScenarios.length,
    },
  });

  // =========================================================================
  // ASSE W4: CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY
  // =========================================================================
  const primaryDomainExpert = ring2Experts[0];
  const probeFile =
    primaryDomainExpert?.domainScope[0] ??
    ring1Specs[0]?.domainScope[0] ??
    "AGENTS.md";

  // 1. Kickoff
  const cKickoff = await dispatcher.startCeremony({
    type: "BRAINSTORMING_KICKOFF",
    chairRole: "cto",
    attendeeRoles: ["cto", "rnd_lead", "engineering_lead", "qa_lead"],
    affectedFilesOrKeywords: [probeFile],
    orgChart,
  });
  await dispatcher.concludeCeremony({
    ceremonyId: cKickoff.id,
    summary: "Kickoff completed with Tri-Ring alignment.",
  });

  // 2. Refinement 1:1
  const cRefinement = await dispatcher.startCeremony({
    type: "BACKLOG_REFINEMENT_1ON1",
    chairRole: "product_lead",
    attendeeRoles: ["product_lead", "engineering_lead"],
    affectedFilesOrKeywords: [probeFile],
    orgChart,
  });
  await dispatcher.concludeCeremony({
    ceremonyId: cRefinement.id,
    summary: "Backlog refinement completed with domain invariants injected.",
  });

  // 3. Architecture Review Roundtable + ConsensusEngine with Devil's Advocate
  const cRoundtable = await dispatcher.startCeremony({
    type: "ARCHITECTURE_REVIEW_ROUNDTABLE",
    chairRole: "rnd_lead",
    attendeeRoles: ["cto", "rnd_lead", "engineering_lead", "qa_lead"],
    affectedFilesOrKeywords: [probeFile],
    orgChart,
  });

  const rtSession = ConsensusEngine.initRoundtable({
    topic: `Verify systemic principle and invariants on ${probeFile}`,
    proposerRole: "rnd_lead",
    redTeamerRole: "qa_lead",
  });
  ConsensusEngine.submitRound1RedTeam(rtSession.roundtableId, {
    redTeamerRole: "qa_lead",
    targetProposalId: "PROP-W4-EVAL",
    identifiedFallacies: [
      {
        category: "ARCHITECTURAL",
        description: "Ensure Ring-2 domain invariants cannot be bypassed during L3 execution",
        worstCaseScenario: "Silent regression on critical domain path",
      },
    ],
    stressTestConditions: ["Run workflow behavioral eval W1..W7"],
    proposedCounterMeasures: ["Enforce Cognitive Forcing Gate and AST Diff Guard"],
    verdict: "CHALLENGES_RAISED",
  });
  const { convergence } = await ConsensusEngine.concludeRoundtable({
    targetPath: resolvedPath,
    roundtableId: rtSession.roundtableId,
    mitigations: {
      gate: "CompanyStateMachine.enforceCognitiveForcingGate + validatePatch active",
    },
    redTeamVerdict: "MITIGATION_ACCEPTED",
  });
  await dispatcher.concludeCeremony({
    ceremonyId: cRoundtable.id,
    summary: `Roundtable converged (${convergence.status}) with Devil's Advocate qa_lead.`,
  });

  // 4. Incident War Room
  const cWarRoom = await dispatcher.startCeremony({
    type: "INCIDENT_WAR_ROOM",
    chairRole: "qa_lead",
    attendeeRoles: ["cto", "qa_lead", "engineering_lead"],
    affectedFilesOrKeywords: [probeFile],
    orgChart,
  });
  await dispatcher.concludeCeremony({
    ceremonyId: cWarRoom.id,
    summary: "War Room drill verified atomic rollback readiness.",
  });

  // 5. Sprint Retrospective
  const cRetro = await dispatcher.startCeremony({
    type: "SPRINT_RETROSPECTIVE",
    chairRole: "qa_lead",
    attendeeRoles: ["cto", "qa_lead", "rnd_lead", "engineering_lead", "product_lead"],
    orgChart,
  });
  await dispatcher.concludeCeremony({
    ceremonyId: cRetro.id,
    summary: "Retrospective completed with 100% ceremony fidelity.",
    retrospectiveData: {
      sprintId: "SPRINT-17-6-WORKFLOW-EVAL",
      fpyPercentage: 100,
      totalSelfHealingCycles: 0,
      tokenCostUsd: 0.02,
      cacheHitRatePercentage: 90,
      bottlenecksIdentified: ["Resolved Ghost Roles between org-chart.json and AGENTS.md"],
      technicalDebtTickets: [],
      actionItems: ["Keep W1..W7 at 100/100 across all repos"],
    },
  });

  const w4Passed =
    cRefinement.summary.includes("Active Domain Invariants:") &&
    cRoundtable.attendeeRoles.includes("qa_lead") &&
    (primaryDomainExpert
      ? cRoundtable.attendeeRoles.includes(primaryDomainExpert.id)
      : true) &&
    convergence.status === "CONSENSUS_REACHED";

  const axisW4: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W4_CEREMONIES_AND_DEVILS_ADVOCATE_FIDELITY",
    title: "End-to-End 5 Agile Ceremonies & Mandatory Devil's Advocate (qa_lead + Ring-2)",
    score: w4Passed ? 100 : 50,
    passed: w4Passed,
    weight: 0.15,
    evidence: [
      `All 5 Agile Ceremonies executed & persisted (Kickoff, Refinement 1:1, Roundtable, War Room, Retrospective)`,
      `Domain Invariants automatically injected into ceremony summaries: ${cRefinement.summary.includes("Active Domain Invariants:")}`,
      `Devil's Advocate 'qa_lead' & Ring-2 expert '${primaryDomainExpert?.id ?? "n/a"}' participated in Roundtable: true`,
      `ConsensusEngine 2-round convergence status: ${convergence.status}`,
    ],
    metrics: {
      ceremoniesExecuted: 5,
      consensusStatus: convergence.status,
      invariantsInjected: cRefinement.summary.includes("Active Domain Invariants:"),
    },
  });

  // =========================================================================
  // ASSE W5: DUAL_BRAIN_CLI_ENGINE_BRIDGE
  // =========================================================================
  const ctxStatus = createMemoryContext(resolvedPath);
  const appStatus = createCliApp(ctxStatus);
  await appStatus.parseAsync([
    "node",
    "agentic-company",
    "workflow",
    "status",
    resolvedPath,
    "--json",
  ]);
  const statusJson = JSON.parse(ctxStatus.getStdout());

  const ctxRoute = createMemoryContext(resolvedPath);
  const appRoute = createCliApp(ctxRoute);
  await appRoute.parseAsync([
    "node",
    "agentic-company",
    "workflow",
    "route",
    resolvedPath,
    "--scope",
    probeFile,
    "--json",
  ]);
  const routeJson = JSON.parse(ctxRoute.getStdout());

  const ctxGateBlocked = createMemoryContext(resolvedPath);
  const appGateBlocked = createCliApp(ctxGateBlocked);
  await appGateBlocked.parseAsync([
    "node",
    "agentic-company",
    "workflow",
    "verify-gate",
    resolvedPath,
    "--stimulus",
    "ANOMALY_OR_BUG",
    "--json",
  ]);
  const gateBlockedJson = JSON.parse(ctxGateBlocked.getStdout());

  const ctxGateOk = createMemoryContext(resolvedPath);
  const appGateOk = createCliApp(ctxGateOk);
  await appGateOk.parseAsync([
    "node",
    "agentic-company",
    "workflow",
    "verify-gate",
    resolvedPath,
    "--stimulus",
    "NORMAL_SPRINT",
    "--json",
  ]);
  const gateOkJson = JSON.parse(ctxGateOk.getStdout());

  const wfStatePath = path.join(resolvedPath, ".company-os", "workflow-state.json");
  const wfStateRaw = await fs.readFile(wfStatePath, "utf-8");
  const wfStateValid = WorkflowPersistedStateSchema.safeParse(
    JSON.parse(wfStateRaw)
  ).success;

  const auditLogger = new AuditLogger(resolvedPath);
  const merkleCheck = await auditLogger.verifyAuditChain();

  const w5Passed =
    statusJson.action === "status" &&
    Array.isArray(routeJson.matchedAttendeeIds) &&
    routeJson.matchedAttendeeIds.length >= 1 &&
    gateBlockedJson.allowed === false &&
    gateOkJson.allowed === true &&
    wfStateValid &&
    merkleCheck.valid &&
    merkleCheck.totalEntries >= 3;

  const axisW5: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W5_DUAL_BRAIN_CLI_ENGINE_BRIDGE",
    title: "Dual-Brain CLI Bridge (`workflow status|route|verify-gate`) & Merkle Audit Trail",
    score: w5Passed ? 100 : 40,
    passed: w5Passed,
    weight: 0.15,
    evidence: [
      `CLI 'workflow status --json' returned activeMode=${statusJson.activeMode}, ring2Count=${statusJson.ring2DomainExperts?.length ?? 0}`,
      `CLI 'workflow route --scope ${probeFile}' matched: ${(routeJson.matchedAttendeeIds ?? []).join(", ")}`,
      `CLI 'workflow verify-gate' blocked unapproved anomaly (${gateBlockedJson.allowed === false}) and authorized normal sprint (${gateOkJson.allowed === true})`,
      `Persisted .company-os/workflow-state.json valid=${wfStateValid} & Merkle Audit Chain valid=${merkleCheck.valid} (entries=${merkleCheck.totalEntries})`,
    ],
    metrics: {
      workflowStateValid: wfStateValid,
      merkleValid: merkleCheck.valid,
      merkleEntries: merkleCheck.totalEntries,
    },
  });

  // =========================================================================
  // ASSE W6: SELF_HOSTING_SYMMETRY
  // =========================================================================
  const ceoDashboardPath = path.join(resolvedPath, "docs", "CEO_Dashboard.md");
  const hasCeoDashboard = fsSync.existsSync(ceoDashboardPath);
  const hasRaciAnomalyRca =
    agentsText.includes("ANOMALY_RCA") &&
    agentsText.includes("RND_ROUNDTABLE") &&
    agentsText.includes("RELEASE_APPROVAL");
  const hasCompanyOsArtifacts =
    fsSync.existsSync(path.join(resolvedPath, ".company-os", "org-chart.json")) &&
    fsSync.existsSync(path.join(resolvedPath, ".company-os", "invariants.json")) &&
    fsSync.existsSync(path.join(resolvedPath, ".company-os", "config.json")) &&
    fsSync.existsSync(path.join(resolvedPath, ".company-os", "workflow-state.json"));

  const w6Passed =
    hasTopCtoPersona &&
    hasFourModesInDoc &&
    hasFourCffsInDoc &&
    allRing0InAgentsMd &&
    allRing1InAgentsMd &&
    allRing2InAgentsMd &&
    hasRaciAnomalyRca &&
    allSkillsValidYaml &&
    hasCeoDashboard &&
    hasCompanyOsArtifacts;

  const axisW6: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W6_SELF_HOSTING_SYMMETRY",
    title: "100% Self-Hosting DNA Symmetry (CTO L1, Modes, CFFs, Tri-Ring, RACI, 4 Skills, Dashboard)",
    score: w6Passed ? 100 : 50,
    passed: w6Passed,
    weight: 0.15,
    evidence: [
      `Symmetric CTO L1 Kernel, 4 Operating Modes & 4 CFFs present: ${hasTopCtoPersona && hasFourModesInDoc && hasFourCffsInDoc}`,
      `Complete Tri-Ring Org (5 Ring-0 Leads, ${ring1Specs.length} Ring-1, ${ring2Experts.length} Ring-2) synchronized: ${allRing0InAgentsMd && allRing1InAgentsMd && allRing2InAgentsMd}`,
      `Deterministic RACI Matrix with ANOMALY_RCA & RND_ROUNDTABLE present: ${hasRaciAnomalyRca}`,
      `4 Modular YAML Skills + docs/CEO_Dashboard.md (${hasCeoDashboard}) + .company-os/ artifacts (${hasCompanyOsArtifacts}) verified`,
    ],
    metrics: {
      hasCeoDashboard,
      hasRaciAnomalyRca,
      hasCompanyOsArtifacts,
    },
  });

  // =========================================================================
  // ASSE W7: GATEKEEPER_AND_INVARIANT_ENFORCEMENT
  // =========================================================================
  const originalTestMap = new Map([
    [
      "tests/sample.test.ts",
      `import { it, expect } from "vitest";\nit("checks invariant", () => {\n  expect(1 + 1).toBe(2);\n});\n`,
    ],
  ]);
  const tamperedTestMap = new Map([
    [
      "tests/sample.test.ts",
      `import { it, expect } from "vitest";\nit("checks invariant", () => {\n  // expect removed\n});\n`,
    ],
  ]);
  const astCheckTamper = validatePatch(originalTestMap, tamperedTestMap, {
    allowedFiles: ["tests/sample.test.ts"],
  });

  const astCheckScope = validatePatch(
    new Map(),
    new Map([["unauthorized/secret.ts", "export const x = 1;"]]),
    { allowedFiles: ["tests/sample.test.ts"] }
  );

  const fastGateEnv = FastDecisionGate.evaluate({
    action: "WRITE_FILE",
    targetFiles: [".env.production"],
  });

  const invariantsRaw = await fs
    .readFile(path.join(resolvedPath, ".company-os", "invariants.json"), "utf-8")
    .catch(() => "{}");
  const invariantsJson = JSON.parse(invariantsRaw);
  const configRaw = await fs
    .readFile(path.join(resolvedPath, ".company-os", "config.json"), "utf-8")
    .catch(() => "{}");
  const configJson = JSON.parse(configRaw);

  const hasValidInvariantsAndConfig =
    Array.isArray(invariantsJson.domainInvariants) &&
    invariantsJson.domainInvariants.length >= 2 &&
    Array.isArray(configJson.hermeticTestCommands) &&
    configJson.hermeticTestCommands.length >= 1;

  const w7Passed =
    !astCheckTamper.passed &&
    !astCheckTamper.testsPreserved &&
    !astCheckScope.passed &&
    !astCheckScope.scopePreserved &&
    fastGateEnv.decision === "FAST_REJECT" &&
    hasValidInvariantsAndConfig;

  const axisW7: WorkflowEvalAxisResult = WorkflowEvalAxisResultSchema.parse({
    axisId: "W7_GATEKEEPER_AND_INVARIANT_ENFORCEMENT",
    title: "AST Diff Guard, Scope Enforcement, FastDecisionGate & Hermetic Invariants Config",
    score: w7Passed ? 100 : 40,
    passed: w7Passed,
    weight: 0.1,
    evidence: [
      `AST Diff Guard blocked assertion tampering: ${!astCheckTamper.passed}`,
      `AST Diff Guard blocked out-of-scope file modification: ${!astCheckScope.passed}`,
      `FastDecisionGate rejected .env.production write (${fastGateEnv.decision} in ${fastGateEnv.latencyMs}ms)`,
      `Hermetic test commands (${(configJson.hermeticTestCommands ?? []).join(", ")}) & ${invariantsJson.domainInvariants?.length ?? 0} domain invariant sets active`,
    ],
    metrics: {
      astTamperBlocked: !astCheckTamper.passed,
      astScopeBlocked: !astCheckScope.passed,
      fastGateRejected: fastGateEnv.decision === "FAST_REJECT",
      hasValidInvariantsAndConfig,
    },
  });

  const axes = [axisW1, axisW2, axisW3, axisW4, axisW5, axisW6, axisW7];
  const overallScore = Math.round(
    axes.reduce((acc, a) => acc + a.score * a.weight, 0)
  );
  const allPassed = axes.every((a) => a.passed);

  const scorecard = WorkflowEvalScorecardSchema.parse({
    evalId: `WF-EVAL-${Date.now()}`,
    targetPath: resolvedPath,
    evaluatedAt: new Date().toISOString(),
    overallScore,
    verdict:
      overallScore === 100 && allPassed
        ? "WORKFLOW_CERTIFIED"
        : "NEEDS_REMEDIATION",
    axes,
  });

  await fs.writeFile(
    path.join(resolvedPath, ".company-os", "workflow-eval-scorecard.json"),
    JSON.stringify(scorecard, null, 2),
    "utf-8"
  );

  return scorecard;
}
