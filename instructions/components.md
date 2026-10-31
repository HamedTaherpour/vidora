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
4. add the suitable official shadcn primitive if the requirement needs one; then
5. create a new component only when the existing options do not meet the
   responsibility.

Consult the project-local shadcn Skill and current component documentation when
shadcn usage, composition, or an added primitive is relevant. When no suitable
primitive is installed, explicitly evaluate the suitable official shadcn
candidate before deciding whether to add it or retain semantic native HTML.
Absence from `src/components/ui` is not, by itself, a reason to retain a
custom-styled native control. Do not recreate an existing component with raw
styled HTML. Semantic native HTML remains appropriate when its native semantics
are the correct choice, including forms, tables, native selects, live regions,
and file inputs when justified.

Do not introduce speculative shared abstractions. Shared components require a
demonstrated reusable responsibility; feature-specific components remain owned by
their feature.

The plan must also consider whether form, table, feedback, and media presentation
have understandable responsibilities; whether state, actions, and data have clear
owners; and whether a client boundary is minimal and justified. Do not extract a
component solely to reduce file length.

For each relevant control pattern, the plan must include a concise auditable
decision with:

- UI pattern;
- existing component inspected;
- installed primitive, if available;
- official shadcn candidate, if applicable;
- decision: reuse, add, or retain native; and
- justification.

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
checkpoint after the reuse plan is prepared. A localized, justified addition of
an official shadcn primitive likewise does not require a separate approval
checkpoint unless one of these objective triggers applies.

Preserve the existing `src/modules` modular organization. Do not move Vidora code to
a `src/features` structure because another project uses it.

## shadcn and Base UI

Typography uses the standard Tailwind font-size and line-height utilities
documented in `docs/design/foundations.md`; do not add project-specific font-size
aliases when the standard scale is sufficient.

- Read `.agents/skills/shadcn/SKILL.md` before implementing or changing shadcn-based UI.
- Use the configured shadcn MCP/registry where available; do not guess a registry.
- Verify compatibility with the configured Base UI primitives and `components.json`.
- Prefer official primitives and composition over recreating controls.
- Do not rewrite generated primitives merely to enforce application naming or TypeScript conventions.
- Use approved semantic tokens and the design foundations.

## UI component selection and review checklist

Before implementing a UI pattern:

1. Identify the required interaction and semantic boundary.
2. Inspect the installed primitives under `src/components/ui` and the
   configured Base UI/shadcn settings.
3. Evaluate the relevant official shadcn pattern, including a component that
   is not installed yet when it may fit the requirement.
4. Reuse installed components when they are suitable; use Tailwind for
   composition, sizing, spacing, and responsive adjustments.
5. Add or implement a custom primitive only when the existing options do not
   meet the responsibility, and record the reason in the task handoff.

During review, check for unnecessary native controls where an installed
primitive is required, duplicated shadcn patterns, manual separators where
`Separator` is appropriate, and custom card/input compositions that should use
an existing primitive. Also verify RTL order, accessibility and focus, keyboard
operation, responsive overflow, and state ownership. Native semantic HTML is
still appropriate when it is the better technical boundary; this checklist
does not mandate shadcn for every element.

## Shared components

Create a shared wrapper only when it provides meaningful reusable behavior, a stable
application-level API, or a consistency benefit that would otherwise be repeated.

- `App*` naming is not mandatory for every reusable component.
- `Responsive*` naming is not mandatory without a real responsive behavior contract.
- Barrel exports are not required universally.
- Use direct imports by default unless a deliberate public module boundary justifies a barrel.

## Component-local helpers, types, and constants

When a component needs an exported pure helper, place that helper in a colocated
`<component-name>.utils.ts` file and import it into the component. Keep small
private details local when they are not reused; do not create an empty or one-off
utility file. React components, hooks, and framework-specific exports stay in
their component files.

Use `<component-name>.types.ts` for meaningful reusable types owned by one
component or component group, and `<component-name>.constants.ts` for reusable
component-specific constants. Trivial private types and one-off values may
remain local. Utility tests use `<component-name>.utils.test.ts`; component tests
use `<component-name>.test.tsx`. A component-specific hook keeps its named
`use-<feature-name>.ts` filename, with a matching `use-<feature-name>.test.ts`
when it has dedicated tests.

