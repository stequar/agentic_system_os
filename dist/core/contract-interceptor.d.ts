import { z } from "zod";
import { type ContractViolationEvent, type DiagnosticViolationDetail } from "../contracts/interceptor.js";
import { CompanyEventBus } from "./event-bus.js";
/**
 * Errore sollevato dall'interceptor quando un payload viola lo schema Zod a runtime.
 */
export declare class ContractViolationError extends Error {
    readonly violationEvent: ContractViolationEvent;
    readonly syntheticDiagnostic: string;
    constructor(event: ContractViolationEvent);
}
export interface EnforceOptions {
    contractName?: string;
    actionOrTransition?: string;
    sourceAgent?: string;
    strict?: boolean;
    eventBus?: CompanyEventBus;
}
/**
 * Runtime Contract Interceptor:
 * Valida rigorosamente con Zod `.strict()` qualsiasi payload in transito a runtime.
 * In caso di violazione o campi allucinati, arresta l'esecuzione (Fail Loudly)
 * emettendo diagnostica sintetica ed evento di alert.
 */
export declare class ContractInterceptor {
    private static defaultBus?;
    static setDefaultEventBus(bus: CompanyEventBus): void;
    /**
     * Azzera il bus di default (isolamento test / reset del processo): evita che un bus
     * impostato in un contesto contamini quelli successivi.
     */
    static reset(): void;
    /**
     * Valida un payload a fronte di uno schema Zod. Se valido, restituisce il dato tipizzato.
     * Se non valido, solleva ContractViolationError e notifica l'EventBus.
     */
    static enforce<T>(schema: z.ZodType<T>, payload: unknown, options?: EnforceOptions): T;
    /**
     * Esegue una verifica soft senza sollevare eccezioni, utile per controlli pre-flight.
     */
    static check<T>(schema: z.ZodType<T>, payload: unknown, options?: EnforceOptions): {
        success: true;
        data: T;
    } | {
        success: false;
        violations: DiagnosticViolationDetail[];
        syntheticDiagnostic: string;
    };
}
//# sourceMappingURL=contract-interceptor.d.ts.map