# VIDORA-QA-01 — Coding Standards & Architecture Audit

Audit date: 2026-10-31
Scope: read-only audit of the current worktree; no application source refactor
was performed.

## Executive summary

The repository has a coherent Next.js modular-monolith shape. App Router entry
points generally delegate to capability modules, the public homepage is rendered
as a Server Component, and client boundaries are concentrated in controls and
media interaction. The highest-value cleanup is to separate pure helpers and
the interactive preview island from static component rendering.

Severity counts:

- High: 1 — broad client boundary in the footage card.
- Medium: 9 — exported helpers/types in component files, duplicated category
  option shapes, route-level mock/catalog preparation, raw image handling,
  nontrivial inline handlers, and cohesive admin interactions that merit hook
  evaluation.
- Low: 1 — a small named-handler opportunity in search controls.
- Informational: 3 — intentional client components, intentional loading states,
  and the conceptual `public` → `app` naming opportunity.

The current worktree contains owner changes in the homepage/catalog and UI
primitive files. Those changes were preserved and were included in this audit.

## Standards established

The following conventions were added to `instructions/components.md`:

- exported pure helpers belong in a colocated `utils.ts`;
- meaningful reusable component types belong in a colocated `types.ts`;
- reusable component constants belong in a colocated `constants.ts`;
- private one-off details may remain local, and unnecessary files should not be
  created;
- component files should remain focused and responsibilities should be split
  only at meaningful UI boundaries;
- Server Components remain the default and client boundaries should be narrow.

The project-local shadcn Skill now points to these canonical repository rules
without duplicating them.

## Architecture boundary assessment

The intended conceptual boundaries are visible in the current tree:

- App: `src/app` owns routes, layouts, loading UI, and HTTP handlers.
- Admin: admin pages and footage-admin components live under `src/app/admin`
  and `src/modules/footage/admin`.
- Shared: `src/components/ui` contains shadcn/Base UI primitives; `src/lib`
  contains technical cross-cutting helpers.
- Capability ownership: Footage storefront code is under
  `src/modules/footage/public`; media and auth remain separate modules.

No directory or route rename is proposed in this task. In particular,
`src/modules/footage/public` should remain unchanged until an approved migration
addresses the conceptual `public` → `app` naming preference.

One boundary is less clear in the current UI experiment: `src/app/page.tsx`
directly loads UI-mock fixtures, derives categories, parses browse state, and
filters the catalog before passing data to the page component. This is acceptable
for the fixture-backed UI work, but the production route should eventually call
the public catalog application function and keep fixture selection outside the
production data path.

## Findings

### QA-01-01 — Footage card owns static presentation and preview interaction

- File: `src/modules/footage/public/components/footage-card/footage-card.tsx:1-221`
- Current problem: the card is a client component and combines price/duration
  formatting, cover fallback, pointer gestures, timers, video lifecycle,
  reduced-motion handling, progress state, and the complete card presentation.
  This hydrates the whole card grid for behavior that is limited to the media
  preview region.
- Relevant standard: default to Server Components; keep client boundaries as
  narrow as practical; keep component files focused on rendering and interaction.
- Proposed improvement: retain a server-rendered `FootageCard` for metadata and
  links, and extract a narrowly scoped client preview component for the pointer,
  timer, and video lifecycle behavior. Keep the preview API based on the public
  footage DTO and preserve the current reduced-motion and single-active-preview
  behavior.
- Priority: High
- Risk: Medium; interaction regressions are possible on touch, pointer leave,
  reduced motion, and failed playback.
- Expected impact: less hydration and client JavaScript per catalog item, clearer
  ownership, and easier preview-specific testing.

### QA-01-02 — Search helpers and props are embedded in a client component

- File: `src/modules/footage/public/components/homepage-search-controls.tsx:20-93`
- Current problem: `HomepageSearchControlsProps` is private to the implementation,
  while six pure URL/state helpers are exported from a file marked `use client`.
  The helpers do not need browser APIs and are harder to discover or reuse from
  server-safe code.
- Relevant standard: exported pure helpers belong in `utils.ts`; meaningful
  reusable component types belong in `types.ts`; keep client boundaries narrow.
