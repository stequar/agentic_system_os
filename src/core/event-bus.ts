import crypto from "node:crypto";
import {
  CompanyEventSchema,
  type CompanyEvent,
  type CompanyEventHandler,
  type CompanyEventType,
} from "../contracts/events.js";

/**
 * Bus asincrono tipizzato in-memory per gli eventi del ciclo di vita aziendale.
 */
export class CompanyEventBus {
  private static instance: CompanyEventBus | null = null;
  private listeners: Map<string, Set<CompanyEventHandler>> = new Map();

  static getInstance(): CompanyEventBus {
    if (!this.instance) {
      this.instance = new CompanyEventBus();
    }
    return this.instance;
  }

  /**
   * Registra un listener per uno specifico tipo di evento o per tutti gli eventi ("*").
   * Restituisce una funzione di unsubscribe.
   */
  subscribe(eventType: CompanyEventType | string, handler: CompanyEventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.unsubscribe(eventType, handler);
    };
  }

  on(eventType: CompanyEventType | string, handler: CompanyEventHandler): () => void {
    return this.subscribe(eventType, handler);
  }

  unsubscribe(eventType: CompanyEventType | string, handler: CompanyEventHandler): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  off(eventType: CompanyEventType | string, handler: CompanyEventHandler): void {
    this.unsubscribe(eventType, handler);
  }

  /**
   * Pubblica un evento sul bus, notificando tutti i listener registrati.
   */
  async emit(eventInput: Partial<CompanyEvent> & { type: CompanyEventType | string; sourceAgent: string }): Promise<CompanyEvent> {
    const event: CompanyEvent = CompanyEventSchema.parse({
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

    await Promise.all(
      allHandlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[CompanyEventBus] Errore nel gestore per l'evento ${event.type}:`, err);
        }
      })
    );

    return event;
  }

  /**
   * Alias per emit.
   */
  async publish(eventInput: Partial<CompanyEvent> & { type: CompanyEventType | string; sourceAgent: string }): Promise<CompanyEvent> {
    return this.emit(eventInput);
  }

  /**
   * Rimuove tutti i listener registrati (utile nei test)
   */
  clear(): void {
    this.listeners.clear();
  }
}
