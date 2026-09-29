# ADR-0002: PostgreSQL and Prisma

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

The product has strongly relational data.

Examples include:

```text
User
  ↓
Order
  ↓
OrderItem
  ↓
Footage
```

and:

```text
Footage
  ↓
FootageFile
```

and:

```text
Order
  ↓
Payment
  ↓
Invoice
```

Correctness and consistency are particularly important for:

- verified payments;
- order state;
- purchase entitlements;
- invoices;
- download authorization.

The initial catalog is expected to contain approximately 1,000 footage items.

V1 does not require a distributed database or dedicated search database.

## Decision

The primary V1 database will be:

```text
PostgreSQL
```

The ORM and migration tooling will be:

```text
Prisma
```

At project bootstrap, the project must install and pin the architecture-approved stable Prisma major version.

At the time this ADR was accepted, **Prisma 7** is the project baseline.

A Prisma major-version upgrade requires explicit review and must not happen as an incidental dependency update.

## Database Responsibilities

PostgreSQL is the authoritative store for application data including:

- users;
- authentication-related persistent data where applicable;
- footage metadata;
- footage-file metadata;
- categories;
- tags;
- orders;
- order items;
- payments;
- invoices;
- purchase entitlements;
- download history;
- blog posts.

Binary video files must not be stored in PostgreSQL.

## Schema Design

The schema should model current business requirements directly.

Do not create generic asset, commerce, workflow, or content frameworks solely because future product types may exist.

Known future possibilities such as After Effects assets do not justify premature generic modeling in V1.

Schema extensibility should come from clean current models rather than speculative abstraction.

## Migration Policy

All database schema changes must use version-controlled migrations.

AI agents must not:

- manually mutate production schema;
- rewrite an already-deployed migration;
- hide destructive operations inside unrelated migrations;
- accept data loss merely to make a migration easier.

Destructive migrations require explicit human review before execution.

Large data backfills or migrations with meaningful operational risk also require review.

## Monetary Values

Monetary values must never use floating-point storage.

The canonical stored monetary unit must be explicitly documented by the commerce implementation before monetary schema is finalized.

The storefront may display prices in Toman, but display representation and stored representation must not be implicitly mixed.

AI agents must not invent Rial/Toman conversion behavior.

## Transactions

Any workflow involving multiple dependent writes must explicitly consider transactional consistency.

For example:

```text
Verify Payment
      ↓
Mark Order Paid
      ↓
Create Entitlement
      ↓
Create / Finalize Invoice
```

The system must avoid partially completed purchase state.

The exact transaction boundary should be determined by the relevant implementation task and payment-provider semantics.

## Search

V1 will use PostgreSQL-backed search and filtering for the footage catalog.

The current architecture does not include:

- Elasticsearch;
- OpenSearch;
- Meilisearch;
- Typesense;
- another dedicated search service.

A dedicated search engine may be introduced later only when actual product or performance evidence justifies it.

## Indexing

Indexes must follow real query patterns.

Do not indiscriminately index every column.

Important query patterns likely include:

- published footage listing;
- footage lookup by slug;
- category and tag filtering;
- user order history;
- user entitlement lookup;
- payment reference lookup;
- invoice lookup.

Indexes should be introduced and tested alongside the queries they support.

## Raw SQL

Prisma should be the default data-access mechanism.

Limited raw SQL is allowed when Prisma cannot express an important query efficiently or correctly.

Raw SQL must:

- have a documented reason;
- be parameterized;
- preserve type safety as far as practical;
- be covered by appropriate tests.

## Consequences

### Positive

- strong relational integrity;
- transaction support;
- mature database ecosystem;
- explicit schema and migration history;
- straightforward data model for humans and AI agents;
- sufficient capability for the expected V1 catalog and workload.

### Negative

- advanced Persian full-text search requirements may eventually justify additional search infrastructure;
- specialized queries may occasionally require SQL beyond Prisma's normal API.

## AI Agent Constraints

AI agents must not:

- add a second database without an approved architecture decision;
- add a dedicated search engine without an approved architecture decision;
- introduce speculative generic schemas for hypothetical future products;
- store binary video data in PostgreSQL;
- use floating-point monetary values;
- create destructive migrations without reporting them for human review;
- upgrade Prisma across a major version without explicit approval.

If the current database architecture cannot satisfy a requirement, the agent must report the limitation rather than silently introducing new infrastructure.
