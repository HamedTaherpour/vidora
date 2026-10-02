# Database Instructions

Read this file for tasks involving:

- Prisma schema;
- migrations;
- database queries;
- transactions;
- indexes;
- persistence;
- monetary fields;
- data deletion.

Also read ADR-0002.

---

# 1. Database Baseline

The primary application database is PostgreSQL.

Prisma is the default ORM and migration tool.

Do not introduce another application database without an approved architecture decision.

---

# 2. Schema Design

Model current business concepts directly.

Prefer explicit models such as:

```text id="3x1myh"
User
Footage
FootageFile
Order
OrderItem
Payment
Entitlement
Invoice
BlogPost
```

when required by implemented product behavior.

Do not create generic frameworks such as:

```text id="s1ub7b"
Entity
Asset
Resource
Record
DigitalProduct
WorkflowObject
```

solely to anticipate hypothetical future products.

Future After Effects products do not justify prematurely replacing the V1 Footage domain with a generic asset system.

---

# 3. Add Models When Needed

Do not create the entire future schema during initial database setup.

Add models alongside the roadmap phase that requires them.

This keeps migrations:

- understandable;
- reviewable;
- tied to real behavior.

---

# 4. Constraints

Use database constraints to protect important invariants where appropriate.

Examples may include:

- unique normalized customer phone;
- unique Footage slug;
- unique invoice number;
- unique provider reference where provider semantics require it;
- entitlement uniqueness where required by the purchase model.

Do not rely only on application checks when a database constraint can safely enforce a critical invariant.

---

# 5. IDs

Use the project's chosen consistent ID strategy.

Customer authentication rows use PostgreSQL `gen_random_uuid()` for `User`, `OtpChallenge`, `OtpRequestEvent`, and `Session`. Those IDs are internal. The customer-facing identity is the canonical phone number, not the UUID.

Do not expose assumptions about database row ordering through public identifiers.

Customer-facing identifiers such as invoice numbers may require a separate format from internal primary keys.

Do not invent multiple ID systems without a requirement.

---

# 6. Money

Never use floating-point database types for monetary values.

Use the approved integer monetary representation.

The canonical database unit must be explicitly defined before commerce schema is finalized.

Do not infer Rial/Toman conversion.

Price displayed to users may differ in representation from the canonical stored/payment unit, but the conversion boundary must be explicit.

---

# 7. Historical Snapshots

Mutable catalog data must not rewrite historical commerce meaning.

Order items should snapshot required purchase-time information such as:

- title;
- price;
- monetary unit context where necessary.

Invoices must use historical purchase data rather than current catalog data.

---

# 8. Migrations

All schema changes use version-controlled Prisma migrations.

Prisma ORM 7 in this repository:

- schema: `prisma/schema.prisma`;
- CLI config: `prisma.config.ts`, including the PostgreSQL URL from `DATABASE_URL`;
- migration directory: `prisma/migrations`;
- generated client: `src/generated/prisma` (generated, not hand-edited, not committed);
- server entry point: `src/lib/db/client.ts`, using the PostgreSQL driver adapter.

The datasource block in the schema does not contain the database URL.

Local commands:

```text
pnpm db:generate
pnpm prisma migrate dev --name <migration-name>
pnpm db:studio
```

`pnpm db:migrate` is `prisma migrate dev`. Pass a migration name explicitly when creating one.

`pnpm db:generate` does not connect to PostgreSQL and must keep working without production credentials.

Docker is not required. Point `DATABASE_URL` at a local or hosted PostgreSQL instance.

The first versioned migration is `prisma/migrations/20261001171654_init_auth_core`. It creates only the customer authentication tables in section 21. Prisma ORM 7.10 cannot represent `CHECK` constraints in `schema.prisma`, so that migration's phone `CHECK` constraints were added to the generated SQL before it was applied. Do not drop those statements when editing the migration. Do not use an empty placeholder migration.

Never:

- manually patch production schema as normal workflow;
- rewrite an already-applied shared or production migration;
- hide destructive changes;
- delete data merely to make a migration succeed;
- accept a destructive database reset automatically;
- run destructive migrations against production casually;
- use `prisma db push` as a substitute for versioned migrations in shared or production workflows.

`prisma db push` is not the project migration workflow.

If a migration may cause data loss, stop and report it.

