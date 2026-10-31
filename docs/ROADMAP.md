# V1 Implementation Roadmap

> Status: Active  
> Scope: V1  
> Canonical product definition: `docs/PROJECT.md`

## 1. Purpose

This roadmap breaks V1 into small, reviewable implementation tasks suitable for both human developers and AI coding agents.

The roadmap is intentionally smaller than a long-term product roadmap.

Its goals are:

- maintain implementation order;
- expose dependencies;
- prevent uncontrolled scope expansion;
- provide bounded tasks to coding agents;
- define completion criteria before implementation begins;
- keep V1 focused on shipping.

This roadmap does not override:

- `docs/PROJECT.md`;
- accepted ADRs;
- engineering/security instructions;
- `AGENTS.md`.

If documents conflict, the conflict must be reported rather than silently resolved by an implementation agent.

---

# 2. Task Status

Allowed task states:

```text
TODO
IN_PROGRESS
BLOCKED
READY_FOR_REVIEW
DONE
```

A task must not be marked `DONE` merely because code was written.

It must satisfy its acceptance criteria and required verification.

---

# 3. Execution Model

Each implementation task should have:

- one bounded objective;
- known dependencies;
- explicit acceptance criteria;
- explicit out-of-scope items where useful;
- required tests or verification.

Before implementing a task, the coding agent must read:

1. `AGENTS.md`;
2. `docs/PROJECT.md`;
3. relevant ADRs;
4. relevant instructions;
5. the task definition;
6. the smallest useful neighboring code context.

Agents must not implement later roadmap tasks opportunistically.

---

# 4. Current UI-First Execution Plan

## Status and authority

This section is the authoritative execution order for unfinished V1 work. The
existing application's unreconciled visual design is not a general approval
target. Existing UI may be inspected for functional behavior, product
requirements, data contracts, security boundaries, and reusable logic; it does
not dictate future presentation. The execution order remains: approve a
minimal MVP visual direction, approve public pages with deterministic fixtures,
approve Admin pages with deterministic fixtures, connect approved pages to
backend capabilities one at a time, complete production workflows, and finally
perform release verification.

The detailed task record below is retained as historical context and evidence
of completed/ready infrastructure. It is **not** permission to resume an
unfinished task out of the sequence in this section. Completed and
`READY_FOR_REVIEW` work is preserved without changing its status; it may be
used only through its existing public-safe/module boundaries.

### Strict page approval gate

For every page task below, implement only that page with deterministic fixtures;
run focused tests plus relevant lint, typecheck, and build verification; obtain
independent code review; provide local-preview instructions; and stop at
`READY_FOR_REVIEW`. Do not start the next page or mark the task `DONE` until the
product owner manually approves mobile and desktop layouts, RTL correctness,
typography/spacing, main interactions, loading/empty/error states, and overall
visual consistency. Passing tests alone does not complete a page.

### Routes discovered at restructuring time

| Surface                             | Implemented route           | Planning status                                                                                                                                                                       |
| ----------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public catalog/home                 | `/`                         | Fixture-backed homepage with approved Hero/Header, search/category controls, responsive gallery, URL pagination, and preview interactions; not a database-backed catalog integration. |
| Public footage detail               | `/footage/[slug]`           | Fixture-backed Commerce detail composition exists; production detail query and backend-connected integration remain pending.                                                          |
| Public browse/search                | `/`                         | Homepage hero owns fixture-backed search and category filtering; no dedicated browse route.                                                                                           |
| Customer authentication             | `/login`, `/login/continue` | Minimal fixture-backed phone/OTP presentation; `/session` compatibility routes redirect to the public login routes.                                                                   |
| Customer library, checkout, invoice | No routes                   | Planned product surfaces; dependent backend workflows are not implemented.                                                                                                            |
| Admin footage catalog               | `/admin/footage`            | Implemented operational surface.                                                                                                                                                      |
| Admin footage editor                | `/admin/footage/[id]/edit`  | Implemented operational surface.                                                                                                                                                      |
| Other Admin areas                   | No routes                   | Product requirements mention orders, payments/support, users, and blog, but their backend capability and routes are not yet implemented.                                              |

### Current homepage approval boundary

The implemented `/` surface is a deterministic fixture-backed homepage. The
approved scope includes the Hero and Header, homepage search and category
controls, the responsive footage gallery, URL-based pagination, footage preview
interactions, and Footage-module ownership of catalog preparation. These are
presentation approvals only; they do not authorize database-backed catalog
integration or future public pages.

The product owner visually approved the PUB-02S gallery/card refinement in the
project discussion. The available browser surface could not exercise the
requested 360px, 768px, 1280px, and 1920px viewport matrix, so that limitation
remains recorded in the PUB-02S handoff and QA audit. Unapproved page states,
future routes, and backend-connected variants remain subject to the page
approval gate below.

### Public UI status reconciliation

The statuses below distinguish implementation evidence from independent review
and product-owner approval. A passing build or commit is not treated as product
approval.

| Task           | Implemented scope and verification                                                                                                                                       | Independent review / approval evidence                                                                                                                                                                                                                                                        | Reconciled status  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `UI-DESIGN-01` | Visual direction, tokens, RTL rules, and review checklist are documented.                                                                                                | No task-specific product-owner approval record was supplied.                                                                                                                                                                                                                                  | `READY_FOR_REVIEW` |
| `UI-MOCK-01`   | Typed deterministic fixture boundary and focused fixture evidence exist.                                                                                                 | No task-specific product-owner approval record was supplied.                                                                                                                                                                                                                                  | `READY_FOR_REVIEW` |
| `PUB-01`       | Fixture-backed homepage shell, Hero/Header composition, states, and focused UI evidence exist.                                                                           | Product-owner approval of the Homepage Hero, Header, and Footage Gallery is recorded; viewport-matrix limitations remain documented.                                                                                                                                                          | `DONE`             |
| `PUB-02`       | Homepage search/category controls use fixture data and URL-owned state; focused tests pass.                                                                              | Homepage search/category behavior is included in the product-owner-approved public UI; release verification preserves URL state and interaction coverage.                                                                                                                                     | `DONE`             |
| `PUB-02R`      | Browse/search relocation into the homepage Hero is implemented; focused interaction tests and QA-05 smoke evidence exist.                                                | Homepage Hero/search relocation is included in the product-owner-approved public UI; release verification confirms the final composition and preserved URL behavior.                                                                                                                          | `DONE`             |
| `PUB-02S`      | Fixture-backed 12-item gallery, responsive grid, URL pagination, scroll behavior, and preview interaction are implemented and verified.                                  | QA-05 provides independent final review evidence; the product owner visually approved the gallery/card refinement in the project discussion. The viewport matrix remains unavailable.                                                                                                         | `DONE`             |
| `PUB-03`       | Fixture-backed Commerce detail composition, states, focused tests, and card links exist.                                                                                 | Product owner approved Commerce; release verification confirms the route, safe fixture states, invalid-slug handling, and absence of alternate detail variants.                                                                                                                               | `DONE`             |
| `PUB-04`       | Minimal fixture-backed customer phone/OTP presentation, continuation route, validation, resend/error states, safe return handling, and legacy redirects are implemented. | Product owner gave final approval for the Minimal design on 2026-10-31; `/login` and `/login/continue` are the approved routes, with no header/logo/navigation or alternate variants. Real OTP delivery, verification, and session creation remain deferred to AUTH-03, AUTH-04, and AUTH-05. | `DONE`             |

## UI fixture strategy

The first implementation task, `UI-MOCK-01`, establishes the only mock-data
approach authorized for the two UI phases:

- typed, deterministic fixture factories live beside the owning public or Admin
  UI module and use public view/DTO types where those types exist;
- route composition receives fixture-backed view models through a narrow local
  loader selected only by the UI-development boundary, never by a production
  database query or public API route;
- fixture sets include populated, empty, loading/pending, recoverable-error,
  and unavailable media/action cases; Persian content is realistic but
  contains no production records or credentials;
- mocks must not import Prisma, storage credentials, private object keys,
  payment secrets, or protected originals; they must be excluded from a normal
  production data path;
- a page's later integration task replaces its loader/adapter only, preserving
  the approved component contract and visual states. No mocking framework is
  authorized unless the first task establishes a concrete unmet need.

## Phase 0 — MVP Visual Direction

### UI-DESIGN-01 — Establish MVP Visual Direction

**Status:** READY_FOR_REVIEW

**Depends On:** UI-01, UI-02, AI-GOV-01.

**Objective:** Establish the small, coherent visual direction that governs the
fixture-based UI rebuild without altering product, architecture, data, or
security behavior.

