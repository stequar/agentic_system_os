# 🏢 AGENTIC COMPANY OS — Architectural Specification

> **An engineering standard for autonomous, multi-agent software departments.**
> Inspired by Andrej Karpathy's *LLM OS* framing, Anthropic's *Orchestrator-Workers* pattern, and the systematic elimination of the *cascading errors* documented in the MetaGPT and ChatDev studies.

---

## 1. Hierarchical Topology & Roles

The architecture strictly separates **strategic orchestration** from **surgical execution**:

```
👑 Project Lead (Human)
    │
    ▼ [Sprint Sync & Approval]
🧠 Lead Orchestrator (L1) (Primary Agent)
    │
    ├──────────────────────────┬──────────────────────────┐
    ▼                          ▼                          ▼
📋 Product Lead            ⚙️ Backend Manager         📱 Mobile / Frontend Manager
[enable_subagent_tools:T]  [enable_subagent_tools:T]  [enable_subagent_tools:T]
    │                          │                          │
    ▼                          ▼                          ▼
📝 PRD / Zod Specs         💻 Leaf Backend Devs       💻 Leaf Frontend/UI Devs
                           [enable_subagent_tools:F]  [enable_subagent_tools:F]
```

### Roles and Authorization Levels

| Level | Role | `enable_subagent_tools` | `enable_write_tools` | Suggested Model | Responsibility |
|---|---|:---:|:---:|---|---|
| **L0** | **Project Lead (Human)** | N/A | N/A | Human | Business vision, macro roadmap, go/no-go gate for each sprint. |
| **L1** | **Lead Orchestrator** | `true` | `true` | Deep Reasoning (Pro / Opus / Thinking) | Runs the Daily Standup (`/run-company`), governs the global architecture, instantiates the Managers, and tracks the token budget. **Does not write application code.** |
| **L2** | **Domain Leads** (Product, Backend, Mobile, QA) | `true` | `true` | Reasoning (Pro / Sonnet) | Department architects. They author the typed contracts (Zod / OpenAPI / SQL), delegate tasks to the leaf devs, and perform formal code review. |
| **L3** | **Leaf Developers** (Python Dev, Swift Dev, SQL Dev) | `false` | `true` | Fast / Codegen (Flash / Sonnet) | Ephemeral agents with tightly scoped tasks (1 ticket, 2–3 files). They make changes in a sandbox and close out after delivery. Zero *context rot*. |

---

## 2. The "Context as RAM" Paradigm (Andrej Karpathy)

1. **Context Window = volatile RAM:** the context window must never be saturated with the entire codebase or with verbose logs.
2. **Docs & Wiki = persistent secondary memory:** all company knowledge lives in `docs/wiki/`.
3. **Master Bootloader (`docs/wiki/INDEX.md`):** the single access point for the agents. Agents read the index and surgically load only the module the current task requires (*progressive disclosure*).
4. **Fail Loudly:** if a rule or an assumption is not covered by the documentation, the agent does not improvise — it stops immediately and escalates to its Lead.

---

## 3. Blackboard Pattern & Deterministic State Machine (FSM)

To avoid the quadratic overhead ($O(N^2)$) and the infinite chatter loops observed in ChatDev, **agents do not converse with each other in free text**. They communicate exclusively through **state transitions on a shared blackboard** (the Git filesystem).

### Sprint Lifecycle:
$$\text{STANDUP} \xrightarrow{\text{Lead Go}} \text{SPECIFY} \xrightarrow{\text{Contracts Ready}} \text{DELEGATE} \xrightarrow{\text{Code Written}} \text{GATEKEEPER} \xrightarrow{\text{Tests Pass}} \text{REVIEW} \xrightarrow{\text{Approved}} \text{MERGE}$$

1. **State 1: STANDUP** — the Lead Orchestrator reads the current state and presents the per-team briefing to the Project Lead via `/run-company`. It waits for formal approval.
2. **State 2: SPECIFY** — the Product Lead and the Tech Leads generate the typed Zod contracts / DB schemas before writing a single line of logic.
3. **State 3: DELEGATE & IMPLEMENT** — the Leads invoke the Leaf Devs, passing the ticket and the typed contract. The Devs work on dedicated git branches.
4. **State 4: DETERMINISTIC GATEKEEPER** — an automated script (linter + typechecker + unit tests). On failure, the Dev receives the compiler output and corrects it. No human or Lead wastes time while the tests are failing.
5. **State 5: CODE REVIEW & MERGE** — the Lead verifies architectural conformance (MVVM, async/await, security). If approved, the code lands on `main`.

---

## 4. Typed Contracts over Prose (Zod Schemas)

Handoffs are not narrative paragraphs but TypeScript structures validated with Zod:
* **`ProductTicketSchema`**: `id`, `epicId`, `acceptanceCriteria`, `inputSchema`, `outputSchema`.
* **`ApiContractSchema`**: endpoints, request/response DTOs, HTTP error codes, validation constraints.
* **`ReviewReportSchema`**: `status: "APPROVED" | "CHANGES_REQUESTED"`, `linterExitCode: 0`, `violations: []`.

---

## 5. Model Context Protocol (MCP)

All external tools (terminal access, Docker sandbox, repository reads, Langfuse metrics) are exposed through MCP servers compliant with the `@modelcontextprotocol/sdk` specification.
