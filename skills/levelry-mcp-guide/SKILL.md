---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers, patch-first writes, revision retry. Use when reading or writing project documentation, notes, diagrams, or structured data on a Levelry canvas via MCP.
---

# Levelry Canvas MCP Skill

## Workflow

1. **Inspect before write.** Prefer `searchDocuments` (cheap) or `listObjects`; use returned IDs only — never invent them.
2. **RULES / MEMORY.** Before any change, find objects named **RULES** and **MEMORY**, read them, and follow their documents. Never delete, rename, overwrite, or repurpose them; edit only when explicitly asked.
3. **Read narrowly.** Before replacing a document: `readDocument`. Several docs → `readDocuments` (max 20). Mentions → `searchDocumentOccurrences`. Local context → `readDocumentExcerpt`. Prefer search/excerpt over full reads.
4. **Revision gate.** Read responses include `data.rev` (project revision). Pass it as `expectedRevision` on `applyCanvasPatch`.
5. **Patch-first.** For **2+ mutations**, use `applyCanvasPatch` (atomic). Single simple change → granular tools (`createObject`, `updateDocument`, …). Prefer `createMultipleObjects` / batch `updateObjects` when not using a patch.
6. Follow live tool schemas for arguments and limits.

## Patch-first & revisions

```text
listObjects / getCurrentProject  →  note data.rev
searchDocuments / readDocumentExcerpt  →  gather IDs & content
applyCanvasPatch({ expectedRevision: rev, operations: [...] })
```

On **`REV_MISMATCH`** (or MCP `isError` with `code: "REV_MISMATCH"`):

1. Re-read (`listObjects` or `getCurrentProject`).
2. Take the new `data.rev` (and `data.currentRev` from the error if present).
3. Rebuild the patch if needed and retry **once** with the fresh revision.
4. Never blind-retry the same write without re-reading.

`applyCanvasPatch` ops (see schema): `object.create` (optional `tempId`), `object.update`, `document.update`, `object.delete`, `connection.create` / `connection.delete`, `canvasDocument.update`, `layer.moveObjects`. Prefer structural connection edges only (flow / dependency / hierarchy / cycle) — not soft theme links.

## Errors (external MCP protocol)

- Failed `tools/call` sets **`isError: true`**. Body is JSON: `{ success: false, code, error, data? }`.
- REST `/api/mcp/execute` uses the same `code` with HTTP status (400 / 403 / 404 / 409 / 413).

| code | Meaning | What to do |
|------|---------|------------|
| `REV_MISMATCH` | Project rev changed | Re-read `rev`, retry patch |
| `CONFLICT` | Entity conflict | Re-read state; fix ops |
| `VALIDATION_ERROR` | Bad args / invalid patch | Fix arguments |
| `NOT_FOUND` | Object/layer/project missing | Re-list / search |
| `INSUFFICIENT_SCOPE` | Token lacks `mcp:write` (etc.) | Read-only token or wrong tool |
| `CAPACITY_EXCEEDED` | Object/document limits | Delete or split work |
| `UNKNOWN_TOOL` | Name not in catalog | Use `tools/list` |

Read-only tokens see only read tools in `tools/list` (~half the catalog). Write tools require `mcp:write`.

## Canvas

- Visible coordinates: X `450–2550`, Y `375–2125`; center `(1500, 1250)`. Keep objects at least 150px apart.
- Searches and unfiltered reads span all layers. New objects use the active layer unless `layerId` is supplied; prefer layer **names**. Move objects only with `moveObjectsToLayer`.
- Every object has a visible Markdown document. Put visible prose in `content`; put machine-readable facts (tags, description, role, category, custom fields) in `metadata`, not a visible “Metadata” section. `updateCanvasDocument` is for project-level notes.
- A name subtitle is hidden when its document is empty. Add `content` during creation when the label matters; omit it for repetitive objects where labels would clutter.
- Default objects are emoji. A `textLabel` uses `name` as its text, requires `emoji: "🔤"`, and is for short labels/titles. A `rectangle` requires `width` and `height` and should be a structural divider, not a region containing objects.

## Links and connections

- Document content supports Markdown; raw HTML is stripped. Link to another object with its real ID: `[Label](#object-<objectId>)`. Prefer this over legacy object/document URLs. External Markdown links work normally.
- Connections are directed: `fromObjectId` is the tail and `toObjectId` the arrowhead. Create only useful structural relationships. In batch creation / patch creates, `from`/`to` may be a new-object index/`tempId` or an existing object ID.
- Call `listConnections` before creating duplicates or deleting a connection by ID. Deleting an object also deletes its connections.

## Project session (external MCP)

- `getCurrentProject` — summary + `rev`.
- `listProjects` / `switchProject` / `createProjectSwitchLink` / `createProject` — navigate or create projects for the MCP session.
- Server `initialize.instructions` also summarizes patch-first and error codes (compact protocol guidance).
