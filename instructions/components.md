# Components

Read this file for application-owned UI components. Pair it with
`instructions/frontend-implementation.md`, `instructions/project-organization.md`,
the project-local shadcn Skill, and any applicable files under `docs/design/`.

## Component ownership

- `src/components/ui` contains official shadcn/Base UI primitives.
- Cross-domain reusable UI belongs in the existing shared component location or another explicitly approved shared boundary.
- Capability-specific components belong in `src/modules/<capability>`.
- Route-specific composition components may remain beside their routes.
- Do not create a shared abstraction for a single-use component without a concrete reason.

## Mandatory discovery before UI work

Before implementing or changing UI, agents must inspect the smallest relevant
context and record a concise component reuse plan. The plan must identify:

1. relevant existing feature/domain components in the owning Admin or Storefront
   area;
2. relevant application-level components;
3. installed primitives under `src/components/ui` and the configured
   `components.json` settings;
4. components to reuse and how they will be composed;
5. components to add, if any, with their ownership and responsibility; and
6. unresolved design or architecture decisions that could affect the work.

Use the following ownership order:

1. reuse an existing feature/domain component when appropriate;
2. reuse an existing application-level component when appropriate;
3. compose existing shadcn/Base UI primitives;
4. add an approved shadcn primitive if the requirement needs one; then
5. create a new component only when the existing options do not meet the
   responsibility.

Consult the project-local shadcn Skill and current component documentation when
shadcn usage, composition, or an added primitive is relevant. Do not recreate an
existing component with raw styled HTML. Semantic native HTML remains appropriate
when its native semantics are the correct choice.

Do not introduce speculative shared abstractions. Shared components require a
demonstrated reusable responsibility; feature-specific components remain owned by
their feature.

The plan must also consider whether form, table, feedback, and media presentation
have understandable responsibilities; whether state, actions, and data have clear
owners; and whether a client boundary is minimal and justified. Do not extract a
component solely to reduce file length.

For every UI task, include the plan in the final completion report under
`Component Reuse Plan`. It must identify the existing component paths inspected,
the components selected for reuse, any new components and their justification,
important ownership decisions, and reasons for bypassing an available component
when relevant. Do not create a separate documentation file solely for this plan.

Require approval before implementation only when the UI task involves one or more
of these objective triggers:

- coordinated changes across multiple independent routes or application surfaces;
- significant changes to shared client-state architecture;
- a new shared abstraction affecting multiple features; or
- a design-system or shared-component API change with broad impact.

Small, localized, well-defined UI changes do not require an additional approval
checkpoint after the reuse plan is prepared.

Preserve the existing `src/modules` modular organization. Do not move Vidora code to
a `src/features` structure because another project uses it.

## shadcn and Base UI

- Read `.agents/skills/shadcn/SKILL.md` before implementing or changing shadcn-based UI.
- Use the configured shadcn MCP/registry where available; do not guess a registry.
- Verify compatibility with the configured Base UI primitives and `components.json`.
- Prefer official primitives and composition over recreating controls.
- Do not rewrite generated primitives merely to enforce application naming or TypeScript conventions.
- Use approved semantic tokens and the design foundations.

## Shared components

Create a shared wrapper only when it provides meaningful reusable behavior, a stable
application-level API, or a consistency benefit that would otherwise be repeated.

- `App*` naming is not mandatory for every reusable component.
- `Responsive*` naming is not mandatory without a real responsive behavior contract.
- Barrel exports are not required universally.
- Use direct imports by default unless a deliberate public module boundary justifies a barrel.

## Props and type files

Application-owned reusable components must:

- declare a named `*Props` type;
- place component-specific public props in a companion `*.types.ts` file;
- group closely related public types in that file;
- keep implementation-private helper types local when appropriate;
- accept props through a named `props` parameter and destructure inside the component body.

```tsx
import type { FootageCardProps } from "./footage-card.types";

export function FootageCard(props: FootageCardProps) {
  const { footage } = props;

  return <article>{footage.titleFa}</article>;
}
```

Generated shadcn primitives are intentional exceptions. Small private,
non-reusable helpers may also remain concise when extracting types would add
unnecessary complexity. Do not mass-refactor existing components solely for
stylistic consistency.

## Interaction and state

- Prefer Server Components.
- Use Client Components only when necessary and keep boundaries narrow.
- Keep state at its actual owner.
- Avoid duplicating controlled or derived state.
- Use `useEffect` only for external synchronization.
- Use `useMemo` and `useCallback` only when justified.
- Name internal handlers `handleX` and callback props `onX`.

## Accessibility and RTL

- Preserve Persian-first content, `lang="fa"`, and `dir="rtl"`.
- Use logical CSS properties and isolate LTR technical values where necessary.
- Provide accessible names, labels, keyboard support, visible focus, and appropriate ARIA semantics.
- Preserve correct focus behavior in dialogs, sheets, and other overlays.
- Prefer the accessibility behavior supplied by approved primitives instead of recreating it.

## Responsive behavior

- Follow approved responsive contracts.
- Do not copy another project's responsive component implementation without a Vidora requirement.
- Preserve state correctly when responsive layouts switch; do not assume state survives remounting.
- Test responsive behavior when the component owns it.

## Component testing

Add focused tests where relevant for:

- rendering and user interaction;
- loading, empty, error, and disabled states;
- accessibility and RTL behavior;
- responsive behavior owned by the component.

Do not create meaningless tests merely to increase a count.

## Approved design contracts

Storefront components must follow:

- `docs/design/storefront-component-contracts.md`;
- `docs/design/foundations.md`.

Approved product, architecture, security, and domain rules take precedence over
generic component conventions. Do not silently override an approved design
contract; report a materially missing decision instead.
