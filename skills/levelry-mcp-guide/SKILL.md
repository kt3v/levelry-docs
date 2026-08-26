---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers, patch-first writes, revision retry. Use when reading or writing project documentation, notes, diagrams, or structured data on a Levelry canvas via MCP.
---

# Levelry Canvas MCP Skill

Tool schemas and `initialize.instructions` already state bounds, sizing, patch ops,
and connection rules — follow them. This skill covers what they don't.

## Workflow

1. **Inspect before write.** `searchDocuments` (cheap) or `listObjects`; use returned IDs only — never invent them.
2. **RULES / MEMORY.** They live on the **Service** layer (always last). Before any change, find objects named **RULES** and **MEMORY**, read them, and follow them. Never delete, rename, overwrite, or repurpose them; edit only when explicitly asked. Do not delete the Service layer. (Convention — the server does not enforce it.) Skill objects on that layer are ordinary documents and may be read or edited.
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

- New objects land on the active layer unless `layerId` is given; prefer layer **names** over IDs. Move objects only via `moveObjectsToLayer`. Searches and unfiltered reads span all layers, including Service (RULES, MEMORY, and board skills).
- Visible prose goes in `content`; machine-readable facts in `metadata` — never a visible "Metadata" section. Prefer small **tags** (1–5) plus optional short **role** (and sparse **category**). Do not set `description` (prose belongs in the document) or `keywords` (use tags). `listObjects` returns slim meta (role/category/tags) by default; use `includeFullMetadata=true` only when needed. `updateCanvasDocument` is for project-level notes.
- Mixed patches (`updateObjects`, patch `object.update`): empty `content` and empty metadata keys (`tags: []`, `role: ""`, …) are omitted, not cleared. To clear a document, call `updateDocument` with empty content (or patch `document.update`). To clear metadata fields, call `updateObjectMetadata` with explicit empty values. `metadata: {}` is a no-op.
- A name subtitle renders only when the document has content: set `content` at creation when the label matters; skip it for repetitive objects.
- Default type is emoji (always square). Prefer `scaleX` (1 = default, absolute — does not multiply current scale). `width` is a legacy alias: `scale = width/120` (120 ≈ 1, 240 ≈ 2). textLabel uses `type="textLabel"` with `emoji="🔤"` and optional pixel `width` (default 200).
- Center of the visible field is `(1500, 1250)`; keep objects ≥150px apart. Keep structures compact: siblings ~200–250px apart (center to center), not spread across the canvas. Use size to convey importance: key or category objects 1.5–2× scale. Out-of-range coordinates are clamped, not rejected.

## Links and connections

- Link to an object from document Markdown: `[Label](#object-<objectId>)`. Raw HTML is stripped.
- Connections are directed: `fromObjectId` → arrowhead at `toObjectId`. Structural relations only; when unsure, skip the edge. Check `listConnections` before creating duplicates.