If `prisma migrate dev` asks to reset the database, stop and require human approval. Do not pass flags that accept data loss.

---

# 9. Development Migrations

During very early local development, migration history may sometimes be reset before any shared or production deployment if a human explicitly approves that reset.

Once a migration has been shared or applied in an environment that matters, treat it as immutable history.

Do not assume a migration can be rewritten merely because doing so is easier.

---

# 10. Transactions

Use transactions when multiple dependent database changes form one consistency boundary.

Important candidate:

```text id="w3clb5"
Successful verified payment
        ↓
Order paid
        ↓
Entitlement created
        ↓
Invoice created/finalized
```

External network calls must not casually be held inside long-running database transactions.

Separate external verification from the database completion transaction where appropriate.

---

# 11. Idempotency

Database design should help enforce idempotent critical operations.

For payment completion, do not rely only on:

```text id="svh9tm"
if (!exists) {
  create()
}
```

when concurrent requests could violate the assumption.

Use appropriate:

- unique constraints;
- transactional checks;
- atomic operations;

based on the actual invariant.

---

# 12. Query Design

Fetch only data required by the operation.

Avoid uncontrolled N+1 query patterns.

Do not optimize queries speculatively, but inspect important catalog and commerce queries deliberately.

---

# 13. Indexes

Indexes should follow real query patterns.

Likely examples include:

- published Footage listing;
- Footage slug lookup;
- category/tag relationships;
- user Order history;
- user entitlement lookup;
- payment authority/reference lookup;
- invoice number lookup.

Do not add indexes to every field.

Every index has write/storage cost.

---

# 14. Search

V1 search uses PostgreSQL.

Do not introduce an external search service without demonstrated need and an approved architecture decision.

Persian search behavior should be tested against representative product metadata rather than assumed.

---

# 15. Raw SQL

Prisma is the default.

Raw SQL is allowed when necessary for correctness or meaningful query capability.

Raw SQL must:

- have a clear reason;
- be parameterized;
- not interpolate untrusted input;
- have appropriate verification/tests.

Do not use raw SQL merely because it is familiar.

---

# 16. Deletion

Deletion is a product and data-lifecycle decision.

Do not automatically hard-delete records connected to:

- purchases;
- payments;
- invoices;
- entitlements;
- historical customer activity.

Do not invent cascading deletion behavior for convenience.

Catalog removal may be better represented by publication/archive state depending on the approved product behavior.

If deletion semantics are undefined, stop and report them.

---

# 17. Media

PostgreSQL stores media metadata and object references.

It does not store video binary data.

Use object storage according to ADR-0004.

---

# 18. Timestamps

Use consistent server/database timestamps.

Store timestamps in an unambiguous representation.

Customer authentication timestamps use PostgreSQL `timestamptz(3)`. `createdAt` defaults to `CURRENT_TIMESTAMP`. `User.updatedAt` is maintained by Prisma Client.

Localization and Persian/Jalali display concerns belong to presentation, not canonical persistence.

---

# 19. Seed Data

Seed scripts must not become a hidden source of production business rules.

Development seed data should be:

- deterministic enough for development;
- clearly non-production;
- safe to rerun when designed to be rerunnable.

Never include real secrets or sensitive customer data.

---

# 20. Production Data Safety

Before any production-sensitive database operation, consider:

- backup;
- reversibility;
- data loss;
- locking;
- migration duration.

If the risk is meaningful, report it before execution.

Correctness is more important than completing a migration automatically.

---

# 21. Customer Authentication Persistence

The first applied migration, `20261001171654_init_auth_core`, creates the customer authentication tables `User`, `OtpChallenge`, and `Session`. `20261001174721_otp_request_event` adds `OtpRequestEvent`. `20261002110000_otp_challenge_superseded_at` adds `OtpChallenge.supersededAt`. `20261002133000_otp_challenge_sent_at` adds `OtpChallenge.sentAt` and sets it to `createdAt` on rows that already existed. Those rows were removed on provider failure before delivery was stored, so a surviving row was treated as active. The update does not delete rows. Footage, commerce, media, and blog models are not part of these migrations.

Administrative identity is deferred. V1 has one administrator, but no approved Admin authentication persistence contract exists yet. `User` has no role column, and customers and Admin do not share an identity model by assumption.

## User

`User` is the customer identity.

