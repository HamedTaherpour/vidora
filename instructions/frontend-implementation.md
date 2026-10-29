# Frontend Implementation

Read this file for React and Next.js UI implementation.

Pair it with:

```text
instructions/project-organization.md
instructions/components.md
```

and approved files under:

```text
docs/design/
```

when Design Contracts exist.

Component ownership, shadcn usage, props, accessibility, responsive contracts, and
component-test expectations are defined in `instructions/components.md`. Keep the
React-specific rendering, state, hooks, and client-boundary rules here rather than
duplicating the component policy.

---

# 1. Server Components by Default

Use Server Components by default.

Add `"use client"` only when the component genuinely requires browser-side behavior such as:

- event handlers;
- local interactive state;
- browser APIs;
- client-only libraries;
- context that must run in the browser.

Do not mark large page/component trees as client components merely for convenience.

Push client boundaries downward.

---

# 2. Keep Client Islands Small

Prefer:

```text
Server-rendered Footage details
        +
small interactive BuyNow control
```

over turning the full Footage page into a client component.

This improves:

- simplicity;
- server data access;
- SEO;
- bundle size;
- architectural clarity.

---

# 3. Server Data Should Stay Server-Side

Do not move data fetching to the browser when the data can naturally be loaded in a Server Component.

Avoid patterns like:

```text
Server page
→ client component
→ useEffect
→ fetch same-app API
```

without a genuine client-side requirement.

Prefer direct server/module access.

---

# 4. Do Not Fetch Internal APIs From Server Components

Inside server-side application code, do not call the application's own Route Handler via HTTP when the underlying application/module function is directly available.

Prefer:

```text
Server Component
→ module function
```

over:

```text
Server Component
→ fetch("/api/footage")
→ Route Handler
→ module function
```

Internal HTTP adds unnecessary failure modes and duplication.

---

# 5. `useEffect`

Use `useEffect` for synchronization with external systems.

Examples:

- browser event subscriptions;
- third-party imperative widgets;
- timers;
- browser storage synchronization where genuinely needed;
- non-React APIs.

Do not use `useEffect` merely to derive one piece of React state from another.

---

# 6. Avoid Derived-State Effects

Bad:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer deriving during render:

```tsx
const fullName = `${firstName} ${lastName}`;
```

Derived state should not create additional synchronization problems.

---

# 7. Avoid Effect Chains

Do not build workflows where one effect changes state that triggers another effect that changes more state.

Prefer explicit event/application flows.

Effects should not become an alternative state machine.

---

# 8. Effect Dependencies

Do not intentionally omit dependencies to control when an effect runs.

If dependencies make an effect run too often, reconsider the design rather than suppressing dependency correctness.

Do not broadly disable hook lint rules.

---

# 9. Event-Driven Logic

If behavior occurs because a user performed an action, prefer handling it in the event/action path instead of observing state with an effect.

Example:

```text
User clicks Buy Now
→ execute Buy Now action
```

not:

```text
set shouldPurchase = true
→ effect watches shouldPurchase
→ execute purchase
```

---

# 10. State Ownership

Keep state at the lowest reasonable owner.

Do not move state globally merely because multiple child components need it.

Prefer:

1. local state;
2. lifted state within one feature;
3. context for a real subtree-wide concern;
4. global state only when the product truly has cross-application client state.

Do not introduce a global state library without demonstrated need.

---

# 11. URL State

Use URL/search parameters for state that benefits from:

- sharing;
- bookmarking;
- navigation history;
- server rendering;
- discoverability.

Search and filter state are strong candidates.

Do not duplicate URL state unnecessarily in global client state.

---

# 12. Context

Use React Context for stable subtree-level concerns.

Do not use Context as a replacement for every prop or as a general state-management system.

Large frequently-changing values in Context can create unnecessary rendering.

---

# 13. Keys

Use stable identity for list keys.

Prefer:

```tsx
key={footage.id}
```

Avoid array indexes when list order or identity may change.

Do not generate random keys during rendering.

---

# 14. Immutable State

Treat React state as immutable.

Do not mutate arrays or objects in-place and then reuse the same reference.

Use immutable updates.

---

