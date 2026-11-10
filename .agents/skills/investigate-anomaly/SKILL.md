---
name: investigate-anomaly
description: "Activates MODE 2 (INVESTIGATE_RCA — Stop-the-Line & Read-Only): performs 5 Whys, consults R&D + Ring-2 Domain Experts + Devil's Advocate, and abstracts from symptom to systemic principle."
---

# Investigate Anomaly Skill — Root Cause Analysis Protocol (`MODE_2_INVESTIGATE_RCA`)

> **Stop-the-Line & Read-Only** protocol for deterministic Root Cause Analysis of bugs, regressions, or architectural anomalies.

---

## 1. Golden Rule: No Immediate Code Edits (CFF-1)

1. As soon as a bug, test failure, or behavioral anomaly is reported, immediately declare `[ORCHESTRATOR MODE: 2 — INVESTIGATE_RCA (READ-ONLY)]`.
2. **Do NOT modify any production files.** Any attempt to enter `IMPLEMENT` without an approved `RootCauseAnalysisReport` is blocked by `CompanyStateMachine.enforceCognitiveForcingGate` with `COGNITIVE_FORCING_GATE_VIOLATION`.

---

## 2. 4-Step Investigation Procedure (CFF-2 & CFF-3)

1. **Automatic Scope Routing**:
   - Run `node .company-os/bin/agentic-os.mjs workflow route --scope <files_or_keywords> --json` to identify impacted Ring-2 Domain Experts and Ring-1 Tech Specialists.
2. **5 Whys Causal Chain (`fiveWhys.length >= 3`)**:
   - Trace from the visible symptom to the structural root cause across at least 3–5 causal levels verified in source code.
3. **Multi-Ring & Devil's Advocate Consultation**:
   - Consult `rnd_lead`, relevant Ring-2 Domain Experts, and `qa_lead` (Devil's Advocate / Red-Teamer) to surface collateral risks (`redTeamRisks`).
4. **Symptom-to-Principle Abstraction (`systemicPrinciple`)**:
   - Formulate the reusable architectural principle and verifiable invariant that prevents the entire class of bugs from recurring, then transition to `/rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`).
