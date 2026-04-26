# Frontend spec — contextus portal v1

**Audience:** Claude Code agent implementing this in a new `contextus-portal` repo.
**Author:** Bondan (CTO) + Claude (planning)
**Status:** Draft for implementation — no code yet, plan PRs against this document.

---

## What we're building

A Next.js client portal for contextus customers. Sign in with Google, view leads, manage knowledge base, view sites. The portal consumes the backend specified in `BACKEND-SPEC-PORTAL-V1.md`.

This is a **separate repo** (`contextus-portal`), deployed independently to Vercel. It hits the existing FastAPI backend at `https://contextus-2d16.onrender.com` (or a configurable base URL).

The portal is **invite-only**. Anyone can sign in via Google, but until Bondan links their account to a site server-side, they see a soft empty state ("your account is ready, we'll email you when your site is live"). There is no self-serve site creation in v1.

---

## Design references

Two canonical sources. Do not redesign anything — port from the references.

### Lo-fi wireframes (10 total)

Every screen and state in v1 is wireframed. The wireframes are the source of truth for layout, density, and which UI elements appear.

| ID  | Screen                                              | Route                              |
|-----|-----------------------------------------------------|-------------------------------------|
| 01  | Login (Google OAuth)                                | `/login`                            |
| 02  | Inbox split-pane (sessions list + transcript)       | `/inbox` (with `?session=xxx`)      |
| 03  | KB tab — Knowledge (profile + enrichment)           | `/knowledge-base/knowledge`         |
| 04  | KB tab — Engagement (greeting + pills)              | `/knowledge-base/engagement`        |
| 05  | KB tab — Behavior (custom instructions)             | `/knowledge-base/behavior`          |
| 06  | Sites (list of sites + embed snippet)               | `/sites`                            |
| 07  | First-time user (no site connected) empty state     | `/sites` when sites array is empty  |
| 08  | Inbox empty (site live, no conversations)           | `/inbox` when sessions array is empty |
| 09  | Conversation detail, no brief generated             | `/inbox?session=xxx` when brief is null |
| 10  | Add Q&A modal                                       | Modal triggered from `/knowledge-base/knowledge` |

### Visual language tokens (from widget guideline)

Lifted directly from `docs/contextus-widget-design-guideline.html`. Port to `tailwind.config.ts` as theme extensions. Do not introduce new colors, spacings, or radii outside this set — if the wireframe shows a value not in this list, ask before inventing a new token.

**Colors:**
- `primary` — `#000000` (text, primary actions, active states)
- `background` — `#FFFFFF`
- `background-secondary` — `#F0F0F0` (input fields, soft sections)
- `background-tertiary` — `#FAFAFA` (subtle dividers, code snippets)
- `border` — `#E0E0E0` (all hairline borders, always 0.5px)
- `text-body` — `#222222`
- `text-muted` — `#888888` (labels, metadata, captions)
- `text-placeholder` — `#BBBBBB`
- `visitor-bubble` — `#111111` (dark bubble for chat replay in transcript view)
- `error-bg` / `error-text` — `#FCEBEB` / `#A32D2D`
- `warning-bg` / `warning-text` — `#FAEEDA` / `#854F0B`
- `success-bg` / `success-text` — `#E1F5EE` / `#0F6E56`

**Typography:**
- Sans: `DM Sans` weights 300, 400, 500, 700 — body, headings, UI
- Mono: `DM Mono` weights 400, 500 — labels, metadata, code snippets, kbd

**Type scale:** match what's in the wireframes. As reference:
- Page titles: 17–20px, weight 500, letter-spacing -0.3px
- Section headers: 12px, weight 500
- Body: 13px (default), 11px (small/labels), 15px (input fields only — matches widget)
- Mono labels: 10–11px, letter-spacing 0.5–1.5px, often uppercase

**Border radii:**
- Buttons / inputs: 4px (portal) — note this differs from widget's 16px input radius. Portal is denser.
- Cards / sections: 8px
- Modals / large surfaces: 12px

**Borders:**
- All borders are `0.5px solid #E0E0E0`. Tailwind doesn't ship 0.5px out of the box — use a custom utility (`border-hairline`) that resolves to `1px solid` in browsers that don't support sub-pixel rendering, and `0.5px solid` where supported. Set up via plugin in `tailwind.config.ts`.

