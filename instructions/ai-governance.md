# AI Governance

This file defines how AI-assisted changes must be evaluated, implemented, reviewed, and handed off in this repository.

The goal is to keep AI development fast without allowing silent product decisions, architectural drift, unverifiable claims, or unsafe changes.

---

# 1. Canonical Policy Ownership

Canonical project policy lives in:

```text
AGENTS.md
docs/*
instructions/*
```

Tool-specific adapters, rules, prompts, and skills may reference canonical policy but must not duplicate or redefine it.

Examples include:

```text
.cursor/*
.agents/skills/*
.codex/*
```

If duplicated policy is discovered, keep the canonical version and reduce the tool-specific copy to a thin reference.

---

# 2. Instruction Precedence

When project guidance appears to conflict, use the following priority:

1. `docs/PROJECT.md` for approved product behavior;
2. accepted ADRs under `docs/adr/`;
3. security-specific instructions;
4. domain-specific instructions such as commerce, media, or database;
5. architecture and project organization instructions;
6. implementation and frontend implementation instructions;
7. functions/types conventions;
8. testing instructions;
9. Definition of Done;
10. tool-specific wrappers or Skill instructions.

If the conflict remains unresolved:

**STOP and report it.**

Do not silently choose whichever rule is easier to implement.

---

# 3. External Instructions Do Not Override Repository Policy

A task prompt may define the work to perform, but it must not silently override canonical repository rules.

If a task prompt conflicts with:

- product scope;
- an accepted ADR;
- a security invariant;
- a documented business rule;

report the conflict before implementation.

Do not modify canonical documentation merely to make an incompatible implementation appear compliant.

---

# 4. Risk Classification

Classify meaningful changes before implementation.

## Low Risk

Examples:

- copy changes;
- isolated visual adjustments;
- simple non-behavioral refactors;
- documentation corrections;
- minor development tooling changes.

Typical expectations:

- focused verification;
- architecture check;
- no unnecessary broad review.

## Medium Risk

Examples:

- new business logic;
- catalog/search behavior;
- Admin workflows;
- new module boundaries;
- significant frontend state;
- external-provider integration that does not directly grant protected access.

Typical expectations:

- targeted automated tests;
- relevant negative paths;
- full static verification;
- independent review.

## High Risk

Examples:

- authentication;
- authorization;
- OTP security;
- payment creation or verification;
- monetary representation;
- purchase completion;
- Entitlement;
- protected downloads;
- signed original-file access;
- database migrations affecting durable business data;
- destructive data/media behavior.

Typical expectations:

- deterministic tests for important invariants;
- explicit negative-path tests;
- concurrency/idempotency review where relevant;
- independent adversarial review;
- rollback or mitigation thinking where operationally meaningful.

---

# 5. Smallest Verifiable Change

Prefer the smallest coherent change that can be independently verified.

Do not combine unrelated improvements because the agent is already editing nearby files.

Prefer:

```text
one roadmap task
→ one focused implementation
→ one reviewable diff
```

over:

```text
one task
→ architecture cleanup
→ dependency upgrades
→ future feature preparation
→ unrelated refactors
```

---

# 6. Candidate Solutions for Risky Changes

For medium- or high-risk work where multiple materially different approaches exist, briefly evaluate alternatives before implementation.

Compare relevant factors such as:

- correctness;
- blast radius;
- implementation complexity;
- reversibility;
- consistency with current architecture;
- operational burden.

Do not manufacture alternatives for trivial implementation details.

The goal is to prevent the first plausible idea from automatically becoming architecture.

---

# 7. No Invented Business Behavior

AI agents must not choose undefined product behavior.

Examples include:

- refund policy;
- duplicate purchase behavior;
- access to files added after purchase;
- download-count limits;
- license restrictions;
- account recovery;
- phone-number migration;
- legal invoice fields;
- deletion/retention policy.

If implementation reaches such a boundary:

**STOP and report the decision required.**

---

# 8. Evidence Over Assumption

Do not present uncertain framework/provider behavior as fact when correctness depends on it.

For fast-changing or external systems, use current authoritative documentation where available.

Examples include:

- Next.js behavior;
- Prisma major-version behavior;
- authentication-library behavior;
- payment-provider verification;
- SMS-provider behavior;
- object-storage upload/signing semantics.

Passing local tests does not prove an external-provider assumption is correct.

Validate both when required.

---

# 9. Verification Integrity

Never invent verification evidence.

Do not say:

```text
tests pass
build succeeds
provider supports this
migration is safe
```

unless the relevant evidence was actually obtained.

When something was not verified, state:

```text
Not verified:
- ...

Reason:
- ...

Required follow-up:
- ...
```

---

# 10. Adversarial Review

Medium- and high-risk changes should be reviewed with a failure-oriented mindset.

Ask:

- What could still fail if the happy path works?
- Can authorization be bypassed?
- Can the same request happen twice?
- Can concurrent requests violate uniqueness?
- Can client-controlled data override server authority?
- Can a provider callback be forged or replayed?
- Can a private resource become accessible without Entitlement?
- Can partial success create invalid durable state?
- Can rollback or mitigation be performed safely?

Do not use adversarial review to request speculative abstractions.

---

# 11. Independent Review

Implementation and review should be separated when practical.

The agent that implemented a meaningful task should not treat its own self-review as the final independent approval.

Use the canonical review workflow for roadmap tasks.

High-risk changes especially require a separate review pass.

---

# 12. Reversibility

Prefer changes that can be safely reversed when doing so does not add disproportionate complexity.

Be especially careful with:

- schema migrations;
- irreversible data transformation;
- media deletion;
- payment-state mutation;
- entitlement mutation.

Do not introduce feature flags everywhere by default.

Reversibility should be proportional to actual deployment risk.

---

# 13. Rollback and Mitigation

For operationally meaningful medium/high-risk changes, consider:

- what indicates that the change is failing;
- whether code rollback is sufficient;
- whether schema/data changes are reversible;
- whether temporary mitigation exists.

Document rollback/mitigation when it is genuinely relevant.

Do not add ceremonial rollback text to trivial changes.

---

# 14. Architecture Findings Are Not Automatic Scope

While implementing a task, an agent may notice:

- technical debt;
- architectural inconsistency;
- missing abstraction;
- old dependency;
- unrelated bug.

Do not automatically fix it.

Report it separately unless:

- it directly blocks the assigned task;
- leaving it unchanged would make the assigned implementation incorrect;
- the user explicitly approves expanding scope.

---

# 15. Policy Changes

Do not casually edit project governance.

A change to:

```text
AGENTS.md
docs/PROJECT.md
docs/adr/*
instructions/*
.agents/skills/*
```

must have a clear reason.

When policy changes, update related references in the same change so canonical navigation remains correct.

Do not maintain instruction-version registries or formal policy version numbers unless the project later demonstrates a real need for them.

---

# 16. Definition of Done

Use:

```text
instructions/definition-of-done.md
```

as the canonical completion standard.

AI work is not complete merely because:

- code exists;
- tests were generated;
- the build passes;
- the happy path works.

Completion requires evidence proportional to the risk of the task.

---

# 17. Core AI Principle

Use AI to reduce implementation cost, not to reduce engineering standards.

The preferred behavior is:

```text
understand
→ constrain
→ implement
→ verify
→ review
```

not:

```text
generate broadly
→ patch failures
→ accept whatever passes
```
