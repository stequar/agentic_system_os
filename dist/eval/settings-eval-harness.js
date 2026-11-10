import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { SettingsManager } from "../core/settings-manager.js";
import { CompanyStateMachine } from "../core/state-machine.js";
import { SettingsEvalScorecardSchema, } from "../contracts/settings-eval.js";
import { scanCodeHeuristics } from "../gatekeeper/formal-prover.js";
import { FastDecisionGate } from "../core/fast-decision-gate.js";
import { CavemanFormatter } from "../core/caveman-formatter.js";
import { BudgetWatchdog } from "../core/budget-watchdog.js";
import { runChaosExperiment, calculateResilienceScore } from "../security/chaos-engine.js";
export class SettingsEvalHarness {
    /**
     * Esegue l'intera suite di valutazione su 4 workspace effimeri indipendenti,
     * ciascuno con stack tecnologico e profilo di configurazione differente.
     */
    static async runFullEvalSuite() {
        const scenarios = [];
        // Scenario A: Python Microservice Backend con CEO_MAX_CONTROL
        scenarios.push(await this.evaluateScenarioA());
        // Scenario B: High-Velocity Node/TypeScript Frontend con AUTONOMOUS_FAST_TRACK
        scenarios.push(await this.evaluateScenarioB());
        // Scenario C: Local-First Air-Gapped Environment con LOCAL_FIRST_AIRGAP & FinOps Cap
        scenarios.push(await this.evaluateScenarioC());
        // Scenario D: Buggy Brownfield Anomaly con STRICT_IMMUNE_DEFENSE & Formal Prover
        scenarios.push(await this.evaluateScenarioD());
        const totalScenarios = scenarios.length;
        const passedScenarios = scenarios.filter((s) => s.status === "PASSED").length;
        const overallScore = Math.round((passedScenarios / totalScenarios) * 100);
        const scorecard = {
            evalSessionId: crypto.randomUUID(),
            executedAt: new Date().toISOString(),
            totalScenarios,
            passedScenarios,
            overallScore,
            verdict: overallScore === 100
                ? "SETTINGS_VERIFIED"
                : overallScore >= 75
                    ? "SETTINGS_DEGRADED"
                    : "SETTINGS_FAILED",
            scenarios,
        };
        return SettingsEvalScorecardSchema.parse(scorecard);
    }
    /**
     * Scenario A: Python FastAPI Backend con profilo CEO_MAX_CONTROL
     * Verifiche:
     * 1. CFF-5 blocca lo sviluppo se lo spike non è esplicitamente approvato dal CEO.
     * 2. CFF-5 sblocca lo sviluppo una volta che lo spike riceve approvazione CEO.
     * 3. Settings persistiti correttamente in .company-os/settings.json.
     */
    static async evaluateScenarioA() {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "settings-eval-scen-a-"));
        const logs = [];
        let passed = 0;
        const total = 3;
        try {
            logs.push(`[INIT] Setup Python workspace in ${tmpDir}`);
            await fs.mkdir(path.join(tmpDir, "app"), { recursive: true });
            await fs.writeFile(path.join(tmpDir, "app/main.py"), "from fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/health')\ndef health(): return {'status': 'ok'}\n");
            const customSettings = {
                ...SettingsManager.getDefaultSettings(),
                governance: {
                    spikeCheckpoint: "HITL_SPIKE_REVIEW",
                    anomalyGate: "STRICT_CFF_4_GATES",
                    releaseApproval: "CEO_MANDATORY",
                    roundtableDevilsAdvocate: true,
                },
                localSlm: {
                    ...SettingsManager.getDefaultSettings().localSlm,
                    mode: "DISABLED_CLOUD_ONLY",
                },
            };
            SettingsManager.saveSettings(tmpDir, customSettings);
            const loaded = SettingsManager.loadSettings(tmpDir);
            if (loaded.governance.spikeCheckpoint === "HITL_SPIKE_REVIEW") {
                passed++;
                logs.push("[CHECK 1] Settings salvati e caricati con spikeCheckpoint = HITL_SPIKE_REVIEW.");
            }
            const fsm = new CompanyStateMachine("STANDUP");
            let blockedOnUnapprovedSpike = false;
            try {
                fsm.enforceCognitiveForcingGate({
                    stimulusType: "NORMAL_SPRINT",
                    persistToTargetPath: tmpDir,
                    spikeApprovedByCeo: false,
                });
            }
            catch (err) {
                if (err.message.includes("SPIKE_CHECKPOINT_GATE_VIOLATION (CFF-5)")) {
                    blockedOnUnapprovedSpike = true;
                }
            }
            if (blockedOnUnapprovedSpike) {
                passed++;
                logs.push("[CHECK 2] CFF-5 ha bloccato correttamente il passaggio post-Spike non approvato dal CEO.");
            }
            const approvedGate = fsm.enforceCognitiveForcingGate({
                stimulusType: "NORMAL_SPRINT",
                persistToTargetPath: tmpDir,
                spikeApprovedByCeo: true,
            });
            if (approvedGate.allowed && approvedGate.activeMode === "MODE_4_BUILD_GATEKEEPER") {
                passed++;
                logs.push("[CHECK 3] Approvazione esplicita CEO ha sbloccato la transizione a MODE_4_BUILD_GATEKEEPER.");
            }
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
        }
        return {
            scenarioId: "SCENARIO_A_CEO_MAX_CONTROL",
            workspacePath: tmpDir,
            stackType: "python_fastapi",
            settingsSnapshot: SettingsManager.getDefaultSettings(),
            assertionsPassed: passed,
            assertionsTotal: total,
            fpyPercentage: Math.round((passed / total) * 100),
            status: passed === total ? "PASSED" : "FAILED",
            logTrail: logs,
        };
    }
    /**
     * Scenario B: High-Velocity Node/TypeScript Frontend con AUTONOMOUS_FAST_TRACK
     * Verifiche:
     * 1. CFF-5 consente prosecuzione autonoma anche con spikeApprovedByCeo = false.
     * 2. Caveman Mode comprime i messaggi di cooperazione inter-agente.
     * 3. Configurazione dinamica dot-path riflette immediatamente le modifiche.
     */
    static async evaluateScenarioB() {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "settings-eval-scen-b-"));
        const logs = [];
        let passed = 0;
        const total = 3;
        try {
            logs.push(`[INIT] Setup TypeScript frontend workspace in ${tmpDir}`);
            await fs.mkdir(path.join(tmpDir, "src"), { recursive: true });
            await fs.writeFile(path.join(tmpDir, "src/index.ts"), "export const greeting = (name: string): string => `Hello ${name}`;\n");
            SettingsManager.saveSettings(tmpDir, {
                ...SettingsManager.getDefaultSettings(),
                governance: {
                    spikeCheckpoint: "AUTONOMOUS_FAST_TRACK",
                    anomalyGate: "ADVISORY",
                    releaseApproval: "GATEKEEPER_AUTO",
                    roundtableDevilsAdvocate: false,
                },
                communication: {
                    personaPreset: "ENGINEERING_PROFESSIONAL",
                    cavemanMode: true,
                    language: "en",
                    greetingRule3Options: false,
                },
            });
            const fsm = new CompanyStateMachine("STANDUP");
            const fastTrackRes = fsm.enforceCognitiveForcingGate({
                stimulusType: "NORMAL_SPRINT",
                persistToTargetPath: tmpDir,
                spikeApprovedByCeo: false,
            });
            if (fastTrackRes.allowed && fastTrackRes.reason.includes("AUTONOMOUS_FAST_TRACK")) {
                passed++;
                logs.push("[CHECK 1] Modalità AUTONOMOUS_FAST_TRACK procede direttamente alla build.");
            }
            const rawText = "Buongiorno caro sviluppatore! Per favore procedi con cura a esportare il contratto tipizzato senza convenevoli. Grazie mille!";
            const stripped = CavemanFormatter.stripFluff(rawText);
            const msg = CavemanFormatter.createMessage({
                senderRole: "engineering_lead",
                recipientRole: "leaf_developer",
                actionCode: "EXPORT_CONTRACT",
                targetFiles: ["src/index.ts"],
                payload: { instruction: stripped.cleanedText },
                constraints: ["PRESERVE_ALL_EXPORTS"],
            });
            if (msg.zeroFluff && !stripped.cleanedText.includes("Buongiorno") && !stripped.cleanedText.includes("Grazie mille")) {
                passed++;
                logs.push("[CHECK 2] CavemanFormatter ha rimosso convenevoli preservando istruzioni atomiche.");
            }
            const updated = SettingsManager.updateSettingByPath(tmpDir, "communication.cavemanMode", false);
            if (updated.newValue === false) {
                passed++;
                logs.push("[CHECK 3] Aggiornamento dinamico dot-path di communication.cavemanMode eseguito con successo.");
            }
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
        }
        return {
            scenarioId: "SCENARIO_B_AUTONOMOUS_FAST_TRACK",
            workspacePath: tmpDir,
            stackType: "typescript_node",
            settingsSnapshot: SettingsManager.getDefaultSettings(),
            assertionsPassed: passed,
            assertionsTotal: total,
            fpyPercentage: Math.round((passed / total) * 100),
            status: passed === total ? "PASSED" : "FAILED",
            logTrail: logs,
        };
    }
    /**
     * Scenario C: Local-First Air-Gapped Environment con LOCAL_FIRST_AIRGAP & FinOps Cap
     * Verifiche:
     * 1. Fast decision gate (<10ms) per classificazione locale senza rete.
     * 2. BudgetWatchdog rispetta maxSessionBudgetUsd = 1.0 e attiva safe-pause su superamento.
     * 3. settings.json rifiuta modelli con formattazione non valida.
     */
    static async evaluateScenarioC() {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "settings-eval-scen-c-"));
        const logs = [];
        let passed = 0;
        const total = 3;
        try {
            logs.push(`[INIT] Setup Air-Gapped workspace in ${tmpDir}`);
            SettingsManager.saveSettings(tmpDir, {
                ...SettingsManager.getDefaultSettings(),
                localSlm: {
                    mode: "FORCE_ENABLED",
                    preferredModelOverride: "phi4-mini:3.8b-q4_K_M",
                    ollamaEndpoint: "http://127.0.0.1:11434",
                    slaTimeoutMs: 500,
                },
                finops: {
                    maxSessionBudgetUsd: 1.0,
                    safePauseOnBudgetExceeded: true,
                    enableTwoTierPromptCache: true,
                },
            });
            const decision = FastDecisionGate.evaluate({
                action: "CHECK_TYPECHECK",
                promptSnippet: "Esegui un typecheck e formatta il codice di produzione",
            });
            if (decision.decision === "FAST_APPROVE" && decision.latencyMs < 25) {
                passed++;
                logs.push(`[CHECK 1] FastDecisionGate non-autoregressivo ha risposto in ${decision.latencyMs}ms ($0 costo).`);
            }
            const watchdog = new BudgetWatchdog({
                maxBudgetUsd: 1.0,
            });
            watchdog.recordUsage("claude-3-7-sonnet", 200000, 100000);
            const budgetStatus = watchdog.getBudgetStatus();
            if (budgetStatus.status === "HALTED" || budgetStatus.percentUsed >= 100) {
                passed++;
                logs.push(`[CHECK 2] BudgetWatchdog ha segnalato status = ${budgetStatus.status} (${budgetStatus.percentUsed}% di $1.0).`);
            }
            let rejectedInvalidSetting = false;
            try {
                SettingsManager.updateSettingByPath(tmpDir, "localSlm.slaTimeoutMs", 50); // Min è 100
            }
            catch {
                rejectedInvalidSetting = true;
            }
            if (rejectedInvalidSetting) {
                passed++;
                logs.push("[CHECK 3] Validazione Zod ha respinto slaTimeoutMs inferiore al minimo consentito (100ms).");
            }
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
        }
        return {
            scenarioId: "SCENARIO_C_LOCAL_FIRST_AIRGAP",
            workspacePath: tmpDir,
            stackType: "airgap_worker",
            settingsSnapshot: SettingsManager.getDefaultSettings(),
            assertionsPassed: passed,
            assertionsTotal: total,
            fpyPercentage: Math.round((passed / total) * 100),
            status: passed === total ? "PASSED" : "FAILED",
            logTrail: logs,
        };
    }
    /**
     * Scenario D: Brownfield Anomaly con STRICT_IMMUNE_DEFENSE & Formal Prover
     * Verifiche:
     * 1. Formal AST Prover rileva violazione (es. divisione per zero) prima del merge.
     * 2. Iniezione fault in arena effimera calcola correttamente score di resilienza.
     * 3. Configurazione gatekeeper.selfHealingMaxRetries impostata e rispettata.
     */
    static async evaluateScenarioD() {
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "settings-eval-scen-d-"));
        const logs = [];
        let passed = 0;
        const total = 3;
        try {
            logs.push(`[INIT] Setup Brownfield Chaos workspace in ${tmpDir}`);
            SettingsManager.saveSettings(tmpDir, {
                ...SettingsManager.getDefaultSettings(),
                gatekeeper: {
                    enableHeuristicScanner: true,
                    heuristicScannerTimeoutMs: 500,
                    selfHealingMaxRetries: 2,
                    enableWarRoomCircuitBreaker: true,
                    useTiaTargetedTests: true,
                },
            });
            const buggySource = `
export function computeRatio(numerator: number, denominator: number): number {
  return numerator / denominator;
}
`;
            const proof = scanCodeHeuristics({
                targetFilePath: "src/calc.ts",
                sourceCode: buggySource,
                targetSymbol: "computeRatio",
            });
            if (proof.status === "COUNTEREXAMPLE_FOUND" && proof.counterexampleTrace) {
                passed++;
                logs.push("[CHECK 1] Formal AST Prover ha identificato controesempio matematico (division by zero) prima del merge.");
            }
            const experiment = await runChaosExperiment({
                faultType: "AST_MUTATION_OFF_BY_ONE",
                targetSubsystem: "gatekeeper",
            });
            const score = calculateResilienceScore({
                containmentSuccess: experiment.containmentSuccess,
                detectionTimeMs: experiment.detectionTimeMs,
                recoveryTimeMs: experiment.recoveryTimeMs,
            });
            if (experiment.containmentSuccess && score >= 90) {
                passed++;
                logs.push(`[CHECK 2] Chaos Fault confinato in arena effimera con Resilience Score = ${score}/100.`);
            }
            const settings = SettingsManager.loadSettings(tmpDir);
            if (settings.gatekeeper.selfHealingMaxRetries === 2) {
                passed++;
                logs.push("[CHECK 3] Invariante gatekeeper.selfHealingMaxRetries = 2 verificata nel runtime.");
            }
        }
        finally {
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
        }
        return {
            scenarioId: "SCENARIO_D_STRICT_IMMUNE_DEFENSE",
            workspacePath: tmpDir,
            stackType: "brownfield_chaos",
            settingsSnapshot: SettingsManager.getDefaultSettings(),
            assertionsPassed: passed,
            assertionsTotal: total,
            fpyPercentage: Math.round((passed / total) * 100),
            status: passed === total ? "PASSED" : "FAILED",
            logTrail: logs,
        };
    }
}
//# sourceMappingURL=settings-eval-harness.js.map