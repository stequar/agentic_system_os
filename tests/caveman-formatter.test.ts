import { describe, it, expect } from "vitest";
import { CavemanFormatter } from "../src/core/caveman-formatter.js";

describe("CavemanFormatter & Zero-Fluff Enforcer (TCK-15.1)", () => {
  it("rimuove i convenevoli e preamboli conversazionali (stripFluff)", () => {
    const verboseText = `
Certamente! Ecco il codice:
\`\`\`typescript
export const a = 1;
\`\`\`
Spero che questo aiuti! Resto a disposizione.
    `.trim();

    const result = CavemanFormatter.stripFluff(verboseText);
    expect(result.removedFluffCount).toBeGreaterThanOrEqual(1);
    expect(result.cleanedText).toContain("export const a = 1;");
    expect(result.cleanedText).not.toContain("Certamente!");
    expect(result.cleanedText).not.toContain("Spero che questo aiuti");
  });

  it("serializza e deserializza messaggi telegrafici Caveman-RPC", () => {
    const msg = CavemanFormatter.createMessage({
      senderRole: "backend_manager",
      recipientRole: "leaf_developer",
      actionCode: "EXEC_AST_PATCH",
      targetFiles: ["src/core/auth.ts"],
      constraints: ["NO_TEST_DELETIONS", "STRICT_TYPES"],
      payload: {
        errorId: "TS2322",
        expectedType: "string",
      },
    });

    expect(msg.zeroFluff).toBe(true);

    const formatted = CavemanFormatter.format(msg);
    expect(formatted).toContain("[CAVEMAN-RPC]");
    expect(formatted).toContain("FROM: backend_manager");
    expect(formatted).toContain("TO: leaf_developer");
    expect(formatted).toContain("ACTION: EXEC_AST_PATCH");
    expect(formatted).toContain("[END-CAVEMAN-RPC]");

    const parsed = CavemanFormatter.parse(formatted);
    expect(parsed.senderRole).toBe("backend_manager");
    expect(parsed.recipientRole).toBe("leaf_developer");
    expect(parsed.actionCode).toBe("EXEC_AST_PATCH");
    expect(parsed.targetFiles).toEqual(["src/core/auth.ts"]);
    expect(parsed.constraints).toEqual(["NO_TEST_DELETIONS", "STRICT_TYPES"]);
    expect(parsed.payload.errorId).toBe("TS2322");
  });

  it("preserva integralmente blocchi di codice, path, comandi e hash crittografici", () => {
    const original = `
Certamente! Ecco l'aggiornamento per src/utils/crypto.ts.
Abbiamo verificato l'hash SHA256: 3b9c4d8e7a1f5b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c.
Esegui:
\`\`\`bash
npm test tests/crypto.test.ts
\`\`\`
    `.trim();

    const telegraphic = `
[CAVEMAN-RPC]
FROM: qa_lead
TO: leaf_developer
ACTION: VERIFY_CRYPTO
TARGETS: ["src/utils/crypto.ts", "tests/crypto.test.ts"]
HASH: 3b9c4d8e7a1f5b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c
\`\`\`bash
npm test tests/crypto.test.ts
\`\`\`
    `.trim();

    const check = CavemanFormatter.verifyPreservation(original, telegraphic);
    expect(check.preserved).toBe(true);
    expect(check.missingArtifacts).toHaveLength(0);
  });

  it("rileva violazione di preservazione se un file o blocco di codice viene omesso", () => {
    const original = `
Modifica src/core/engine.ts e src/core/security.ts.
\`\`\`typescript
const secret = "preserved";
\`\`\`
    `.trim();

    const truncated = `
Modifica solo src/core/engine.ts.
    `.trim();

    const check = CavemanFormatter.verifyPreservation(original, truncated);
    expect(check.preserved).toBe(false);
    expect(check.missingArtifacts.length).toBeGreaterThanOrEqual(1);
  });

  it("calcola accuratamente i token risparmiati e la percentuale di fluff eliminata", () => {
    const verbose = "A".repeat(400); // ~100 token
    const compressed = "A".repeat(80); // ~20 token

    const savings = CavemanFormatter.calculateSavings(verbose, compressed);
    expect(savings.originalTokens).toBe(100);
    expect(savings.compressedTokens).toBe(20);
    expect(savings.savingsTokens).toBe(80);
    expect(savings.savingsRatioPercent).toBe(80);
  });
});
