import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  InjectedFileResultSchema,
  type InjectedFileResult,
} from "../contracts/roles.js";

export interface AtomicWriteOptions {
  backup?: boolean; // default true
  backupExtension?: string; // default ".bak"
  encoding?: BufferEncoding; // default "utf-8"
  mode?: number;
}

/**
 * Scrive un file in modo atomico, durabile e sicuro rispettando lo standard POSIX
 * Write-Sync-Rename con supporto per backup preventivo (.bak) e idempotenza a costo zero SHA-256.
 */
export async function atomicWriteFile(
  filePath: string,
  content: string | Buffer,
  options?: AtomicWriteOptions
): Promise<InjectedFileResult> {
  const resolvedPath = path.resolve(filePath);
  const dir = path.dirname(resolvedPath);

  // a. Risolvi il path assoluto e crea la directory genitrice ricorsivamente
  await fs.mkdir(dir, { recursive: true });

  const encoding = options?.encoding ?? "utf-8";

  // b. Calcola l'hash SHA-256 del nuovo contenuto
  const hash = crypto.createHash("sha256");
  if (typeof content === "string") {
    hash.update(content, encoding);
  } else {
    hash.update(content);
  }
  const newSha256 = hash.digest("hex");

  // c. Se il file di destinazione esiste già
  let existingContent: Buffer | null = null;
  try {
    existingContent = await fs.readFile(resolvedPath);
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT"
    ) {
      existingContent = null;
    } else {
      throw err;
    }
  }

  let status: "CREATED" | "OVERWRITTEN" | "BACKED_UP_AND_OVERWRITTEN";
  let backupPath: string | undefined = undefined;

  if (existingContent !== null) {
    const existingSha256 = crypto
      .createHash("sha256")
      .update(existingContent)
      .digest("hex");

    // Idempotenza a costo zero I/O di scrittura se gli hash coincidono
    if (existingSha256 === newSha256) {
      return InjectedFileResultSchema.parse({
        path: resolvedPath,
        status: "SKIPPED_UNCHANGED",
        sha256: newSha256,
      });
    }

    if (options?.backup !== false) {
      const backupExtension = options?.backupExtension || ".bak";
      backupPath = `${resolvedPath}${backupExtension}`;
      await fs.copyFile(resolvedPath, backupPath);
      status = "BACKED_UP_AND_OVERWRITTEN";
    } else {
      status = "OVERWRITTEN";
    }
  } else {
    // d. Se il file non esiste
    status = "CREATED";
  }

  // e. Scrittura atomica POSIX: sibling temporary file nello stesso filesystem
  const tempFile = path.join(
    dir,
    `.${path.basename(resolvedPath)}.tmp.${process.pid}.${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  let fileHandle: fs.FileHandle | null = null;
  let renamed = false;

  try {
    fileHandle = await fs.open(tempFile, "w", options?.mode);
    if (typeof content === "string") {
      await fileHandle.writeFile(content, encoding);
    } else {
      await fileHandle.writeFile(content);
    }
    await fileHandle.sync();
    await fileHandle.close();
    fileHandle = null;

    await fs.rename(tempFile, resolvedPath);
    renamed = true;
  } finally {
    if (fileHandle) {
      try {
        await fileHandle.close();
      } catch {
        // Silenzia errori di chiusura nel cleanup di emergenza
      }
    }
    if (!renamed) {
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  // f. Valida il risultato con InjectedFileResultSchema e restituiscilo
  const resultPayload = {
    path: resolvedPath,
    status,
    ...(backupPath ? { backupPath } : {}),
    sha256: newSha256,
  };

  return InjectedFileResultSchema.parse(resultPayload);
}
