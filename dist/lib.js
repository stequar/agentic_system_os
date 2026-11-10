/**
 * Public library entry point for @stequar/agentic-system-os (TCK-DH P3).
 *
 * External consumers import from the package root ("@stequar/agentic-system-os"),
 * NOT from deep `dist/...` paths. The CLI lives in `./index.ts` (the `bin`) and is
 * intentionally NOT re-exported here (it runs `parse()` on import).
 *
 * This is the stable, supported surface. Deep imports are considered internal and
 * may change without notice.
 */
// ── Stack inspection & domain mining ────────────────────────────────────────
export { detectProjectStack, resolveHermeticTestCommands } from "./inspector/detector.js";
export { mineRepositoryDomainAndRoles } from "./inspector/domain-miner.js";
// ── Workspace attach & non-destructive merge ────────────────────────────────
export { graftManagedSection, formatManagedSentinelBlock, computeManagedBlockHash, } from "./attach/smart-merge.js";
export { attachWorkspace, renderCeoDashboard } from "./attach/injector.js";
export { runHolisticWorkspaceBootstrap } from "./bootstrap/holistic-bootstrap.js";
// ── Deterministic Gatekeeper, diagnostics & self-healing ────────────────────
export { runGatekeeper } from "./gatekeeper/runner.js";
export { parseDiagnostics, parseTscOutput, parseVitestOutput, parsePytestOutput, parseCargoOutput, parseGoOutput, } from "./gatekeeper/parsers/index.js";
export { runSelfHealingLoop } from "./gatekeeper/self-healing.js";
export { WarRoomEngine } from "./gatekeeper/war-room.js";
export { scanCodeHeuristics, extractCodeHeuristics, scanPatchHeuristics, } from "./gatekeeper/formal-prover.js";
// ── Core engines: state machine, sessions, worktrees, settings ──────────────
export { CompanyStateMachine } from "./core/state-machine.js";
export { SessionStore } from "./core/session-store.js";
export { GitWorktreeManager } from "./core/worktree-manager.js";
export { SettingsManager } from "./core/settings-manager.js";
// ── MCP server/client & dynamic-tool heuristic guard ────────────────────────
export { MCP_OS_TOOLS, createMcpServer, startMcpServer } from "./mcp/server.js";
export { McpClientBridge } from "./mcp/client.js";
export { verifyDynamicToolAst, runDynamicToolInSandbox, SANDBOX_SECURITY_MODEL, } from "./mcp/sandbox-runner.js";
// ── Safety / Destructiveness evaluation (adoption gate) ─────────────────────
export { SafetyEvalHarness } from "./eval/safety-eval-harness.js";
export * from "./contracts/safety-eval.js";
// ── Gatekeeper-efficacy (mutation) evaluation ───────────────────────────────
export { GatekeeperEfficacyHarness } from "./eval/gatekeeper-efficacy-harness.js";
export * from "./contracts/gatekeeper-eval.js";
// ── Determinism / idempotency evaluation ────────────────────────────────────
export { DeterminismEvalHarness } from "./eval/determinism-eval-harness.js";
export * from "./contracts/determinism-eval.js";
// ── Golden-snapshot evaluation ──────────────────────────────────────────────
export { GoldenSnapshotHarness } from "./eval/golden-snapshot-harness.js";
export * from "./contracts/golden-eval.js";
// ── Brownfield corpus evaluation (stack-detection recall) ───────────────────
export { BrownfieldCorpusHarness } from "./eval/brownfield-corpus-harness.js";
export * from "./contracts/corpus-eval.js";
// ── Typed Zod contracts (single source of truth for validation) ─────────────
export * from "./contracts/inspector.js";
export * from "./contracts/brownfield.js";
export * from "./contracts/worktree.js";
export * from "./contracts/session.js";
export * from "./contracts/healing.js";
export * from "./contracts/settings.js";
export * from "./contracts/git.js";
export * from "./contracts/mcp.js";
//# sourceMappingURL=lib.js.map