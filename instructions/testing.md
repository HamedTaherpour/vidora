# Testing Instructions

Read this file when implementing or reviewing behavior that requires automated verification.

The purpose of testing is to protect important behavior, not maximize test count or coverage percentage.

---

# 1. Testing Stack

The default V1 testing stack is:

- Vitest for unit and application-level tests;
- Playwright for critical end-to-end flows.

Do not add another testing framework without a concrete requirement.

---

# 2. Testing Priorities

Prioritize tests for behavior where failure would create meaningful product, financial, security, or data risk.

High-priority areas include:

- phone normalization;
- OTP rules;
- authentication;
- authorization;
- Admin boundaries;
- monetary calculations and representation;
- Order state;
- payment verification;
- payment idempotency;
- purchase entitlement;
- protected downloads;
- invoice snapshots;
- important database constraints.

---

# 3. Test at the Lowest Useful Level

Prefer the cheapest test level that gives meaningful confidence.

Examples:

```text id="4nmqgh"
Phone normalization
→ Unit test

Price snapshot behavior
→ Application/domain test

Payment completion idempotency
→ Application/integration test

Customer cannot download another customer's purchase
→ Application/integration test + critical E2E

Complete purchase journey
→ E2E
```

Do not use E2E tests for behavior that can be confidently verified with a fast unit test.

Do not force complex business workflows into isolated unit tests when integration behavior is what matters.

---

# 4. Unit Tests

Unit tests are appropriate for:

- pure business functions;
- normalization;
- validation;
- deterministic transformations;
- state-transition rules;
- money-related helpers;
- authorization decisions that can be isolated cleanly.

Avoid mocking large portions of the framework just to call a trivial function.

---

# 5. Database-Dependent Tests

Use database-dependent tests when database behavior itself matters.

Examples:

- unique constraints;
- transaction behavior;
- idempotent purchase completion;
- entitlement uniqueness;
- query behavior that depends on real PostgreSQL semantics.

Default test commands should remain infrastructure-light where practical.

Tests requiring external infrastructure should be clearly identified.

Do not silently point automated tests at development or production databases.

OTP phone and IP rate-limit concurrency depends on PostgreSQL advisory locks. That check is the opt-in test `src/modules/auth/otp-request-concurrency.pg.test.ts`, run with `pnpm test:pg` against the local non-production database. It is excluded from `pnpm test` and from CI. The test deletes only the rows it inserts. It must not reset, drop, or truncate the database.

---

# 6. External Providers

Tests must not depend unnecessarily on live:

- SMS providers;
- payment providers;
- production object storage.

Use narrow provider boundaries and deterministic test implementations where appropriate.

A fake provider must preserve the important semantics being tested.

Do not mock away the behavior the test is supposed to prove.

---

# 7. Payment Tests

Payment behavior is financial and security-sensitive.

At minimum, test relevant scenarios such as:

- valid verification;
- failed verification;
- amount mismatch where applicable;
- repeated callback;
- repeated successful verification;
- duplicate purchase-completion attempt;
- provider failure.

A repeated successful verification must not create duplicate purchase side effects.

---

# 8. Authorization Tests

For protected resources, test both positive and negative paths.

Do not test only:

```text id="w6xmtq"
Authorized user succeeds.
```

Also test:

```text id="rb9k01"
Anonymous user fails.

Authenticated but unauthorized user fails.
```

Critical example:

```text id="jqlt82"
User A purchases Footage X.

User B requests an original file belonging to Footage X.

Expected:
Access denied.
```

---

# 9. E2E Tests

Playwright should protect a small number of critical user journeys.

V1 critical flows include:

- customer OTP authentication;
- public catalog browsing;
- Footage Detail;
- Buy Now;
- payment completion using an approved test strategy;
- User Library;
- authorized original download;
- unauthorized original download denial;
- Admin Footage creation/publishing;
- invoice retrieval.

Do not attempt to reproduce every UI branch through E2E.

---

# 10. UI Tests

Do not create brittle tests for:

- exact CSS class strings;
- implementation-specific DOM structure;
- trivial visual spacing;
- framework behavior.

Test UI behavior when it protects a meaningful interaction or business outcome.

Visual review may be more appropriate for design-specific changes.

---

# 11. Regression Tests

When fixing a meaningful bug:

1. reproduce the behavior;
2. add a regression test where practical;
3. implement the fix;
4. confirm the test protects against recurrence.

Do not add meaningless regression tests for trivial cosmetic changes.

---

# 12. Test Data

Tests should use deterministic data.

Avoid:

- production data;
- shared mutable fixtures;
- hidden dependencies on execution order;
- unnecessary random values.

If uniqueness requires generated values, generation must not make assertions nondeterministic.

---

# 13. Time-Dependent Behavior

OTP expiration, signed-access expiration, and similar time-sensitive behavior should be testable without unreliable real-time waiting.

Prefer controlled clocks or injected time boundaries where justified.

Do not introduce a complex time abstraction for ordinary timestamps.

---

# 14. Test Isolation

A test must not depend on another test having run first.

Tests that mutate persistent state must cleanly isolate their data or use a controlled test database strategy.

---

# 15. Coverage

Code coverage percentage is not a V1 product goal.

Do not write low-value tests solely to increase coverage numbers.

A small number of tests protecting important invariants is preferable to large quantities of shallow tests.

---

# 16. Test Integrity

Never:

- delete a valid failing test to make CI pass;
- weaken a correct assertion to accommodate broken behavior;
- mark a test skipped without explaining the reason;
- replace meaningful assertions with snapshot noise;
- mock authorization or payment behavior so aggressively that the real invariant is no longer tested.

If a test conflicts with an approved changed requirement, update the test and document why.

---

# 17. Verification Reporting

Completion reports must state which tests were actually executed.

Example:

```text id="9h06r3"
Tests added:
- normalizeIranianMobile.test.ts
- authorizeFootageDownload.test.ts

Verification:
- pnpm test -- normalizeIranianMobile
- pnpm test
- pnpm typecheck
```

Do not say "tests pass" if they were not executed.
