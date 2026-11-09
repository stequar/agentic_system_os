import fs from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import {
  DependencyGraphSchema,
  ImpactedTestsResultSchema,
  TiaOptionsSchema,
  type DependencyGraph,
  type ImpactedTestsResult,
  type TiaOptions,
} from "../contracts/tia.js";
import { isTestFile } from "./ast-guard.js";

/**
 * Normalizza un percorso file in formato POSIX relativo alla radice del workspace.
 */
export function normalizePosixPath(filePath: string, workspaceRoot?: string): string {
  let normalized = filePath;
  if (workspaceRoot && path.isAbsolute(filePath)) {
    normalized = path.relative(workspaceRoot, filePath);
  }
  return normalized.split(path.sep).join("/").replace(/^\.\//, "").trim();
}

/**
 * Estrae tutti i percorsi di import ed export relativi da un file sorgente JavaScript/TypeScript.
 */
export function extractImportPaths(sourceCode: string): string[] {
  const imports: string[] = [];
  // Match per: import ... from "..." | export ... from "..." | import("...")
  const importRegex = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(sourceCode)) !== null) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }
  while ((match = dynamicImportRegex.exec(sourceCode)) !== null) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }
  return imports;
}

/**
 * Risolve un percorso di import relativo rispetto a un file sorgente in un percorso esistente su disco.
 * Gestisce la mappatura Node ESM da estensioni .js a file .ts originari.
 */
export async function resolveImportTarget(
  importSpecifier: string,
  sourceFilePath: string,
  workspaceRoot: string,
  supportedExtensions: string[] = [".ts", ".tsx", ".js", ".jsx", ".mjs"]
): Promise<string | null> {
  // Ignora pacchetti npm e import non relativi
  if (!importSpecifier.startsWith("./") && !importSpecifier.startsWith("../")) {
    return null;
  }

  const sourceDir = path.dirname(path.resolve(workspaceRoot, sourceFilePath));
  let resolvedAbsolute = path.resolve(sourceDir, importSpecifier);

  // Prova diretta
  try {
    const stat = await fs.stat(resolvedAbsolute);
    if (stat.isFile()) {
      return normalizePosixPath(resolvedAbsolute, workspaceRoot);
    }
  } catch {
    // Non esiste come file diretto
  }

  // Gestione ESM: se punta a .js, cerca il corrispettivo .ts o .tsx
  if (resolvedAbsolute.endsWith(".js")) {
    const tsVariant = resolvedAbsolute.slice(0, -3) + ".ts";
    try {
      const stat = await fs.stat(tsVariant);
      if (stat.isFile()) {
        return normalizePosixPath(tsVariant, workspaceRoot);
      }
    } catch {}

    const tsxVariant = resolvedAbsolute.slice(0, -3) + ".tsx";
    try {
      const stat = await fs.stat(tsxVariant);
      if (stat.isFile()) {
        return normalizePosixPath(tsxVariant, workspaceRoot);
      }
    } catch {}
  }

  // Prova ad aggiungere estensioni note
  for (const ext of supportedExtensions) {
    const withExt = resolvedAbsolute + ext;
    try {
      const stat = await fs.stat(withExt);
      if (stat.isFile()) {
        return normalizePosixPath(withExt, workspaceRoot);
      }
    } catch {}
  }

  // Prova come directory con index.ts / index.js
  for (const ext of supportedExtensions) {
    const withIndex = path.join(resolvedAbsolute, `index${ext}`);
    try {
      const stat = await fs.stat(withIndex);
      if (stat.isFile()) {
        return normalizePosixPath(withIndex, workspaceRoot);
      }
    } catch {}
  }

  return null;
}

/**
 * Raccoglie ricorsivamente tutti i file in una directory aventi estensioni supportate.
 */
async function collectFilesRecursively(
  dirPath: string,
  extensions: string[]
): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // Ignora node_modules, .git, .company-os, dist, build
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name.startsWith(".company-os") ||
          entry.name === "dist" ||
          entry.name === "build" ||
          entry.name.startsWith(".gemini")
        ) {
          continue;
        }
        const subFiles = await collectFilesRecursively(fullPath, extensions);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        if (extensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Directory inesistente o non accessibile
  }

  return files;
}

/**
 * Costruisce in memoria il grafo delle dipendenze statiche del repository.
 */