- Proposed improvement: add colocated type and utility files, move the pure
  helpers and their parameter types there, and leave only hooks, handlers, and
  rendering in the client component. Preserve existing direct test imports
  through an intentional module boundary if needed during migration.
- Priority: Medium
- Risk: Low; URL serialization and test imports must remain behaviorally identical.
- Expected impact: server-safe pure logic, smaller client module responsibility,
  and focused unit tests.

### QA-01-03 — Header helper and prop type are colocated in the implementation

- File: `src/modules/footage/public/components/public-site-header.tsx:23-29`
- Current problem: `PublicSiteHeaderProps` and the pure
  `createPublicCategoryHref` helper are exported from the component file.
- Relevant standard: use colocated `types.ts` for meaningful reusable types and
  colocated `utils.ts` for exported pure helpers.
- Proposed improvement: move the prop contract to a companion types file and
  the href builder to a companion utils file; keep the header implementation
  focused on layout and navigation composition.
- Priority: Medium
- Risk: Low; update tests/imports atomically.
- Expected impact: consistent component structure and easier server-safe reuse.

### QA-01-04 — Pagination href builder is embedded in the list view

- File: `src/modules/footage/public/components/footage-list/public-footage-list-view.tsx:159-172`
- Current problem: `createPublicFootagePageHref` is an exported pure URL helper
  at the bottom of a rendering component.
- Relevant standard: exported pure helpers belong in a colocated `utils.ts`.
- Proposed improvement: move the href builder to a list-view utility (or the
  public catalog URL utility if it becomes shared with other browse surfaces),
  keeping pagination rendering in the list view.
- Priority: Medium
- Risk: Low; preserve query encoding, page omission for page 1, and the anchor.
- Expected impact: clearer rendering/data-helper separation and direct helper tests.

### QA-01-05 — Category option shape is repeated at multiple boundaries

- Files: `src/app/page.tsx:44-51`,
  `src/modules/footage/public/components/homepage-search-controls.tsx:20-25`,
  `src/modules/footage/public/components/public-home-page.types.ts:4-13`,
  `src/modules/footage/public/components/public-site-header.tsx:23-25`
- Current problem: several components independently spell the category option
  shape as mutable `Array<{ value: string; labelFa: string }>` or readonly
  equivalents. This creates drift risk without a single ownership point.
- Relevant standard: avoid duplicate domain/component types and prefer existing
  shared/domain types where available.
- Proposed improvement: define one public catalog category-option type at the
  closest public catalog boundary, use it in page preparation and component prop
  contracts, and retain readonly views only where immutability is intentional.
- Priority: Medium
- Risk: Low; type-only migration.
- Expected impact: fewer shape inconsistencies and clearer ownership of browse
  metadata.

### QA-01-06 — Homepage route performs fixture/catalog preparation directly

- File: `src/app/page.tsx:27-55`
- Current problem: the route parses scenario state, loads UI-mock fixtures,
  derives categories, normalizes category state, and filters footage itself.
  This is substantial application preparation in a route file and couples the
  production homepage entrypoint to the UI-mock module.
- Relevant standard: route files should stay focused and delegate substantial
  behavior to modules; business behavior belongs near the owning capability.
- Proposed improvement: when the real public catalog path is enabled, introduce
  a public-home/catalog application function that owns query normalization,
  category derivation, and filtering. Keep scenario fixtures in a test/demo
  adapter rather than making the route’s production path depend on them.
- Priority: Medium
- Risk: Medium; the current UI experiment depends on query-driven scenarios and
  must not lose its review states.
- Expected impact: a cleaner App → Footage module boundary and a simpler route.

### QA-01-07 — Cover image uses raw `<img>` and currently triggers the known lint warning

- File: `src/modules/footage/public/components/footage-card/footage-card.tsx:142-148`
- Current problem: the card uses raw `<img>` while the public header uses
  `next/image`; the roadmap’s recorded lint baseline includes an existing
  `@next/next/no-img-element` warning.
- Relevant standard: preserve framework semantics and verify lint output; use
  existing project conventions when suitable.
- Proposed improvement: evaluate `next/image` with the cover delivery contract
  and configured remote/local image policy before changing it. If `next/image`
  is unsuitable for the current fixture or protected-media contract, document
  the reason and keep the warning explicitly tracked.
