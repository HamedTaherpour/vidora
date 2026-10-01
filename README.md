# Application foundation

Minimal Next.js App Router foundation for local development.

## Prerequisites

- Node.js 20.9 or later
- [pnpm](https://pnpm.io) 10
- PostgreSQL

Docker is not required. Use a local PostgreSQL install or any hosted PostgreSQL database.

## Setup

```bash
pnpm install
```

`pnpm install` generates the Prisma Client. You can also run `pnpm db:generate`.

## Environment

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your PostgreSQL connection string. `.env.local` stays untracked, and `.env.example` contains a placeholder, not a real credential.

Validated configuration lives in:

- `src/lib/env/server.ts` for server-only variables
- `src/lib/env/client.ts` for browser-safe `NEXT_PUBLIC_*` variables

`DATABASE_URL` is server-only. It must not use the `NEXT_PUBLIC_` prefix. Values with that prefix are inlined into the browser bundle and are visible to visitors.

When a feature introduces configuration, add it to the matching schema in the same change. Application code should read `serverEnv` or `clientEnv` instead of using `process.env` directly.

## Database

Generate the Prisma Client:

```bash
pnpm db:generate
```

Generated output is written to `src/generated/prisma`. Do not edit those files by hand. They are not committed.

Create and apply a local development migration:

```bash
pnpm prisma migrate dev --name <migration-name>
```

That command needs a reachable database at `DATABASE_URL`. Generating the client does not.

If Prisma asks to reset the database, stop and get human approval before continuing.

`pnpm db:studio` opens Prisma Studio against the same `DATABASE_URL`.

The first versioned migration is `20261001171654_init_auth_core`. It creates the customer authentication tables. The phone format checks in that migration are hand-written SQL because Prisma schema cannot represent `CHECK` constraints. See `instructions/database.md`.

## Local development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

These commands do not need a reachable PostgreSQL server, object storage, or external credentials. `pnpm build` still requires `DATABASE_URL` to be a PostgreSQL URL because server configuration is validated during the build. The placeholder in `.env.example` is enough when you are not connecting. `pnpm typecheck`, `pnpm test`, and `pnpm build` run `prisma generate` first. Generation does not connect to a database.

GitHub Actions runs `format:check`, `lint`, `typecheck`, `test`, and `build` on pull requests and on pushes to `master`.

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm format` rewrites files. The other commands only check or build, and each exits non-zero when its check fails.

Canonical agent files can be checked separately:

```bash
pnpm check:agent-tooling
```
