---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers. Use when reading or writing project documentation, notes, diagrams, or structured data on a Levelry canvas via MCP.
---

# Levelry Canvas MCP Skill

## Workflow

- Inspect the relevant canvas with `searchDocuments` or `listObjects` before writing; use returned IDs, never guessed ones.
- Before any change, find objects named **RULES** and **MEMORY**, read them, and follow their documents. Never delete, rename, overwrite, or repurpose them; modify them only when explicitly asked.
- Before replacing a document, call `readDocument`. For several documents use `readDocuments`; for all mentions use `searchDocumentOccurrences`; for local context use `readDocumentExcerpt`.
- Prefer `createMultipleObjects` and batch `updateObjects`. Follow the live tool schemas for arguments and limits.

## Canvas

- Visible coordinates: X `450–2550`, Y `375–2125`; center `(1500, 1250)`. Keep objects at least 150px apart.
- Searches and unfiltered reads span all layers. New objects use the active layer unless `layerId` is supplied; prefer layer names. Move objects only with `moveObjectsToLayer`.
- Every object has a visible Markdown document. Put visible prose in `content`; put machine-readable facts (tags, metadata description, role, category, custom fields) in `metadata`, not a visible “Metadata” section. `updateCanvasDocument` is for project-level notes.
- A name subtitle is hidden when its document is empty. Add `content` during creation when the label matters; omit it for repetitive objects where labels would clutter.
- Default objects are emoji. A `textLabel` uses `name` as its text, requires `emoji: "🔤"`, and is for short labels/titles. A `rectangle` requires `width` and `height` and should be a structural divider, not a region containing objects.

## Links and connections

- Document content supports Markdown; raw HTML is stripped. Link to another object with its real ID: `[Label](#object-<objectId>)`. Use this canonical form instead of legacy object/document URLs. External Markdown links work normally.
- Connections are directed: `fromObjectId` is the tail and `toObjectId` the arrowhead. Create only useful relationships. In batch creation, `from`/`to` may be a new-object index or an existing object ID.
- Call `listConnections` before creating duplicates or deleting a connection by ID. Deleting an object also deletes its connections.
