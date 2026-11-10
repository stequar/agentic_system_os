import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { CompanyEventSchema, } from "../contracts/events.js";
import { MerkleAuditEntrySchema, AuditVerificationResultSchema, } from "../contracts/audit.js";
export const GENESIS_HASH = "0".repeat(64);
/**
 * Serializza un oggetto JSON in formato canonico deterministico
 * ordinando ricorsivamente le chiavi alfabeticamente.
 */
export function canonicalJsonStringify(obj) {
    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return `[${obj.map((item) => canonicalJsonStringify(item === undefined ? null : item)).join(",")}]`;
    }
    const sortedKeys = Object.keys(obj)
        .filter((key) => obj[key] !== undefined && typeof obj[key] !== "function" && typeof obj[key] !== "symbol")
        .sort();
    const keyVals = sortedKeys.map((key) => `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`);
    return `{${keyVals.join(",")}}`;
}
/**
 * AuditLogger: gestisce la notarizzazione crittografica e la persistenza append-only
 * immutabile degli eventi aziendali su `.company-os/audit.jsonl` con Merkle Hash-Chaining e firma HMAC.
 */
export class AuditLogger {
    targetPath;
    unsubscribeFromBus;
    cachedSecret;
    lastHash = GENESIS_HASH;
    lastSequenceNumber = -1;
    constructor(targetPath) {
        this.targetPath = path.resolve(targetPath);
    }
    getAuditLogPath() {
        return path.join(this.targetPath, ".company-os", "audit.jsonl");
    }
    getSecretPath() {
        return path.join(this.targetPath, ".company-os", ".audit.secret");
    }
    /**
     * Ottiene o genera la chiave segreta per la firma HMAC-SHA256,
     * salvata su disco con permessi POSIX 0600.
     */
    async getOrCreateSecret() {
        if (this.cachedSecret) {
            return this.cachedSecret;
        }
        const secretPath = this.getSecretPath();
        const dir = path.dirname(secretPath);
        await fs.mkdir(dir, { recursive: true });
        try {
            const existing = await fs.readFile(secretPath, "utf-8");
            if (existing.trim().length > 0) {
                this.cachedSecret = existing.trim();
                return this.cachedSecret;
            }
        }
        catch {
            // Secret non esistente, verrà generato
        }
        const newSecret = crypto.randomBytes(32).toString("hex");
        await fs.writeFile(secretPath, newSecret, { mode: 0o600, encoding: "utf-8" });
        await fs.chmod(secretPath, 0o600).catch(() => { });
        this.cachedSecret = newSecret;
        return newSecret;
    }
    /**
     * Connette il logger a un'istanza di CompanyEventBus per registrare automaticamente tutti gli eventi.
     */
    attach(bus) {
        if (this.unsubscribeFromBus) {
            this.unsubscribeFromBus();
        }
        this.unsubscribeFromBus = bus.subscribe("*", async (event) => {
            await this.logEvent(event);
        });
    }
    /**
     * Disconnette il logger dal bus eventi.
     */
    detach() {
        if (this.unsubscribeFromBus) {
            this.unsubscribeFromBus();
            this.unsubscribeFromBus = undefined;
        }
    }
    /**
     * Inizializza l'ultimo stato noto della catena leggendo la coda del file di audit.
     */
    async syncChainState() {
        if (this.lastSequenceNumber >= 0) {
            return;
        }
        const logPath = this.getAuditLogPath();
        try {
            const content = await fs.readFile(logPath, "utf-8");
            const lines = content.split("\n").filter((l) => l.trim().length > 0);
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                const parsed = JSON.parse(lastLine);
                if (parsed.currentHash && typeof parsed.sequenceNumber === "number") {
                    this.lastHash = parsed.currentHash;
                    this.lastSequenceNumber = parsed.sequenceNumber;
                    return;
                }
            }
        }
        catch {
            // File non ancora esistente
        }
        this.lastHash = GENESIS_HASH;
        this.lastSequenceNumber = -1;
    }
    /**
     * Registra un evento in coda ad audit.jsonl con Merkle Hash-Chaining e firma HMAC-SHA256.
     */
    async logEvent(event) {
        const validatedEvent = CompanyEventSchema.parse(event);
        const secret = await this.getOrCreateSecret();
        await this.syncChainState();
        const sequenceNumber = this.lastSequenceNumber + 1;
        const previousHash = this.lastHash;
        const canonicalEvent = canonicalJsonStringify(validatedEvent);
        const currentHash = crypto
            .createHash("sha256")
            .update(previousHash + canonicalEvent)
            .digest("hex");
        const signature = crypto
            .createHmac("sha256", secret)
            .update(currentHash)
            .digest("hex");
        const entry = MerkleAuditEntrySchema.parse({
            sequenceNumber,
            event: validatedEvent,
            previousHash,
            currentHash,
            signature,
            timestamp: new Date().toISOString(),
        });
        const logPath = this.getAuditLogPath();
        const dir = path.dirname(logPath);
        await fs.mkdir(dir, { recursive: true });
        const line = JSON.stringify(entry) + "\n";
        await fs.appendFile(logPath, line, "utf-8");
        this.lastHash = currentHash;
        this.lastSequenceNumber = sequenceNumber;
        return entry;
    }
    /**
     * Legge gli eventi registrati nel file audit.jsonl.
     */
    async readAuditLog(limit) {
        const logPath = this.getAuditLogPath();
        try {
            const content = await fs.readFile(logPath, "utf-8");
            const lines = content.split("\n").filter((l) => l.trim().length > 0);
            const events = [];
            for (const line of lines) {
                try {
                    const raw = JSON.parse(line);
                    if (raw.event) {
                        events.push(CompanyEventSchema.parse(raw.event));
                    }
                    else {
                        const parsed = CompanyEventSchema.safeParse(raw);
                        if (parsed.success) {
                            events.push(parsed.data);
                        }
                    }
                }
                catch {
                    // Ignora righe corrotte
                }
            }
            if (limit && limit > 0) {
                return events.slice(-limit);
            }
            return events;
        }
        catch {
            return [];
        }
    }
    /**
     * Legge tutte le entry Merkle grezze dal file audit.jsonl.
     */
    async readMerkleEntries() {
        const logPath = this.getAuditLogPath();
        try {
            const content = await fs.readFile(logPath, "utf-8");
            const lines = content.split("\n").filter((l) => l.trim().length > 0);
            const entries = [];
            for (const line of lines) {
                try {
                    entries.push(MerkleAuditEntrySchema.parse(JSON.parse(line)));
                }
                catch { }
            }
            return entries;
        }
        catch {
            return [];
        }
    }
    /**
     * Verifica deterministica dell'integrità crittografica dell'intera catena di audit.
     * Rileva manomissioni, alterazioni di eventi, inversioni o troncature di righe.
     */
    async verifyAuditChain(customLogPath, customSecret) {
        const logPath = customLogPath || this.getAuditLogPath();
        const secret = customSecret || (await this.getOrCreateSecret());
        let content;
        try {
            content = await fs.readFile(logPath, "utf-8");
        }
        catch {
            return AuditVerificationResultSchema.parse({
                valid: true,
                totalEntries: 0,
                reason: "File di audit non presente: catena vuota considerata integra.",
                verifiedAt: new Date().toISOString(),
            });
        }
        const lines = content.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length === 0) {
            return AuditVerificationResultSchema.parse({
                valid: true,
                totalEntries: 0,
                reason: "File di audit vuoto: catena integra.",
                verifiedAt: new Date().toISOString(),
            });
        }
        let expectedPrevHash = GENESIS_HASH;
        for (let i = 0; i < lines.length; i++) {
            let entry;
            try {
                entry = MerkleAuditEntrySchema.parse(JSON.parse(lines[i]));
            }
            catch (err) {
                return AuditVerificationResultSchema.parse({
                    valid: false,
                    totalEntries: lines.length,
                    tamperedIndex: i,
                    reason: `Riga ${i} non conforme a MerkleAuditEntrySchema o JSON corrotto: ${err.message || String(err)}`,
                    verifiedAt: new Date().toISOString(),
                });
            }
            // 1. Verifica del numero di sequenza
            if (entry.sequenceNumber !== i) {
                return AuditVerificationResultSchema.parse({
                    valid: false,
                    totalEntries: lines.length,
                    tamperedIndex: i,
                    reason: `Discontinuità di sequenza alla riga ${i}: atteso ${i}, ricevuto ${entry.sequenceNumber}`,
                    verifiedAt: new Date().toISOString(),
                });
            }
            // 2. Verifica del previousHash rispetto all'hash precedente
            if (entry.previousHash !== expectedPrevHash) {
                return AuditVerificationResultSchema.parse({
                    valid: false,
                    totalEntries: lines.length,
                    tamperedIndex: i,
                    reason: `Manomissione catena alla riga ${i}: previousHash '${entry.previousHash}' non corrisponde all'hash precedente atteso '${expectedPrevHash}'`,
                    verifiedAt: new Date().toISOString(),
                });
            }
            // 3. Ricalcolo dell'hash SHA-256 della riga
            const canonicalEvent = canonicalJsonStringify(entry.event);
            const computedHash = crypto
                .createHash("sha256")
                .update(expectedPrevHash + canonicalEvent)
                .digest("hex");
            if (computedHash !== entry.currentHash) {
                return AuditVerificationResultSchema.parse({
                    valid: false,
                    totalEntries: lines.length,
                    tamperedIndex: i,
                    reason: `Hash SHA-256 manomesso alla riga ${i}: atteso '${computedHash}', trovato '${entry.currentHash}'`,
                    verifiedAt: new Date().toISOString(),
                });
            }
            // 4. Verifica della firma HMAC-SHA256 con secret
            const computedSignature = crypto
                .createHmac("sha256", secret)
                .update(computedHash)
                .digest("hex");
            if (computedSignature !== entry.signature) {
                return AuditVerificationResultSchema.parse({
                    valid: false,
                    totalEntries: lines.length,
                    tamperedIndex: i,
                    reason: `Firma HMAC non valida alla riga ${i}: possibile manomissione o secret alterato`,
                    verifiedAt: new Date().toISOString(),
                });
            }
            expectedPrevHash = entry.currentHash;
        }
        return AuditVerificationResultSchema.parse({
            valid: true,
            totalEntries: lines.length,
            reason: `Catena Merkle di ${lines.length} eventi verificata con successo: integra e non manomessa.`,
            verifiedAt: new Date().toISOString(),
        });
    }
}
//# sourceMappingURL=audit-logger.js.map