**Spacing:** stick to Tailwind's default 4px grid. Most screens use `p-3` (12px) and `p-4` (16px) for padding, `gap-2` and `gap-3` for flex/grid gaps.

The portal is **denser than the widget** — it's an admin tool, not a consumer interface. Expect smaller font sizes (11–13px body), tighter spacing (8–12px gaps), and more information per screen.

---

## Architecture decisions (locked)

1. **Next.js 15 App Router.** TypeScript strict mode. Node 20+.
2. **Tailwind CSS** for all styling. No CSS modules, no styled-components, no inline styles outside truly dynamic cases.
3. **TanStack Query (React Query) v5** for server state. Native `useState` for local UI state. No Zustand, no Redux, no Context API for state.
4. **No component library.** Build the components from scratch — the design is minimal enough that shadcn/ui or similar is overkill and brings styling baggage. The exception is icons: use `lucide-react` (matches what your widget already uses).
5. **Cookie-based auth.** The backend issues an HTTP-only signed cookie on OAuth callback. The frontend never reads the cookie — it just makes credentialed requests (`credentials: "include"`) and trusts the backend's 401s.
6. **Forms: react-hook-form + zod.** Lightweight, no controller boilerplate, schema validation matches the backend's Pydantic models.
7. **Routing: Next.js file-based.** No client-side router library.
8. **State persistence: URL.** Selected session in inbox, active KB sub-tab, etc. — all in query params or path. Don't put navigation state in `localStorage` or React state. The user should be able to refresh, share a link, or open in a new tab and land on the same view.
9. **Deployment: Vercel.** Free tier handles current traffic. Production domain matches the backend's `PORTAL_FRONTEND_URL` env var.

---

## Repo setup

New repo: `contextus-portal`. Initialize with:

- `pnpm create next-app@latest` — TypeScript yes, Tailwind yes, App Router yes, src dir yes, import alias yes (`@/*`)
- Add `prettier`, `eslint-config-prettier`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `date-fns`, `clsx` (or `tailwind-merge` + `clsx`)
- Add `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@vitejs/plugin-react` for unit tests
- Add `playwright` for e2e tests (one happy-path test per major flow, not exhaustive)

`README.md` should document: setup, env vars, dev server command, test commands, deployment notes.

---

## Folder structure

