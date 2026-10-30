---
name: review-roadmap-task
description: Review an implementation of one docs/ROADMAP.md task before it is marked DONE. Use when asked to review a task by ID, review work marked READY_FOR_REVIEW, inspect a task implementation or diff, or determine whether a roadmap task can be approved. Perform an adversarial but practical review against product rules, ADRs, instructions, acceptance criteria, tests, security, and scope. Return APPROVED or CHANGES_REQUESTED with concrete findings.
---

# Review Roadmap Task

Review one implemented roadmap task independently.

The goal is to find meaningful defects before the task becomes `DONE`.

Do not rewrite the implementation merely because you prefer another style.

---

## 1. Resolve the Task

Find the requested task in:

```text
docs/ROADMAP.md
```

Read:

- objective;
- dependencies;
- requirements;
- acceptance criteria;
- out-of-scope notes;
- current status.

The normal review target should be:

```text
READY_FOR_REVIEW
```

If implementation is clearly incomplete or the task cannot be identified, report that before reviewing further.

---

## 2. Load Canonical Context

Always read:

```text
AGENTS.md
docs/PROJECT.md
docs/ROADMAP.md
instructions/definition-of-done.md
```

Then read only instructions and ADRs relevant to the reviewed task.

Use the same context-routing principles defined by:

```text
.agents/skills/implement-roadmap-task/SKILL.md
```

Do not load unrelated documentation merely to enlarge review context.

---

## 3. Inspect the Change

Review the actual implementation, not only the implementer's completion report.

Inspect:

- changed files;
- relevant neighboring code;
- migrations where applicable;
- tests;
- dependency changes;
- configuration changes;
- documentation changes.

Use the implementation report as supporting information, not as proof.

---

## 4. Review Acceptance Criteria

Check every acceptance criterion individually.

For each criterion determine whether it is:

```text
Satisfied
Not satisfied
Not verifiable
```

A task cannot be approved when a required acceptance criterion is knowingly unsatisfied.

---

## 5. Review Product Correctness

Compare behavior with:

```text
docs/PROJECT.md
```

Look for:

- invented business rules;
- missing required behavior;
- changed product semantics;
- implementation of explicitly out-of-scope features;
- assumptions made about unresolved requirements.

Treat invented product behavior as a substantive finding.

---

## 6. Review Architecture

Check compliance with relevant ADRs and architecture instructions.

Look for unnecessary:

- internal HTTP APIs;
- service layers;
- abstractions;
- provider frameworks;
- infrastructure;
- dependencies;
- module coupling.

Also look for insufficient boundaries where they matter.

Do not request additional architecture merely because it could make the code look more sophisticated.

---

## 7. Review Security

For security-sensitive work, actively attempt to identify bypasses.

Examples:

- Can an anonymous user invoke the operation?
- Can a normal customer invoke an Admin operation?
- Can User B access User A's resource?
- Can browser-controlled data override server authority?
- Can a callback grant access without verification?
- Can a private object become public?
- Are secrets exposed?
- Are signed URLs generated before authorization?

Review negative paths, not only the happy path.

---

## 8. Review Data Integrity

For database work, check relevant:

- constraints;
- uniqueness;
- transaction boundaries;
- concurrency behavior;
- migration safety;
- historical snapshots;
- deletion behavior;
- monetary representation.

Pay special attention to race-prone patterns in critical flows.

---

## 9. Review Commerce Invariants

For commerce work, verify applicable invariants including:

```text
Browser price is not authoritative.

Callback success is not payment verification.

Failed verification creates no Entitlement.

Repeated verification creates no duplicate purchase side effects.

Historical purchase values do not depend on current catalog values.

Entitlement is durable database state.
```

Treat violations as high-severity findings.

---

## 10. Review Media Invariants

For media work, verify applicable invariants including:

```text
Large file does not pass through Next.js.

Original object remains private.

Admin authorization is required for upload authorization.

Upload completion is explicit.

Protected download requires Entitlement.

Signed original access is temporary.
```

---

## 11. Review Tests

Do not judge test quality by count.

Ask:

