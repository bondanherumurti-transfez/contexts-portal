# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What this is

`contextus-portal` is a Next.js 15 client portal for contextus customers (invite-only, v1). Customers sign in via Google OAuth, then view leads in the inbox, manage their knowledge base, and see their site embed snippet. The backend is a FastAPI app (`https://backend.backend-development.getcontextus.dev`) — this repo is frontend-only.

Design references: `docs/FRONTEND-SPEC-PORTAL-V1.md`, `docs/BACKEND-SPEC-PORTAL-V1.md`, `docs/contextus-portal-wireframes-v1.html`. These are the source of truth — do not redesign, port from them.

**Backend repo context:** `docs/contextus-readme.md` is a symlink to the contextus backend repo's README. Read it to understand the full backend architecture: all API endpoints and their shapes, Pydantic data models (`KnowledgeBase`, `LeadBrief`, `CompanyProfile`, `SessionResponse`), storage layout (Upstash Redis + Neon Postgres), and the existing test structure. The TypeScript types in `src/lib/api/types.ts` must match the Pydantic models documented there.

---

## Commands

```bash
pnpm dev          # start dev server (http://localhost:3000)
pnpm build        # production build
pnpm lint         # eslint
pnpm test         # vitest unit tests
pnpm test:e2e     # playwright e2e tests
pnpm test:e2e:ui  # playwright with UI
```

For a single unit test file:
```bash
pnpm test src/lib/api/client.test.ts
```

---

## Architecture

### Stack (locked — do not change)

- **Next.js 15 App Router**, TypeScript strict, Node 20+
- **Tailwind CSS** only — no CSS modules, no styled-components, no inline styles except truly dynamic values
- **TanStack Query v5** for all server state; `useState` for local UI state only — no Zustand, no Redux, no Context API for state
- **react-hook-form + zod** for all forms
- **lucide-react** for icons — no other icon library
- **vitest + React Testing Library** for unit tests; **Playwright** for e2e

### App Router layout

```
src/app/
├── layout.tsx               # root layout — DM Sans/Mono fonts, QueryProvider
├── page.tsx                 # redirects to /inbox (authed) or /login
├── login/page.tsx           # wireframe 01 — Google OAuth entry; ?error=auth_failed shows generic banner, ?error=not_invited shows "contact us" banner
├── auth/callback/page.tsx   # OAuth landing — verifies cookie, redirects to /inbox
└── (authenticated)/         # route group with auth guard layout
    ├── layout.tsx           # sidebar + topbar shell, useCurrentUser guard
    ├── inbox/page.tsx       # wireframes 02, 08, 09 — split pane
    ├── knowledge-base/
    │   ├── layout.tsx       # tabs strip
    │   ├── knowledge/       # wireframe 03
    │   ├── engagement/      # wireframe 04
    │   └── behavior/        # wireframe 05
    └── sites/page.tsx       # wireframes 06, 07
```

### Auth

Cookie-based, fully managed by the backend. The frontend never reads or stores the `contextus_portal_session` cookie — it just sends `credentials: "include"` on every request.

Auth guard lives in `src/app/(authenticated)/layout.tsx`: calls `useCurrentUser()`, shows a spinner while loading, redirects to `/login` on 401. Do **not** use Next.js `middleware.ts` for auth — it can't read HTTP-only cookies from a different domain.

Login flow: `window.location.href = "${API_BASE}/api/auth/google/start"` (full-page redirect, not a fetch).

Login error states (query param `?error=`):
- `auth_failed` — generic OAuth failure or user cancelled the Google consent screen
- `not_invited` — email not found in pre-seeded users; backend should redirect here instead of creating a new row (invite-only enforcement)

### API client (`src/lib/api/client.ts`)

Single fetch wrapper used by all API modules. Responsibilities:
1. Prepend `NEXT_PUBLIC_API_BASE`
2. Set `credentials: "include"` on every request
3. Parse JSON response
4. On 401: throw `ApiError(401)` — the auth guard handles the redirect
5. On 4xx/5xx: throw typed `ApiError` with status + parsed body

Per-resource modules (`auth.ts`, `sites.ts`, `sessions.ts`, `kb.ts`) export thin wrappers over the client. All TypeScript types for API shapes live in `src/lib/api/types.ts` — must match the backend's Pydantic schemas.

### TanStack Query conventions

- Stale time: 30s default; 5 min for sites and KB (change infrequently)
- Retry: 1 on network error, 0 on 4xx
- Refetch on window focus: enabled
- Optimistic updates on mutations: pills, greeting, custom-instructions update cache immediately, roll back on error (see pattern in spec)
- Query keys: `["user"]`, `["sites"]`, `["sessions", kb_id]`, `["session", session_id]`, `["kb", kb_id]`

