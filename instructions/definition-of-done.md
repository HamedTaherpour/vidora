# Definition of Done

This document defines when an implementation task is ready for review and when it may be considered complete.

The purpose is to prevent:

> "The code was written, therefore the task is done."

A task is complete only when its required behavior has been implemented and verified.

---

# 1. Two Completion Levels

The normal implementation-agent endpoint is:

```text id="gmvrhu"
READY_FOR_REVIEW
```

Final task completion is:

```text id="x7kw8e"
DONE
```

An implementation agent should normally report `READY_FOR_REVIEW`.

A task becomes `DONE` after required review and verification are satisfied.

---

# 2. Ready for Review

A task may be reported as `READY_FOR_REVIEW` only when all applicable conditions below are satisfied.

---

## 2.1 Scope Is Complete

All acceptance criteria in the assigned roadmap task are implemented.

No required criterion is knowingly omitted.

If a criterion cannot be completed because of an unresolved decision or external blocker, the task is:

```text id="e3sd5w"
BLOCKED
```

not ready for review.

---

## 2.2 Scope Was Not Expanded

The implementation does not contain unrelated features or refactors.

Future roadmap tasks were not implemented opportunistically.

Any useful out-of-scope improvement is reported separately.

---

## 2.3 Product Rules Are Preserved

Implementation matches:

```text id="if70bt"
docs/PROJECT.md
```

No new business behavior was invented.

Known unresolved product rules remain unresolved unless a human-approved decision was added to the canonical documentation.

---

## 2.4 Architecture Is Preserved

Implementation follows applicable ADRs.

No new infrastructure, architectural layer, or major dependency was introduced without justification and approval where required.

---

## 2.5 Relevant Instructions Were Followed

Applicable files under:

```text id="mx25zk"
instructions/
```

were followed.

This includes relevant:

- security;
- database;
- media;
- commerce;
- testing;
- implementation;

requirements.

---

## 2.6 Code Is Understandable

Code should be understandable without unnecessary cleverness.

Names should reflect domain meaning.

Avoid:

- unexplained abstractions;
- unnecessary indirection;
- dead code;
- commented-out implementation;
- debugging leftovers;
- placeholder TODOs that hide incomplete acceptance criteria.

A TODO is acceptable only when it represents explicitly deferred scope and does not make the current task incomplete.

---

## 2.7 Type Safety Is Preserved

TypeScript checks pass.

No unjustified `any` or unsafe type bypass was introduced.

Do not use type assertions merely to silence a real type problem.

---

## 2.8 Validation Exists Where Required

Untrusted inputs introduced by the task are validated at the appropriate boundary.

Client validation alone is not sufficient for security-sensitive server behavior.

---

## 2.9 Authorization Exists Where Required

Sensitive server operations introduced by the task enforce appropriate authorization.

Examples include:

- Admin mutations;
- customer-owned resources;
- protected downloads;
- upload authorization.

UI visibility alone does not satisfy this requirement.

---

## 2.10 Error Handling Is Deliberate

Expected failure paths introduced by the task are handled.

Errors are not silently swallowed.

Public errors do not unnecessarily expose internal implementation details or secrets.

---

## 2.11 Tests Match Risk

Required tests exist for meaningful behavior.

Tests protect the important invariant rather than implementation trivia.

A task does not automatically require new tests if it does not introduce test-worthy behavior.

---

## 2.12 Existing Tests Remain Valid

Existing tests pass unless an approved requirement intentionally changes their behavior.

Tests were not weakened merely to make the implementation pass.

---

## 2.13 Database Changes Are Safe

If the task includes a migration:

- migration is version controlled;
- destructive behavior has been identified;
- important constraints are deliberate;
- data-loss risk has been reported;
- already-applied migrations were not rewritten.

---

## 2.14 Secrets Are Safe

No credentials or production secrets were added to:

- source files;
- tests;
- fixtures;
- documentation;
- client bundles;
- logs.

Environment examples contain placeholders only.

---

## 2.15 Documentation Is Consistent

If implementation changes a documented technical contract, relevant documentation is updated.

Do not modify product documentation merely to justify an implementation deviation.

Unresolved conflicts must be reported.

---

# 3. Required Verification

Run the verification appropriate to the task.

The normal repository quality gates are expected to include:

