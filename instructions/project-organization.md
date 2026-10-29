# Project Organization

Read this file when:

- creating or moving application files;
- introducing a module;
- deciding where server logic belongs;
- deciding whether code is shared or feature-specific;
- creating reusable UI;
- introducing a new cross-cutting utility.

This project is a Next.js modular monolith.

The organization should make business ownership obvious without forcing enterprise layering.

---

# 1. High-Level Structure

The intended top-level source structure is:

```text
src/
  app/
  components/
  modules/
  lib/
```

These directories have different responsibilities.

Do not treat them as interchangeable dumping grounds.

---

# 2. `src/app`

`src/app` owns Next.js framework and routing concerns.

Typical responsibilities:

- route segments;
- layouts;
- pages;
- loading/error boundaries;
- metadata integration;
- genuine HTTP Route Handlers;
- route-level composition.

Keep route files focused.

Substantial business logic should not live directly inside:

```text
page.tsx
layout.tsx
route.ts
```

or large Server Actions.

Framework boundaries should delegate to the relevant module.

---

# 3. `src/modules`

`src/modules` owns business capabilities.

All business capability code belongs under:

```text
src/modules/<capability>/
```

Do not introduce a competing `src/features/` tree or unrelated project-wide
architecture layers. A capability module remains the owner even when it has
multiple UI surfaces, workflows, persistence adapters, or provider boundaries.

Expected future modules may include:

```text
auth
footage
media
search
orders
payments
invoices
downloads
blog
```

Create a module only when the roadmap task requires the capability.

Do not create all future module directories in advance.

---

# 4. Module Ownership

A module should own business behavior associated with its capability.

Examples:

```text
modules/orders
```

owns Order behavior.

```text
modules/payments
```

owns application-facing payment-provider behavior.

```text
modules/media
```

owns media metadata/storage coordination.

Do not scatter one capability across unrelated global directories merely because files have similar technical roles.

---

# 5. Do Not Create Global Technical Layers by Default

Avoid project-wide structures such as:

```text
src/services/
src/repositories/
src/actions/
src/hooks/
src/types/
src/utils/
```

as default homes for unrelated domain code.

These structures tend to group code by implementation technique rather than business ownership.

Prefer:

```text
src/modules/orders/...
src/modules/footage/...
```

with local supporting files.

Cross-cutting technical code may live outside modules only when it is genuinely cross-cutting.

---

# 6. Module Internal Structure

Do not force every module to have the same structure.

Avoid empty template architecture like:

```text
module/
  services/
  repositories/
  types/
  utils/
  hooks/
  components/
```

unless those categories are genuinely required.

When a module contains multiple meaningful responsibilities, group files into
subdirectories by business surface, workflow, or integration boundary. Use the
shallowest structure that makes ownership and discovery clear.

The approved Footage organization is an example of this principle:

```text
src/modules/footage/
  admin/
    catalog/
    edit/
    mutations/
  public/
    catalog/
    components/
      footage-card/
      footage-list/
```

This is an illustrative example, not a mandatory template for every module.
Other modules may need different groupings, or no subdirectories at all.

Module roots may contain genuinely capability-wide files. Do not place a new
file directly at a module root merely because it is convenient when an existing
meaningful directory owns the responsibility.

Before creating or relocating a source file, agents must:

1. inspect the owning module's existing structure;
2. identify the closest related implementation;
3. reuse an existing meaningful directory where appropriate;
4. determine whether a new subdirectory is justified;
5. keep related implementation, contracts, and tests discoverable together.

Do not create generic dumping-ground directories, universal folder templates,
arbitrary folder depth, mandatory barrels, or directories solely for visual
symmetry. Do not enforce arbitrary numerical file-count limits.

When modifying existing code, follow its approved directory structure. If its
placement violates these rules, report the issue and propose a scoped correction.
Do not silently reorganize unrelated code during ordinary feature work.

New conventions apply to future implementation and to existing code when that
code is deliberately migrated through a reviewed refactor. They do not require
unrelated file moves as part of ordinary feature work, and an existing module
must not be described as compliant before it has been audited.

---

# 7. Server-Only Code

Code that uses:

- Prisma;
- private environment variables;
- payment-provider secrets;
- SMS credentials;
- storage credentials;
- server-only libraries;

must remain server-only.

Do not allow server infrastructure to leak into client component import graphs.

Use clear file boundaries and framework-supported server-only safeguards where appropriate.

---

# 8. Business Logic

Business logic belongs near the owning module.

Examples:

```text
normalizeIranianMobile
createOrder
completeVerifiedPurchase
authorizeFootageDownload
```

Do not put these behaviors in:

```text
src/lib/utils.ts
React components
route files
random helpers
```

---

# 9. `src/components`

`src/components` is for UI that is genuinely reusable across business areas or belongs to the application-wide shell/design system.

Application-owned component rules, including shadcn usage, shared-boundary decisions,
props contracts, accessibility, responsive behavior, and component tests are defined
in `instructions/components.md`.

