# Observability & Evaluation Honesty Plan

**Checkpoint:** 2026-11-14 · **Branch:** `feat/observability-eval-honesty` · **Owner:** Project Lead · **Status:** steps 1–3 built, steps 4–5 awaiting decision

## Principle

Every displayed number names the external observable it was computed from (process exit code, git diff, provider usage record). Constants, defaults and the measurer's own inputs are shown as "not measured".

## Why

The investigation of 2026-11-14 found that the OS could not observe or evaluate a real agent run:

- No trace linked ticket → agent step → tool call → gatekeeper result.
- No real token or cost data; several dashboard values were constants or estimates.
- The `E1..E6` and `W1..W7` harnesses contained checks that could not fail and presented scripted runs as certification.
- Test runs wrote into the production audit log that the dashboard reads.

## Plan and status

| # | Step | Status |
|---|---|---|
| 1 | Stop false signals: relabel `E1..E6` / `W1..W7` as scripted conformance, "not measured" on the dashboard, separate eval audit log, repo-mutation guard | Done |
| 2 | Runtime anchor: `workflow start-ticket`, Claude Code hook recorder, gatekeeper verdict in the same trace | Done (Claude Code only) |
| 3 | Smallest real signal: one task, real headless agent, 5 trials, code-based grading, persisted artifacts | Done |
| 4 | Scale to about 20 tasks with a held-out split and pinned model/CLI versions; then retire the scripted harnesses | Awaiting decision |
| 5 | Ablation: task-only `CLAUDE.md` baseline vs full workflow, same model and budget; report workflow compliance separately | Awaiting decision |

## First real result (step 3)

- Task `invoice-total`, Claude Code 2.1.323 headless, model `claude-fable-5-2`.
- 5/5 trials passed (8/8 hidden tests, diff scope respected); 95% CI 57–100%.
- Cost reported by the CLI: $2.23 for the five trials, plus one $0.52 smoke trial.
- The task is saturated: use it as a regression check, not a capability probe.
- Rerun: `npm run eval:agent -- --trials 5`. Artifacts and history: `.company-os/eval-runs/` (local, gitignored).

## Where things live

- Run trace: `src/telemetry/run-trace.ts`, contract `src/contracts/telemetry.ts`. Data in `.company-os/telemetry/hook-events.jsonl` (local; may contain prompts and code).
- Agent-run eval: `src/eval/agent-run-harness.ts`, contract `src/contracts/agent-run-eval.ts`, tasks in `tests/fixtures/agent-tasks/`, runner `scripts/run-agent-eval.ts`.
- Eval audit channel: `withEvalAuditChannel` in `src/core/audit-logger.ts` → `.company-os/audit.eval.jsonl`.
- Repo-mutation guard: `tests/setup/repo-mutation-guard.ts` (wired in `vitest.config.ts`).
- Dashboard contract test: `tests/studio-contract.test.ts`.

## Open items

- Codex hook parity (recorder is Claude Code only).
- Hardcoded cache-hit rate (0.85, `src/core/prompt-cache-adapter.ts`) and cloud costs (`src/distillation/quad-tier-dispatcher.ts`).
- Scripted retrospective figures still present in the two old harnesses (now labelled as fixture inputs).
- `/Users/stequar/fitness_project` is hardcoded in the two older eval tests with no guard if the folder is missing.
- Tasks, prompts and hidden tests share one author; no held-out split yet.
- Top of `docs/wiki/INDEX.md` is still the legacy Italian section.

## Gates before steps 4–5

- Project Lead decision on scope and budget (about $0.45 per trial at today's rate; a 20-task pass at one trial each is roughly $9, the ablation at least doubles it).
- Architecture board submission (`tech_architecture_board`): new framework/platform not covered by an ADR, increased cloud cost, repo data sent to an LLM provider.
- Conditions the red-team review set for any step 4–5 claim: stored per-trial artifacts, a one-command rerun, pinned model and CLI version, and measured workflow compliance for the ablation.

## Decisions on record

- 2026-11-14: Project Lead approved steps 1–3, a Test Preservation exception for the `overallScore === 100` assertions in the two scripted eval tests (no assertion was removed; negative cases were added), and Claude Code headless as the step-3 agent.
