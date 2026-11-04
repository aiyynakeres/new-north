# AGENTS.md

Guidance for coding agents working in this repository.

## Read first

- **[PLANS.md](./PLANS.md)** — current status, roadmap, known limitations, and
  testing checklist. Read it before starting work, and update it when priorities
  or limitations change.

## Stack and layout

- `backend/` — Go (chi router, pgx, PostgreSQL 17).
  - `handlers/` HTTP handlers and pagination helpers
  - `middleware/` bearer-token auth
  - `models/` request/response types
  - `store/` data access, migrations (`store/migrations/`), seed data
- `frontend/` — React 19 + Vite + TypeScript + Tailwind, Biome for lint/format.
  - `pages/`, `components/`, `layout/`, `hooks/`
  - `services/api.ts` real HTTP client
  - `services/mockApi.ts` localStorage mock used when `VITE_USE_MOCKS=true`
- `docker-compose.yml` — `db`, `backend`, `frontend` (`production` profile),
  `frontend-dev` (`dev` profile).

## Commands

### Frontend

```sh
cd frontend
pnpm install
pnpm dev                       # http://localhost:3000 (mock mode by default)
pnpm exec tsc --noEmit
pnpm exec biome check .        # lint + format check
pnpm exec biome check --write .
pnpm build
```

### Backend

```sh
cd backend
gofmt -l .                     # list unformatted files
gofmt -w <file>
go build ./...
go vet ./...
go run .                       # needs PostgreSQL, see README
```

### Full stack

```sh
docker compose up -d db backend
cd frontend && VITE_USE_MOCKS=false pnpm dev

# production build
docker compose --profile production up --build
```

There are no automated tests yet. See PLANS.md for the testing/CI roadmap.

## Conventions

- Frontend uses **tabs**, double quotes, and Biome defaults. Backend uses
  standard `gofmt`.
- Article list endpoints are paginated: `?limit=&offset=` and return
  `{ "items": [...], "hasMore": bool }` (`models.ArticlePage`). Default page size
  is 20, max 50. Frontend lists use `useInfiniteArticles` + `InfiniteScrollSentinel`
  with a page size of 10.
- `community_only` posts are readable only by the author, community members,
  admins, and the creator. Any new endpoint that returns or mutates article data
  must call `Store.CanViewArticle` (or filter in SQL) consistently. Non-members
  receive `403 {"error":"community_only"}`.
- The fixed code `123456` is a development-only login. It is gated by
  `ALLOW_DEV_AUTH=true`; never set that variable in production. Real Telegram
  auth is still a P0 item in PLANS.md.
- The mock API must mirror backend behavior, including pagination and
  `community_only` visibility. Mock data lives in `localStorage` under
  `new-north:mock:v<N>:`. Bump `STORAGE_PREFIX` when changing seed data so
  existing browsers pick it up.
- Seed data is duplicated intentionally:
  - backend: `backend/store/seed.go`
  - frontend mock: `frontend/services/mockApi.ts`
  Keep the two in sync when adding posts, users, or communities.
- Images use paths such as `/mocks/avatar-ayaan.jpg`, served by the frontend
  (`frontend/public/mocks/`). Both dev and production serve them; do not replace
  them with external placeholder services.
- Migrations in `backend/store/migrations/` are embedded and executed in lexical
  order on every startup, so they must be idempotent. Use a new numbered file for
  schema/data changes; existing seed rows use `ON CONFLICT DO NOTHING`.
- Do not commit `node_modules/`, `dist/`, `.vite/`, or local `.env.local` files.

## Verification before finishing

For frontend changes:

```sh
cd frontend
pnpm exec tsc --noEmit
pnpm exec biome check .
pnpm build
```

For backend changes:

```sh
cd backend
gofmt -l .          # only touched files need to be clean
go build ./...
go vet ./...
```

For API, pagination, visibility, or seed changes, also run the backend against a
throwaway PostgreSQL container and exercise the affected endpoints (auth, feed
pages, community-only access, comments/reactions). PLANS.md has a manual
checklist.
