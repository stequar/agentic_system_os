import { type CompanyEvent, type CompanyEventHandler, type CompanyEventType } from "../contracts/events.js";
/**
 * Bus asincrono tipizzato in-memory per gli eventi del ciclo di vita aziendale.
 */
export declare class CompanyEventBus {
    private static instance;
    private listeners;
    static getInstance(): CompanyEventBus;
    /**
     * Registra un listener per uno specifico tipo di evento o per tutti gli eventi ("*").
     * Restituisce una funzione di unsubscribe.
     */
    subscribe(eventType: CompanyEventType | string, handler: CompanyEventHandler): () => void;
    on(eventType: CompanyEventType | string, handler: CompanyEventHandler): () => void;
    unsubscribe(eventType: CompanyEventType | string, handler: CompanyEventHandler): void;
    off(eventType: CompanyEventType | string, handler: CompanyEventHandler): void;
    /**
     * Pubblica un evento sul bus, notificando tutti i listener registrati.
     */
    emit(eventInput: Partial<CompanyEvent> & {
        type: CompanyEventType | string;
        sourceAgent: string;
    }): Promise<CompanyEvent>;
    /**
     * Alias per emit.
     */
    publish(eventInput: Partial<CompanyEvent> & {
        type: CompanyEventType | string;
        sourceAgent: string;
    }): Promise<CompanyEvent>;
    /**
     * Rimuove tutti i listener registrati (utile nei test)
     */
    clear(): void;
}
//# sourceMappingURL=event-bus.d.ts.map