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
pnpm storybook    # Storybook dev server (http://localhost:6006)
pnpm build-storybook  # static Storybook build
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
    ├── layout.tsx           # auth guard (useCurrentUser + useSites) + Sidebar + Topbar shell
    ├── inbox/
    │   ├── page.tsx         # Suspense wrapper — required for useSearchParams on direct URL visits
    │   └── InboxContent.tsx # wireframes 02, 08, 09 — split pane, all three states
    ├── knowledge-base/
    │   ├── layout.tsx       # tabs strip (knowledge / engagement / behavior)
    │   ├── page.tsx         # redirects to /knowledge-base/knowledge
    │   ├── knowledge/       # wireframe 03 (placeholder until PR 6)
    │   ├── engagement/      # wireframe 04 (placeholder until PR 7)
    │   └── behavior/        # wireframe 05 (placeholder until PR 7)
    └── sites/
        └── page.tsx         # wireframes 06 (stub) + 07 (first-time empty state, fully implemented)
```

### Shell components (`src/components/shell/`)

**`Sidebar.tsx`** — takes `hasSites: boolean` prop. When `false`, inbox/KB/analytics are `div` (non-clickable, opacity-50); only Sites is a `<Link>`. Analytics is always disabled regardless of `hasSites`. User section: initials avatar + first name + chevron; clicking opens a dropdown with "sign out" (clears `["user"]` query cache then `router.replace("/login")`).

**`Topbar.tsx`** — takes `sites: Site[]`. Shows `sites[0].url ?? sites[0].name ?? "your sites"` on the left; shows "your sites" when on `/sites` route. On `/knowledge-base/*` routes, shows "last crawled {date} · {N} pages" (from `sites[0]`) on the right in mono.

### Auth

Cookie-based, fully managed by the backend. The frontend never reads or stores the `contextus_portal_session` cookie — it just sends `credentials: "include"` on every request.

Auth guard lives in `src/app/(authenticated)/layout.tsx`: calls `useCurrentUser()` (spinner while loading, redirect on error) and `useSites()` (drives `hasSites` prop on Sidebar). Do **not** use Next.js `middleware.ts` for auth — it can't read HTTP-only cookies from a different domain.

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

**`kb.ts`** — `getKB(kb_id)`, `enrichKB(kb_id, question, answer)`, `updatePills(kb_id, pills)`, `updateGreeting(kb_id, greeting)`, `updateCustomInstructions(kb_id, value)`. All KB mutations take `kb_id` in the body (portal auth pattern).

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

All tokens come from the widget design guideline and are defined in `src/app/globals.css` via Tailwind 4's `@theme` directive (not `tailwind.config.ts`):

**Colors:** `primary` (#000), `background` (#FFF), `background-secondary` (#F0F0F0), `background-tertiary` (#FAFAFA), `border` (#E0E0E0), `text-body` (#222), `text-muted` (#888), `text-placeholder` (#BBB), `visitor-bubble` (#111), `error-bg/text` (#FCEBEB/#A32D2D), `warning-bg/text` (#FAEEDA/#854F0B), `success-bg/text` (#E1F5EE/#0F6E56)

**Fonts:** DM Sans (300/400/500/700) for UI; DM Mono (400/500) for labels, metadata, mono values

**Border:** always `0.5px solid #E0E0E0` — custom `@utility` directives in `globals.css`: `border-hairline` (all sides), `border-hairline-t/b/r/l` (directional)

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

**KB tabs:** All three sub-tabs (`/knowledge-base/knowledge|engagement|behavior`) share one `useKB(kb_id)` query (staleTime 5 min, TanStack Query deduplicates). `kb_id` comes from `useSites()[0].kb_id`. Mutations (pills, greeting, custom-instructions) use optimistic updates with rollback.

**Gaps section:** `CompanyProfileKB.gaps` is optional — backend `CompanyProfileResponse` does not include it in the current phase. The gaps section on the knowledge tab is conditionally rendered only when `company_profile?.gaps?.length > 0` and is hidden by default.

**KB write save indicators:** each editable section (`greeting`, `pills`, `custom_instructions`) stores a `savedAt` timestamp after a successful mutation and displays "saved · Xs ago" in `font-mono text-[10px] text-text-muted` next to the section header. Timer ticks via `setInterval` while `savedAt` is set.

---

## Testing rules

**Tests and docs are required before every commit.** Do not push without them.

- For every new feature or significant fix: write vitest unit tests + Playwright e2e tests + update CLAUDE.md.
- Unit tests live in `tests/unit/`. E2e tests live in `tests/e2e/`.
- E2e tests mock the backend via `page.route()` — no real server required.

## Tests

Unit tests (vitest): API client 401 behavior, error parsing, mutation invalidation patterns, form validation schemas, components with logic (`Tag` color per qualification, `Snippet` copy, `WidgetPreview` pill rendering), inbox helpers (`relativeTime`, `extractContactValue`). Skip snapshot tests and pure presentational components.

E2E tests (Playwright): one happy-path test per major flow with mocked backend via `page.route`. Stub `/api/auth/me` and `/api/portal/sites` to simulate authenticated state — no real OAuth in tests.

- `tests/unit/lib/inbox.test.ts` — `relativeTime`, `extractContactValue` (contact JSON parsing)
- `tests/unit/lib/kb.test.ts` — all KB API functions (`getKB`, `enrichKB`, `updatePills`, `updateGreeting`, `updateCustomInstructions`), error propagation
- `tests/e2e/inbox.spec.ts` — session list renders, click session → brief panel, no-brief panel, direct URL visit navigation, empty state, search filtering, load-older pagination
- `tests/e2e/kb.spec.ts` — knowledge tab (profile, Q&A list, add modal), engagement tab (greeting/pills seed from API, save on blur), behavior tab (examples conditional, reset, warning box), topbar KB metadata

## Storybook

Storybook 10 (`pnpm storybook`, runs at `http://localhost:6006`) is the **primary design reference** for this project. Before implementing any UI feature, check the relevant story for the expected layout, states, and props. After implementing or changing a component, update its story to match.

**Setup:** `.storybook/main.ts` (stories glob, `@storybook/nextjs` + `@storybook/addon-docs`), `.storybook/preview.ts` (global `QueryClientProvider` decorator with seeded preview user + empty sites, imports `globals.css`), `.storybook/preview-head.html` (Google Fonts).

**Mandatory rules:**
- Every component with multiple meaningful visual states must have a story. Skip page-level layouts and pure structural wrappers.
- When you change a component's props, behavior, or visual output — update its `.stories.tsx` to reflect the change. Stories are documentation; stale stories mislead future agents.
- Every story file must include `parameters.docs.description.component` (component-level description) and JSDoc on every prop in the interface. This is what populates the Docs tab.
- The global decorator provides `QueryClientProvider` — do not wrap individual stories manually.
- Use `parameters.nextjs.navigation.pathname` to control the active nav item for `Sidebar` stories.

**All current stories:**

| Story path | Component file | Wireframe(s) |
|---|---|---|
| `UI/Spinner` | `src/components/ui/Spinner.tsx` | — |
| `UI/Tag` | `src/components/ui/Tag.tsx` | 02, 09 |
| `UI/Button` | `src/components/ui/Button.tsx` | 03, 10 |
| `UI/Tabs` | `src/components/ui/Tabs.tsx` | 03–05 |
| `UI/EmptyState` | `src/components/ui/EmptyState.tsx` | 07, 08 |
| `UI/Snippet` | `src/components/ui/Snippet.tsx` | 06, 08 |
| `UI/KeyValue` | `src/components/ui/KeyValue.tsx` | 03 |
| `Shell/Sidebar` | `src/components/shell/Sidebar.tsx` | 02–09 |
| `Shell/Topbar` | `src/components/shell/Topbar.tsx` | 03–09 |
| `Inbox/SessionListItem` | `src/components/inbox/SessionListItem.tsx` | 02, 09 |
| `Inbox/TranscriptMessage` | `src/components/inbox/TranscriptMessage.tsx` | 02, 09 |
| `Inbox/BriefPanel` | `src/components/inbox/BriefPanel.tsx` | 02 |
| `Inbox/NoBriefPanel` | `src/components/inbox/NoBriefPanel.tsx` | 09 |
| `KB/GapCard` | `src/components/kb/GapCard.tsx` | 03 |
| `KB/QACard` | `src/components/kb/QACard.tsx` | 03, 05 |
| `KB/WidgetPreview` | `src/components/kb/WidgetPreview.tsx` | 04 |
| `KB/AddQAModal` | `src/components/kb/AddQAModal.tsx` | 10 |
| `Sites/SiteCard` | `src/components/sites/SiteCard.tsx` | 06 |

**Docs tab:** each story title maps to a docs URL — e.g. `UI/Button` → `http://localhost:6006/?path=/docs/ui-button--docs`. The docs tab shows the component description, an interactive canvas, the args table with prop descriptions, and all individual stories.

---

## PR sequencing (from spec)

1. ✅ Project setup — Tailwind tokens, fonts, env validation, base layout
2. ✅ Auth shell — login page, callback page, API client, auth guard
3. ✅ Sidebar + topbar shell — nav, user menu, `useSites`, wireframe 07
4. Sites page — full `SiteCard`, embed snippet (stub exists, needs PR 4 backend)
5. ✅ Inbox page — sessions list, brief panel, no-brief panel, empty state (wireframes 02, 08, 09)
6. ✅ KB tab read-only — profile, enriched knowledge list (implemented as part of PR 6+7 combined)
7. ✅ KB write surfaces — Add Q&A modal, pills editor, greeting editor, custom instructions editor
8. Polish — empty/loading/error state audit, accessibility, responsive check

Each PR requires backend PRs to be merged before the corresponding frontend PR can work end-to-end (see `BACKEND-SPEC-PORTAL-V1.md` for backend PR sequencing).
