---
name: implement-roadmap-task
description: Implement one bounded task from docs/ROADMAP.md. Use when asked to implement a roadmap task by ID such as FND-01, AUTH-03, MEDIA-03, PAY-02, or another defined task. Load the canonical project rules, determine only the context relevant to that task, implement the smallest coherent change, run appropriate verification, update the task status, and finish with a READY_FOR_REVIEW report.
---

# Implement Roadmap Task

Implement exactly one task from `docs/ROADMAP.md`.

Do not treat this Skill as a replacement for canonical project documentation.

## 1. Resolve the Task

Find the requested task ID in:

```text
docs/ROADMAP.md
```

Read its:

- objective;
- dependencies;
- requirements;
- acceptance criteria;
- out-of-scope notes.

If the task does not exist, stop and report it.

If a required dependency is not complete, determine whether that genuinely blocks implementation.

Do not silently implement the dependency.

---

## 2. Load Canonical Context

### AI Governance

For all non-trivial implementation work, read:

`instructions/ai-governance.md`

Use it to determine:

- change risk;
- whether independent review is required;
- whether external facts must be verified;
- whether unresolved ambiguity blocks implementation.

### Project Organization

For tasks that create, move, or reorganize application code, modules, routes, shared UI, server-only code, or cross-cutting utilities, read:

`instructions/project-organization.md`

### Frontend Implementation

For React, Next.js pages, layouts, components, hooks, client/server boundaries, forms, loading/error states, RTL, or design implementation, read:

`instructions/frontend-implementation.md`

### Functions and Types

For TypeScript APIs, exported functions, React props, shared types, provider-response types, or module contracts, read:

`instructions/functions-and-types.md`

Always read:

```text
AGENTS.md
docs/PROJECT.md
docs/ROADMAP.md
instructions/implementation.md
instructions/definition-of-done.md
```

Then load only the additional context relevant to the task.

### Architecture

For architectural boundaries, modules, infrastructure, APIs, or major dependencies:

```text
instructions/architecture.md
relevant docs/adr/*
```

### Database

For Prisma, schema, migrations, persistence, transactions, queries, or indexes:

```text
instructions/database.md
docs/adr/0002-postgresql-prisma.md
```

### Authentication / Security

For authentication, authorization, OTP, Admin access, secrets, or sensitive endpoints:

```text
instructions/security.md
docs/adr/0003-phone-otp-authentication.md
```

### Media

For upload, storage, FootageFile, previews, originals, or downloads:

```text
instructions/media.md
instructions/security.md
docs/adr/0004-private-object-storage-media-delivery.md
```

### Commerce

For pricing, Orders, Payments, Entitlements, Library, protected purchase access, or Invoices:

```text
instructions/commerce.md
instructions/security.md
instructions/database.md
docs/adr/0005-buy-now-commerce-payment-entitlement-invoice.md
```

### Testing

Read:

```text
instructions/testing.md
```

when the task introduces or changes test-worthy behavior.

### Design

For storefront/UI work, read:

- `instructions/project-organization.md`
- `instructions/frontend-implementation.md`
- `instructions/functions-and-types.md`
- relevant approved files under `docs/design/`

Do not invent missing product-level visual decisions when an approved Design Contract is required.

For storefront/UI work, read relevant approved files under:

```text
docs/design/
```

Do not invent missing product-level visual decisions when an approved Design Contract is required.

---

## 3. Inspect Existing Code

Before editing, inspect the smallest relevant code surface.

Understand:

- current implementation;
- module boundaries;
- existing tests;
- existing validation;
- existing dependencies;
- nearby conventions.

Do not begin by restructuring unrelated code.

### UI discovery gate

For any task that implements or changes UI, complete a concise reuse plan before
editing. Inspect the relevant Admin or Storefront feature/domain components,
application-level components, `src/components/ui`, `components.json`, and nearby
tests. Consult `.agents/skills/shadcn/SKILL.md` and current component
documentation when shadcn usage or composition is relevant.

The plan must state:

