import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { AgileCeremonySchema, SprintRetrospectiveSchema, } from "../contracts/ceremonies.js";
import { TriRingOrgChartSchema, } from "../contracts/brownfield.js";
import { CompanyEventBus } from "./event-bus.js";
import { CavemanFormatter } from "./caveman-formatter.js";
import { FluffTelemetry } from "./fluff-telemetry.js";
/** Il Devil's Advocate / Red-Teamer di default (Ring-0). */
const DEVILS_ADVOCATE_ROLE = "qa_lead";
/** Tipi di cerimonia deliberativi che DEVONO includere il Devil's Advocate (CFF-2). */
const RED_TEAM_REQUIRED_CEREMONIES = new Set([
    "ARCHITECTURE_REVIEW_ROUNDTABLE",
]);
/**
 * Match "specifico" tra due token: uguaglianza sempre, substring SOLO se il token più corto
 * è abbastanza specifico (>=4 char). Evita che token generici ("db", "api", "ui") convochino
 * tutti gli specialisti (over-matching).
 */
const MIN_SUBSTRING_TOKEN_LEN = 4;
function specificTokenMatch(target, candidate) {
    if (target === candidate)
        return true;
    if (candidate.length >= MIN_SUBSTRING_TOKEN_LEN && target.includes(candidate))
        return true;
    if (target.length >= MIN_SUBSTRING_TOKEN_LEN && candidate.includes(target))
        return true;
    return false;
}
/**
 * Agile Ceremonies Dispatcher & Lifecycle Orchestrator.
 * Gestisce l'orchestrazione automatica, il tracciamento e la persistenza
 * delle 5 cerimonie agili native previste da RFC-005.
 */
