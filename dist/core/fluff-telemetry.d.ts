import { type FluffTelemetryReport } from "../contracts/studio.js";
/**
 * Telemetria deterministica per il risparmio token derivante da Caveman Mode
 * e dall'eliminazione del fluff comunicativo inter-agente.
 * Supporta la persistenza cross-processo su .company-os/telemetry/fluff.json.
 */
export declare class FluffTelemetry {
    private static instance;
    private totalMessagesIntercepted;
    private originalTokens;
    private compressedTokens;
    private fluffTokensEliminated;
    private persistedPaths;
    private readonly BLENDED_OUTPUT_TOKEN_USD;
    private constructor();
    static getInstance(): FluffTelemetry;
    /**
     * Percorso del file di persistenza su disco.
     */
    private getFilePath;
    /**
     * Carica i dati salvati su disco se presenti.
     */
    loadFromDisk(targetPath?: string): void;
    /**
     * Salva i dati correnti su disco.
     */
    private saveToDisk;
    /**
     * Registra un handoff inter-agente calcolando il risparmio token e i dollari risparmiati.
     */
    recordHandoff(originalText: string, compressedText: string, targetPath?: string): {
        originalTokens: number;
        compressedTokens: number;
        tokensEliminated: number;
        savingsRatioPercent: number;
    };
    /**
     * Genera il report consolidato della telemetria.
     */
    getReport(targetPath?: string): FluffTelemetryReport;
    /**
     * Ripristina i contatori (utile nei test).
     */
    reset(targetPath?: string): void;
}
//# sourceMappingURL=fluff-telemetry.d.ts.map