- Priority: Medium
- Risk: Medium; image sizing, remote source configuration, and cover privacy
  behavior must be verified.
- Expected impact: improved image optimization and removal of a known warning,
  or a documented reason for retaining native image markup.

## Event-handler audit

### QA-01S-01 — Footage card has nontrivial inline event logic

- File: `src/modules/footage/public/components/footage-card/footage-card.tsx:87-139`
- Current problem: pointer enter/down/move/up/cancel, context-menu, play/pause,
  and time-update attributes contain branching, cleanup, state updates, or
  progress calculations directly in JSX. `onError={stopPreview}` is already a
  compliant named-handler reference.
- Relevant standard: nontrivial event logic belongs in explicitly typed named
  `handleX` functions; JSX should remain declarative.
- Proposed improvement: name the handlers (`handlePreviewPointerEnter`,
  `handlePreviewPointerDown`, `handlePreviewTimeUpdate`, and so on), or move
  them into the preview hook described below. Preserve the existing event
  behavior and cleanup semantics.
- Priority: Medium
- Risk: Medium; pointer and media event typing and ordering are easy to regress.
- Expected impact: readable JSX and a clearer seam for the preview interaction.

### QA-01S-02 — Admin cover editor contains several nontrivial inline handlers

- File: `src/modules/media/covers/components/admin-footage-cover-panel.tsx:244-320`
- Current problem: image error handling, dialog open/close branching, pointer-up
  cleanup, zoom conversion, and button side effects are partly implemented in
  JSX callbacks. The existing pointer-down/move/key-down handlers already use
  named functions.
- Relevant standard: avoid inline callbacks containing side effects, branching,
  or calculations; use named handlers with explicit event types.
- Proposed improvement: add named handlers such as `handleCurrentCoverError`,
  `handleDialogOpenChange`, `handleCropPointerUp`, `handleZoomChange`, and
  `handleCancel`. Direct references are preferred where the function already
  matches the callback shape.
- Priority: Medium
- Risk: Medium; dialog state, pointer capture, and disabled/busy behavior must
  remain unchanged.
- Expected impact: clearer crop-editor behavior and simpler future extraction.

### QA-01S-03 — Upload panel has one nontrivial inline state transition

- File: `src/modules/media/uploads/components/admin-footage-upload-panel.tsx:186-195`
- Current problem: the file-kind change callback parses and validates input,
  sets an error, or updates state directly in JSX. The label/file setters are
  narrow forwarding callbacks and are acceptable under the documented exception,
  though named handlers may improve consistency during a later pass.
- Relevant standard: named handlers for branching or validation; trivial setter
  forwarding may remain inline.
- Proposed improvement: extract `handleUploadKindChange` with an explicit
  `ChangeEvent<HTMLSelectElement>` type. Keep the simple label/file adapters
  inline unless the component is otherwise being reorganized.
- Priority: Medium
- Risk: Low; preserve validation and error state behavior.
- Expected impact: a declarative form and a focused validation boundary.

### QA-01S-04 — Search controls have acceptable adapters and one named-handler opportunity

- Files: `src/modules/footage/public/components/homepage-search-controls.tsx:138-174,232-234`
- Current problem: the select callback maps `null`/`all` to the domain value,
  the input callback sets draft state, and the suggested-category callback
  branches between clearing and selecting. The first two are small adapters;
  the suggested-category branch is nontrivial enough to name.
- Relevant standard: inline forwarding is allowed, but branching belongs in a
  named handler.
- Proposed improvement: add `handleSuggestedCategoryClick` and leave the
  select/input adapters inline only if they remain single-purpose; do not create
  a hook for this amount of state.
- Priority: Low
- Risk: Low.
- Expected impact: more scannable JSX without unnecessary abstraction.

## Custom hook audit

### Hook candidate: footage preview — justified and highest priority

`FootageCard` combines three state variables, three refs, a timer, browser
pointer/touch APIs, media playback lifecycle, reduced-motion checks, cleanup,
and progress calculation. This is a cohesive interaction, not merely a long
component. A colocated `use-footage-preview.ts` is justified, followed by the
smaller client preview island proposed in QA-01-01. The hook must remain client
only and preserve the single-active-preview behavior.

