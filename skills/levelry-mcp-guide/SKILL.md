---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers, patch-first writes, revision retry. Use when reading or writing project documentation, notes, diagrams, or structured data on a Levelry canvas via MCP.
---

# Levelry Canvas MCP Skill

Tool schemas and `initialize.instructions` already state bounds, sizing, patch ops,
and connection rules — follow them. This skill covers what they don't.

## Workflow

1. **Inspect before write.** `searchDocuments` (cheap) or `listObjects`; use returned IDs only — never invent them.
2. **RULES / MEMORY.** Before any change, find objects named **RULES** and **MEMORY**, read them, and follow them. Never delete, rename, overwrite, or repurpose them; edit only when explicitly asked. (Convention — the server does not enforce it.)
3. **Read narrowly.** Prefer `searchDocuments` / `searchDocumentOccurrences` / `readDocumentExcerpt` over full reads; `readDocuments` for several at once.
4. **Revision gate.** Read responses include `data.rev`; pass it as `expectedRevision` on `applyCanvasPatch`.
5. **Patch-first.** 2+ mutations → `applyCanvasPatch` (atomic); single simple change → a granular tool.

## REV_MISMATCH

Re-read (`listObjects` / `getCurrentProject`), take the fresh `data.rev` (or `data.currentRev`
from the error), rebuild if needed, retry **once**. Never blind-retry a write.

Other codes: `CONFLICT` re-read and fix ops · `VALIDATION_ERROR` fix args · `NOT_FOUND` re-list ·
`INSUFFICIENT_SCOPE` read-only token (write tools need `mcp:write` and are hidden from `tools/list`) ·
`CAPACITY_EXCEEDED` delete or split work.

## Canvas

- New objects land on the active layer unless `layerId` is given; prefer layer **names** over IDs. Move objects only via `moveObjectsToLayer`. Searches and unfiltered reads span all layers.
- Visible prose goes in `content`; machine-readable facts (tags, role, category, …) in `metadata` — never a visible "Metadata" section. `updateCanvasDocument` is for project-level notes.
- A name subtitle renders only when the document has content: set `content` at creation when the label matters; skip it for repetitive objects.
- Default type is emoji (always square — set `width` only). `rectangle` is a structural divider, not a container; granular creates require explicit `width`/`height`, patch creates default to 200×100.
- Center of the visible field is `(1500, 1250)`; keep objects ≥150px apart. Out-of-range coordinates are clamped, not rejected.

## Links and connections

- Link to an object from document Markdown: `[Label](#object-<objectId>)`. Raw HTML is stripped.
- Connections are directed: `fromObjectId` → arrowhead at `toObjectId`. Structural relations only; when unsure, skip the edge. Check `listConnections` before creating duplicates.
