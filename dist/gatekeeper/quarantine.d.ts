import { type QuarantineRegistry, type QuarantinedTest, type QuarantineEvaluationResult } from "../contracts/quarantine.js";
import { CompanyEventBus } from "../core/event-bus.js";
/**
 * Percorso file di registro della quarantena
 */
export declare function getQuarantineFilePath(targetPath: string): string;
/**
 * Carica il registro della quarantena dal filesystem o ne crea uno vuoto
 */
export declare function loadQuarantineRegistry(targetPath: string): Promise<QuarantineRegistry>;
/**
 * Salva atomicamente il registro della quarantena
 */
export declare function saveQuarantineRegistry(targetPath: string, registry: QuarantineRegistry): Promise<void>;
/**
 * Verifica se un test è attualmente in quarantena
 */
export declare function isTestQuarantined(targetPath: string, testIdentifier: string): Promise<boolean>;
export interface EvaluateFlakinessOptions {
    targetPath: string;
    testIdentifier: string;
    testFile: string;
    testExecutor: () => Promise<boolean>;
    maxAllowed?: number;
    eventBus?: CompanyEventBus;
}
/**
 * Valuta un test secondo l'algoritmo N=3 di alternanza deterministica.
 * Isola in quarantena SOLO se il test alterna PASS e FAIL.
 * Se fallisce 3/3, è un fallimento deterministico (bug reale) e NON va in quarantena.
 */
export declare function evaluateTestFlakiness(options: EvaluateFlakinessOptions): Promise<QuarantineEvaluationResult>;
/**
 * Formatta un ticket Markdown da aggiungere al backlog del prodotto per il test in quarantena
 */
export declare function formatBacklogTicket(quarantinedTest: QuarantinedTest): string;
//# sourceMappingURL=quarantine.d.ts.map