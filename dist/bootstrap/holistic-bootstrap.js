import fs from "node:fs/promises";
import path from "node:path";
import { HolisticBootstrapReportSchema, } from "../contracts/brownfield.js";
import { detectProjectStack, resolveHermeticTestCommands, } from "../inspector/detector.js";
import { mineRepositoryDomainAndRoles } from "../inspector/domain-miner.js";
import { runEnvironmentDoctor } from "../doctor/health.js";
import { attachWorkspace, renderCeoDashboard } from "../attach/injector.js";
import { setupAgentHarnesses } from "../attach/harness-adapter.js";
import { graftManagedSection } from "../attach/smart-merge.js";
import { atomicWriteFile } from "../utils/fs-atomic.js";
import { CompanyStateMachine } from "../core/state-machine.js";
import { SettingsManager } from "../core/settings-manager.js";
import { introspectAndDetectDrift, loadOrCreateDeclarativeContract, } from "../sync/contract-introspector.js";
import { syncCrossDomainContracts } from "../sync/contract-sync.js";
import { synthesizeDynamicMcpTool } from "../mcp/synthesizer.js";
import { DynamicMcpRegistry } from "../mcp/dynamic-registry.js";
import { verifyDynamicToolAst } from "../mcp/sandbox-runner.js";
import { CeremonyDispatcher } from "../core/ceremony-dispatcher.js";
/**
 * Esegue la pipeline olistica in 5 Fasi (`P0..P4` — `RFC-007`) per il bootstrap completo
 * di un workspace (Greenfield o Brownfield):
 * - `P0_DEEP_RECONNAISSANCE`: Stack inspection profonda, Doctor parallelo e risoluzione runner ermetici (`.venv/bin/pytest`)
 * - `P1_SEMANTIC_DOMAIN_MINING`: Estrazione di Ring-1 Tech Specialists e Ring-2 Business Domain Experts
 * - `P2_TRI_RING_ORG_SYNTHESIS`: Salvataggio `.company-os/org-chart.json` e Smart-Merge non distruttivo
 * - `P3_HOLISTIC_TOOLING_PROVISIONING`: Pre-sintesi tool MCP JIT (`HOT_LOADED`), Drift Detector, `contracts.json`, `invariants.json` e `config.json`
 * - `P4_INAUGURAL_ALIGNMENT_CEREMONY`: Cerimonia inaugurale `BRAINSTORMING_KICKOFF` con tutti gli esperti Ring-0/1/2
 */