- `id`: PostgreSQL `gen_random_uuid()`.
- `phone`: required, unique, `varchar(13)`, canonical `+989XXXXXXXXX`.
- `createdAt` and `updatedAt`: `timestamptz(3)`.

`User_phone_key` is the unique index. Concurrent creation of the same phone fails in PostgreSQL. Application code must not treat select-then-insert as the identity guarantee.

`User_phone_canonical_check` requires:

```text
^\+989[0-9]{9}$
```

`varchar(13)` also rejects a longer value before that check runs. The check rejects a value that fits the column but is not the canonical form, including `0912...` and `98912...` stored without normalization.

There is no email, name, or profile column.

## OtpChallenge

`OtpChallenge` stores one OTP attempt for a canonical phone.

- `phone`: same `varchar(13)` column and the same canonical-phone `CHECK` as `User.phone`.
- `codeHash`: HMAC-SHA256 hex digest of the OTP, keyed with `OTP_HASH_SECRET`. The plaintext code is never stored. The lifetime value is the 5-minute policy in `instructions/security.md`.
- `expiresAt`: challenge expiry.
- `failedAttemptCount`: failed verification attempts, starting at 0. The limit of 5 is policy in `instructions/security.md`, not a column.
- `consumedAt`: null until successful use. A non-null value invalidates the challenge. Successful use is the only meaning of this column.
- `sentAt`: null while the challenge is only reserved. The post-send write sets it after the provider accepts the SMS and before older challenges are superseded. A null value is not eligible for verification. While that reserved row is unexpired, it blocks every older challenge for the same phone. A non-null value means that send was accepted. It does not mean the code was verified. An explicit provider failure deletes the reserved row. A crash or a failed `sentAt` write keeps it.
- `supersededAt`: null until a newer OTP for this canonical phone is successfully sent. The transaction after `sentAt` commits sets it on each previous unconsumed, unexpired challenge. A non-null value invalidates the challenge. It does not mean the code was verified. `expiresAt` stays the original lifetime. A missing `supersededAt` does not make an earlier challenge eligible again while a newer non-failed row for that phone still blocks it. A newer row with `sentAt` set blocks permanently. A newer row with `sentAt` null blocks until that row expires. The full selection rule is in `instructions/security.md`.
- `createdAt`.

A challenge does not reference `User`. The row can exist before the customer does. OTP request does not create a `User`.

`OtpChallenge_phone_createdAt_idx` supports lookup of a phone's challenges in creation order. Other columns are not indexed.

## OtpRequestEvent

`OtpRequestEvent` is the durable count for OTP request limits. `OtpChallenge` has no client IP column. An in-memory counter would not hold across application instances, and Redis is not an approved dependency. This table is only the OTP request-rate record. It is not a generic rate-limit framework.

- `id`: PostgreSQL `gen_random_uuid()`.
- `phone`: same `varchar(13)` canonical-phone `CHECK` as `OtpChallenge.phone`.
- `clientIp`: `varchar(45)`, the single bounded address supplied at the request boundary. It is not a forwarded-header list.
- `createdAt`: `timestamptz(3)`.

One row is inserted when an OTP send is allowed. Phone limits count rows for that canonical phone in the rolling hour. IP limits count rows for that `clientIp` in the rolling hour. Indexes are `OtpRequestEvent_phone_createdAt_idx` and `OtpRequestEvent_clientIp_createdAt_idx`.

A failed SMS send keeps the event row and deletes the reserved challenge (`sentAt` null). A delivered challenge is not deleted. Cooldown and rate-limit rejections do not insert a row. Rows are retained. No cleanup policy is defined.

The event does not reference `User`.

## Session

`Session` is the server-side customer session.

- `userId`: required foreign key to `User`.
- `secretHash`: unique hash of the browser session secret. The raw secret is not stored. Lookup uses this hash.
- `expiresAt` and `createdAt`.

`Session_userId_fkey` uses `ON DELETE CASCADE` and `ON UPDATE CASCADE`. Deleting a user deletes that user's sessions. A session has no meaning without its user, and sessions are not purchase, payment, invoice, or entitlement history. User deletion itself is not a product flow.

There is no revocation column. Explicit logout behavior belongs to a later authentication task. There is no refresh token or JWT table.

`Session_userId_idx` supports the foreign key. `Session_secretHash_key` is the session lookup index.
