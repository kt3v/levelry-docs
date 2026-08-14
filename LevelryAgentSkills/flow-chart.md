---
description: Use when the primary goal is to visualize the logic of a process, algorithm, workflow, user journey, or decision tree as ordered canvas nodes and labeled arrows, including branches, exceptions, and loops. Do not select for spatial game-level layouts, task or project plans, or requests that only need a prose explanation.
---

### VISUAL GRAMMAR (fixed emoji per step type)
- **Logic:** 🟢 Start · 🏁 End · ❓ Decision (branching point) · 🔁 Loop
- **Actions:** ⚙️ system action · 👤 user action · 🔍 review/monitoring
- **Data:** 📄 document · 🗄️ database · 🤖 AI processing

### STRUCTURAL RULES
- Time flows **left→right**, subprocesses branch **down**; the main scenario stays one clear horizontal line.
- ❓ always has ≥2 exits, each **labeled**; ✅ Yes continues straight, ❌ No/Error goes down.
- Labels: 1–3 words.

### GENERATION
1. Define the spine: happy path 🟢→🏁.
2. Add decisions only where the outcome changes the next action.
3. Label branches with their condition or result.
4. Review: the main path, exceptions, and loops must be understandable at a glance.
