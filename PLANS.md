# New-North — Plans

_Last updated: 2026-11-05_

New-North is a minimalist blogging platform for the youth of Yakutia. The core
product is usable as an MVP; this file tracks what is done, what is next, and
what is still risky.

## Current status

**MVP — usable, not production-ready.**

Shipped:

- Feed, article view, block-based editor, comments, emoji reactions.
- Communities: create, join/leave, members, promote, block, community feed.
- Profiles, follows, author leaderboard, editable profile fields.
- Telegram-code auth flow (development stub).
- PostgreSQL schema + migrations + seed data.
- Docker Compose setup (db, backend, frontend).
- Frontend-only mode with a localStorage mock API.
- Mock images for backend seeds (`/mocks/...`, shared with the frontend).
- `community_only` post protection (author, members, admins, creator only).
- Offset pagination + infinite scroll for feed, community posts, profile posts.
- 15 seed articles (13 public, 2 community-only) to exercise pagination and access rules.
- Biome + TypeScript checks; `go vet` clean.

## P0 — before production

### 1. Real authentication

The current flow accepts the fixed code `123456` for any known handle
(`backend/store/store.go`), and sessions are predictable, non-expiring
`sess_<UnixNano>_<userID>` tokens.

- Integrate a Telegram bot to deliver one-time codes.
- Store codes with expiry (e.g. 5 minutes), attempt limits, and single use.
- Generate cryptographically random session tokens.
- Add token expiry, logout, and (optionally) refresh.
- Rate limit `request-code`, `verify-code`, and `register`.
- Replace the `123456` shortcut with an explicit dev-only flag.

**Done when:** a new user can only sign in by receiving a real code, and a stolen
token cannot be reused forever.

### 2. Tests and CI

There are currently no tests and no CI pipeline.

- Go: store/handler integration tests against a throwaway PostgreSQL
  (seed → request → assert), covering auth, pagination, and access control.
- API contract tests for `community_only` visibility.
- Frontend: at least smoke tests for the infinite-scroll hook and mock API
  pagination.
- GitHub Actions workflow:
  - `go vet ./...` and `go test ./...` in `backend/`
  - `pnpm exec tsc --noEmit`, `pnpm exec biome check .`, `pnpm build` in `frontend/`

**Done when:** every push to `main` is checked automatically.

### 3. Access-control follow-ups

- Enforce community membership when creating a post for a community
  (`POST /api/articles` currently trusts the provided `communityId`).
- Decide whether hidden posts should return `403` or `404` (currently `403`).
- Filter or annotate comments/reaction totals consistently for hidden posts
  when used in list views.
- Consider showing `community_only` posts in the main feed for members of that
  community.

### 4. Operations

- Add a healthcheck to the `db` service and `depends_on: condition: service_healthy`
  so the backend doesn't fatal on a cold start.
- Add a restart policy for the backend.
- Make `/api/health` check DB connectivity, not just process liveness.
- Fix README: the production stack needs `docker compose --profile production up --build`.

## P1 — important, not blocking launch

- **Media uploads:** replace base64 data URLs with object storage (S3-compatible),
  enforce size/type limits, and clean up unused files.
- **Frontend data layer:** adopt TanStack Query (or an equivalent) for caching,
  retries, error states, and deduplication instead of per-page `useEffect` loads.
- **Cursor pagination:** switch from `limit`/`offset` to keyset pagination once
  lists grow; offsets can shift when new posts arrive.
- **More pagination:** paginate `/api/users` and the leaderboard without breaking
  author/profile resolution (likely a separate lightweight "users by ids" lookup).
- **Search and tag filtering** on the feed and communities.
- **SEO / sharing:** Open Graph tags for articles and profiles, canonical URLs.
- **Error handling:** friendly empty/error states for every page; no infinite spinners.

## P2 — ideas

