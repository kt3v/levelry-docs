# Levelry in ChatGPT

The implementation reuses `canvas_new2`'s CanvasStage, document editor, layers,
Zustand operations, outbox, and v3 server executor. A separate entry point replaces
the website shell. ChatGPT provides the conversation and model inference.

## Source and artifacts

| Repository | Changes |
| --- | --- |
| `canvas_new2` | `src/chatgpt/`, bearer-aware storage/media adapters, single-file editor build, consent page, Netlify deployment build, local fixture host |
| `LevelryUnifiedServer` | `/mcp/chatgpt`, `/api/chatgpt`, OAuth resource binding, persistent client registration, revocable UI sessions, migration |
| `levelry-docs` | `plugins/levelry/`, private repo marketplace, registration and package validation scripts |

`npm run build:chatgpt` produces `dist-chatgpt/index.html` (~2.4 MB uncompressed).
`npm run build:deploy -- --mode production` also publishes it at
`dist/chatgpt/index.html` next to the normal site. Netlify is configured to use
this combined build. The server reads those bytes as an MCP UI resource; it
does not nest the website in another iframe.

## Authorization and project selection

- The plugin uses the existing Levelry sign-in and OAuth code flow with PKCE.
- The protected resource is `<MCP_OAUTH_ISSUER>/mcp/chatgpt`. Its audience is
  distinct from the existing `/mcp` audience. Its consent redirects are restricted
  to the exact ChatGPT host callback allowlist, preventing generic clients from
  obtaining the free integration audience with their own callback. Authorization, exchange, refresh,
  and endpoint authentication preserve that binding.
- Free Levelry accounts can approve this resource even before creating a project.
  The generic MCP/device/API-key paid requirements remain in place.
- Consent is account-wide for projects the account can access. It is explicitly
  read-only or read/write. Every tool/API request checks the selected project's ACL.
- Every project tool takes an explicit `projectId`. Creating/switching a project
  does not change token-global state used by other conversations.
- OAuth tokens remain between the host and server. The editor receives a five-minute
  signed UI capability in hidden `_meta`. The server rechecks the parent grant on
  each API request, so revocation and scope changes are enforced immediately.
- Manual edits use the existing v3 transaction path. The editor polls while visible,
  serializes flushes, and reconciles remote edits. Failed writes remain in a
  user/project-scoped IndexedDB outbox. Website and plugin persistence are separated.
- The editor publishes project/layer/selection/revision context, rather than entire
  documents. The explicit Ask ChatGPT action sends a user message to the host.

## Deploy and privately connect

Production migration was applied on 2026-09-30. Code was pushed to the existing
deployment branches (`canvas_new2/main`, `LevelryUnifiedServer/master`). Follow
[the Russian launch guide](LAUNCH.ru.md) for the remaining environment settings,
ChatGPT registration, current ZIP upload flow, and exact values.

1. Apply `LevelryUnifiedServer/supabase/migrations/20260930160000_chatgpt_oauth_clients.sql`
   through the project's normal migration workflow. This adds server-only DCR
   records and permits a null initial project for ChatGPT OAuth grants.
   Older DCR clients were memory-only; they may need one re-registration on the
   next authorization. Existing access/refresh grants retain their audience.
2. Deploy the frontend using `npm run build:deploy -- --mode production`. Verify
   `/chatgpt/index.html` is the actual single-file editor, not the SPA fallback.
3. Deploy the backend with `CHATGPT_ENABLED=false` first, then configure:
   - `CHATGPT_ENABLED=true`
   - `CHATGPT_UI_SESSION_SECRET`: a dedicated random secret, at least 32 characters
   - `CHATGPT_UI_HTML_URL=https://go.levelry.app/chatgpt/index.html`
   - `CHATGPT_OAUTH_REDIRECT_URIS`: exact callback from the ChatGPT connection settings;
     defaults to `https://chatgpt.com/connector_platform_oauth_redirect`
   - `MCP_OAUTH_ISSUER`: the canonical public backend origin
   - `MCP_OAUTH_UI_URL=https://go.levelry.app`
   - `DATABASE_URL`: existing direct/session-mode v3 database connection
   - `CHATGPT_RESOURCE_DOMAINS`: exact additional image/media origins if needed
   - `CHATGPT_CONNECT_DOMAINS`: exact additional fetch origins if needed
   - `CHATGPT_UI_DOMAIN`: dedicated HTTPS component origin, required before public UI review
   - `OPENAI_APPS_CHALLENGE`: exact domain challenge token from the OpenAI portal
   R2's public resource origin is included automatically when configured.
   Overlay presigned PUTs also require the exact R2 upload origin in connect CSP
   and bucket CORS permitting the host sandbox origin. Document uploads go via the API.
