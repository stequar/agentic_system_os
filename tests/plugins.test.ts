import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { loadPluginManifest, loadPluginsFromDirectory } from "../src/plugins/loader.js";
import { runPluginInSandbox } from "../src/plugins/runner.js";
import type { PluginManifest } from "../src/contracts/plugins.js";

describe("Modular Plugin Architecture & Worker Sandbox (TCK-4.2)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "plugin-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup best effort
    }
  });

  describe("Plugin Loader & Manifest Validation", () => {
    it("carica e valida correttamente un manifest di plugin valido", async () => {
      const manifestData = {
        id: "custom-detector",
        name: "Custom Stack Detector",
        version: "1.0.0",
        type: "detector",
        description: "Rileva stack personalizzati per framework proprietari",
        entrypoint: "index.js",
        config: { strict: true },
      };

      const manifestPath = path.join(tempDir, "plugin.json");
      await fs.writeFile(manifestPath, JSON.stringify(manifestData));

      const loaded = await loadPluginManifest(manifestPath);
      expect(loaded.id).toBe("custom-detector");
      expect(loaded.name).toBe("Custom Stack Detector");
      expect(loaded.type).toBe("detector");
      expect(loaded.version).toBe("1.0.0");
      expect(loaded.config).toEqual({ strict: true });
    });

    it("carica il manifest passando la directory contenente plugin.json", async () => {
      const manifestData = {
        id: "linter-gatekeeper",
        name: "Security Gatekeeper",
        version: "2.1.0",
        type: "gatekeeper",
        description: "Gatekeeper per scansione vulnerabilità della supply chain",
        entrypoint: "gate.js",
      };

      await fs.writeFile(path.join(tempDir, "manifest.json"), JSON.stringify(manifestData));

      const loaded = await loadPluginManifest(tempDir);
      expect(loaded.id).toBe("linter-gatekeeper");
      expect(loaded.type).toBe("gatekeeper");
    });

    it("rifiuta un manifest con ID non valido (caratteri non ammessi o maiuscole)", async () => {
      const invalidData = {
        id: "INVALID_ID!",
        name: "Bad Plugin",
        version: "1.0.0",
        type: "tool",
        description: "Descrizione sufficientemente lunga per passare il min check",
        entrypoint: "index.js",
      };

      const manifestPath = path.join(tempDir, "plugin.json");
      await fs.writeFile(manifestPath, JSON.stringify(invalidData));

      await expect(loadPluginManifest(manifestPath)).rejects.toThrow(/Validazione manifest fallita/);
    });

    it("rifiuta un manifest con versione non conforme a SemVer", async () => {
      const invalidData = {
        id: "bad-semver",
        name: "Bad Semver Plugin",
        version: "beta-1",
        type: "role",
        description: "Descrizione sufficientemente lunga per passare il check",
        entrypoint: "index.js",
      };

      const manifestPath = path.join(tempDir, "plugin.json");
      await fs.writeFile(manifestPath, JSON.stringify(invalidData));

      await expect(loadPluginManifest(manifestPath)).rejects.toThrow(/SemVer/);
    });

    it("scansiona una cartella con loadPluginsFromDirectory caricando solo i plugin validi", async () => {
      // Subdir 1: valida
      const plugin1Dir = path.join(tempDir, "plugin-one");
      await fs.mkdir(plugin1Dir, { recursive: true });
      await fs.writeFile(
        path.join(plugin1Dir, "plugin.json"),
        JSON.stringify({
          id: "plugin-one",
          name: "Plugin One",
          version: "1.0.0",
          type: "tool",
          description: "Strumento di utilità numero uno per agenti",
          entrypoint: "index.js",
        })
      );

      // Subdir 2: invalida
      const plugin2Dir = path.join(tempDir, "invalid-plugin");
      await fs.mkdir(plugin2Dir, { recursive: true });
      await fs.writeFile(path.join(plugin2Dir, "plugin.json"), "invalid json");

      const plugins = await loadPluginsFromDirectory(tempDir);
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe("plugin-one");
    });
  });

  describe("Sandboxed Plugin Runner (Worker Threads)", () => {
    it("esegue con successo un plugin valido e restituisce i dati elaborati", async () => {
      const scriptContent = `
        export default async function({ payload, config }) {
          return {
            processed: true,
            sum: payload.a + payload.b,
            message: "Calcolato con successo dal worker thread sandbox"
          };
        }
      `;
      const scriptPath = path.join(tempDir, "calc.js");
      await fs.writeFile(scriptPath, scriptContent);

      const manifest: PluginManifest = {
        id: "calc-tool",
        name: "Calculator Plugin",
        version: "1.0.0",
        type: "tool",
        description: "Strumento di calcolo sandboxed",
        entrypoint: "calc.js",
        config: {},
      };

      const result = await runPluginInSandbox(
        manifest,
        {
          pluginId: "calc-tool",
          type: "tool",
          payload: { a: 15, b: 27 },
          timeoutMs: 2000,
        },
        tempDir
      );

      expect(result.success).toBe(true);
      expect(result.pluginId).toBe("calc-tool");
      expect(result.data).toEqual({
        processed: true,
        sum: 42,
        message: "Calcolato con successo dal worker thread sandbox",
      });
      expect(result.executionDurationMs).toBeGreaterThanOrEqual(0);
    });

    it("termina forzatamente con worker.terminate() un plugin con loop infinito al timeout specificato", async () => {
      const hangingScript = `
        export default async function() {
          // Loop infinito per verificare l'hard timeout
          while (true) {}
        }
      `;
      const scriptPath = path.join(tempDir, "hang.js");
      await fs.writeFile(scriptPath, hangingScript);

      const manifest: PluginManifest = {
        id: "hanging-plugin",
        name: "Hanging Plugin",
        version: "1.0.0",
        type: "tool",
        description: "Plugin difettoso per test di sicurezza timeout",
        entrypoint: "hang.js",
        config: {},
      };

      const result = await runPluginInSandbox(
        manifest,
        {
          pluginId: "hanging-plugin",
          type: "tool",
          payload: {},
          timeoutMs: 300, // Timeout breve di 300ms per il test
        },
        tempDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("timed out after 300ms");
    });

    it("gestisce correttamente le eccezioni sollevate all'interno del plugin", async () => {
      const failingScript = `
        export default async function() {
          throw new Error("Errore critico simulato nel codice del plugin");
        }
      `;
      const scriptPath = path.join(tempDir, "failing.js");
      await fs.writeFile(scriptPath, failingScript);

      const manifest: PluginManifest = {
        id: "failing-plugin",
        name: "Failing Plugin",
        version: "1.0.0",
        type: "gatekeeper",
        description: "Plugin che fallisce con eccezione esplicita",
        entrypoint: "failing.js",
        config: {},
      };

      const result = await runPluginInSandbox(
        manifest,
        {
          pluginId: "failing-plugin",
          type: "gatekeeper",
          payload: {},
          timeoutMs: 2000,
        },
        tempDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Errore critico simulato nel codice del plugin");
    });

    it("restituisce un errore immediato se il file entrypoint non esiste", async () => {
      const manifest: PluginManifest = {
        id: "missing-entrypoint",
        name: "Missing Entrypoint Plugin",
        version: "1.0.0",
        type: "detector",
        description: "Plugin con percorso inesistente",
        entrypoint: "non_existent.js",
        config: {},
      };

      const result = await runPluginInSandbox(
        manifest,
        {
          pluginId: "missing-entrypoint",
          type: "detector",
          payload: {},
          timeoutMs: 2000,
        },
        tempDir
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("non trovato");
    });
  });
});
