import { type TelegraphicMessage } from "../contracts/ceremonies.js";
export interface FluffStrippingResult {
    cleanedText: string;
    removedFluffCount: number;
}
export interface PreservationCheckResult {
    preserved: boolean;
    missingArtifacts: string[];
}
export interface TokenSavingsSummary {
    originalTokens: number;
    compressedTokens: number;
    savingsTokens: number;
    savingsRatioPercent: number;
}
/**
 * Modulo Caveman-RPC Formatter & Zero-Fluff Enforcer.
 * Converte i passaggi di consegne inter-agente in comunicazioni telegrafiche a zero token bloat,
 * preservando in modo deterministico al 100% blocchi di codice, path dei file, comandi e hash.
 */
export declare class CavemanFormatter {
    /**
     * Crea un messaggio telegrafico strutturato conforme a TelegraphicMessageSchema.
     */
    static createMessage(params: Omit<TelegraphicMessage, "zeroFluff" | "timestamp">): TelegraphicMessage;
    /**
     * Rimuove determinismo e pattern conversazionali superflui dal testo in ingresso.
     */
    static stripFluff(text: string): FluffStrippingResult;
    /**
     * Serializza un TelegraphicMessage nel formato compatto Caveman-RPC.
     */
    static format(msg: TelegraphicMessage): string;
    /**
     * Esegue il parsing di una stringa formattata Caveman-RPC in un TelegraphicMessage validato Zod.
     */
    static parse(raw: string): TelegraphicMessage;
    /**
     * Verifica che la versione telegrafica/compressa conservi al 100% tutti i frammenti critici:
     * blocchi di codice, percorsi di file, comandi di test e hash esadecimali.
     */
    static verifyPreservation(originalText: string, telegraphicText: string): PreservationCheckResult;
    /**
     * Calcola la stima dei token risparmiati tramite la formattazione telegrafica.
     * Euristica: ~4 caratteri per token.
     */
    static calculateSavings(originalText: string, compressedText: string): TokenSavingsSummary;
}
//# sourceMappingURL=caveman-formatter.d.ts.map