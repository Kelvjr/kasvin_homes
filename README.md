# Kasvin Homes

Kasvin Homes is a Ghanaian short-stay apartment platform. This monorepo contains two independent Next.js applications, an Express API, and shared TypeScript packages. M1 adds apartment management to the backend; bookings and availability are not implemented.

## Stack and layout

- `apps/web`: public Next.js 16 website, port 3000
- `apps/dashboard`: static dashboard placeholder, Next.js 16, port 3001. It has no frontend admin integration yet.
- `apps/api`: Express 5 REST API, port 4000
- `apps/owner-app`: reserved for a future Flutter Android app; excluded from pnpm
- `packages/database`: Prisma 7, apartment schema and migration, PostgreSQL adapter, seed and connection utility
- `packages/shared`: shared TypeScript exports
- `packages/config`: strict base TypeScript settings
- `docs`: architecture and milestone records

The workspace uses pnpm 11 and Turborepo 2. The supported project runtime is Node.js 24 LTS. Local checks may also run on Node.js 26. PostgreSQL 17 is the optional local development version in `compose.yaml`; Prisma 7 supports PostgreSQL 17.

## Prerequisites

Install Node.js 24 LTS and pnpm 11.25.0. Docker is optional if you have an existing PostgreSQL instance. No third-party account or API key is needed for M1 backend development.

## Local setup

```sh
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env
cp apps/web/.env.example apps/web/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

The frontend `.env` files are optional until the apps call the API. `NEXT_PUBLIC_API_URL` is a public base URL only; never put credentials in a `NEXT_PUBLIC_` variable.

For local PostgreSQL, run `docker compose up -d postgres` if Docker is installed. Otherwise, provide a PostgreSQL connection string from an existing local instance or a separate Railway development database. Set `DATABASE_URL` in `apps/api/.env` and `packages/database/.env`. Percent-encode special characters in URL passwords (for example, `@` becomes `%40`). The example password is for local development only. Do not use it on a public database. Apply the M1 migration, then explicitly seed the four draft apartments:

```sh
pnpm --filter @kasvin/database migrate:dev
pnpm --filter @kasvin/database generate
pnpm --filter @kasvin/database seed
```

The seed is idempotent and does not overwrite edited records. Never run it automatically in production. For deployment of reviewed migrations, use `pnpm --filter @kasvin/database migrate:deploy` with the deployment database URL. Do not use `migrate:dev` against production.

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
pnpm --filter @kasvin/database migrate:dev
pnpm --filter @kasvin/database seed
```

For production, build the workspace and run the API with `pnpm --filter @kasvin/api start`. Each Next.js app can run its own `start` script after building. The API build requires database package generation but does not require a live database. Admin apartment routes are intentionally unavailable in production until Clerk authorization is implemented.

## Environment variables

| Variable               | Location                                  | Purpose                                                                      |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`         | `apps/api/.env`, `packages/database/.env` | PostgreSQL URL for runtime and Prisma CLI                                    |
| `NODE_ENV`             | `apps/api/.env`                           | `development`, `test`, or `production`                                       |
| `PORT`                 | `apps/api/.env`                           | API listening port, default 4000                                             |
| `CORS_ORIGINS`         | `apps/api/.env`                           | Comma-separated allowed browser origins                                      |
| `NEXT_PUBLIC_API_URL`  | each Next.js app's `.env`                 | Public API base URL                                                          |
| `DEV_ADMIN_TOKEN`      | `apps/api/.env` only                      | Optional development admin bearer token; disabled in production              |
| `M1_TEST_DATABASE_URL` | test command environment                  | Optional disposable local PostgreSQL `*_test` database for integration tests |

`.env` files are ignored by Git. Commit only `.env.example` files. Generate a strong development token with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; store it only in `apps/api/.env`. The usual tests need no database credentials and skip the isolated integration suite when `M1_TEST_DATABASE_URL` is absent. See [the exact apartment API contract](docs/api/apartments.md).

## Troubleshooting

- API fails on startup: compare `apps/api/.env` with its example; ensure `DATABASE_URL` is a PostgreSQL URL and `CORS_ORIGINS` lists full origins.
- Health works but readiness returns 503: PostgreSQL is not reachable at `DATABASE_URL`; check the service, host, port, and credentials.
- A port is occupied: stop the other process or change the API `PORT`. Website and dashboard development ports are fixed at 3000 and 3001.
- `pnpm install` reports an unsupported Node version: use Node.js 24 LTS.

## Deployment overview and milestone

The public website and dashboard will be separate Vercel projects with independent environment variables and domains. The API will run as a Railway Node service, backed by PostgreSQL. No deployment is configured yet. See [architecture](docs/architecture/overview.md), [M0 history](docs/milestones/M0.md), and [M1 record](docs/milestones/M1.md). M2 will address availability and nightly pricing; it has not started.