Every component-owned supporting file must begin with the exact kebab-case name
of its owning component. Do not use ambiguous generic filenames such as
`utils.ts`, `types.ts`, or `constants.ts` inside component directories. A hook is
a separately named unit, and genuinely module-level/shared files are exempt.
Preserve framework-required names such as `page.tsx`, `layout.tsx`,
`loading.tsx`, and `route.ts`. Do not create files solely to satisfy naming
symmetry.

Exported TypeScript types/interfaces, reusable constants, utility functions, and
public helper APIs require meaningful JSDoc. Explain purpose, behavior, units,
and important constraints; use `@param`, `@returns`, or `@throws` when they add
useful information. Private declarations need documentation only for
non-obvious contracts, units, invariants, or behavior. Avoid boilerplate JSDoc
on trivial implementation details.

Genuinely cross-domain helpers, types, and constants belong at the nearest
existing shared or module boundary rather than inside a component folder.

Component files should remain focused on rendering and interaction. Split
independently meaningful UI responsibilities into cohesive components, while
avoiding extraction that only reduces line count or fragments a single behavior.

## Editorial text highlights

`src/modules/footage/public/components/text-highlight.tsx` exports
`TextHighlight`, a small public-storefront presentation component for selected
words or short phrases in headings and promotional text. It accepts React
children, so apply it only around the phrase to emphasize:

```tsx
داستانت رو با <TextHighlight>ویدیو</TextHighlight> بساز
```

Use this optional pattern sparingly when editorial emphasis improves hierarchy.
Do not use it for every heading or paragraph, interactive controls, long blocks
of copy, or content where emphasis would obscure meaning. It preserves inline
flow, keeps short phrases together, uses `dir="auto"` for Persian and
mixed-direction phrases, and remains ordinary readable text for assistive
technology. It uses an editor-selection treatment with semantic text, surface,
boundary, and handle colors, plus two decorative selection handles. Keep enough
surrounding line height for Persian glyphs and diacritics; do not apply
overflow clipping to its parent.

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

## Event handlers

Keep JSX declarative. Nontrivial event logic should live in a named component-
local handler and be passed by reference:

```tsx
function handleTimeUpdate(event: React.SyntheticEvent<HTMLVideoElement>) {
  const { currentTime, duration } = event.currentTarget;
  const progress =
    duration > 0 && Number.isFinite(duration)
      ? (currentTime / duration) * 100
      : 0;

  setProgress(Math.min(Math.max(progress, 0), 100));
}

return <video onTimeUpdate={handleTimeUpdate} />;
```

Use `handle` plus the event or action name, such as `handleSubmit`,
`handleCategoryChange`, `handlePreviewPointerDown`, `handleVideoError`, or
`handlePageChange`. Use explicit TypeScript event types where inference does not
make the boundary clear. Do not export component-specific handlers without a
real public use, and do not move handlers that depend on state, refs, effects,
or lifecycle into `utils.ts`.

Avoid anonymous JSX callbacks containing state updates, branching,
calculations, or side effects. A narrow inline adapter is acceptable when it
only forwards an argument to a named handler, for example
`onClick={() => handleSelect(item.id)}`. Prefer a direct handler reference when
one is possible, and do not add wrappers or `useCallback` without a concrete
need for referential stability.

## Custom hooks for cohesive interaction

Consider a dedicated custom hook when one component owns a meaningful
combination of related state, timers, browser APIs, refs, effects/cleanup,
pointer or touch interaction, media lifecycle, or complex event handlers. The
hook should own one cohesive interaction lifecycle while the component remains
primarily responsible for rendering and composition.

Do not create hooks for trivial state or one-line interactions. Hooks must obey
the Rules of Hooks and must not be placed in generic utility files. Pure
formatting and calculations remain utilities; shared domain types remain at
their owning module boundary.

Extracting a hook does not make a component a Server Component. A component
calling a client hook remains client-rendered. To reduce hydration, isolate the
smallest interactive subtree behind a dedicated Client Component boundary when
the static surrounding UI can remain server-rendered.

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
