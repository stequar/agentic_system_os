import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { attachWorkspace } from "../src/attach/injector.js";
import { AttachResultSchema } from "../src/contracts/roles.js";

describe("Workspace Attach Module (attachWorkspace)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agentic-attach-test-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("esegue attach completo su directory temporanea creando tutti i 6 file e validando AttachResultSchema", async () => {
    // Creiamo un package.json per dare un minimo di contesto al detector
    await fs.writeFile(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "sample-project", scripts: { test: "vitest" } }),
      "utf-8"
    );

    const result = await attachWorkspace(tempDir);

    expect(result.success).toBe(true);
    expect(AttachResultSchema.safeParse(result).success).toBe(true);
    expect(result.injectedFiles).toHaveLength(6);

    const expectedRelativePaths = [
      "AGENTS.md",
      ".agents/skills/run-company/SKILL.md",
      "docs/wiki/INDEX.md",
      "docs/wiki/product/roadmap.md",
      "docs/wiki/product/backlog.md",
      "docs/wiki/engineering/architecture.md",
    ];

    for (const relPath of expectedRelativePaths) {
      const fullPath = path.join(tempDir, relPath);
      const injected = result.injectedFiles.find((f) => f.path === fullPath);
      expect(injected).toBeDefined();
      expect(injected?.status).toBe("CREATED");

      const stats = await fs.stat(fullPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    }

    // Verifica contenuti chiave
    const agentsContent = await fs.readFile(path.join(tempDir, "AGENTS.md"), "utf-8");
    expect(agentsContent).toContain("# AGENTS.md — Agentic Company Organization & Roles");
    expect(agentsContent).toContain("Karpathy Context as RAM");

    const skillContent = await fs.readFile(
      path.join(tempDir, ".agents/skills/run-company/SKILL.md"),
      "utf-8"
    );
    expect(skillContent).toContain("Run Company Skill");
    expect(skillContent).toContain("L1 CTO");
    expect(skillContent).toContain("Deterministic Gatekeeper");

    const indexContent = await fs.readFile(path.join(tempDir, "docs/wiki/INDEX.md"), "utf-8");
    expect(indexContent).toContain("Knowledge Base — Master Index");
    expect(indexContent).toContain("docs/wiki/product/roadmap.md");
    expect(indexContent).toContain("docs/wiki/engineering/architecture.md");

    const archContent = await fs.readFile(
      path.join(tempDir, "docs/wiki/engineering/architecture.md"),
      "utf-8"
    );
    expect(archContent).toContain("System Architecture & Technical Specifications");
    expect(archContent).toContain("Comandi di Validazione & Test Determinante");
  });

  it("garantisce idempotenza a costo zero: la seconda esecuzione consecutiva contrassegna tutti i file come SKIPPED_UNCHANGED", async () => {
    // Prima esecuzione (creazione)
    const firstResult = await attachWorkspace(tempDir);
    expect(firstResult.injectedFiles.every((f) => f.status === "CREATED")).toBe(true);

    // Seconda esecuzione immediata
    const secondResult = await attachWorkspace(tempDir);
    expect(secondResult.success).toBe(true);
    expect(secondResult.injectedFiles).toHaveLength(6);
    expect(secondResult.injectedFiles.every((f) => f.status === "SKIPPED_UNCHANGED")).toBe(true);
    expect(secondResult.summary).toContain("6 skipped unchanged");

    // Verifica che nessun file di backup sia stato generato
    for (const file of secondResult.injectedFiles) {
      expect(file.backupPath).toBeUndefined();
      const bakExists = await fs
        .access(`${file.path}.bak`)
        .then(() => true)
        .catch(() => false);
      expect(bakExists).toBe(false);
    }
  });

  it("gestisce dryRun: true senza creare alcun file sul filesystem ma determinando status CREATED", async () => {
    const dryRunResult = await attachWorkspace(tempDir, { dryRun: true });

    expect(dryRunResult.success).toBe(true);
    expect(dryRunResult.injectedFiles).toHaveLength(6);
    expect(dryRunResult.injectedFiles.every((f) => f.status === "CREATED")).toBe(true);
    expect(dryRunResult.summary).toContain("[DRY RUN]");

    // Nessun file deve essere stato creato su disco
    const dirEntries = await fs.readdir(tempDir);
    expect(dirEntries).toEqual([]);

    const agentsPath = path.join(tempDir, "AGENTS.md");
    await expect(fs.stat(agentsPath)).rejects.toThrow();
  });

  it("effettua backup preventivo (.bak) e aggiorna lo status a BACKED_UP_AND_OVERWRITTEN se un file preesistente viene modificato", async () => {
    // Prima esecuzione: crea tutti i file
    await attachWorkspace(tempDir);

    // Modifica intenzionalmente AGENTS.md con contenuto personalizzato
    const agentsPath = path.join(tempDir, "AGENTS.md");
    const customContent = "# Contenuto Personalizzato Pre-Esistente in AGENTS.md\n";
    await fs.writeFile(agentsPath, customContent, "utf-8");

    // Seconda esecuzione
    const overwriteResult = await attachWorkspace(tempDir);
    expect(overwriteResult.success).toBe(true);

    // AGENTS.md deve essere BACKED_UP_AND_OVERWRITTEN
    const agentsResult = overwriteResult.injectedFiles.find((f) => f.path === agentsPath);
    expect(agentsResult).toBeDefined();
    expect(agentsResult?.status).toBe("BACKED_UP_AND_OVERWRITTEN");
    expect(agentsResult?.backupPath).toBe(`${agentsPath}.bak`);

    // Il backup deve contenere il vecchio contenuto custom
    const backupContent = await fs.readFile(`${agentsPath}.bak`, "utf-8");
    expect(backupContent).toBe(customContent);

    // Il file originale deve contenere il nuovo contenuto generato
    const newContent = await fs.readFile(agentsPath, "utf-8");
    expect(newContent).toContain("# AGENTS.md — Agentic Company Organization & Roles");

    // Gli altri 5 file non toccati devono rimanere SKIPPED_UNCHANGED
    const otherFiles = overwriteResult.injectedFiles.filter((f) => f.path !== agentsPath);
    expect(otherFiles.every((f) => f.status === "SKIPPED_UNCHANGED")).toBe(true);
  });

  it("fallisce loudly con eccezione attesa se la directory di destinazione non esiste o non è valida", async () => {
    const nonExistentPath = path.join(tempDir, "cartella-inesistente-xyz-123");
    await expect(attachWorkspace(nonExistentPath)).rejects.toThrow(
      "Directory does not exist or cannot be accessed"
    );

    // Se si specifica un file anziché una directory
    const filePath = path.join(tempDir, "simple-file.txt");
    await fs.writeFile(filePath, "test", "utf-8");
    await expect(attachWorkspace(filePath)).rejects.toThrow(
      "Directory does not exist or cannot be accessed"
    );
  });
});