export async function runHolisticWorkspaceBootstrap(targetPath, options) {
    const resolvedPath = path.resolve(targetPath);
    const isDryRun = options?.dryRun === true;
    const phasesCompleted = [];
    const companyOsDir = path.join(resolvedPath, ".company-os");
    const orgChartPath = path.join(companyOsDir, "org-chart.json");
    const contractsPath = path.join(companyOsDir, "contracts.json");
    const invariantsPath = path.join(companyOsDir, "invariants.json");
    const configPath = path.join(companyOsDir, "config.json");
    if (!isDryRun) {
        await fs.mkdir(companyOsDir, { recursive: true });
        SettingsManager.ensureSettingsFile(resolvedPath);
    }
    // =========================================================================
    // FASE P0: DEEP_RECONNAISSANCE
    // =========================================================================
    const stack = await detectProjectStack(resolvedPath, { hermetic: true });
    const hermeticTestCommands = await resolveHermeticTestCommands(resolvedPath, stack.testCommands);
    const doctorReport = await runEnvironmentDoctor(resolvedPath, {
        timeoutMs: options?.doctorTimeoutMs ?? 3000,
    });
    phasesCompleted.push("P0_DEEP_RECONNAISSANCE");
    // =========================================================================
    // FASE P1: SEMANTIC_DOMAIN_MINING
    // =========================================================================
    const orgChart = await mineRepositoryDomainAndRoles(resolvedPath, stack, {
        ignoreExistingAgentsMd: options?.ignoreExistingAgentsMdForMining,
    });
    phasesCompleted.push("P1_SEMANTIC_DOMAIN_MINING");
    // =========================================================================
    // FASE P2: TRI_RING_ORG_SYNTHESIS & SMART-MERGE
    // =========================================================================
    if (!isDryRun) {
        await fs.writeFile(orgChartPath, JSON.stringify(orgChart, null, 2), "utf-8");
    }
    const attachResult = await attachWorkspace(resolvedPath, {
        dryRun: isDryRun,
        backup: true,
        orgChart,
    });
    const secondAttachPass = await attachWorkspace(resolvedPath, {
        dryRun: isDryRun,
        backup: true,
        orgChart,
    });
    const idempotencyVerified = isDryRun
        ? secondAttachPass.injectedFiles.length === 6
        : secondAttachPass.injectedFiles.length === 6 &&
            secondAttachPass.injectedFiles.every((f) => f.status === "SKIPPED_UNCHANGED");
    if (!isDryRun) {
        const ceoDashboardPath = path.join(resolvedPath, "docs", "CEO_Dashboard.md");
        let existingDashboard = null;
        try {
            existingDashboard = await fs.readFile(ceoDashboardPath, "utf-8");
        }
        catch {
            existingDashboard = null;
        }
        const dashboardPayload = renderCeoDashboard(stack, orgChart);
        const mergedDashboard = graftManagedSection(existingDashboard, "ceo-dashboard-governance", dashboardPayload, () => dashboardPayload);
        await atomicWriteFile(ceoDashboardPath, mergedDashboard, { backup: false });
        const fsm = new CompanyStateMachine("STANDUP");
        await fsm.persistWorkflowState(resolvedPath, {
            activeMode: "MODE_1_STANDUP",
            fsmState: "STANDUP",
        });
    }
    phasesCompleted.push("P2_TRI_RING_ORG_SYNTHESIS");
    // =========================================================================
    // FASE P3: HOLISTIC_TOOLING_PROVISIONING
    // =========================================================================
    // 3.1 JIT MCP Domain Tool Pre-Synthesis & Sandbox Verification (Sprint 19)
    const dynamicRegistry = new DynamicMcpRegistry();
    const synthesizedBundle = synthesizeDynamicMcpTool({
        taskDescription: `Validate domain invariants and cross-domain contract parity for ${path.basename(resolvedPath)}`,
        missingCapability: "domain_invariant_and_drift_checker",
        suggestedToolName: "domain_invariant_and_drift_checker",
        description: "JIT synthesized MCP tool to validate bounded context invariants and schema parity",
        inputFields: {
            boundedContext: { type: "string", required: true },
            targetFile: { type: "string", required: false },
        },
        ttlSeconds: 3600,
        generatedByRole: "ai_lead",
    });
    // Durante il bootstrap di un repository potenzialmente non fidato NON eseguiamo il
    // codice del tool sintetizzato nella sandbox worker_threads (che NON è un confine di
    // sicurezza OS — cfr. SANDBOX_SECURITY_MODEL). Verifichiamo STATICAMENTE con il linter
    // euristico fail-closed e lo materializziamo come artefatto; l'esecuzione reale resta
    // dietro una revisione esplicita a runtime del MCP server.
    const bootstrapAstCheck = verifyDynamicToolAst(synthesizedBundle.code, synthesizedBundle.tool.permissions);
    const hotLoadedTool = bootstrapAstCheck.safe
        ? dynamicRegistry.registerVerifiedTool({ ...synthesizedBundle.tool, status: "TEST_PASSED" }, synthesizedBundle.code)
        : { ...synthesizedBundle.tool, status: "QUARANTINED" };
    if (!isDryRun) {
        const dynToolsDir = path.join(companyOsDir, "dynamic-tools");
        await fs.mkdir(dynToolsDir, { recursive: true });
        await fs.writeFile(path.join(dynToolsDir, `${hotLoadedTool.toolId}.json`), JSON.stringify(hotLoadedTool, null, 2), "utf-8");
        await fs.writeFile(path.join(dynToolsDir, `${hotLoadedTool.toolId}.mjs`), synthesizedBundle.code, "utf-8");
    }
    // 3.2 Contract Introspection, Semantic Drift Detector & Cross-Domain Sync
    const driftReport = await introspectAndDetectDrift(resolvedPath, {
        persistContractsJson: !isDryRun,
        dryRun: isDryRun,
    });
    const declarativeContract = await loadOrCreateDeclarativeContract(resolvedPath, isDryRun);
    const hasFitnessPolyglotTarget = await fs
        .access(path.join(resolvedPath, "src/backend/api/schemas.py"))
        .then(() => true)
        .catch(() => false);
    const contractSyncResult = await syncCrossDomainContracts(declarativeContract, {
        targetDir: resolvedPath,
        dryRun: isDryRun || !hasFitnessPolyglotTarget,
        backup: true,
    });
    // 3.3 Domain Invariants & Critical Paths Configuration (.company-os/invariants.json)
    const criticalPaths = Array.from(new Set(orgChart.ring2DomainExperts.flatMap((e) => e.domainScope)));
    const domainInvariants = orgChart.ring2DomainExperts.map((e) => ({
        expertId: e.id,
        boundedContext: e.boundedContext,
        scope: e.domainScope,
        invariants: e.domainInvariants,
    }));
    if (!isDryRun) {
        await fs.writeFile(invariantsPath, JSON.stringify({
            targetPath: resolvedPath,
            criticalPaths,
            domainInvariants,
            generatedAt: new Date().toISOString(),
        }, null, 2), "utf-8");
        // 3.4 Hermetic Config (.company-os/config.json)
        await fs.writeFile(configPath, JSON.stringify({
            targetPath: resolvedPath,
            languages: stack.languages,
            frameworks: stack.frameworks,
            hermeticTestCommands,
            updatedAt: new Date().toISOString(),
        }, null, 2), "utf-8");
        // 3.5 Cross-Agent Harness Provisioning (Claude Code CLAUDE.md + .claude/commands + .mcp.json & OpenAI Codex)
        await setupAgentHarnesses(resolvedPath, { dryRun: isDryRun });
    }
    phasesCompleted.push("P3_HOLISTIC_TOOLING_PROVISIONING");
    // =========================================================================
    // FASE P4: INAUGURAL_ALIGNMENT_CEREMONY
    // =========================================================================
    let ceremonyId = `CEREMONY-BRAINSTORMING_KICKOFF-DRYRUN`;
    if (!isDryRun) {
        const dispatcher = new CeremonyDispatcher(resolvedPath);
        const allAttendees = Array.from(new Set([
            ...orgChart.ring0CoreLeads,
            ...orgChart.ring1TechSpecialists.map((s) => s.id),
            ...orgChart.ring2DomainExperts.map((s) => s.id),
        ]));
        const started = await dispatcher.startCeremony({
            type: "BRAINSTORMING_KICKOFF",
            chairRole: "cto",
            attendeeRoles: allAttendees,
            affectedFilesOrKeywords: criticalPaths,
            orgChart,
            summary: `Inaugural Holistic Bootstrap Kickoff for ${resolvedPath} with ${orgChart.ring1TechSpecialists.length} Ring-1 Tech Specialists and ${orgChart.ring2DomainExperts.length} Ring-2 Domain Experts.`,
        });
        const concluded = await dispatcher.concludeCeremony({
            ceremonyId: started.id,
            summary: `Aligned Tri-Ring Organization (${allAttendees.length} roles), verified JIT MCP tool '${hotLoadedTool.toolId}', detected ${driftReport.findings.length} contract drift items, and bound ${criticalPaths.length} critical paths.`,
            outputArtifactUri: orgChartPath,
        });
        ceremonyId = concluded.id;
    }
    phasesCompleted.push("P4_INAUGURAL_ALIGNMENT_CEREMONY");
    const finalReport = HolisticBootstrapReportSchema.parse({
        targetPath: resolvedPath,
        phasesCompleted,
        stack,
        hermeticTestCommands,
        doctorReport,
        orgChart,
        attachResult,
        driftReport,
        contractSyncResult,
        synthesizedMcpTools: [hotLoadedTool],
        invariantsPath,
        orgChartPath,
        contractsPath,
        configPath,
        ceremonyId,
        idempotencyVerified,
        completedAt: new Date().toISOString(),
    });
    if (!isDryRun) {
        await fs.writeFile(path.join(companyOsDir, "bootstrap-report.json"), JSON.stringify(finalReport, null, 2), "utf-8");
    }
    return finalReport;
}
//# sourceMappingURL=holistic-bootstrap.js.map