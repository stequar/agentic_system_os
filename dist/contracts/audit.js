import { z } from "zod";
import { CompanyEventSchema } from "./events.js";
export const VulnerabilitySeveritySchema = z.enum(["info", "low", "moderate", "high", "critical"]);
export const VulnerabilitySchema = z.object({
    id: z.string().describe("Identificativo advisory (es. CVE-..., GHSA-...)"),
    packageName: z.string(),
    severity: VulnerabilitySeveritySchema,
    title: z.string().optional(),
    url: z.string().optional(),
    fixedIn: z.string().optional(),
});
export const LicenseComplianceSchema = z.object({
    packageName: z.string(),
    license: z.string(),
    compliant: z.boolean(),
    reason: z.string().optional(),
});
export const DependencyAuditReportSchema = z.object({
    passed: z.boolean(),
    ecosystem: z.enum(["npm", "cargo", "python", "go", "unknown"]),
    vulnerabilities: z.array(VulnerabilitySchema).default([]),
    licenseIssues: z.array(LicenseComplianceSchema).default([]),
    totalVulnerabilities: z.number().int().nonnegative().default(0),
    highOrCriticalCount: z.number().int().nonnegative().default(0),
    offlineFallback: z.boolean().default(false),
    message: z.string(),
    scannedAt: z.string().datetime(),
});
/**
 * Singola riga di log audit notarizzata con Merkle Hash-Chaining e firma HMAC-SHA256.
 */
export const MerkleAuditEntrySchema = z.object({
    sequenceNumber: z.number().int().nonnegative().describe("Indice progressivo sequenziale a partire da 0"),
    event: CompanyEventSchema.describe("Evento aziendale autenticato"),
    previousHash: z.string().length(64).describe("Hash SHA-256 della riga precedente (o genesis hash di 64 zeri)"),
    currentHash: z.string().length(64).describe("Hash SHA-256 calcolato: H_n = SHA256(H_n-1 + canonicalJson(event))"),
    signature: z.string().describe("Firma HMAC-SHA256 generata con secret POSIX 0600"),
    timestamp: z.string().datetime(),
});
/**
 * Risultato della verifica deterministica della catena crittografica di audit.
 */
export const AuditVerificationResultSchema = z.object({
    valid: z.boolean().describe("true se la catena è integra e non manomessa"),
    totalEntries: z.number().int().nonnegative().describe("Numero totale di record verificati"),
    tamperedIndex: z.number().int().optional().describe("Indice della prima riga corrotta o manomessa, se presente"),
    reason: z.string().describe("Descrizione dettagliata dell'esito della verifica"),
    verifiedAt: z.string().datetime().default(() => new Date().toISOString()),
});
//# sourceMappingURL=audit.js.map