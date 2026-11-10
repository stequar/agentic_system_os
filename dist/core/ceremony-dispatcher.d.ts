import { type AgileCeremony, type AgileCeremonyType, type SprintRetrospective } from "../contracts/ceremonies.js";
import { type SynthesizedSpecialist, type TriRingOrgChart } from "../contracts/brownfield.js";
export interface DomainScopeRoutingResult {
    matchedAttendeeIds: string[];
    matchedSpecialists: SynthesizedSpecialist[];
    injectedInvariants: string[];
    microRoleCards: string[];
}
export interface StartCeremonyInput {
    type: AgileCeremonyType;
    chairRole: string;
    attendeeRoles: string[];
    inputArtifactUri?: string;
    summary?: string;
    affectedFilesOrKeywords?: string[];
    orgChart?: TriRingOrgChart;
}
export interface ConcludeCeremonyInput {
    ceremonyId: string;
    summary: string;
    outputArtifactUri?: string;
    retrospectiveData?: Omit<SprintRetrospective, "moderatorRole" | "concludedAt">;
}
/**
 * Agile Ceremonies Dispatcher & Lifecycle Orchestrator.
 * Gestisce l'orchestrazione automatica, il tracciamento e la persistenza
 * delle 5 cerimonie agili native previste da RFC-005.
 */
export declare class CeremonyDispatcher {
    private targetPath;
    private ceremonies;
    constructor(targetPath: string);
    /**
     * Risolve dinamicamente gli specialisti Ring-1 e gli Esperti di Dominio Ring-2
     * i cui `domainScope` o `domainKeywords` intersecano i file/keyword del ticket o della cerimonia.
     */
    resolveDomainAttendeesForScope(affectedFilesOrKeywords: string[], orgChart?: TriRingOrgChart): DomainScopeRoutingResult;
    /**
     * Avvia una cerimonia agile e ne notifica l'avvio alla flotta di agenti.
     * Se vengono forniti `affectedFilesOrKeywords`, convoca automaticamente gli esperti Ring-1/Ring-2 pertinenti.
     */
    startCeremony(input: StartCeremonyInput): Promise<AgileCeremony>;
    /**
     * Conclude una cerimonia registrandone il verbale e i deliverable.
     */
    concludeCeremony(input: ConcludeCeremonyInput): Promise<AgileCeremony>;
    /**
     * Salva il verbale della cerimonia in .company-os/ceremonies/
     */
    private persistCeremony;
    getCeremony(id: string): AgileCeremony | undefined;
    listCeremonies(): AgileCeremony[];
}
//# sourceMappingURL=ceremony-dispatcher.d.ts.map