# 15. Memoization

Do not add `useMemo`, `useCallback`, or `memo` automatically.

Use memoization when:

- profiling indicates value;
- referential stability is required by an external API;
- expensive computation is meaningful;
- a stable dependency is genuinely needed.

Memoization adds complexity and can make code harder to reason about.

---

# 16. Forms

Prefer the simplest form mechanism that satisfies the feature.

Use schema validation at server boundaries.

Client validation may improve UX but does not replace server validation.

Do not introduce a complex form framework for trivial forms unless its value is clear.

---

# 17. Loading States

Use Next.js/React server loading boundaries when appropriate for server-rendered data.

Use client loading state for actual client interactions.

Do not convert a server flow to client fetching solely to display a spinner.

---

# 18. Error States

Expected UI errors should be actionable and understandable.

Do not expose:

- raw exceptions;
- database messages;
- provider responses;
- internal stack traces.

Keep detailed diagnosis server-side.

---

# 19. Optimistic UI

Use optimistic updates only when the operation semantics make them safe and the UX benefit is meaningful.

Do not optimistically represent financial or entitlement success before server confirmation.

Never show:

```text
Purchase complete
```

before verified purchase completion.

---

# 20. Security-Sensitive UI

Client UI can reflect authorization state for UX, but server behavior remains authoritative.

Examples:

- hiding Admin controls;
- hiding protected download controls;
- disabling unavailable actions.

These must be backed by server authorization.

---

# 21. Video UI

Avoid uncontrolled simultaneous video playback in footage lists.

Catalog cards should not cause many previews to play automatically at once.

Video behavior must follow the approved Design Contract and performance considerations.

Do not invent complex preloading strategies without evidence.

---

# 22. Images and Media

Use Next.js media capabilities where they fit, but do not route protected original video delivery through ordinary public image/media behavior.

Preview and protected originals follow the media architecture.

---

# 23. Accessibility

Use semantic HTML before ARIA.

Interactive elements must be keyboard-usable.

Use actual:

```text
button
a
input
label
```

elements when those semantics apply.

Do not recreate native controls with clickable `div` elements.

Ensure meaningful focus behavior and accessible labeling.

---

# 24. RTL

The storefront is Persian-first.

Components must work correctly in RTL.

Avoid layout assumptions based on physical directions such as left/right when logical direction-aware CSS can be used.

Design Contracts and semantic tokens are authoritative where available.

---

# 25. Design Contracts

When an approved Design Contract exists:

- follow its structure;
- implement its states;
- use its responsive rules;
- use its semantic tokens;
- preserve specified RTL behavior.

Do not redesign the component during implementation.

Report meaningful missing design decisions instead of inventing them.

---

# 26. Styling

Prefer semantic design tokens over arbitrary values.

Avoid repeated one-off values such as unrelated:

```text
13px
17px
21px
```

when the design system provides semantic spacing/typography.

Do not abstract every Tailwind class combination prematurely.

---

# 27. Component Responsibility

A component should have a clear UI responsibility.

Split components when:

- responsibilities are meaningfully independent;
- client/server boundaries benefit;
- reuse is real;
- readability materially improves.

Do not split components solely to reduce line count.

---

# 28. Handler Naming

Prefer internal event handlers named:

```text
handleSubmit
handlePlay
handleFilterChange
```

Callback props should usually describe the event:

```text
onSubmit
onPlay
onFilterChange
```

Avoid vague names like:

```text
doThing
processClick
callback
```

---

# 29. Browser APIs

Access browser-only APIs only from client-side code.

Avoid rendering behavior that depends unpredictably on browser-only values during server render.

Handle hydration-sensitive behavior deliberately.

---

# 30. Performance

Optimize obvious structural issues first:

- keep unnecessary code out of client bundles;
- avoid repeated network calls;
- avoid uncontrolled media playback;
- use server rendering appropriately;
- keep queries targeted.

Do not introduce complex frontend performance architecture before measurement.

---

# 31. Frontend Principle

Prefer:

```text
server-first
small client islands
explicit interaction
local ownership
```

over:

```text
everything client-side
effect-driven synchronization
global state by default
internal HTTP everywhere
```
