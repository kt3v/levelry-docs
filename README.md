# Levelry MCP — Visual Canvas for AI Agents

> Connect AI agents to a [visual knowledge base](https://levelry.app) via the Model Context Protocol. Includes a ready-made SKILL.md for instant agent setup with Claude, GPT, Hermes, or any MCP-compatible tool.

---

## What is Levelry?

Levelry is a visual knowledge base platform built around:

- **Canvas** — an infinite visual workspace where ideas live in space
- **Objects** — every canvas object is also a full document (not just a label)
- **Layers** — separate concerns (narrative, economy, tasks) without losing the big picture
- **AI Copilot** — contextual AI that understands your canvas and selects the right skills per task
- **Skills** — modular AI behaviors (balance analysis, creative ideation, etc.)
- **MCP** — Model Context Protocol for AI agent integration

---

## MCP Server

**Endpoint:** `https://levelry-server-hvyc5.ondigitalocean.app/mcp`

**Transport:** HTTP + SSE

**Auth:** Bearer token — user-specific, scoped to your Levelry account.

See [Getting Your MCP Token](#getting-your-mcp-token) below for setup instructions.

---

## What You Can Do with MCP

| Capability | Description |
|------------|-------------|
| Read canvas state | List objects, search documents, read project metadata |
| Write to canvas | Create objects, update positions and content, connect objects |
| Multi-project | Switch between projects without reconnecting |
| Layer management | Place content on specific layers, move objects between layers |
| Batch operations | Create up to 100 objects at once, update up to 200 |

---

## Use Cases

### Research & Lookup
*"What do we have on the boss fight design?"* — semantic search across all object documents and names.

### Structured Capture
*"Add this mechanic to the canvas"* — place a new object with full documentation right where it belongs visually.

### Visual Mapping
*"Connect these systems"* — create objects and link them with visual connections to map dependencies.

### AI-Assisted Design
*"Analyze balance on this layer"* — AI copilot reads canvas context and applies domain-specific skills.

---

## Getting Your MCP Token

Open Levelry, go to the menu and click **MCP**. The settings dialog has two tabs:

### OAuth Setup (recommended for agentic coding tools)
Guides for different MCP-compatible tools are available directly in the app. OAuth flow:
1. Click the auth link provided by Levelry
2. Authorize access — select the initial project (you can switch projects at any time later)
3. Grant permission level: read-only or read-write

### API Key Setup (recommended for autonomous agents)
For standalone agents like OpenClaw or Hermes:
1. Generate a Bearer token directly in the app
2. Copy the ready-to-use config snippet
3. Set permission scope for this key (read-only or read-write)

### Quick Config

```yaml
# OAuth or API key — both use the same config field
levelry:
  mcp_token: "<your_token>"
```

Restart the agent after adding the token — Levelry tools will appear automatically.

---

## The Skill

The `levelry-mcp-guide` skill teaches any AI agent how to work with Levelry. It covers canvas fundamentals (bounds, layers, objects), document conventions, MCP tool limits, and best practices for placement and batch operations.

### Install in Your Project

```bash
npx skills add kt3v/levelry-docs --skill levelry-mcp
```

---

## Make Levelry the Default in Your Repo

The skill teaches an agent **how** to work with the canvas. But a skill is passive — it only loads when the agent decides it is relevant, so it can't answer "**when** should I look at the board" or "**which** board belongs to this repo". That's why agents keep asking where the documentation lives.

`AGENTS.md` solves this: it is auto-loaded into every agent session (Claude Code, opencode, Kimi Code, etc.), with no triggers and no reminders. Write the mapping once per repo, and every future session knows to treat the Levelry board as the project's knowledge base by default — and what to do when the MCP server isn't connected.

Copy this block into your repo's `AGENTS.md` and replace `<BOARD_NAME>` with your Levelry project name:

```markdown
## Levelry Canvas

This project's knowledge base lives on a Levelry canvas board named "<BOARD_NAME>",
accessible via the Levelry MCP server (tools like `switchProject`, `searchDocuments`).

- **Read first.** When you need project documentation, design decisions, entities,
  tasks, or diagrams, switch to the "<BOARD_NAME>" project and search the board
  (`searchDocuments`, `listObjects`) before guessing or asking the user.
- **Write back.** When asked to save findings, plans, documentation, or diagrams,
  create or update objects on the board instead of adding stray files to the repo.
- **Degrade gracefully.** If Levelry MCP tools are not available in this session,
  say so once and continue working locally.
- **Mechanics.** For canvas rules (bounds, layers, object types, tool limits, batch
  operations), follow the `levelry-mcp` skill.
```

---

**weird_drop by [[indie indie](https://x.com/1hrOk)]**
