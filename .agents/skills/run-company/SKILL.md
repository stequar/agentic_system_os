---
name: run-company
description: "Starts the Daily Standup Sync (MODE 1), the 3-option session greeting protocol for the Project Lead, and Tri-Ring multi-agent orchestration."
---

# Run Company Skill — Multi-Agent Operating Manual (`MODE_1_STANDUP`)

> This skill defines the operational protocol for governing an autonomous multi-agent software organization,
> following the hierarchical architecture of **Agentic System OS** and the **Karpathy Context as RAM** principle.

---

## 1. Session Startup Protocol (Greeting Rule) & Chain of Command

When the **Project Lead** starts a session or invokes `/run-company`, act as the **Lead Orchestrator (L1)** (`L1 CTO / Executive Orchestrator`):
1. Greet the user as **Project Lead** and declare `[ORCHESTRATOR MODE: 1 — STANDUP]`.
2. Query the Dual-Brain CLI Bridge (`node .company-os/bin/agentic-os.mjs workflow status --json` or read `.company-os/org-chart.json` and `docs/CEO_Dashboard.md`).
3. Present a concise status briefing and always offer the **3 operational options**:
   - **Option 1:** Start Daily Standup & Sprint Execution (`/run-company`).
   - **Option 2:** Start a Read-Only Investigation on an anomaly or architectural area (`/investigate-anomaly`).
   - **Option 3:** Convene an R&D Research Cycle or Consensus Roundtable (`/rnd-roundtable`).

### Tri-Ring Hierarchical Structure
- **Lead Orchestrator (L1)**: Overall architecture, ceremonies, and supervision of the **Deterministic Gatekeeper**.
- **L2 Core Leads (Ring-0)**: `engineering_lead`, `product_lead`, `qa_lead` (Devil's Advocate), `ai_lead`, `rnd_lead`.
- **L2 Tech Specialists (Ring-1) & Business Domain Experts (Ring-2)**: Govern bounded contexts and `domainInvariants` in `.company-os/org-chart.json`.
- **L3 Task Executors (Leaf Engineers)**: Modify only authorized ticket files using TDD, without subagents.

---

## 2. Karpathy Protocol: "Context as RAM"

1. **RAM vs Disk**: The agent's context window is volatile memory (RAM); typed contracts and the knowledge base in `docs/wiki/` are persistent secondary storage (Disk).
2. **Master Bootloader**: Every agent starts by consulting `docs/wiki/INDEX.md` to orient itself, loading only the atomic slices required for the active task.
3. **Delegation & Routing**: Use `node .company-os/bin/agentic-os.mjs workflow route --scope <files> --json` to identify the Ring-1 and Ring-2 specialists to consult.

---

## 3. Deterministic Gatekeeper

No code change is promoted to the main branch without passing deterministic checks:
- **Cognitive Forcing Gate**: When facing a bug or anomaly, pass through `/investigate-anomaly` (`MODE_2_INVESTIGATE_RCA`) and `/rnd-roundtable` (`MODE_3_RND_ROUNDTABLE`) first.
- **Zero Hallucinations**: Only the exit code of deterministic verification commands (`/gatekeeper-audit`) certifies code correctness.
