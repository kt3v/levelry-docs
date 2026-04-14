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

## Quick Example

```json
{
  "toolName": "searchDocuments",
  "params": { "query": "combat system", "limit": 10 }
}
```

```json
{
  "toolName": "createMultipleObjects",
  "params": {
    "objects": [
      { "emoji": "⚔️", "x": 1500, "y": 1250, "name": "Combat System", "content": "Core combat mechanics" },
      { "emoji": "❤️", "x": 1700, "y": 1250, "name": "Health", "content": "HP and damage formulas" }
    ],
    "connections": [{ "from": 0, "to": 1 }]
  }
}
```

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

## Architecture

```
AI Agent (MCP-compatible)
  └── Levelry MCP Client
        └── Levelry MCP Server
              └── Levelry Canvas API
                    └── Levelry Platform
```

The MCP server translates tool calls into Levelry REST API requests. The agent never calls the API directly.

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

**weight_drop by [[indie indie](https://x.com/1hrOk)]**
