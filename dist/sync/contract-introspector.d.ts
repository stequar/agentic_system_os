import { type SemanticDriftReport } from "../contracts/brownfield.js";
import { type CrossDomainContract } from "../contracts/sync.js";
export interface IntrospectAndDetectDriftOptions {
    persistContractsJson?: boolean;
    dryRun?: boolean;
}
/**
 * Scansiona i modelli Python (`schemas.py`), Swift (`*.swift`) e SQL (`*.sql`) nel repository target,
 * rileva i disallineamenti semantici (`TYPE_MISMATCH`, `NAMING_ASYMMETRY`, `MISSING_CODING_KEYS`, `MISSING_FIELD`)
 * e salva `.company-os/contracts.json` (se `!dryRun`).
 */
export declare function introspectAndDetectDrift(targetPath: string, options?: IntrospectAndDetectDriftOptions): Promise<SemanticDriftReport>;
/**
 * Carica `.company-os/contracts.json` dal workspace target o ne genera uno predefinito.
 */
export declare function loadOrCreateDeclarativeContract(targetPath: string, dryRun?: boolean): Promise<CrossDomainContract>;
//# sourceMappingURL=contract-introspector.d.ts.map