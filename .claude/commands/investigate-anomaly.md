# /investigate-anomaly — Stop-the-Line Root Cause Analysis (MODE 2)

Act as the **Lead Orchestrator (L1)**. Declare `[ORCHESTRATOR MODE: 2 — INVESTIGATE_RCA (READ-ONLY)]`:
1. **Do NOT modify any production code** (CFF-1 Stop-the-Line).
2. Run `node .company-os/bin/agentic-os.mjs workflow route --scope "$ARGUMENTS" --json` to identify impacted Ring-1 Tech Specialists and Ring-2 Domain Experts.
3. Conduct a rigorous **5 Whys** analysis (`fiveWhys.length >= 3`), consult `rnd_lead` and `qa_lead` (Devil's Advocate), and formulate a reusable `systemicPrinciple` before transitioning to `/rnd-roundtable`.
