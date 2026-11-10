# 🔬 RFC-008: Zero-Clone `npx` Distribution, Fast Local Shim & Cross-Harness Runtime Bridge

**Status:** `RATIFIED`  
**Date:** 2026-11-09  
**Authors:** Lead Orchestrator (L1), `rnd_lead`, `engineering_lead`, `product_lead`, `ai_lead`, `qa_lead` (Devil's Advocate), `mcp_cli_runtime_specialist` (Ring-1)  
**Target Release:** `@stequar/agentic-system-os` (`v1.0.1`)

---

## 1. Problem Statement & Motivation

When a developer (the **Project Lead**) adopts **Agentic System OS** on a new machine to use with **Anthropic Claude Code**, **OpenAI Codex**, or **Antigravity (`agy`)**, requiring `git clone` + `npm install` + `npm run build` + `npm link` of the orchestrator repository itself is an anti-pattern.

Modern developer tools and MCP servers follow a **Zero-Clone `npx` Workflow**:
```bash
cd /path/to/my-target-project
npx github:stequar/agentic_system_os bootstrap .
```

However, our **R&D Roundtable & Red-Team Audit (`qa_lead` + `mcp_cli_runtime_specialist`)** uncovered **4 critical failure modes** that occur when a user runs a tool via `npx github:owner/repo` without cloning or globally installing it:

---

## 2. Red-Team Findings (Devil's Advocate Analysis)

### 🚨 Failure Mode 1: Post-Bootstrap Command Resolution inside Target Projects
- **The Trap:** After the user runs `npx github:stequar/agentic_system_os bootstrap .` inside `/path/to/my-target-project`, they open **Claude Code** or **Codex**. The generated `CLAUDE.md` and `AGENTS.md` previously instructed the agent to run `npx tsx src/index.ts workflow status --json` or `agentic-os workflow status --json`.
- **Why It Breaks on a Second Machine:**
  1. Inside `/path/to/my-target-project`, `src/index.ts` of Agentic System OS does **not** exist (it is the user's application repo, not the OS repo).
  2. Because the user ran `npx` instead of `npm install -g`, `agentic-os` is **not** in the global `$PATH`.
- **Architectural Solution (`Fast Local Shim` — `.company-os/bin/agentic-os`):**
  - During `bootstrap` (or `attach` / `setup-harnesses`), Agentic System OS generates an executable Node/POSIX shim at **`.company-os/bin/agentic-os`**.
  - This shim records the exact absolute path of the `dist/index.js` entrypoint that executed the bootstrap (e.g., inside `~/.npm/_npx/.../dist/index.js`).
  - When Claude Code, Codex, or `.mcp.json` invokes `node .company-os/bin/agentic-os workflow status --json` (or `node .company-os/bin/agentic-os mcp`), it executes the cached `dist/index.js` in **<25ms with zero network latency**, and automatically falls back to `npx --yes github:stequar/agentic_system_os` if the npm cache is ever purged!

### 🚨 Failure Mode 2: `npx github:stequar/agentic_system_os` Multi-Bin Ambiguity
- **The Trap:** In npm v10/v11, when `npx github:stequar/agentic_system_os` downloads a repository whose `package.json` has `"name": "@stequar/agentic-system-os"`, `npx` strips the `@stequar/` scope and looks for a `bin` key matching **`agentic-system-os`**!
- **Why It Breaks:** If `bin` only contains `"agentic-os"` and `"agentic-company"`, `npx` throws:
  `npm error could not determine executable to run`.
- **Architectural Solution:** Include `"agentic-system-os": "dist/index.js"` as the primary matching key in `package.json -> bin` alongside `"agentic-os": "dist/index.js"` and `"agentic-company": "dist/index.js"`.

### 🚨 Failure Mode 3: Cold-Start Compilation Failure when `dist/` is Git-Ignored
- **The Trap:** When installing from a GitHub URL (`github:stequar/agentic_system_os`) rather than the npm registry, npm clones the git tree. If `dist/` is in `.gitignore`, npm must run `"prepare": "npm run build"` on the target machine, which fails if `NODE_ENV=production` omits `devDependencies` (`tsc`) or adds 10–15s of compilation overhead.
- **Architectural Solution:** Commit the pre-compiled `dist/` directory directly to the repository with executable permissions (`chmod +x dist/index.js`) and remove `"prepare": "npm run build"` so `npx github:stequar/agentic_system_os` starts instantaneously without compiling TypeScript on the client machine.

### 🚨 Failure Mode 4: Zero-Config `.mcp.json` for Claude Code
- **The Trap:** If `.mcp.json` hardcodes `"command": "agentic-os"`, Claude Code's MCP client fails to start the server if the user only used `npx` and never ran `npm install -g`.
- **Architectural Solution:** Configure `.mcp.json` to invoke `"command": "node"` with `"args": [".company-os/bin/agentic-os", "mcp"]`. Because `node` is guaranteed to be in `$PATH` and `.company-os/bin/agentic-os` resolves the cached `dist/index.js` (with fallback to `npx -y github:stequar/agentic_system_os`), the MCP server starts in `<30ms` on any machine without global installation!

---

## 3. Consensus Resolution & Implementation Plan

All 5 Ring-0 Core Leads (`rnd_lead`, `engineering_lead`, `product_lead`, `ai_lead`, `qa_lead`) and `mcp_cli_runtime_specialist` unanimously ratified this design (`CONSENSUS_REACHED` in Round 2):

1. **Create `.company-os/bin/agentic-os` Local Shim Generator (`src/attach/harness-adapter.ts`):**
   - Automatically emitted during `bootstrap` and `workflow setup-harnesses`.
   - Resolves in priority order:
     1. Cached `dist/index.js` from the `npx` or local installation that ran `bootstrap`.
     2. Global `agentic-os` binary if present in `$PATH`.
     3. `npx --yes github:stequar/agentic_system_os` fallback.
2. **Update `CLAUDE.md`, `.claude/commands/*.md`, `.mcp.json`, and `AGENTS.md`:**
   - Reference `node .company-os/bin/agentic-os` (alongside `agentic-os` / `agentic-company`) so every command executed by Claude Code or Codex inside a target project works out-of-the-box with zero global install required.
3. **Track Pre-Compiled `dist/` in Git & Match `bin` Key in `package.json`:**
   - Remove `dist/` from `.gitignore`.
   - Add `"agentic-system-os": "dist/index.js"` to `package.json -> bin`.
   - Mark `dist/index.js` executable (`chmod 755`).