- Do tests protect the important behavior?
- Are important negative paths covered?
- Is a test accidentally proving mocked behavior rather than real application logic?
- Are assertions meaningful?
- Were existing tests weakened?
- Is there a missing regression test for a fixed meaningful bug?

Do not demand tests for trivial implementation details.

---

## 12. Review Scope

Identify changes unrelated to the assigned task.

Distinguish between:

### Necessary supporting change

Required to implement the task correctly.

### Scope creep

Unrelated feature, refactor, abstraction, dependency, or future roadmap work.

Request removal of meaningful scope creep.

Do not object to small necessary cleanup that directly supports the task.

---

## 13. Review Dependencies

For every newly added dependency ask:

- Is it needed?
- Does the platform already solve this?
- Does an existing dependency already solve this?
- Is its scope reasonable?
- Did it introduce unrelated upgrades?

Flag unjustified dependencies.

---

## 14. Review Verification Evidence

Check what the implementer actually executed.

Do not assume:

```text
build passed
```

means:

```text
feature is correct
```

If critical verification was omitted, determine whether review can reasonably establish correctness without it.

If not, request the missing verification.

---

## 15. Finding Severity

Classify substantive findings as:

```text
BLOCKER
HIGH
MEDIUM
LOW
```

Use severity based on impact, not style preference.

### BLOCKER

Examples:

- security bypass;
- data-loss risk;
- payment granted without verification;
- task fundamentally does not meet requirement;
- implementation depends on unresolved product behavior.

### HIGH

Examples:

- incorrect business behavior;
- broken authorization path;
- payment idempotency failure;
- major acceptance criterion missing.

### MEDIUM

Examples:

- meaningful edge case;
- missing important validation;
- test gap around important behavior;
- unnecessary coupling likely to cause near-term problems.

### LOW

Use sparingly for real maintainability or correctness concerns.

Do not produce stylistic nitpicks merely to create findings.

---

## 16. Do Not Manufacture Findings

A review is successful even when no defect is found.

Do not request:

- abstractions without need;
- unrelated refactors;
- stylistic rewrites;
- speculative scalability work;
- additional infrastructure;
- tests with no meaningful value.

The goal is correctness, not reviewer activity.

---

## 17. Review Result

Return exactly one overall result:

```text
APPROVED
```

or:

```text
CHANGES_REQUESTED
```

Use `CHANGES_REQUESTED` when at least one finding must be fixed before the task can become `DONE`.

For reviews involving UI component selection, `APPROVED` also requires the
review report to include the `UI Component Reuse Verification Matrix` described
in the Frontend Review section. The reviewer must identify the relevant control
patterns independently from the implementation report. A missing, inaccurate,
or unsupported matrix entry prevents approval. Use `CHANGES_REQUESTED` for a
material component reuse violation. This requirement does not apply when UI
component selection is not relevant to the reviewed changes.

---

## 18. Approved Handoff

If approved, report:

```text
Task: <TASK-ID> — <Task Name>
Review: APPROVED

Acceptance criteria:
- <criterion>: Satisfied
- ...

Findings:
- None

Verification reviewed:
- ...

UI Component Reuse Verification Matrix (UI reviews only):
| Control pattern | Actual file and component | Existing or candidate shadcn primitive | Decision (reuse/add/retain native) | Technical justification | Verification status | Concrete repository evidence |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... |

Task may be marked DONE.
```

When repository workflow permits, update:

```text
READY_FOR_REVIEW
→ DONE
```

---

## 19. Changes Requested Handoff

If changes are required, report:

```text
Task: <TASK-ID> — <Task Name>
Review: CHANGES_REQUESTED

Findings:

1. [HIGH] <short title>
   Evidence:
   - ...

   Why it matters:
   - ...

   Required change:
   - ...

Acceptance criteria:
- <criterion>: Satisfied
- <criterion>: Not satisfied
- ...

Verification reviewed:
- ...

UI Component Reuse Verification Matrix (UI reviews only):
| Control pattern | Actual file and component | Existing or candidate shadcn primitive | Decision (reuse/add/retain native) | Technical justification | Verification status | Concrete repository evidence |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... |

Task should return to IN_PROGRESS.
```

When repository workflow permits, update:

