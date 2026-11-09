import { describe, it, expect } from "vitest";
import {
  calculateShannonEntropy,
  scanPromptForSecrets,
  scanDiffForSecrets,
  isWhitelistedPath,
} from "../src/security/secret-guard.js";
import { SecretScanResultSchema } from "../src/contracts/security.js";

describe("Dual-Tier Secret & PII Leak Prevention Gate (TCK-6.3)", () => {
  describe("Entropia di Shannon (calculateShannonEntropy)", () => {
    it("calcola entropia 0 per stringa vuota", () => {
      expect(calculateShannonEntropy("")).toBe(0);
    });

    it("calcola entropia bassa per caratteri ripetuti", () => {
      const entropy = calculateShannonEntropy("aaaaaaaaaaaaaaaaaaaaaaaa");
      expect(entropy).toBe(0);
    });

    it("calcola entropia elevata (H > 4.5) per stringhe casuali alfanumeriche complesse", () => {
      // Stringa generata casualmente con charset esteso (lettere maiuscole, minuscole, cifre, simboli)
      const secret = "aB9$zK2#mP9!xL7@wQ3%vR8^tY4*";
      const entropy = calculateShannonEntropy(secret);
      expect(entropy).toBeGreaterThan(4.2);
    });
  });

  describe("Tier 1: In-Flight Prompt Interceptor (scanPromptForSecrets)", () => {
    it("intercetta chiavi OpenAI project (sk-proj-...) in meno di 2ms", () => {
      const prompt = "Ecco il codice: const key = 'sk-proj-abcdef1234567890abcdef1234567890abcdef1234567890';";

      const start = performance.now();
      const result = scanPromptForSecrets(prompt);
      const durationMs = performance.now() - start;

      expect(durationMs).toBeLessThan(10); // abbondantemente entro i limiti di test
      expect(result.passed).toBe(false);
      expect(result.tier).toBe("tier1-prompt");
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].secretType).toBe("OPENAI_PROJECT_KEY");
      expect(result.violations[0].snippet).toContain("sk-proj");

      const parsed = SecretScanResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it("intercetta AWS Access Key e chiavi private crittografiche", () => {
      const prompt = `
        AWS_KEY=AKIAIOSFODNN7EXAMPLE
        -----BEGIN RSA PRIVATE KEY-----
        MIIEowIBAAKCAQEA0Y...
        -----END RSA PRIVATE KEY-----
      `;

      const result = scanPromptForSecrets(prompt);
      expect(result.passed).toBe(false);
      expect(result.violations.some((v) => v.secretType === "AWS_ACCESS_KEY")).toBe(true);
      expect(result.violations.some((v) => v.secretType === "PRIVATE_KEY")).toBe(true);
    });

    it("intercetta GitHub Personal Access Token (ghp_...)", () => {
      const prompt = "curl -H 'Authorization: token ghp_123456789012345678901234567890123456' https://api.github.com";
      const result = scanPromptForSecrets(prompt);
      expect(result.passed).toBe(false);
      expect(result.violations[0].secretType).toBe("GITHUB_TOKEN");
    });

    it("intercetta password in connection string di database", () => {
      const prompt = "const uri = 'postgres://admin:SuperSecretP@ssword123@db.prod.internal:5432/main';";
      const result = scanPromptForSecrets(prompt);
      expect(result.passed).toBe(false);
      expect(result.violations[0].secretType).toBe("DATABASE_URI_PASSWORD");
    });

    it("consente prompt privi di credenziali senza falsi positivi", () => {
      const prompt = "Crea una funzione di calcolo del fattoriale in TypeScript con test Vitest.";
      const result = scanPromptForSecrets(prompt);
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("ignora token esplicitamente fittizi (mock/dummy/fake/zeros)", () => {
      const prompt = "const mockKey = 'sk-proj-000000000000000000000000'; const fake = 'fake_secret_key_12345';";
      const result = scanPromptForSecrets(prompt);
      expect(result.passed).toBe(true);
    });
  });

  describe("Tier 2: Pre-Commit Shannon Entropy Guard (scanDiffForSecrets)", () => {
    it("rileva token ad alta entropia nel diff Git", () => {
      const diff = `
diff --git a/src/config.ts b/src/config.ts
--- a/src/config.ts
+++ b/src/config.ts
@@ -1,3 +1,3 @@
-export const token = "";
+export const token = "dGhpcy1pcy1hLXNlY3JldC10b2tlbi1mb3ItYXV0aC1lbnRlcnByaXNl";
      `;

      const result = scanDiffForSecrets(diff);
      expect(result.passed).toBe(false);
      expect(result.tier).toBe("tier2-precommit");
      expect(result.violations.some((v) => v.secretType === "HIGH_ENTROPY_TOKEN")).toBe(true);
      expect(result.violations[0].entropy).toBeGreaterThan(4.0);
    });

    it("bypass automatico per file all'interno di directory di test o fixture (whitelist)", () => {
      const diff = `
+export const testSecret = "dGhpcy1pcy1hLXNlY3JldC10b2tlbi1mb3ItYXV0aC1lbnRlcnByaXNl";
      `;

      // Se il filePath è all'interno di tests/, la scansione passa
      const result = scanDiffForSecrets(diff, { filePath: "tests/auth/login.test.ts" });
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("whitelist automatica per file .env.example", () => {
      const diff = `
+API_KEY=dGhpcy1pcy1hLXNlY3JldC10b2tlbi1mb3ItYXV0aC1lbnRlcnByaXNl
      `;

      const result = scanDiffForSecrets(diff, { filePath: ".env.example" });
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("non segnala come segreti gli hash esadecimali hex comuni (es. commit SHA o sha256)", () => {
      const diff = `
+export const commitHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      `;

      const result = scanDiffForSecrets(diff, { filePath: "src/version.ts" });
      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe("isWhitelistedPath Helper", () => {
    it("riconosce correttamente i percorsi di test e fixture", () => {
      expect(isWhitelistedPath("tests/core.test.ts")).toBe(true);
      expect(isWhitelistedPath("src/__tests__/unit.ts")).toBe(true);
      expect(isWhitelistedPath("fixtures/keys.json")).toBe(true);
      expect(isWhitelistedPath("src/mocks/client.mock.ts")).toBe(true);
      expect(isWhitelistedPath(".env.example")).toBe(true);
      expect(isWhitelistedPath("src/services/payment.ts")).toBe(false);
      expect(isWhitelistedPath(".env")).toBe(false);
    });
  });
});
