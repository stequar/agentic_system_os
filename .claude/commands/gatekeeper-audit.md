# /gatekeeper-audit — Build Execution & Deterministic Gatekeeper (MODE 4)

Act as the **Lead Orchestrator (L1)**. Declare `[ORCHESTRATOR MODE: 4 — BUILD & GATEKEEPER]`:
1. Verify gate authorization via `agentic-company workflow verify-gate --json` and check `governance.spikeCheckpoint` in `.company-os/settings.json`.
2. Execute atomic code changes while strictly preserving all existing tests and assertions (AST Diff Guard).
3. Run the full hermetic test and typecheck suite until 100% green, and record results.