```
contextus-portal/
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .env.local                   # gitignored
├── playwright.config.ts
├── vitest.config.ts
├── public/
│   └── favicon.svg              # contextus logo, 64x64 viewBox
└── src/
    ├── app/
    │   ├── layout.tsx           # root layout, fonts, providers
    │   ├── page.tsx             # redirect to /inbox if signed in, /login if not
    │   ├── login/
    │   │   └── page.tsx         # wireframe 01
    │   ├── (authenticated)/     # route group with auth guard layout
    │   │   ├── layout.tsx       # sidebar + topbar shell, used by all auth'd pages
    │   │   ├── inbox/
    │   │   │   └── page.tsx     # wireframes 02, 08, 09 (split-pane via ?session= param)
    │   │   ├── knowledge-base/
    │   │   │   ├── layout.tsx   # tabs strip
    │   │   │   ├── page.tsx     # redirect to /knowledge-base/knowledge
    │   │   │   ├── knowledge/
    │   │   │   │   └── page.tsx # wireframe 03
    │   │   │   ├── engagement/
    │   │   │   │   └── page.tsx # wireframe 04
    │   │   │   └── behavior/
    │   │   │       └── page.tsx # wireframe 05
    │   │   └── sites/
    │   │       └── page.tsx     # wireframes 06, 07
    │   └── auth/
    │       └── callback/
    │           └── page.tsx     # OAuth landing — backend redirects here, frontend redirects to /
    ├── components/
    │   ├── shell/
    │   │   ├── Sidebar.tsx
    │   │   ├── Topbar.tsx
    │   │   ├── SiteSelector.tsx     # placeholder for v2 multi-site, just shows current site for now
    │   │   └── UserMenu.tsx
    │   ├── ui/
    │   │   ├── Button.tsx           # 3 variants: solid, outline, ghost
    │   │   ├── Input.tsx
    │   │   ├── Textarea.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Tabs.tsx
    │   │   ├── EmptyState.tsx       # generic empty state with icon, title, description, action
    │   │   ├── Snippet.tsx          # mono code block with copy-to-clipboard
    │   │   ├── Tag.tsx              # small status pills (qualified, out_of_scope, etc.)
    │   │   ├── Spinner.tsx
    │   │   ├── Card.tsx             # standard hairline-bordered card
    │   │   └── KeyValue.tsx         # the "key | value" rows used on profile and conversation detail
    │   ├── inbox/
    │   │   ├── SessionList.tsx      # left pane of wireframe 02
    │   │   ├── SessionListItem.tsx
    │   │   ├── ConversationDetail.tsx  # right pane of wireframes 02 & 09
    │   │   ├── BriefPanel.tsx
    │   │   └── TranscriptViewer.tsx
    │   ├── knowledge-base/
    │   │   ├── ProfileSection.tsx       # read-only company profile (wireframe 03)
    │   │   ├── GapsSection.tsx          # gap cards (wireframe 03)
    │   │   ├── EnrichedKnowledgeList.tsx
    │   │   ├── AddQAModal.tsx           # wireframe 10
    │   │   ├── GreetingEditor.tsx       # wireframe 04
    │   │   ├── PillsEditor.tsx          # wireframe 04
    │   │   ├── WidgetPreview.tsx        # mini preview of FAB + bubbles (wireframe 04)
    │   │   └── CustomInstructionsEditor.tsx  # wireframe 05
    │   └── sites/
    │       ├── SiteCard.tsx
    │       └── EmbedSnippet.tsx
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts            # fetch wrapper, handles credentials, 401 redirect
    │   │   ├── auth.ts              # getCurrentUser, logout
    │   │   ├── sites.ts             # listSites
    │   │   ├── sessions.ts          # listSessions, getSession
    │   │   ├── kb.ts                # getKB, enrich, updatePills, updateInstructions, updateGreeting
    │   │   └── types.ts             # all response/request TypeScript types
    │   ├── hooks/
    │   │   ├── useCurrentUser.ts    # TanStack Query wrapper
    │   │   ├── useSites.ts
    │   │   ├── useSessions.ts
    │   │   ├── useKB.ts
    │   │   └── useCurrentSite.ts    # derives current kb_id from URL or first site
    │   ├── auth-guard.tsx           # client component that redirects to /login on 401
    │   ├── format.ts                # date formatters, text truncation, etc.
    │   └── env.ts                   # validates env vars at boot using zod
    ├── providers/
    │   └── QueryProvider.tsx        # TanStack Query provider, configures defaults
    └── styles/
        └── globals.css              # Tailwind directives + CSS resets, font imports

tests/
├── unit/                            # vitest tests, mirror src structure
│   ├── components/
│   └── lib/
└── e2e/                             # playwright
    ├── login.spec.ts
    ├── inbox.spec.ts
    └── kb.spec.ts
```

---

## Pages — what each page renders

### `/login` (wireframe 01)

- Single centered card on `background-secondary` page background.
- Logo mark (the contextus "C" in a 64x64 black rounded square, 28px on this page) + "contextus portal" title + descriptive subline.
- One button: "continue with google" — outline style, lucide `LogIn` icon (or use a Google logo SVG, simpler is fine for v1).
- Click → `window.location.href = "${API_BASE}/api/auth/google/start"` (full-page redirect, not a fetch — OAuth flow needs a real redirect chain).
- Footer: small mono "terms · privacy" links. These can be dead links for v1 — `<a href="#">` placeholders. Bondan adds the actual pages later.
- If the user is already authenticated (cookie present, `/api/auth/me` returns 200), redirect to `/inbox` immediately.

### `/auth/callback`

- Landing route the backend redirects to after OAuth. Backend has already set the cookie before redirecting — this page just needs to exist as a target.
- Renders a centered spinner while it kicks off a fetch to `/api/auth/me` to confirm the cookie works.
- On success → redirect to `/inbox`.
- On failure → redirect to `/login?error=auth_failed`.
- Display `error` from query param on `/login` as a small toast or inline banner if present.

### `/inbox` (wireframes 02, 08, 09)

The most complex screen. Three states:

**State A — populated (wireframe 02):**
- Sidebar + topbar + split pane.
- Left pane: search input (visual only for v1, no actual filtering required — wire up in v2), session list. Each list item shows: contact name (or "anonymous" if no contact captured), relative time, preview text (first user message, truncated), tag chips.
- Right pane: brief panel (sticky top section with key/value rows) + transcript scroll area below. Brief renders the structured fields from `LeadBrief`. Transcript renders messages with visitor bubbles right-aligned, agent messages left-aligned (no bubble, just text — matches widget aesthetic).

**State B — empty (wireframe 08):**
- Full-page empty state replacing the split pane.
- Title: "no conversations yet"
- Description: "paste this snippet before `</body>` on your site to start collecting leads."
- `Snippet` component showing the embed code with the user's actual `kb_id` and `token`.
- "install help" link (placeholder href).

**State C — populated but selected session has no brief (wireframe 09):**
- Same shell as State A.
- Right pane shows: minimal session metadata (started time, message count, contact "not captured" if absent), then a `no-brief` info panel explaining why ("visitor didn't share enough signals to qualify, or left before completing the chat. transcript still saved below."), then transcript.

**URL state:**
- `/inbox` — default, shows list, no selection.
- `/inbox?session=sess_xxx` — list + that session selected on the right.
- Clicking a list item updates the query param (`router.push("/inbox?session=...")`, shallow).
- Reload preserves selection.

**Data:**
- `useSessions(kb_id)` — list query, paginated (cursor-based, infinite scroll or "load more" button). For v1, don't bother with infinite scroll — fetch first 50 and add a "load older" button at the bottom.
- `useSession(session_id)` — detail query, only fires when `?session=` is set.

### `/knowledge-base/*` (wireframes 03, 04, 05)

Layout has tabs at the top (`Tabs` component): "knowledge | engagement | behavior". Active tab matches the current path. Below the tabs, the page content.

**`/knowledge-base/knowledge` (wireframe 03):**
- Section: "profile" — read-only card with "request recrawl" button (top right). Renders fields from `kb.company_profile` as `KeyValue` rows: name, industry, services, out_of_scope, summary. "Last crawled" + "12 pages indexed" shown in topbar metadata.
- Section: "gaps the AI doesn't know yet" — only renders if `kb.gaps` array is non-empty. Each gap shown as a small card with title, description, and "+ answer this" CTA that opens the Add Q&A modal pre-filled with the gap as the question.
- Section: "your added knowledge" — renders `kb.enriched_chunks` as `qa-card` items. Each card shows question (top, weight 500) and answer (below, lighter color). "+ add Q&A" button (top right of section) opens the modal.

**Add Q&A modal (wireframe 10):**
- Two fields: question (single-line input, max 200 chars), answer (textarea, max 2000 chars, auto-grow). Both required.
- Warning text below: "adding this regenerates your AI's company profile from all knowledge. takes ~10 seconds."
- Cancel + "add to knowledge" (solid black) buttons bottom right.
- On submit: optimistic update on the enriched-knowledge list, mutation to `POST /api/portal/kb/enrich`, on success invalidate the KB query (which refetches profile + enriched chunks). Show a small inline progress indicator on the list item while the regeneration is in flight.
- On error: show the error message inline in the modal, leave the modal open with values preserved.
- Rate-limit error from backend: show as a friendly message ("you're adding Q&As too quickly. wait a moment and try again.") not a generic error.

**`/knowledge-base/engagement` (wireframe 04):**
- Section: "greeting message" — single textarea, max 200 chars, char counter. Save button or auto-save on blur (recommend auto-save on blur with debounce).
- Section: "quick reply pills" — 3 numbered single-line inputs. All 3 are required and must be non-empty. Save on blur.
- Section: "preview" — `WidgetPreview` component showing a miniature mock of the FAB with the 3 pill bubbles above it. This is purely visual — no live widget embedded. Build it as static HTML/CSS matching the widget's appearance from `docs/contextus-floating-widget-guideline.html`.

