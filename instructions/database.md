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

Customer authentication rows use PostgreSQL `gen_random_uuid()` for `User`, `OtpChallenge`, `OtpRequestEvent`, and `Session`. Admin authentication rows use the same strategy for `Admin` and `AdminSession`. Those IDs are internal. The customer-facing identity is the canonical phone number, not the UUID. Admin identity is also the canonical phone on `Admin`, not the UUID.

Do not expose assumptions about database row ordering through public identifiers.

Customer-facing identifiers such as invoice numbers may require a separate format from internal primary keys.

Do not invent multiple ID systems without a requirement.

---

# 6. Money

Never use floating-point database types for monetary values.

The approved durable money convention is:

- canonical business and storage unit: **Toman**;
- monetary values are stored as **integers**;
- floating-point money is forbidden.

Example: `120000` means 120,000 Toman.

Do not convert Footage prices (or other catalog money) to Rial in persistence.

If a payment provider requires another unit, convert explicitly at the payment-provider boundary only. Do not scatter Rial/Toman conversion across UI, catalog, or order code.

Storefront display uses Toman and matches the stored unit in V1.

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

# 21. Customer and Admin Authentication Persistence

The first applied migration, `20261001171654_init_auth_core`, creates the customer authentication tables `User`, `OtpChallenge`, and `Session`. `20261001174721_otp_request_event` adds `OtpRequestEvent`. `20261002110000_otp_challenge_superseded_at` adds `OtpChallenge.supersededAt`. `20261002133000_otp_challenge_sent_at` adds `OtpChallenge.sentAt` and sets it to `createdAt` on rows that already existed. Those rows were removed on provider failure before delivery was stored, so a surviving row was treated as active. The update does not delete rows. `20261005183000_admin_auth_boundaries` adds `OtpChallenge.purpose`, `Admin`, and `AdminSession`. Footage, commerce, media, and blog models are not part of these authentication migrations. `Footage` is added later by `20261005214800_add_footage`.

Admin identity is separate from Customer `User`. V1 has one administrator, but the `Admin` table may hold more than one row without introducing permissions or RBAC. `User` has no role column.

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

`OtpChallenge` stores one OTP attempt for a canonical phone and authentication purpose.

- `phone`: same `varchar(13)` column and the same canonical-phone `CHECK` as `User.phone`.
- `purpose`: `customer` or `admin`. Cooldown, supersession, and active selection are scoped by phone + purpose. Hourly request limits remain shared across purposes.
- `codeHash`: HMAC-SHA256 hex digest of the OTP, keyed with `OTP_HASH_SECRET`. The plaintext code is never stored. The lifetime value is the 5-minute policy in `instructions/security.md`.
- `expiresAt`: challenge expiry.
- `failedAttemptCount`: failed verification attempts, starting at 0. Each wrong code adds 1. The count is not reset. At 5 the challenge is permanently unusable. That count is the exhaustion record. The limit of 5 is policy in `instructions/security.md`, not a separate column. Verification does not invent `lockedAt` or `consumedAt` for this state.
- `consumedAt`: null until successful use. A non-null value invalidates the challenge. Successful use is the only meaning of this column. Attempt exhaustion does not set it.
- `sentAt`: null while the challenge is only reserved. The post-send write sets it after the provider accepts the SMS and before older same-purpose challenges are superseded. A null value is not eligible for verification. While that reserved row is unexpired, it blocks every older challenge for the same phone and purpose. A non-null value means that send was accepted. It does not mean the code was verified. An explicit provider failure deletes the reserved row. A crash or a failed `sentAt` write keeps it.
- `supersededAt`: null until a newer OTP for this canonical phone and purpose is successfully sent. The transaction after `sentAt` commits sets it on each previous unconsumed, unexpired challenge for that phone and purpose. A non-null value invalidates the challenge. It does not mean the code was verified. `expiresAt` stays the original lifetime. A missing `supersededAt` does not make an earlier challenge eligible again while a newer non-failed row for that phone and purpose still blocks it. A newer row with `sentAt` set blocks permanently. A newer row with `sentAt` null blocks until that row expires. The full selection rule is in `instructions/security.md`.
- `createdAt`.

