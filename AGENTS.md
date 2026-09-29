# AGENTS.md

This file is the canonical entry point for AI coding agents working in this repository.

The project intentionally uses strong engineering governance with a simple architecture.

The goal is not maximum abstraction or maximum process.

The goal is:

> Build the smallest correct implementation that satisfies the approved product requirements and remains maintainable.

---

# 1. Mandatory Reading

Before implementing any task, read:

1. this file;
2. `docs/PROJECT.md`;
3. the task definition in `docs/ROADMAP.md`;
4. ADRs relevant to the task;
5. instructions relevant to the task.

Do not read unrelated documentation merely to increase context.

Use the smallest context set that is sufficient to implement the task correctly.

- [AI governance](instructions/ai-governance.md) for instruction precedence, risk classification, verification integrity, adversarial review, and AI-assisted change discipline.
- [Project organization](instructions/project-organization.md) for Next.js source placement, module ownership, server/client boundaries, and shared-code placement.
- [Frontend implementation](instructions/frontend-implementation.md) for React/Next.js implementation rules, Server Components, client boundaries, effects, state, accessibility, RTL, and design-contract compliance.
- [Functions and types](instructions/functions-and-types.md) for TypeScript function signatures, props, type placement, inference, provider types, and naming conventions.

---

# 2. Sources of Truth

The repository uses the following authority order.

## Product behavior

```text
docs/PROJECT.md
```

Defines:

- V1 product scope;
- business rules;
- explicit non-goals;
- unresolved product decisions.

## Architecture

```text
docs/adr/
```

Defines accepted architectural decisions.

## Execution

```text
docs/ROADMAP.md
```

Defines:

- implementation order;
- task scope;
- dependencies;
- acceptance criteria.

## Engineering Rules

```text
instructions/
```

Defines implementation constraints and engineering practices.

- Canonical policy lives in `AGENTS.md`, `docs/*`, and `instructions/*`. Tool-specific files and Skills may reference canonical policy but must not duplicate or redefine it.

## Design

```text
docs/design/
```

Defines approved design foundations and component/page contracts when available.

---

# 3. Conflict Rule

If two canonical sources appear to conflict:

**STOP.**

Do not choose the interpretation you prefer.

Report:

- the conflicting sources;
- the conflicting rules;
- why implementation depends on resolving them.

Wait for clarification before implementing the conflicting behavior.

---

# 4. Ambiguity Rule

Never invent a business rule.

If correct implementation depends on an undefined product decision:

**STOP and report the ambiguity.**

Examples include:

- refund eligibility;
- download-count limits;
- license interpretation;
- access to files added after purchase;
- account recovery behavior;
- legal invoice requirements.

Do not silently choose a "reasonable default."

Technical implementation details may be chosen when they do not create new product behavior or contradict architecture.

---

# 5. Scope Rule

Implement only the assigned roadmap task.

You may make small supporting changes required to complete the task correctly.

Do not opportunistically implement future roadmap tasks.

Do not perform unrelated refactors.

Do not add speculative infrastructure.

If a useful improvement is outside scope, report it separately instead of implementing it.

---

# 6. Architecture Rule

Use the narrowest architecture that correctly satisfies the current requirement.

Do not introduce architecture for hypothetical future scale.

Current V1 architecture is intentionally based on:

- one repository;
- one Next.js application;
- modular monolith;
- PostgreSQL;
- Prisma;
- S3-compatible object storage;
- server-side business logic;
- direct-to-storage large media transfer.

Do not introduce without an approved architectural change:

- separate NestJS backend;
- microservices;
- Redis;
- BullMQ;
- message queues;
- event bus;
- Elasticsearch;
- Meilisearch;
- Typesense;
- generic repository frameworks;
- CQRS;
- event sourcing.

---

# 7. Dependency Rule

Before adding a dependency:

1. determine whether the existing stack already solves the problem;
2. confirm the dependency solves a concrete requirement;
3. prefer maintained and focused dependencies;
4. avoid overlapping libraries for the same responsibility.

Do not add dependencies for trivial utilities that can be implemented safely in a few lines.

Do not perform major dependency upgrades as part of an unrelated task.

If a dependency introduces a major architectural or security consequence, report it before adding it.

---

# 8. Business Logic Placement

Business rules must not live inside presentation components.

Prefer:

```text
UI / Route
    ↓
Application or Domain Function
    ↓
Database / Infrastructure
```

React components should primarily handle presentation and interaction.

Route Handlers should represent genuine HTTP boundaries rather than becoming a mandatory internal API layer.

---

# 9. Security-Critical Areas

Treat the following as security-critical:

- authentication;
- OTP;
- admin authorization;
- payment creation;
- payment verification;
- purchase completion;
- entitlement;
- protected downloads;
- signed URLs;
- media uploads;
- invoice/account verification;
- secrets.

Security-critical behavior requires explicit negative-path testing where practical.

Never weaken authorization or validation to make implementation easier.

---

# 10. Data Safety

Never perform or generate destructive database operations casually.

Report:

- destructive migrations;
- irreversible transformations;
- potential data loss;
- production-sensitive cleanup operations.

Do not rewrite already-applied migrations.

Do not invent deletion/retention policies.

---

# 11. Testing Rule

Tests should protect behavior that matters.

Prioritize tests for:

- business rules;
- authorization;
- money;
- payment verification;
- idempotency;
- entitlement;
- normalization;
- critical state transitions.

Do not write tests merely to increase test count.

Do not test framework internals.

Never:

- delete a valid test because implementation fails;
- weaken an assertion merely to make CI green;
- skip a failing test without explaining why.

---

# 12. Design Rule

When an approved Design Contract exists, implementation must follow it.

Do not redesign the component while implementing it.

Do not introduce arbitrary visual values when semantic design tokens exist.

If the contract is incomplete in a way that materially affects implementation, report the ambiguity.

---

# 13. Comments

Comments should explain:

- why a non-obvious decision exists;
- important constraints;
- external-provider behavior;
- security-sensitive reasoning.

Do not add comments that merely restate obvious code.

---

# 14. Error Handling

Expected failures must be handled deliberately.

Do not silently swallow errors.

Do not expose internal errors, credentials, provider secrets, stack traces, OTP values, or sensitive storage URLs to customers.

Logs should contain enough context for diagnosis without leaking secrets.

---

# 15. Completion

Before reporting a task as ready for review:

1. re-read the task acceptance criteria;
2. inspect the final diff;
3. run required verification;
4. confirm no unrelated scope was introduced;
5. confirm relevant documentation remains correct.

Use the repository's Definition of Done.

Implementation agents normally finish at:

```text
READY_FOR_REVIEW
```

not:

```text
DONE
```

---

# 16. Completion Report

Use this structure:

```text
Task:
Status: READY_FOR_REVIEW

Implemented:
- ...

Files changed:
- ...

Tests added/updated:
- ...

Verification executed:
- ...

Documentation updated:
- ...

Known limitations / unresolved questions:
- ...

Ready for review.
```

Do not claim a command passed unless it was actually executed successfully.

---

# 17. Core Principle

When choosing between:

- clever and simple;
- generic and specific;
- future-proof and requirement-driven;

prefer the simplest implementation that correctly satisfies the approved current requirement.

Do not confuse additional architecture with additional quality.
