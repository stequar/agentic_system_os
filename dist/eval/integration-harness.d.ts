import { type IntegrationEvalScorecard } from "../contracts/eval.js";
export interface CleanSlateResetResult {
    targetPath: string;
    restoredFromBackup: string[];
    strippedManagedBlocksFrom: string[];
    removedArtifacts: string[];
    cleanSlateResetVerified: boolean;
}
/**
 * Rimuove qualsiasi blocco sentinella `<!-- AGENTIC-OS:MANAGED:START ... -->` da un testo,
 * restituendo il contenuto utente originario pre-OS.
 */
export declare function stripAllManagedSentinelBlocks(content: string): string;
/**
 * Riporta un repository target allo stato vergine originale pre-installazione (`Clean-Slate Reset`):
 * 1. Ripristina i file `.bak` (se presenti) sui rispettivi file originali e rimuove i `.bak`.
 * 2. Rimuove eventuali blocchi sentinella `<!-- AGENTIC-OS:MANAGED:START -->` residui.
 * 3. Elimina `.company-os/`, `.agents/.studio-token`, `synced_schemas.py` e `SyncedModels.swift`.
 * 4. Verifica deterministicamente che il workspace sia privo di artefatti di esecuzioni precedenti.
 */
export declare function resetTargetWorkspaceToCleanSlate(targetPath: string): Promise<CleanSlateResetResult>;
/**
 * Esegue il Clean-Slate Reset + Blind Application Sprint + Valutazione a 6 Assi (`E1..E6`)
 * in modalità rigorosamente Zero-Hint (`ignoreExistingAgentsMdForMining: true`).
 */
export declare function runBlindApplicationSprintAndEval(targetPath?: string, options?: {
    writeWikiReportToOsDir?: string;
}): Promise<IntegrationEvalScorecard>;
export declare function renderEvalScorecardMarkdown(scorecard: IntegrationEvalScorecard): string;
//# sourceMappingURL=integration-harness.d.ts.map