```text id="ewd11b"
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Select verification according to the task:

- formatting, linting, and typechecking for changed code;
- unit or component tests for changed behavior;
- `pnpm test:pg` when PostgreSQL behavior or constraints are part of the task;
- build verification when application wiring, routes, or production compilation are affected;
- browser or E2E verification when the task changes a browser flow and the required tooling is available.

Do not claim Playwright or any other browser tooling is installed or executed unless
the repository and the current environment provide evidence for it.

Task-specific tests should normally be run before the entire suite when that provides faster feedback.

---

# 4. Infrastructure-Dependent Verification

Some tasks may require:

- PostgreSQL;
- object storage;
- SMS provider;
- payment provider;
- external credentials.

If required verification cannot be executed in the current environment:

do not claim it passed.

Report:

```text id="24apri"
Not executed:
- ...

Reason:
- ...

Required follow-up:
- ...
```

The task may remain `READY_FOR_REVIEW` only if the missing verification is not required to establish implementation correctness at that stage.

Otherwise mark it `BLOCKED`.

---

# 5. Build Success Is Not Enough

The following does not prove a feature is correct:

```text id="85nrhq"
pnpm build
```

Build success proves only part of technical validity.

Business, security, persistence, and interaction behavior require their own verification where relevant.

---

# 6. Self-Review

Before handoff, inspect the final diff.

Check:

- every changed file;
- unexpected generated files;
- accidental formatting changes;
- unused imports;
- unused dependencies;
- debug output;
- commented-out code;
- secret exposure;
- unrelated refactors;
- acceptance criteria.

Do not hand off code you have not reviewed yourself.

---

# 7. Dependency Review

If a dependency was added:

confirm:

- it solves a real requirement;
- an existing dependency did not already solve it;
- it is actually used;
- its scope is reasonable;
- no unrelated major upgrades were introduced.

Mention the dependency and reason in the completion report.

---

# 8. Security-Critical Tasks

For security-critical tasks, explicitly verify negative paths where applicable.

Examples:

```text id="w7t2kf"
Unauthenticated access denied

Authenticated but unauthorized access denied

Failed payment does not create Entitlement

Customer cannot perform Admin operation

User B cannot download User A purchase
```

A happy-path-only implementation is not sufficient for these boundaries.

---

# 9. Commerce-Critical Tasks

For commerce tasks, verify relevant invariants such as:

- authoritative server price;
- historical price snapshot;
- provider verification;
- amount consistency;
- idempotency;
- Entitlement creation;
- Invoice creation.

Do not declare commerce work ready merely because the provider redirect works.

---

# 10. Media-Critical Tasks

For media tasks, verify relevant invariants such as:

- upload authorization;
- no server proxy for large files;
- original object privacy;
- explicit upload completion;
- entitlement before protected download;
- temporary signed access.

Do not declare media work ready merely because an object exists in storage.

---

# 11. Reviewer Responsibilities

The reviewer should evaluate:

1. requirement correctness;
2. scope discipline;
3. architecture compliance;
4. security implications;
5. test quality;
6. unnecessary complexity;
7. missing edge cases;
8. maintainability.

The reviewer should be adversarial but practical.

The goal is to find real defects, not manufacture stylistic disagreements.

---

# 12. Reviewer Outcomes

A reviewer may return:

```text id="49l3xa"
APPROVED
```

or:

```text id="p4ynj7"
CHANGES_REQUESTED
```

If changes are requested, the roadmap task returns to:

```text id="y1rjrh"
IN_PROGRESS
```

After fixes, verification and review occur again.

---

# 13. Done

A roadmap task may become `DONE` when:

- acceptance criteria are satisfied;
- required verification has passed;
- required review is approved;
- no known blocking issue remains;
- canonical documentation is consistent.

Do not mark a task `DONE` while a required decision or verification remains unresolved.

---

# 14. Completion Report

Use:

```text id="fqyfd2"
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

Use `None` where a section genuinely has nothing to report.

Do not omit failures.

Do not claim verification that was not executed.

---

# 15. Definition of Done Principle

The standard is not:

> Could this code work?

The standard is:

> Does the implementation satisfy the approved requirement, preserve the important invariants, and have enough evidence to be safely reviewed and accepted?

Keep that evidence proportional to the risk of the task.
