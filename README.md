# Application foundation

Minimal Next.js App Router foundation for local development.

## Prerequisites

- Node.js 20.9 or later
- [pnpm](https://pnpm.io) 10

## Setup

```bash
pnpm install
```

## Local development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

These commands run locally. They do not need PostgreSQL, object storage, or external credentials.

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
