# contexts-portal

Contextus Management Portal for Users

## Setup

```bash
pnpm install
cp .env.example .env.local  # then set NEXT_PUBLIC_API_BASE
pnpm dev
```

## Commands

```bash
pnpm dev              # dev server (http://localhost:3000)
pnpm build            # production build
pnpm lint             # TypeScript type-check
pnpm test             # vitest unit tests
pnpm test:e2e         # playwright e2e tests
pnpm storybook        # component docs (http://localhost:6006)
pnpm build-storybook  # static Storybook build
```

## Storybook

Storybook is the **design reference** for all UI components. Before building a new feature, check the relevant story for the expected layout, states, and props. After changing a component, update its story.

```bash
pnpm storybook   # http://localhost:6006
```

Components are organized by section: `UI/`, `Shell/`, `Inbox/`, `KB/`, `Sites/`. Each has a Docs tab (`/docs/<name>--docs`) with a component description, interactive canvas, and full props table.

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL (e.g. `https://backend.backend-development.getcontextus.dev`) |

For local development, set `NEXT_PUBLIC_API_BASE=http://localhost:8000` in `.env.local`.

See `docs/FRONTEND-SPEC-PORTAL-V1.md` for full architecture and `docs/BACKEND-SPEC-PORTAL-V1.md` for backend reference.
