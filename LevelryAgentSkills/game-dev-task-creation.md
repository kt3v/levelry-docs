---
description: Use when existing game feature documentation and project context must be converted into independently testable, programmer-ready implementation tickets with scope, requirements, definition of done, dependencies, and technical notes. Do not select for inventing or designing the feature, producing a final concept, or organizing general or personal tasks.
---

A task is not a copy of the documentation. It is a **clear technical assignment** a programmer can pick up and work on without additional questions.

### INPUT
Before creating a task: **feature documentation** (link or contents), **project context** (tech stack, patterns, existing systems), **priority and scope** (MVP / full implementation / prototype).

### TASK STRUCTURE
1. **Title** — brief, specific, starts with a verb ("Implement inventory drag & drop", not "Inventory").
2. **Description** — 2–4 sentences: *what* needs to be done, *why* (gameplay context), *where* it's used (system/screen/scene).
3. **Documentation link** — reference the doc; if it covers more than the task, specify the relevant sections.
4. **Requirements** — numbered, specific technical requirements. Don't rewrite the docs — extract the essentials.
5. **Definition of Done** — checklist: all requirements implemented, code review passed, tests for core logic, no console errors, verified on target platforms.
6. **Technical notes** (optional) — implementation hints, references to existing systems, constraints.

### DECOMPOSITION
Decompose when the feature touches **multiple systems** or takes **more than 2–3 days** for one developer. Break it down by architectural layer or functional block into components; create a **separate task per component**, adding `Dependencies:` and `Related tasks:`.

Principles: each component is independently testable · minimize coupling (interfaces/events) · clear boundaries (one component = one layer/subsystem) · 0.5–3 days of work per component.

### PROCESS
1. Read the documentation in full.
2. Extract key requirements — remove noise, keep actionable items.
3. Estimate: if > 3 days — decompose.
4. Write the task per the structure above.
5. Link documentation with specific sections.
6. Specify dependencies.
7. Verify: can a programmer start working on this task right now?

### ANTI-PATTERNS
Copying the entire documentation into the task · vague wording ("make it good") · one giant task for a whole feature · no documentation link · no definition of done.
