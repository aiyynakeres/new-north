# new-north

Минималистичная блог-платформа для передовой молодёжи Якутии — делиться опытом, вдохновлять и общаться.

## Стек

- **Бэкенд** — Go (chi router, pgx, PostgreSQL)
- **Фронтенд** — React + Vite + TypeScript + Tailwind
- **База данных** — PostgreSQL 17
- **Инфраструктура** — Docker Compose

## Структура проекта

```
new-north/
├── backend/
│   ├── handlers/         # HTTP-обработчики
│   ├── middleware/        # Аутентификация
│   ├── models/           # Типы данных
│   ├── store/
│   │   ├── db.go         # Подключение к PostgreSQL и миграции
│   │   ├── migrations/   # SQL-файлы миграций
│   │   ├── seed.go       # Начальные данные
│   │   └── store.go      # Слой доступа к данным
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

## Разработка

Бэкенд и БД запускаются в Docker, фронтенд — локально (hot reload).

```sh
# 1. Запустить БД и бэкенд
docker compose up -d db backend

# 2. Запустить фронтенд локально
cd frontend
pnpm install
pnpm dev
```

- **Фронтенд** — `http://localhost:3000` (Vite, HMR)
- **Бэкенд** — `http://localhost:8080`

Vite проксирует `/api` на `localhost:8080`.

## Production-сборка

```sh
docker compose up --build
```

- **Фронтенд** — `http://localhost:3000` (nginx, статика)
- **Бэкенд** — `http://localhost:8080`
- **База данных** — `localhost:5432`

Данные хранятся в именованном томе (например, `new-north_pgdata`).

## Локальный запуск (всё вручную)

### База данных

```sh
docker compose up -d db
```

### Бэкенд

```sh
cd backend
go run .
```

Стартует на `:8080`, подключается к `postgres://newnorth:newnorth@localhost:5432/newnorth`.

### Фронтенд

```sh
cd frontend
pnpm install
pnpm dev
```

Стартует на `:3000`. Укажите `VITE_API_BASE_URL` в `.env.local` для кастомного пути к API (по умолчанию `/api`).

## Пересборка бэкенда после изменений

```sh
docker compose build backend
docker compose up -d backend
```

## Переменные окружения

| Переменная              | По умолчанию                                                          | Описание                |
|-------------------------|-----------------------------------------------------------------------|-------------------------|
| `PORT`                  | `8080`                                                                | Порт бэкенда            |
| `DATABASE_URL`          | `postgres://newnorth:newnorth@localhost:5432/newnorth?sslmode=disable` | Подключение к PostgreSQL|
| `FRONTEND_URL`          | —                                                                     | CORS origin             |
| `VITE_API_BASE_URL`     | `/api`                                                                | Базовый путь API для фронтенда |
| `VITE_API_PROXY_TARGET` | `http://localhost:8080`                                                | Цель прокси Vite        |
