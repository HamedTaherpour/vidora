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

Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your PostgreSQL connection string. Also set `OTP_HASH_SECRET` to at least 32 random characters. Kavenegar variables are required only when the app sends an OTP SMS. `.env.local` stays untracked, and `.env.example` contains placeholders, not real credentials.

Validated configuration lives in:

- `src/lib/env/server.ts` for server-only variables
- `src/lib/env/client.ts` for browser-safe `NEXT_PUBLIC_*` variables

`DATABASE_URL` and `OTP_HASH_SECRET` are server-only. They must not use the `NEXT_PUBLIC_` prefix. Values with that prefix are inlined into the browser bundle and are visible to visitors. Kavenegar credentials are also server-only. They are validated when the SMS provider is constructed, not during application boot.

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

The first versioned migration is `20261001171654_init_auth_core`. It creates the customer authentication tables. The phone format checks in that migration are hand-written SQL because Prisma schema cannot represent `CHECK` constraints. Later canonical-phone columns use the same CHECK pattern. See `instructions/database.md`.

## Local development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

These commands do not need a reachable PostgreSQL server, object storage, or external credentials. `pnpm build` still requires `DATABASE_URL` to be a PostgreSQL URL and `OTP_HASH_SECRET` to be at least 32 characters, because server configuration is validated during the build. It does not require Kavenegar credentials. The placeholders in `.env.example` are enough when you are not connecting or sending SMS. `pnpm typecheck`, `pnpm test`, and `pnpm build` run `prisma generate` first. Generation does not connect to a database and does not require `OTP_HASH_SECRET`.

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

`pnpm test:pg` is optional. It checks OTP request locking against the local development database. `pnpm test` does not run it, and CI does not run it.

Canonical agent files can be checked separately:

```bash
pnpm check:agent-tooling
```
