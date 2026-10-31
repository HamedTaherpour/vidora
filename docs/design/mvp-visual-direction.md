# Vidora MVP Visual Direction

**Task:** UI-DESIGN-01
**Status:** READY_FOR_REVIEW
**Decision state:** Proposed for product-owner approval

This document is the focused visual-direction proposal for the fixture-based UI
rebuild. It is the implementation guide for the next UI tasks after approval.
It does not change product behavior, data contracts, security boundaries, or
component responsibilities.

## 1. Product and visual boundary

Vidora is a Persian-first, RTL, paid footage marketplace. The public experience
should make finding and evaluating footage feel immediate; the commercial
decision remains a single-item `Buy Now` flow. The Admin experience should be
quiet, operational, and predictable.

The current application appearance is not an approved visual baseline. Existing
UI may be used to preserve functional behavior, public-safe data, authorization,
media protection, accessibility, and route contracts. Its colors, density,
composition, and decorative treatment are superseded by this proposal after
product-owner approval.

The direction is intentionally small: one light semantic token set, one Persian
typographic system, and two related compositions:

- **Public:** content-first footage discovery inspired by the useful patterns of
  Pexels Videos, adapted for paid single-item commerce.
- **Admin:** standard shadcn/ui patterns composed from existing primitives where
  possible.

There are no creator profiles, social interactions, collections, subscriptions,
recommendation systems, cart, discount, or multi-product checkout surfaces.

## 2. Public storefront direction

### Layout and navigation

- Use a simple top header with Vidora identity, a small set of product/account
  destinations, and a clear account state. Keep the header visually quiet so
  the catalog remains primary.
- The home/catalog surface leads with a concise value statement and one unified
  hero control containing category selection, GET search, submit, and a compact
  clear action, then the published-footage grid. Search is the main discovery
  action, not a decorative header element.
- Use `container-storefront`, logical padding, and a centered max-width. Keep
  mobile gutters at 16px and larger-screen gutters at 24px.
- Use a single-column page flow on narrow screens. On larger screens, allow the
  search/filter row and content grid to widen without creating dense toolbars.
- The detail page uses a wide preview/cover region followed by title, metadata,
  price, available-quality information, and the Buy Now area. On desktop, the
  purchase block may remain visually adjacent to the media; on mobile it follows
  the media and remains easy to reach.
- Keep navigation and discovery controls URL-owned. Do not add live search,
  autocomplete, history, or client-side catalog state unless a later task
  explicitly approves it.

### Media discovery and cards

- Use the approved manual primary cover as the card and detail presentation
  image. Use a stable 16:9 media frame for the MVP storefront.
- The grid is responsive: one column on narrow mobile, two columns on wider
  mobile/tablet, and three or four columns when the container can support them
  without undersized cards. The parent owns the grid; the card owns only stable
  internal geometry.
- Keep cards visually light: cover first, short metadata row, Persian title,
  then price. Use one clear detail link. Do not show a card-level Buy Now button
  that competes with detail navigation.
- Never autoplay, hover-play, viewport-play, or prefetch a player for every card.
  Preview playback begins only after an explicit pointer or keyboard action.
- Use `object-fit: cover` for covers, preserve the reserved aspect-ratio box, and
  show a safe unavailable-cover fallback with title/category context. A missing
  cover must not be replaced by an extracted video frame.
- Long Persian titles wrap to a bounded number of lines without horizontal
  overflow. Price remains legible and is not allowed to shift card geometry.

### Detail, preview, and commerce hierarchy

1. Cover and explicit watermarked preview.
2. Persian title and concise description.
3. Price in integer Toman, with the currency label adjacent in Persian.
4. Useful technical metadata and category/tags.
5. Available quality/file labels.
6. One prominent `خرید` / Buy Now action.

The preview is watermarked and remains distinct from the cover and protected
original files. Original-file URLs, object keys, and storage credentials never
enter public view models. Purchased users reach downloads through the account
library and protected authorization flow; the visual direction does not weaken
those rules.

Use clear status language for purchase/payment states. Loading, unavailable,
recoverable error, and disabled action states must explain what happened and
what the user can do next without exposing provider or internal errors.

## 3. Admin direction

Admin is an operational workspace, not a marketing surface.

### Shell and navigation

- In RTL, place the desktop sidebar on the right and the main content to its
  left. Use grouped navigation with the active item clearly marked.
- On mobile, the sidebar becomes an accessible right-side Sheet/off-canvas
  navigation. Preserve the same destinations and active state.
- Use a compact header for page title, breadcrumb/context when useful, and the
  page-level action. Do not duplicate navigation in the page body.