export async function buildDependencyGraph(
  workspaceRoot: string = process.cwd(),
  options?: Partial<TiaOptions>
): Promise<DependencyGraph> {
  const resolvedRoot = path.resolve(workspaceRoot);
  const opts = TiaOptionsSchema.parse({
    workspaceRoot: resolvedRoot,
    ...options,
  });

  const allFilesAbsolute: string[] = [];
  for (const dir of opts.scanDirs) {
    const dirAbs = path.resolve(resolvedRoot, dir);
    const files = await collectFilesRecursively(dirAbs, opts.extensions);
    allFilesAbsolute.push(...files);
  }

  const directDeps: Record<string, string[]> = {};
  const reverseDeps: Record<string, string[]> = {};
  const testFiles: string[] = [];
  const sourceFiles: string[] = [];

  // Inizializza nodi nel grafo
  for (const absFile of allFilesAbsolute) {
    const norm = normalizePosixPath(absFile, resolvedRoot);
    directDeps[norm] = [];
    if (!reverseDeps[norm]) {
      reverseDeps[norm] = [];
    }
    if (isTestFile(norm)) {
      testFiles.push(norm);
    } else {
      sourceFiles.push(norm);
    }
  }

  // Scansiona import per ciascun file
  for (const absFile of allFilesAbsolute) {
    const sourceNorm = normalizePosixPath(absFile, resolvedRoot);
    try {
      const content = await fs.readFile(absFile, "utf-8");
      const specifiers = extractImportPaths(content);

      for (const spec of specifiers) {
        const resolvedTarget = await resolveImportTarget(
          spec,
          sourceNorm,
          resolvedRoot,
          opts.extensions
        );

        if (resolvedTarget) {
          if (!directDeps[sourceNorm].includes(resolvedTarget)) {
            directDeps[sourceNorm].push(resolvedTarget);
          }
          if (!reverseDeps[resolvedTarget]) {
            reverseDeps[resolvedTarget] = [];
          }
          if (!reverseDeps[resolvedTarget].includes(sourceNorm)) {
            reverseDeps[resolvedTarget].push(sourceNorm);
          }
        }
      }
    } catch {
      // Ignora file non leggibili
    }
  }

  return DependencyGraphSchema.parse({
    directDependencies: directDeps,
    reverseDependencies: reverseDeps,
    testFiles: testFiles.sort(),
    sourceFiles: sourceFiles.sort(),
    createdAt: new Date().toISOString(),
  });
}

/**
 * Calcola i file di test impattati per un insieme di file modificati.
 * Applica rigorosamente la Matrice di Invalidazione Transitiva e la risalita del grafo inverso.
 */
export function computeImpactedTests(
  modifiedFiles: string[],
  graph: DependencyGraph,
  options?: Partial<TiaOptions>
): ImpactedTestsResult {
  const startTime = performance.now();
  const normalizedModified = modifiedFiles.map((f) => normalizePosixPath(f));
  const globalPatterns = options?.globalInvalidationPatterns || [
    "src/contracts/",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vitest.config.ts",
    "vitest.config.js",
  ];

  // 1. Verifica Invalidazione Globale Transitiva
  for (const modFile of normalizedModified) {
    for (const pattern of globalPatterns) {
      if (modFile.startsWith(pattern) || modFile === pattern) {
        const duration = Math.round((performance.now() - startTime) * 100) / 100;
        return ImpactedTestsResultSchema.parse({
          modifiedFiles: normalizedModified,
          impactedTests: [...graph.testFiles],
          isGloballyInvalidated: true,
          reason: `Percorso critico modificato: '${modFile}' corrisponde al pattern '${pattern}'. Invalidazione globale innescata.`,
          durationMs: duration,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // 2. Risalita BFS del Grafo Inverso (Reverse Dependency Graph)
  const impactedTestsSet = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const file of normalizedModified) {
    // Se il file modificato è esso stesso un file di test, includilo direttamente
    if (isTestFile(file) || graph.testFiles.includes(file)) {
      impactedTestsSet.add(file);
    }
    queue.push(file);
    visited.add(file);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.reverseDependencies[current] || [];

    for (const dep of dependents) {
      if (isTestFile(dep) || graph.testFiles.includes(dep)) {
        impactedTestsSet.add(dep);
      }
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }

  const duration = Math.round((performance.now() - startTime) * 100) / 100;
  const impactedTestsList = Array.from(impactedTestsSet).sort();

  const reason =
    impactedTestsList.length > 0
      ? `Identificati ${impactedTestsList.length} test impattati per ${normalizedModified.length} file modificati.`
      : "Nessun test impattato dalle modifiche specificate.";

  return ImpactedTestsResultSchema.parse({
    modifiedFiles: normalizedModified,
    impactedTests: impactedTestsList,
    isGloballyInvalidated: false,
    reason,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Funzione unificata di esecuzione TIA: analizza il workspace e calcola i test impattati.
 */
export async function runTia(
  workspaceRoot: string = process.cwd(),
  modifiedFiles: string[],
  options?: Partial<TiaOptions>
): Promise<ImpactedTestsResult> {
  const graph = await buildDependencyGraph(workspaceRoot, options);
  return computeImpactedTests(modifiedFiles, graph, options);
}
