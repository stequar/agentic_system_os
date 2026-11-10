import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { atomicWriteFile } from "../src/utils/fs-atomic.js";
import { InjectedFileResultSchema } from "../src/contracts/roles.js";

describe("Safe FS Atomic Module (atomicWriteFile)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agentic-fs-atomic-test-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("Scenario 1: Creazione nuovo file (CREATED, verifica contenuto e sha256)", async () => {
    const targetFile = path.join(tempDir, "test-create.txt");
    const content = "Hello Agentic World!\nDeterministic Atomic Write.";
    const expectedSha256 = crypto.createHash("sha256").update(content, "utf-8").digest("hex");

    const result = await atomicWriteFile(targetFile, content);

    // Verifica schema e contenuto del risultato
    expect(InjectedFileResultSchema.safeParse(result).success).toBe(true);
    expect(result.status).toBe("CREATED");
    expect(result.path).toBe(path.resolve(targetFile));
    expect(result.sha256).toBe(expectedSha256);
    expect(result.backupPath).toBeUndefined();

    // Verifica file fisico su disco
    const writtenContent = await fs.readFile(targetFile, "utf-8");
    expect(writtenContent).toBe(content);
  });

  it("Scenario 2: Idempotenza a costo zero I/O (SKIPPED_UNCHANGED senza alterare mtime né inode)", async () => {
    const targetFile = path.join(tempDir, "test-idempotent.txt");
    const content = "Identical content for idempotency test.";

    const firstResult = await atomicWriteFile(targetFile, content);
    expect(firstResult.status).toBe("CREATED");

    const initialStat = await fs.stat(targetFile);

    // Attesa breve per rilevare differenze di mtime se venisse riscritto
    await new Promise((resolve) => setTimeout(resolve, 50));

    const secondResult = await atomicWriteFile(targetFile, content);

    expect(secondResult.status).toBe("SKIPPED_UNCHANGED");
    expect(secondResult.sha256).toBe(firstResult.sha256);
    expect(secondResult.path).toBe(path.resolve(targetFile));
    expect(secondResult.backupPath).toBeUndefined();

    const postStat = await fs.stat(targetFile);
    expect(postStat.mtimeMs).toBe(initialStat.mtimeMs);
    expect(postStat.ino).toBe(initialStat.ino);
  });

  it("Scenario 3: Sovrascrittura con backup abilitato di default (BACKED_UP_AND_OVERWRITTEN)", async () => {
    const targetFile = path.join(tempDir, "test-backup-default.txt");
    const v1Content = "Version 1.0.0 — Legacy configuration";
    const v2Content = "Version 2.0.0 — Modernized configuration";

    const v1Result = await atomicWriteFile(targetFile, v1Content);
    expect(v1Result.status).toBe("CREATED");

    const v2Result = await atomicWriteFile(targetFile, v2Content);

    expect(v2Result.status).toBe("BACKED_UP_AND_OVERWRITTEN");
    expect(v2Result.backupPath).toBe(`${path.resolve(targetFile)}.bak`);
    expect(v2Result.sha256).toBe(
      crypto.createHash("sha256").update(v2Content, "utf-8").digest("hex")
    );

    // Verifica che il target principale contenga la v2
    const targetOnDisk = await fs.readFile(targetFile, "utf-8");
    expect(targetOnDisk).toBe(v2Content);

    // Verifica che il backup .bak contenga la v1
    const backupOnDisk = await fs.readFile(v2Result.backupPath!, "utf-8");
    expect(backupOnDisk).toBe(v1Content);
  });

  it("Scenario 4: Sovrascrittura con backupExtension personalizzata", async () => {
    const targetFile = path.join(tempDir, "test-custom-ext.md");
    const v1Content = "# Initial Documentation";
    const v2Content = "# Updated Documentation v2";

    await atomicWriteFile(targetFile, v1Content);

    const result = await atomicWriteFile(targetFile, v2Content, {
      backup: true,
      backupExtension: ".old.backup",
    });

    expect(result.status).toBe("BACKED_UP_AND_OVERWRITTEN");
    expect(result.backupPath).toBe(`${path.resolve(targetFile)}.old.backup`);

    const backupContent = await fs.readFile(result.backupPath!, "utf-8");
    expect(backupContent).toBe(v1Content);

    const mainContent = await fs.readFile(targetFile, "utf-8");
    expect(mainContent).toBe(v2Content);
  });

  it("Scenario 5: Sovrascrittura con backup disabilitato (backup: false -> OVERWRITTEN)", async () => {
    const targetFile = path.join(tempDir, "test-no-backup.json");
    const v1Content = '{"version": 1}';
    const v2Content = '{"version": 2}';

    await atomicWriteFile(targetFile, v1Content);

    const result = await atomicWriteFile(targetFile, v2Content, { backup: false });

    expect(result.status).toBe("OVERWRITTEN");
    expect(result.backupPath).toBeUndefined();

    const mainContent = await fs.readFile(targetFile, "utf-8");
    expect(mainContent).toBe(v2Content);

    // Verifica assenza di file .bak
    const backupExists = await fs
      .access(`${targetFile}.bak`)
      .then(() => true)
      .catch(() => false);
    expect(backupExists).toBe(false);
  });

  it("Scenario 6: Gestione input binario come Buffer (scrittura, idempotenza e backup)", async () => {
    const targetFile = path.join(tempDir, "binary-asset.bin");
    const binData1 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const binData2 = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

    const res1 = await atomicWriteFile(targetFile, binData1);
    expect(res1.status).toBe("CREATED");
    expect(res1.sha256).toBe(crypto.createHash("sha256").update(binData1).digest("hex"));

    const onDisk1 = await fs.readFile(targetFile);
    expect(onDisk1.equals(binData1)).toBe(true);

    // Idempotenza con Buffer
    const resIdempotent = await atomicWriteFile(targetFile, binData1);
    expect(resIdempotent.status).toBe("SKIPPED_UNCHANGED");

    // Sovrascrittura binaria con backup
    const res2 = await atomicWriteFile(targetFile, binData2, { backup: true });
    expect(res2.status).toBe("BACKED_UP_AND_OVERWRITTEN");

    const onDisk2 = await fs.readFile(targetFile);
    expect(onDisk2.equals(binData2)).toBe(true);

    const onDiskBackup = await fs.readFile(res2.backupPath!);
    expect(onDiskBackup.equals(binData1)).toBe(true);
  });

  it("Scenario 7: Creazione automatica di cartelle intermedie annidate", async () => {
    const nestedFile = path.join(
      tempDir,
      "nested",
      "level1",
      "level2",
      "deeply",
      "nested",
      "config.yaml"
    );
    const content = "version: '3.8'\nservices:\n  app:\n    image: node:20";

    const result = await atomicWriteFile(nestedFile, content);

    expect(result.status).toBe("CREATED");
    const readBack = await fs.readFile(nestedFile, "utf-8");
    expect(readBack).toBe(content);
  });

  it("Scenario 8: Pulizia del file temporaneo sibling in caso di errore prima del rename", async () => {
    const targetFile = path.join(tempDir, "crash-test.txt");
    const content = "Payload that will trigger error";

    // Spia su fs.rename per simulare un errore imprevisto di I/O (es. crash o permessi)
    const renameSpy = vi.spyOn(fs, "rename").mockRejectedValueOnce(new Error("Simulated I/O rename error"));

    await expect(atomicWriteFile(targetFile, content)).rejects.toThrow("Simulated I/O rename error");

    // Verifica che nessun file temporaneo sibling sia rimasto orfano nella directory
    const dirEntries = await fs.readdir(tempDir);
    const orphanTmpFiles = dirEntries.filter(
      (entry) => entry.startsWith(".crash-test.txt.tmp.")
    );

    expect(orphanTmpFiles).toEqual([]);

    // Verifica che il target non sia stato creato
    const targetExists = await fs
      .access(targetFile)
      .then(() => true)
      .catch(() => false);
    expect(targetExists).toBe(false);

    expect(renameSpy).toHaveBeenCalledTimes(1);
  });

  it("Scenario 9: Gestione permessi specifici tramite options.mode", async () => {
    // Non applicabile a Windows, ma valido su macOS e Linux (POSIX)
    if (process.platform === "win32") {
      return;
    }

    const targetFile = path.join(tempDir, "secret-key.pem");
    const content = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----";

    const result = await atomicWriteFile(targetFile, content, { mode: 0o600 });
    expect(result.status).toBe("CREATED");

    const stat = await fs.stat(targetFile);
    // Verifica permessi 0o600 (rw-------)
    expect(stat.mode & 0o777).toBe(0o600);
  });
});
