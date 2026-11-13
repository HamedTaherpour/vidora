---
name: vidora-frontend-contracts
description: Apply Vidora frontend ownership, accessibility, and verification contracts when implementing or reviewing React/Next.js UI.
---

# Vidora Frontend Contracts

Use this workflow for React/Next.js pages, layouts, components, hooks, UI
utilities, frontend tests, and Tailwind styling. Canonical policy remains in
`AGENTS.md` and `instructions/`; this skill does not redefine it.

Before editing, read the task, project organization, components, frontend,
functions/types, testing, and applicable design-contract instructions.

The shared organization policy in `instructions/project-organization.md` is
defined for all logical TypeScript/TSX units;
the skill must follow the shared organization policy.
Apply `instructions/components.md`, `instructions/frontend-implementation.md`,
and `instructions/functions-and-types.md` to every changed UI unit.

## Phase 1 — Repository discovery

Inspect every application-owned React component in the changed scope, shared
components, native controls, design contracts, companion files, and tests.

## Phase 2 — Component architecture plan

Record ownership, boundaries, state, effects, handlers, tests, and reuse
decisions in the completion report before implementation.

Every application-owned React component in the changed scope that accepts props,
including private components, must use a named props type in the corresponding
`<component-name>.types.ts` file.

## Discovery

Inspect all changed-scope components, their companion types/constants/utilities
and tests, shared components, native controls, design contracts, and the owning
server/client boundary. Record a concise reuse and ownership plan in the
handoff. Do not invent product behavior or redesign an approved contract.

## Implementation

Prefer Server Components and small client islands. Keep business logic in
application/domain functions. Every application-owned component accepting props
uses a named `*Props` companion type. Keep state, effects, handlers,
accessibility, RTL, responsive behavior, and tests with the responsible owner.
Introduce shared components only for demonstrated reusable responsibilities.

## Phase 3 — Implementation against the plan

Implement the smallest coherent change against the recorded ownership and
boundary decisions. Re-check the strict props rule for private components.

## Verification

Independently inspect the final diff for route preservation, ownership,
props/contracts, server/client boundaries, accessibility, RTL, responsive and
error states, dead code, and scope expansion. Run focused tests and the required
repository quality gates before handoff.

## Phase 4 — Independent contract verification

Inspect the actual diff independently for ownership, props companions, server
and client boundaries, accessibility, RTL, and scope discipline.

## Phase 5 — Remediation loop

For each confirmed contract violation, apply the smallest correction and rerun
focused verification before handoff.
