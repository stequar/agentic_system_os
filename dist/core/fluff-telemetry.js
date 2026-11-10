import fs from "node:fs";
import path from "node:path";
import { FluffTelemetryReportSchema, } from "../contracts/studio.js";
import { CavemanFormatter } from "./caveman-formatter.js";
/**
 * Telemetria deterministica per il risparmio token derivante da Caveman Mode
 * e dall'eliminazione del fluff comunicativo inter-agente.
 * Supporta la persistenza cross-processo su .company-os/telemetry/fluff.json.
 */
export class FluffTelemetry {
    static instance = null;
    totalMessagesIntercepted = 0;
    originalTokens = 0;
    compressedTokens = 0;
    fluffTokensEliminated = 0;
    persistedPaths = new Set();
    // Stima blended costo per output token ($3.00 / 1M token = $0.000003)
    BLENDED_OUTPUT_TOKEN_USD = 0.000003;
    constructor() {
        this.loadFromDisk();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FluffTelemetry();
        }
        return this.instance;
    }
    /**
     * Percorso del file di persistenza su disco.
     */
    getFilePath(targetPath) {
        const root = targetPath || process.cwd();
        return path.resolve(root, ".company-os", "telemetry", "fluff.json");
    }
    /**
     * Carica i dati salvati su disco se presenti.
     */
    loadFromDisk(targetPath) {
        try {
            const p = this.getFilePath(targetPath);
            if (fs.existsSync(p)) {
                const raw = fs.readFileSync(p, "utf-8");
                const data = JSON.parse(raw);
                this.totalMessagesIntercepted = data.totalMessagesIntercepted || 0;
                this.originalTokens = data.originalTokens || 0;
                this.compressedTokens = data.compressedTokens || 0;
                this.fluffTokensEliminated = data.fluffTokensEliminated || 0;
            }
        }
        catch {
            // Ignora errori di caricamento disco
        }
    }
    /**
     * Salva i dati correnti su disco.
     */
    saveToDisk(targetPath) {
        try {
            const p = this.getFilePath(targetPath);
            this.persistedPaths.add(p);
            fs.mkdirSync(path.dirname(p), { recursive: true });
            fs.writeFileSync(p, JSON.stringify({
                totalMessagesIntercepted: this.totalMessagesIntercepted,
                originalTokens: this.originalTokens,
                compressedTokens: this.compressedTokens,
                fluffTokensEliminated: this.fluffTokensEliminated,
                updatedAt: new Date().toISOString(),
            }, null, 2), "utf-8");
        }
        catch {
            // Ignora errori di scrittura disco
        }
    }
    /**
     * Registra un handoff inter-agente calcolando il risparmio token e i dollari risparmiati.
     */
    recordHandoff(originalText, compressedText, targetPath) {
        const savings = CavemanFormatter.calculateSavings(originalText, compressedText);
        this.totalMessagesIntercepted += 1;
        this.originalTokens += savings.originalTokens;
        this.compressedTokens += savings.compressedTokens;
        this.fluffTokensEliminated += savings.savingsTokens;
        this.saveToDisk(targetPath);
        return {
            originalTokens: savings.originalTokens,
            compressedTokens: savings.compressedTokens,
            tokensEliminated: savings.savingsTokens,
            savingsRatioPercent: savings.savingsRatioPercent,
        };
    }
    /**
     * Genera il report consolidato della telemetria.
     */
    getReport(targetPath) {
        this.loadFromDisk(targetPath);
        const fluffReductionPercentage = this.originalTokens > 0
            ? Number(((this.fluffTokensEliminated / this.originalTokens) * 100).toFixed(1))
            : 0;
        const estimatedDollarsSavedUsd = Number((this.fluffTokensEliminated * this.BLENDED_OUTPUT_TOKEN_USD).toFixed(6));
        return FluffTelemetryReportSchema.parse({
            totalMessagesIntercepted: this.totalMessagesIntercepted,
            originalTokens: this.originalTokens,
            compressedTokens: this.compressedTokens,
            fluffTokensEliminated: this.fluffTokensEliminated,
            fluffReductionPercentage,
            estimatedDollarsSavedUsd,
            updatedAt: new Date().toISOString(),
        });
    }
    /**
     * Ripristina i contatori (utile nei test).
     */
    reset(targetPath) {
        this.totalMessagesIntercepted = 0;
        this.originalTokens = 0;
        this.compressedTokens = 0;
        this.fluffTokensEliminated = 0;
        const pathsToClean = new Set([
            this.getFilePath(targetPath),
            ...this.persistedPaths,
        ]);
        for (const p of pathsToClean) {
            try {
                if (fs.existsSync(p)) {
                    fs.unlinkSync(p);
                }
            }
            catch { }
        }
        this.persistedPaths.clear();
    }
}
//# sourceMappingURL=fluff-telemetry.js.map