Examples may include:

- shared layout primitives;
- design-system primitives;
- reusable application-wide UI.

Feature-specific components should normally stay near the owning feature/module or route.

Do not move a component to `src/components` merely because it is rendered more than once inside the same feature.

---

# 10. shadcn/ui

Generated or adapted shadcn primitives should live under the approved shared UI location, currently:

```text
src/components/ui/
```

These components are implementation primitives, not business modules.

Use direct imports by default. A barrel is appropriate only when it defines a
deliberate public boundary; barrels are not required for every component directory.

Do not place Footage-specific or commerce-specific business logic into shadcn primitives.

---

# 11. `src/lib`

`src/lib` is for small cross-cutting technical utilities and framework/infrastructure helpers that do not belong to one business capability.

Examples may include:

- general class-name utilities;
- environment access boundaries;
- framework-level shared helpers.

Do not use `src/lib` as the default home for business behavior.

If a function uses words from a business domain, first ask whether it belongs in that domain's module.

---

# 12. Types

Prefer types near the code/domain that owns them.

Do not create a global `src/types` directory for unrelated application types.

Cross-domain primitives may be shared only when they are genuinely cross-domain.

See:

```text
instructions/functions-and-types.md
```

---

# 13. Hooks

Hooks should live near the UI behavior that uses them.

Do not create a global hooks directory just because a function begins with `use`.

A hook should move to a shared location only when reuse across independent areas justifies it.

---

# 14. Feature Components

A feature-specific component should stay close to the owning capability and
surface. Co-locate the component implementation, its companion `*.types.ts`
file, and focused component tests. For multiple UI surfaces, group components
by the owning surface or feature inside the module.

For example, Footage storefront components belong under:

```text
src/modules/footage/public/components/
```

A route-specific composition component may stay beside the route when it has no value outside that route.

Choose ownership over arbitrary consistency.

---

# 15. Server Components and Modules

A Server Component may call application/module functions directly.

Do not introduce an HTTP round trip within the same application:

```text
Server Component
  ↓
fetch("/api/...")
```

when it can instead call:

```text
Server Component
  ↓
module function
```

Use HTTP only when an actual HTTP boundary exists.

---

# 16. Route Handlers

Route Handlers are appropriate for real HTTP entrypoints such as:

- provider callbacks;
- signed upload coordination;
- protected download authorization;
- auth-library handlers;
- external integration endpoints.

They should adapt HTTP concerns and delegate substantial behavior to modules.

Do not turn Route Handlers into a second application architecture.

---

# 17. Server Actions

Server Actions may adapt UI mutations to module behavior.

They should not become large business-logic files.

A Server Action should usually:

1. validate request input;
2. authenticate/authorize if needed;
3. call the relevant module function;
4. return a suitable application result.

Complex durable behavior belongs in the module.

---

# 18. Database Access

Prisma access belongs in server-side module/infrastructure code.

Do not import Prisma into:

- client components;
- browser-safe utilities;
- shared UI primitives.

Do not require a repository class for every model.

Introduce a dedicated persistence boundary when it improves correctness, reuse, testing, transaction behavior, or separation from Prisma.

Group related use cases, persistence contracts, adapters, and tests by their
owning workflow when that improves discoverability. Preserve explicit
server-only boundaries: server-only persistence code must not be imported into
client components or browser-safe utilities.

---

# 19. External Providers

External providers should be isolated behind the narrow approved boundary.

Examples:

```text
SmsProvider
PaymentProvider
ObjectStorage
```

Provider SDKs should not appear throughout unrelated modules.

Do not create a generic provider framework.

---

# 20. Cross-Module Dependencies

Cross-module calls are allowed when the business relationship requires them.

Avoid cycles.

If Module A and Module B begin importing each other's internal implementation details, stop and reconsider ownership.

Prefer small public module contracts.

---

# 21. Shared Code Threshold

Do not extract code merely because two implementations look similar.

Extract when sharing:

- represents one real concept;
- reduces meaningful duplication;
- preserves a business invariant;
- creates a valuable provider/framework boundary.

Duplication can be cheaper than the wrong abstraction.

---

# 22. Local Documentation

As modules become non-trivial, focused README or local documentation may be added when it materially helps future contributors/agents understand:

- ownership;
- entrypoints;
- invariants;
- integration boundaries.

Do not create a README for every small directory.

Canonical project/product/architecture policy stays in the existing central documentation.

---

# 23. Structure Changes

When changing major directory responsibilities:

- update this instruction if the canonical organization changed;
- update an ADR when the change is architectural;
- avoid maintaining two competing organizational patterns.

Do not let accidental implementation patterns silently become architecture.

---

# 24. Core Organization Principle

Organize primarily by:

```text
business ownership
```

not by:

```text
file type
technical layer
framework primitive
```

while keeping cross-cutting technical infrastructure explicit and small.