- Keep the content area inside `container-admin`; use a consistent page header,
  content stack, and responsive gutters.

### Lists, filters, and tables

- Use the installed `Table` primitive for the Admin catalog when the viewport
  supports it. Keep columns limited to operational decisions: title, status,
  price, updated date, and actions.
- On narrow screens, switch to stacked list/card rows with the same information
  and actions; do not force a horizontally scrolling table for the primary
  workflow.
- Put search and approved filters above the list, with explicit submit/reset
  behavior. Pagination is compact and remains keyboard accessible.
- Use `Badge` for draft/published and other bounded status values. Do not encode
  status by color alone.

### Forms, uploads, and feedback

- Group related fields with `FieldGroup`/`Field`; use visible Persian labels,
  descriptions, `aria-invalid`, and an adjacent actionable error message.
- Keep metadata, classification, publication, preview, cover, and original-file
  management as understandable sections owned by the Admin footage feature.
- Upload panels must show selected file, progress/pending state, retry/failure,
  completion, and safe replacement behavior. They must not reveal object keys or
  storage credentials.
- Use `Dialog`/`AlertDialog` for confirmations that need interruption. Every
  dialog has a title, description where useful, a clear cancel path, and a safe
  default focus.
- Use `Alert` for recoverable errors, `Skeleton` for loading, and a deliberate
  empty state with a next action. Permission-denied states must not look like an
  empty catalog.

### Existing component and primitive decisions

The repository already contains `Button`, `Card`, `Badge`, `Dialog`, `Field`,
`Input`, `Label`, `Select`, `Separator`, `Table`, and `Textarea` under
`src/components/ui`. Reuse and compose these before adding anything. The
feature-owned components remain in their existing `src/modules` locations.

For future UI tasks, evaluate the official shadcn candidate before adding a
missing primitive:

| Pattern                 | Existing/installed                            | Candidate and decision                                                                                       |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Admin navigation        | No installed Sidebar                          | Official `Sidebar`; evaluate and add only when the Admin shell task requires it.                             |
| Mobile admin navigation | `Dialog` installed                            | Official `Sheet` or Sidebar mobile mode; evaluate against the configured Base UI stack.                      |
| Empty state             | No installed Empty                            | Official `Empty`; evaluate when a page needs a reusable empty composition.                                   |
| Pagination              | No installed Pagination                       | Official `Pagination`; evaluate when a paginated route is implemented.                                       |
| Loading                 | No installed Skeleton                         | Official `Skeleton`; evaluate when loading fixtures/pages are implemented.                                   |
| Forms and tables        | `Field`, `Input`, `Select`, `Table` installed | Reuse installed primitives; retain native table/form semantics where they are the correct semantic boundary. |
| Confirmation            | `Dialog` installed                            | Reuse `Dialog`; evaluate `AlertDialog` for irreversible or high-consequence confirmation.                    |

No component is added by UI-DESIGN-01. No preset, dependency, or component API
is changed.

## 4. Minimal design foundations

These are proposed semantic roles, not a new token framework. They should be
implemented through the existing shadcn-compatible CSS variables and utilities
after approval.

### Color roles

- `background`: warm near-white page canvas.
- `foreground`: deep neutral text with strong Persian readability.
- `card`/`popover`: white elevated surfaces.
- `muted`: cool-neutral surface for secondary controls and loading.
- `muted-foreground`: readable secondary text, never the only carrier of meaning.
- `primary`: restrained deep indigo-blue for the main action and active states.
- `primary-foreground`: high-contrast text on primary.
- `accent`: very light indigo tint for selected/hover surfaces.
- `border`/`input`: quiet neutral separators and control boundaries.
- `destructive`: reserved for destructive actions and errors.
- `ring`: high-contrast visible focus indicator.

Use semantic utilities only. Avoid gradients, saturated multi-color decoration,
dark-mode work, and per-component brand colors in the MVP.

### Typography and spacing

- Continue using the local Vazirmatn asset for Persian Storefront and Admin.
- Use the existing semantic text roles as the starting scale: small 12/20,
  body 14/24, H3 20/32, H2 24/36, H1 32/44. Do not introduce a second font.
- Use the standard Tailwind spacing scale. Prefer a small set of repeated gaps:
  8px for tight metadata, 16px for control groups, 24px for sections, and 32px
  or more for page-level separation.
- Use a quiet base radius around the existing shadcn radius. Cards and controls
  may be rounded, but avoid pill-shaped everything; pills are reserved for
  compact status/badge treatments.
- Use subtle borders first; shadows are reserved for overlays and important
  floating surfaces.

