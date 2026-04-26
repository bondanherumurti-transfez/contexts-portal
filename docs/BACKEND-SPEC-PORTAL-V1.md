# Backend spec — contextus portal v1

**Audience:** Claude Code agent implementing this in the `contextus` backend repo.
**Author:** Bondan (CTO) + Claude (planning)
**Status:** Draft for implementation — no code yet, plan PRs against this document.

---

## What we're building

A client portal for contextus customers (currently Finfloo, soon others) to view their leads, manage their knowledge base, and tune their widget — without going through Bondan for every change.

This document specifies **backend changes only**. Frontend (Next.js portal app) is a separate brief that ships after backend work lands.

The portal is **invite-only** for v1. Anyone can sign in via Google, but until Bondan links their account to a site (`kb_id`), they see a "your account is ready, we'll email you when your site is live" empty state. There is no self-serve site creation in v1.

---

## Design references

The portal frontend is specified by 10 lo-fi wireframes. Every endpoint below maps to one or more wireframes — the wireframe IDs are referenced inline so the agent understands what data shape each endpoint must return.

| ID  | Screen                                              | Endpoints involved                                              |
|-----|-----------------------------------------------------|-----------------------------------------------------------------|
| 01  | Login (Google OAuth)                                | `GET /api/auth/google/start`, `GET /api/auth/google/callback`   |
| 02  | Inbox split-pane (sessions list + transcript)       | `GET /api/portal/sessions`, `GET /api/portal/sessions/{id}`     |
| 03  | KB tab — Knowledge (profile + enrichment)           | `GET /api/portal/kb`, `POST /api/portal/kb/enrich`              |
| 04  | KB tab — Engagement (greeting + pills)              | `PATCH /api/portal/kb/pills`, `PATCH /api/portal/kb/greeting`   |
| 05  | KB tab — Behavior (custom instructions)             | `PATCH /api/portal/kb/custom-instructions`                      |
| 06  | Sites (list of sites + embed snippet)               | `GET /api/portal/sites`                                         |
| 07  | First-time user (no site connected) empty state     | `GET /api/portal/sites` returns `[]`                            |
| 08  | Inbox empty (site live, no conversations)           | `GET /api/portal/sessions` returns `[]`                         |
| 09  | Conversation detail, no brief generated             | `GET /api/portal/sessions/{id}` includes `brief: null`          |
| 10  | Add Q&A modal                                       | `POST /api/portal/kb/enrich` (single Q&A pair)                  |

Wireframes are stored separately. Reference them — do not redesign.

---

## Architecture decisions (locked)

These are not up for debate during implementation. Push back here in PR review if anything seems wrong, but don't change unilaterally.

1. **Auth: Google OAuth only.** No email/password. No magic links. Use `Authlib` for the OAuth flow (mature FastAPI integration, ~50 lines). Skip if you have a strong reason to use `google-auth` directly — flag in PR.
2. **Sessions: HTTP-only signed cookies.** Not JWTs. Same-domain portal, no mobile app, no microservices — cookies are the right tool. Use `itsdangerous` (already a Starlette dependency) for signing. Cookie name: `contextus_portal_session`. Max age: 30 days. `httponly=True`, `secure=True` (in production), `samesite="lax"`.
3. **No new infra.** Everything lives in Neon Postgres (existing `DATABASE_URL`). No Redis writes for portal session state — cookies are self-contained, signed, and verified server-side.
4. **Endpoint namespacing.** All new portal endpoints live under `/api/portal/*`. Existing widget endpoints (`/api/crawl/*`, `/api/session/*`, `/api/chat/*`) are untouched and keep working as they do today.
5. **Dual auth on existing admin endpoints.** Endpoints currently gated by `X-Admin-Secret` (pills, custom-instructions, enrich, webhook) will accept *either* admin secret *or* a portal user cookie scoped to the relevant `kb_id`. Admin path stays for ops use; portal path is for customer use. Never remove admin auth.
6. **No breaking changes to widget integration.** Finfloo's installed widget continues working byte-for-byte. Any new fields added to existing endpoints must be additive and optional.
7. **Tenant isolation is a hard invariant.** Every portal query that touches `kb_id` must filter by the authenticated user's `kb_id`s. There is no admin override in the portal namespace — admin work uses the admin endpoints, not the portal endpoints. Cross-tenant data leakage is the worst possible bug class here; design defensively.

