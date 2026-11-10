import { z } from "zod";
export declare const VulnerabilitySeveritySchema: z.ZodEnum<["info", "low", "moderate", "high", "critical"]>;
export type VulnerabilitySeverity = z.infer<typeof VulnerabilitySeveritySchema>;
export declare const VulnerabilitySchema: z.ZodObject<{
    id: z.ZodString;
    packageName: z.ZodString;
    severity: z.ZodEnum<["info", "low", "moderate", "high", "critical"]>;
    title: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    fixedIn: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    severity: "info" | "critical" | "low" | "moderate" | "high";
    packageName: string;
    title?: string | undefined;
    url?: string | undefined;
    fixedIn?: string | undefined;
}, {
    id: string;
    severity: "info" | "critical" | "low" | "moderate" | "high";
    packageName: string;
    title?: string | undefined;
    url?: string | undefined;
    fixedIn?: string | undefined;
}>;
export type Vulnerability = z.infer<typeof VulnerabilitySchema>;
export declare const LicenseComplianceSchema: z.ZodObject<{
    packageName: z.ZodString;
    license: z.ZodString;
    compliant: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    packageName: string;
    license: string;
    compliant: boolean;
    reason?: string | undefined;
}, {
    packageName: string;
    license: string;
    compliant: boolean;
    reason?: string | undefined;
}>;
export type LicenseCompliance = z.infer<typeof LicenseComplianceSchema>;
export declare const DependencyAuditReportSchema: z.ZodObject<{
    passed: z.ZodBoolean;
    ecosystem: z.ZodEnum<["npm", "cargo", "python", "go", "unknown"]>;
    vulnerabilities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        packageName: z.ZodString;
        severity: z.ZodEnum<["info", "low", "moderate", "high", "critical"]>;
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        fixedIn: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        severity: "info" | "critical" | "low" | "moderate" | "high";
        packageName: string;
        title?: string | undefined;
        url?: string | undefined;
        fixedIn?: string | undefined;
    }, {
        id: string;
        severity: "info" | "critical" | "low" | "moderate" | "high";
        packageName: string;
        title?: string | undefined;
        url?: string | undefined;
        fixedIn?: string | undefined;
    }>, "many">>;
    licenseIssues: z.ZodDefault<z.ZodArray<z.ZodObject<{
        packageName: z.ZodString;
        license: z.ZodString;
        compliant: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        packageName: string;
        license: string;
        compliant: boolean;
        reason?: string | undefined;
    }, {
        packageName: string;
        license: string;
        compliant: boolean;
        reason?: string | undefined;
    }>, "many">>;
    totalVulnerabilities: z.ZodDefault<z.ZodNumber>;
    highOrCriticalCount: z.ZodDefault<z.ZodNumber>;
    offlineFallback: z.ZodDefault<z.ZodBoolean>;
    message: z.ZodString;
    scannedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    passed: boolean;
    ecosystem: "unknown" | "npm" | "python" | "go" | "cargo";
    vulnerabilities: {
        id: string;
        severity: "info" | "critical" | "low" | "moderate" | "high";
        packageName: string;
        title?: string | undefined;
        url?: string | undefined;
        fixedIn?: string | undefined;
    }[];
    licenseIssues: {
        packageName: string;
        license: string;
        compliant: boolean;
        reason?: string | undefined;
    }[];
    totalVulnerabilities: number;
    highOrCriticalCount: number;
    offlineFallback: boolean;
    scannedAt: string;
}, {
    message: string;
    passed: boolean;
    ecosystem: "unknown" | "npm" | "python" | "go" | "cargo";
    scannedAt: string;
    vulnerabilities?: {
        id: string;
        severity: "info" | "critical" | "low" | "moderate" | "high";
        packageName: string;
        title?: string | undefined;
        url?: string | undefined;
        fixedIn?: string | undefined;
    }[] | undefined;
    licenseIssues?: {
        packageName: string;
        license: string;
        compliant: boolean;
        reason?: string | undefined;
    }[] | undefined;
    totalVulnerabilities?: number | undefined;
    highOrCriticalCount?: number | undefined;
    offlineFallback?: boolean | undefined;
}>;
export type DependencyAuditReport = z.infer<typeof DependencyAuditReportSchema>;
/**
 * Singola riga di log audit notarizzata con Merkle Hash-Chaining e firma HMAC-SHA256.
 */
export declare const MerkleAuditEntrySchema: z.ZodObject<{
    sequenceNumber: z.ZodNumber;
    event: z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        type: z.ZodUnion<[z.ZodEnum<["SESSION_STARTED", "SESSION_RESUMED", "TASK_STARTED", "TASK_COMPLETED", "TASK_FAILED", "GATEKEEPER_TRIGGERED", "GATEKEEPER_PASSED", "GATEKEEPER_FAILED", "SELF_HEALING_ITERATION", "DIFF_GUARD_VIOLATION", "ROLLBACK_EXECUTED", "SECURITY_ALERT", "CHECKPOINT_SAVED", "DEPENDENCY_AUDIT_RESULT", "TICKET_STATUS_CHANGED", "CONTRACT_VIOLATION", "METRICS_CALCULATED", "CONTEXT_HEALTH_ALERT", "FINOPS_ALERT", "BUDGET_WARNING", "BUDGET_EXCEEDED", "CEREMONY_STARTED", "CEREMONY_CONCLUDED", "WAR_ROOM_TRIGGERED", "WAR_ROOM_RESOLVED", "CONSENSUS_REACHED", "TIE_BREAK_INVOKED"]>, z.ZodString]>;
        sourceAgent: z.ZodString;
        level: z.ZodDefault<z.ZodEnum<["info", "warn", "error", "critical"]>>;
        payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        sessionId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        level: "info" | "warn" | "error" | "critical";
        payload: Record<string, any>;
        sessionId?: string | undefined;
    }, {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        level?: "info" | "warn" | "error" | "critical" | undefined;
        payload?: Record<string, any> | undefined;
        sessionId?: string | undefined;
    }>;
    previousHash: z.ZodString;
    currentHash: z.ZodString;
    signature: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    sequenceNumber: number;
    signature: string;
    event: {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        level: "info" | "warn" | "error" | "critical";
        payload: Record<string, any>;
        sessionId?: string | undefined;
    };
    previousHash: string;
    currentHash: string;
}, {
    timestamp: string;
    sequenceNumber: number;
    signature: string;
    event: {
        type: string;
        sourceAgent: string;
        timestamp: string;
        id: string;
        level?: "info" | "warn" | "error" | "critical" | undefined;
        payload?: Record<string, any> | undefined;
        sessionId?: string | undefined;
    };
    previousHash: string;
    currentHash: string;
}>;
export type MerkleAuditEntry = z.infer<typeof MerkleAuditEntrySchema>;
/**
 * Risultato della verifica deterministica della catena crittografica di audit.
 */
export declare const AuditVerificationResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    totalEntries: z.ZodNumber;
    tamperedIndex: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodString;
    verifiedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    verifiedAt: string;
    reason: string;
    totalEntries: number;
    tamperedIndex?: number | undefined;
}, {
    valid: boolean;
    reason: string;
    totalEntries: number;
    verifiedAt?: string | undefined;
    tamperedIndex?: number | undefined;
}>;
export type AuditVerificationResult = z.infer<typeof AuditVerificationResultSchema>;
//# sourceMappingURL=audit.d.ts.map