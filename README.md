# Application foundation

Minimal Next.js App Router foundation for local development.

## Prerequisites

- Node.js 20.9 or later
- [pnpm](https://pnpm.io) 10

## Setup

```bash
pnpm install
```

## Environment

Copy `.env.example` to `.env.local` when you need local overrides. `.env.local` stays untracked, and `.env.example` contains no real credentials.

This foundation does not require application-specific environment variables yet.

Validated configuration lives in:

- `src/lib/env/server.ts` for server-only variables
- `src/lib/env/client.ts` for browser-safe `NEXT_PUBLIC_*` variables

Server-only secrets must not use the `NEXT_PUBLIC_` prefix. Values with that prefix are inlined into the browser bundle and are visible to visitors.

When a feature introduces configuration, add it to the matching schema in the same change. Application code should read `serverEnv` or `clientEnv` instead of using `process.env` directly.

## Local development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

These commands run locally. They do not need PostgreSQL, object storage, or external credentials.

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
