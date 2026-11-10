import { type InjectedFileResult } from "../contracts/roles.js";
export interface AtomicWriteOptions {
    backup?: boolean;
    backupExtension?: string;
    encoding?: BufferEncoding;
    mode?: number;
}
/**
 * Scrive un file in modo atomico, durabile e sicuro rispettando lo standard POSIX
 * Write-Sync-Rename con supporto per backup preventivo (.bak) e idempotenza a costo zero SHA-256.
 */
export declare function atomicWriteFile(filePath: string, content: string | Buffer, options?: AtomicWriteOptions): Promise<InjectedFileResult>;
//# sourceMappingURL=fs-atomic.d.ts.map