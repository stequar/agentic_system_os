import { z } from "zod";
import crypto from "node:crypto";
import { ContractViolationEventSchema, DiagnosticViolationDetailSchema, } from "../contracts/interceptor.js";
/**
 * Errore sollevato dall'interceptor quando un payload viola lo schema Zod a runtime.
 */
export class ContractViolationError extends Error {
    violationEvent;
    syntheticDiagnostic;
    constructor(event) {
        super(`[CONTRACT_VIOLATION_FAIL_LOUDLY] in '${event.contractName}': ${event.syntheticDiagnostic}`);
        this.name = "ContractViolationError";
        this.violationEvent = event;
        this.syntheticDiagnostic = event.syntheticDiagnostic;
    }
}
/**
 * Converte i problemi rilevati da Zod in una lista strutturata di violazioni diagnostiche.
 */
function extractDiagnosticDetails(issues) {
    return issues.map((issue) => {
        const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        let expected;
        let received;
        if (issue.code === "invalid_type") {
            expected = issue.expected;
            received = issue.received;
        }
        else if (issue.code === "unrecognized_keys") {
            expected = "Nessuna chiave aggiuntiva (strict mode)";
            received = `Chiavi non autorizzate: ${issue.keys?.join(", ")}`;
        }
        return DiagnosticViolationDetailSchema.parse({
            path: fieldPath,
            code: issue.code,
            message: issue.message,
            expected,
            received,
        });
    });
}
/**
 * Genera una stringa diagnostica sintetica per il recupero rapido dell'agente.
 */
function buildSyntheticDiagnostic(contractName, action, violations) {
    const details = violations
        .map((v) => `• '${v.path}': ${v.message}${v.received ? ` (ricevuto: ${v.received})` : ""}`)
        .join(" | ");
    return `Violazione contratto '${contractName}' durante '${action}'. Rilevati ${violations.length} problemi: ${details}`;
}
/**
 * Scende attraverso i wrapper (ZodEffects/refine, ZodDefault, ZodOptional, ZodNullable)
 * fino al primo ZodObject, così da poter applicare lo strict-keys anche su schemi raffinati.
 */
function unwrapToObject(schema) {
    let s = schema;
    for (let i = 0; i < 6 && s; i++) {
        if (s instanceof z.ZodObject)
            return s;
        const def = s?._def;
        if (!def)
            return undefined;
        s = def.schema ?? def.innerType ?? undefined;
    }
    return undefined;
}
/**
 * safeParse con strict-keys robusto: per uno ZodObject applica `.strict()`; per uno schema
 * raffinato (ZodEffects) o incapsulato valida PRIMA con lo schema originale (così le refine
 * vengono eseguite) e POI verifica l'assenza di chiavi allucinate sull'oggetto interno.
 */
function strictSafeParse(schema, payload, enforceStrict) {
    if (!enforceStrict)
        return schema.safeParse(payload);
    if (schema instanceof z.ZodObject) {
        return schema.strict().safeParse(payload);
    }
    const inner = unwrapToObject(schema);
    if (inner) {
        const base = schema.safeParse(payload);
        if (!base.success)
            return base;
        const strictKeys = inner.strict().safeParse(payload);
        if (!strictKeys.success) {
            return strictKeys;
        }
        return base;
    }
    return schema.safeParse(payload);
}
/**
 * Runtime Contract Interceptor:
 * Valida rigorosamente con Zod `.strict()` qualsiasi payload in transito a runtime.
 * In caso di violazione o campi allucinati, arresta l'esecuzione (Fail Loudly)
 * emettendo diagnostica sintetica ed evento di alert.
 */
export class ContractInterceptor {
    static defaultBus;
    static setDefaultEventBus(bus) {
        this.defaultBus = bus;
    }
    /**
     * Azzera il bus di default (isolamento test / reset del processo): evita che un bus
     * impostato in un contesto contamini quelli successivi.
     */
    static reset() {
        this.defaultBus = undefined;
    }
    /**
     * Valida un payload a fronte di uno schema Zod. Se valido, restituisce il dato tipizzato.
     * Se non valido, solleva ContractViolationError e notifica l'EventBus.
     */
    static enforce(schema, payload, options) {
        const contractName = options?.contractName || schema.description || "AnonymousSchema";
        const action = options?.actionOrTransition || "RUNTIME_DATA_EXCHANGE";
        const enforceStrict = options?.strict !== false;
        // Strict-keys robusto: blocca campi allucinati anche su schemi raffinati/annidati.
        const parseResult = strictSafeParse(schema, payload, enforceStrict);
        if (parseResult.success) {
            return parseResult.data;
        }
        // Estrazione e costruzione della diagnostica
        const violations = extractDiagnosticDetails(parseResult.error.issues);
        const syntheticDiagnostic = buildSyntheticDiagnostic(contractName, action, violations);
        const violationEvent = ContractViolationEventSchema.parse({
            contractName,
            actionOrTransition: action,
            violations,
            syntheticDiagnostic,
            rawPayload: payload,
            sourceAgent: options?.sourceAgent || "unknown",
            timestamp: new Date().toISOString(),
        });
        // Notifica sull'EventBus se disponibile. `emit` è async: ne gestiamo esplicitamente
        // il rigetto (prima diventava un'unhandled rejection) senza bloccare il fail-loud.
        const bus = options?.eventBus || this.defaultBus;
        if (bus) {
            Promise.resolve(bus.emit({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: "CONTRACT_VIOLATION",
                sourceAgent: options?.sourceAgent || "contract_interceptor",
                level: "error",
                payload: violationEvent,
            })).catch(() => {
                // Emissione best-effort: un fallimento del bus non deve mascherare il fail-loud.
            });
        }
        else {
            // Nessun bus collegato: la violazione non deve essere invisibile -> stderr.
            console.error(`[ContractInterceptor] ${syntheticDiagnostic}`);
        }
        // Fail Loudly: arresto immediato con eccezione strutturata
        throw new ContractViolationError(violationEvent);
    }
    /**
     * Esegue una verifica soft senza sollevare eccezioni, utile per controlli pre-flight.
     */
    static check(schema, payload, options) {
        const contractName = options?.contractName || schema.description || "AnonymousSchema";
        const action = options?.actionOrTransition || "RUNTIME_DATA_CHECK";
        const enforceStrict = options?.strict !== false;
        const parseResult = strictSafeParse(schema, payload, enforceStrict);
        if (parseResult.success) {
            return { success: true, data: parseResult.data };
        }
        const violations = extractDiagnosticDetails(parseResult.error.issues);
        const syntheticDiagnostic = buildSyntheticDiagnostic(contractName, action, violations);
        return { success: false, violations, syntheticDiagnostic };
    }
}
//# sourceMappingURL=contract-interceptor.js.map