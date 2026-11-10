import { type TriRingOrgChart } from "../contracts/brownfield.js";
import type { ProjectStack } from "../contracts/inspector.js";
export interface DomainMinerOptions {
    ignoreExistingAgentsMd?: boolean;
    maxDomainExperts?: number;
}
/**
 * Esegue il mining semantico del repository (Fase P1 — `SEMANTIC_DOMAIN_MINING` & `TRI_RING_ORG_SYNTHESIS`)
 * generando l'organigramma Tri-Ring completo:
 * - Ring-0: Core Governance Leads
 * - Ring-1: Catalog Tech Leads + Open-Ended Tech Specialists (es. SQL, Docker, Data Ingestion, MCP/CLI Runtime)
 * - Ring-2: Business Domain Experts (sia preservati da `AGENTS.md` sia inferiti autonomamente da AST/SQL/Wiki)
 */
export declare function mineRepositoryDomainAndRoles(targetPath: string, stack?: ProjectStack, options?: DomainMinerOptions): Promise<TriRingOrgChart>;
//# sourceMappingURL=domain-miner.d.ts.map