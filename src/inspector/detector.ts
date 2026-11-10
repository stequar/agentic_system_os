import fs from "node:fs/promises";
import path from "node:path";
import { ProjectStackSchema, type ProjectStack } from "../contracts/inspector.js";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".build",
  ".next",
  "build",
  "out",
  "venv",
  ".venv",
  "__pycache__",
  ".turbo",
  ".cache",
]);

const KNOWN_ENTRY_POINTS = [
  "src/index.ts",
  "src/index.js",
  "src/main.ts",
  "src/main.js",
  "index.ts",
  "index.js",
  "main.py",
  "app.py",
  "app/main.py",
  "src/main.py",
  "src/app.py",
  "src/backend/main.py",
  "src/ai/decision_engine.py",
  "db/init/01-init.sql",
  "Package.swift",
  "main.go",
  "src/main.go",
  "src/main.rs",
  "src/lib.rs",
  "main.rs",
  "lib.rs",
  "lib/main.dart",
  "src/main/kotlin/Main.kt",
];

interface ScannedItem {
  relativePath: string;
  name: string;
  extension: string;
  isDirectory: boolean;
}

async function scanDirectory(
  currentDir: string,
  baseDir: string,
  currentDepth: number,
  maxDepth: number,
  items: ScannedItem[]
): Promise<void> {
  if (currentDepth > maxDepth) return;

  let entries;
  try {
    entries = await fs.readdir(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.isDirectory() && entry.name !== ".github") {
      continue;
    }

    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).split(path.sep).join("/");

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }

      // Progetti Xcode come .xcodeproj o .xcworkspace sono tecnicamente directory
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) {
        items.push({
          relativePath,
          name: entry.name,
          extension: path.extname(entry.name).toLowerCase(),
          isDirectory: true,
        });
      }

      await scanDirectory(fullPath, baseDir, currentDepth + 1, maxDepth, items);
    } else if (entry.isFile()) {
      items.push({
        relativePath,
        name: entry.name,
        extension: path.extname(entry.name).toLowerCase(),
        isDirectory: false,
      });
    }
  }
}

async function safeReadFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}

export interface DetectProjectStackOptions {
  hermetic?: boolean;
}

/**
 * Risolve i comandi di test rendendoli ermetici rispetto al virtualenv / lockfile locale
 * (`.venv/bin/pytest` > `uv run pytest` > `poetry run pytest` > `pytest`).
 */
export async function resolveHermeticTestCommands(
  targetPath: string,
  baseCommands: string[]
): Promise<string[]> {
  const resolvedPath = path.resolve(targetPath);

  async function fileExists(relPath: string): Promise<boolean> {
    try {
      const candidate = path.resolve(resolvedPath, relPath);
      if (!candidate.startsWith(resolvedPath)) return false;
      await fs.access(candidate);
      return true;
    } catch {
      return false;
    }
  }

  const hasVenvPytest =
    (await fileExists(".venv/bin/pytest")) ||
    (await fileExists(".venv/bin/python"));
  const hasUvLock = await fileExists("uv.lock");
  const hasPoetryLock = await fileExists("poetry.lock");
  const hasPnpmLock =
    (await fileExists("pnpm-lock.yaml")) ||
    (await fileExists("pnpm-workspace.yaml"));
  const hasYarnLock = await fileExists("yarn.lock");
  const hasNpmLock = await fileExists("package-lock.json");

  return baseCommands.map((cmd) => {
    if (cmd === "pytest") {
      if (hasVenvPytest) return ".venv/bin/pytest";
      if (hasUvLock) return "uv run pytest";
      if (hasPoetryLock) return "poetry run pytest";
    }
    if (cmd === "npm test") {
      if (hasPnpmLock && !hasNpmLock) return "pnpm test";
      if (hasYarnLock && !hasNpmLock) return "yarn test";
    }
    return cmd;
  });
}

