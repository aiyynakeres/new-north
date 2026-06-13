# new-north

A minimalist blogging platform for the advanced youth of Yakutia to share experiences, inspire, and connect.

## Stack

- **Backend** — Go (chi router, pgx, PostgreSQL)
- **Frontend** — React + Vite + TypeScript + Tailwind
- **Database** — PostgreSQL 17
- **Infra** — Docker Compose

## Project structure

```
new-north/
├── backend/
│   ├── handlers/         # HTTP handlers
│   ├── middleware/        # Auth middleware
│   ├── models/           # Shared types
│   ├── store/
│   │   ├── db.go         # PostgreSQL connection & migrations
│   │   ├── migrations/   # SQL migration files
│   │   ├── seed.go       # Seed data
│   │   └── store.go      # Data access layer
│   ├── main.go
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
└── README.md
```

## Running with Docker Compose

### Production build

```sh
docker compose up --build
```

- **Frontend** — `http://localhost:3000` (nginx, serves built SPA)
- **Backend** — `http://localhost:8080`
- **Database** — `localhost:5432`

Data persists in a named volume (project-scoped, e.g. `new-north_pgdata`).

### Development (hot reload frontend)

```sh
docker compose --profile dev up
```

Opens on `http://localhost:3000` with Vite HMR. The production build is not started (profiled separately).

Or run the frontend locally without Docker:

```sh
cd frontend && pnpm install && pnpm dev
```

Make sure `db` and `backend` are running (`docker compose up -d db backend`).

## Running locally

### Database

```sh
docker compose up -d db
```

### Backend

```sh
cd backend
go run .
```

Starts on `:8080`, connects to `postgres://newnorth:newnorth@localhost:5432/newnorth`.

### Frontend

```sh
cd frontend
pnpm install
pnpm dev
```

Starts on `:3000`. Set `VITE_API_BASE_URL` in `.env.local` if you need a custom API path (defaults to `/api`).

## Rebuilding after code changes

After modifying backend or frontend code:

```sh
docker compose build backend
docker compose build frontend
docker compose up -d
```

## Environment variables

| Variable                 | Default                                                              | Description             |
|--------------------------|----------------------------------------------------------------------|-------------------------|
| `PORT`                   | `8080`                                                               | Backend listen port     |
| `DATABASE_URL`           | `postgres://newnorth:newnorth@localhost:5432/newnorth?sslmode=disable` | PostgreSQL connection   |
| `FRONTEND_URL`           | —                                                                    | CORS origin             |
| `VITE_API_BASE_URL`      | `/api`                                                               | Frontend API base path  |
| `VITE_API_PROXY_TARGET`  | `http://localhost:8080`                                               | Vite dev proxy target   |
