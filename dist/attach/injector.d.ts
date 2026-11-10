import { type AttachResult, type AttachOptions } from "../contracts/roles.js";
import { type TriRingOrgChart } from "../contracts/brownfield.js";
import type { ProjectStack } from "../contracts/inspector.js";
/**
 * 1. Skill `run-company` (`MODE_1_STANDUP`) — `.agents/skills/run-company/SKILL.md`
 * Frontmatter YAML rigorosamente alle righe 1-4.
 */
export declare function renderRunCompanySkill(): string;
/**
 * 2. Skill `investigate-anomaly` (`MODE_2_INVESTIGATE_RCA`) — `.agents/skills/investigate-anomaly/SKILL.md`
 * Frontmatter YAML strictly at lines 1-4.
 */
export declare function renderInvestigateAnomalySkill(): string;
/**
 * 3. Skill `rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`) — `.agents/skills/rnd-roundtable/SKILL.md`
 * Frontmatter YAML strictly at lines 1-4.
 */
export declare function renderRndRoundtableSkill(): string;
/**
 * 4. Skill `gatekeeper-audit` (`MODE_4_BUILD_GATEKEEPER`) — `.agents/skills/gatekeeper-audit/SKILL.md`
 * Frontmatter YAML strictly at lines 1-4.
 */
export declare function renderGatekeeperAuditSkill(): string;
/**
 * Renders the Master Index Bootloader (docs/wiki/INDEX.md) in English
 */
export declare function renderWikiIndex(discoveredWikiFiles?: string[]): string;
/**
 * Renders the product roadmap (docs/wiki/product/roadmap.md) in English
 */
export declare function renderProductRoadmap(): string;
/**
 * Renders the product backlog (docs/wiki/product/backlog.md) in English
 */
export declare function renderProductBacklog(): string;
/**
 * Renders the architecture document contextualized to the detected stack (docs/wiki/engineering/architecture.md) in English
 */
export declare function renderArchitectureDoc(stack: ProjectStack): string;
/**
 * Renders the Executive / Project Lead Dashboard (`docs/CEO_Dashboard.md`) in English.
 */
export declare function renderCeoDashboard(stack: ProjectStack, orgChart?: TriRingOrgChart): string;
/**
 * Inietta nel workspace di destinazione la configurazione dei ruoli, le skill operative
 * e la knowledge base strutturata in docs/wiki/INDEX.md.
 */
export declare function attachWorkspace(targetPath: string, options?: Partial<AttachOptions> & {
    orgChart?: TriRingOrgChart;
}): Promise<AttachResult>;
//# sourceMappingURL=injector.d.ts.map