- Drafts and scheduled publishing.
- Notifications (new followers, comments, community activity).
- Rich text/markdown polish and image captions.
- Accessibility pass (keyboard navigation, focus states, contrast).
- Russian/English localization.
- Basic analytics for posts and communities.
- Moderation log for community admins.

## Deployment

### Production

- **Frontend:** https://new-north.vercel.app — project `new-north-frontend`,
  root directory `frontend`.
- **Backend:** https://new-north-backend.vercel.app — project `new-north-backend`,
  root directory `backend`.
- **Database:** Neon Postgres (`new-north-db`) provisioned through the Vercel Marketplace.
- **Auth:** `ALLOW_DEV_AUTH` is unset, so `/api/auth/*` returns `503` and no new
  sessions can be created. Existing sessions were cleared. Production is
  read-only until real Telegram auth ships.
- **API routing:** the frontend rewrites `/api/*` to
  `https://new-north-backend.vercel.app/api` via `frontend/vercel.json`.

### Preview (staging)

- **Frontend:** https://new-north-preview.vercel.app — project domain assigned to
  the `preview` branch of `new-north-frontend`; follows preview deployments
  automatically.
- **Backend:** https://new-north-backend-preview.vercel.app — project domain
  assigned to the `preview` branch of `new-north-backend`; follows preview
  deployments automatically.
- **Database:** separate Neon Postgres, exposed as `PREVIEW_DATABASE_URL` only in
  the Preview environment; the backend selects it when `VERCEL_ENV=preview`.
- **Auth:** `ALLOW_DEV_AUTH=true`; sign in with `admin_north` or `lena_dev` and
  code `123456`. Registration is enabled.
- **API routing:** Preview sets
  `VITE_API_BASE_URL=https://new-north-backend-preview.vercel.app/api`; the
  backend's Preview `FRONTEND_URL` allows the preview origins.
- **Protection:** previews are public and contain test data only.

### Shared

- Pushes to `preview` deploy Preview. Production is updated through a pull
  request from `preview` to `main`; direct pushes to `main` are blocked by
  branch protection. Merge `main` back into `preview` to keep staging current.
- Do not create separate Vercel projects per environment. Use the built-in
  Production/Preview environments and their env vars.

## Known limitations

- Only the author, members, admins, and creator can read `community_only` posts;
  non-members receive `403`.
- The main feed excludes `community_only` posts even for members.
- `/api/users` and the leaderboard still return the full list.
- Offset pagination may duplicate or skip entries when posts are created between pages.
- Uploaded images are stored as base64 data URLs in PostgreSQL.
- Mock mode persists data in `localStorage` under `new-north:mock:v3:`; bumping the
  version resets local mock data.
- Seed IDs and data are intended for development/testing only.
- Production login/registration return `503` until real Telegram auth is
  implemented; the production site is read-only.
- Preview uses the shared code `123456` and must not contain real data.
- Preview and production use separate Neon databases in the same two Vercel
  projects (Production/Preview environments).

## Local testing checklist

Run the frontend with mocks:

```sh
cd frontend
pnpm dev
```

Sign in with `admin_north` or `lena_dev` and code `123456`.

- Feed: first page shows 10 posts, scrolling loads the remaining 3, then "Это все публикации".
- Community `c1`: `admin_north` sees 5 posts; a non-member sees 4 (the `community_only`
  post is hidden).
- Open a `community_only` post as a non-member: access denied screen; as a member:
  full article, comments, and reactions work.
- Profiles use the same infinite-scroll hook and page size; the current seed data
  fits on a single profile page.

Run against the real backend:

```sh
docker compose up -d db backend
cd frontend
VITE_USE_MOCKS=false pnpm dev
```

Docker Compose sets `ALLOW_DEV_AUTH=true`. If you run the backend directly,
export it yourself:

```sh
cd backend
ALLOW_DEV_AUTH=true go run .
```

Backend checks:

```sh
cd backend
gofmt -l . && go vet ./... && go build ./...
```
