export interface WizardOptions {
    nonInteractive?: boolean;
    yes?: boolean;
    json?: boolean;
}
export interface MonorepoDetectionResult {
    isMonorepo: boolean;
    type?: "pnpm" | "npm/yarn" | "cargo" | "directory-structure";
    workspaces: string[];
}
/**
 * Rileva automaticamente se il targetPath è un monorepo o multi-repo
 * e individua i relativi sub-workspace.
 */
export declare function detectMonorepoWorkspaces(targetPath: string): Promise<MonorepoDetectionResult>;
/**
 * Interactive Scaffolding Wizard moderno basato su @clack/prompts.
 * Supporta esecuzione interattiva e modalità headless non bloccante per CI/CD.
 */
export declare function runScaffoldingWizard(targetPath?: string, options?: WizardOptions): Promise<any>;
//# sourceMappingURL=wizard.d.ts.map