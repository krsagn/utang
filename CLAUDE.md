# Utang: Claude Code Guide

## Repo Structure

Monorepo with three top-level concerns:

- `client/` - React 19 frontend (Vite)
- `server/` - Express v5 backend
- `docker-compose.yml` - local PostgreSQL and Redis

## Running Locally

Start in this order:

1. `docker compose up -d` (from root)
2. `cd server && npm run dev`
3. `cd server && npm run worker` (separate terminal, BullMQ email worker)
4. `cd client && npm run dev`

## Server Architecture

Layered: `routes/` → `controllers/` → `db/`. No service layer. Controllers handle validation, DB queries, and socket emits directly.

- Zod validation happens at the top of each controller function, before any DB call
- Socket.io emits happen in controllers immediately after DB operations

## Client Architecture

Feature-Sliced Design:

- `app/` - providers, global setup
- `pages/` - route-level components
- `widgets/` - composite UI blocks (layout, sidebar)
- `features/` - user actions (create-debt, update-debt, auth, etc.)
- `entities/` - domain models and their UI (debt, user, friendship)
- `shared/` - reusable utilities, hooks, and UI primitives

## Testing

Integration tests only, on the server. Tests hit a real database.

```bash
cd server && npm test
cd server && npm run test:coverage
```

Test files are in `server/src/tests/`, organised by feature (auth, debts, friendships, users, utils).

## Auth Pattern

`authMiddleware` runs globally on every request. It reads the Lucia session cookie, validates it, and attaches `user` and `session` to `res.locals`. It also handles session extension (sliding window) by issuing a fresh cookie when the session is close to expiring.

`requireAuth` is a separate guard placed explicitly on protected routes after `authMiddleware`. It returns 401 if `res.locals.user` is null. Both are in `server/src/middleware/auth.ts`.

In controllers, the authenticated user is accessed via `res.locals.user`.

## Drizzle Conventions

- Schema: `server/src/db/schema.ts`
- Generated migrations: `server/drizzle/`
- Config: `server/drizzle.config.ts`

In development, use `npm run db:push` (pushes schema directly, no migration files). For production, the intended flow is `npm run db:generate` to produce a migration file, then `npm run db:migrate` to apply it. The `drizzle/` folder contains existing migration history. Do not delete it.

## Environment Variables

Only `server/.env` exists. There is no `client/.env`. All server config (DB, Redis, Resend, ports) lives there. The client reads nothing from env at runtime. Vite inlines anything prefixed `VITE_` at build time, but none are currently used.

Do not hardcode config values. Always use `process.env.*` on the server.

## BullMQ and Redis

One queue: `emailQueue` (defined in `server/src/queues/emailQueue.ts`).

Two job types: `lenderCreationEmail` and `lendeeCreationEmail`. Both are enqueued in `debtController.ts` after a debt is created.

Jobs are processed in `server/src/workers/emailWorker.ts`, which runs as a completely separate Node process (`npm run worker`). The main server and the worker share the same Redis instance but have no direct code dependency on each other. The worker does not emit Socket.io events.

Retry config: 3 attempts with exponential backoff starting at 5 seconds.

## Known Gotchas

- The worker must be running separately for emails to be sent. It is not started by `npm run dev`.
- Socket.io emits happen in controllers, not in a service layer or the worker.
- There is no service layer. If you find yourself creating one, stop and ask.
- `db:push` is for dev. Do not suggest `db:migrate` for local development.

## Writing Style

READMEs and code comments must use Australian spelling (e.g. "organised", "initialised", "recognised"). Avoid em-dashes and semicolons in prose.