```text
READY_FOR_REVIEW
→ IN_PROGRESS
```

---

## 20. Reviewer Principle

Review against:

- approved requirements;
- real risks;
- important invariants;
- maintainability at the project's actual scale.

Do not review against hypothetical enterprise architecture.

Be adversarial about correctness and conservative about unnecessary complexity.

## AI Governance Review

For non-trivial tasks, read:

`instructions/ai-governance.md`

Verify that:

- the implementation did not silently resolve product ambiguity;
- the change risk was handled proportionally;
- external/provider assumptions were verified when correctness depended on them;
- verification claims are supported by actual evidence;
- high-risk changes received appropriate negative-path and adversarial review.

## Organization Review

For structural or module changes, read:

`instructions/project-organization.md`

Check:

- business ownership is clear;
- `src/app` remains framework/routing focused;
- `src/modules` owns business capabilities;
- `src/lib` is not becoming a business-logic dumping ground;
- unnecessary global technical layers were not introduced;
- server-only dependencies do not leak into client import graphs.

## Frontend Review

For React/Next.js changes, read:

`instructions/frontend-implementation.md`

Check:

- Server Components remain the default where appropriate;
- `"use client"` boundaries are no broader than necessary;
- internal HTTP is not used unnecessarily from server-side code;
- effects are not being used for derived state or event-driven logic;
- URL state is used appropriately for shareable/search/filter state;
- authorization is enforced server-side, not only through UI;
- RTL and accessibility requirements are preserved;
- Design Contracts are followed where present.

For UI changes, also verify the implementation's discovery and reuse evidence:

- independently identify every relevant UI control pattern from the changed
  files and diff; do not derive the pattern list solely from the implementation
  report;
- include a `UI Component Reuse Verification Matrix` in the final review report;
  each row must record the control pattern, actual file and component, existing
  or candidate shadcn primitive, decision (`reuse`, `add`, or `retain native`),
  technical justification, verification status, and concrete repository
  evidence;
- do not approve a UI review when the matrix is missing, omits a relevant
  control pattern, contains an inaccurate decision, or lacks repository evidence;

- the completion report includes a `Component Reuse Plan` with existing component
  paths inspected, selected components, new components and justification,
  ownership decisions, relevant bypass reasons, and a control-pattern decision
  for each relevant pattern containing the inspected component, installed
  primitive, official shadcn candidate, decision, and justification;
- relevant Admin or Storefront feature/domain components were inspected and
  reused where appropriate;
- application-level components and installed shadcn primitives were considered;
- `.agents/skills/shadcn/SKILL.md` and current component documentation were
  consulted when relevant;
- each absent installed primitive has an evaluated official shadcn candidate or
  a documented reason that semantic native HTML is the correct choice;
- raw styled controls did not unnecessarily replace available components or
  semantic native HTML. Retaining a custom-styled control solely because no
  shadcn primitive was installed is a review finding and requires
  `CHANGES_REQUESTED` when an appropriate candidate was not evaluated;
- forms, tables, native selects, live regions, and file inputs remain valid
  native choices when their semantics are appropriate;
- component responsibilities, state ownership, data ownership, and client
  boundaries remain understandable;
- new shared abstractions have a demonstrated reusable responsibility;
- form, table, feedback, and media presentation are separated where that improves
  clarity; and
- RTL, accessibility, responsive, and interaction requirements are satisfied.

Verify the reported plan against the actual repository and implementation diff.
Missing or materially inaccurate reuse evidence is grounds for
`CHANGES_REQUESTED`. For UI changes matching any approval trigger in
`instructions/components.md`, verify that approval was obtained before
implementation.

Require concrete evidence for substantive findings. A successful build or
passing tests does not substitute for this review.

## Functions and Types Review

For TypeScript/public API changes, read:

`instructions/functions-and-types.md`

Check:

- `any`, unsafe assertions, and broad suppressions were not used as shortcuts;
- types are placed near their owners;
- global type dumping grounds were not introduced;
- provider/Prisma types do not leak across boundaries without reason;
- exported contracts are descriptive and domain-oriented;
- unnecessary type/file boilerplate was not introduced.
