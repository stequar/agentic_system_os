import { describe, it, expect } from "vitest";
import path from "node:path";
import {
  buildDependencyGraph,
  computeImpactedTests,
  runTia,
  normalizePosixPath,
  extractImportPaths,
  resolveImportTarget,
} from "../src/gatekeeper/tia.js";
import { ImpactedTestsResultSchema, DependencyGraphSchema } from "../src/contracts/tia.js";

describe("Test Impact Analysis (TIA) Engine", () => {
  const rootDir = process.cwd();

  it("normalizza correttamente i percorsi POSIX", () => {
    expect(normalizePosixPath("src/gatekeeper/tia.ts")).toBe("src/gatekeeper/tia.ts");
    expect(normalizePosixPath("./src/gatekeeper/tia.ts")).toBe("src/gatekeeper/tia.ts");
    const absPath = path.resolve(rootDir, "src/gatekeeper/tia.ts");
    expect(normalizePosixPath(absPath, rootDir)).toBe("src/gatekeeper/tia.ts");
  });

  it("estrae correttamente i percorsi di import ed export statici e dinamici", () => {
    const sampleCode = `
      import { z } from "zod";
      import { runGatekeeper } from "./runner.js";
      export * from "../contracts/tia.js";
      export { foo } from "./foo.js";
      const lazy = await import("./dynamic-module.js");
    `;

    const imports = extractImportPaths(sampleCode);
    expect(imports).toContain("zod");
    expect(imports).toContain("./runner.js");
    expect(imports).toContain("../contracts/tia.js");
    expect(imports).toContain("./foo.js");
    expect(imports).toContain("./dynamic-module.js");
  });

  it("risolve l'import ESM .js al file .ts sorgente corrispondente", async () => {
    const resolved = await resolveImportTarget(
      "./runner.js",
      "src/gatekeeper/tia.ts",
      rootDir
    );
    expect(resolved).toBe("src/gatekeeper/runner.ts");
  });

  it("costruisce il grafo completo delle dipendenze del repository conforme a DependencyGraphSchema", async () => {
    const graph = await buildDependencyGraph(rootDir);
    const validated = DependencyGraphSchema.parse(graph);

    expect(validated.sourceFiles.length).toBeGreaterThan(15);
    expect(validated.testFiles.length).toBeGreaterThan(20);
    expect(validated.testFiles).toContain("tests/spikes.test.ts");
    expect(validated.sourceFiles).toContain("src/gatekeeper/tia.ts");

    // Verifica dipendenza diretta di tia.ts su contracts/tia.ts
    const tiaDeps = validated.directDependencies["src/gatekeeper/tia.ts"] || [];
    expect(tiaDeps).toContain("src/contracts/tia.ts");

    // Verifica dipendenza inversa: contracts/tia.ts è importato da gatekeeper/tia.ts
    const reverseDeps = validated.reverseDependencies["src/contracts/tia.ts"] || [];
    expect(reverseDeps).toContain("src/gatekeeper/tia.ts");
  });

  it("innesca l'invalidazione globale transitiva se un file in src/contracts/ viene modificato", async () => {
    const graph = await buildDependencyGraph(rootDir);
    const result = computeImpactedTests(["src/contracts/tia.ts"], graph);

    expect(result.isGloballyInvalidated).toBe(true);
    expect(result.impactedTests.length).toBe(graph.testFiles.length);
    expect(result.reason).toContain("Invalidazione globale innescata");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(ImpactedTestsResultSchema.safeParse(result).success).toBe(true);
  });

  it("innesca l'invalidazione globale se un file di build/configurazione viene modificato", async () => {
    const graph = await buildDependencyGraph(rootDir);
    const result = computeImpactedTests(["package.json"], graph);

    expect(result.isGloballyInvalidated).toBe(true);
    expect(result.impactedTests.length).toBe(graph.testFiles.length);
  });

  it("identifica selettivamente solo i test impattati per modifiche a file sorgente mirati", async () => {
    const graph = await buildDependencyGraph(rootDir);
    // Modifica su un parser specifico
    const result = computeImpactedTests(["src/gatekeeper/parsers/vitest.ts"], graph);

    expect(result.isGloballyInvalidated).toBe(false);
    expect(result.impactedTests).toContain("tests/diagnostic-parsers.test.ts");
    // Non dovrebbe contenere test non correlati come rnd-contracts.test.ts o wizard.test.ts
    expect(result.impactedTests).not.toContain("tests/wizard.test.ts");
  });

  it("include direttamente i file di test modificati nell'insieme impattato", async () => {
    const graph = await buildDependencyGraph(rootDir);
    const result = computeImpactedTests(["tests/spikes.test.ts"], graph);

    expect(result.isGloballyInvalidated).toBe(false);
    expect(result.impactedTests).toContain("tests/spikes.test.ts");
  });

  it("restituisce zero test impattati per file non di codice o documentazione non collegata", async () => {
    const graph = await buildDependencyGraph(rootDir);
    const result = computeImpactedTests(["docs/README.md"], graph);

    expect(result.isGloballyInvalidated).toBe(false);
    expect(result.impactedTests.length).toBe(0);
    expect(result.reason).toContain("Nessun test impattato");
  });

  it("esegue runTia in meno di 500ms garantendo l'obiettivo di velocità dell'inner loop", async () => {
    const startTime = Date.now();
    const result = await runTia(rootDir, ["src/gatekeeper/ast-guard.ts"]);
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(500);
    expect(result.impactedTests).toContain("tests/diff-guard.test.ts");
  });
});
