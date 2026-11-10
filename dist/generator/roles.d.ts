import { type GeneratedRole, type TeamConfiguration } from "../contracts/roles.js";
import type { ProjectStack } from "../contracts/inspector.js";
import type { TriRingOrgChart } from "../contracts/brownfield.js";
/**
 * Renderizza il markdown completo di AGENTS.md secondo l'Executive & R&D Operating Protocol v2
 * (Sprint 17.6 — 100% Self-Hosting DNA):
 * - In Cima (Sezione 0): Identità CTO L1 imperativa in 2ª persona, Greeting Rule a 3 opzioni per il CEO,
 *   le 4 CTO Operating Modes (`MODE 1..4`), le 4 Cognitive Forcing Functions (`CFF-1..4`),
 *   tassonomia Tri-Ring completa (Ring-0 Core Leads, Ring-1 Tech Specialists, Ring-2 Business Domain Experts
 *   con `domainScope` e `domainInvariants`), Matrice RACI Deterministica e le 4 Skill YAML.
 * - Sezioni 1..6: Stack Tecnologico, Organigramma Mermaid Tri-Ring, Matrice dei Ruoli, Karpathy Context as RAM,
 *   Deterministic Gatekeeper e Direttive Operative.
 */
export declare function renderAgentsMarkdown(stack: ProjectStack, roles: GeneratedRole[], orgChart?: TriRingOrgChart): string;
/**
 * Genera la configurazione del team aziendale in base allo stack tecnologico rilevato.
 * Rispetta rigorosamente TeamConfigurationSchema in src/contracts/roles.ts.
 */
export declare function generateTeamConfiguration(stack: ProjectStack, orgChart?: TriRingOrgChart): Promise<TeamConfiguration>;
//# sourceMappingURL=roles.d.ts.map