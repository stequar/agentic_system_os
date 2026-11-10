import { type TriRingOrgChart } from "../contracts/brownfield.js";
export interface HarnessAdapterResult {
    targetPath: string;
    personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
    language: "en" | "it";
    humanTitle: string;
    orchestratorTitle: string;
    generatedFiles: string[];
}
export declare function resolvePersonaTitles(preset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE"): {
    humanTitle: string;
    orchestratorTitle: string;
    modePrefix: string;
};
export declare function renderClaudeMd(params: {
    targetPath: string;
    languages: string[];
    frameworks: string[];
    testCommands: string[];
    personaPreset: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE";
    language: "en" | "it";
    orgChart?: TriRingOrgChart;
}): string;
export declare function renderClaudeSlashCommands(personaPreset?: "ENGINEERING_PROFESSIONAL" | "STARTUP_EXECUTIVE"): Record<string, string>;
export declare function renderLocalShimScript(_unusedEntrypoint?: string): string;
export declare function renderMcpJsonConfig(existingConfig?: Record<string, unknown> | null): string;
/**
 * Generates and synchronizes Claude Code (CLAUDE.md, .claude/commands/*.md, .mcp.json)
 * and OpenAI Codex (AGENTS.md) harness files in the target workspace using non-destructive Smart-Merge.
 */
export declare function setupAgentHarnesses(targetPath: string, options?: {
    dryRun?: boolean;
}): Promise<HarnessAdapterResult>;
//# sourceMappingURL=harness-adapter.d.ts.map