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
pnpm dev          # dev server (http://localhost:3000)
pnpm build        # production build
pnpm lint         # TypeScript type-check
pnpm test         # vitest unit tests
pnpm test:e2e     # playwright e2e tests
```

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Backend API base URL (e.g. `https://contextus-2d16.onrender.com`) |

For local development, set `NEXT_PUBLIC_API_BASE=http://localhost:8000` in `.env.local`.

See `docs/FRONTEND-SPEC-PORTAL-V1.md` for full architecture and `docs/BACKEND-SPEC-PORTAL-V1.md` for backend reference.
