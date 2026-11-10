import { type PluginManifest } from "../contracts/plugins.js";
/**
 * Carica e valida il manifest di un plugin dato il percorso del file manifest
 * o della directory del plugin (cercando plugin.json o manifest.json).
 */
export declare function loadPluginManifest(manifestPathOrDir: string): Promise<PluginManifest>;
/**
 * Scansiona una directory alla ricerca di plugin ed effettua il caricamento
 * di tutti i plugin con manifest valido.
 */
export declare function loadPluginsFromDirectory(dirPath: string): Promise<PluginManifest[]>;
//# sourceMappingURL=loader.d.ts.map