**`/knowledge-base/behavior` (wireframe 05):**
- Section: "custom instructions" — textarea, max 2000 chars, char counter. "reset to default" button (top right) clears the value.
- Examples block (renders only when textarea is empty) — shows 3 example directives as cards. Used as scaffolding for first-time users; disappears once they start typing.
- Footer warn box: "these layer on top of the contextus engagement model. we tune the base agent every few weeks to improve qualification — your instructions stay yours."

### `/sites` (wireframes 06, 07)

**State A — populated (wireframe 06):**
- Page title: "your sites"
- For each site: a `SiteCard` showing site name, URL + pages indexed, "manage" button (placeholder action — opens KB tab), and the embed snippet below.
- "+ add new site" placeholder card at the bottom — clicking it shows a tooltip or info panel ("contact us to add another site") rather than a form. v1 has no self-serve site creation.

**State B — first-time user (wireframe 07):**
- Sidebar items inbox/KB/analytics are *visually disabled* (lower opacity, non-clickable). Only Sites is active.
- Centered empty state: "your account is ready" + "we'll prepare your site and email you when it's live. usually within 1 business day." + "in the meantime, feel free to try the demo at getcontextus.dev/try."
- Footer text: "signed in as {email} · sign out" — sign-out link clears the session and redirects to `/login`.

---

## Shell components

### Sidebar (left)

