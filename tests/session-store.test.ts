import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { SessionStore } from "../src/core/session-store.js";
import { SessionSnapshotSchema } from "../src/contracts/session.js";

describe("Deterministic State Checkpoint & Session Resume Engine (TCK-6.1)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "session-store-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("crea e persiste atomicamente uno snapshot di sessione conforme a Zod", async () => {
    const session = await SessionStore.createSession(tempDir, {
      sessionId: "test-sess-1",
      currentFsmState: "ANALYZING_STACK",
      activeTicketId: "TCK-1.0",
    });

    expect(session.sessionId).toBe("test-sess-1");
    expect(session.status).toBe("COMMITTED_SAFEPOINT");
    expect(session.currentFsmState).toBe("ANALYZING_STACK");
    expect(session.activeTicketId).toBe("TCK-1.0");

    // Verifica persistenza su file system
    const filePath = path.join(tempDir, ".company-os", "sessions", "test-sess-1.json");
    const exists = await fs.stat(filePath).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = SessionSnapshotSchema.safeParse(JSON.parse(raw));
    expect(parsed.success).toBe(true);
  });

  it("gestisce il Two-Phase Commit (DIRTY_IN_PROGRESS -> COMMITTED_SAFEPOINT)", async () => {
    await SessionStore.createSession(tempDir, {
      sessionId: "test-2pc",
      status: "COMMITTED_SAFEPOINT",
    });

    // 1. Inizio task: transizione a DIRTY_IN_PROGRESS
    const dirty = await SessionStore.markDirtyInProgress(tempDir, "test-2pc", "TCK-6.1");
    expect(dirty.status).toBe("DIRTY_IN_PROGRESS");
    expect(dirty.activeTicketId).toBe("TCK-6.1");

    // Verifica su disco
    const loadedDirty = await SessionStore.loadSession(tempDir, "test-2pc");
    expect(loadedDirty?.status).toBe("DIRTY_IN_PROGRESS");

    // 2. Fine task con successo: promozione a COMMITTED_SAFEPOINT
    const committed = await SessionStore.commitSafepoint(tempDir, "test-2pc", {
      commitSha: "abcdef1234567890abcdef1234567890abcdef12",
      activeTicketId: undefined,
    });
    expect(committed.status).toBe("COMMITTED_SAFEPOINT");
    expect(committed.gitCommitSha).toBe("abcdef1234567890abcdef1234567890abcdef12");

    const loadedCommitted = await SessionStore.loadSession(tempDir, "test-2pc");
    expect(loadedCommitted?.status).toBe("COMMITTED_SAFEPOINT");
  });

  it("carica l'ultima sessione modificata se sessionId non viene specificato", async () => {
    await SessionStore.createSession(tempDir, { sessionId: "sess-early", currentFsmState: "EARLY" });
    // Piccolo delay per garantire timestamp differente
    await new Promise((r) => setTimeout(r, 10));
    await SessionStore.createSession(tempDir, { sessionId: "sess-late", currentFsmState: "LATE" });

    const latest = await SessionStore.loadSession(tempDir);
    expect(latest).not.toBeNull();
    expect(latest?.sessionId).toBe("sess-late");
    expect(latest?.currentFsmState).toBe("LATE");
  });

  it("resumeSession ripristina con RESUMED_CLEAN se l'ultimo stato è COMMITTED_SAFEPOINT", async () => {
    await SessionStore.createSession(tempDir, {
      sessionId: "clean-session",
      status: "COMMITTED_SAFEPOINT",
      currentFsmState: "READY_FOR_NEXT_TASK",
    });

    const resumeResult = await SessionStore.resumeSession(tempDir, "clean-session");
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.actionTaken).toBe("RESUMED_CLEAN");
    expect(resumeResult.restoredFromStatus).toBe("COMMITTED_SAFEPOINT");
    expect(resumeResult.message).toContain("safepoint coerente");
  });

  it("resumeSession ripristina con ROLLED_BACK_AND_RESUMED se lo stato era DIRTY_IN_PROGRESS", async () => {
    await SessionStore.createSession(tempDir, {
      sessionId: "unclean-session",
      status: "DIRTY_IN_PROGRESS",
      currentFsmState: "APPLYING_PATCH",
      activeTicketId: "TCK-CRASHED",
    });

    const resumeResult = await SessionStore.resumeSession(tempDir, "unclean-session");
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.actionTaken).toBe("ROLLED_BACK_AND_RESUMED");
    expect(resumeResult.restoredFromStatus).toBe("DIRTY_IN_PROGRESS");

    // Verifica che dopo il resume lo stato sia tornato a COMMITTED_SAFEPOINT
    const sessionPostResume = await SessionStore.loadSession(tempDir, "unclean-session");
    expect(sessionPostResume?.status).toBe("COMMITTED_SAFEPOINT");
  });

  it("resumeSession restituisce ALREADY_COMPLETED se la sessione era già terminata", async () => {
    const session = await SessionStore.createSession(tempDir, {
      sessionId: "finished-session",
      status: "COMPLETED",
    });

    const result = await SessionStore.resumeSession(tempDir, session.sessionId);
    expect(result.success).toBe(true);
    expect(result.actionTaken).toBe("ALREADY_COMPLETED");
  });

  it("resumeSession gestisce con errore controllato la richiesta per una sessione inesistente", async () => {
    const result = await SessionStore.resumeSession(tempDir, "non-existent-session");
    expect(result.success).toBe(false);
    expect(result.actionTaken).toBe("FAILED");
  });
});
