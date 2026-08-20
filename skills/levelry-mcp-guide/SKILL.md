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
- Visible prose goes in `content`; machine-readable facts in `metadata` — never a visible "Metadata" section. Prefer small **tags** (1–5) plus optional short **role** (and sparse **category**). Do not set `description` (prose belongs in the document) or `keywords` (use tags). `listObjects` returns slim meta (role/category/tags) by default; use `includeFullMetadata=true` only when needed. `updateCanvasDocument` is for project-level notes.
- Mixed patches (`updateObjects`, patch `object.update`): empty `content` and empty metadata keys (`tags: []`, `role: ""`, …) are omitted, not cleared. To clear a document, call `updateDocument` with empty content (or patch `document.update`). To clear metadata fields, call `updateObjectMetadata` with explicit empty values. `metadata: {}` is a no-op.
- A name subtitle renders only when the document has content: set `content` at creation when the label matters; skip it for repetitive objects.
- Default type is emoji (always square). Prefer `scaleX` (1 = default, absolute — does not multiply current scale). `width` is a legacy alias: `scale = width/120` (120 ≈ 1, 240 ≈ 2). `rectangle` is a structural divider, not a container; granular creates require explicit `width`/`height`, patch creates default to 200×100.
- **`polygon`** is an AI-only **filled** vector with a **system theme-grey outline**: **one canvas object = one selection**, even when multi-part. Set `type="polygon"`, `emoji="⬡"`. Prefer **`paths: [{points, color?}, ...]`** for multi-part shapes (house = roof + body in the **same** object). Limits: max **80 paths**, **3–320 verts** per path — keep drawings **minimal**. Legacy: `points` + optional top-level `color`. Coords local to `x`/`y`. Width/height ignored; scale proportional. Users: drag/scale/delete/copy only.
- **Style:** `color` = **fill only**. Client always strokes with one grey (dark grey on light theme, light grey on dark). Prefer **3–8 verts** per path, **≤6 paths**, **1–2 fill colors**. Simple silhouettes, not dense organics.
- **Colors:** brand fills unless the user asks otherwise — yellow `#F5C518`, green `#19A974`, blue `#3B82C4` (default), orange `#F27A1A`, red `#E63946`, white `#FFFEFC`, navy `#003049`. Avoid pure black and canvas greys for fills.
- **Detail:** less is more. One concept → one object with `paths`. Edit via `updateObjects` / patch `paths` (or `points`).
- Center of the visible field is `(1500, 1250)`; keep objects ≥150px apart. Out-of-range coordinates are clamped, not rejected.

## Links and connections

- Link to an object from document Markdown: `[Label](#object-<objectId>)`. Raw HTML is stripped.
- Connections are directed: `fromObjectId` → arrowhead at `toObjectId`. Structural relations only; when unsure, skip the edge. Check `listConnections` before creating duplicates.