export async function detectProjectStack(
  targetPath: string,
  options?: DetectProjectStackOptions
): Promise<ProjectStack> {
  const resolvedPath = path.resolve(targetPath);

  try {
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw new Error(`Target path is not a directory: ${resolvedPath}`);
    }
  } catch (error) {
    throw new Error(`Directory does not exist or cannot be accessed: ${resolvedPath}`);
  }

  const items: ScannedItem[] = [];
  await scanDirectory(resolvedPath, resolvedPath, 0, 5, items);

  const fileMap = new Map<string, ScannedItem>();
  for (const item of items) {
    fileMap.set(item.relativePath, item);
  }

  const languages = new Set<string>();
  const frameworks = new Set<string>();
  const packageManagers = new Set<string>();
  const testCommands = new Set<string>();
  const entryPoints = new Set<string>();
  let hasDocker = false;

  // 1. Docker detection
  const dockerFiles = items.filter(
    (item) =>
      !item.isDirectory &&
      (item.name === "Dockerfile" ||
        item.name.startsWith("Dockerfile.") ||
        item.name === "docker-compose.yml" ||
        item.name === "docker-compose.yaml" ||
        item.name === "compose.yaml" ||
        item.name === "compose.yml")
  );

  if (dockerFiles.length > 0) {
    hasDocker = true;
    languages.add("docker");
  }

  // 2. Node / JS / TS detection
  const hasTsConfig = items.some((item) => item.name === "tsconfig.json");
  const hasTsFiles = items.some((item) => item.extension === ".ts" || item.extension === ".tsx");
  const hasPackageJson = items.some((item) => item.name === "package.json");
  const hasJsFiles = items.some(
    (item) =>
      item.extension === ".js" ||
      item.extension === ".jsx" ||
      item.extension === ".mjs" ||
      item.extension === ".cjs"
  );

  if (hasTsConfig || hasTsFiles) {
    languages.add("typescript");
  }

  if (hasPackageJson || hasJsFiles) {
    languages.add("javascript");
  }

  if (items.some((item) => item.name === "package-lock.json") || hasPackageJson) {
    packageManagers.add("npm");
  }
  if (items.some((item) => item.name === "yarn.lock")) {
    packageManagers.add("yarn");
  }
  if (
    items.some(
      (item) => item.name === "pnpm-lock.yaml" || item.name === "pnpm-workspace.yaml"
    )
  ) {
    packageManagers.add("pnpm");
  }

  // Inspect package.json if present
  let packageJsonTestScript: string | undefined;
  if (hasPackageJson) {
    const pkgContent = await safeReadFile(path.join(resolvedPath, "package.json"));
    if (pkgContent) {
      try {
        const pkg = JSON.parse(pkgContent);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.express) {
          frameworks.add("express");
        }
        if (deps.react) {
          frameworks.add("react");
        }
        if (deps.next) {
          frameworks.add("next.js");
        }
        if (deps["@angular/core"] || fileMap.has("angular.json")) {
          frameworks.add("angular");
        }
        if (deps.vue) {
          frameworks.add("vue");
        }
        if (deps.svelte) {
          frameworks.add("svelte");
        }
        if (deps["@nestjs/core"]) {
          frameworks.add("nestjs");
        }
        if (
          deps.jest ||
          deps["jest-preset-angular"] ||
          items.some((item) => /^jest\.config\.(js|ts|mjs|cjs)$/.test(item.name))
        ) {
          frameworks.add("jest");
        }
        if (deps.vitest) {
          frameworks.add("vitest");
        }
        if (deps.nx || fileMap.has("nx.json")) {
          frameworks.add("nx");
        }

        if (pkg.scripts && typeof pkg.scripts.test === "string") {
          packageJsonTestScript = pkg.scripts.test;
        }

        if (pkg.main && typeof pkg.main === "string") {
          const mainPath = path.normalize(pkg.main).split(path.sep).join("/");
          if (fileMap.has(mainPath)) {
            entryPoints.add(mainPath);
          }
        }
      } catch {
        // Invalid package.json ignored
      }
    }
  }

  if (hasPackageJson || languages.has("typescript") || languages.has("javascript")) {
    if (!packageJsonTestScript || !packageJsonTestScript.includes("Error: no test specified")) {
      if (packageManagers.has("pnpm") && !fileMap.has("package-lock.json")) {
        testCommands.add("pnpm test");
      } else if (packageManagers.has("yarn") && !fileMap.has("package-lock.json")) {
        testCommands.add("yarn test");
      } else {
        testCommands.add("npm test");
      }
    }
  }

  // 3. Python detection
  const hasRequirements = items.some((item) => item.name === "requirements.txt");
  const hasPyproject = items.some((item) => item.name === "pyproject.toml");
  const hasPipfile = items.some((item) => item.name === "Pipfile");
  const hasSetupPy = items.some((item) => item.name === "setup.py");
  const hasPyFiles = items.some((item) => item.extension === ".py");
  const hasDedicatedPythonStructure =
    fileMap.has("main.py") ||
    fileMap.has("app.py") ||
    fileMap.has("manage.py") ||
    fileMap.has("src/main.py") ||
    fileMap.has("src/app.py") ||
    fileMap.has("src/backend/main.py") ||
    fileMap.has("src/ai/decision_engine.py") ||
    items.some(
      (item) =>
        item.extension === ".py" &&
        (item.relativePath.startsWith("src/backend/") ||
          item.relativePath.startsWith("src/ai/") ||
          item.relativePath.startsWith("app/") ||
          !item.relativePath.includes("/"))
    );

  if (
    hasRequirements ||
    hasPyproject ||
    hasPipfile ||
    hasSetupPy ||
    (hasPyFiles && (!hasPackageJson || hasDedicatedPythonStructure))
  ) {
    languages.add("python");
    testCommands.add("pytest");
  }

  if (hasRequirements) {
    packageManagers.add("pip");
  }

  if (items.some((item) => item.name === "poetry.lock")) {
    packageManagers.add("poetry");
  }

  // Check Python configs for frameworks & poetry (anche annidati fino a depth 3)
  let pythonConfigContent = "";
  const pyManifestItems = items.filter(
    (item) =>
      !item.isDirectory &&
      (item.name === "requirements.txt" ||
        item.name === "pyproject.toml" ||
        item.name === "Pipfile" ||
        item.name === "setup.py")
  );
  for (const manifestItem of pyManifestItems) {
    const content = await safeReadFile(path.join(resolvedPath, manifestItem.relativePath));
    pythonConfigContent += " " + content;
    if (manifestItem.name === "pyproject.toml" && content.includes("[tool.poetry]")) {
      packageManagers.add("poetry");
    }
  }

  if (/\bfastapi\b/i.test(pythonConfigContent)) {
    frameworks.add("fastapi");
  }
  if (/\bflask\b/i.test(pythonConfigContent)) {
    frameworks.add("flask");
  }
  if (/\bdjango\b/i.test(pythonConfigContent) || items.some((item) => item.name === "manage.py")) {
    frameworks.add("django");
  }

  // Scan python files for framework imports if not yet found
  const pyFiles = items.filter((item) => item.extension === ".py");
  for (const pyFile of pyFiles) {
    if (frameworks.has("fastapi") && frameworks.has("flask") && frameworks.has("django")) {
      break;
    }
    const pyContent = await safeReadFile(path.join(resolvedPath, pyFile.relativePath));
    if (/\b(?:from|import)\s+fastapi\b/i.test(pyContent)) {
      frameworks.add("fastapi");
    }
    if (/\b(?:from|import)\s+flask\b/i.test(pyContent)) {
      frameworks.add("flask");
    }
    if (/\b(?:from|import)\s+django\b/i.test(pyContent)) {
      frameworks.add("django");
    }
  }

  // 4. Swift detection
  const hasPackageSwift = items.some((item) => item.name === "Package.swift");
  const hasXcodeProj = items.some(
    (item) => item.name.endsWith(".xcodeproj") || item.name.endsWith(".xcworkspace")
  );
  const hasSwiftFiles = items.some((item) => item.extension === ".swift");

  if (hasPackageSwift || hasXcodeProj || hasSwiftFiles) {
    languages.add("swift");
    testCommands.add("swift test");
  }

  if (hasPackageSwift) {
    packageManagers.add("spm");
    const pkgSwiftContent = await safeReadFile(path.join(resolvedPath, "Package.swift"));
    if (/SwiftUI/i.test(pkgSwiftContent)) {
      frameworks.add("swiftui");
    }
  }

  const swiftFiles = items.filter((item) => item.extension === ".swift");
  for (const swiftFile of swiftFiles) {
    if (frameworks.has("swiftui") && frameworks.has("uikit")) {
      break;
    }
    const swiftContent = await safeReadFile(path.join(resolvedPath, swiftFile.relativePath));
    if (/import\s+SwiftUI\b/.test(swiftContent)) {
      frameworks.add("swiftui");
    }
    if (/import\s+UIKit\b/.test(swiftContent)) {
      frameworks.add("uikit");
    }
  }

  // 5. Go detection
  const hasGoMod = items.some((item) => item.name === "go.mod");
  const hasGoSum = items.some((item) => item.name === "go.sum");
  const hasGoFiles = items.some((item) => item.extension === ".go");

  if (hasGoMod || hasGoSum || hasGoFiles) {
    languages.add("go");
    packageManagers.add("go");
    testCommands.add("go test ./...");
  }

  // 6. Rust detection
  const hasCargoToml = items.some((item) => item.name === "Cargo.toml");
  const hasCargoLock = items.some((item) => item.name === "Cargo.lock");
  const hasRsFiles = items.some((item) => item.extension === ".rs");

  if (hasCargoToml || hasCargoLock || hasRsFiles) {
    languages.add("rust");
    packageManagers.add("cargo");
    testCommands.add("cargo test");
  }

  // 7. Kotlin Multiplatform (KMP) detection
  const hasBuildGradleKts = items.some((item) => item.name === "build.gradle.kts");
  const hasSettingsGradleKts = items.some((item) => item.name === "settings.gradle.kts");
  const hasBuildGradle = items.some((item) => item.name === "build.gradle");
  const hasKtFiles = items.some((item) => item.extension === ".kt" || item.extension === ".kts");

  if (hasBuildGradleKts || hasSettingsGradleKts || hasBuildGradle || hasKtFiles) {
    languages.add("kotlin");
    packageManagers.add("gradle");
    testCommands.add("./gradlew test");

    let isKmp = false;
    if (hasBuildGradleKts) {
      const bgContent = await safeReadFile(path.join(resolvedPath, "build.gradle.kts"));
      if (
        /multiplatform/i.test(bgContent) ||
        /kotlin\s*\(\s*["']multiplatform["']\s*\)/i.test(bgContent) ||
        /org\.jetbrains\.kotlin\.multiplatform/i.test(bgContent)
      ) {
        isKmp = true;
      }
    }
    if (hasSettingsGradleKts) {
      const sgContent = await safeReadFile(path.join(resolvedPath, "settings.gradle.kts"));
      if (/multiplatform/i.test(sgContent)) {
        isKmp = true;
      }
    }
    if (isKmp || hasBuildGradleKts || hasSettingsGradleKts) {
      frameworks.add("kmp");
    }
  }

  // 8. Flutter / Dart detection
  const hasRootPubspec =
    fileMap.has("pubspec.yaml") || fileMap.has("pubspec.lock");
  const hasDartEntry = fileMap.has("lib/main.dart");
  const hasDartFiles = items.some((item) => item.extension === ".dart");

  if (hasRootPubspec || hasDartEntry || (hasDartFiles && !hasPackageJson)) {
    languages.add("dart");
    let isFlutter = false;
    if (fileMap.has("pubspec.yaml")) {
      const pubspecContent = await safeReadFile(path.join(resolvedPath, "pubspec.yaml"));
      if (
        /flutter\s*:/i.test(pubspecContent) ||
        /sdk\s*:\s*flutter/i.test(pubspecContent)
      ) {
        isFlutter = true;
      }
    }
    if (isFlutter || hasDartEntry || hasRootPubspec) {
      frameworks.add("flutter");
      packageManagers.add("flutter");
      testCommands.add("flutter test");
    } else {
      packageManagers.add("pub");
      testCommands.add("dart test");
    }
  }

  // 9. SQL / Database schema detection
  const hasSqlFiles = items.some((item) => !item.isDirectory && item.extension === ".sql");
  if (hasSqlFiles) {
    languages.add("sql");
  }

  // 10. Entry Points detection
  for (const candidate of KNOWN_ENTRY_POINTS) {
    if (fileMap.has(candidate)) {
      entryPoints.add(candidate);
    }
  }

  // 11. Fallback for languages
  const finalLanguages = languages.size > 0 ? Array.from(languages) : ["unknown"];
  const rawTestCommands = Array.from(testCommands);
  const finalTestCommands = options?.hermetic
    ? await resolveHermeticTestCommands(resolvedPath, rawTestCommands)
    : rawTestCommands;

  return ProjectStackSchema.parse({
    targetPath: resolvedPath,
    languages: finalLanguages,
    frameworks: Array.from(frameworks),
    hasDocker,
    packageManagers: Array.from(packageManagers),
    testCommands: finalTestCommands,
    entryPoints: Array.from(entryPoints),
    detectedAt: new Date().toISOString(),
  });
}