---

## New schema

All migrations live in `backend/app/services/database.py` `init_db()` function (matching the existing pattern of `CREATE TABLE IF NOT EXISTS` on startup). No separate migration tool — keep parity with how the existing tables are managed.

### `users` table

Stores every Google account that has ever signed in to the portal.

Columns:
- `user_id` (TEXT, primary key) — generated nanoid, e.g. `usr_abc123`
- `email` (TEXT, NOT NULL, unique) — canonical Google email
- `google_sub` (TEXT, NOT NULL, unique) — Google's stable user ID (`sub` claim)
- `display_name` (TEXT) — from Google profile, nullable
- `created_at` (BIGINT, NOT NULL) — unix seconds
- `last_login_at` (BIGINT, NOT NULL) — unix seconds, updated on every login

Indexes:
- Unique on `email`
- Unique on `google_sub`

### `user_sites` table

Join table linking users to the sites (`kb_id`s) they can access. For v1, every row is implicitly an "owner" — no roles. When v2 adds team seats, this table grows a `role` column.

Columns:
- `user_id` (TEXT, NOT NULL, FK → `users.user_id`)
- `kb_id` (TEXT, NOT NULL, FK → `customer_configs.kb_id`)
- `created_at` (BIGINT, NOT NULL) — unix seconds

Primary key: `(user_id, kb_id)` composite.

Indexes:
- On `user_id` (for "list my sites" query)
- On `kb_id` (for "who has access to this site" admin queries)

### `customer_configs` — add column

Add one column to the existing table:
- `greeting` (TEXT, nullable) — custom greeting message shown to visitors before they start typing. Falls back to widget default when null. Max 200 chars enforced at the endpoint, not the DB.

Migration is additive — `ALTER TABLE customer_configs ADD COLUMN IF NOT EXISTS greeting TEXT`. Matches the existing pattern for `webhook_url`.

### Index audit on existing tables

Verify (and add if missing):
- `sessions(kb_id)` index — required for the new `GET /api/portal/sessions` endpoint to be performant. The current schema has `kb_id` as a column but I don't see an index on it in the README schema. Confirm in code, add if absent.
- `sessions(updated_at DESC)` — for sorting the inbox by most-recent.

---

## Auth flow

### Google OAuth — endpoints

**`GET /api/auth/google/start`**

- Generates a random `state` token, stores it in a short-lived signed cookie (5 min TTL).
- Redirects the browser to Google's authorization URL with the contextus client ID, redirect URI, scopes (`openid email profile`), and state.
- No body, no JSON — pure 302 redirect.

**`GET /api/auth/google/callback`**

- Receives `code` and `state` from Google.
- Verifies `state` against the signed cookie. Mismatch → 400, log as potential CSRF.
- Exchanges `code` for tokens, fetches the user info endpoint with the access token.
- Looks up `users` by `google_sub`. If exists, updates `last_login_at` and `display_name`. If not, inserts a new row.
- Issues a portal session cookie (signed, HTTP-only, 30-day max age).
- Redirects to the portal frontend home (`/` on the portal app domain).

**`POST /api/auth/logout`**

- Clears the portal session cookie.
- Returns 204 No Content.

**`GET /api/auth/me`**

- Returns the authenticated user's profile: `{ user_id, email, display_name }`.
- 401 if not authenticated.
- Used by the portal frontend on every page load to verify the session is still valid.

### Auth dependency

