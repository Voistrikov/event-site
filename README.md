# Event Booking App

React, Express, Prisma and PostgreSQL implementation of the TED 2026 event
management assignment.

## Prerequisites

- Docker Engine with Docker Compose v2
- About 4 GB of free disk space when keeping the optional e-class dataset

For Docker development, Node.js and PostgreSQL do not need to be installed on
the host.

## Environment

Copy the example once and replace the development secrets if necessary:

```bash
cp .env.example .env
```

`JWT_SECRET` must contain at least 32 characters. Do not commit `.env`.
On Linux, set `LOCAL_UID` and `LOCAL_GID` to the output of `id -u` and
`id -g` if your account does not use the default `1000:1000` IDs. This keeps
Prisma-generated bind-mounted files owned by your host account.

## First launch (or launch after a rebuild)

From the repository root:

```bash
docker compose up --build -d
docker compose exec backend npm run db:seed
docker compose ps
curl http://localhost:3000/health
```

The backend container generates Prisma Client and applies all pending database
migrations before starting. The seed is intentionally a separate command so a
normal restart cannot reset ticket availability in an existing database.

Development URLs:

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:3000/health>
- pgAdmin: <http://localhost:5050>
- PostgreSQL host port: `5433`

Seeded development accounts all use password `123`:

- `admin`
- `organizer`
- `customer`

Change these credentials for any non-development deployment.

## Normal restart

The PostgreSQL data is retained in the `postgres_data` Docker volume:

```bash
docker compose down
docker compose up -d
```

After source/dependency or Dockerfile changes:

```bash
docker compose down
docker compose up --build -d
```

Useful diagnostics:

```bash
docker compose ps
docker compose logs -f backend frontend
```

## Completely fresh database

This permanently removes the local database volume:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend npm run db:seed
```

Do not use `down -v` when existing local data must be preserved.

## Official recommendation dataset

The e-class dataset is expected at:

```text
backend/dataset/rel_event_csvs/
```

It is supplied separately and ignored by Git and Docker build contexts because
it is approximately 1.5 GB. Once the containers are running, evaluate the
from-scratch Biased Matrix Factorization implementation with:

```bash
docker compose exec backend npm run dataset:evaluate
```

Only `event_interest.csv` is required for this evaluation. The historical,
anonymized events are not inserted into the production tables; live
recommendations are trained from current confirmed bookings and event views.
See [`backend/dataset/README.md`](backend/dataset/README.md) for the signal
mapping and rationale.

## Run without Docker

Use Node.js 22 and a reachable PostgreSQL instance:

```bash
cd backend
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

In a second terminal:

```bash
cd frontend
npm ci
npm run dev -- --host
```

Before submission or deployment, verify both builds:

```bash
(cd backend && npm run build)
(cd frontend && npm run build)
```
