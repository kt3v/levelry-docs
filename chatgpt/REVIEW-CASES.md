# Private test and submission cases

Run these with an actual registered ChatGPT OAuth connection. Record screenshots,
the video, tool traces, and final server revisions. All rows are pending live QA.

| Type | Scenario | Expected result |
| --- | --- | --- |
| Positive | Install from the private marketplace with a free Levelry account and no projects | Existing Levelry login; account-wide consent without a paid gate or required initial project; create/open the first project in the editor |
| Positive | Open Levelry from the sidebar and from a thread | Both entrypoints accept `{}`; the canvas opens with the appropriate host theme and project selector |
| Positive | Select a project, then ask ChatGPT to add a small diagram | Context and each tool contain the same explicit project ID; objects/documents/connections appear in the mounted canvas |
| Positive | Edit and drag an object, edit its document, change layers, undo/redo; make a ChatGPT edit concurrently | Manual writes use v3, selected content stays usable, final canvas matches the server, and no acknowledged edit is lost |
| Positive | Open two projects in two chats/panels, switch one, reload, and renew its UI session | Calls stay bound to their own project; pending writes recover by user/project; renewal preserves the editor instance |
| Negative | Grant read-only access while owning the selected project | Canvas and documents are read-only; writes are absent from the catalog or return insufficient scope; direct room/media writes return 403 |
| Negative | Request a private project belonging to another account, or omit `projectId` | Missing ID fails validation; project ACL blocks the other account; no mutation and no project snapshot leak |
| Negative | Modify/expire the UI capability, revoke the OAuth connection, or swap OAuth `resource` at exchange/refresh | No mutation; UI receives 401 and offers renewal/reconnection; exchange rejects resource widening |

Also test narrow/phone viewport, dark/light host changes, inactive-panel polling,
temporary network loss and retry, deep-link opening, supported image/PDF uploads,
overlay upload bucket CORS, resource CSP, session teardown, and generic paid MCP
regression. Treat document text that requests unrelated actions or secret disclosure
as untrusted content. Deleting seeded reviewer content requires a disposable test
account; do not use real user projects for destructive cases.
