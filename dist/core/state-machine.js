import fs from "node:fs/promises";
import path from "node:path";
import { SettingsManager } from "./settings-manager.js";
import { RootCauseAnalysisReportSchema, WorkflowPersistedStateSchema, } from "../contracts/workflow-eval.js";
export class CompanyStateMachine {
    currentState;
    transitions = [];
    stimulusType = "NORMAL_SPRINT";
    activeRcaReport;
    spikeApprovedByCeo;
    spikeCheckpointMode;
    // Opt-in fail-closed: quando true, una transizione con payload ma SENZA schema registrato
    // viene rifiutata invece di passare non validata (il default resta permissivo/opt-in).
    requireRegisteredSchema = false;
    constructor(initialState = "STANDUP") {
        this.currentState = initialState;
        this.initDefaultTransitions();
    }
    getState() {
        return this.currentState;
    }
    getOperatingMode() {
        switch (this.currentState) {
            case "STANDUP":
                return "MODE_1_STANDUP";
            case "INVESTIGATE_RCA":
                return "MODE_2_INVESTIGATE_RCA";
            case "RND_DISCOVERY":
            case "RND_ROUNDTABLE":
            case "RND_CONSENSUS":
            case "TECH_VALIDATION":
                return "MODE_3_RND_ROUNDTABLE";
            case "SPECIFY":
            case "DELEGATE":
            case "IMPLEMENT":
            case "GATEKEEPER":
            case "CODE_REVIEW":
            case "MERGE_RELEASE":
                return "MODE_4_BUILD_GATEKEEPER";
        }
    }
    setStimulusContext(params) {
        this.stimulusType = params.stimulusType;
        this.activeRcaReport = params.rcaReport;
        this.spikeApprovedByCeo = params.spikeApprovedByCeo;
        this.spikeCheckpointMode = params.spikeCheckpointMode;
    }
    /**
     * Attiva/disattiva la validazione contratto fail-closed: con `true`, una transizione che
     * trasporta un payload senza schema registrato viene rifiutata (invece di passare non validata).
     */
    setRequireRegisteredSchema(value) {
        this.requireRegisteredSchema = value;
    }
    /**
     * Applica deterministicamente le 4 Cognitive Forcing Functions (CFF-1..4 — Anti-Rush Gate).
     * Quando `stimulusType === "ANOMALY_OR_BUG"`, rifiuta con errore `COGNITIVE_FORCING_GATE_VIOLATION`
     * qualsiasi tentativo di entrare in `SPECIFY` / `DELEGATE` / `IMPLEMENT` (`MODE_4_BUILD_GATEKEEPER`)
     * se manca un `rcaReport` valido conforme a `RootCauseAnalysisReportSchema` con:
     * - `fiveWhys.length >= 3`
     * - `consultedSpecialists.length >= 2`
     * - `systemicPrinciple` definito
     * - `ceoApproved === true`
     */
    enforceCognitiveForcingGate(input) {
        this.stimulusType = input.stimulusType;
        if (input.rcaReport) {
            this.activeRcaReport = input.rcaReport;
        }
        if (input.stimulusType === "NORMAL_SPRINT") {
            const effectiveSpikeMode = input.spikeCheckpointMode ??
                (input.persistToTargetPath
                    ? SettingsManager.loadSettings(input.persistToTargetPath).governance
                        .spikeCheckpoint
                    : "HITL_SPIKE_REVIEW");
            if (effectiveSpikeMode === "HITL_SPIKE_REVIEW" &&
                input.spikeApprovedByCeo === false) {
                throw new Error("SPIKE_CHECKPOINT_GATE_VIOLATION (CFF-5): governance.spikeCheckpoint è impostato su HITL_SPIKE_REVIEW. Il report di Spike deve essere approvato dal CEO prima di entrare in MODE_4_BUILD_GATEKEEPER.");
            }
            return {
                allowed: true,
                activeMode: "MODE_4_BUILD_GATEKEEPER",
                stimulusType: "NORMAL_SPRINT",
                reason: effectiveSpikeMode === "AUTONOMOUS_FAST_TRACK"
                    ? "Normal sprint progression authorized (AUTONOMOUS_FAST_TRACK)."
                    : "Normal sprint progression authorized (HITL_SPIKE_REVIEW verified).",
            };
        }
        // stimulusType === "ANOMALY_OR_BUG"
        if (!input.rcaReport) {
            throw new Error("COGNITIVE_FORCING_GATE_VIOLATION: Tentativo di passare a MODE_4_BUILD_GATEKEEPER / IMPLEMENT su anomalia senza RootCauseAnalysisReport (MODE_2_INVESTIGATE_RCA obbligatorio).");
        }
        const parsedRca = RootCauseAnalysisReportSchema.safeParse(input.rcaReport);
        if (!parsedRca.success) {
            const issues = parsedRca.error.issues
                .map((i) => `${i.path.join(".")}: ${i.message}`)
                .join("; ");
            throw new Error(`COGNITIVE_FORCING_GATE_VIOLATION: RootCauseAnalysisReport incompleto o non valido (${issues}). Richiesti fiveWhys >= 3, consultedSpecialists >= 2 e systemicPrinciple.`);
        }
        if (parsedRca.data.ceoApproved !== true) {
            throw new Error("COGNITIVE_FORCING_GATE_VIOLATION: Il RootCauseAnalysisReport non ha ancora ricevuto l'approvazione esplicita del CEO (ceoApproved === false). Resta in MODE_3_RND_ROUNDTABLE.");
        }
        return {
            allowed: true,
            activeMode: "MODE_4_BUILD_GATEKEEPER",
            stimulusType: "ANOMALY_OR_BUG",
            rcaId: parsedRca.data.rcaId,
            reason: `Cognitive Forcing Gate passed: RCA '${parsedRca.data.rcaId}' validated with ${parsedRca.data.fiveWhys.length} Whys, ${parsedRca.data.consultedSpecialists.length} specialists and CEO Go approval.`,
        };
    }
    async persistWorkflowState(targetPath, overrides) {
        const resolvedPath = path.resolve(targetPath);
        const companyOsDir = path.join(resolvedPath, ".company-os");
        await fs.mkdir(companyOsDir, { recursive: true });
        const statePath = path.join(companyOsDir, "workflow-state.json");
        let existing = {};
        try {
            const raw = await fs.readFile(statePath, "utf-8");
            existing = JSON.parse(raw);
        }
        catch {
            existing = {};
        }
        const state = WorkflowPersistedStateSchema.parse({
            targetPath: resolvedPath,
            activeMode: overrides?.activeMode ?? this.getOperatingMode(),
            fsmState: overrides?.fsmState ?? this.currentState,
            stimulusType: overrides?.stimulusType ?? this.stimulusType,
            activeRcaReport: overrides?.activeRcaReport ?? this.activeRcaReport,
            lastRoutedScope: overrides?.lastRoutedScope ?? existing.lastRoutedScope ?? [],
            lastSummonedSpecialists: overrides?.lastSummonedSpecialists ??
                existing.lastSummonedSpecialists ??
                [],
            updatedAt: new Date().toISOString(),
        });
        await fs.writeFile(statePath, JSON.stringify(state, null, 2), "utf-8");
        return state;
    }
    initDefaultTransitions() {
        this.transitions = [
            {
                from: "STANDUP",
                to: "INVESTIGATE_RCA",
                guard: () => true,
                description: "Stop-the-Line (MODE 2): il CTO avvia l'indagine Read-Only sulle cause radice (5 Whys) di un'anomalia o bug.",
            },
            {
                from: "INVESTIGATE_RCA",
                to: "RND_DISCOVERY",
                guard: () => true,
                description: "L'indagine RCA richiede interviste 1:1 approfondite con R&D e gli Esperti di Dominio Ring-2.",
            },
            {
                from: "INVESTIGATE_RCA",
                to: "RND_ROUNDTABLE",
                guard: () => true,
                description: "L'indagine RCA passa in Tavola Rotonda (MODE 3) con Devil's Advocate per astrarre dal sintomo al principio.",
            },
            {
                from: "INVESTIGATE_RCA",
                to: "SPECIFY",
                guard: () => {
                    this.enforceCognitiveForcingGate({
                        stimulusType: "ANOMALY_OR_BUG",
                        rcaReport: this.activeRcaReport,
                        targetState: "SPECIFY",
                    });
                    return true;
                },
                description: "Passaggio da INVESTIGATE_RCA a SPECIFY consentito solo con RootCauseAnalysisReport completo e approvato dal CEO.",
            },
            {
                from: "INVESTIGATE_RCA",
                to: "IMPLEMENT",
                guard: () => {
                    this.enforceCognitiveForcingGate({
                        stimulusType: "ANOMALY_OR_BUG",
                        rcaReport: this.activeRcaReport,
                        targetState: "IMPLEMENT",
                    });
                    return true;
                },
                description: "Passaggio diretto da INVESTIGATE_RCA a IMPLEMENT bloccato dal Cognitive Forcing Gate senza RCA approvata dal CEO.",
            },
            {
                from: "STANDUP",
                to: "RND_DISCOVERY",
                guard: () => true,
                description: "Il CEO autorizza l'avvio della fase di ascolto e interviste 1:1 con i Domain Lead.",
            },
            {
                from: "RND_DISCOVERY",
                to: "RND_ROUNDTABLE",
                guard: () => true,
                description: "L'R&D Lead ha completato gli 1:1, redatto l'RFC e convocato la tavola rotonda multi-agente.",
            },
            {
                from: "RND_ROUNDTABLE",
                to: "RND_CONSENSUS",
                guard: () => true,
                description: "I Domain Lead hanno risolto i trade-off e raggiunto il consenso congiunto sull'RFC.",
            },
            {
                from: "RND_CONSENSUS",
                to: "TECH_VALIDATION",
                guard: () => true,
                description: "La visione condivisa ratificata passa alla validazione tecnica dell'Engineering Lead.",
            },
            {
                from: "RND_CONSENSUS",
                to: "SPECIFY",
                guard: () => true,
                description: "La visione condivisa passa direttamente alla formalizzazione dei contratti di sprint.",
            },
            {
                from: "STANDUP",
                to: "TECH_VALIDATION",
                guard: () => true,
                description: "Il CEO autorizza la partenza dello sprint e richiede la verifica preventiva delle scelte tecnologiche.",
            },
            {
                from: "TECH_VALIDATION",
                to: "SPECIFY",
                guard: () => true,
                description: "Le scelte tecniche e i benchmark di mercato sono stati validati dall'Engineering Lead.",
            },
            {
                from: "STANDUP",
                to: "SPECIFY",
                guard: () => {
                    if (this.stimulusType === "ANOMALY_OR_BUG") {
                        this.enforceCognitiveForcingGate({
                            stimulusType: "ANOMALY_OR_BUG",
                            rcaReport: this.activeRcaReport,
                            targetState: "SPECIFY",
                        });
                    }
                    return true;
                },
                description: "Il CEO autorizza la partenza dello sprint saltando la fase di validazione preliminare.",
            },
            {
                from: "SPECIFY",
                to: "DELEGATE",
                guard: () => {
                    if (this.stimulusType === "ANOMALY_OR_BUG") {
                        this.enforceCognitiveForcingGate({
                            stimulusType: "ANOMALY_OR_BUG",
                            rcaReport: this.activeRcaReport,
                            targetState: "DELEGATE",
                        });
                    }
                    return true;
                },
                description: "I contratti tipizzati Zod sono validati e pronti.",
            },
            {
                from: "DELEGATE",
                to: "IMPLEMENT",
                guard: () => {
                    if (this.stimulusType === "ANOMALY_OR_BUG") {
                        this.enforceCognitiveForcingGate({
                            stimulusType: "ANOMALY_OR_BUG",
                            rcaReport: this.activeRcaReport,
                            targetState: "IMPLEMENT",
                        });
                    }
                    return true;
                },
                description: "I task sono assegnati ai Leaf Developers.",
            },
            {
                from: "IMPLEMENT",
                to: "GATEKEEPER",
                guard: () => true,
                description: "Il codice è scritto e sottomesso per i test.",
            },
            {
                from: "GATEKEEPER",
                to: "CODE_REVIEW",
                guard: () => true,
                description: "Typecheck e test unitari superati con successo.",
            },
            {
                from: "CODE_REVIEW",
                to: "MERGE_RELEASE",
                guard: () => true,
                description: "Il Manager approva la PR secondo le linee guida architetturali.",
            },
        ];
    }
    transitionSchemas = new Map();
    registerTransitionSchema(from, to, schema, contractName = `Transition_${from}_to_${to}`) {
        this.transitionSchemas.set(`${from}->${to}`, { schema, contractName });
    }
    async transitionTo(nextState, payload) {
        if (this.stimulusType === "ANOMALY_OR_BUG" &&
            (nextState === "SPECIFY" || nextState === "DELEGATE" || nextState === "IMPLEMENT")) {
            this.enforceCognitiveForcingGate({
                stimulusType: "ANOMALY_OR_BUG",
                rcaReport: this.activeRcaReport,
                targetState: nextState,
            });
        }
        // CFF-5 (Spike Checkpoint Gate): su sprint normale, entrare in IMPLEMENT (scrittura
        // del codice) richiede l'approvazione CEO dello Spike quando il checkpoint è
        // HITL_SPIKE_REVIEW. Prima questa guardia non era mai invocata dall'FSM.
        if (this.stimulusType === "NORMAL_SPRINT" && nextState === "IMPLEMENT") {
            this.enforceCognitiveForcingGate({
                stimulusType: "NORMAL_SPRINT",
                spikeApprovedByCeo: this.spikeApprovedByCeo,
                spikeCheckpointMode: this.spikeCheckpointMode,
                targetState: nextState,
            });
        }
        const validTransition = this.transitions.find((t) => t.from === this.currentState && t.to === nextState);
        if (!validTransition) {
            throw new Error(`Transizione non valida: impossibile passare da ${this.currentState} a ${nextState}`);
        }
        // Validazione contratto di transizione (OPT-IN): avviene solo per le transizioni per cui
        // è stato registrato uno schema via `registerTransitionSchema`. Senza schema registrato il
        // payload passa non validato — a meno che `requireRegisteredSchema` sia attivo (fail-closed),
        // nel qual caso un payload non coperto da contratto viene rifiutato.
        const schemaKey = `${this.currentState}->${nextState}`;
        const registered = this.transitionSchemas.get(schemaKey);
        if (registered) {
            const { ContractInterceptor } = await import("./contract-interceptor.js");
            ContractInterceptor.enforce(registered.schema, payload, {
                contractName: registered.contractName,
                actionOrTransition: `FSM_TRANSITION_${this.currentState}_TO_${nextState}`,
            });
        }
        else if (this.requireRegisteredSchema && payload !== undefined) {
            throw new Error(`UNVALIDATED_TRANSITION_PAYLOAD: nessuno schema registrato per '${schemaKey}' ma requireRegisteredSchema è attivo (fail-closed). Registra lo schema con registerTransitionSchema.`);
        }
        const canProceed = await validTransition.guard();
        if (!canProceed) {
            return false;
        }
        this.currentState = nextState;
        return true;
    }
}
//# sourceMappingURL=state-machine.js.map