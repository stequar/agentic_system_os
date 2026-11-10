import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  parseNpmAuditJson,
  auditDependencies,
} from "../src/security/dependency-auditor.js";
import { DependencyAuditReportSchema } from "../src/contracts/audit.js";

describe("Dependency Vulnerability & License Compliance Auditor (TCK-6.4)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "dependency-audit-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  describe("parseNpmAuditJson", () => {
    it("effettua il parsing corretto del formato npm v7+ (vulnerabilities object)", () => {
      const npmAuditJson = JSON.stringify({
        vulnerabilities: {
          lodash: {
            name: "lodash",
            severity: "high",
            via: [
              {
                source: 1084,
                name: "lodash",
                dependency: "lodash",
                title: "Prototype Pollution in lodash",
                url: "https://github.com/advisories/GHSA-p6mc-m468-83gw",
                severity: "high",
                range: "<4.17.21",
              },
            ],
            fixAvailable: true,
          },
          minimist: {
            name: "minimist",
            severity: "critical",
            via: [
              {
                title: "Prototype Pollution in minimist",
                url: "https://github.com/advisories/GHSA-vh95-rmgr-6w4m",
                severity: "critical",
              },
            ],
            fixAvailable: true,
          },
        },
      });

      const vulns = parseNpmAuditJson(npmAuditJson);
      expect(vulns).toHaveLength(2);
      expect(vulns[0].packageName).toBe("lodash");
      expect(vulns[0].severity).toBe("high");
      expect(vulns[0].title).toContain("Prototype Pollution");
      expect(vulns[1].packageName).toBe("minimist");
      expect(vulns[1].severity).toBe("critical");
    });

    it("effettua il parsing del formato legacy npm v6 (advisories)", () => {
      const legacyJson = JSON.stringify({
        advisories: {
          "123": {
            id: 123,
            cve: "CVE-2021-12345",
            module_name: "axios",
            severity: "moderate",
            title: "SSRF in axios",
            url: "https://npmjs.com/advisories/123",
            patched_versions: ">=0.21.2",
          },
        },
      });

      const vulns = parseNpmAuditJson(legacyJson);
      expect(vulns).toHaveLength(1);
      expect(vulns[0].id).toBe("CVE-2021-12345");
      expect(vulns[0].packageName).toBe("axios");
      expect(vulns[0].severity).toBe("moderate");
    });
  });

  describe("auditDependencies Closed Loop", () => {
    it("supera l'audit con esito positivo quando non ci sono vulnerabilità o problemi di licenza", async () => {
      // Setup package.json pulito
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "clean-project", version: "1.0.0" }, null, 2),
        "utf-8"
      );

      const mockRunner = async () => ({
        stdout: JSON.stringify({ vulnerabilities: {} }),
        stderr: "",
        exitCode: 0,
      });

      const report = await auditDependencies(tempDir, { mockRunner });

      expect(report.passed).toBe(true);
      expect(report.ecosystem).toBe("npm");
      expect(report.totalVulnerabilities).toBe(0);
      expect(report.highOrCriticalCount).toBe(0);
      expect(report.licenseIssues).toHaveLength(0);

      const parsed = DependencyAuditReportSchema.safeParse(report);
      expect(parsed.success).toBe(true);
    });

    it("blocca con passed: false se vengono rilevate vulnerabilità HIGH o CRITICAL", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "vulnerable-project" }, null, 2),
        "utf-8"
      );

      const mockRunner = async () => ({
        stdout: JSON.stringify({
          vulnerabilities: {
            "express-fileupload": {
              severity: "critical",
              via: [
                {
                  title: "Remote Code Execution in express-fileupload",
                  severity: "critical",
                  url: "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-7699",
                },
              ],
            },
          },
        }),
        stderr: "",
        exitCode: 1,
      });

      const report = await auditDependencies(tempDir, { mockRunner });

      expect(report.passed).toBe(false);
      expect(report.highOrCriticalCount).toBe(1);
      expect(report.message).toContain("1 vulnerabilità HIGH o CRITICAL");
    });

    it("blocca con passed: false se una dipendenza installata ha licenza copyleft non consentita (es. GPL-3.0)", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify(
          {
            name: "licensed-project",
            dependencies: { "gpl-library": "^1.0.0" },
          },
          null,
          2
        ),
        "utf-8"
      );

      // Simula node_modules con la libreria GPL
      const gplDir = path.join(tempDir, "node_modules", "gpl-library");
      await fs.mkdir(gplDir, { recursive: true });
      await fs.writeFile(
        path.join(gplDir, "package.json"),
        JSON.stringify({ name: "gpl-library", license: "GPL-3.0" }),
        "utf-8"
      );

      const mockRunner = async () => ({
        stdout: JSON.stringify({ vulnerabilities: {} }),
        stderr: "",
        exitCode: 0,
      });

      const report = await auditDependencies(tempDir, { mockRunner });

      expect(report.passed).toBe(false);
      expect(report.licenseIssues.some((l) => l.license === "GPL-3.0")).toBe(true);
      expect(report.licenseIssues[0].compliant).toBe(false);
      expect(report.message).toContain("licenze non conformi");
    });

    it("gestisce il fallback graceful in modalità offline senza bloccare la pipeline (non-strict)", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "offline-project" }, null, 2),
        "utf-8"
      );

      // Simula errore di rete ENOTFOUND
      const mockRunner = async () => ({
        stdout: "",
        stderr: "npm ERR! code ENOTFOUND\nnpm ERR! network request to https://registry.npmjs.org/-/npm/v1/security/audits failed",
        exitCode: 1,
      });

      const report = await auditDependencies(tempDir, { mockRunner });

      expect(report.offlineFallback).toBe(true);
      expect(report.passed).toBe(true); // in modalità non-strict l'offline genera warning ma non blocca
      expect(report.message).toContain("fallback graceful");
    });

    it("blocca la pipeline se l'auditor è offline ma strictAudit: true", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "strict-project" }, null, 2),
        "utf-8"
      );

      const mockRunner = async () => ({
        stdout: "",
        stderr: "npm ERR! code ENOTFOUND",
        exitCode: 1,
      });

      const report = await auditDependencies(tempDir, { mockRunner, strictAudit: true });

      expect(report.offlineFallback).toBe(true);
      expect(report.passed).toBe(false);
      expect(report.message).toContain("Connessione offline in modalità strict");
    });
  });
});
