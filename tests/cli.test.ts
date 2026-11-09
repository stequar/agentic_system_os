import { describe, it, expect } from "vitest";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { AttachResultSchema } from "../src/contracts/roles.js";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const indexFile = path.join(rootDir, "src", "index.ts");

describe("CLI Command: inspect", () => {
  it("esegue inspect con output formattato (human readable)", async () => {
    const { stdout, stderr } = await execAsync(`npx tsx "${indexFile}" inspect .`, {
      cwd: rootDir,
    });

    expect(stderr).toBe("");
    expect(stdout).toContain("🔍 AGENTIC COMPANY OS — Project Inspector Report");
    expect(stdout).toContain("Percorso analizzato:");
    expect(stdout).toContain("Linguaggi:");
    expect(stdout).toContain("typescript");
    expect(stdout).toContain("Supporto Docker:");
    expect(stdout).toContain("Package Managers:");
    expect(stdout).toContain("Comandi Test raccomandati:");
    expect(stdout).toContain("Entry Points:");
    expect(stdout).toContain("Timestamp rilevamento:");
  });

  it("esegue inspect con opzione --json restituendo JSON valido", async () => {
    const { stdout, stderr } = await execAsync(`npx tsx "${indexFile}" inspect . --json`, {
      cwd: rootDir,
    });

    expect(stderr).toBe("");
    const parsed = JSON.parse(stdout);
    expect(parsed).toHaveProperty("targetPath");
    expect(parsed).toHaveProperty("languages");
    expect(parsed.languages).toContain("typescript");
    expect(parsed).toHaveProperty("hasDocker");
    expect(parsed).toHaveProperty("packageManagers");
    expect(parsed).toHaveProperty("testCommands");
    expect(parsed).toHaveProperty("entryPoints");
    expect(parsed).toHaveProperty("detectedAt");
  });

  it("gestisce directory non valida uscendo con codice di errore", async () => {
    try {
      await execAsync(`npx tsx "${indexFile}" inspect ./percorso-inesistente-xyz`, {
        cwd: rootDir,
      });
      expect.unreachable("Il comando avrebbe dovuto fallire con exit code 1");
    } catch (error: any) {
      expect(error.code).toBe(1);
      const combinedOutput = (error.stdout || "") + (error.stderr || "");
      expect(combinedOutput).toContain("Errore durante l'ispezione:");
    }
  });
});

describe("CLI Command: attach", () => {
  it("esegue attach con output formattato Chalk (human readable)", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cli-attach-live-"));
    try {
      const { stdout, stderr } = await execAsync(`npx tsx "${indexFile}" attach "${tempDir}"`, {
        cwd: rootDir,
      });

      expect(stderr).toBe("");
      expect(stdout).toContain("🏢 AGENTIC COMPANY OS — Workspace Attach");
      expect(stdout).toContain("Target Path:");
      expect(stdout).toContain("Modalità:");
      expect(stdout).toContain("Live");
      expect(stdout).toContain("Stack Rilevato:");
      expect(stdout).toContain("Ruoli Generati:");
      expect(stdout).toContain("File Iniettati:");
      expect(stdout).toContain("CREATED");
      expect(stdout).toContain("Summary:");
      expect(stdout).toContain("Attach completed: 6 files processed (6 created");

      // Verifica che i file siano effettivamente creati su disco
      const agentsExists = await fs.stat(path.join(tempDir, "AGENTS.md")).then(() => true).catch(() => false);
      expect(agentsExists).toBe(true);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it("esegue attach con opzione --json restituendo un JSON conforme ad AttachResultSchema", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cli-attach-json-"));
    try {
      const { stdout, stderr } = await execAsync(
        `npx tsx "${indexFile}" attach "${tempDir}" --json`,
        { cwd: rootDir }
      );

      expect(stderr).toBe("");
      const parsed = JSON.parse(stdout);
      const validation = AttachResultSchema.safeParse(parsed);
      expect(validation.success).toBe(true);
      expect(parsed.targetPath).toBe(path.resolve(tempDir));
      expect(parsed.success).toBe(true);
      expect(parsed.injectedFiles).toHaveLength(6);
      expect(parsed.injectedFiles.every((f: any) => f.status === "CREATED")).toBe(true);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it("esegue attach con opzione --dry-run simulando l'operazione senza creare file su disco", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cli-attach-dry-"));
    try {
      const { stdout, stderr } = await execAsync(
        `npx tsx "${indexFile}" attach "${tempDir}" --dry-run`,
        { cwd: rootDir }
      );

      expect(stderr).toBe("");
      expect(stdout).toContain("🏢 AGENTIC COMPANY OS — Workspace Attach");
      expect(stdout).toContain("Dry Run (Simulazione)");
      expect(stdout).toContain("CREATED");
      expect(stdout).toContain("[DRY RUN]");

      // Nessun file deve essere stato creato sul filesystem
      const entries = await fs.readdir(tempDir);
      expect(entries).toEqual([]);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it("gestisce directory inesistente uscendo con codice di errore 1", async () => {
    try {
      await execAsync(`npx tsx "${indexFile}" attach ./percorso-inesistente-xyz-cli`, {
        cwd: rootDir,
      });
      expect.unreachable("Il comando avrebbe dovuto fallire con exit code 1");
    } catch (error: any) {
      expect(error.code).toBe(1);
      const combinedOutput = (error.stdout || "") + (error.stderr || "");
      expect(combinedOutput).toContain("Errore durante l'operazione di attach:");
      expect(combinedOutput).toContain("Directory does not exist or cannot be accessed");
    }
  });
});
