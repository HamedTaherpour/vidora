# Implementation Instructions

Read this file for every implementation task.

---

## 1. Before Coding

Before changing code:

1. read `AGENTS.md`;
2. read `docs/PROJECT.md`;
3. locate the assigned task in `docs/ROADMAP.md`;
4. read relevant ADRs;
5. read task-specific instructions;
6. inspect existing implementation related to the task.

Then restate internally:

- what must be implemented;
- what is explicitly out of scope;
- what must remain unchanged.

Do not begin by rewriting surrounding architecture.

---

## 2. Make the Smallest Coherent Change

Implement the complete assigned behavior, but avoid unrelated work.

Good:

```text
Task: implement phone normalization

Changes:
- normalization function
- validation schema
- tests
- minimal integration
```

Bad:

```text
Task: implement phone normalization

Changes:
- rewrite auth architecture
- introduce generic identity framework
- add email login
- restructure unrelated modules
```

---

## 3. Preserve Existing Behavior

Before modifying existing behavior, understand why it exists.

Do not delete:

- validation;
- authorization;
- tests;
- error handling;
- database constraints;

simply because they complicate the new implementation.

If existing behavior conflicts with the assigned task, report the conflict.

---

## 4. TypeScript

Use strict TypeScript.

Avoid:

```ts
any;
```

unless interacting with an unavoidable untyped boundary and the usage is contained and justified.

Prefer:

- inferred types where clear;
- explicit domain types where they improve correctness;
- schema-derived types when appropriate.

Do not create large collections of redundant type aliases.

---

## 5. Naming

Use names that describe domain meaning.

Prefer:

```text
verifyPayment
createPurchaseEntitlement
normalizeIranianMobile
authorizeFootageDownload
```

over:

```text
processData
handleThing
doAction
helper
manager
```

Avoid generic names when the code represents specific business behavior.

---

## 6. Functions

Prefer small functions with one clear responsibility.

Do not split simple logic into excessive layers merely to produce more files.

A function should make important side effects obvious.

Payment, database writes, external calls, and authorization should not be hidden behind misleading utility names.

---

## 7. Error Handling

Distinguish expected application failures from unexpected failures where useful.

Examples of expected failures:

- invalid OTP;
- expired OTP;
- unauthenticated request;
- unauthorized download;
- unavailable Footage;
- failed payment verification.

Do not expose internal implementation details to users.

Unexpected errors should remain diagnosable through server-side logging.

---

## 8. Database Access

Database queries belong in server-only code.

Never import Prisma into client components.

Avoid fetching substantially more data than required.

Use transactions when multiple dependent writes must succeed or fail together.

Follow `instructions/database.md` for database-sensitive tasks.

---

## 9. External Services

Calls to external services must:

- have clear failure handling;
- avoid leaking credentials;
- preserve provider-specific information only where necessary;
- be isolated behind the approved boundary when one exists.

Do not scatter SDK calls throughout unrelated modules.

---

## 10. Security

Authorization must happen server-side.

Client-side hiding is not authorization.

For example:

Bad:

```text
Hide download button if user did not purchase.
```

Necessary but insufficient.

Required:

```text
Server verifies entitlement before issuing file access.
```

The same principle applies to Admin functionality.

---

## 11. Money

Never trust price submitted by the browser.

Resolve authoritative price on the server.

Never use floating-point arithmetic for stored monetary values.

Do not implement currency/unit conversion unless the project explicitly defines it.

---

## 12. Media

Large video files must not pass through application-server memory or request bodies when direct object-storage transfer is available.

Follow ADR-0004 and `instructions/media.md`.

---

## 13. UI Implementation

When a Design Contract exists:

- follow it;
- reuse semantic tokens;
- implement documented states;
- respect RTL;
- preserve responsive behavior.

Do not redesign while implementing.

When no Design Contract exists and visual decisions materially affect the product, report that design input is required.

Minor implementation details that do not change product/design intent may be resolved normally.

---

## 14. Dependencies

Do not install a package before checking whether:

- the platform already provides the capability;
- an existing dependency already solves it;
- the problem is small enough to solve locally.

When adding a dependency, document why it is needed in the completion report.

---

## 15. Tests

Add tests proportional to risk.

High-value behavior should receive stronger coverage.

Examples:

- normalization → unit test;
- entitlement authorization → unit/integration + critical E2E;
- payment idempotency → automated state/behavior test;
- visual spacing adjustment → normally no unit test.

Follow `instructions/testing.md`.

---

## 16. Documentation

Update documentation when implementation changes a documented contract.

Do not update canonical product rules merely to make implementation match your preferred behavior.

If implementation reveals that the canonical rule should change, report it for human decision.

---

## 17. Verification

Before reporting completion, run the smallest relevant verification first.

Then run the repository-required quality gates appropriate for the task.

Typical final verification may include:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Do not claim a command passed unless it was executed.

If a command cannot be run because required infrastructure or credentials are unavailable, report that clearly.

---

## 18. Review Your Own Diff

Before handing work to a reviewer:

- inspect every changed file;
- remove accidental changes;
- remove debugging code;
- remove unused dependencies;
- check for secrets;
- confirm task scope;
- re-check acceptance criteria.

Then report:

```text
Status: READY_FOR_REVIEW
```

not `DONE`.

---

## 19. Never Hide Uncertainty

Do not use implementation as a way to silently decide an unresolved requirement.

If correctness depends on a missing decision:

stop.

Report the decision required and why it blocks implementation.