### Hook candidate: admin cover editor — justified, but separate from preview

`src/modules/media/covers/components/admin-footage-cover-panel.tsx:60-224`
owns object-URL lifecycle, crop refs, zoom/offset state, pointer dragging,
keyboard movement, canvas encoding, upload, refresh, and error handling. A
`use-admin-footage-cover-editor.ts` could own the crop lifecycle, but extraction
has meaningful risk around object-URL cleanup, canvas dimensions, and the
security-sensitive upload route. Treat it as an independent refactor after
named handlers are extracted; do not combine it with the footage preview hook.

### Hook candidate: admin upload workflow — evaluate later

`src/modules/media/uploads/components/admin-footage-upload-panel.tsx:41-167`
owns multipart coordination, progress, busy/error/result state, and refresh.
The workflow is cohesive and could become `use-admin-footage-upload.ts`, but it
also crosses direct-storage and API boundaries. Extraction is reasonable only
if tests can preserve the current failure handling and direct-upload invariant.
Priority is below the footage preview and cover editor because the current
component already keeps the upload workflow in one named `handleSubmit`.

### Not justified: search, pagination, and header navigation

Search controls have one draft value and three short named actions; pagination is
server-rendered URL navigation; and header/mobile navigation delegates state to
the existing shadcn primitives. A custom hook would add indirection without a
cohesive lifecycle benefit.

## Revised prioritized refactoring sequence

1. QA-01S-R1 — Extract named handlers from `FootageCard` while preserving all
   preview behavior; add focused handler/media tests.
2. QA-01-R1 — Extract the cohesive footage preview lifecycle into
   `use-footage-preview.ts`, then isolate the smallest client preview island.
3. QA-01S-R2 — Extract named handlers from the admin cover editor and upload
   panel, preserving direct-storage and crop/upload behavior.
4. QA-01S-R3 — Evaluate `use-admin-footage-cover-editor.ts` with negative-path
   tests for object URLs, canvas failures, busy state, and upload failures.
5. QA-01S-R4 — Evaluate `use-admin-footage-upload.ts` only if the multipart
   workflow tests can preserve its provider/storage invariants.
6. QA-01S-R5 — Add `handleSuggestedCategoryClick` and complete the earlier
   search helper/type extraction.
7. QA-01-R3 through QA-01-R6 — Continue the existing header/list helper, shared
   category type, catalog boundary, and image-policy work in that order.

## Server/client rendering audit

Confirmed appropriate client boundaries:

- `homepage-search-controls.tsx` uses `useRouter` and `useState` for URL-driven
  interaction and draft search input.
- `footage-card.tsx` uses browser media APIs, pointer events, timers, and video
  state for preview behavior.
- `src/components/ui/select.tsx` and `src/components/ui/sheet.tsx` are client
  primitives consumed by otherwise server-rendered components.

Confirmed server-rendered composition:

- `src/app/page.tsx` is an async Server Component that prepares props.
- `public-home-page.tsx`, `public-footage-list-view.tsx`,
  `public-site-header.tsx`, and `public-site-footer.tsx` have no `use client`
  directive.
- The header’s client navigation primitives do not force the parent header into
  a client boundary.

Intentional loading behavior, not a confirmed bug:

- `src/app/loading.tsx` is a route-level transition/loading boundary.
- The `scenario === "loading"` branch in
  `public-footage-list-view.tsx:32-43` is an explicit UI-mock state.

No hydration defect was found in the inspected paths: browser globals in the
footage card are reached from event handlers/effects, not during the initial
render. The card split in QA-01-01 is an optimization and responsibility
improvement, not a claim that the current boundary is invalid.

## shadcn/ui consistency findings

The inspected search controls reuse `Card`, `Input`, `Select`, `Separator`, and
`Button`; pagination uses the installed `Pagination` primitive. The header uses
`NavigationMenu`, `Sheet`, and `Button`. No custom interactive control was found
that clearly duplicates an installed shadcn primitive.

