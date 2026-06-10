# new-north

A minimalist blogging platform for the advanced youth of Yakutia to share experiences, inspire, and connect.

## Project structure

```
new-north/
├── backend/         # Go API server (chi router, in-memory store)
├── frontend/        # React + Vite + TypeScript SPA
├── docker-compose.yml
└── README.md
```

## Running locally

### Backend

```sh
cd backend
go run .
```

Starts on `:8080`.

### Frontend

```sh
cd frontend
pnpm install
pnpm dev
```

Starts on `:3000`, proxies `/api` to `localhost:8080`.

## Running with Docker Compose

```sh
docker compose up --build
```

- **Frontend** — `http://localhost:80` (nginx, serves built SPA, proxies `/api` to backend)
- **Backend** — `http://localhost:8080`

## Environment variables

| Variable | Default | Description         |
|----------|---------|---------------------|
| `PORT`   | `8080`  | Backend listen port |