- relevant existing components found;
- components to reuse and how they compose;
- components to add, if necessary;
- ownership and responsibility of each new component; and
- unresolved design or architecture decisions;
- for each relevant control pattern, the UI pattern, inspected existing
  component, installed primitive (if any), official shadcn candidate (if
  applicable), reuse/add/retain-native decision, and justification.

When no suitable primitive is installed, perform the official shadcn candidate
evaluation before modifying UI code. Do not treat an empty `src/components/ui`
directory as sufficient justification for custom-styled native controls. Follow
the semantic-native exceptions and approval rule in `instructions/components.md`.

Follow the ownership order in `instructions/components.md`. Do not recreate an
existing component with raw styled HTML or add a shared abstraction without a
demonstrated reusable responsibility. Apply the objective approval triggers in
`instructions/components.md` before implementation; small, localized,
well-defined UI work continues after recording the plan without an unnecessary
checkpoint.

Use this workflow for UI tasks:

```text
Discover → Plan → Implement → Verify → Review
```

---

## 4. Check for Blockers

Before implementation, stop if correctness depends on:

- an unresolved product rule;
- conflicting canonical documentation;
- an unapproved architecture change;
- missing required design decisions;
- unknown provider semantics that affect correctness;
- a destructive database decision requiring human review.

Report the blocker precisely.

Do not choose a convenient default.

---

## 5. Mark the Task In Progress

When repository workflow permits roadmap editing, change:

```text
TODO
```

to:

```text
IN_PROGRESS
```

for the assigned task.

Do not modify unrelated task statuses.

---

## 6. Implement

Make the smallest coherent change that fully satisfies the task.

Follow these rules:

- preserve existing behavior unless the task intentionally changes it;
- keep business logic out of presentation components;
- validate untrusted input;
- authorize sensitive operations server-side;
- keep external providers behind approved narrow boundaries;
- avoid speculative abstractions;
- avoid unrelated refactors;
- do not implement future roadmap tasks.

If implementation reveals a new unresolved requirement, stop at that boundary and report it.

---

## 7. Add Proportional Tests

Use:

```text
instructions/testing.md
```

to determine appropriate test depth.

Prioritize important invariants over test quantity.

For security-sensitive behavior, include relevant negative paths.

For bug fixes, add a regression test where practical.

Do not weaken existing tests to make the implementation pass.

---

## 8. Verify Incrementally

Run the narrowest relevant checks first.

Examples:

```text
targeted test
typecheck
lint
```

Then run the broader repository quality gates required by the task and Definition of Done.

Typical final verification:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not claim a command succeeded unless it was actually executed successfully.

If verification cannot run because of missing infrastructure or credentials, report exactly what was not executed and why.

---

## 9. Self-Review

Before handoff:

1. inspect the final diff;
2. re-read the task acceptance criteria;
3. remove debugging code;
4. remove accidental changes;
5. check for secrets;
6. check for unnecessary dependencies;
7. check scope;
8. confirm canonical documentation remains accurate.

Do not hand off known incomplete acceptance criteria as ready for review.

---

## 10. Update Roadmap Status

If the implementation satisfies the requirements and required implementer-side verification:

```text
IN_PROGRESS
→ READY_FOR_REVIEW
```

Do not mark the task `DONE`.

If implementation cannot continue because of a genuine blocker:

```text
IN_PROGRESS
→ BLOCKED
```

and explain the blocker.

---

## 11. Handoff

Finish with:

```text
Task: <TASK-ID> — <Task Name>
Status: READY_FOR_REVIEW

Implemented:
- ...

Files changed:
- ...

Tests added/updated:
- ...

Component Reuse Plan (UI tasks only):
- Existing component paths inspected: ...
- Components selected for reuse: ...
- New components introduced and justification: ...
- Important ownership decisions: ...
- Reasons for bypassing available components, when relevant: ...
- Control-pattern decisions (pattern, inspected component, installed primitive,
  official candidate, reuse/add/retain-native decision, justification): ...

Verification executed:
- ...

Documentation updated:
- ...

Dependencies added:
- ...

Known limitations / unresolved questions:
- ...

Ready for review.
```

Use `None` when appropriate.

Never hide failed or unexecuted verification.
