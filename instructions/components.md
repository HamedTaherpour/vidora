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