export class CeremonyDispatcher {
    targetPath;
    ceremonies = new Map();
    constructor(targetPath) {
        this.targetPath = targetPath;
    }
    /**
     * Risolve dinamicamente gli specialisti Ring-1 e gli Esperti di Dominio Ring-2
     * i cui `domainScope` o `domainKeywords` intersecano i file/keyword del ticket o della cerimonia.
     */
    resolveDomainAttendeesForScope(affectedFilesOrKeywords, orgChart) {
        let resolvedChart = orgChart;
        if (!resolvedChart) {
            const chartPath = path.resolve(this.targetPath, ".company-os", "org-chart.json");
            if (fsSync.existsSync(chartPath)) {
                try {
                    const raw = fsSync.readFileSync(chartPath, "utf-8");
                    resolvedChart = TriRingOrgChartSchema.parse(JSON.parse(raw));
                }
                catch (err) {
                    // GOV-2: NON silenziare un org-chart presente ma corrotto — distingue un match
                    // genuinamente vuoto da un fallimento di parsing (che altrimenti "non convoca nessuno").
                    resolvedChart = undefined;
                    console.error(`[CeremonyDispatcher] org-chart.json presente ma non parsabile (${chartPath}): nessun esperto dinamico convocato. ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }
        if (!resolvedChart || affectedFilesOrKeywords.length === 0) {
            return {
                matchedAttendeeIds: [],
                matchedSpecialists: [],
                injectedInvariants: [],
                microRoleCards: [],
            };
        }
        const candidates = [
            ...resolvedChart.ring2DomainExperts,
            ...resolvedChart.ring1TechSpecialists,
        ];
        const normalizedTargets = affectedFilesOrKeywords.map((item) => item.toLowerCase().trim());
        const matchedSpecialists = [];
        for (const spec of candidates) {
            const scopeMatch = spec.domainScope.some((scopePath) => {
                const normScope = scopePath.toLowerCase();
                return normalizedTargets.some((target) => specificTokenMatch(target, normScope) ||
                    path.basename(normScope) === path.basename(target));
            });
            const keywordMatch = spec.domainKeywords.some((kw) => {
                const normKw = kw.toLowerCase();
                return normalizedTargets.some((target) => specificTokenMatch(target, normKw));
            });
            if (scopeMatch || keywordMatch) {
                matchedSpecialists.push(spec);
            }
        }
        const matchedAttendeeIds = Array.from(new Set(matchedSpecialists.map((s) => s.id)));
        const injectedInvariants = Array.from(new Set(matchedSpecialists.flatMap((s) => s.domainInvariants)));
        const microRoleCards = matchedSpecialists.map((s) => s.microRoleCard);
        return {
            matchedAttendeeIds,
            matchedSpecialists,
            injectedInvariants,
            microRoleCards,
        };
    }
    /**
     * Avvia una cerimonia agile e ne notifica l'avvio alla flotta di agenti.
     * Se vengono forniti `affectedFilesOrKeywords`, convoca automaticamente gli esperti Ring-1/Ring-2 pertinenti.
     */
    async startCeremony(input) {
        const ceremonyId = `CEREMONY-${input.type}-${Date.now()}`;
        const routing = input.affectedFilesOrKeywords
            ? this.resolveDomainAttendeesForScope(input.affectedFilesOrKeywords, input.orgChart)
            : {
                matchedAttendeeIds: [],
                matchedSpecialists: [],
                injectedInvariants: [],
                microRoleCards: [],
            };
        const mergedAttendees = Array.from(new Set([...input.attendeeRoles, ...routing.matchedAttendeeIds]));
        // GOV-2 (CFF-2): le roundtable deliberative DEVONO includere il Devil's Advocate.
        // La risoluzione dinamica pesca solo da Ring-1/Ring-2, quindi qa_lead (Ring-0) non verrebbe
        // mai convocato automaticamente: lo imponiamo qui a livello strutturale.
        if (RED_TEAM_REQUIRED_CEREMONIES.has(input.type) &&
            !mergedAttendees.includes(DEVILS_ADVOCATE_ROLE)) {
            mergedAttendees.push(DEVILS_ADVOCATE_ROLE);
        }
        const invariantsSuffix = routing.injectedInvariants.length > 0
            ? ` | Active Domain Invariants: ${routing.injectedInvariants.join(" ; ")}`
            : "";
        const rawBaseSummary = input.summary ||
            `Ceremony ${input.type} convened by ${input.chairRole} with attendees: ${mergedAttendees.join(", ")}`;
        const strippedStart = CavemanFormatter.stripFluff(rawBaseSummary);
        if (strippedStart.removedFluffCount > 0) {
            FluffTelemetry.getInstance().recordHandoff(rawBaseSummary, strippedStart.cleanedText, this.targetPath);
        }
        const initialSummary = strippedStart.cleanedText + invariantsSuffix;
        const ceremony = AgileCeremonySchema.parse({
            id: ceremonyId,
            type: input.type,
            chairRole: input.chairRole,
            attendeeRoles: mergedAttendees,
            status: "IN_PROGRESS",
            inputArtifactUri: input.inputArtifactUri,
            summary: initialSummary,
            startedAt: new Date().toISOString(),
        });
        this.ceremonies.set(ceremonyId, ceremony);
        await this.persistCeremony(ceremony);
        try {
            const bus = CompanyEventBus.getInstance();
            bus.publish({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: "CEREMONY_STARTED",
                sourceAgent: input.chairRole,
                level: "info",
                payload: {
                    ceremonyId,
                    type: input.type,
                    chairRole: input.chairRole,
                    // GOV-2: pubblica il roster RISOLTO (inclusi gli esperti dinamici e il Devil's
                    // Advocate), non la lista pre-merge — così i consumer vedono chi è stato convocato.
                    attendeeRoles: mergedAttendees,
                },
            });
        }
        catch {
            // Best effort
        }
        return ceremony;
    }
    /**
     * Conclude una cerimonia registrandone il verbale e i deliverable.
     */
    async concludeCeremony(input) {
        const ceremony = this.ceremonies.get(input.ceremonyId);
        if (!ceremony) {
            throw new Error(`Ceremony ${input.ceremonyId} not found`);
        }
        ceremony.status = "CONCLUDED";
        const existingInvariantIdx = ceremony.summary.indexOf(" | Active Domain Invariants:");
        const existingInvariantsSuffix = existingInvariantIdx >= 0 ? ceremony.summary.slice(existingInvariantIdx) : "";
        const strippedConclude = CavemanFormatter.stripFluff(input.summary);
        if (strippedConclude.removedFluffCount > 0) {
            FluffTelemetry.getInstance().recordHandoff(input.summary, strippedConclude.cleanedText, this.targetPath);
        }
        ceremony.summary = strippedConclude.cleanedText.includes("Active Domain Invariants:")
            ? strippedConclude.cleanedText
            : `${strippedConclude.cleanedText}${existingInvariantsSuffix}`;
        ceremony.outputArtifactUri = input.outputArtifactUri;
        ceremony.concludedAt = new Date().toISOString();
        const validated = AgileCeremonySchema.parse(ceremony);
        this.ceremonies.set(input.ceremonyId, validated);
        await this.persistCeremony(validated);
        // Se la cerimonia era una SPRINT_RETROSPECTIVE ed include dati analitici, salvali
        if (ceremony.type === "SPRINT_RETROSPECTIVE" && input.retrospectiveData) {
            const retro = SprintRetrospectiveSchema.parse({
                ...input.retrospectiveData,
                moderatorRole: ceremony.chairRole,
                concludedAt: ceremony.concludedAt,
            });
            const retroDir = path.resolve(this.targetPath, ".company-os", "ceremonies", "retrospectives");
            await fs.mkdir(retroDir, { recursive: true });
            const retroPath = path.resolve(retroDir, `${retro.sprintId}.json`);
            await fs.writeFile(retroPath, JSON.stringify(retro, null, 2), "utf-8");
        }
        try {
            const bus = CompanyEventBus.getInstance();
            bus.publish({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: "CEREMONY_CONCLUDED",
                sourceAgent: ceremony.chairRole,
                level: "info",
                payload: {
                    ceremonyId: ceremony.id,
                    type: ceremony.type,
                    summary: ceremony.summary,
                },
            });
        }
        catch {
            // Best effort
        }
        return validated;
    }
    /**
     * Salva il verbale della cerimonia in .company-os/ceremonies/
     */
    async persistCeremony(ceremony) {
        const ceremoniesDir = path.resolve(this.targetPath, ".company-os", "ceremonies");
        await fs.mkdir(ceremoniesDir, { recursive: true });
        const jsonPath = path.resolve(ceremoniesDir, `${ceremony.id}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(ceremony, null, 2), "utf-8");
        // Genera anche verbale markdown human-readable per la documentazione
        const mdPath = path.resolve(ceremoniesDir, `${ceremony.id}.md`);
        const mdContent = [
            `# Verbale Cerimonia Agile: ${ceremony.type}`,
            ``,
            `- **ID:** \`${ceremony.id}\``,
            `- **Moderatore (Chair):** \`${ceremony.chairRole}\``,
            `- **Partecipanti:** ${ceremony.attendeeRoles.map((r) => `\`${r}\``).join(", ")}`,
            `- **Stato:** **${ceremony.status}**`,
            `- **Inizio:** ${ceremony.startedAt}`,
            `- **Fine:** ${ceremony.concludedAt || "In corso"}`,
            ``,
            `## Sintesi & Decisioni`,
            ceremony.summary,
            ``,
        ].join("\n");
        await fs.writeFile(mdPath, mdContent, "utf-8");
    }
    getCeremony(id) {
        return this.ceremonies.get(id);
    }
    listCeremonies() {
        return Array.from(this.ceremonies.values());
    }
}
//# sourceMappingURL=ceremony-dispatcher.js.map