Implement a FastAPI dependency `get_current_user(request) -> User` that:
1. Reads the `contextus_portal_session` cookie.
2. Verifies the signature with `itsdangerous`.
3. Loads the user from `users` by `user_id` (cache for the request lifecycle).
4. Raises 401 with a JSON body `{ "error": "unauthenticated" }` on any failure.

A second dependency `get_current_user_for_kb(kb_id, user) -> None` that:
1. Verifies the user has a row in `user_sites` matching `(user_id, kb_id)`.
2. Raises 403 with `{ "error": "forbidden" }` if not.
3. This is the tenant isolation guard — every portal endpoint that takes a `kb_id` (path param, query param, or body) calls this.

### Environment variables

Add to `.env.example` and Render:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` — full URL to `/api/auth/google/callback` (e.g. `https://contextus-2d16.onrender.com/api/auth/google/callback` for prod)
- `PORTAL_FRONTEND_URL` — where to redirect after successful login (e.g. `https://portal.getcontextus.dev`)
- `PORTAL_SESSION_SECRET` — random 32+ byte string used to sign session cookies. Generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`.

All five are required when the portal is enabled. If any are missing, the auth endpoints should return 503 with a clear error pointing to the misconfigured variable, not 500. The existing widget endpoints must continue working when these vars are missing — the portal is opt-in infrastructure.

---

## Portal endpoints

All under `/api/portal/*`. All require an authenticated session (depend on `get_current_user`). Endpoints with a `kb_id` parameter additionally depend on `get_current_user_for_kb` for tenant isolation.

### `GET /api/portal/sites`

Lists the sites the authenticated user has access to.

Response shape:
```
{
  "sites": [
    {
      "kb_id": "kb_finfloo_xxx",
      "url": "https://finfloo.com",
      "name": "Finfloo",          // from KnowledgeBase.company_profile.name, fallback to URL
      "token": "pk_finfloo_xxx",  // for embed snippet
      "created_at": 1234567890,
      "last_crawled_at": 1234567890,  // KB updated_at
      "pages_indexed": 12         // KB.pages_found
    }
  ]
}
```

Empty array → frontend renders wireframe 07 (first-time user) or wireframe 06's empty state. Same screen, same data shape, same logic.

Implementation note: this is a join across `user_sites`, `customer_configs`, and `knowledge_bases`. Pre-compose in a single query if performance matters.

### `GET /api/portal/sessions`

Lists conversations for a given `kb_id`. Powers wireframe 02 (inbox) and wireframe 08 (inbox empty).

Query params:
- `kb_id` (required) — the site to fetch sessions for
- `limit` (optional, default 50, max 200)
- `cursor` (optional) — opaque pagination cursor (encode as base64 of `updated_at` timestamp)

Response shape:
```
{
  "sessions": [
    {
      "session_id": "sess_xxx",
      "created_at": 1234567890,
      "updated_at": 1234567890,
      "message_count": 8,
      "contact_captured": true,
      "contact_value": "budi@example.com",
      "preview": "First user message, truncated to ~80 chars",
      "qualification": "qualified",  // qualified | out_of_scope | unclear | suspicious | null
      "quality_score": "high",       // high | medium | low | null
      "brief_sent": true             // existing field
    }
  ],
  "next_cursor": "..."  // null if no more pages
}
```

Sort by `updated_at DESC`. Default page size 50.

The `qualification` and `quality_score` fields require persisting `LeadBrief` data. The current architecture fires briefs to webhook and never stores them. **This is a v1 backend lift.** See "Brief persistence" section below.

If briefs aren't persisted, return `qualification: null` and the frontend handles it as "unclear / no brief yet" — but the inbox tag chips on wireframe 02 won't render correctly. Strongly recommend doing the brief persistence work as part of this epic.

`preview` is the first user message text, truncated. If no user messages exist (rare — empty session), use the first assistant message as fallback. If the session has zero messages, the session shouldn't appear in the list at all (existing archiving rule: only non-empty sessions are archived).

### `GET /api/portal/sessions/{session_id}`

Full conversation detail for the inbox right-pane. Powers wireframes 02 (with brief) and 09 (without brief).

Response shape:
```
{
  "session": {
    "session_id": "sess_xxx",
    "kb_id": "kb_finfloo_xxx",
    "created_at": 1234567890,
    "updated_at": 1234567890,
    "messages": [...],         // existing Message[] shape
    "contact_captured": true,
    "contact_value": "...",
    "brief_sent": true
  },
  "brief": null | {
    "who": "...",
    "need": "...",
    "signals": "...",
    "open_questions": "...",
    "suggested_approach": "...",
    "quality_score": "high",
    "qualification": "qualified",
    "qualification_reason": "...",
    "scope_match": "...",
    "red_flags": [...],
    "contact": {...},
    "created_at": "..."
  }
}
```

Tenant guard: the loaded session's `kb_id` must match a site the user has access to. The endpoint takes `session_id`, not `kb_id`, so the guard logic is "load session, check its `kb_id` against `user_sites`."

If `brief` is null, the frontend renders the "no brief generated" panel from wireframe 09.

### `GET /api/portal/kb`

Read-only fetch of the knowledge base data for the KB tab. Powers wireframe 03.

Query params:
- `kb_id` (required)

Response shape: same as the existing `GET /api/crawl/{job_id}` (a `KnowledgeBase` model), but:
- Filter `chunks` to only include `chunks` where `source` starts with `interview:` — these are the user-added Q&A pairs that wireframe 03 renders as "your added knowledge."
- Add a derived field `enriched_chunks: [{ id, question, answer, word_count }]` where `question` is the part of `chunks[i].source` after the `interview:` prefix and `answer` is `chunks[i].text`. Frontend uses this directly — no client-side parsing.
- Strip `chunks` from the top level (or rename to `crawled_chunks` if the frontend ever needs them — for v1, omit).

This makes the wireframe 03 "your added knowledge" list trivially renderable.

### `POST /api/portal/kb/enrich`

User-scoped variant of the existing `POST /api/crawl/{kb_id}/enrich`. Powers wireframe 10 (add Q&A modal).

Request body:
```
{
  "kb_id": "kb_finfloo_xxx",
  "question": "What are your prices for monthly bookkeeping?",
  "answer": "Starts at IDR 2.5M/month..."
}
```

Note this takes a single Q&A pair, not the `answers: dict` shape of the admin endpoint. The portal modal adds one Q&A at a time. Internally, this endpoint constructs the dict and calls the same logic as the admin endpoint.

Validation:
- `question` non-empty, ≤200 chars
- `answer` non-empty, ≤2000 chars
- KB must be in `complete` status (existing rule)

Rate limiting: **add a per-user rate limit** of 10 enrichments per 10 minutes. Each enrichment regenerates the company profile (LLM call), so unlimited enrichment is a cost vector. Use the existing `check_rate_limit` Redis helper with key `enrich:{user_id}`.

Response: regenerated `CompanyProfile` (matches existing endpoint).

### `PATCH /api/portal/kb/pills`

User-scoped variant of `PATCH /api/crawl/{kb_id}/pills`. Powers wireframe 04.

Request body:
```
{
  "kb_id": "kb_finfloo_xxx",
  "pills": ["...", "...", "..."]
}
```

Validation: same as existing endpoint (exactly 3, non-empty strings).

Internally calls the same logic as the admin endpoint. Differs only in auth path.

### `PATCH /api/portal/kb/custom-instructions`

User-scoped variant of `PATCH /api/crawl/{kb_id}/custom-instructions`. Powers wireframe 05.

Request body:
```
{
  "kb_id": "kb_finfloo_xxx",
  "custom_instructions": "..." | null
}
```

Validation: same as existing (≤2000 chars, KB must have profile).

### `PATCH /api/portal/kb/greeting`

New endpoint. Sets the greeting message stored on `customer_configs.greeting`.

Request body:
```
{
  "kb_id": "kb_finfloo_xxx",
  "greeting": "Halo, ada yang bisa kami bantu?" | null
}
```

Validation:
- ≤200 chars
- Trimmed of leading/trailing whitespace
- `null` or empty string clears the greeting (widget falls back to default)

Implementation: simple update on `customer_configs` row.

**Widget integration note:** the widget currently reads greeting from `data-greeting` script attribute. After this endpoint exists, the widget should *also* fetch greeting from the `/api/session` response (which already returns `kb`-derived data like `name` and `pills`). Add `greeting` to the `SessionResponse` model and have it return the value from `customer_configs.greeting` if set, else null. The widget treats:
1. `data-greeting` attribute (existing behavior, takes precedence) — for users who set it inline
2. Server-returned `greeting` from `/api/session` — for users who set it in the portal
3. Default (`"Ask us anything..."`) — fallback

This change to the widget is small but lives outside this backend spec. Mention in PR description so the frontend agent picks it up.

---

## Brief persistence

This is the largest single piece of net-new backend work. Wireframes 02 and 09 cannot ship correctly without it.

### Current state

Briefs are generated on-demand by `POST /api/brief/{session_id}`, fired to the customer's webhook (if configured), and never stored. The session row gets `brief_sent = true` but the brief content is gone.

### What needs to change

Add a `briefs` table:
- `session_id` (TEXT, primary key, FK → `sessions.session_id`)
- `kb_id` (TEXT, NOT NULL, indexed)
- `data` (JSONB, NOT NULL) — full `LeadBrief` model JSON
- `created_at` (BIGINT, NOT NULL)

Modify `POST /api/brief/{session_id}` to write the generated brief to this table *before* firing the webhook. Webhook fire stays fire-and-forget; brief persistence is the source of truth.

The `GET /api/portal/sessions` endpoint joins `sessions` with `briefs` to populate the inbox tag chips. The `GET /api/portal/sessions/{session_id}` endpoint reads the brief from this table.

### Backfill

Existing briefs (Finfloo's 2 leads) are lost. We can't recover them. Document this in the PR — Bondan can manually re-run brief generation against archived sessions if he wants to backfill, but it's not blocking v1.

### Test additions

- `POST /api/brief/{id}` writes to `briefs` table on success
- Webhook failure does not roll back brief persistence (briefs are stored regardless of webhook outcome)
- DB write failure logs error but does not 500 the brief response (degrade gracefully)

---

## Modifications to existing endpoints

### `POST /api/crawl/seed` (admin)

Add a new optional field to the request body:
```
{
  "url": "...",
  "kb_id": "...",
  "notion_db_id": "...",
  "allowed_origins": [...],
  "lang": "...",
  "owner_email": "owner@finfloo.com"  // NEW
}
```

When `owner_email` is provided:
1. Look up or create a `users` row with that email (create with `display_name = null`, `google_sub = null` — these get filled in on first Google login).
2. Insert a `user_sites` row linking that user to the new `kb_id`.

This is the admin-side onboarding flow. Bondan runs `crawl/seed` with the new customer's email; when they later sign in via Google, the existing `users` row gets matched on `email` and updated with their `google_sub`. They land on the portal already linked to their site.

There's a subtle race here: what if the Google `sub` differs from an attacker's claim? The login flow must:
1. First try to look up by `google_sub`.
2. If no match, fall back to looking up by `email` AND `google_sub IS NULL` (this handles the seed-then-login case).
3. If found via fallback, *atomically* update the row with `google_sub`.
4. If `google_sub IS NOT NULL` and doesn't match, treat as a new user (different Google account using the same email — shouldn't happen, but be safe).

Document this in code comments. It's the kind of logic that gets refactored without anyone remembering why it's structured this way.

### Existing admin-auth endpoints — add dual auth

These endpoints currently accept only `X-Admin-Secret`:
- `PATCH /api/crawl/{kb_id}/pills`
- `PATCH /api/crawl/{kb_id}/custom-instructions`
- `POST /api/crawl/{kb_id}/enrich`
- `PUT /api/config/{kb_id}/webhook`
- `GET /api/config/{kb_id}`

For v1, **don't change these**. Leave them admin-only. The portal endpoints (`/api/portal/kb/*`) are user-facing duplicates. This avoids touching working code in a high-risk area.

We can revisit consolidating in v2 once the portal endpoints have proven out.

### `/api/session` — add greeting to response

Add `greeting: string | null` to the `SessionResponse` model. Read from `customer_configs.greeting` for the session's `kb_id`. Return `null` if column is null or row doesn't exist.

This is an additive change — existing widget reads the field if present, ignores if not.

---

## Tests

Match the existing structure under `backend/tests/`. No credentials required for any test in this set — mock everything.

### New test files

- `tests/integration/test_auth.py` — OAuth start/callback flow with mocked Google responses, session cookie issuance, `/api/auth/me` round-trip, logout flow, CSRF state validation, malformed cookies.
- `tests/integration/test_portal_sessions.py` — list and detail endpoints, pagination, tenant isolation (user A cannot see user B's sessions), brief join shape.
- `tests/integration/test_portal_kb.py` — read endpoint shape, enrich flow with rate limiting, pills/instructions/greeting writes, tenant isolation.
- `tests/integration/test_portal_sites.py` — list endpoint, empty array for new users, multi-site users.
- `tests/integration/test_brief_persistence.py` — brief is written to DB, webhook fires, DB error doesn't fail the request.
- `tests/unit/test_auth_dependency.py` — `get_current_user` and `get_current_user_for_kb` dependencies, signed cookie verification, expired/tampered cookies, missing auth.

### Tenant isolation tests — required coverage

This is the highest-risk area. Every portal endpoint must have a test that proves user A cannot access user B's data, even with a valid session cookie of their own. Specifically:

- User A authenticated, requests `kb_id` belonging to user B → 403
- User A authenticated, requests `session_id` whose `kb_id` belongs to user B → 403
- User A authenticated, no `kb_id` access at all (new user) → 403 on every kb-scoped endpoint
- Unauthenticated request to any portal endpoint → 401

These are not nice-to-have. Block the PR until they pass.

### CI

Existing `backend-tests.yml` GitHub Actions workflow picks up new tests automatically. No CI changes needed.

Verify the new auth tests don't require `GOOGLE_OAUTH_CLIENT_ID` or similar — they should mock the Google calls entirely.

---

## Out of scope for v1

Document these in PR descriptions and the spec README so they don't drift in:

- **Self-serve site registration.** No "add a new site" UI or endpoint. Sites are created by Bondan via `POST /api/crawl/seed` with the new `owner_email` field.
- **Self-serve recrawl.** The "request recrawl" button on wireframe 03 fires an email/Slack notification to Bondan, doesn't trigger a crawl. This is a frontend-only thing for v1 — no backend endpoint needed. Out of scope for this brief.
- **Analytics endpoints.** Wireframe 04 (analytics tab) is sidebar-disabled in v1. No `GET /api/portal/events` or similar.
- **Q&A edit/delete.** The `enrich` endpoint is additive-only. Modal in wireframe 10 only adds. v2 work.
- **Team/seats/RBAC.** `user_sites` is implicitly owner-only. No invites, no roles.
- **Email notifications.** No "your lead came in" emails from the portal. Existing webhook delivery to Notion/wherever is unchanged.
- **Audit log.** No `audit_log` table in v1. Worth adding in v2 but not blocking.
- **Mobile-specific layouts.** Frontend handles responsive — no API changes needed.
- **Brief regeneration / editing.** Briefs are generated once per session. Cannot be regenerated or edited via the portal.

---

## PR sequencing

The agent should plan PRs in this order. Each PR should be independently reviewable, mergeable, and shippable to staging.

1. **Schema additions.** New `users`, `user_sites`, `briefs` tables. New `customer_configs.greeting` column. Index audit on `sessions`. No endpoint changes. Migration runs on `init_db()` startup.
2. **Auth flow.** Google OAuth start/callback, session cookie, `/api/auth/me`, `/api/auth/logout`. Dependencies `get_current_user` and `get_current_user_for_kb`. Tests for all of this. No portal endpoints yet.
3. **Sites + first portal endpoint.** `GET /api/portal/sites`. This is the smallest end-to-end thing — login, fetch sites, see empty or populated list. Validates the auth + portal pattern.
4. **Brief persistence.** `briefs` table writes from `POST /api/brief/{id}`. No new portal endpoints — just modifying the existing brief generation to persist. This unblocks PR 5 below.
5. **Inbox endpoints.** `GET /api/portal/sessions` and `GET /api/portal/sessions/{id}`. Depends on PR 4 for brief data.
6. **KB read endpoint.** `GET /api/portal/kb` with the enriched-chunks shape.
7. **KB write endpoints.** `POST /api/portal/kb/enrich`, `PATCH /api/portal/kb/pills`, `PATCH /api/portal/kb/custom-instructions`, `PATCH /api/portal/kb/greeting`. Plus `/api/session` change to return `greeting`.
8. **Admin onboarding flow.** `POST /api/crawl/seed` accepts `owner_email` and creates the `users` + `user_sites` rows.

Each PR includes:
- Migration (if applicable, in `init_db()`)
- Endpoint(s)
- Tests
- A line in the README's `## Status` section

---

## Open questions for Bondan

These came up during spec writing. They block specific PRs — flag answers before the relevant PR.

1. **Cookie domain.** Will the portal frontend live on `portal.getcontextus.dev` or as a path on `getcontextus.dev` (e.g. `getcontextus.dev/portal`)? This affects the cookie's `domain` attribute. Subdomain split is cleaner for separation; same-domain is simpler for cookies. *Blocks PR 2.*
2. **Existing admin endpoints — namespace.** Should existing `PATCH /api/crawl/{kb_id}/pills` etc. get a deprecation comment now (planning to remove in v2 once portal endpoints are proven), or do they stay forever as the admin path? *Doesn't block any PR, but informs documentation.*
3. **Brief backfill.** Are the existing 2 Finfloo briefs worth recovering manually (re-running brief generation against archived sessions), or accept the data loss? *Doesn't block, but if "yes" it's a one-time admin script worth writing alongside PR 4.*
4. **Rate limit on `/api/portal/kb/enrich`.** Is 10 per 10 minutes the right limit? Customer with thoughtful tuning behavior might hit this. Consider raising to 20 per 10 min. *Blocks PR 7.*
5. **`owner_email` on seed — what if email is already linked to another `kb_id`?** Allow multi-site users (insert another `user_sites` row) or error? Recommend allow — it's the natural behavior for power users like Bondan testing his own widgets, and v2 multi-site UI assumes it works. *Blocks PR 8.*

---

## Definition of done — v1 portal backend

The portal backend is complete when:

- A user can sign in via Google and land on `/api/auth/me` returning their profile.
- An invited user (linked via `user_sites`) sees their site in `GET /api/portal/sites` with embed snippet data.
- An uninvited user signs in successfully and sees an empty `[]` from `GET /api/portal/sites`.
- The full inbox flow works: list sessions, click one, see transcript + brief (or no-brief panel).
- The KB tab works end-to-end: read profile, add Q&A, edit pills, edit greeting, edit custom instructions.
- All tenant isolation tests pass.
- The existing widget on Finfloo's site continues working with no changes.
- No existing test in `backend/tests/` regresses.
- README's `## Status` section has a "Phase 4 — Portal backend: complete" entry mirroring the existing format.

Frontend brief follows after backend is merged to `backend-development` and verified on Render staging.

---

*End of spec. Ask questions in PR comments. Don't add scope without updating this document and getting Bondan's sign-off.*