### Forms

All editing surfaces use react-hook-form + zod. Schemas live next to the component that uses them. Validation constraints must match the backend exactly:

| Field | Constraint |
|---|---|
| Greeting | max 200 chars |
| Pills | exactly 3, each non-empty |
| Custom instructions | max 2000 chars, nullable |
| Q&A question | required, max 200 chars |
| Q&A answer | required, max 2000 chars |

Save pattern: greeting, pills, custom instructions auto-save on blur (debounced 500ms), showing a "saved · Xs ago" mono indicator. Q&A uses explicit submit in modal.

### Design tokens

All tokens come from the widget design guideline and are registered in `tailwind.config.ts`:

**Colors:** `primary` (#000), `background` (#FFF), `background-secondary` (#F0F0F0), `background-tertiary` (#FAFAFA), `border` (#E0E0E0), `text-body` (#222), `text-muted` (#888), `text-placeholder` (#BBB), `visitor-bubble` (#111), `error-bg/text` (#FCEBEB/#A32D2D), `warning-bg/text` (#FAEEDA/#854F0B), `success-bg/text` (#E1F5EE/#0F6E56)

**Fonts:** DM Sans (300/400/500/700) for UI; DM Mono (400/500) for labels, metadata, mono values

**Border:** always `0.5px solid #E0E0E0` — use a custom `border-hairline` Tailwind utility (falls back to 1px where sub-pixel rendering isn't supported)

**Radii:** 4px buttons/inputs, 8px cards, 12px modals

The portal is **denser than the widget** — 11–13px body text, 8–12px gaps, more information per screen.

### URL state

Navigation state lives in the URL, never in React state or localStorage. Selected inbox session: `/inbox?session=sess_xxx`. Active KB sub-tab: path-based. Users can refresh, share links, or open new tabs and land on the same view.

### Environment

```
NEXT_PUBLIC_API_BASE=https://backend.backend-development.getcontextus.dev  # prod
NEXT_PUBLIC_API_BASE=http://localhost:8000                  # local dev
```

Validated at boot in `src/lib/env.ts` using zod — fail fast with a clear message if missing.

---

## Key implementation notes

**CORS:** frontend must send `credentials: "include"` on every request; backend must include the portal origin in `allow_origins` with `allow_credentials=True`. Preview deploys on Vercel use pattern `https://contextus-portal-*.vercel.app` — backend CORS must cover this pattern.

**Inbox page complexity:** three distinct states from the same route — populated split-pane (wireframe 02), empty with embed snippet (wireframe 08), populated but selected session has no brief (wireframe 09). All driven by API response shapes, not separate routes.

**First-time user state (wireframe 07):** sidebar items inbox/KB/analytics are visually disabled (opacity, non-clickable) when `GET /api/portal/sites` returns `[]`. This is the only state where sidebar navigation changes.

**Analytics tab:** always rendered in sidebar but visually disabled (lower opacity, no click handler) in v1 — it's not a feature flag, just a locked visual state.

**Self-serve recrawl button:** for v1, "request recrawl" on the Knowledge tab is a `mailto:` link or info modal, not an API call. No backend endpoint exists for this.

**Brief data:** `GET /api/portal/sessions/{id}` returns `brief: null` when no brief was generated. The right pane renders the "no brief" panel from wireframe 09 in this case.

---

## Tests

Unit tests (vitest): API client 401 behavior, error parsing, mutation invalidation patterns, form validation schemas, components with logic (`Tag` color per qualification, `Snippet` copy, `WidgetPreview` pill rendering). Skip snapshot tests and pure presentational components.

E2E tests (Playwright): one happy-path test per major flow with mocked backend via `page.route`. Stub `/api/auth/me` to simulate authenticated state — no real OAuth in tests.

---

## PR sequencing (from spec)

1. Project setup — Tailwind tokens, fonts, env validation, base layout
2. Auth shell — login page, callback page, API client, auth guard
3. Sidebar + topbar shell — nav, user menu, wireframe 07 hardcoded
4. Sites page — `useSites`, `SiteCard`, embed snippet
5. Inbox page — sessions list, conversation detail, empty state
6. KB tab read-only — profile, enriched knowledge list
7. KB write surfaces — Add Q&A modal, pills, greeting, custom instructions editors
8. Polish — empty/loading/error state audit, accessibility, responsive check

Each PR requires backend PRs to be merged before the corresponding frontend PR can work end-to-end (see `BACKEND-SPEC-PORTAL-V1.md` for backend PR sequencing).
