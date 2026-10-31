---
name: vidora-frontend-contracts
description: Apply Vidora's frontend contracts when implementing or reviewing React/Next.js UI so component reuse, ownership, colocated types/constants/utilities/tests, JSDoc, accessibility, RTL, and client boundaries are verified before handoff.
---

# Vidora Frontend Contracts

Use this skill for any task that creates or changes a React component, page, layout,
hook, UI utility, frontend test, shadcn composition, or Tailwind styling in Vidora.
It is a workflow guardrail, not a replacement for canonical repository policy.

## Load the source of truth

Before editing, read the relevant canonical files:

- `AGENTS.md` and the task in `docs/ROADMAP.md`;
- `instructions/project-organization.md`;
- `instructions/components.md`;
- `instructions/frontend-implementation.md`;
- `instructions/functions-and-types.md`;
- `docs/design/foundations.md` and `docs/design/storefront-component-contracts.md` for storefront UI;
- `.agents/skills/shadcn/SKILL.md` when shadcn/Base UI or `components.json` is relevant.

Canonical documentation wins if this skill and another project rule conflict.
Stop on unresolved product, design, or architecture decisions; do not invent a
convenient default.

## Preflight: discover before composing

Complete a concise reuse plan before writing UI code. Inspect:

1. the closest feature/domain components and their tests;
2. `src/components/ui` and `components.json`;
3. the applicable design contract and existing tokens;
4. the nearest module directory that owns the behavior;
5. the smallest appropriate Server/Client boundary.

For each control or surface, record the pattern, inspected existing component,
installed primitive, official shadcn candidate when applicable, decision (`reuse`,
`add`, or `retain native`), and technical reason. A missing installed primitive
is not itself a reason to hand-roll a styled control.

Completion criterion: the plan names the actual repository paths inspected and
every new component has an owner and a single UI responsibility.

## Component contract

Prefer an existing domain component, then an application component, then an
installed shadcn/Base UI primitive, then the suitable official primitive, and
only then a new custom component. Compose; do not recreate a known component
with a styled `div` or `span`.

For each new application-owned reusable component:

- keep it under its owning module unless it is genuinely cross-domain;
- define a named public `ComponentNameProps` in `component-name.types.ts`;
- accept a named `props` parameter and destructure inside the body;
- keep reusable component constants in `component-name.constants.ts`;
- keep exported pure helpers in `component-name.utils.ts`;
- name utility tests `component-name.utils.test.ts` and component tests
  `component-name.test.tsx`;
- prefix every component-owned support file with the exact component basename;
- add meaningful JSDoc to exported types, constants, utilities, and public helper
  APIs; explain purpose, behavior, units, and constraints where relevant;
- keep private one-off values/types local when extraction would add noise.

Do not create files merely for symmetry. Do not use generic component-folder
names such as `utils.ts`, `types.ts`, or `constants.ts`. Generated shadcn
primitives are intentional exceptions.

## Rendering and styling contract

- Keep Server Components as the default and make the smallest client island
  necessary for browser state, events, or APIs.
- Keep business logic, persistence, authorization, and provider work outside
  presentation components.
- Use semantic HTML and existing primitives for controls, feedback, cards,
  fields, dialogs, separators, empty states, skeletons, and badges.
- Use semantic design tokens and logical RTL properties; do not introduce
  arbitrary visual values when the design foundation already defines a token.
- Keep nontrivial JSX event logic in named `handleX` functions.
- Use effects only for external synchronization, not derived state or event
  orchestration.
- Preserve stable keys, keyboard behavior, visible focus, accessible names,
  responsive behavior, and Persian/RTL semantics.

## Verification gate

Before handoff, inspect the actual diff and run the narrowest relevant tests plus
typecheck/lint as required by the task. Audit every changed UI file for:

- an existing component that should have been reused;
- raw styled controls or card-like surfaces replacing an available component;
- misplaced public types, constants, utilities, or tests;
- missing or meaningless JSDoc on exported component-owned APIs;
- unnecessary `use client`, effects, state duplication, or internal HTTP;
- missing loading, empty, error, disabled, keyboard, RTL, or responsive behavior;
- design-token and contract violations.

For UI work, include `Component Reuse Plan` in the handoff. For review work,
include a `UI Component Reuse Verification Matrix` with concrete repository
evidence. A passing build does not substitute for this audit.

If the implementation violates a contract, fix it or report the exact blocker;
do not silently weaken the contract or the tests.
