import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {
  AuditLogger,
  canonicalJsonStringify,
  GENESIS_HASH,
} from "../src/core/audit-logger.js";
import { MerkleAuditEntrySchema } from "../src/contracts/audit.js";
import { CompanyEventSchema } from "../src/contracts/events.js";

describe("Cryptographic Handoff Notarization & Merkle Audit Trail", () => {
  let tempDir: string;
  let logger: AuditLogger;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audit-merkle-test-"));
    logger = new AuditLogger(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("canonicalJsonStringify produce un output deterministico indipendente dall'ordine delle chiavi", () => {
    const objA = { z: 1, a: 2, m: { y: "hello", x: "world" } };
    const objB = { a: 2, z: 1, m: { x: "world", y: "hello" } };

    const strA = canonicalJsonStringify(objA);
    const strB = canonicalJsonStringify(objB);

    expect(strA).toBe(strB);
    expect(strA).toBe('{"a":2,"m":{"x":"world","y":"hello"},"z":1}');
  });

  it("getOrCreateSecret genera una chiave HMAC a permessi POSIX 0600", async () => {
    const secret = await logger.getOrCreateSecret();
    expect(secret.length).toBe(64); // 32 bytes hex = 64 chars

    const secretPath = logger.getSecretPath();
    const stat = await fs.stat(secretPath);
    // In POSIX, mode & 0o777 deve essere 0o600
    expect((stat.mode & 0o777)).toBe(0o600);

    // Una seconda chiamata restituisce lo stesso secret
    const secret2 = await logger.getOrCreateSecret();
    expect(secret2).toBe(secret);
  });

  it("logEvent incatena crittograficamente le entry a partire dal genesis hash", async () => {
    const event1 = CompanyEventSchema.parse({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_STARTED",
      sourceAgent: "cto",
      payload: { ticketId: "TCK-9.2" },
    });

    const entry1 = await logger.logEvent(event1);
    expect(entry1.sequenceNumber).toBe(0);
    expect(entry1.previousHash).toBe(GENESIS_HASH);
    expect(entry1.currentHash.length).toBe(64);
    expect(entry1.signature.length).toBe(64);

    const event2 = CompanyEventSchema.parse({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "TASK_COMPLETED",
      sourceAgent: "leaf-dev-1",
      payload: { ticketId: "TCK-9.2" },
    });

    const entry2 = await logger.logEvent(event2);
    expect(entry2.sequenceNumber).toBe(1);
    expect(entry2.previousHash).toBe(entry1.currentHash);
  });

  it("verifyAuditChain certifica l'integrità di una catena non manomessa", async () => {
    for (let i = 0; i < 5; i++) {
      await logger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: `EVENT_STEP_${i}`,
        sourceAgent: "test_runner",
        payload: { step: i },
      });
    }

    const verification = await logger.verifyAuditChain();
    expect(verification.valid).toBe(true);
    expect(verification.totalEntries).toBe(5);
    expect(verification.tamperedIndex).toBeUndefined();
    expect(verification.reason).toContain("integra e non manomessa");
  });

  it("verifyAuditChain rileva la manomissione se un evento viene alterato nel log", async () => {
    for (let i = 0; i < 4; i++) {
      await logger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: `EVENT_${i}`,
        sourceAgent: "test_agent",
        payload: { data: i },
      });
    }

    // Manomettiamo la riga 2 di audit.jsonl
    const logPath = logger.getAuditLogPath();
    const content = await fs.readFile(logPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);

    const tamperedEntry = JSON.parse(lines[2]);
    tamperedEntry.event.payload.data = 9999; // payload alterato
    lines[2] = JSON.stringify(tamperedEntry);

    await fs.writeFile(logPath, lines.join("\n") + "\n", "utf-8");

    const result = await logger.verifyAuditChain();
    expect(result.valid).toBe(false);
    expect(result.tamperedIndex).toBe(2);
    expect(result.reason).toContain("Hash SHA-256 manomesso");
  });

  it("verifyAuditChain rileva la cancellazione o salto di una riga nella catena", async () => {
    for (let i = 0; i < 4; i++) {
      await logger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: `EVENT_${i}`,
        sourceAgent: "test_agent",
        payload: { val: i },
      });
    }

    // Cancelliamo la riga 1 (lasciando 0, 2, 3)
    const logPath = logger.getAuditLogPath();
    const content = await fs.readFile(logPath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    lines.splice(1, 1);

    await fs.writeFile(logPath, lines.join("\n") + "\n", "utf-8");

    const result = await logger.verifyAuditChain();
    expect(result.valid).toBe(false);
    expect(result.tamperedIndex).toBe(1);
    expect(result.reason).toContain("Discontinuità di sequenza");
  });

  it("verifyAuditChain valida correttamente una catena vuota", async () => {
    const result = await logger.verifyAuditChain();
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(0);
  });
});
