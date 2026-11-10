import crypto from "node:crypto";
import { CompanyEventSchema, } from "../contracts/events.js";
/**
 * Bus asincrono tipizzato in-memory per gli eventi del ciclo di vita aziendale.
 */
export class CompanyEventBus {
    static instance = null;
    listeners = new Map();
    static getInstance() {
        if (!this.instance) {
            this.instance = new CompanyEventBus();
        }
        return this.instance;
    }
    /**
     * Registra un listener per uno specifico tipo di evento o per tutti gli eventi ("*").
     * Restituisce una funzione di unsubscribe.
     */
    subscribe(eventType, handler) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(handler);
        return () => {
            this.unsubscribe(eventType, handler);
        };
    }
    on(eventType, handler) {
        return this.subscribe(eventType, handler);
    }
    unsubscribe(eventType, handler) {
        const handlers = this.listeners.get(eventType);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }
    off(eventType, handler) {
        this.unsubscribe(eventType, handler);
    }
    /**
     * Pubblica un evento sul bus, notificando tutti i listener registrati.
     */
    async emit(eventInput) {
        const event = CompanyEventSchema.parse({
            id: eventInput.id || crypto.randomUUID(),
            timestamp: eventInput.timestamp || new Date().toISOString(),
            type: eventInput.type,
            sourceAgent: eventInput.sourceAgent,
            level: eventInput.level || "info",
            payload: eventInput.payload || {},
            sessionId: eventInput.sessionId,
        });
        const specificHandlers = this.listeners.get(event.type) || new Set();
        const wildcardHandlers = this.listeners.get("*") || new Set();
        const allHandlers = [...specificHandlers, ...wildcardHandlers];
        await Promise.all(allHandlers.map(async (handler) => {
            try {
                await handler(event);
            }
            catch (err) {
                console.error(`[CompanyEventBus] Errore nel gestore per l'evento ${event.type}:`, err);
            }
        }));
        return event;
    }
    /**
     * Alias per emit.
     */
    async publish(eventInput) {
        return this.emit(eventInput);
    }
    /**
     * Rimuove tutti i listener registrati (utile nei test)
     */
    clear() {
        this.listeners.clear();
    }
}
//# sourceMappingURL=event-bus.js.map