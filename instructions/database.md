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

All schema changes use version-controlled migrations.

Never:

- manually patch production schema as normal workflow;
- rewrite an already-applied production migration;
- hide destructive changes;
- delete data merely to make a migration succeed.

If a migration may cause data loss, stop and report it.

---

# 9. Development Migrations

During very early local development, migration history may sometimes be reset before any shared/production deployment if explicitly approved.

Once a migration has been shared/applied in an environment that matters, treat it as immutable history.

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
