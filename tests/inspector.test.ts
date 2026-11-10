import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { detectProjectStack } from "../src/inspector/detector.js";

describe("Project Inspector Module (detectProjectStack)", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agentic-inspector-test-"));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("Test 1: Progetto Swift/iOS (Package.swift con SwiftUI -> rileva swift, swiftui, spm, swift test)", async () => {
    const packageSwiftContent = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SampleSwiftApp",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "SampleSwiftApp", targets: ["SampleSwiftApp"]),
    ],
    targets: [
        .target(
            name: "SampleSwiftApp",
            dependencies: []
        )
    ]
);
`;
    await fs.writeFile(path.join(tempDir, "Package.swift"), packageSwiftContent, "utf-8");

    const sourcesDir = path.join(tempDir, "Sources", "SampleSwiftApp");
    await fs.mkdir(sourcesDir, { recursive: true });
    const viewSwiftContent = `import SwiftUI

public struct ContentView: View {
    public var body: some View {
        Text("Hello SwiftUI")
    }
}
`;
    await fs.writeFile(path.join(sourcesDir, "ContentView.swift"), viewSwiftContent, "utf-8");

    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toContain("swift");
    expect(stack.frameworks).toContain("swiftui");
    expect(stack.packageManagers).toContain("spm");
    expect(stack.testCommands).toContain("swift test");
    expect(stack.entryPoints).toContain("Package.swift");
  });

  it("Test 2: Progetto Python/FastAPI (requirements.txt con fastapi, main.py -> rileva python, fastapi, pip, pytest)", async () => {
    await fs.writeFile(
      path.join(tempDir, "requirements.txt"),
      "fastapi==0.110.0\nuvicorn==0.28.0\npytest==8.1.1\n",
      "utf-8"
    );

    const mainPyContent = `from fastapi import FastAPI

app = FastAPI(title="Sample API")

@app.get("/")
def read_root():
    return {"status": "ok"}
`;
    await fs.writeFile(path.join(tempDir, "main.py"), mainPyContent, "utf-8");

    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toContain("python");
    expect(stack.frameworks).toContain("fastapi");
    expect(stack.packageManagers).toContain("pip");
    expect(stack.testCommands).toContain("pytest");
    expect(stack.entryPoints).toContain("main.py");
  });

  it("Test 3: Progetto TypeScript/Node (package.json con express, tsconfig.json -> rileva typescript, express, npm, npm test)", async () => {
    const packageJsonContent = JSON.stringify(
      {
        name: "sample-express-app",
        version: "1.0.0",
        dependencies: {
          express: "^4.19.2",
        },
        scripts: {
          test: "vitest run",
        },
      },
      null,
      2
    );
    await fs.writeFile(path.join(tempDir, "package.json"), packageJsonContent, "utf-8");

    const tsConfigContent = JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
        },
      },
      null,
      2
    );
    await fs.writeFile(path.join(tempDir, "tsconfig.json"), tsConfigContent, "utf-8");

    const srcDir = path.join(tempDir, "src");
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      "import express from 'express';\nconst app = express();\n",
      "utf-8"
    );

    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toContain("typescript");
    expect(stack.frameworks).toContain("express");
    expect(stack.packageManagers).toContain("npm");
    expect(stack.testCommands).toContain("npm test");
    expect(stack.entryPoints).toContain("src/index.ts");
  });

  it("Test 4: Progetto con Dockerfile (rileva hasDocker: true, docker language)", async () => {
    const dockerfileContent = `FROM node:20-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]
`;
    await fs.writeFile(path.join(tempDir, "Dockerfile"), dockerfileContent, "utf-8");

    const stack = await detectProjectStack(tempDir);

    expect(stack.hasDocker).toBe(true);
    expect(stack.languages).toContain("docker");
  });

  it("Test 5: Fallback/Empty directory (rileva languages: ['unknown'])", async () => {
    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toEqual(["unknown"]);
    expect(stack.hasDocker).toBe(false);
    expect(stack.frameworks).toEqual([]);
    expect(stack.packageManagers).toEqual([]);
    expect(stack.testCommands).toEqual([]);
    expect(stack.entryPoints).toEqual([]);
    expect(stack.targetPath).toBe(path.resolve(tempDir));
    expect(typeof stack.detectedAt).toBe("string");
  });

  it("Extra: Rilevamento avanzato Go e Rust", async () => {
    await fs.writeFile(path.join(tempDir, "go.mod"), "module github.com/test/app\ngo 1.22\n", "utf-8");
    await fs.writeFile(path.join(tempDir, "main.go"), "package main\nfunc main() {}\n", "utf-8");
    await fs.writeFile(path.join(tempDir, "Cargo.toml"), "[package]\nname = \"rust-app\"\nversion = \"0.1.0\"\n", "utf-8");

    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toContain("go");
    expect(stack.languages).toContain("rust");
    expect(stack.packageManagers).toContain("cargo");
    expect(stack.testCommands).toContain("go test ./...");
    expect(stack.testCommands).toContain("cargo test");
    expect(stack.entryPoints).toContain("main.go");
  });

  it("Extra: Rilevamento React, Next.js, Poetry e Django", async () => {
    const packageJsonContent = JSON.stringify({
      dependencies: {
        react: "^18.2.0",
        next: "^14.1.0",
      },
    });
    await fs.writeFile(path.join(tempDir, "package.json"), packageJsonContent, "utf-8");

    const pyprojectContent = `[tool.poetry]
name = "django-service"
version = "0.1.0"
[tool.poetry.dependencies]
django = "^5.0"
`;
    await fs.writeFile(path.join(tempDir, "pyproject.toml"), pyprojectContent, "utf-8");
    await fs.writeFile(path.join(tempDir, "manage.py"), "#!/usr/bin/env python\n", "utf-8");

    const stack = await detectProjectStack(tempDir);

    expect(stack.languages).toContain("javascript");
    expect(stack.languages).toContain("python");
    expect(stack.frameworks).toContain("react");
    expect(stack.frameworks).toContain("next.js");
    expect(stack.frameworks).toContain("django");
    expect(stack.packageManagers).toContain("npm");
    expect(stack.packageManagers).toContain("poetry");
  });

  it("Extra: Errore su directory non esistente", async () => {
    const nonExistent = path.join(tempDir, "does-not-exist");
    await expect(detectProjectStack(nonExistent)).rejects.toThrow("Directory does not exist");
  });
});
