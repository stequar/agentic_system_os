import fs from "node:fs/promises";
import path from "node:path";
import {
  PluginManifestSchema,
  type PluginManifest,
} from "../contracts/plugins.js";

/**
 * Carica e valida il manifest di un plugin dato il percorso del file manifest
 * o della directory del plugin (cercando plugin.json o manifest.json).
 */
export async function loadPluginManifest(manifestPathOrDir: string): Promise<PluginManifest> {
  const resolvedPath = path.resolve(manifestPathOrDir);
  let manifestFilePath = resolvedPath;

  try {
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      const candidates = ["plugin.json", "manifest.json"];
      let found = false;
      for (const candidate of candidates) {
        const candidatePath = path.join(resolvedPath, candidate);
        try {
          const cStat = await fs.stat(candidatePath);
          if (cStat.isFile()) {
            manifestFilePath = candidatePath;
            found = true;
            break;
          }
        } catch {
          // Continua con il prossimo candidato
        }
      }

      if (!found) {
        throw new Error(`Nessun file manifest valido (plugin.json o manifest.json) trovato in ${resolvedPath}`);
      }
    }
  } catch (err: any) {
    if (err.code === "ENOENT") {
      throw new Error(`Percorso non trovato: ${resolvedPath}`);
    }
    throw err;
  }

  const rawContent = await fs.readFile(manifestFilePath, "utf-8");
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch (err: any) {
    throw new Error(`Manifest JSON non valido in ${manifestFilePath}: ${err.message}`);
  }

  const parseResult = PluginManifestSchema.safeParse(parsedJson);
  if (!parseResult.success) {
    const issues = parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Validazione manifest fallita per ${manifestFilePath}: ${issues}`);
  }

  return parseResult.data;
}

/**
 * Scansiona una directory alla ricerca di plugin ed effettua il caricamento
 * di tutti i plugin con manifest valido.
 */
export async function loadPluginsFromDirectory(dirPath: string): Promise<PluginManifest[]> {
  const resolvedDir = path.resolve(dirPath);
  const plugins: PluginManifest[] = [];

  let entries;
  try {
    entries = await fs.readdir(resolvedDir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDirPath = path.join(resolvedDir, entry.name);
      try {
        const manifest = await loadPluginManifest(subDirPath);
        plugins.push(manifest);
      } catch {
        // Ignora directory senza manifest valido
      }
    } else if (entry.isFile() && (entry.name === "plugin.json" || entry.name.endsWith(".plugin.json"))) {
      try {
        const manifest = await loadPluginManifest(path.join(resolvedDir, entry.name));
        plugins.push(manifest);
      } catch {
        // Ignora file manifest invalidi
      }
    }
  }

  return plugins;
}
