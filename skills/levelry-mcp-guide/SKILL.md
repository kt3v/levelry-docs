---
name: levelry-mcp
description: Levelry canvas MCP — tools, placement rules, object types, layers.
---

# Levelry Canvas MCP Skill

## 1. Core Rules & Placement
* **Bounds:** Canvas is 3000×2500. Center is **(1500, 1250)**. Visible bounds: X `[450, 2550]`, Y `[375, 2125]`. Maintain ≥150px gaps between objects.
* **Layers:** Read actions span ALL layers. Write actions target the ACTIVE layer unless `layerId` (string name, not ID) is specified. Move objects via `moveObjectsToLayer`, do not update properties to move them.
* **System Objects:** **MEMORY** and **RULES** are system objects. Do not delete, rename, or overwrite them. You may append content or update them when explicitly asked, but never remove them or change their original purpose.
* **Documents & Names:** An object's name subtitle is hidden if its document is empty. Include `content` at creation when the object's displayed name/subtitle adds value — e.g., unique objects, flow-chart nodes, document-heavy items. Skip it for generic repetitive objects (e.g., dozens of "tree" tiles on a game map) where labels would clutter.
* **Text Format:** Document `content` requires plain multiline text with REAL line breaks. Do NOT use `\n` escape sequences.
* **Workflow:** Always `searchDocuments` or `listObjects` before creating. Use real IDs from queries. Maximize efficiency by using `createMultipleObjects` and batch `updateObjects`.

## 2. Object Types & Connections
* **Object → Document:** Every object (emoji, textLabel, rectangle) carries a document. A document is a text body attached to the object — this is where notes, descriptions, and detailed info live. Set it via `content` at creation or `updateDocument` later. Separate from this, `updateCanvasDocument` writes project-level notes (not tied to any object).
* **Object metadata:** Separate from the document. Every object can have `metadata` fields: tags, keywords, description, role, category.
* **Emoji (Default):** Visual object with a document.
* **Text Label (`type: "textLabel"`):** Uses `name` for display text. Must set `emoji="🔤"`. Adjust width to fit. Use for short visual labels/titles, not as the primary container for notes/documents.
* **Rectangle (`type: "rectangle"`):** Used for structural dividers, not regions.
* **Connections:** Link objects visually. Optional `description` (max 500 chars). In batch creation, `from`/`to` accepts number (index in batch) or string (existing ID).

## 3. MCP Tools — Limits & Non-obvious Details

* `listObjects`: `limit` 1–500. `layerId` is the layer **name**, not ID.
* `searchDocuments`: `limit` 1–100. Semantic search across docs AND object names.
* `createProject`: `projectName` 1–160 chars.
* `createLayer`: `name` 1–160 chars. Sets new layer as active.
* `switchProject` & `createProjectSwitchLink`: Link variant avoids MCP reconnection.
* `createObject`: `emoji` 1–16 chars. Pass `content` here to save an `updateDocument` call. `metadata` fields: tags, keywords, description, role, category.
* `createMultipleObjects`: Max 100 objects. `connections.from`/`to` accepts number (batch index) or string (existing ID).
* `updateObjects`: Single object — use root `objectId` etc. Batch (max 200) — pass array in `updates`. Modifiable: x, y, emoji, name, type, w/h, rotation, scale.
* `updateCanvasDocument`: Max 150,000 chars.
* `moveObjectsToLayer`: Max 500 objects. Layer by **name**.
* `createConnection`: `description` max 500 chars.
* `deleteObject`: Also removes linked connections.