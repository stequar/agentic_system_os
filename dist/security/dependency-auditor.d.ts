import { type DependencyAuditReport, type Vulnerability } from "../contracts/audit.js";
export interface DependencyAuditOptions {
    timeoutMs?: number;
    strictAudit?: boolean;
    allowedLicenses?: string[];
    mockRunner?: (cmd: string) => Promise<{
        stdout: string;
        stderr: string;
        exitCode: number;
    }>;
}
/**
 * Parser per output JSON di npm audit
 */
export declare function parseNpmAuditJson(rawJson: string): Vulnerability[];
/**
 * Esegue l'auditing sistematico delle dipendenze di terze parti e la conformità delle licenze.
 */
export declare function auditDependencies(targetPath: string, options?: DependencyAuditOptions): Promise<DependencyAuditReport>;
//# sourceMappingURL=dependency-auditor.d.ts.map