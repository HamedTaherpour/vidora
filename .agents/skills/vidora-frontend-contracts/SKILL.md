---
name: vidora-frontend-contracts
description: Apply Vidora's frontend contracts when implementing or reviewing React/Next.js UI so component reuse, ownership, companion-file conventions, and UI verification happen before handoff.
---

# Vidora Frontend Contracts

Use this skill for React/Next.js pages, layouts, components, hooks, UI
utilities, frontend tests, shadcn composition, or Tailwind styling in Vidora.
This is an execution workflow. Canonical rules remain in the repository
instructions; do not reinterpret or duplicate them here.

## Load canonical policy

Before editing, load the relevant sources:

- `AGENTS.md`, the user-provided task/spec, and the relevant roadmap context;
- `instructions/project-organization.md`;
- `instructions/components.md`;
- `instructions/frontend-implementation.md`;
- `instructions/functions-and-types.md`;
- approved files under `docs/design/` for storefront UI;
- `.agents/skills/shadcn/SKILL.md` when shadcn/Base UI is involved.

The shared organization policy in `instructions/project-organization.md` also
governs any frontend TypeScript unit touched by the UI task: inspect ownership,
companion files, companion directories, tests, and rename consistency before
editing. Backend code is not in this skill's implementation scope, but follows
the same canonical policy.

If sources conflict or a product/design/architecture decision is undefined,
stop and report it. Canonical instructions win over this workflow.

## Phase 1 — Repository discovery

Do not edit UI files until a concise `Component Architecture Plan` exists. Inspect
and record actual repository paths for:

1. every application-owned React component in the changed scope that accepts
   props, including private components, and its tests;
2. relevant shared application components;
3. installed primitives under `src/components/ui` and `components.json`;
4. the applicable design contract/tokens;
5. the owning module and the smallest justified Server/Client seam.

For each component accepting props, map the component name to its corresponding
`<component-name>.types.ts` file and verify that the named contract is imported
and used directly. This mapping is mandatory regardless of component size,
visibility, reuse count, or presentation/state role.

Inventory component file ownership as well: when an application-owned component
has more than one associated file, all of its implementation, types, constants,
utilities, and tests must be colocated in a dedicated component-named directory.
If the task renames a feature, also build a naming-consistency matrix covering
directories, filenames, symbols, props, types, constants, hooks, utilities,
tests, fixtures, imports, exports, docs, and routes. Preserve valid domain names
and framework-required route filenames.

For each relevant control or surface, record `reuse`, `add`, or `retain native`,
the existing component or official shadcn candidate considered, and the reason.
Absence from `src/components/ui` is not sufficient evidence for hand-rolled UI.

## Phase 2 — Component architecture plan

In addition to reuse decisions, record for every new or materially changed
component: responsibility and owner; component boundaries; named props and their
companion type file; meaningful constants and utilities; state/effect/timer/ref and
handler ownership; test ownership; and repeated composition or wiring evaluated
for extraction. For a large or multi-responsibility file, record an evidence-based
decomposition assessment. Do not use line count alone, and do not extract wrappers
without independent responsibility.

The plan must explicitly map every multi-file component to its dedicated
component-named directory and include the feature-renaming consistency matrix
when the implementation identity changes.

Completion criterion: every new component has a clear owner, a focused
responsibility, a named public contract when applicable, and repository evidence
for its reuse decision. Keep this plan in the handoff; do not create a separate
planning artifact.

## Phase 3 — Implementation against the plan

Implement against the recorded architecture plan. Every application-owned
component accepting props must have its dedicated imported companion contract
before implementation is considered complete. When a new finding changes a
boundary, ownership decision, or reuse decision, update the plan in the handoff
and re-check the canonical instructions before continuing.

Use the canonical component, frontend, organization, and functions/types
instructions at the relevant decision point. In particular, verify the actual
rules for:

- composing existing primitives rather than replacing them with styled markup;
- component ownership and the project's `*.types.ts`, `*.constants.ts`,
  `*.utils.ts`, and test naming conventions;
- JSDoc on applicable exported component-owned APIs;
- semantic native HTML where it is the correct boundary;
- minimal client islands, explicit event flows, accessibility, RTL, responsive
  behavior, and semantic design tokens.

Keep business logic out of presentation components. Do not add abstractions,
files, effects, or client boundaries merely for symmetry or convenience.
Generated shadcn primitives retain their intended conventions.

## Phase 4 — Independent contract verification

Before handoff or review, independently verify every applicable category below;
one compliant example does not establish category-wide compliance:

Inspect the actual diff, not only the implementation report. Verify:

- the reuse decisions against concrete repository evidence;
- ownership and companion-file/test naming;
- dedicated component-directory ownership for every multi-file component;
- feature-renaming consistency across the full naming surface;
- applicable JSDoc and public contracts;
- Server/Client boundaries, imports, hooks/effects, and state ownership;
- accessibility, keyboard behavior, RTL, responsive states, and design tokens;
- relevant tests and any documented exception.

Also verify every application-owned component in the changed scope, including
private components: responsibility/decomposition, public props placement and
companion-file import ownership, constants and
utility ownership, test naming, repeated composition, state/effect ownership, and
dedicated directory ownership, feature naming consistency, and dead or duplicated
variants. Record file/line evidence for findings and for
documented scope exclusions.

## Phase 5 — Remediation loop

For each violation, use this loop until the re-check is clean: state the exact
violation; cite the canonical rule; apply the smallest coherent correction; add or
update focused tests; then re-run the contract checks. Do not waive a props
contract because the component is small, private, one-off, or easier to read
inline. Do not broaden the change into an unrelated refactor.

For implementation, include `Component Architecture Plan` (including the reuse
decisions) in the handoff. For review,
independently build a `UI Component Reuse Verification Matrix`; do not copy the
implementer's plan as proof. Static checks cannot reliably decide whether a
particular `div` is a layout wrapper or an incorrectly recreated component.

Git operations remain governed by `AGENTS.md`: do not create branches, commits,
tags, pushes, resets, cleans, rebases, merges, checkouts, or other mutations
unless the owner explicitly authorizes that operation. Verification success is
not Git authorization.
