import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
/**
 * Calcola l'hash SHA-256 esadecimale di una stringa UTF-8 normalizzata.
 */
export function computeManagedBlockHash(payload) {
    return crypto
        .createHash("sha256")
        .update(payload.trim(), "utf-8")
        .digest("hex");
}
/**
 * Formatta un blocco sentinella gestito da Agentic Company OS.
 */
export function formatManagedSentinelBlock(sectionId, managedPayload) {
    const trimmed = managedPayload.trim();
    const hash = computeManagedBlockHash(trimmed);
    return [
        `<!-- AGENTIC-OS:MANAGED:START id="${sectionId}" sha256="${hash}" -->`,
        trimmed,
        `<!-- AGENTIC-OS:MANAGED:END id="${sectionId}" -->`,
    ].join("\n");
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
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
export function graftManagedSection(existingContent, sectionId, managedPayload, defaultDocumentBuilder) {
    const newBlock = formatManagedSentinelBlock(sectionId, managedPayload);
    const newHash = computeManagedBlockHash(managedPayload);
    if (existingContent === null || existingContent.trim().length === 0) {
        if (defaultDocumentBuilder) {
            const built = defaultDocumentBuilder().trimEnd();
            if (built.includes(`<!-- AGENTIC-OS:MANAGED:START id="${sectionId}"`)) {
                return `${built}\n`;
            }
            return `${formatManagedSentinelBlock(sectionId, built)}\n`;
        }
        return `${newBlock}\n`;
    }
    const escapedId = escapeRegExp(sectionId);
    // La `sha256` è catturata in modo permissivo (`[^"]*`): un hash manomesso/troncato/uppercase
    // non deve impedire il match del blocco esistente — altrimenti il ramo Brownfield ne
    // appenderebbe un DUPLICATO con lo stesso id a ogni esecuzione.
    const blockRegex = new RegExp(`<!-- AGENTIC-OS:MANAGED:START id="${escapedId}" sha256="([^"]*)" -->([\\s\\S]*?)<!-- AGENTIC-OS:MANAGED:END id="${escapedId}" -->`, "m");
    const match = existingContent.match(blockRegex);
    if (match) {
        const existingHash = match[1];
        const existingInner = (match[2] ?? "").trim();
        if (existingHash === newHash && existingInner === managedPayload.trim()) {
            // Idempotenza assoluta: restituisce la stringa originale intatta byte-per-byte
            return existingContent;
        }
        // Replacer FUNZIONE: evita che `$&`, `$1`, `` $` `` nel payload managed vengano
        // interpretati come pattern di sostituzione corrompendo il contenuto.
        return existingContent.replace(blockRegex, () => newBlock);
    }
    // Caso Brownfield: il file esiste ma non contiene ancora il blocco sentinella.
    // Preserviamo al 100% il contenuto utente. Per `agents-governance`, innestiamo il blocco
    // in cima (Top-of-File) così che l'Agente Primario legga subito l'identità CTO L1 e le 4 CFFs!
    const preserved = existingContent.trimEnd();
    if (sectionId === "agents-governance") {
        return `${newBlock}\n\n---\n\n${preserved}\n`;
    }
    return `${preserved}\n\n---\n\n${newBlock}\n`;
}
/**
 * Scansiona ricorsivamente `docs/wiki` nel workspace target e restituisce tutti i file
 * documentali o schema (`.md`, `.sql`) presenti su disco.
 */
export async function discoverAllWikiFiles(targetPath) {
    const wikiRoot = path.resolve(targetPath, "docs", "wiki");
    const claudeWikiRoot = path.resolve(targetPath, ".claude", "wiki");
    const results = [];
    async function walk(currentDir) {
        let entries;
        try {
            entries = await fs.readdir(currentDir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (entry.name.startsWith("."))
                continue;
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                await walk(fullPath);
            }
            else if (entry.isFile()) {
                if (entry.name.endsWith(".bak") || entry.name === "INDEX.md")
                    continue;
                if (entry.name.endsWith(".md") || entry.name.endsWith(".sql")) {
                    const rel = path
                        .relative(path.resolve(targetPath), fullPath)
                        .split(path.sep)
                        .join("/");
                    results.push(rel);
                }
            }
        }
    }
    await walk(wikiRoot);
    await walk(claudeWikiRoot);
    return results.sort();
}
/**
 * Individua tutti i file presenti in `docs/wiki/**` che non sono ancora referenziati
 * nel contenuto corrente di `docs/wiki/INDEX.md` (prevenzione della Dark Memory).
 */
export async function discoverUnindexedWikiFiles(targetPath, currentIndexContent = "") {
    const allWikiFiles = await discoverAllWikiFiles(targetPath);
    return allWikiFiles.filter((relPath) => {
        const fileName = path.basename(relPath);
        return (!currentIndexContent.includes(relPath) &&
            !currentIndexContent.includes(fileName));
    });
}
//# sourceMappingURL=smart-merge.js.map