A challenge does not reference `User` or `Admin`. A customer challenge can exist before the customer does. An Admin challenge does not create an Admin. OTP request does not create a `User` or an `Admin`.

`OtpChallenge_phone_purpose_createdAt_idx` supports lookup of a phone's challenges for one purpose in creation order. Other columns are not indexed.

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
- `secretHash`: unique SHA-256 hex digest of the UTF-8 cookie token. The token is 32 random bytes encoded as base64url. The raw token is not stored. Lookup hashes the cookie and reads this column.
- `expiresAt`: exactly 30 days after `createdAt`. A request does not extend it. An expired session is not authenticated.
- `createdAt`.

`Session_userId_fkey` uses `ON DELETE CASCADE` and `ON UPDATE CASCADE`. Deleting a user deletes that user's sessions. A session has no meaning without its user, and sessions are not purchase, payment, invoice, or entitlement history. User deletion itself is not a product flow.

There is no revocation column. Explicit logout behavior belongs to a later authentication task. There is no refresh token or JWT table.

`Session_userId_idx` supports the foreign key. `Session_secretHash_key` is the session lookup index.

## Admin

`Admin` is the administrator identity. It is not a Customer `User` and has no role column.

- `id`: PostgreSQL `gen_random_uuid()`.
- `phone`: required, unique, `varchar(13)`, canonical `+989XXXXXXXXX`.
- `createdAt` and `updatedAt`: `timestamptz(3)`.

`Admin_phone_key` is the unique index within administrators. The same phone may also exist on `User` without linking the identities.

`Admin_phone_canonical_check` requires the same pattern as `User_phone_canonical_check`:

```text
^\+989[0-9]{9}$
```

There is no public Admin signup. Rows are manually provisioned. There is no email, name, password, or permissions column.

## AdminSession

`AdminSession` is the server-side Admin session. It is separate from customer `Session`.

- `adminId`: required foreign key to `Admin`.
- `secretHash`: unique SHA-256 hex digest of the UTF-8 cookie token. Lookup hashes the `vidora_admin_session` cookie and reads this column.
- `expiresAt`: exactly 30 days after `createdAt`. A request does not extend it.
- `createdAt`.

`AdminSession_adminId_fkey` uses `ON DELETE CASCADE` and `ON UPDATE CASCADE`. Deleting an Admin deletes that Admin's sessions. Cascade is storage cleanup, not an approved Admin deletion product policy.

There is no revocation column. Explicit logout behavior belongs to a later authentication task. There is no refresh token or JWT table.

`AdminSession_adminId_idx` supports the foreign key. `AdminSession_secretHash_key` is the Admin session lookup index.

## Footage

`Footage` is the V1 purchasable catalog entity. Migration `20261005214800_add_footage` creates only this model. Media files, categories, tags, search, orders, payments, entitlements, invoices, and blog models are not part of it.

- `id`: PostgreSQL `gen_random_uuid()`.
- `titleFa`: required Persian title, `varchar(200)`.
- `slug`: required, unique, `varchar(120)`. Uniqueness is the durable lookup invariant. Automatic slug generation and slug-history/redirect tables are not part of this model.
- `descriptionFa`: required Persian description, `text`.
- `priceToman`: required integer Toman amount. Floating-point money is forbidden. Zero is allowed at the persistence layer. Negative values are rejected by `Footage_priceToman_non_negative_check`. No commercial minimum or maximum is invented here.
- `status`: `DRAFT` or `PUBLISHED`. Speculative states such as `ARCHIVED` or `SCHEDULED` are not modeled.
- `createdAt` and `updatedAt`: `timestamptz(3)`. Jalali dates are not persisted.
- `publishedAt`: `timestamptz(3)`, nullable. Must be null when `status` is `DRAFT`, and must be non-null when `status` is `PUBLISHED`. `Footage_published_state_check` enforces that pairing. Scheduled publishing is not supported.

`Footage_slug_key` is the unique slug index. `Footage_status_idx` supports the known published-footage storefront listing query.