4. Verify unauthenticated `POST /mcp/chatgpt` returns 401 with protected resource
   discovery. Verify the metadata's `resource` exactly matches the registered URL.
5. In ChatGPT developer mode, create an OAuth MCP connection for:
   `https://levelry-server-hvyc5.ondigitalocean.app/mcp/chatgpt`.
   Copy its canonical `asdk_app_...` ID or full ChatGPT connection URL.
   The registration script also normalizes `plugin_asdk_app_...` wrappers.
6. Run `node scripts/register-chatgpt.mjs <technical-id>` in `levelry-docs`, then
   `node scripts/validate-plugin.mjs`.
7. Open this repo in ChatGPT desktop/Work, refresh its local marketplace,
   install Levelry from **Levelry Private Preview**, and run the cases in
   [REVIEW-CASES.md](REVIEW-CASES.md) in fresh chats and sidebar panels.
   The package's global and thread entrypoints open the same canvas resource.

For local development, keep `CHATGPT_UI_HTML_URL` unset and set
`CHATGPT_UI_HTML_PATH=../canvas_new2/dist-chatgpt/index.html`. Use a public HTTPS
tunnel for a real ChatGPT connection; its canonical URL must also be the OAuth
issuer/resource. The browser-only fixture host is available after a build at
`http://localhost:5184/scripts/chatgpt-preview.html` when running
`npm run dev -- --port 5184`. It uses fake data and does not authenticate or
contact the production backend.

## Validation status and release prerequisites

Automated server and frontend suites, persistence tests, MCP SDK contract tests,
and production website/editor builds passed locally. Tests include free-account
consent, creation of the first project, read-only ownership, PKCE/resource
binding, expired/tampered/revoked UI sessions, project ACLs, and sync recovery.
The fixture host HTTP asset is served successfully. A visual browser session and
a real ChatGPT installation were unavailable during automated implementation QA.
The user subsequently registered the MCP app and confirmed the editor with its
project selector renders in ChatGPT at the `openLevelry` entrypoint. Manual-write
sync, ChatGPT-write sync, media, and the complete review cases remain unverified.

The configured/activated remote integration, registered host connection, sidebar visual QA,
media CSP/CORS checks, and the review cases must pass before public submission.
Public submission also needs real privacy/terms/support URLs, domain verification,
a dedicated reviewer account with seeded example projects, screenshots, and a demo
video. Screenshots are optional under the current submission guide. These materials have not been fabricated or published. Add verified policy URLs to
`plugin.json`'s OpenAI interface before submitting. A published plugin is subject
to OpenAI review; a local package is not a public directory listing.

The current submission flow uploads a ZIP at `https://platform.openai.com/plugins`.
Run `node scripts/package-plugin.mjs --draft` for an initial uploadable draft, or
`--submission` once review fields are filled. The packager strips registered
`apps`/`.app.json` references from a temporary copy; those references are currently
unsupported in public ZIP submissions. The local package remains mapped to its
private ChatGPT connection.
For personal/workspace testing, `--private` preserves the registered app mapping
and creates `releases/levelry-plugin-0.1.0-private.zip`.

Rollback: set `CHATGPT_ENABLED=false`. Keep the additive client table and nullable
project columns; legacy grants retain their existing project and audience.

## Official references

- [DevDay 2026 announcement](https://openai.com/index/devday-2026-recap/)
- [MCP extensions and sidebar entrypoints](https://developers.openai.com/plugins/build/extensions)
- [ChatGPT UI integration](https://developers.openai.com/plugins/build/chatgpt-ui)
- [OAuth authentication](https://developers.openai.com/plugins/build/auth)
- [Package and privately test a plugin](https://developers.openai.com/plugins/build/plugins)
- [Submission and review](https://developers.openai.com/plugins/deploy/submission)

AI usage here is ChatGPT's native conversation usage. It does not provide ChatGPT
subscription inference to the standalone Levelry website and does not require an
OpenAI API key in either the embedded editor or browser.
