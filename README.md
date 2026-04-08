# Utang

[![CI Pipeline](https://github.com/krsagn/utang/actions/workflows/ci.yml/badge.svg)](https://github.com/krsagn/utang/actions/workflows/ci.yml)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-Reviewed-4940FC.svg)](https://coderabbit.ai/)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/krsagn/utang.svg)](https://codecov.io/gh/krsagn/utang)

> **Full-stack debt tracker with real-time WebSocket updates, email notifications, session auth, a 65-test integration suite, and a Framer Motion-animated React 19 frontend.**

<!-- [Live Demo](https://your-domain.com) -->

_"Utang" is Tagalog for "debt". It's a tracker for shared expenses between friends._

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src=".github/assets/utang-outgoing-page.png" width="32%" alt="Outgoing transactions page" />
  <img src=".github/assets/utang-incoming-page.png" width="32%" alt="Incoming transactions page" />
  <img src=".github/assets/utang-create-debt-page.png" width="32%" alt="Create debt page" />
</p>
<!-- markdownlint-enable MD033 -->

---

## Features

- **Debt Tracking**: Record debts as outgoing (money owed by you) or incoming (money owed to you), with optional deadlines, descriptions, and multi-currency support. Debts can be created with registered friends or unregistered strangers (name-only participants).
- **Friend Management**: Search for registered users by name or username, send friend requests, and manage pending/accepted friendships.
- **Real-Time Updates**: Debt and friendship events are emitted via Socket.io and consumed by a `RealtimeProvider` that invalidates React Query caches, so the UI updates instantly across all connected clients without a refresh.
- **Email Notifications**: When a debt is created, both parties receive an automated email. Jobs are queued via BullMQ and processed by a dedicated worker process, keeping email delivery decoupled from the request lifecycle.
- **Session-Based Auth**: Cookie-based sessions managed by Lucia v3, with Argon2 password hashing and Zod-validated request bodies before any database interaction.
- **Animated UI**: Page and layout animations built with Framer Motion, with semantic and accessible form patterns.

---

## Architecture

The server follows a **layered architecture**: Express routes delegate to controllers, which handle validation and DB queries directly. There is no separate service layer.

**Request flow:**

1. Express route receives the request
2. Controller parses and validates the body with a Zod schema (400 on failure)
3. Controller executes the Drizzle ORM query
4. Controller emits a Socket.io event to the relevant user room(s)
5. For debt creation, controller enqueues a BullMQ job for email delivery

**Real-time:**
Socket.io connections are authenticated at the handshake. The middleware reads the session cookie, validates it with Lucia, and rejects unauthenticated connections. Each user joins a room keyed to their user ID. The Redis adapter (`@socket.io/redis-adapter`) is initialised before the server starts accepting connections, enabling multi-instance pub/sub.

**Background jobs:**
The BullMQ email worker runs as a **separate process** (`npm run worker`) and shares the same Redis instance as the main server. This means the server can enqueue email jobs and respond immediately without waiting for delivery.

---

## Tech Stack

### Frontend

- **Framework**: React 19, React Router v7
- **Styling**: Tailwind CSS v4, Base UI, Radix UI (Shadcn CLI for scaffolding)
- **State & Data Fetching**: TanStack React Query, Axios
- **Animations**: Framer Motion
- **Tooling**: Vite, TypeScript, CodeRabbit (AI PR Reviews)

### Backend

- **Framework**: Node.js, Express v5
- **Database**: PostgreSQL (Dockerised)
- **ORM**: Drizzle ORM
- **Auth**: Lucia v3, Argon2
- **Validation**: Zod
- **Real-Time**: Socket.io, Redis adapter (`@socket.io/redis-adapter`) for multi-instance support
- **Background Jobs**: BullMQ (Redis-backed job queue), separate worker process
- **Email**: Resend
- **Cache & Queue**: Redis (Dockerised)

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/) (for PostgreSQL and Redis)

### 1. Database Setup

Navigate to the root directory and start the local PostgreSQL and Redis services using Docker. The configuration is defined in `docker-compose.yml`.

```bash
docker compose up -d
```

### 2. Backend Setup

From the `server` directory, install dependencies and prepare your database schema:

```bash
cd server
npm install
npm run db:generate
npm run db:push
npm run dev
```

_(Optional)_ You can populate the database with dummy data by running `npm run db:seed` in a separate terminal.

### 3. Start the Email Worker

In a separate terminal, start the BullMQ email worker process:

```bash
cd server
npm run worker
```

### 4. Frontend Setup

Open a new terminal, navigate to the `client` directory, and start the frontend development application:

```bash
cd client
npm install
npm run dev
```

The frontend application should now be accessible in your web browser, typically at `http://localhost:5173`.

> **Tip:** Docker runs detached in the background. The backend, worker, and frontend each need their own terminal.

---

## Scripts

### Server

- `npm run db:studio` - Launches Drizzle Studio.
- `npm run worker` - Starts the BullMQ email worker process.
- `npm run test` - Runs backend tests.
- `npm run db:reset` - Resets and wipes the database.
- `npm run db:fresh` - Resets the database and runs the seed script.
- `npm run test:coverage` - Runs backend tests with a detailed coverage report.

### Client

- `npm run build` - Builds the frontend for production.
- `npm run lint` - Runs eslint linting to enforce code quality.
- `npm run test` - Runs frontend unit tests.

---

## Testing

The backend has an integration test suite of **65 tests** organised by feature (auth, debts, friendships, users, utils), covering all API endpoints and core business logic. Backend coverage is tracked at **~82%** via Codecov. The frontend also has a Vitest unit test suite covering shared utility logic.

The CI pipeline runs on every push and pull request, and includes typechecking, linting, a production build check, and coverage reporting for both the server and client.

Run the test suite:

```bash
cd server
npm test
```

Run with a detailed coverage report:

```bash
cd server
npm run test:coverage
```

---

## Roadmap

- [ ] **AWS Deployment**: App Runner (server), RDS (PostgreSQL), ElastiCache (Redis), Vercel (frontend)
- [ ] **LLM Integration**: Natural language interface for creating and modifying debts via Claude, powered by tool use against the existing API
- [ ] **MCP Server**: Expose debt and friendship operations as an MCP server for external agent access
- [ ] **Better Auth Migration**: Replace Lucia v3 with Better Auth
- [ ] **Group Bill Splitting**: Split a single expense across multiple participants

---

## License

MIT License. See [LICENSE](LICENSE) for details.
