---
name: rnd-roundtable
description: "Activates MODE 3 (RND_ROUNDTABLE): orchestrates 1:1 interviews, multi-agent Roundtable with mandatory Devil's Advocate (qa_lead + Ring-2), and presents the Executive Pitch."
---

# R&D Roundtable Skill — Consensus & Executive Pitch (`MODE_3_RND_ROUNDTABLE`)

> R&D research protocol, 2-round structured Anti-Echo-Chamber debate, and Project Lead approval gate.

---

## 1. Roundtable Flow (`CeremonyDispatcher` + `ConsensusEngine`)

1. Declare `[ORCHESTRATOR MODE: 3 — RND_ROUNDTABLE]`.
2. **Automatic Scope Summoning**:
   - Start the `ARCHITECTURE_REVIEW_ROUNDTABLE` ceremony including `rnd_lead`, `engineering_lead`, `product_lead`, `ai_lead`, Ring-2 Domain Experts, and `qa_lead` in the mandatory role of **Devil's Advocate / Red-Teamer**.
3. **2-Round Debate (`ConsensusEngine`)**:
   - **Round 1 (Red-Team Challenge):** The Devil's Advocate (`qa_lead` or primary Ring-2 expert) raises security, performance, or domain fallacies (`DevilsAdvocateFeedback`).
   - **Round 2 (Mitigations & Convergence):** Leads propose deterministic countermeasures (`mitigations`) until `CONSENSUS_REACHED` or `TIE_BREAK_INVOKED`.

---

## 2. Executive Pitch & Approval Gate (CFF-4)

1. Synthesize the RFC or `RootCauseAnalysisReport` into a concise **Executive Pitch** for the **Project Lead** (Problem/Opportunity, Systemic Principle, Mitigated Red-Team Risks, Phased Plan).
2. **Wait for explicit Project Lead approval (`ceoApproved: true`)** before invoking `node .company-os/bin/agentic-os.mjs workflow verify-gate` and entering `MODE_4_BUILD_GATEKEEPER` (`/gatekeeper-audit`).
