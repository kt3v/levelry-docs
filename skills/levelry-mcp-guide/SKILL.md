---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers. Use when reading or writing project documentation, notes, diagrams, or structured data on a Levelry canvas via MCP.
---

# Levelry Canvas MCP Skill

## 1. Core Rules & Placement
* **Bounds:** Canvas is 3000×2500. Center is **(1500, 1250)**. Visible bounds: X `[450, 2550]`, Y `[375, 2125]`. Maintain ≥150px gaps between objects.
* **Layers:** Read actions span ALL layers. Write actions target the ACTIVE layer unless `layerId` (layer name or ID; prefer names) is specified. Move objects via `moveObjectsToLayer`, do not update properties to move them.
* **System Objects:** Before making changes, search for objects named **RULES** and **MEMORY**, read their documents, and follow the rules described there. Do not delete, rename, or overwrite them. You may append content or update them when explicitly asked, but never remove them or change their original purpose.
* **Documents & Names:** An object's name subtitle is hidden if its document is empty. Include `content` at creation when the object's displayed name/subtitle adds value — e.g., unique objects, flow-chart nodes, document-heavy items. Skip it for generic repetitive objects (e.g., dozens of "tree" tiles on a game map) where labels would clutter.
* **Text Format:** Document `content` requires plain multiline text with REAL line breaks. Do NOT use `\n` escape sequences.
* **Workflow:** Always `searchDocuments` or `listObjects` before creating. Use real IDs from queries. Maximize efficiency by using `createMultipleObjects` and batch `updateObjects`.

## 2. Object Types & Connections
* **Object → Document:** Every object (emoji, textLabel, rectangle) carries a document. A document is a visible text body attached to the object — this is where notes, descriptions, and detailed info live. Set it via `content` at creation or `updateDocument` later. Do not put structured metadata or "Metadata:" sections in document content unless the user explicitly asks for visible text. Separate from this, `updateCanvasDocument` writes project-level notes (not tied to any object).
* **Object metadata:** Separate from the document. Every object can have `metadata` fields for machine-readable facts: tags, keywords, description, role, category, plus custom fields such as genre, mechanic_complexity, core_loop_type, player_skill_type, or balancing_status. Use `metadata` on create tools or `updateObjectMetadata` later.
* **Emoji (Default):** Visual object with a document.
* **Text Label (`type: "textLabel"`):** Uses `name` for display text. Must set `emoji="🔤"`. Adjust width to fit. Use for short visual labels/titles, not as the primary container for notes/documents.
* **Rectangle (`type: "rectangle"`):** Used for structural dividers, not regions.
* **Connections:** Link objects only when the relationship is useful and intentional; avoid visual clutter. Optional `description` (max 500 chars). In batch creation, `from`/`to` accepts number (index in batch) or string (existing ID). Connections are **directed** — `fromObjectId` is the source (tail), `toObjectId` is the target (arrowhead). Use `listConnections` to read existing connections before creating or deleting.

## 3. Markdown & Links in Documents
* **Format:** Document `content` is **Markdown** (raw HTML is stripped). Supported: headings `#`–`###`, `**bold**`, lists `-` / `1.`, tables `| col |`, quotes `>`, divider `---`, links `[text](url)`. Use real line breaks, not `\n` escapes.
* **Link to another object:** write `[Label](#object-<objectId>)` — the app renders it as an internal link; clicking selects the object, switches to its layer, and scrolls to it. Use real IDs from `listObjects`/`searchDocuments`. Always prefer this over mentioning an object by name in plain text.
* **Legacy link forms** (`canvas-object://<id>`, `obj://<id>`, `obj:<id>`, bare `#object-<id>`, `#doc-<docId>`) are auto-normalized to `#object-` links on load — never write them; use the canonical form above.
* **External URLs** (`[text](https://…)`) work as normal links.

## 4. MCP Tools — Limits & Non-obvious Details

* `listObjects`: `limit` 1–500 (default 200). `layerId` accepts layer name or ID; prefer names (e.g., `"Layer 1"`).
* `searchDocuments`: `limit` 1–100 (default 20). **Full-text substring search** (not semantic/fuzzy) across object names, document content, tags, keywords, role, category, description, and other metadata. Use exact keywords.
* `readDocument`: Returns full object info + document content for one object. Always call before editing a document.
* `readDocuments`: Batch read, max 20 `objectIds` at once. Prefer over repeated `readDocument` calls.
* `updateDocument`: Replace visible document content for one object. Always `readDocument` first to avoid overwriting. Do not use it for metadata/special fields.
* `createProject`: `projectName` 1–160 chars.
* `createLayer`: `name` 1–160 chars. Sets new layer as active.
* `switchProject` & `createProjectSwitchLink`: Link variant avoids MCP reconnection.
* `createObject`: `emoji` 1–16 chars. Pass `content` here to save an `updateDocument` call. Pass structured fields in `metadata` (tags, keywords, description, role, category, or custom fields). For `type: "rectangle"`, `width` and `height` are required (20–4000 each).
* `createMultipleObjects`: Max 100 objects. `connections.from`/`to` accepts number (batch index) or string (existing ID).
* `updateObjects`: Single object — use root `objectId` etc. Batch (max 200) — pass array in `updates`. Modifiable: x, y, emoji, name, type, w/h, rotation, scale. Cannot update `layerId` here — use `moveObjectsToLayer`.
* `updateObjectMetadata`: Merge structured metadata/special fields into one object. Use this for tags, keywords, classification, genre, mechanics, balancing status, and other machine-readable fields instead of writing them into the document body.
* `updateCanvasDocument`: Max 150,000 chars.
* `moveObjectsToLayer`: Max 500 objects. Layer by name or ID; prefer names.
* `listConnections`: `limit` 1–500 (default 200). Filter by `fromObjectId` or `toObjectId`. Response includes object names. Call before `deleteConnection` to find the ID.
* `createConnection`: `description` max 500 chars. Connection is directed — arrow goes **from** `fromObjectId` **to** `toObjectId`.
* `deleteConnection`: Delete by `connectionId`. Use `listConnections` first to find the ID.
* `deleteObject`: Also removes all linked connections.
