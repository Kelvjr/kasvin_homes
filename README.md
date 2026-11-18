# Kasvin Homes

M0 development foundation for a Ghanaian short-stay apartment platform. This monorepo contains two independent Next.js applications, an Express API, and shared TypeScript packages. No booking or apartment business features are implemented yet.

## Stack and layout

- `apps/web`: public Next.js 16 website, port 3000
- `apps/dashboard`: private dashboard placeholder, Next.js 16, port 3001. It contains no administrative data or APIs until authentication is implemented.
- `apps/api`: Express 5 REST API, port 4000
- `apps/owner-app`: reserved for a future Flutter Android app; excluded from pnpm
- `packages/database`: Prisma 7, PostgreSQL adapter, connection utility
- `packages/shared`: shared TypeScript exports
- `packages/config`: strict base TypeScript settings
- `docs`: architecture and milestone records

The workspace uses pnpm 11 and Turborepo 2. The supported project runtime is Node.js 24 LTS. Local checks may also run on Node.js 26. PostgreSQL 17 is the optional local development version in `compose.yaml`; Prisma 7 supports PostgreSQL 17.

## Prerequisites

Install Node.js 24 LTS and pnpm 11.25.0. Docker is optional if you have an existing PostgreSQL instance. No third-party accounts or API keys are needed for M0 local development.

## Local setup

```sh
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env
cp apps/web/.env.example apps/web/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

The frontend `.env` files are optional until the apps call the API. `NEXT_PUBLIC_API_URL` is a public base URL only; never put credentials in a `NEXT_PUBLIC_` variable.

For local PostgreSQL, run `docker compose up -d postgres` if Docker is installed. Otherwise, provide a PostgreSQL 17 compatible connection string from an existing local instance or a separate Railway development database. Set `DATABASE_URL` in `apps/api/.env` and `packages/database/.env`. The example password is for local development only. Do not use it on a public database. M0 has no domain models or migrations, so no database migration is needed.

The API requires valid `DATABASE_URL` and `CORS_ORIGINS` at startup. It starts even if PostgreSQL is temporarily unavailable: `/api/v1/health` returns 200 while the process is running, and `/api/v1/ready` returns 503 until PostgreSQL can answer `SELECT 1`. CORS defaults in the example file allow only `http://localhost:3000` and `http://localhost:3001`; add deployment origins explicitly later.

## Commands

```sh
pnpm dev                         # all three apps
pnpm --filter @kasvin/web dev    # website only
pnpm --filter @kasvin/dashboard dev
pnpm --filter @kasvin/api dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format
pnpm format:check
pnpm --filter @kasvin/database generate
```

For production, build the workspace and run the API with `pnpm --filter @kasvin/api start`. Each Next.js app can run its own `start` script after building. The API build requires database package generation but does not require a live database. Future migrations use `pnpm --filter @kasvin/database migrate:dev` locally and `migrate:deploy` in deployment workflows; do not run them until M1 creates models.

## Environment variables

| Variable              | Location                                  | Purpose                                   |
| --------------------- | ----------------------------------------- | ----------------------------------------- |
| `DATABASE_URL`        | `apps/api/.env`, `packages/database/.env` | PostgreSQL URL for runtime and Prisma CLI |
| `NODE_ENV`            | `apps/api/.env`                           | `development`, `test`, or `production`    |
| `PORT`                | `apps/api/.env`                           | API listening port, default 4000          |
| `CORS_ORIGINS`        | `apps/api/.env`                           | Comma-separated allowed browser origins   |
| `NEXT_PUBLIC_API_URL` | each Next.js app's `.env`                 | Public API base URL                       |

`.env` files are ignored by Git. Commit only `.env.example` files. Tests use mocked database checks and do not need credentials.

## Troubleshooting

- API fails on startup: compare `apps/api/.env` with its example; ensure `DATABASE_URL` is a PostgreSQL URL and `CORS_ORIGINS` lists full origins.
- Health works but readiness returns 503: PostgreSQL is not reachable at `DATABASE_URL`; check the service, host, port, and credentials.
- A port is occupied: stop the other process or change the API `PORT`. Website and dashboard development ports are fixed at 3000 and 3001.
- `pnpm install` reports an unsupported Node version: use Node.js 24 LTS.

## Deployment overview and milestone

The public website and dashboard will be separate Vercel projects with independent environment variables and domains. The API will run as a Railway Node service, backed by PostgreSQL. No deployment is configured in M0. See [architecture](docs/architecture/overview.md) and [M0 record](docs/milestones/M0.md). The next milestone is M1, database schema and apartment management; it has not started.