The main follow-up is to preserve this reuse during QA-01-01: the preview split
should keep the existing `Card` composition and should not introduce a custom
control primitive. The raw cover image finding is a Next.js image-policy issue,
not a shadcn replacement request.

## Prioritized refactoring sequence

1. QA-01-R1 — Extract the footage preview client island from `FootageCard`; add
   focused negative-path tests for reduced motion, unavailable media, playback
   failure, and cleanup. Depends on no other refactor.
2. QA-01-R2 — Extract search helpers/types from `HomepageSearchControls`; preserve
   URL and Back/Forward behavior.
3. QA-01-R3 — Extract header and list-view helper/type contracts. These are
   independent and can be reviewed separately after R2.
4. QA-01-R4 — Consolidate the public category option type across the homepage,
   header, and search controls.
5. QA-01-R5 — Move production catalog/query preparation behind the Footage public
   module while retaining an explicit UI-mock adapter for review scenarios.
6. QA-01-R6 — Resolve or document the cover image policy and the existing
   `no-img-element` warning after checking the actual cover delivery contract.

Each item is intentionally small enough for an independent review. None requires
renaming `public`, reorganizing the modular monolith, changing routes, or changing
product behavior.

## Verification performed

- Read the repository `AGENTS.md`, project definition, roadmap, relevant
  architecture/component/frontend/type/testing instructions, ADR-0001 and
  ADR-0004, the project-local shadcn Skill, and the installed Next.js guidance.
- Inspected `git status --short`; existing owner modifications were preserved.
- Inspected App Router entrypoints, public/admin component trees, UI primitives,
  helper exports, props/type files, loading boundaries, and current imports.
- Audited JSX event attributes across the public footage, admin cover, and admin
  upload components; classified named handlers, trivial adapters, and
  nontrivial inline callbacks.
- Audited state, refs, timers, effects, browser APIs, media lifecycle, crop, and
  multipart-upload responsibilities for custom-hook candidates.
- No application source files were changed by this audit.
- Targeted documentation formatting passed. Repository-wide `pnpm format:check`
  was not clean because the existing owner change in
  `src/modules/footage/public/components/homepage-search-controls.tsx` is not
  Prettier-formatted; it was not modified by this audit.
- `pnpm check:agent-tooling` passed.
- `git diff --check` passed.

## QA-03 naming and QA-02 completion follow-up

The QA-03 naming pass inspected the existing component directories and renamed
the Footage Card's generic support files to the canonical owning-component
prefix:

- `src/modules/footage/public/components/footage-card/footage-card.constants.ts`
- `src/modules/footage/public/components/footage-card/footage-card.utils.ts`
- `src/modules/footage/public/components/footage-card/footage-card.utils.test.ts`

The other inspected component-owned files already followed the prefix rule.
Module-level helpers such as `src/modules/footage/format-duration.ts` are not
component-owned and remain outside that convention.

No automated filename checker was added. Inferring ownership from arbitrary
nested directories would require brittle heuristics and could misclassify
framework-required files or shared module-level helpers. A future
`check:component-files` script should use explicit component manifests (or a
strict rule only when a directory has a matching owning component file), skip
framework-required names, and report the exact component directory and
expected prefix. Until that contract exists, this audit remains the reliable
enforcement record.

QA-02's Footage Card implementation is complete, including the extracted
preview hook, media lifecycle handling, and focused interaction coverage added
in `use-footage-preview.test.tsx`. Browser verification was limited to the
available running browser surface; the requested 360/768/1280/1920 viewport
matrix could not be exercised because viewport control was unavailable. The
remaining browser-matrix limitation must stay visible in the QA-02 handoff.

## Unresolved questions

- Should the UI-mock scenario route remain temporarily available after the real
  public catalog is wired, or move behind test-only/demo entrypoints?
- What is the approved image delivery policy for public covers (remote host,
  optimization, and privacy constraints) before replacing the raw image?
- Should public category options become a catalog-domain type or remain a
  composition-only type until the real catalog query is implemented?

## VIDORA-QA-04 closure

The coordinated cleanup was implemented against the existing owner worktree
and verified on 2026-10-31.

### Resolved findings

- QA-01-02: homepage search props and pure URL/state helpers now live in
  component-prefixed type and utility files, with compatibility re-exports.
