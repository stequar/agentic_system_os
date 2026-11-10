/**
 * Calcola l'hash SHA-256 esadecimale di una stringa UTF-8 normalizzata.
 */
export declare function computeManagedBlockHash(payload: string): string;
/**
 * Formatta un blocco sentinella gestito da Agentic Company OS.
 */
export declare function formatManagedSentinelBlock(sectionId: string, managedPayload: string): string;
/**
 * Innestatore non distruttivo basato su Hybrid AST Section Grafting & Managed Sentinel Blocks (`TCK-17.5.1`).
 *
 * - Se `existingContent === null`: genera il documento completo con il blocco managed.
 * - Se `existingContent` contiene già il blocco `sectionId`:
 *   * se l'hash `sha256` corrisponde, restituisce `existingContent` invariato (100% idempotenza `SKIPPED_UNCHANGED`).
 *   * altrimenti aggiorna in-place solo il contenuto del blocco managed preservando tutto l'esterno.
 * - Se `existingContent` esiste (progetto Brownfield) e non ha ancora il blocco `sectionId`:
 *   preserva integralmente il 100% del contenuto preesistente ed innesta il blocco managed
 *   (in cima per `agents-governance` così che la Persona CTO L1 sia sempre Top-of-File, o in coda per gli altri documenti).
 */
export declare function graftManagedSection(existingContent: string | null, sectionId: string, managedPayload: string, defaultDocumentBuilder?: () => string): string;
/**
 * Scansiona ricorsivamente `docs/wiki` nel workspace target e restituisce tutti i file
 * documentali o schema (`.md`, `.sql`) presenti su disco.
 */
export declare function discoverAllWikiFiles(targetPath: string): Promise<string[]>;
/**
 * Individua tutti i file presenti in `docs/wiki/**` che non sono ancora referenziati
 * nel contenuto corrente di `docs/wiki/INDEX.md` (prevenzione della Dark Memory).
 */
export declare function discoverUnindexedWikiFiles(targetPath: string, currentIndexContent?: string): Promise<string[]>;
//# sourceMappingURL=smart-merge.d.ts.map