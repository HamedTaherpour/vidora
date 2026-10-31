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

If sources conflict or a product/design/architecture decision is undefined,
stop and report it. Canonical instructions win over this workflow.

## Before implementation: evidence first

Do not edit UI files until a concise `Component Reuse Plan` exists. Inspect and
record actual repository paths for:

1. the closest feature/domain component and its tests;
2. relevant shared application components;
3. installed primitives under `src/components/ui` and `components.json`;
4. the applicable design contract/tokens;
5. the owning module and the smallest justified Server/Client seam.

For each relevant control or surface, record `reuse`, `add`, or `retain native`,
the existing component or official shadcn candidate considered, and the reason.
Absence from `src/components/ui` is not sufficient evidence for hand-rolled UI.

Completion criterion: every new component has a clear owner, one responsibility,
and repository evidence for its reuse decision. Keep this plan in the handoff;
do not create a separate planning artifact.

## During implementation: apply, do not redesign

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

## Before handoff or review

Inspect the actual diff, not only the implementation report. Verify:

- the reuse decisions against concrete repository evidence;
- ownership and companion-file/test naming;
- applicable JSDoc and public contracts;
- Server/Client boundaries, imports, hooks/effects, and state ownership;
- accessibility, keyboard behavior, RTL, responsive states, and design tokens;
- relevant tests and any documented exception.

For implementation, include `Component Reuse Plan` in the handoff. For review,
independently build a `UI Component Reuse Verification Matrix`; do not copy the
implementer's plan as proof. Static checks cannot reliably decide whether a
particular `div` is a layout wrapper or an incorrectly recreated component.

Git operations remain governed by `AGENTS.md`: do not create branches, commits,
tags, pushes, resets, cleans, rebases, merges, checkouts, or other mutations
unless the owner explicitly authorizes that operation. Verification success is
not Git authorization.
