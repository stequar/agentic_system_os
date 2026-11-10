import type { SemanticDomainClusterRule } from "./types.js";
/**
 * PILOT ONTOLOGY — Fitness / Rehab domain (TCK-DH.4).
 *
 * This module isolates the customer-specific domain ontology (the `fitness_project`
 * pilot: `medical_manager` / `nutrition_manager` / `ai_manager`) OUT of the generic
 * `domain-miner` core scanner. The core scanner iterates over registered ontology
 * packs; it must contain zero hardcoded customer-domain literals.
 *
 * To add another pilot/industry pack, create a sibling module exporting the same two
 * shapes and register it where these are consumed in `domain-miner.ts`.
 */
/**
 * Declarative mapping from a legacy agent name found in a brownfield `AGENTS.md`
 * to the preserved Ring-2 specialist that should be synthesized for it.
 */
export interface PreservedDomainMapping {
    /** Legacy agent-name trigger to detect in the existing `AGENTS.md`. */
    triggerRegex: RegExp;
    id: string;
    title: string;
    boundedContext: string;
    /** Filters discovered file paths to build the specialist's domain scope. */
    scopeFilterRegex: RegExp;
    /** Scope used when the filter matches no repository files. */
    fallbackScope: string[];
    domainKeywords: string[];
    domainInvariants: string[];
    microRoleCard: string;
}
/**
 * Semantic clusters inferred autonomously from source/wiki content (no `AGENTS.md` required).
 */
export declare const FITNESS_PILOT_SEMANTIC_CLUSTERS: SemanticDomainClusterRule[];
/**
 * Preserved-role mappings for a brownfield repo whose `AGENTS.md` already declares
 * the legacy `medical_manager` / `nutrition_manager` / `ai_manager` agents.
 */
export declare const FITNESS_PILOT_PRESERVED_MAPPINGS: PreservedDomainMapping[];
//# sourceMappingURL=fitness-pilot-ontology.d.ts.map