### Responsive and RTL conventions

- Preserve document `lang="fa"` and `dir="rtl"`.
- Use logical properties and `text-start`/`text-end`; do not encode layout with
  left/right assumptions.
- Isolate slugs, URLs, filenames, IDs, code, and provider references with local
  `dir="ltr"`.
- Keep mixed Persian/Latin input readable; do not force technical content into
  Persian shaping or directional order.
- The minimum review widths are 360px mobile, 768px tablet, and 1280px desktop.
  These are review targets, not a mandate to add custom breakpoints.
- Focus rings must be visible in every direction and state. Respect reduced
  motion; no interaction may depend on hover.

## 5. Visual approval process

Every `PUB-*` and `ADM-*` page task stops at `READY_FOR_REVIEW` until the product
owner manually approves the page. Automated tests and independent code review
do not replace this visual approval.

The implementation report for each page should include a short record:

```text
Page: <route/name>
Viewport checks: 360px / 768px / 1280px
RTL and Persian content: PASS | NEEDS_WORK
States checked: populated, loading, empty, error, unavailable where relevant
Keyboard/focus/overflow: PASS | NEEDS_WORK
Owner decision: APPROVED | CHANGES_REQUESTED
Notes: <one or two concrete observations>
Approved by: <product owner>
Date: <YYYY-MM-DD>
```

Checklist:

- mobile and desktop composition are usable;
- Persian RTL order, alignment, wrapping, and mixed-direction values are correct;
- typography, spacing, color roles, borders, and density follow this direction;
- visual hierarchy makes the primary page action obvious;
- existing component contracts and shadcn reuse expectations are respected;
- primary interactions work with pointer and keyboard;
- visible focus, labels, status announcements, and dialog focus behavior are correct;
- loading, empty, recoverable error, and unavailable-media/action states are deliberate;
- no responsive overflow or clipped Persian text appears;
- media preserves its reserved frame and does not autoplay unexpectedly;
- no unsupported product behavior or private media data is exposed;
- the local preview/build instructions are included in the task handoff.

## 6. Superseded decisions and preserved contracts

Superseded after approval:

- the historical color values and green-led primary treatment in
  `docs/design/foundations.md`;
- the historical visual density and current page composition;
- any current page styling treated as a target rather than implementation
  context.

Preserved:

- Persian-first `fa`/RTL and logical layout behavior;
- local Vazirmatn delivery, semantic CSS variables, Base UI/shadcn configuration,
  Lucide icons, and small client boundaries;
- FootageCard/SearchBar/FilterControls/VideoPreview/Buy Now behavioral contracts;
- manual cover versus watermarked preview versus protected original separation;
- single-item Buy Now, integer Toman prices, server-authoritative commerce, and
  authorization/media rules;
- operational Admin routes and feature/module ownership.

## 7. Open decisions for product-owner approval

- Approve the proposed restrained indigo-blue primary accent and warm-neutral
  light canvas, or specify a different brand accent before implementation.
- Approve the public grid/detail hierarchy and the right-sided RTL Admin shell.
- Confirm whether the public header should show a customer Library link before
  authentication or only after authentication; this affects navigation wording,
  not authorization.
- Confirm the preferred Persian wording for the primary purchase action and
  purchase/payment status labels before fixture work.

No other product behavior is inferred by this document. Unresolved legal,
licensing, payment-provider, invoice, download-policy, or media-retention
decisions remain governed by the existing project documents and must not be
resolved through visual design.

## 8. Research references

Research was performed against the live public reference pages on 2026-10-30:

- Pexels Videos: <https://www.pexels.com/videos/>. Observed content-first
  discovery, prominent search, video-oriented result presentation, responsive
  result groupings, and low-clutter navigation. Pexels' free/community model,
  creator/social features, wording, assets, and exact layouts are not adopted.
- shadcn/ui Sidebar: <https://ui.shadcn.com/docs/components/base/sidebar>.
  Observed composable grouped navigation, active menu state, responsive mobile
  behavior, and explicit RTL/right-side support.
- shadcn/ui Dialog: <https://ui.shadcn.com/docs/components/radix/dialog>.
  Observed titled, described, keyboard-managed modal composition.
- shadcn/ui Empty: <https://ui.shadcn.com/docs/components/base/empty>.
  Observed a structured empty-state composition with a clear next action.
- shadcn/ui Data Table: <https://ui.shadcn.com/docs/components/base/data-table>.
  Observed the recommendation to compose task-specific tables from the base
  Table primitive rather than introduce a generic data-grid abstraction.

The reference pages were accessible. This document records design principles,
not copied assets, markup, branding, or layouts.
