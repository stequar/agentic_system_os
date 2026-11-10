import { type ProjectStack } from "../contracts/inspector.js";
export interface DetectProjectStackOptions {
    hermetic?: boolean;
}
/**
 * Risolve i comandi di test rendendoli ermetici rispetto al virtualenv / lockfile locale
 * (`.venv/bin/pytest` > `uv run pytest` > `poetry run pytest` > `pytest`).
 */
export declare function resolveHermeticTestCommands(targetPath: string, baseCommands: string[]): Promise<string[]>;
export declare function detectProjectStack(targetPath: string, options?: DetectProjectStackOptions): Promise<ProjectStack>;
//# sourceMappingURL=detector.d.ts.map