- QA-01-03: public header props and category URL construction now live in
  component-prefixed type and utility files, with compatibility re-exports.
- QA-01-04: public footage pagination URL construction now lives in a
  component-prefixed utility file, with a compatibility re-export.
- QA-01-05: public catalog category options use one catalog-owned type.
- QA-01-06: homepage catalog preparation now belongs to the Footage catalog
  module; the route is composition-only while preserving fixture scenarios,
  filtering, pagination, and URL parameters.
- QA-01S-02: cover editor image error, dialog, crop cleanup, zoom, and cancel
  interactions use named handlers.
- QA-01S-03: upload-kind validation and state transition use a named handler.
- QA-01S-04: suggested-category branching uses a named handler.

QA-01-01 and its preview-hook work were already completed in the preserved
QA-02 owner changes. Typography aliases were removed from CSS and all current
usages were migrated to standard Tailwind `text-*` and `leading-*` utilities.
The canonical foundation, component instructions, and both local shadcn skill
copies now reference this rule.

### Deferred or partially resolved findings

- QA-01-07 remains deferred: raw `<img>` is retained until the public-cover
  delivery policy and the Admin preview policy are approved. The known lint
  warning remains, with no new lint errors.
- The Admin cover-editor and upload-workflow hook candidates remain deferred.
  Named handlers were extracted, but lifecycle-hook extraction would cross
  object-storage or canvas boundaries without dedicated workflow tests.

### Verification and limitations

- `pnpm format:check`: passed.
- `pnpm lint`: passed with the pre-existing raw-image warnings only.
- `pnpm typecheck`: passed.
- `pnpm test`: passed (42 files, 345 tests).
- `pnpm build`: passed.
- `pnpm check:agent-tooling`: passed.
- `git diff --check`: passed.
- Browser smoke testing was not performed in this task; the available browser
  surface did not provide the requested viewport matrix in the prior audit.

## VIDORA-QA-05 final review

The final review was performed against the preserved mixed worktree on
2026-10-31. No application source defect was confirmed that warranted a new
fix during this review.

### Verified

- Server-rendered page composition remains the default; browser-only preview
  behavior is isolated in `FootagePreview` and `useFootagePreview`.
- Footage Card, preview, search, header, pagination, cover-editor, and upload
  support files follow the component-owned naming convention inspected in this
  audit. Exported public contracts and reusable helpers in the reviewed scope
  have meaningful JSDoc where they define non-obvious behavior.
- `text-ui-*` aliases and their CSS definitions are absent. The foundation
  contract and implementation use standard Tailwind `text-*` and `leading-*`
  utilities, with Vazirmatn and RTL behavior retained.
- The local browser smoke check loaded `/`, navigated to page 2, rendered 12
  gallery items, preserved query/category URL state, and reached the Admin
  footage route through the development bypass.
- The Admin route showed an empty catalog in this environment, so editor and
  upload interactions could not be exercised without creating test data.

### Deferred or limited

- QA-01-07 remains deferred: the public-cover and Admin preview image-delivery
  policy is unresolved. `next/image` remains an option to evaluate after the
  source/privacy contract is approved; the three existing `no-img-element`
  warnings are the only lint warnings observed.
- The requested 360px, 768px, 1280px, and 1920px viewport matrix could not be
  executed because the available browser surface did not expose viewport
  override controls. The visual smoke evidence therefore covers only the
  available default viewport.
- Console-error inspection was not available through the browser surface and is
  not claimed as verified.
- Cover-editor and upload-workflow hook extraction remains deferred. The
  existing named-handler cleanup is sufficient for the current scope; further
  extraction should wait for workflow-level regression coverage.

### QA-05 verification

- `pnpm format:check`: passed.
- `pnpm lint`: passed with the three documented raw-image warnings only.
- `pnpm typecheck`: passed.
- `pnpm test`: passed (42 files, 345 tests).
- `pnpm build`: passed.
- `pnpm check:agent-tooling`: passed.
- `git diff --check`: passed.

QA-05 does not add a new roadmap entry because the current roadmap does not
define a QA-05 task ID. The review remains a release-readiness handoff pending
product-owner approval of the viewport evidence and image-delivery policy.
