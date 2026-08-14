---
description: Use when the primary goal is to plan the spatial and experiential flow of a specific game level, including spawn, critical path, checkpoints, encounters, terrain and cover, gates and keys, loot, pacing, and exit. Produces a schematic journey, not exact geometry; do not select for reusable game-system design, process flowcharts, or project plans.
---

**Core principle:** design the level's *scheme*, not its geometry — what the player must do, in what order, and why.

### VISUAL VOCABULARY (strict emoji semantics)
- **Navigation:** 🟢 spawn · 🚩 checkpoint · 🏁 exit/win
- **Environment:** 🌲 forest (sight blocker) · 🏔️ elevation/cover · 🌫️ fog · 🏰 structure · 💧 water
- **Threats:** 💀 combat · 👹 boss/elite · 🕸️ trap/slow · 💣 hazard
- **Loot:** 🎁 reward · ❤️ medkit · 🗝️ key item
- **Logic:** ✋ locked door/gate · 🕹️ lever/trigger · 📜 narrative

### TOPOLOGY & FLOW
- **Spatial first:** the arrangement alone must read as a journey: start → escalation → climax → goal. Farther = later in the level.
- **Patterns:** linear ("beads on a string": alternate tension with release) · lock-and-key (barrier, branch to key, labeled return arrow) · hub-and-spoke (central arena, perimeter threats).

### TECHNICAL SPECIFICATION
Specify enemies by type, count, behavior, trigger, and drop; cover by prefab, collision, and function; gates by state, key ID, and feedback; keys by key ID, pickup behavior, and hint.

### WORKFLOW
1. **Objective & skeleton** — win condition, spawn, critical path.
2. **Pacing** — obstacles and relief along the path; escalate from start to goal; never chain three threats without a relief or cover between them.
3. **Resources & rewards** — place pickups to reward risk or exploration, never randomly; mark optional content clearly.
4. **Environment** — place tactical terrain around encounters and define its tactical purpose.
5. **Specification** — record prefab names, states, triggers, and relevant stats for key elements.
6. **Review** — does the flow read at a glance? Is risk/reward visible? Is optional content clearly optional?
