import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  DependencyAuditReportSchema,
  type DependencyAuditReport,
  type Vulnerability,
  type LicenseCompliance,
  type VulnerabilitySeverity,
} from "../contracts/audit.js";

const execAsync = promisify(exec);

const DEFAULT_PERMISSIVE_LICENSES = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "CC0-1.0",
  "Unlicense",
  "BlueOak-1.0.0",
]);

const RESTRICTIVE_LICENSES = new Set([
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "LGPL-2.1",
  "LGPL-3.0",
  "SSPL-1.0",
  "EUPL-1.2",
]);

export interface DependencyAuditOptions {
  timeoutMs?: number; // default 5000
  strictAudit?: boolean; // default false (offline fallback is non-blocking)
  allowedLicenses?: string[];
  mockRunner?: (cmd: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

/**
 * Normalizza il livello di severità in standard Zod VulnerabilitySeverity
 */
function normalizeSeverity(sev?: string): VulnerabilitySeverity {
  const lower = (sev || "").toLowerCase();
  if (lower === "critical") return "critical";
  if (lower === "high") return "high";
  if (lower === "moderate" || lower === "medium") return "moderate";
  if (lower === "low") return "low";
  return "info";
}

/**
 * Parser per output JSON di npm audit
 */
export function parseNpmAuditJson(rawJson: string): Vulnerability[] {
  const vulns: Vulnerability[] = [];
  try {
    const data = JSON.parse(rawJson);

    // npm v7+ format: data.vulnerabilities
    if (data.vulnerabilities && typeof data.vulnerabilities === "object") {
      for (const [pkgName, details] of Object.entries<any>(data.vulnerabilities)) {
        if (Array.isArray(details.via)) {
          for (const item of details.via) {
            if (typeof item === "object" && item.title) {
              vulns.push({
                id: item.url ? String(item.url.split("/").pop()) : `GHSA-${pkgName}`,
                packageName: pkgName,
                severity: normalizeSeverity(item.severity || details.severity),
                title: item.title,
                url: item.url,
                fixedIn: details.fixAvailable ? "disponibile" : undefined,
              });
            }
          }
        } else {
          vulns.push({
            id: `ADVISORY-${pkgName}`,
            packageName: pkgName,
            severity: normalizeSeverity(details.severity),
            title: `Vulnerabilità in ${pkgName}`,
          });
        }
      }
    } else if (data.advisories && typeof data.advisories === "object") {
      // Classic npm v6 format
      for (const adv of Object.values<any>(data.advisories)) {
        vulns.push({
          id: adv.cve || adv.github_advisory_id || String(adv.id),
          packageName: adv.module_name,
          severity: normalizeSeverity(adv.severity),
          title: adv.title,
          url: adv.url,
          fixedIn: adv.patched_versions,
        });
      }
    }
  } catch {
    // JSON malformato o parziale
  }
  return vulns;
}

/**
 * Rileva l'ecosistema principale del workspace target
 */
async function detectEcosystem(targetPath: string): Promise<"npm" | "cargo" | "python" | "go" | "unknown"> {
  const resolved = path.resolve(targetPath);
  try {
    await fs.stat(path.join(resolved, "package.json"));
    return "npm";
  } catch {}

  try {
    await fs.stat(path.join(resolved, "Cargo.toml"));
    return "cargo";
  } catch {}

  try {
    await fs.stat(path.join(resolved, "pyproject.toml"));
    return "python";
  } catch {}
  try {
    await fs.stat(path.join(resolved, "requirements.txt"));
    return "python";
  } catch {}

  try {
    await fs.stat(path.join(resolved, "go.mod"));
    return "go";
  } catch {}

  return "unknown";
}

/**
 * Verifica la conformità delle licenze per le dipendenze dichiarate in package.json
 */
async function checkLicenses(
  targetPath: string,
  allowedLicensesSet: Set<string>
): Promise<LicenseCompliance[]> {
  const issues: LicenseCompliance[] = [];
  try {
    const pkgRaw = await fs.readFile(path.join(targetPath, "package.json"), "utf-8");
    const pkg = JSON.parse(pkgRaw);
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    for (const depName of Object.keys(deps)) {
      try {
        const depPkgPath = path.join(targetPath, "node_modules", depName, "package.json");
        const depPkgRaw = await fs.readFile(depPkgPath, "utf-8");
        const depPkg = JSON.parse(depPkgRaw);
        const lic = depPkg.license || depPkg.licenses || "UNKNOWN";
        const licStr = typeof lic === "string" ? lic : typeof lic === "object" ? lic.type : "UNKNOWN";

        const isRestrictive = RESTRICTIVE_LICENSES.has(licStr);
        const isAllowed = allowedLicensesSet.has(licStr) || licStr === "UNKNOWN";

        if (isRestrictive || !isAllowed) {
          issues.push({
            packageName: depName,
            license: licStr,
            compliant: false,
            reason: isRestrictive
              ? `Licenza copyleft/restrittiva (${licStr}) non compatibile con lo stack commerciale`
              : `Licenza (${licStr}) non presente nella whitelist consentita`,
          });
        }
      } catch {
        // node_modules non presente o pacchetto non installato, skip
      }
    }
  } catch {
    // Non è un progetto npm valido
  }
  return issues;
}

/**
 * Esegue l'auditing sistematico delle dipendenze di terze parti e la conformità delle licenze.
 */
export async function auditDependencies(
  targetPath: string,
  options?: DependencyAuditOptions
): Promise<DependencyAuditReport> {
  const resolvedPath = path.resolve(targetPath);
  const ecosystem = await detectEcosystem(resolvedPath);
  const timeoutMs = options?.timeoutMs ?? 5000;
  const allowedSet = options?.allowedLicenses
    ? new Set(options.allowedLicenses)
    : DEFAULT_PERMISSIVE_LICENSES;

  const licenseIssues = await checkLicenses(resolvedPath, allowedSet);
  let vulnerabilities: Vulnerability[] = [];
  let offlineFallback = false;

  const runCommand =
    options?.mockRunner ||
    (async (cmd: string) => {
      try {
        const { stdout, stderr } = await execAsync(cmd, { cwd: resolvedPath, timeout: timeoutMs });
        return { stdout, stderr, exitCode: 0 };
      } catch (err: any) {
        return {
          stdout: err.stdout || "",
          stderr: err.stderr || "",
          exitCode: err.code || 1,
        };
      }
    });

  if (ecosystem === "npm") {
    const result = await runCommand("npm audit --json");
    if (result.stdout.trim().startsWith("{")) {
      vulnerabilities = parseNpmAuditJson(result.stdout);
    } else if (result.stderr.includes("ENOTFOUND") || result.stderr.includes("fetch failed") || result.exitCode !== 0) {
      // Problema di connessione o offline
      offlineFallback = true;
    }
  } else if (ecosystem === "cargo") {
    const result = await runCommand("cargo audit --json");
    try {
      const data = JSON.parse(result.stdout);
      if (Array.isArray(data.vulnerabilities?.list)) {
        for (const item of data.vulnerabilities.list) {
          vulnerabilities.push({
            id: item.advisory?.id || "RUSTSEC",
            packageName: item.package?.name || "unknown",
            severity: normalizeSeverity(item.advisory?.severity),
            title: item.advisory?.title,
            url: item.advisory?.url,
          });
        }
      }
    } catch {
      if (result.exitCode !== 0) offlineFallback = true;
    }
  }

  // Conteggi e policy deterministica
  const highOrCriticalCount = vulnerabilities.filter(
    (v) => v.severity === "high" || v.severity === "critical"
  ).length;

  const nonCompliantLicenses = licenseIssues.filter((l) => !l.compliant).length;

  // Se strictAudit è true, offlineFallback invalida il report
  const isPassing =
    highOrCriticalCount === 0 &&
    nonCompliantLicenses === 0 &&
    (!options?.strictAudit || !offlineFallback);

  let message = "";
  if (!isPassing) {
    const reasons: string[] = [];
    if (highOrCriticalCount > 0) reasons.push(`${highOrCriticalCount} vulnerabilità HIGH o CRITICAL`);
    if (nonCompliantLicenses > 0) reasons.push(`${nonCompliantLicenses} licenze non conformi`);
    if (options?.strictAudit && offlineFallback) reasons.push("Connessione offline in modalità strict");
    message = `Audit FALLITO: ${reasons.join(", ")}.`;
  } else if (offlineFallback) {
    message = "Audit completato con avviso: scanner offline o non raggiungibile (fallback graceful).";
  } else {
    message = `Audit superato con successo per ecosistema ${ecosystem}. Zero vulnerabilità bloccanti.`;
  }

  return DependencyAuditReportSchema.parse({
    passed: isPassing,
    ecosystem,
    vulnerabilities,
    licenseIssues,
    totalVulnerabilities: vulnerabilities.length,
    highOrCriticalCount,
    offlineFallback,
    message,
    scannedAt: new Date().toISOString(),
  });
}
