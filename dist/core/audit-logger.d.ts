import { type CompanyEvent } from "../contracts/events.js";
import { type MerkleAuditEntry, type AuditVerificationResult } from "../contracts/audit.js";
import type { CompanyEventBus } from "./event-bus.js";
export declare const GENESIS_HASH: string;
/**
 * Serializza un oggetto JSON in formato canonico deterministico
 * ordinando ricorsivamente le chiavi alfabeticamente.
 */
export declare function canonicalJsonStringify(obj: any): string;
/**
 * AuditLogger: gestisce la notarizzazione crittografica e la persistenza append-only
 * immutabile degli eventi aziendali su `.company-os/audit.jsonl` con Merkle Hash-Chaining e firma HMAC.
 */
export declare class AuditLogger {
    private targetPath;
    private unsubscribeFromBus?;
    private cachedSecret?;
    private lastHash;
    private lastSequenceNumber;
    constructor(targetPath: string);
    getAuditLogPath(): string;
    getSecretPath(): string;
    /**
     * Ottiene o genera la chiave segreta per la firma HMAC-SHA256,
     * salvata su disco con permessi POSIX 0600.
     */
    getOrCreateSecret(): Promise<string>;
    /**
     * Connette il logger a un'istanza di CompanyEventBus per registrare automaticamente tutti gli eventi.
     */
    attach(bus: CompanyEventBus): void;
    /**
     * Disconnette il logger dal bus eventi.
     */
    detach(): void;
    /**
     * Inizializza l'ultimo stato noto della catena leggendo la coda del file di audit.
     */
    private syncChainState;
    /**
     * Registra un evento in coda ad audit.jsonl con Merkle Hash-Chaining e firma HMAC-SHA256.
     */
    logEvent(event: CompanyEvent): Promise<MerkleAuditEntry>;
    /**
     * Legge gli eventi registrati nel file audit.jsonl.
     */
    readAuditLog(limit?: number): Promise<CompanyEvent[]>;
    /**
     * Legge tutte le entry Merkle grezze dal file audit.jsonl.
     */
    readMerkleEntries(): Promise<MerkleAuditEntry[]>;
    /**
     * Verifica deterministica dell'integrità crittografica dell'intera catena di audit.
     * Rileva manomissioni, alterazioni di eventi, inversioni o troncature di righe.
     */
    verifyAuditChain(customLogPath?: string, customSecret?: string): Promise<AuditVerificationResult>;
}
//# sourceMappingURL=audit-logger.d.ts.map