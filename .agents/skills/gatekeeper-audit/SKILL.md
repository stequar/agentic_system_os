---
name: gatekeeper-audit
description: "Activates MODE 4 (BUILD & GATEKEEPER): verifies Cognitive Forcing Gate authorization, coordinates L3 tasks, checks invariants, and certifies 100% passing hermetic tests."
---

# Gatekeeper Audit Skill — Execution & Quality Certification (`MODE_4_BUILD_GATEKEEPER`)

> Surgical L2/L3 execution and empirical validation protocol via the **Deterministic Gatekeeper**.

---

## 1. Pre-Flight Check: Cognitive Forcing Gate

1. Declare `[ORCHESTRATOR MODE: 4 — BUILD & GATEKEEPER]`.
2. Verify via `node .company-os/bin/agentic-os.mjs workflow verify-gate --json` that entry into `MODE_4_BUILD_GATEKEEPER` is authorized (with `ceoApproved === true` for anomalies/RCAs and respecting `governance.spikeCheckpoint`).
3. Load active invariants from `.company-os/invariants.json` and hermetic test commands from `.company-os/config.json`.

---

## 2. Surgical L3 Delegation & Regex Diff Guardrails

1. Decompose the approved plan into atomic tasks assigned to L2 Domain Leads / L3 Leaf Engineers specifying authorized files (`allowedFiles`).
2. Every change is subject to:
   - **Regex Diff Guard (`validatePatch`)**: Strict prohibition against removing or commenting out existing tests or assertions (`Test Preservation Invariant`) or touching out-of-scope files.
   - **FastDecisionGate**: Sub-10ms block on writes to sensitive files (`.env`, `.git`).
   - **Hermetic Runner Execution**: Real execution of typechecking and the hermetic test runner with 100% passing tests.
3. Record results in the Merkle Audit Log (`.company-os/audit.jsonl`) and update `docs/CEO_Dashboard.md`.