- 130–160px wide.
- `background-secondary` (#F0F0F0) with `border` right edge.
- Top: contextus logo (mark + wordmark, 20px height).
- Middle: nav items — inbox, knowledge base, analytics, sites. Active item has white background and `text-body` color. Inactive items are `text-muted`. **Analytics is shown but disabled** (lower opacity, no click handler) — sidebar item with a small "v2" or no badge, just visually muted.
- Bottom: user avatar (24px circle with initials or Google profile picture if available) + display name + caret. Clicking opens a small dropdown with "sign out".

### Topbar

- 36–40px tall, hairline bottom border.
- Left: current site name (e.g. "finfloo.com"). For v1 with single-site users, just renders as text. For multi-site future, becomes a dropdown — leave the component swappable.
- Right: page-specific metadata. On inbox: "filters · sort · export" (placeholders for v2). On KB: "last crawled apr 12 · 12 pages". On sites: nothing or "+ add site" (which is the "contact us" placeholder).

### Modal

- Backdrop is `rgba(0,0,0,0.35)`, click outside to close (with confirm if form is dirty).
- Card: 380–440px wide on desktop, `background` white, 12px radius, hairline border, 20–24px padding.
- Close on `Escape`.
- Body scroll locked while open.
- Use a portal to render at document root, not inside the calling component's tree.

---

## API client

Single fetch wrapper at `src/lib/api/client.ts`. Responsibilities:

1. Prepends `${process.env.NEXT_PUBLIC_API_BASE}` to relative paths.
2. Sets `credentials: "include"` on every request (sends the session cookie cross-origin).
3. Sets `Content-Type: application/json` for non-GET requests.
4. Parses JSON response.
5. On 401: triggers a global redirect to `/login`. The auth guard layout listens for this.
6. On 4xx/5xx: throws a typed `ApiError` with status + parsed error body.

Per-resource modules (`auth.ts`, `sites.ts`, etc.) export thin wrappers:

```ts
// auth.ts
export const getCurrentUser = () => apiClient.get<User>("/api/auth/me");
export const logout = () => apiClient.post("/api/auth/logout");

// sessions.ts
export const listSessions = (params: { kb_id: string; cursor?: string }) =>
  apiClient.get<SessionListResponse>("/api/portal/sessions", { params });
```

All response types live in `src/lib/api/types.ts` and **must match the Pydantic schemas in the backend**. When backend types change, update these manually until you set up codegen (out of scope for v1).

### Hooks (TanStack Query)

Each resource has a corresponding hook that wraps the API call with sensible defaults:

- **Stale time:** 30 seconds default. Sites and KB queries can be longer (5 min) since they change infrequently. Sessions stay at 30 seconds — new leads should appear without manual refresh.
- **Refetch on window focus:** enabled (default). Customer comes back to the tab → fresh data.
- **Retry:** 1 retry on network error, 0 retries on 4xx.
- **Optimistic updates** on mutations: pills, greeting, custom-instructions update the cache immediately, roll back on error.

Example shape for `useUpdatePills`:

```ts
export function useUpdatePills(kb_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pills: string[]) => kbApi.updatePills({ kb_id, pills }),
    onMutate: async (newPills) => {
      await qc.cancelQueries({ queryKey: ["kb", kb_id] });
      const prev = qc.getQueryData(["kb", kb_id]);
      qc.setQueryData(["kb", kb_id], (old) => ({ ...old, pills: newPills }));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["kb", kb_id], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["kb", kb_id] }),
  });
}
```

---

## Auth flow (frontend side)

Backend handles all the OAuth heavy lifting. Frontend responsibilities:

1. **Unauthenticated user lands on `/inbox`** (or any auth'd route) → middleware-style check fails → redirect to `/login`.
2. **`/login` "continue with google"** → full-page navigate to `${API_BASE}/api/auth/google/start`.
3. **Backend completes OAuth, sets cookie, redirects to** `${PORTAL_FRONTEND_URL}/auth/callback` (or `/inbox` directly — confirm with backend agent which redirect target is used; the backend spec says `/`, but having a `/auth/callback` interstitial is cleaner for handling errors).
4. **Frontend `/auth/callback`** verifies cookie via `/api/auth/me`, redirects to `/inbox`.
5. **Every subsequent request** sends the cookie automatically (`credentials: "include"`). No token management on the frontend.
6. **On any 401**, the API client triggers a redirect to `/login`. This handles cookie expiry mid-session.
7. **Sign out** → `POST /api/auth/logout` → backend clears cookie → frontend redirects to `/login`.

### Auth guard

The `(authenticated)` route group has a layout that:

1. Calls `useCurrentUser()` (TanStack Query hook wrapping `/api/auth/me`).
2. While loading: renders a full-page spinner (centered, monochrome).
3. On 401 (not authenticated): redirects to `/login`.
4. On success: renders the sidebar + topbar shell with the page content as children.

Don't try to protect routes with Next.js middleware (`middleware.ts`) — middleware can't easily read HTTP-only cookies set on a different domain. Client-side guard is fine for v1.

---

## Empty, loading, and error states

These are not optional. Every page has all three.

**Loading:**
- Page-level: centered spinner taking the main content area.
- Section-level: `Spinner` inline, smaller. Don't render skeleton screens for v1 — a small spinner is fine and easier to maintain.
- Mutation loading: button shows spinner + disables itself + keeps width.

**Error:**
- Page-level fetch error: card with error icon, message, and retry button. Use the parsed error from the API client.
- Section-level: smaller inline error message, retry button.
- Mutation error: inline message near the form, error styling (`error-bg`, `error-text`).

**Empty:**
- Use the `EmptyState` component throughout. Wireframes 07 and 08 are both this component with different copy.
- Always include an icon (lucide), a title, a description, and (optionally) an action button.

---

## Forms

All editing surfaces (greeting, pills, custom instructions, Q&A modal) use **react-hook-form + zod**. Don't manage form state with `useState` — too easy to skip validation or miss edge cases.

Validation schemas live next to the component that uses them. Match the backend's Pydantic constraints exactly:

- Greeting: max 200 chars
- Pills: exactly 3, each non-empty, no duplicates
- Custom instructions: max 2000 chars, can be empty
- Q&A question: required, max 200 chars
- Q&A answer: required, max 2000 chars

Show character counters where the wireframes show them (greeting, custom instructions, Q&A answer). Counter is mono font, 10px, right-aligned, `text-muted`.

**Save patterns:**
- Greeting: auto-save on blur, debounced 500ms.
- Pills: same.
- Custom instructions: same.
- Q&A: explicit save in modal (no auto-save — user is composing intentionally).

Auto-save shows a small "saved · 2s ago" indicator near the field, mono font, fades out after 2s.

---

## Environment variables

`.env.local` (gitignored) and `.env.example`:

```
NEXT_PUBLIC_API_BASE=https://contextus-2d16.onrender.com
```

That's it for v1. Auth flows entirely through the backend; the frontend doesn't need OAuth client IDs or secrets.

For local dev: `NEXT_PUBLIC_API_BASE=http://localhost:8000` and the backend dev server running locally.

Validate the env at boot (`src/lib/env.ts`) using zod — fail fast with a clear message if `NEXT_PUBLIC_API_BASE` is missing.

---

## CORS and cookies

The backend and frontend live on different domains (`getcontextus.dev` vs `*.onrender.com`, or both subdomains of `getcontextus.dev` — depends on Bondan's answer to the cookie domain question in the backend spec). Two configs need to align:

1. **Backend CORS:** must include the portal frontend origin in `allow_origins`, and `allow_credentials=True`. The backend agent handles this.
2. **Frontend fetch:** `credentials: "include"` on every request. The API client wrapper does this.

If the cookie is set with `domain=.getcontextus.dev` (cross-subdomain), portal at `portal.getcontextus.dev` and backend at `api.getcontextus.dev` share cookies cleanly. If the backend stays on `*.onrender.com`, cookies become same-site=none (requires HTTPS) and the setup is messier.

**Recommend Bondan set up `api.getcontextus.dev` as a Render custom domain before launch** to make cookie handling clean. Document this in the README.

---

## Tests

### Unit tests (vitest + React Testing Library)

Cover:
- API client: 401 redirect behavior, error parsing, request shape.
- Hooks: query keys, mutation invalidation patterns.
- Form validation: each schema with edge cases (empty, too long, too short, special chars).
- Components with logic: `EmptyState`, `Tag` (correct color per qualification), `Snippet` (copy works), `WidgetPreview` (renders pills and greeting).

Don't test pure presentational components. Snapshot tests are noise — skip them.

### E2E tests (Playwright)

One happy-path test per major flow. Mock the backend with route interception (Playwright's `page.route`). No real OAuth — stub the `/api/auth/me` response to simulate authenticated state.

Test files:
- `login.spec.ts` — login button kicks off OAuth redirect (assert URL).
- `inbox.spec.ts` — list renders, click a session, see brief, no-brief case shown correctly.
- `kb.spec.ts` — open Add Q&A modal, fill fields, validation triggers on empty, successful submit invalidates list.

Run e2e in CI on PR. Fast (< 30s total). Don't over-invest here for v1.

---

## Deployment

**Platform:** Vercel.
**Repo:** push to GitHub → connect repo to Vercel project → auto-deploy on push to `main`.
**Domain:** `portal.getcontextus.dev` (recommended) or whatever Bondan picks.
**Env vars:** set `NEXT_PUBLIC_API_BASE` in Vercel project settings, both Production and Preview environments.
**Preview deploys:** every PR gets a unique preview URL. **Backend CORS must include the preview URL pattern** (`https://contextus-portal-*.vercel.app`) for previews to work. Document this in the README and flag for the backend agent.

---

## PR sequencing

Each PR is independently reviewable, mergeable, and deployable to Vercel preview. Plan PRs in this order:

1. **Project setup.** Empty Next.js app, Tailwind config with design tokens, `globals.css`, fonts loaded, env var validation, base layout + favicon. No real pages yet — `/` shows "hello contextus portal" text. Vercel preview deploys.
2. **Auth shell.** Login page, auth callback page, API client with cookie credentials, `useCurrentUser` hook, auth guard layout for `(authenticated)` group, sign-out flow. The `(authenticated)` group has a placeholder dashboard that just shows "signed in as {email}". Backend must have at least PR 2 of the backend spec (auth flow) merged for this to work end-to-end.
3. **Sidebar + topbar shell.** Sidebar with nav items (most go to placeholder pages), topbar, user menu with sign-out. Sites page shows wireframe 07 (first-time user empty state) since the sites endpoint isn't ready yet — render it from a hardcoded empty array until then.
4. **Sites page.** Hook up `useSites`, render `SiteCard` for populated state (wireframe 06), render embed snippet with copy button. Backend PRs 1–3 must be merged.
5. **Inbox page.** Sessions list, conversation detail with brief and no-brief variants, empty state. Backend PRs 4–5 must be merged. Most complex page — break into sub-PRs if reviewable size becomes a problem.
6. **KB tab — read-only.** Knowledge sub-tab with profile section and enriched-knowledge list. No editing yet. Backend PR 6 must be merged.
7. **KB tab — write surfaces.** Add Q&A modal (with gap pre-fill), pills editor, custom instructions editor, greeting editor. Backend PR 7 must be merged.
8. **Polish pass.** Empty/loading/error states audit across all pages, accessibility pass (keyboard nav, focus rings, ARIA labels for icons), responsive check on tablet/mobile (don't fully optimize — just don't let it break), copy review.

Each PR includes:
- Component(s)
- Tests
- Updated README if env vars or setup changes
- Storybook *not* required for v1 — too much overhead for a 6-screen app. Add later if the component library grows.

---

## Out of scope for v1

Document in README and PR descriptions to prevent drift:

- **Self-serve site creation.** "+ add new site" is a placeholder showing "contact us" tooltip.
- **Self-serve recrawl.** "Request recrawl" button on Knowledge tab fires a notification or mailto link to Bondan, doesn't trigger a crawl.
- **Analytics tab.** Sidebar item is visually disabled.
- **Q&A edit/delete.** Modal only adds.
- **Multi-site UI.** Site selector in topbar is placeholder. Single-site users get the only site shown as label, no dropdown.
- **Team/seats/invites.** No "invite teammate" UI anywhere.
- **Mobile-optimized layouts.** Build for desktop. Don't break on tablet, but don't design custom mobile views.
- **Dark mode.** Not in scope. The widget guideline explicitly opts out (`color-scheme: light only`); the portal does the same.
- **i18n.** Portal is English-only for v1, even though the widget supports `en` and `id`.
- **Real-time updates.** No WebSockets, no polling for new leads. User refreshes or reopens the tab to see new sessions. TanStack Query's "refetch on window focus" gives most of the value.
- **Notifications / toasts library.** Inline error messages and small "saved" indicators are enough. No toast system.

---

## Open questions for Bondan

These came up during spec writing. Some block specific PRs:

1. **Portal domain.** `portal.getcontextus.dev` (recommended, paired with `api.getcontextus.dev`) or something else? Decide before PR 1 ships to Vercel. *Blocks deployment of PR 1.*
2. **Logo asset.** The widget guideline shows the contextus logo as a 64x64 SVG with the "C" character. Is that the official mark, or do you have a more polished SVG/PNG you'd like used in the portal favicon and header? *Blocks PR 1 polish but not function.*
3. **Sign-in error handling.** If a user signs in via Google but their email isn't linked to any site, do you want them to (a) see the wireframe 07 empty state silently, or (b) get an explicit "you're not invited yet — want to join the waitlist?" CTA with a link to your existing waitlist? Recommend (a) — softer, your friends will figure it out and it doesn't pressure them. *Blocks PR 3.*
4. **Save behavior on KB editing fields.** I specced auto-save on blur with debounce. Some products do explicit save buttons (Stripe Dashboard) and some auto-save (Linear, Notion). For pills/greeting/custom-instructions, which feels right? *Blocks PR 7.*
5. **"Recrawl" button on Knowledge tab.** What does it actually do for v1? (a) `mailto:bondan@example.com?subject=Recrawl%20request` link, (b) a `POST` to a notification webhook (Slack), (c) just a static button that opens an info modal. Recommend (a) — zero infra. *Blocks PR 6.*
6. **Embed snippet form.** The backend spec calls the script attribute `data-knowledge-base-id`, but the actual widget uses `data-knowledge-base-id` per the floating widget guideline. Confirm the exact attribute name and CDN URL the user pastes — we want copy-paste to work first try. *Blocks PR 4.*

---

## Definition of done — v1 portal frontend

The portal frontend is complete when:

- A user can sign in via Google (full OAuth round-trip) and land on `/inbox`.
- An invited user sees their site, can read all KB fields, edit pills/greeting/custom instructions, add Q&A entries.
- An uninvited user signs in successfully and sees the soft empty state on `/sites`.
- The full inbox flow works: list, click, read brief or no-brief variant, see transcript.
- All wireframe states are reachable in the deployed app.
- All unit tests and Playwright e2e tests pass in CI.
- Vercel preview deploys are green for at least 3 PRs in a row before final merge.
- README documents: setup, env vars, dev commands, test commands, deployment notes, link back to `BACKEND-SPEC-PORTAL-V1.md` for backend reference.
- Bondan signs off after using the deployed portal himself with the Finfloo `kb_id` for at least one full session.

---

*End of spec. Ask questions in PR comments. Don't add scope without updating this document and getting Bondan's sign-off.*
