import { type HolisticBootstrapReport } from "../contracts/brownfield.js";
export interface HolisticBootstrapOptions {
    dryRun?: boolean;
    ignoreExistingAgentsMdForMining?: boolean;
    doctorTimeoutMs?: number;
}
/**
 * Esegue la pipeline olistica in 5 Fasi (`P0..P4` — `RFC-007`) per il bootstrap completo
 * di un workspace (Greenfield o Brownfield):
 * - `P0_DEEP_RECONNAISSANCE`: Stack inspection profonda, Doctor parallelo e risoluzione runner ermetici (`.venv/bin/pytest`)
 * - `P1_SEMANTIC_DOMAIN_MINING`: Estrazione di Ring-1 Tech Specialists e Ring-2 Business Domain Experts
 * - `P2_TRI_RING_ORG_SYNTHESIS`: Salvataggio `.company-os/org-chart.json` e Smart-Merge non distruttivo
 * - `P3_HOLISTIC_TOOLING_PROVISIONING`: Pre-sintesi tool MCP JIT (`HOT_LOADED`), Drift Detector, `contracts.json`, `invariants.json` e `config.json`
 * - `P4_INAUGURAL_ALIGNMENT_CEREMONY`: Cerimonia inaugurale `BRAINSTORMING_KICKOFF` con tutti gli esperti Ring-0/1/2
 */
export declare function runHolisticWorkspaceBootstrap(targetPath: string, options?: HolisticBootstrapOptions): Promise<HolisticBootstrapReport>;
//# sourceMappingURL=holistic-bootstrap.d.ts.map