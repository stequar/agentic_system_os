import { CompanyState } from "./types.js";
import type { SpikeCheckpointMode } from "../contracts/settings.js";
import { type CtoOperatingMode, type RootCauseAnalysisReport, type WorkflowPersistedState, type WorkflowStimulusType } from "../contracts/workflow-eval.js";
export interface CognitiveForcingGateInput {
    stimulusType: WorkflowStimulusType;
    rcaReport?: RootCauseAnalysisReport;
    targetState?: CompanyState;
    persistToTargetPath?: string;
    spikeApprovedByCeo?: boolean;
    spikeCheckpointMode?: SpikeCheckpointMode;
}
export interface CognitiveForcingGateResult {
    allowed: boolean;
    activeMode: CtoOperatingMode;
    stimulusType: WorkflowStimulusType;
    rcaId?: string;
    reason: string;
}
export declare class CompanyStateMachine {
    private currentState;
    private transitions;
    private stimulusType;
    private activeRcaReport?;
    private spikeApprovedByCeo?;
    private spikeCheckpointMode?;
    private requireRegisteredSchema;
    constructor(initialState?: CompanyState);
    getState(): CompanyState;
    getOperatingMode(): CtoOperatingMode;
    setStimulusContext(params: {
        stimulusType: WorkflowStimulusType;
        rcaReport?: RootCauseAnalysisReport;
        spikeApprovedByCeo?: boolean;
        spikeCheckpointMode?: SpikeCheckpointMode;
    }): void;
    /**
     * Attiva/disattiva la validazione contratto fail-closed: con `true`, una transizione che
     * trasporta un payload senza schema registrato viene rifiutata (invece di passare non validata).
     */
    setRequireRegisteredSchema(value: boolean): void;
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
    enforceCognitiveForcingGate(input: CognitiveForcingGateInput): CognitiveForcingGateResult;
    persistWorkflowState(targetPath: string, overrides?: Partial<WorkflowPersistedState>): Promise<WorkflowPersistedState>;
    private initDefaultTransitions;
    private transitionSchemas;
    registerTransitionSchema(from: CompanyState, to: CompanyState, schema: any, contractName?: string): void;
    transitionTo(nextState: CompanyState, payload?: unknown): Promise<boolean>;
}
//# sourceMappingURL=state-machine.d.ts.map