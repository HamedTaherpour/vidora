# Architecture Instructions

Read this file for tasks that:

- introduce modules;
- change application boundaries;
- introduce infrastructure;
- create APIs;
- add major dependencies;
- change persistence architecture;
- change deployment architecture.

Also read the relevant ADRs.

---

## 1. Architecture Baseline

The application is a Next.js modular monolith.

Default flow:

```text
UI
 ↓
Application / Domain Logic
 ↓
Infrastructure
```

Infrastructure includes concerns such as:

- PostgreSQL;
- Prisma;
- object storage;
- SMS provider;
- payment provider.

---

## 2. Module Ownership

Organize business code around capabilities.

Expected major capabilities include:

```text
auth
footage
media
search
orders
payments
invoices
downloads
blog
```

Exact internal folder structures should emerge from actual complexity.

Do not force every module to contain identical folders such as:

```text
controllers/
services/
repositories/
entities/
use-cases/
```

unless those layers are genuinely useful.

Structural symmetry is not a goal.

Clarity is.

---

## 3. Application Directory

`src/app/` primarily owns Next.js routing and framework boundaries.

Avoid placing substantial business logic directly in:

- pages;
- layouts;
- React components;
- Route Handlers;
- Server Actions.

These surfaces should delegate meaningful business behavior to the relevant module.

---

## 4. Server Components

Prefer Server Components when a component:

- primarily reads server data;
- does not require browser state;
- does not require browser APIs;
- does not require client-side interaction.

Do not add `"use client"` to large component trees merely for convenience.

Move the client boundary down to the smallest practical interactive component.

---

## 5. Server Actions

Server Actions may be used for suitable application mutations.

They are not a replacement for application/domain boundaries.

A Server Action should typically:

1. authenticate/authorize where necessary;
2. validate input;
3. call the relevant application behavior;
4. return an appropriate result.

Do not embed complex commerce, payment, or entitlement logic directly inside a Server Action.

---

## 6. Route Handlers

Create Route Handlers when an HTTP endpoint is genuinely required.

Examples:

- payment provider callback;
- upload signing;
- protected download authorization;
- auth-library endpoint where required;
- external integration callback.

Do not create internal HTTP APIs simply so server-side Next.js code can call itself over HTTP.

---

## 7. Validation

Validate untrusted input at system boundaries.

Use the project's approved schema-validation tooling.

Validation should occur before business logic relies on the input.

Do not duplicate identical validation rules across many unrelated files.

---

## 8. Provider Boundaries

External providers should use narrow adapters where provider replacement or provider-specific behavior matters.

Examples:

```text
SmsProvider
PaymentProvider
ObjectStorage
```

Keep interfaces limited to application needs.

Do not create generic integration frameworks.

---

## 9. Abstraction Threshold

Do not create an abstraction merely because two code fragments look similar.

Create an abstraction when it provides a concrete benefit such as:

- preserving a business invariant;
- isolating an external provider;
- removing meaningful duplication;
- creating a testable boundary;
- preventing architectural leakage.

Three explicit functions can be better than one premature generic framework.

---

## 10. Performance

Do not optimize hypothetical bottlenecks.

Prefer:

1. correct query design;
2. appropriate indexes;
3. server rendering/caching where naturally useful;
4. direct media transfer;
5. measurement.

Do not introduce Redis, queues, workers, distributed caching, or additional services without demonstrated need.

---

## 11. Future Features

Known future possibilities do not automatically belong in current architecture.

Examples:

- shopping cart;
- contributors;
- After Effects assets;
- automated transcoding;
- recommendation systems.

Design clean current boundaries, but do not implement future systems in advance.

---

## 12. Architectural Change

If implementation appears to require violating an accepted ADR:

do not silently work around it.

Report:

```text
Architectural conflict:
Current ADR:
Required change:
Reason:
Suggested decision to review:
```

Architecture changes belong in explicit decisions, not hidden inside feature commits.
