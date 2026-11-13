# Components

Read this file with `instructions/frontend-implementation.md` and
`instructions/project-organization.md` when changing React UI.

## Ownership

- `src/components` contains genuinely reusable application UI.
- Capability-specific UI belongs under its owning `src/modules/<capability>`.
- Route-specific composition may remain beside the route.
- Keep shared components independent of Admin, Public, and domain business logic.
- Do not create abstractions for hypothetical reuse.

## Discovery before UI work

Inspect the relevant existing feature components, shared components, design
contracts, tests, and native controls before editing. Record the reuse plan in
the completion report, including ownership, props contracts, state ownership,
accessibility, RTL, responsive behavior, and any deliberate native-control
decision.

## Component contracts

Application-owned components that accept props use a named `*Props` type in a
matching `<component-name>.types.ts` companion file. Supporting constants,
utilities, hooks, and tests belong in the component's dedicated directory when
they are component-owned. Exported APIs receive useful JSDoc.

Prefer semantic HTML and existing components. Interactive controls must be
keyboard accessible, correctly labeled, focusable, and usable in RTL. Keep
business rules in application/domain functions, not presentation components.

## Shared components

Introduce a shared component only for a demonstrated reusable responsibility or
stable application-level API. Discover all relevant consumers first, define an
API that covers legitimate usage, migrate only the authorized scope, and verify
the remaining consumers and tests.

## Verification

Check server/client boundaries, props ownership, accessibility, RTL, responsive
states, loading/error/empty states, and the final diff. Do not redesign an
approved contract while implementing a bounded task.
