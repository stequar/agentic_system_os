import { z } from "zod";
import crypto from "node:crypto";
import { performance } from "node:perf_hooks";
import {
  ContractViolationEventSchema,
  DiagnosticViolationDetailSchema,
  type ContractViolationEvent,
  type DiagnosticViolationDetail,
} from "../contracts/interceptor.js";
import { CompanyEventBus } from "./event-bus.js";

/**
 * Errore sollevato dall'interceptor quando un payload viola lo schema Zod a runtime.
 */
export class ContractViolationError extends Error {
  public readonly violationEvent: ContractViolationEvent;
  public readonly syntheticDiagnostic: string;

  constructor(event: ContractViolationEvent) {
    super(`[CONTRACT_VIOLATION_FAIL_LOUDLY] in '${event.contractName}': ${event.syntheticDiagnostic}`);
    this.name = "ContractViolationError";
    this.violationEvent = event;
    this.syntheticDiagnostic = event.syntheticDiagnostic;
  }
}

export interface EnforceOptions {
  contractName?: string;
  actionOrTransition?: string;
  sourceAgent?: string;
  strict?: boolean;
  eventBus?: CompanyEventBus;
}

/**
 * Converte i problemi rilevati da Zod in una lista strutturata di violazioni diagnostiche.
 */
function extractDiagnosticDetails(issues: z.ZodIssue[]): DiagnosticViolationDetail[] {
  return issues.map((issue) => {
    const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    let expected: string | undefined;
    let received: string | undefined;

    if (issue.code === "invalid_type") {
      expected = (issue as any).expected;
      received = (issue as any).received;
    } else if (issue.code === "unrecognized_keys") {
      expected = "Nessuna chiave aggiuntiva (strict mode)";
      received = `Chiavi non autorizzate: ${(issue as any).keys?.join(", ")}`;
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
function buildSyntheticDiagnostic(
  contractName: string,
  action: string,
  violations: DiagnosticViolationDetail[]
): string {
  const details = violations
    .map((v) => `• '${v.path}': ${v.message}${v.received ? ` (ricevuto: ${v.received})` : ""}`)
    .join(" | ");
  return `Violazione contratto '${contractName}' durante '${action}'. Rilevati ${violations.length} problemi: ${details}`;
}

/**
 * Runtime Contract Interceptor:
 * Valida rigorosamente con Zod `.strict()` qualsiasi payload in transito a runtime.
 * In caso di violazione o campi allucinati, arresta l'esecuzione (Fail Loudly)
 * emettendo diagnostica sintetica ed evento di alert.
 */
export class ContractInterceptor {
  private static defaultBus?: CompanyEventBus;

  public static setDefaultEventBus(bus: CompanyEventBus): void {
    this.defaultBus = bus;
  }

  /**
   * Valida un payload a fronte di uno schema Zod. Se valido, restituisce il dato tipizzato.
   * Se non valido, solleva ContractViolationError e notifica l'EventBus.
   */
  public static enforce<T>(
    schema: z.ZodType<T>,
    payload: unknown,
    options?: EnforceOptions
  ): T {
    const contractName = options?.contractName || schema.description || "AnonymousSchema";
    const action = options?.actionOrTransition || "RUNTIME_DATA_EXCHANGE";
    const enforceStrict = options?.strict !== false;

    // Se è uno ZodObject e strict è abilitato, applica strict() per bloccare campi allucinati
    let targetSchema: z.ZodType<T> = schema;
    if (enforceStrict && schema instanceof z.ZodObject) {
      targetSchema = (schema as z.ZodObject<any>).strict() as unknown as z.ZodType<T>;
    }

    const parseResult = targetSchema.safeParse(payload);

    if (parseResult.success) {
      return parseResult.data;
    }

    // Estrazione e costruzione della diagnostica
    const violations = extractDiagnosticDetails(parseResult.error.issues);
    const syntheticDiagnostic = buildSyntheticDiagnostic(contractName, action, violations);

    const violationEvent: ContractViolationEvent = ContractViolationEventSchema.parse({
      contractName,
      actionOrTransition: action,
      violations,
      syntheticDiagnostic,
      rawPayload: payload,
      sourceAgent: options?.sourceAgent || "unknown",
      timestamp: new Date().toISOString(),
    });

    // Notifica sull'EventBus se disponibile
    const bus = options?.eventBus || this.defaultBus;
    if (bus) {
      try {
        bus.emit({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          type: "CONTRACT_VIOLATION",
          sourceAgent: options?.sourceAgent || "contract_interceptor",
          level: "error",
          payload: violationEvent,
        });
      } catch {
        // Fallback non-bloccante per l'emissione dell'evento
      }
    }

    // Fail Loudly: arresto immediato con eccezione strutturata
    throw new ContractViolationError(violationEvent);
  }

  /**
   * Esegue una verifica soft senza sollevare eccezioni, utile per controlli pre-flight.
   */
  public static check<T>(
    schema: z.ZodType<T>,
    payload: unknown,
    options?: EnforceOptions
  ): { success: true; data: T } | { success: false; violations: DiagnosticViolationDetail[]; syntheticDiagnostic: string } {
    const contractName = options?.contractName || schema.description || "AnonymousSchema";
    const action = options?.actionOrTransition || "RUNTIME_DATA_CHECK";
    const enforceStrict = options?.strict !== false;

    let targetSchema: z.ZodType<T> = schema;
    if (enforceStrict && schema instanceof z.ZodObject) {
      targetSchema = (schema as z.ZodObject<any>).strict() as unknown as z.ZodType<T>;
    }

    const parseResult = targetSchema.safeParse(payload);
    if (parseResult.success) {
      return { success: true, data: parseResult.data };
    }

    const violations = extractDiagnosticDetails(parseResult.error.issues);
    const syntheticDiagnostic = buildSyntheticDiagnostic(contractName, action, violations);
    return { success: false, violations, syntheticDiagnostic };
  }
}
