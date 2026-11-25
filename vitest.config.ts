import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./tests/setup/repo-mutation-guard.ts"],
    // Agent-task fixtures are standalone repos with their own node:test suites; they are
    // run inside trial workspaces by the agent-run harness, never by this Vitest suite.
    exclude: [...configDefaults.exclude, "tests/fixtures/agent-tasks/**"],
  },
});