**Scope:** Document [Pexels Videos](https://www.pexels.com/videos/) as the
primary Public reference for content-first video discovery patterns, and
[shadcn/ui](https://ui.shadcn.com/) as the primary Admin reference for standard
component and interaction patterns. Inspect existing foundations/contracts and
identify their visual decisions that need replacement. Define practical
typography, semantic color use, spacing, radius, containers, responsive rules,
Persian RTL conventions, Public discovery/card/navigation conventions, Admin
navigation/form/table/dialog/feedback conventions, shadcn reuse expectations,
and a page-by-page visual review record.

**Acceptance criteria:**

- explicitly records that the existing visual design is not approved, while
  retaining its functional and security contracts;
- defines a simple MVP direction: Public is Pexels-inspired but never copies
  branding, assets, or exact layouts; Admin follows standard shadcn/ui patterns;
- establishes one minimal, coherent token/convention set and identifies which
  existing visual foundations are superseded rather than creating a custom
  design system;
- preserves `fa`/RTL, mobile and desktop behavior, keyboard accessibility, and
  deliberate loading, empty, error, and unavailable states;
- documents shadcn primitive discovery/reuse through the existing component
  governance, without requiring Figma, Storybook, a preset change, or a new
  dependency;
- defines the local-preview and manual visual-approval checklist consumed by
  every `PUB-*` and `ADM-*` task.

**Verification requirements:** review the result against `PROJECT.md`, current
component contracts, and UI instructions; confirm no prohibited product feature
is introduced; run documentation formatting and `git diff --check`; receive
independent review and product-owner approval before `UI-MOCK-01` begins.

**Explicit exclusions:** UI/code implementation, Figma, Storybook, dependency
installation, a custom brand identity, a new design-system framework, copying
Pexels/shadcn assets/layouts, API/schema/authentication/business-rule changes.

## Phase 1 — Public UI with Mock Data

### UI-MOCK-01 — Establish Typed UI Fixture Boundary

**Status:** READY_FOR_REVIEW
**Depends On:** UI-DESIGN-01 approval, UI-01, UI-02.

**Scope / route:** Shared fixture and local-loader convention for planned
public and Admin UI routes; no production route or backend behavior changes.

**Components and mock data:** define deterministic Persian fixture factories
for published-footage cards/details, customer-session presentation, purchase
presentation, library/invoice presentation, and current Admin footage
views. Reuse the existing public component contracts and keep fixtures owned
by the closest feature module.

**Required states:** populated, empty, loading/pending, safe error, and media
unavailable where applicable. The task does not invent business outcomes.

**Responsive / RTL / accessibility:** fixture content must exercise long
Persian text, mixed LTR technical values, narrow layouts, and accessible
labels/status regions.

**Acceptance and verification:** document the loader boundary, prove fixture
determinism and type checking with focused tests, review that a production
route cannot silently select mock data, and obtain a manual visual check of
the representative fixture states.

**Explicit exclusions:** no new mocking dependency, database/schema/API change,
authentication bypass change, or product page implementation.

### Public rebuild conventions

Every `PUB-*` task below rebuilds presentation from the approved Phase 0
direction; it is not a polish pass over the existing UI. Use Pexels-inspired
content-first browsing patterns—prominent video imagery, clear discovery,
simple navigation, practical search/filter controls, low visual clutter, and
responsive grids—without copying Pexels branding, assets, exact layout, or
unsupported product features. The Vidora single-item Buy Now model, published
catalog rules, and all authorization/media constraints remain unchanged.

---

### PUB-01 — Public Shell and Home Presentation

**Status:** DONE
**Depends On:** UI-MOCK-01.

**Scope / route:** Complete the public page composition at `/` using fixtures.
It is the planned home/catalog entry surface, not permission to add marketing
features absent from `PROJECT.md`.

**Components and mock data:** compose the approved layout, navigation/footer
only to the extent supported by existing destinations, and existing
`PublicFootageListView`/`FootageCard` contracts with populated and empty
catalog fixtures.

**Pexels-inspired presentation:** content-led landing/catalog hierarchy,
prominent cover-driven video cards, simple navigation, and a responsive
discovery grid with restrained visual chrome.

**Required states:** initial/populated, no published results, route-level
loading, recoverable error, and unavailable cover/preview presentation.

**Responsive / RTL / accessibility:** mobile and desktop containers, logical
spacing, keyboard navigation, semantic landmarks, Persian labels, and safe
mixed-script prices/technical text.

**Acceptance and verification:** the full page follows design tokens and
contracts, uses no live database dependency, has focused render/accessibility
tests, receives independent review, and receives recorded desktop/mobile visual
approval.

**Explicit exclusions:** search/filter semantics, detail query, autoplay,
commerce, and new public destinations without product support.

---

### PUB-02 — Browse, Search, and Filter UI

**Status:** READY_FOR_REVIEW
**Depends On:** PUB-01.

**Scope / route:** Add the planned public catalog browse/search surface inside
the homepage hero at `/`, using URL-owned `q` and `category` parameters; no
dedicated browse route or backend catalog query is introduced.

**Components and mock data:** compose the homepage
`HomepageSearchControls`, existing result list/card components, and URL-state
presentation with fixture-supplied approved options and results. Only
category/tag/technical filters that the later catalog boundary can support may
be visually represented.

**Pexels-inspired presentation:** prominent practical search, clear result
context, compact progressive filters, and uncluttered responsive discovery;
only approved Vidora filters and URL state are shown.

**Required states:** query results, no matches, initial catalog, invalid/empty
URL state, loading navigation, and recoverable query error.

**Responsive / RTL / accessibility:** desktop/mobile controls submit identical
GET state, use real fields/buttons, preserve keyboard operation and Persian
mixed-script readability.

**Acceptance and verification:** URL state is shareable and fixture-only,
desktop/mobile behavior is equivalent, focused component/route tests pass,
independent review passes, and visual approval covers narrow and wide screens.

**Explicit exclusions:** relevance algorithm, autocomplete, unapproved sort or
filter, external search service, and database search implementation.

`PUB-02R` records the approved relocation of this fixture-backed interaction
into the homepage hero and the removal of the dedicated browse route.

PUB-02R verification includes a narrow RTL browser check of the unified control
and focused submit/category/clear interaction tests. Product-owner visual approval
of the final homepage is recorded in the release reconciliation above.

---

### PUB-02R — Relocate browse/search interaction into homepage hero

**Status:** DONE
**Depends On:** PUB-02.

**Scope:** Retain the fixture-backed browse/search interaction inside the
homepage Hero, remove the dedicated browse route from the UI-first plan, and
preserve URL-owned query/category state.

**Evidence:** The relocation is implemented and covered by focused interaction
tests, the QA-05 browser smoke check, and final release verification. The
product owner approved the resulting homepage composition.

---

### PUB-02S — Homepage Footage Gallery

**Status:** DONE
**Depends On:** PUB-01, PUB-02R.

**Scope / route:** Refine the homepage footage listing at `/` with a fixture-backed
12-item page, responsive 2/3/4-column grid, URL-aware pagination, and scroll-to-
gallery behavior. Preserve the approved Hero, Header, search, category, and
existing `#footage-listing` anchor.

**Components and mock data:** reuse `PublicFootageListView` and `FootageCard`;
add accessible pagination and narrow client-side preview interaction only where
needed. Expand typed public fixtures to at least 24 varied items with stable
Unsplash thumbnails and reachable, lightweight MP4 preview sources.

**Required states:** populated, empty, filtered no-match, invalid/clamped page,
partial final page, unavailable media, preview playback failure, and pagination
boundaries.

**Responsive / RTL / accessibility:** use a cinematic 16:9 thumbnail, 2/3/4
columns at mobile/tablet/desktop, keyboard-accessible links and pagination,
muted desktop hover previews after a short delay, touch long-press previews,
reduced-motion fallback, and no horizontal overflow.

**Acceptance and verification:** exactly 12 items per page when available;
filters and search reset pagination; query state is shareable and Back/Forward
safe; page changes scroll to the gallery section without obscuring its heading;
only an intentional active preview loads/plays at a time; focused tests, lint,
typecheck, build, diff checks, independent review, and desktop/mobile visual
approval are recorded. The product-owner visual approval is recorded in the
project discussion; the unavailable viewport matrix remains a documented
verification limitation rather than an unsupported claim of coverage.

**Explicit exclusions:** detail-route work, Hero/Header redesign, backend/API or
database changes, purchasing/authentication, infinite scroll, media processing,
and a component-folder architecture refactor.

---

### PUB-03 — Footage Detail UI

**Status:** DONE
**Depends On:** PUB-01.

**Scope / route:** Build the `/footage/[slug]` composition against a
fixture-backed public detail view model. The route is implemented as the
approved Commerce detail surface; it is not a production catalog integration.

**Components and mock data:** compose primary cover, `VideoPreview`, metadata,
category/tags, available-quality presentation, and `BuyNowArea` using ready,
unavailable, and invalid-slug fixture data. No private original data enters the
view model.

**Pexels-inspired presentation:** video-first media hierarchy, clear metadata
and purchase decision area, and a focused detail layout rather than a copied
reference-page layout.

**Required states:** detail ready, preview unavailable/error, loading,
not-found-safe presentation, and Buy Now anonymous/authenticated/unknown UI
states.

**Responsive / RTL / accessibility:** preserve video pixels, use native media
controls, support keyboard actions and focus, and avoid overflow with Persian
and LTR technical values.

**Acceptance and verification:** detail behavior follows the approved component
contract, has focused rendering/state tests, release verification, and recorded
product-owner approval of the Commerce layout. Exact viewport-matrix coverage
remains unavailable and is documented as a limitation.

**Design finalization:** The product owner approved the Commerce layout. Cinema
and Editorial are not implemented detail variants and are not part of the
approved public UI.

**Explicit exclusions:** slug/database resolution, real preview requests,
order creation, payment, entitlement, or original download.

---

### PUB-04 — Customer Authentication and Continuation UI

**Status:** DONE
**Depends On:** PUB-03, UI-MOCK-01.

**Scope / route:** Complete the customer-facing OTP/session presentation at
`/login` and `/login/continue`. The legacy `/session` and
`/session/continue` paths remain compatibility redirects only.

**Components and mock data:** fixture-backed phone/OTP step presentation,
continuation status, validation, resend/pending/error states, and a validated
internal return destination from detail.

**Pexels-inspired presentation:** a deliberately simple, distraction-free
customer continuation surface; it does not add social login or user-community
behavior.

**Required states:** phone entry, OTP entry, pending, cooldown/rate-limit-safe
message, invalid/expired code, session restored, and generic safe failure.

**Responsive / RTL / accessibility:** labelled native controls, input mode
appropriate to a phone/code, logical layout, error announcements, keyboard
flow, and Persian digits/text where designed.

**Acceptance and verification:** no OTP value or internal error is rendered,
continuation only represents a safe internal destination, focused tests pass,
independent review passes, and visual approval is recorded.

**PUB-04B finalization note:** The product-owner-approved Minimal design is the
only customer login presentation. It has no shared public header, logo,
navigation, or temporary variant selector. The `/login` UI preserves the
fixture-backed phone/OTP interactions: Persian/Arabic digit normalization,
phone validation, simulated request loading/failure, six-digit OTP validation,
simulated verification loading/failure, resend cooldown, phone editing, safe
internal return destinations, and explicit simulated success messaging. It does
not request an OTP, verify a code, or create a real session; connecting this UI
to the existing server OTP contracts remains a later integration boundary.

**PUB-04C final approval record (2026-10-31):** The product owner approved the
Minimal design as final. `/login` is the customer-facing entry route and
`/login/continue` is the continuation route. Legacy `/session` and
`/session/continue` remain compatibility redirects without redirect loops. The
customer interactions remain fixture-backed: they do not deliver or verify a
real OTP and do not create an authenticated session. Real OTP request/provider
integration, OTP verification, session creation, and customer/Admin boundary
integration remain deferred to `AUTH-03`, `AUTH-04`, and `AUTH-05`.

**Explicit exclusions:** changing OTP policy, API behavior, cookies, account
recovery, or enabling the development bypass for customer flows.

---

### PUB-05 — Buy Now and Payment Journey UI

**Status:** DONE
**Depends On:** PUB-03, PUB-04.

**Scope / route:** Fixture-only purchase handoff, pending/return, and result
presentations for the single-footage Buy Now journey; real checkout and callback
routes are planned later.

**Components and mock data:** use `BuyNowArea` plus route-level confirmation,
pending, failed, and verified-success view models with an authoritative
fixture price and footage snapshot.

**Pexels-inspired presentation:** clear single-item purchase handoff and status
hierarchy with minimal clutter; it remains Vidora Buy Now, not a cart or
subscription flow.

**Required states:** anonymous handoff, authenticated idle/pending, provider
return pending verification, declined/failed payment, verified completion, and
safe generic error.

**Responsive / RTL / accessibility:** explicit action buttons, disabled/pending
semantics, status announcements, no optimistic financial-success claim, and
readable Toman formatting.

**Acceptance and verification:** browser input cannot define displayed
authoritative fixture price, all states are visually approved, focused tests
and independent review pass.

**Explicit exclusions:** order/payment persistence, provider selection,
callback verification, entitlement, invoice generation, cart, discounts, or
subscriptions.

**Final fixture UI approval:** The product owner approved Commerce as the final
purchase presentation. It is available at `/purchase/[slug]` for a single
footage item, with two independent order/payment cards, the corrected Alert
layout, and no variant selector or comparison controls. Buy Now preserves the
footage destination through `/login?returnTo=...`; the fixture continuation uses
the `customer=authenticated` marker only for deterministic UI review. Optional
`state=review|initiating|init-failed|pending|returned|verification-pending|verification-failed|failure|success`
values cover the preserved fixture state presentations. Invalid or unavailable
footage is rejected safely, and prices come from the server-selected fixture.
Real authentication/session state, orders, payments, invoices, entitlements,
and protected downloads remain future integration dependencies.

---

### PUB-06 — Customer Library, Downloads, and Invoice UI

**Status:** TODO
**Depends On:** PUB-04, PUB-05.

**Scope / route:** Planned authenticated library, purchase detail/download, and
invoice presentation routes using fixtures; no corresponding routes currently
exist.

**Components and mock data:** purchased-footage list, empty library, download
variant affordances, invoice summary/render presentation, and support-safe
masked phone fixture data.

**Pexels-inspired presentation:** media-led purchased-item list and direct,
readable file/invoice actions; no social collections, recommendations, or new
download policy is implied.

**Required states:** populated/empty library, loading, unauthenticated access
presentation, unavailable file, download-request pending/denied/success
presentation, invoice available/not-found-safe/error.

**Responsive / RTL / accessibility:** semantic lists/tables where appropriate,
accessible download/invoice controls, logical layout, and LTR isolation only
for technical references.

**Acceptance and verification:** no object key/signed URL/private file is in a
fixture or DOM, no UI implies entitlement without server confirmation, focused
tests, independent review, and mobile/desktop visual approval are complete.

**Explicit exclusions:** protected download authorization, download history,
legal invoice fields, or backend purchase lookup.

---

### PUB-07 — Public Blog and SEO Presentation UI

**Status:** TODO
**Depends On:** PUB-01, UI-MOCK-01.

**Scope / route:** Planned public blog index/detail and metadata presentation;
no public blog route or blog backend currently exists.

**Components and mock data:** fixture-backed post cards/index/detail with safe
Markdown presentation boundary, empty/loading/error states, and documented
metadata examples.

**Pexels-inspired presentation:** content-first article discovery and a quiet,
readable article view; it does not add contributor/community capabilities.

**Required states:** published list/detail, empty list, missing post, loading,
and safe content-rendering failure.

**Responsive / RTL / accessibility:** readable Persian long-form typography,
heading hierarchy, semantic article structure, keyboard navigation, and mobile
reading width.

**Acceptance and verification:** no unpublished fixture is presented as public,
focused tests/review pass, and visual approval is recorded.

**Explicit exclusions:** schema, Markdown parser/dependency, Admin editor,
sitemap/robots implementation, and claims about final SEO indexing behavior.

## Phase 2 — Admin UI with Mock Data

### ADM-01 — Admin Footage Catalog UI Completion

**Status:** TODO
**Depends On:** UI-MOCK-01, UI-WORKFLOW-VALIDATION-02.

**Scope / route:** Refine the existing `/admin/footage` operational interface
using Admin catalog fixtures while preserving the CAT-04 server behavior.

**Components and mock data:** current catalog/table/list, draft/published
status, search/pagination presentation, create/edit entry points, and fixtures
for populated, empty, filtered, multi-page, loading, denied, and safe-error
states.

**shadcn/ui presentation:** rebuild the catalog as an operational Admin
surface using standard navigation, table/list, filter, status, action, dialog,
and feedback patterns; existing Admin styling is not a visual baseline.

**Forms, responsive, accessibility:** use approved controls/tables, compact
desktop operation plus usable narrow layouts, Persian RTL, labelled filters,
keyboard access, and non-color-only status.

**Acceptance and verification:** UI uses no live DB in its fixture mode,
preserves authorization boundaries, has focused UI tests, independent review,
and recorded visual approval.

**Explicit exclusions:** bulk management, analytics, new role model, backend
catalog query/mutation changes, or production data changes.

---

### ADM-02 — Admin Footage Editor and Media UI Completion

**Status:** TODO
**Depends On:** ADM-01, MEDIA-COVER-02, UI-WORKFLOW-VALIDATION-02.

**Scope / route:** Refine the existing `/admin/footage/[id]/edit` editor
against fixtures while preserving metadata, preview, cover, original-variant,
publication, and direct-upload boundaries already implemented.

**Components and mock data:** metadata form, category/tag selection, cover crop
and replacement presentation, preview/original sections, publication status,
and deterministic validation/upload/pending/failure fixtures.

**shadcn/ui presentation:** rebuild the editor with practical grouped forms,
field validation, cards/sections, confirmations where an existing action
requires them, and standard feedback states; preserve every current security
and media boundary.

**Forms, responsive, accessibility:** explicit labels/validation summaries,
keyboard-operable upload/crop controls, mobile-safe sections, Persian RTL, and
no silent destructive replacement claim.

**Acceptance and verification:** correct fixture states render without storage,
no credentials/object keys are rendered, focused tests/review pass, and visual
approval covers the editor's major states.

**Explicit exclusions:** media schema/storage/API changes, automatic cleanup,
new Admin roles, and changes to actual authorization or publication rules.

---

### ADM-03 — Admin Order and Payment Support UI

**Status:** TODO
**Depends On:** ADM-02.

**Scope / route:** Build the planned Admin order/payment support lookup page
with fixtures. No route currently exists; its route stays planned until the
order/payment modules provide its owning backend contract.

**Components and mock data:** order/payment table, support-safe detail panel,
status/reference display, and deterministic populated, empty, loading, denied,
not-found, and safe-error fixtures. Pagination and filters appear only if the
future owning contract supports them.

**shadcn/ui presentation:** standard operational navigation, table/list,
detail, status, dialog, and feedback patterns without treating existing Admin
styling as approved.

**Responsive, RTL, accessibility:** operational desktop clarity, usable narrow
views, semantic tables/forms, Persian labels, and keyboard interaction.

**Acceptance and verification:** the page identifies its missing backend
dependency, exposes no provider secrets or private payment data, has focused
fixture tests, independent review, local-preview instructions, and recorded
visual approval before `ADM-04` begins.

**Explicit exclusions:** order/payment implementation, provider integration,
refund policy, generic RBAC, or an Admin API solely for a mock screen.

---

### ADM-04 — Admin User Support Lookup UI

**Status:** TODO
**Depends On:** ADM-03.

**Scope / route:** Build the planned Admin customer-support lookup page with
fixtures. No route or owning backend capability currently exists.

**Components and mock data:** fixture-backed lookup form, result list/detail,
masked customer identifiers, empty/loading/not-found/denied/error states, and
only fields the future support contract can safely expose.

**shadcn/ui presentation:** standard labelled search/form, table/list/detail,
empty state, and feedback patterns; existing Admin appearance is not a visual
baseline.

**Responsive, RTL, accessibility:** mobile-safe operational layout, semantic
form/list structure, keyboard operation, Persian labels, logical spacing, and
smallest-element LTR isolation for technical identifiers.

**Acceptance and verification:** no fixture treats an invoice number alone as
ownership proof, no sensitive data is unnecessarily shown, focused tests,
independent review, local-preview instructions, and visual approval are
complete before `ADM-05` begins.

**Explicit exclusions:** user-account management, phone changes, Admin roles,
customer data API/schema changes, or a new support policy.

---

### ADM-05 — Admin Blog Management UI

**Status:** TODO
**Depends On:** ADM-04.

**Scope / route:** Build planned Admin blog list/edit presentation with
fixtures. No Admin blog route or persistence capability currently exists.

**Components and mock data:** post list, draft/published status, metadata form,
safe content-editing presentation, validation, empty/loading/error states, and
deterministic Persian post fixtures.

**shadcn/ui presentation:** standard operational table/list, grouped form,
validation, confirmation, and feedback patterns; it is a presentation rebuild,
not a visual extension of the current Admin UI.

**Responsive, RTL, accessibility:** keyboard-operable controls, labelled form
fields, semantic status feedback, mobile-safe content editing, and Persian RTL
long-form text behavior.

**Acceptance and verification:** the UI neither claims a rich-text framework nor
publishes fixture content, includes focused fixture tests, independent review,
local-preview instructions, and recorded visual approval.

**Explicit exclusions:** blog schema/API, Markdown parser/editor dependency,
publication persistence, SEO generation, or a new Admin authorization model.

## Phase 3 — Incremental Backend Integration

Integration starts only after the relevant UI task is approved. Each task keeps
the approved page contract, replaces fixtures through a server-side module
adapter, preserves loading/empty/error behavior, and adds integration tests.

| Task                                                | Depends on approved UI | Existing/relevant backend contract                                        | Integration scope                                                                                                          |
| --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| STORE-01                                            | PUB-01                 | `listPublishedFootage` and public catalog store                           | Replace home fixtures with published, cover-safe catalog data; retain empty/error states.                                  |
| SEARCH-01                                           | PUB-02, STORE-01       | PostgreSQL/catalog module (to be implemented)                             | Add Persian-safe server query and URL parsing without an external search service.                                          |
| SEARCH-02                                           | PUB-02, SEARCH-01      | Catalog metadata/query contract                                           | Add only approved filters and deterministic pagination/order.                                                              |
| STORE-02                                            | PUB-03, SEARCH-02      | Public slug/detail DTO (to be implemented), existing preview/cover routes | Resolve only published footage and map safe detail/preview data.                                                           |
| COM-02                                              | PUB-05, COM-01         | Future order module                                                       | Replace fixture Buy Now start with server-authoritative single-item order creation.                                        |
| PAY-01 through PAY-03                               | PUB-05, COM-02         | Payment/order modules                                                     | Connect provider initiation, verified callback, and idempotent completion; fixture success never substitutes verification. |
| LIB-01, DL-01, DL-02, INV-01, INV-02                | PUB-06, PAY-03         | Future entitlement/download/invoice modules and media storage boundary    | Integrate customer-scoped data, signed original access after authorization, download history, and historical invoice data. |
| BLOG-01, BLOG-02, SEO-01                            | PUB-07, ADM-05         | Future blog module                                                        | Build Admin/blog persistence, replace approved public/Admin fixtures, then add technical SEO only for real public routes.  |
| CAT-04 / CAT-03 / MEDIA-COVER-02 integration checks | ADM-01 / ADM-02        | Existing Admin module and media boundaries                                | Remove fixture loader only after live behavior preserves approved UI and authorization.                                    |

`COM-01` remains a prerequisite for real commerce integration and now has a
specific recorded product convention in `PROJECT.md`: integer Toman storage and
display, with any provider conversion isolated at its boundary. Its task should
verify/document the provider-facing conversion rather than reopen the product
decision.

## Phase 4 — Authentication, Authorization, and Remaining Production Workflows

After page integrations, retain and sequence the existing work as follows:

1. Complete `AUTH-03` through `AUTH-05` verification against the real customer
   and separate Admin OTP/session flows; implement the approved customer UI
   continuation boundary from `PUB-04` without changing OTP policy.
2. Explicitly disable development authentication bypass for normal end-to-end
   verification; test customer/Admin route and mutation denial paths, including
   a customer attempting Admin access.
3. Complete commerce and entitlement tasks `COM-02`, `PAY-01`–`PAY-03`,
   `LIB-01`, `DL-01`–`DL-02`, and `INV-01`–`INV-02` in the Phase 3 order.
   Negative-path tests must cover price tampering, callback-without-verification,
   repeat completion, and non-purchaser original download denial.
4. Complete `BLOG-01` and its supporting Admin/blog UI only after the public
   blog UI contract is approved.

## Phase 5 — Final Verification and Release

After all integration tasks are approved, execute `PROD-01` through `PROD-05`:
critical security review; Playwright coverage of customer OTP, browse/detail,
verified purchase/library/download, Admin create/publish, and invoice retrieval;
responsive/accessibility checks; performance and real database/storage checks;
payment/provider and production-environment validation; backup/recovery; and
business-owner launch approval. Development bypass must be off for release
verification.

## Preservation and dependency map

| Existing work                                                                                 | Preserved status / revised role                                                                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| FND-01, FND-03, UI-02                                                                         | `DONE`; technical, behavioral, accessibility, and RTL contracts constrain UI work; their existing visual appearance does not.               |
| FND-02, AI-GOV-01, FND-04, FND-05                                                             | `READY_FOR_REVIEW`; retained infrastructure/governance prerequisites, not UI work to be silently changed.                                   |
| DEV-ENV-01                                                                                    | `IN_PROGRESS`; bypass/resource policy exists, but isolated `vidora_preview` provisioning and storage-isolation evidence is not established. |
| DATA-01, DATA-02, AUTH-01–AUTH-05, CAT-01–CAT-04, MEDIA-01–MEDIA-05, MEDIA-COVER-01–02, UI-01 | `READY_FOR_REVIEW`; retained module work used later through existing boundaries. UI-01 visual prescriptions are superseded by UI-DESIGN-01. |
| STORE-01, STORE-02, SEARCH-01, SEARCH-02                                                      | Retained IDs; their executable scope is the Phase 3 page integration listed above, after `PUB-*` approval.                                  |
| COM-01–02, PAY-01–03, LIB-01, DL-01–02, INV-01–02, BLOG-01–02, SEO-01                         | Retained IDs; sequenced after the associated approved UI and prerequisite modules.                                                          |
| PROD-01–05                                                                                    | Retained IDs; final phase only.                                                                                                             |
| UI-WORKFLOW-VALIDATION-02                                                                     | Retained local uncommitted roadmap task; Admin UI tasks depend on it and it is not rewritten or marked complete.                            |

## Remaining product decisions

- Selected payment provider and provider-facing monetary conversion details.
- Final legal invoice/tax fields and final license/terms wording.
- Entitlement behavior for files added after an earlier purchase.
- Final public filter set and canonical browse route/URL schema.
- Account recovery/phone-change behavior, refund eligibility, and download
  limits remain undefined and must not be invented.
- Image/media retention and cleanup policy remain unresolved.
- Image delivery policy (`next/image` versus direct image sources) remains
  unresolved; the existing raw-image lint warnings remain tracked.
- Admin Cover Editor and Upload Panel lifecycle-hook extraction remains deferred
  until workflow-level regression coverage justifies crossing the canvas and
  object-storage boundaries.
- Browser viewport verification remains limited by the available browser
  surface; this is not an automatic blocker for `PUB-03`.

The UI-first sequence has now advanced through the approved fixture-backed
homepage, homepage refinement, and Commerce detail work. **Next planned
public-facing implementation task:** `PUB-04 — Customer Authentication and
Continuation UI`. Production data integration, checkout, payment, entitlement,
and protected media delivery remain separate work.

## Quality work reconciliation — VIDORA-QA-01 through QA-06

The completed quality work is historical support for the product sequence, not
a new set of roadmap implementation tasks. See the consolidated audit
[`docs/audits/VIDORA-QA-01.md`](audits/VIDORA-QA-01.md) and reference commit
`775e073` for the recorded evidence.

- QA-01: architecture, module-boundary, and image-policy audit.
- QA-01S: named event-handler and custom-hook standards.
- QA-02: Footage Card preview architecture and focused interaction coverage.
- QA-03: component-owned naming, JSDoc, and preview-test cleanup.
- QA-04: typography-alias removal and architecture cleanup.
- QA-05: final review, including the homepage smoke evidence and documented
  viewport/image-policy limitations.
- QA-06: local commit consolidation in `775e073`.

These follow-ups remain documented rather than becoming redundant product tasks:
raw-image warnings/image delivery policy, deferred Admin Cover Editor and Upload
Panel hook extraction, and unavailable viewport-matrix verification.

## Roadmap status audit — baseline `17500a1`

Audit date: 2026-10-30. The baseline commit contains the legitimate
implementation, tests, governance, UI workflow, and documentation changes
present in the worktree. The required verification evidence is:

- `pnpm format:check` — passed;
- `pnpm lint` — passed with three existing `@next/next/no-img-element` warnings;
- `pnpm typecheck` — passed;
- `pnpm test` — 34 files and 302 tests passed;
- `pnpm build` — passed;
- `git diff --check` — passed.

No independent review report, product-owner visual approval, or task-specific
approval record was found in the repository. Therefore implementation evidence
does not by itself promote a task from `READY_FOR_REVIEW` to `DONE`.

| Task ID                   | Previous         | New              | Repository evidence                                                                                                          | Status decision                                                                        |
| ------------------------- | ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FND-02                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Governance files and repository rules exist.                                                                                 | Keep: no independent approval evidence.                                                |
| AI-GOV-01                 | READY_FOR_REVIEW | READY_FOR_REVIEW | Component-discovery governance and reviewer skill changes exist.                                                             | Keep: no independent approval evidence.                                                |
| UI-WORKFLOW-VALIDATION-02 | READY_FOR_REVIEW | READY_FOR_REVIEW | Admin editor decomposition, primitives, and focused tests exist.                                                             | Keep: required independent workflow review is not recorded.                            |
| FND-04                    | READY_FOR_REVIEW | READY_FOR_REVIEW | CI workflow and quality commands exist.                                                                                      | Keep: no independent approval evidence.                                                |
| FND-05                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Typed server/client environment schema and example exist.                                                                    | Keep: no independent approval evidence.                                                |
| DEV-ENV-01                | READY_FOR_REVIEW | IN_PROGRESS      | Development bypass/resource policy exists; no verifiable isolated `vidora_preview` provisioning or storage-isolation record. | Downgrade: acceptance criteria are partially evidenced, not merely awaiting review.    |
| DATA-01                   | READY_FOR_REVIEW | READY_FOR_REVIEW | Prisma/PostgreSQL configuration and tests exist.                                                                             | Keep: no independent approval evidence.                                                |
| DATA-02                   | READY_FOR_REVIEW | READY_FOR_REVIEW | Core schema/migrations and persistence tests exist.                                                                          | Keep: no independent approval evidence.                                                |
| AUTH-01                   | READY_FOR_REVIEW | READY_FOR_REVIEW | Better Auth rejection and selected application-owned approach are documented.                                                | Keep: no independent approval evidence.                                                |
| AUTH-02                   | READY_FOR_REVIEW | READY_FOR_REVIEW | Iranian phone normalization implementation and tests exist.                                                                  | Keep: no independent approval evidence.                                                |
| AUTH-03                   | READY_FOR_REVIEW | READY_FOR_REVIEW | OTP request/provider/rate-policy implementation and tests exist.                                                             | Keep: no independent approval evidence.                                                |
| AUTH-04                   | READY_FOR_REVIEW | READY_FOR_REVIEW | OTP verification/session implementation and tests exist.                                                                     | Keep: no independent approval evidence.                                                |
| AUTH-05                   | READY_FOR_REVIEW | READY_FOR_REVIEW | Separate customer/Admin authorization and boundary tests exist.                                                              | Keep: no independent approval evidence.                                                |
| CAT-01                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Footage schema, mutations, and tests exist.                                                                                  | Keep: no independent approval evidence.                                                |
| CAT-02                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Category/tag schema and classification tests exist.                                                                          | Keep: no independent approval evidence.                                                |
| CAT-03                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Admin Footage CRUD mutations, authorization, and tests exist.                                                                | Keep: no independent approval evidence.                                                |
| CAT-04                    | READY_FOR_REVIEW | READY_FOR_REVIEW | Admin catalog route/module, search/pagination behavior, and tests exist.                                                     | Keep: no independent approval evidence.                                                |
| MEDIA-01                  | READY_FOR_REVIEW | READY_FOR_REVIEW | Footage file model and schema tests exist.                                                                                   | Keep: no independent approval evidence.                                                |
| MEDIA-02                  | READY_FOR_REVIEW | READY_FOR_REVIEW | S3-compatible storage boundary and tests exist.                                                                              | Keep: no independent approval evidence.                                                |
| MEDIA-03                  | READY_FOR_REVIEW | READY_FOR_REVIEW | Direct multipart upload flow, authorization, and tests exist.                                                                | Keep: no independent approval evidence.                                                |
| MEDIA-04                  | READY_FOR_REVIEW | READY_FOR_REVIEW | Preview management/delivery and tests exist.                                                                                 | Keep: no independent approval evidence.                                                |
| MEDIA-05                  | READY_FOR_REVIEW | READY_FOR_REVIEW | Original variant management and tests exist.                                                                                 | Keep: no independent approval evidence.                                                |
| MEDIA-COVER-01            | READY_FOR_REVIEW | READY_FOR_REVIEW | Cover contract and media policy are documented.                                                                              | Keep: no independent approval evidence.                                                |
| MEDIA-COVER-02            | READY_FOR_REVIEW | READY_FOR_REVIEW | Cover crop route, storage, UI, and focused tests exist.                                                                      | Keep: no independent approval evidence.                                                |
| UI-01                     | READY_FOR_REVIEW | READY_FOR_REVIEW | Design foundations, tokens, and RTL documentation/tests exist.                                                               | Keep: visual direction is now superseded pending `UI-DESIGN-01`; no approval evidence. |

`FND-01`, `FND-03`, and `UI-02` remain `DONE` unchanged. All `TODO` tasks
remain `TODO`; no missing product feature was implemented or promoted by this
audit.

---

# 5. Historical Detailed Task Record and Completed-Work Context

The retained detailed records below preserve task history, acceptance context,
and the existing uncommitted `UI-WORKFLOW-VALIDATION-02`/`DEV-ENV-01` entries.
For unfinished tasks, the UI-first order and scope mapping in section 4 takes
precedence where an older dependency or objective conflicts.

# Historical Phase 0 — Foundation & Governance

Goal:

> Establish the repository, architecture guardrails, AI workflow, and minimum CI before product features are implemented.

---

## FND-01 — Bootstrap Next.js Application

**Status:** DONE

### Depends On

None.

### Objective

Create the initial production-oriented Next.js application using the architecture approved by ADR-0001.

### Requirements

- Next.js App Router;
- TypeScript strict mode;
- pnpm;
- current approved stable dependency versions;
- ESLint;
- formatting;
- Tailwind CSS;
- shadcn/ui foundation;
- no unnecessary starter/demo content;
- no Docker requirement for local development.

### Acceptance Criteria

- application starts locally;
- production build succeeds;
- TypeScript strict mode is enabled;
- lint succeeds;
- formatting check succeeds;
- initial directory structure follows the modular-monolith direction;
- no product feature is implemented yet.

### Out of Scope

- authentication;
- database schema;
- footage UI;
- payment;
- media upload.

---

## FND-02 — Install Canonical Project Governance

**Status:** READY_FOR_REVIEW

### Depends On

FND-01.

### Objective

Install the project's canonical engineering and AI-agent governance structure.

### Required Structure

```text
AGENTS.md

docs/
  PROJECT.md
  ROADMAP.md
  adr/

instructions/

.agents/
  skills/

.cursor/
.codex/
```

### Acceptance Criteria

- `AGENTS.md` identifies canonical project sources;
- AI agents are required to read relevant project documentation before implementation;
- ambiguity stop-rule is documented;
- tool-specific AI configuration does not duplicate or contradict canonical rules;
- architecture changes require explicit approval;
- agents are forbidden from weakening tests to make verification pass.

---

## AI-GOV-01 — Enforce UI Component Discovery and Reuse

**Status:** READY_FOR_REVIEW

### Depends On

FND-02.

### Objective

Require AI-assisted UI work to discover, evaluate, and reuse existing feature,
application, and shadcn components before introducing new UI.

### Acceptance Criteria

- component instructions require mandatory discovery of relevant feature,
  application, and installed shadcn components before UI implementation;
- component ownership follows reuse, composition, approved primitive addition,
  then new-component creation only when justified;
- UI implementation workflow records a concise reuse plan before coding and
  includes the required `Component Reuse Plan` in the completion report;
- approval is required only for the defined broad-impact UI triggers;
- review workflow checks reuse, shadcn composition, component boundaries,
  accessibility, RTL, responsive behavior, and interaction requirements;
- no application code, dependency, or speculative shared abstraction is added.

### Out of Scope

- refactoring existing application UI;
- changing the shadcn preset or installed primitives;
- changing application behavior, dependencies, or tests.

---

## UI-WORKFLOW-VALIDATION-02 — Validate Controlled Admin Footage Editor UI Workflow

**Status:** READY_FOR_REVIEW

### Depends On

AI-GOV-03 approval, and an auditable baseline of the Admin Footage Editor.

### Objective

Run one controlled implementation experiment against the Admin Footage Editor to
verify that the approved UI-governance workflow leads an implementation agent to
independently discover existing components, evaluate appropriate shadcn
primitives, and make documented reuse decisions while preserving current editor
behavior.

### Scope

- establish the experiment baseline by identifying the exact committed editor
  state and the approved AI-GOV-03 governance state before implementation;
- inspect the smallest relevant existing Admin Footage Editor, application UI,
  installed primitives, `components.json`, and current shadcn documentation;
- prepare a `Component Reuse Plan` before changing UI code, including auditable
  control-pattern decisions and any justified native-HTML decisions;
- make the smallest coherent Admin Footage Editor UI change necessary to test
  the workflow, preserving its existing functional behavior and security
  boundaries;
- evaluate suitable shadcn primitives independently. Add a missing primitive
  only when it is justified by the plan; semantic native HTML remains permitted
  when it is the correct choice;
- have an independent reviewer compare the plan and its stated decisions with
  the actual diff, including any added primitive or retained native control.

### Acceptance Criteria

- the implementation record identifies the exact baseline commit and separately
  identifies any approved governance changes applied to the experiment;
- the Admin Footage Editor retains its existing metadata, preview, cover,
  upload, and original-variant workflow behavior, including its existing access
  controls and private-media constraints;
- before implementation, the `Component Reuse Plan` records inspected feature,
  application, and installed UI component paths, configured shadcn settings,
  selected reuse/composition choices, ownership decisions, and unresolved
  decisions;
- for every relevant control pattern, the plan records the inspected existing
  component, installed primitive where available, applicable official shadcn
  candidate, and a justified reuse, add, or retain-native decision;
- any new primitive is added only when the plan establishes that existing
  components and semantic native HTML do not meet the requirement;
- any retained native HTML is justified by its semantics rather than merely by
  the absence of an installed primitive;
- the implementation report includes the completed `Component Reuse Plan`,
  verification evidence, and the baseline identity;
- an independent review verifies the actual diff against the plan and returns
  `APPROVED` or `CHANGES_REQUESTED` with evidence.

### Explicit Exclusions

- redesigning the Admin Footage Editor or changing its product behavior;
- changing media, authorization, upload, preview, or original-file business
  rules;
- refactoring unrelated Admin or Storefront UI;
- changing the shadcn preset, adding unrelated dependencies, or creating
  speculative shared abstractions;
- treating an existing uncommitted UI refactor as experiment evidence without a
  separately attributable baseline and pre-implementation reuse plan.

### Verification Requirements

- inspect and record the clean baseline using Git status, the baseline commit,
  and the approved AI-GOV-03 change identity before implementation;
- execute the relevant static checks and focused UI/component tests available
  for the changed area; report any check not run and why;
- manually verify the preserved Admin Footage Editor workflows affected by the
  diff, including responsive/RTL and accessible interaction behavior where
  applicable;
- run the canonical independent roadmap review workflow after the implementation
  report is complete; the reviewer must inspect both the reuse plan and diff.

---

## FND-03 — Establish Quality Commands

**Status:** DONE

### Depends On

FND-01.

### Objective

Provide a small, predictable set of local quality commands.

### Required Commands

Equivalent scripts must exist for:

```text
format
format:check
lint
typecheck
test
build
```

### Acceptance Criteria

- each command works independently;
- commands fail with a non-zero exit code on failure;
- commands are documented;
- commands do not require external infrastructure unless explicitly stated.

---

## FND-04 — Establish CI

**Status:** READY_FOR_REVIEW

### Depends On

FND-03.

### Objective

Run the project's minimum quality gates on pull requests and relevant branches.

### CI Must Run

```text
install
format:check
lint
typecheck
test
build
```

### Acceptance Criteria

- CI uses a frozen lockfile;
- dependency installation is deterministic;
- CI fails if a required quality gate fails;
- CI does not require production credentials;
- default CI tests remain infrastructure-light.

---

## FND-05 — Environment Configuration

**Status:** READY_FOR_REVIEW

### Depends On

FND-01.

### Objective

Create typed and validated environment configuration.

### Requirements

- separate server-only and client-safe environment variables;
- startup/build validation where appropriate;
- `.env.example`;
- secrets must not be committed;
- client bundles must not expose server secrets.

### Acceptance Criteria

- missing required configuration fails clearly;
- environment schema is centralized;
- `.env.example` documents required keys without real credentials.

---

## DEV-ENV-01 — Automated Local Development Setup

**Status:** READY_FOR_REVIEW

### Depends On

FND-05, DATA-01, AUTH-05, CAT-04, and the development authentication resource policy.

### Objective

Provision an isolated local preview environment for safely navigating Admin pages
with the explicit development authentication bypass enabled.

### Requirements

- register and use a separate local PostgreSQL database named `vidora_preview`;
- preserve the existing `vidora_dev` database and production-named resources;
- configure `.env.local` with explicit local development resource markers;
- apply the existing Prisma migration history without reset or destructive changes;
- keep development storage isolated from production storage, or verify that the
  Admin page preview path does not require storage access;
- preserve server-side authorization for all privileged mutations and uploads.

### Acceptance Criteria

- a separate local `vidora_preview` PostgreSQL database is provisioned and accessible;
- the existing `vidora_dev` database remains unchanged;
- `.env.local` enables the development authentication bypass with isolated resources;
- development database and storage isolation are enforced;
- Admin pages can be previewed without login;
- privileged mutations remain protected by real authentication;
- relevant tests and required quality checks pass.

### Out of Scope

- production database or storage changes;
- authentication, registration, or OTP feature changes;
- fake media credentials or fake footage records;
- database reset, deletion, or destructive migration;
- unrelated UI or governance changes.

---

# Historical Phase 1 — Database & Authentication

Goal:

> Establish persistent application data and secure phone-based customer authentication.

---

## DATA-01 — Configure PostgreSQL and Prisma

**Status:** READY_FOR_REVIEW

### Depends On

FND-05.

### Objective

Connect the application to PostgreSQL using the approved Prisma version.

### Acceptance Criteria

- Prisma is configured;
- database connection is environment-driven;
- initial migration workflow works;
- Prisma major version is pinned;
- development workflow does not require Docker;
- database instructions document migration safety.

---

## DATA-02 — Create Initial Core Schema

**Status:** READY_FOR_REVIEW

### Depends On

DATA-01, AUTH-01, AUTH-02.

### Objective

Create only the foundational models required for the next phases.

### Initial Scope

Models required for:

- User;
- administrative identity where required;
- authentication/session persistence required by the chosen auth implementation.

Footage and commerce models should be added in their respective phases unless required earlier.

### Acceptance Criteria

- migration succeeds;
- unique customer identity is enforceable;
- Iranian phone identity has a canonical persisted representation;
- no speculative product models are added.

---

## AUTH-01 — Resolve Authentication Implementation

**Status:** READY_FOR_REVIEW

### Decision

Better Auth is rejected. The selected approach is ADR-0006.

### Depends On

DATA-01.

### Objective

Validate the preferred authentication library against ADR-0003 before integrating it.

### Investigation

Confirm whether the preferred Better Auth configuration can cleanly support:

- phone-only customer identity;
- OTP;
- persistent sessions;
- HttpOnly cookies;
- Prisma/PostgreSQL;
- no meaningful/fake email requirement.

### Acceptance Criteria

One of the following is documented:

1. Better Auth is accepted with the exact integration approach; or
2. Better Auth is rejected with a concrete reason and a smaller approved approach is selected.

The implementation must not proceed based on assumption.

---

## AUTH-02 — Implement Phone Normalization

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-01.

### Objective

Define and implement canonical Iranian mobile-number handling.

### Acceptance Criteria

Equivalent supported forms resolve consistently, for example:

```text
0912...
98912...
+98912...
```

Invalid Iranian mobile numbers are rejected.

Normalization has unit tests.

The canonical stored representation is documented.

---

## AUTH-03 — Implement OTP Request Flow

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-01, AUTH-02.

### Objective

Allow a customer to request an OTP safely.

### Requirements

- SMS provider boundary;
- initial Iranian SMS provider implementation;
- OTP expiration;
- resend/cooldown policy;
- abuse/rate protection;
- no plaintext OTP logging.

### Acceptance Criteria

- valid phone can request OTP;
- invalid phone cannot;
- resend policy is enforced;
- provider failures are handled safely;
- OTP value is not exposed through logs or normal API responses.

---

## AUTH-04 — Implement OTP Verification and Session

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-03.

### Objective

Verify OTP and establish the authenticated customer session.

### Acceptance Criteria

- valid OTP authenticates the customer;
- first successful authentication can create the customer account;
- returning phone resolves to the existing customer;
- invalid/expired OTP fails;
- attempt limits are enforced;
- successful use invalidates the OTP as required;
- session uses secure browser-appropriate transport;
- session survives normal page navigation/reload.

---

## AUTH-05 — Protect Customer and Admin Boundaries

**Status:** READY_FOR_REVIEW

### Depends On

AUTH-04.

### Objective

Establish authorization boundaries for authenticated customers and the single V1 administrator.

### Acceptance Criteria

- anonymous users cannot access protected customer operations;
- normal customers cannot access admin operations;
- administrator can access admin operations;
- V1 does not introduce generic RBAC.

---

# Historical Phase 2 — Admin Catalog

Goal:

> Allow the administrator to create, organize, price, and publish Footage.

---

## CAT-01 — Implement Footage Schema

**Status:** READY_FOR_REVIEW

### Depends On

DATA-01.

### Objective

Model the purchasable Footage entity.

### Scope

Include only fields required by the approved V1 product and discovery requirements.

### Acceptance Criteria

- Footage has a stable ID;
- title;
- unique slug;
- description;
- price;
- publication state;
- relevant timestamps;
- schema supports draft and published content;
- monetary storage follows the approved money convention.

---

## CAT-02 — Implement Categories and Tags

**Status:** READY_FOR_REVIEW

### Depends On

CAT-01.

### Objective

Model catalog classification required for browsing and search.

### Acceptance Criteria

- Footage can be classified appropriately;
- category/tag relationships are queryable;
- duplicate or invalid identifiers are prevented where appropriate;
- no generic taxonomy framework is introduced.

---

## CAT-03 — Implement Admin Footage CRUD

**Status:** READY_FOR_REVIEW

### Depends On

CAT-01, CAT-02, AUTH-05.

### Objective

Allow the administrator to create and edit Footage metadata.

### Acceptance Criteria

Admin can:

- create draft Footage;
- edit metadata;
- set price;
- manage category/tag relationships;
- publish valid Footage;
- unpublish Footage.

Normal customers cannot perform these operations.

---

## CAT-04 — Implement Admin Catalog List

**Status:** READY_FOR_REVIEW

### Depends On

CAT-03.

### Objective

Provide an operational catalog-management view.

### Acceptance Criteria

Admin can:

- list Footage;
- identify draft/published state;
- search or locate Footage efficiently;
- open an item for editing.

Complex analytics and bulk-management systems are out of scope.

---

# Historical Phase 3 — Media

Goal:

> Support reliable direct upload and protected delivery of large footage files.

---

## MEDIA-01 — Implement Footage File Model

**Status:** READY_FOR_REVIEW

### Depends On

CAT-01.

### Objective

Represent preview and downloadable physical files separately from Footage.

### Acceptance Criteria

A Footage can have:

- a preview;
- multiple downloadable original-quality files.

File metadata can represent varying quality labels without adding a new database column for every quality.

---

## MEDIA-02 — Integrate S3-Compatible Storage

**Status:** READY_FOR_REVIEW

### Depends On

FND-05, MEDIA-01.

### Objective

Connect the application to the selected object-storage provider behind a narrow storage boundary.

### Acceptance Criteria

- credentials remain server-side;
- object operations are centralized;
- provider-specific details do not leak across business modules;
- private and preview media policies are distinguishable.

---

## MEDIA-03 — Implement Direct Admin Upload

**Status:** READY_FOR_REVIEW

### Depends On

MEDIA-02, AUTH-05.

### Objective

Upload footage files directly from the admin browser to object storage.

### Acceptance Criteria

- large file body does not pass through Next.js;
- only administrator can initiate authorized upload;
- large-file strategy supports files up to the expected ~2 GB limit;
- failed upload can be safely retried according to provider capability;
- upload completion is explicitly confirmed.

---

## MEDIA-04 — Implement Preview Management

**Status:** READY_FOR_REVIEW

### Depends On

MEDIA-03.

### Objective

Allow Admin to associate a prepared watermarked preview with Footage.

### Acceptance Criteria

- preview can be streamed;
- preview can be downloaded;
- preview is clearly separate from protected originals;
- publishing cannot accidentally expose a protected original as preview.

---

## MEDIA-05 — Implement Original Variant Management

**Status:** READY_FOR_REVIEW

### Depends On

MEDIA-03.

### Objective

Allow Admin to manage downloadable original-quality files.

### Acceptance Criteria

- multiple variants can be associated with one Footage;
- variant labels are not constrained to a speculative closed list;
- original objects remain private;
- replacing metadata does not silently delete historical objects.

---

## MEDIA-COVER-01 — Define Mandatory Manual Footage Cover

**Status:** READY_FOR_REVIEW

### Depends On

MEDIA-03, MEDIA-04, UI-02.

### Objective

Define the approved primary cover contract for Footage without implementing
storage, schema, upload endpoints, or Admin/storefront UI changes.

### Product Contract

- Admin manually uploads one primary cover image per Footage.
- Draft Footage may exist without a cover.
- A Footage must have a usable cover before publication.
- Admin can explicitly replace the cover later.
- The storefront uses the cover in FootageCard and Footage detail.
- V1 does not extract thumbnails or covers automatically from video.

### Required Future Implementation

- choose and document the persistence/media representation for the cover;
- add an Admin cover upload and replacement workflow using the approved media
  authorization and direct-upload boundary;
- enforce the cover requirement in the server-side publication mutation and
  persistence path, including negative-path tests;
- expose only publication-safe cover data through the public catalog/detail DTOs;
- render the cover in FootageCard and Footage detail with a safe delivery
  fallback;
- preserve the existing separation between cover, watermarked preview, and
  private original files.

### Unresolved Technical Decisions

Image size/type limits, dimensions/aspect-ratio requirements, image processing,
storage role/schema shape, object-key layout, delivery mechanism/TTL, and
replacement/retention behavior are not defined by this task. Resolve them before
implementation; do not infer them from video-preview or original-file rules.

---

## MEDIA-COVER-02 — Implement Admin Cover Upload with Cropping

**Status:** READY_FOR_REVIEW

### Depends On

MEDIA-COVER-01.

### Objective

Implement the Admin primary-cover workflow with a fixed 16:9 crop and safe
replacement behavior.

### Acceptance Criteria

- Admin selects a JPEG, PNG, or WebP source image.
- Admin repositions and zooms the image in an accessible fixed 16:9 crop area.
- Only the confirmed 1280×720 JPEG crop, at most 2 MiB, is stored.
- Each Footage has one active cover in a dedicated `FootageCover` record.
- Draft Footage may have no cover; publication requires a stored cover.
- Replacement failure leaves the previous active cover unchanged.
- Public catalog data and cover delivery expose no storage credentials or object keys.
- No automatic video thumbnail extraction is introduced.

### Out of Scope

Video processing, preview replacement, original-file delivery changes, and
automatic media cleanup remain outside this task.

Goal:

> Make the catalog discoverable and provide the primary customer browsing experience.

---

## UI-01 — Establish Design Foundations

**Status:** READY_FOR_REVIEW

### Depends On

FND-01.

### Objective

Define the minimum design-as-code foundation before production storefront components proliferate.

### Scope

At minimum:

- colors;
- typography;
- spacing;
- radius;
- containers;
- breakpoints;
- RTL behavior.

### Acceptance Criteria

- canonical design documentation exists;
- implementation uses semantic design tokens;
- arbitrary per-component visual values are discouraged;
- Persian/RTL behavior is defined.

---

## UI-02 — Define Core Storefront Component Contracts

**Status:** DONE

### Depends On

UI-01.

### Objective

Define the first reusable UI contracts before implementation.

### Initial Components

- FootageCard;
- SearchBar;
- Filter controls;
- VideoPreview/Player;
- Price/BuyNow area.

### Acceptance Criteria

Each contract defines relevant:

- structure;
- states;
- responsive behavior;
- RTL behavior;
- interactions;
- data requirements.

---

## STORE-01 — Implement Public Footage Listing

**Status:** TODO

### Depends On

CAT-03, MEDIA-04, UI-02.

### Objective

Display published Footage to public users.

### Acceptance Criteria

- only published Footage appears;
- cards follow approved design contract;
- preview/poster behavior does not create uncontrolled simultaneous video playback;
- listing is responsive and RTL-correct.

---

## STORE-02 — Implement Footage Detail Page

**Status:** TODO

### Depends On

STORE-01, MEDIA-05.

### Objective

Provide the primary product page for a Footage.

### Acceptance Criteria

Page can present:

- watermarked preview;
- title;
- description;
- price;
- relevant technical metadata;
- available file/quality information;
- category/tags;
- Buy Now entry point.

---

## SEARCH-01 — Implement Catalog Search

**Status:** TODO

### Depends On

STORE-01.

### Objective

Provide PostgreSQL-backed text search suitable for the initial Persian catalog.

### Acceptance Criteria

- user can search published Footage;
- unpublished content is excluded;
- common Persian text behavior is tested;
- query has appropriate indexing;
- no external search service is introduced.

---

## SEARCH-02 — Implement Catalog Filters

**Status:** TODO

### Depends On

SEARCH-01.

### Objective

Allow useful V1 filtering without overbuilding discovery infrastructure.

### Candidate Filters

- category;
- tags;
- resolution/available quality;
- orientation;
- frame rate;
- duration;
- price.

### Acceptance Criteria

Only filters supported by actual catalog metadata are implemented.

Filter state is URL-friendly where appropriate.

---

# Historical Phase 5 — Buy Now & Payment

Goal:

> Convert authenticated customers from Footage Detail to a verified paid purchase.

---

## COM-01 — Finalize Money Convention

**Status:** TODO

### Depends On

CAT-01.

### Objective

Explicitly define stored and provider-facing monetary units.

### Acceptance Criteria

Documentation defines:

- database monetary unit;
- storefront display unit;
- payment-provider unit;
- conversion boundary if required.

No implicit Rial/Toman conversion remains.

---

## COM-02 — Implement Order and OrderItem

**Status:** TODO

### Depends On

COM-01, AUTH-04.

### Objective

Create server-authoritative single-item Buy Now orders.

### Acceptance Criteria

- authenticated customer can create an Order for one Footage;
- price comes from server-side Footage data;
- title and price are snapshotted;
- browser cannot choose authoritative price;
- no Cart model exists.

---

## PAY-01 — Integrate Payment Provider

**Status:** TODO

### Depends On

COM-02.

### Objective

Integrate the selected Iranian payment provider behind the approved payment boundary.

### Acceptance Criteria

- payment can be created for a valid Order;
- secrets remain server-side;
- provider-specific code is isolated;
- relevant authority/reference data is persisted.

---

## PAY-02 — Implement Payment Callback and Verification

**Status:** TODO

### Depends On

PAY-01.

### Objective

Handle provider return and verify payment server-side.

### Acceptance Criteria

- callback alone never marks an Order paid;
- provider verification is performed;
- failed verification does not grant entitlement;
- amount/order consistency is checked;
- repeated callback/verification is safe.

---

## PAY-03 — Implement Idempotent Purchase Completion

**Status:** TODO

### Depends On

PAY-02.

### Objective

Convert verified payment into durable purchase state exactly once.

### Acceptance Criteria

Successful completion results in:

- paid Order;
- durable purchase entitlement;
- invoice record.

Repeated completion does not create duplicates.

Relevant consistency behavior is covered by automated tests.

---

# Historical Phase 6 — Library, Downloads & Invoice

Goal:

> Allow customers to reliably access and prove previous purchases.

---

## LIB-01 — Implement User Library

**Status:** TODO

### Depends On

PAY-03.

### Objective

Display the authenticated customer's purchased Footage.

### Acceptance Criteria

- only the customer's purchases appear;
- purchases remain available across sessions/devices;
- customer can navigate from purchase to available downloads and invoice.

---

## DL-01 — Implement Protected Download Authorization

**Status:** TODO

### Depends On

LIB-01, MEDIA-05.

### Objective

Authorize original-file downloads using durable purchase entitlement.

### Acceptance Criteria

- anonymous user cannot download protected original;
- non-purchasing customer cannot download it;
- purchasing customer can request authorized access;
- application generates temporary file access only after authorization;
- full file does not pass through Next.js.

### Critical Security Test

```text
User A purchases Footage X.

User B requests an original file belonging to Footage X.

Expected result:
Access denied.
```

---

## DL-02 — Record Download History

**Status:** TODO

### Depends On

DL-01.

### Objective

Record useful download events without making download history the entitlement source of truth.

### Acceptance Criteria

Recorded information is sufficient for basic support/diagnostics without unnecessary sensitive data.

---

## INV-01 — Implement Invoice Data and Lookup

**Status:** TODO

### Depends On

PAY-03.

### Objective

Provide stable historical invoice records.

### Acceptance Criteria

- every completed purchase has one appropriate invoice;
- invoice number is unique and support-friendly;
- historical title and amount remain unchanged if catalog data changes;
- customer phone is masked in customer-facing invoice representation;
- Admin can locate invoice/order/payment information.

---

## INV-02 — Implement Customer Invoice Rendering

**Status:** TODO

### Depends On

INV-01.

### Objective

Provide a downloadable or printable customer invoice.

### Acceptance Criteria

- invoice can be retrieved later;
- rendering uses historical purchase data;
- invoice number is visible;
- relevant payment reference is represented appropriately;
- implementation does not invent unconfirmed legal/tax fields.

### Production Blocker

Before production launch, required official/legal invoice fields must be confirmed by the business owner.

---

# Historical Phase 7 — Blog & SEO

Goal:

> Provide lightweight SEO content and strong public-page discoverability.

---

## BLOG-01 — Implement Blog Schema and Admin Editing

**Status:** TODO

### Depends On

DATA-01, AUTH-05.

### Objective

Provide a simple database-backed Markdown blog.

### Acceptance Criteria

Admin can manage:

- title;
- slug;
- excerpt;
- Markdown content;
- cover image where applicable;
- SEO title;
- SEO description;
- publication state/date.

No rich-text editor framework is introduced.

---

## BLOG-02 — Implement Public Blog

**Status:** TODO

### Depends On

BLOG-01.

### Objective

Render published blog content as indexable public pages.

### Acceptance Criteria

- blog index exists;
- blog detail exists;
- Markdown is rendered safely;
- unpublished posts are not publicly visible;
- pages have appropriate metadata.

---

## SEO-01 — Implement Technical SEO Foundation

**Status:** TODO

### Depends On

STORE-02, BLOG-02.

### Objective

Provide the minimum technical SEO required for launch.

### Scope

Evaluate and implement as appropriate:

- metadata;
- canonical URLs;
- sitemap;
- robots configuration;
- structured data;
- Open Graph metadata;
- crawl/index behavior.

### Acceptance Criteria

Public Footage and Blog pages expose appropriate server-rendered metadata and do not accidentally expose admin/private surfaces to indexing.

---

# Historical Phase 8 — Production Readiness & Launch

Goal:

> Verify the critical business and security flows before production release.

---

## PROD-01 — Security Review

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Review critical attack and authorization surfaces.

### Review Areas

- OTP abuse;
- session security;
- admin authorization;
- payment verification;
- price tampering;
- entitlement bypass;
- signed download access;
- upload authorization;
- secret exposure;
- invoice/account verification.

### Acceptance Criteria

Critical findings are resolved or explicitly accepted before launch.

---

## PROD-02 — Critical E2E Coverage

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Cover the highest-value customer and administrator flows with Playwright.

### Critical Flows

At minimum:

```text
Customer OTP login

Browse → Footage Detail

Buy Now → Payment verification → Library

Purchased original download

Unauthorized original download denied

Admin creates and publishes Footage

Invoice retrieval
```

Payment-provider behavior may use an approved deterministic test adapter where external sandbox behavior is unsuitable for CI.

---

## PROD-03 — Production Infrastructure

**Status:** TODO

### Depends On

Core V1 features complete.

### Objective

Prepare production deployment and external services.

### Scope

- application hosting;
- production PostgreSQL;
- object storage;
- SMS credentials;
- payment credentials;
- domain;
- HTTPS;
- environment configuration;
- backups.

### Acceptance Criteria

Production secrets are not committed.

Deployment and rollback procedures are documented at the level required for V1.

---

## PROD-04 — Operational and Recovery Checks

**Status:** TODO

### Depends On

PROD-03.

### Objective

Ensure the system can recover from realistic operational problems.

### Verify

- database backup availability;
- database restore procedure;
- object-storage durability expectations;
- failed payment diagnostics;
- failed SMS diagnostics;
- failed upload diagnostics;
- basic application logging.

Do not introduce enterprise observability infrastructure without demonstrated need.

---

## PROD-05 — Launch Checklist

**Status:** TODO

### Depends On

PROD-01, PROD-02, PROD-03, PROD-04.

### Objective

Perform final production-readiness verification.

### Required Decisions Before Launch

Confirm unresolved business rules including:

- official invoice/legal fields;
- production payment-provider configuration;
- final license terms;
- policy for files added to Footage after an earlier purchase;
- required privacy/terms pages;
- support/contact information.

### Acceptance Criteria

- required product decisions are resolved;
- critical tests pass;
- production build passes;
- production services are configured;
- no known critical security issue remains unresolved;
- business owner approves launch.

---

# 4. Explicit V1 Non-Goals

The roadmap must not silently expand to include:

```text
Shopping cart
Discount engine
Coupons
Subscriptions
Contributor marketplace
User uploads
Creator payouts
Multi-admin RBAC
Automated transcoding
Automated watermark generation
Redis
BullMQ
Microservices
Separate NestJS backend
Dedicated search engine
Recommendation engine
Mobile application
After Effects products
Multi-language storefront
```

Adding one of these requires an explicit product or architecture decision.

---

# 5. Task Completion Protocol

When an implementation agent completes a task, its report should include:

```text
Task:
Status:

Implemented:
- ...

Files changed:
- ...

Tests added/updated:
- ...

Verification executed:
- ...

Architecture/product documentation updated:
- ...

Known limitations or unresolved questions:
- ...

Ready for review.
```

The implementation agent must not mark its own work `DONE` when the workflow requires review.

The normal transition is:

```text
TODO
  ↓
IN_PROGRESS
  ↓
READY_FOR_REVIEW
  ↓
DONE
```

A reviewer may return the task to `IN_PROGRESS`.

---

# 6. Scope Discipline

A task implementation should make the smallest coherent change required to satisfy its acceptance criteria.

Agents should not:

- implement future roadmap tasks because they appear convenient;
- perform unrelated refactors;
- introduce speculative abstractions;
- add dependencies without justification;
- weaken tests or validation to obtain a passing build.

If a task exposes a missing business rule or architectural decision, implementation should stop at that boundary and report it.

The roadmap should then be updated after the decision is made.

---

# 7. Roadmap Maintenance

This roadmap is expected to change as implementation reveals real constraints.

Changes should prefer:

- splitting an oversized task;
- adding a missing bounded task;
- clarifying acceptance criteria;
- updating dependencies;

rather than rewriting the entire roadmap.

Completed task history should remain understandable.

The roadmap is an execution tool, not a prediction of every future feature.
