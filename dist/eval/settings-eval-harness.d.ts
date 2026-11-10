import { SettingsEvalResult, SettingsEvalScorecard } from "../contracts/settings-eval.js";
export declare class SettingsEvalHarness {
    /**
     * Esegue l'intera suite di valutazione su 4 workspace effimeri indipendenti,
     * ciascuno con stack tecnologico e profilo di configurazione differente.
     */
    static runFullEvalSuite(): Promise<SettingsEvalScorecard>;
    /**
     * Scenario A: Python FastAPI Backend con profilo CEO_MAX_CONTROL
     * Verifiche:
     * 1. CFF-5 blocca lo sviluppo se lo spike non è esplicitamente approvato dal CEO.
     * 2. CFF-5 sblocca lo sviluppo una volta che lo spike riceve approvazione CEO.
     * 3. Settings persistiti correttamente in .company-os/settings.json.
     */
    static evaluateScenarioA(): Promise<SettingsEvalResult>;
    /**
     * Scenario B: High-Velocity Node/TypeScript Frontend con AUTONOMOUS_FAST_TRACK
     * Verifiche:
     * 1. CFF-5 consente prosecuzione autonoma anche con spikeApprovedByCeo = false.
     * 2. Caveman Mode comprime i messaggi di cooperazione inter-agente.
     * 3. Configurazione dinamica dot-path riflette immediatamente le modifiche.
     */
    static evaluateScenarioB(): Promise<SettingsEvalResult>;
    /**
     * Scenario C: Local-First Air-Gapped Environment con LOCAL_FIRST_AIRGAP & FinOps Cap
     * Verifiche:
     * 1. Fast decision gate (<10ms) per classificazione locale senza rete.
     * 2. BudgetWatchdog rispetta maxSessionBudgetUsd = 1.0 e attiva safe-pause su superamento.
     * 3. settings.json rifiuta modelli con formattazione non valida.
     */
    static evaluateScenarioC(): Promise<SettingsEvalResult>;
    /**
     * Scenario D: Brownfield Anomaly con STRICT_IMMUNE_DEFENSE & Formal Prover
     * Verifiche:
     * 1. Formal AST Prover rileva violazione (es. divisione per zero) prima del merge.
     * 2. Iniezione fault in arena effimera calcola correttamente score di resilienza.
     * 3. Configurazione gatekeeper.selfHealingMaxRetries impostata e rispettata.
     */
    static evaluateScenarioD(): Promise<SettingsEvalResult>;
}
//# sourceMappingURL=settings-eval-harness.d.ts.map