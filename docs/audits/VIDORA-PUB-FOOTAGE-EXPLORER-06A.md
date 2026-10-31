# VIDORA-PUB-FOOTAGE-EXPLORER-06A — Discovery Page Design Exploration

Status: `READY_FOR_REVIEW` — production promotion complete

This began as a fixture-backed design exploration for the Public Footage
Explorer. The approved Classic Sidebar is now the production `/search` route;
the approved homepage remains unchanged apart from navigation destinations.

## Capability matrix

| Capability                   | Source field                       | Fixture values                                                       | Implemented now                    | Backend/domain dependency                             |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| Searchable text              | `titleFa`, category name, `slug`   | Persian titles, category labels, slugs                               | Yes                                | None                                                  |
| Categories                   | `category.slug`, `category.nameFa` | nature, urban, travel, technology, business, sports, food, lifestyle | Yes                                | None                                                  |
| Tags                         | None                               | None                                                                 | No                                 | Add public tag metadata and fixtures                  |
| Price                        | `priceToman`                       | Integer Toman values from 220,000 to 450,000                         | Yes, min/max                       | None                                                  |
| Duration                     | `durationSeconds`                  | 18–62 seconds                                                        | Yes, all/short/medium/long buckets | None                                                  |
| Resolution                   | None                               | None                                                                 | No                                 | Add file/quality metadata to the public DTO           |
| Orientation/aspect ratio     | None                               | None                                                                 | No                                 | Add media dimensions/orientation metadata             |
| Frame rate                   | None                               | None                                                                 | No                                 | Add FPS metadata                                      |
| Creation/publication date    | None                               | None                                                                 | No                                 | Add a public date field and define ordering semantics |
| Featured status              | None                               | None                                                                 | No                                 | Add explicit featured/collection metadata             |
| Available file/quality types | None in public fixture DTO         | None                                                                 | No                                 | Expose safe public quality metadata                   |

## URL contract

Supported parameters are `q`, `category`, `minPrice`, `maxPrice`, `duration`,
`sort`, and `page`. `duration` is `all`, `short`, `medium`, or `long`; `sort` is
`relevance`, `price-asc`, `price-desc`, `duration-asc`, or `duration-desc`.
Unsupported parameters such as `tags`, `resolution`, `orientation`, `fps`, and
`collection` are ignored. Invalid values fall back to defaults, unknown
categories are cleared, and page numbers are clamped to available results.

The serialized order is deterministic:

```text
q → category → minPrice → maxPrice → duration → sort → page
```

Filter and search submissions reset `page` to one. Sort changes preserve active
filters and reset `page` to one. Direct navigation and refresh preserve the URL
state.

## Homepage deep-link proposal

- Hero search: `/search?q=خیابان+بارانی+تهران`
- Category link: `/search?category=nature`
- Featured footage: deferred until explicit featured metadata exists.
- Recently added: deferred until explicit publication-date metadata exists.

Homepage search, category, and general footage links now use the production
search route. Featured and recently-added collection semantics remain deferred because
the current domain model has no truthful metadata for them.

## R1 layout and variant differentiation

The redundant exploration heading, full-width search form, and separate results
heading were removed. Search now lives in the right filter sidebar. The Classic
results side starts with only a compact localized result-count toolbar and
active filter chips; sorting lives in the sidebar.

- Classic uses a conventional bordered card, explicit labels, separated filter
  sections, and comfortable apply/reset actions.
- Modern uses a compact border-separated sidebar with native disclosure groups
  for category, price, and duration, plus a tighter toolbar hierarchy.
- Minimal uses a border-light, compact control stack with reduced spacing and
  subdued chrome so the footage grid carries the visual weight.

The URL values remain stable (`price-asc`, `price-desc`, `all`, and so on), but
all visible labels use Persian copy such as «ارزان‌ترین»، «گران‌ترین»، and
«همه مدت‌ها».

## R2 owner selection and final refinement

The owner selected **Classic Sidebar** as the design direction. Modern Explorer
and Minimal Marketplace were explored but were not selected; all three
temporary preview routes were removed after production verification.
The selected Classic route now places the single sorting control inside the
right filter sidebar, including the mobile Sheet, and uses Lucide icons beside
the search, category, price, duration, and sorting section labels.

Production promotion to `/search` is complete for this task. The broader
Public review gate and any future database-backed catalog integration remain
separate approvals.

## Production route

The temporary Classic, Modern, and Minimal preview routes were removed after
production verification. The production Classic `/search` route keeps the shared parser,
discovery engine, fixtures, card, URL state, pagination, empty state, and
responsive behavior. On mobile the filter sidebar becomes an accessible shadcn
Sheet with an active-filter count and clear/close actions; filter changes apply
automatically. On
desktop it is a right-side sticky, scrollable panel; results remain on the left
in RTL reading order.

## Selected direction

Classic Sidebar is selected because its explicit grouping and comfortable
spacing make the filter model easiest to scan in Persian RTL. Its final
refinements keep sorting discoverable beside the other controls without adding
another toolbar control.

## 06C route and interaction refinement

The canonical production discovery route is now `/search`. The former browse
route `/footage` remains as a lightweight permanent redirect that preserves the
supported explorer query parameters; `/footage/[slug]` detail routes are
unchanged.

The Classic Sidebar now uses a catalog-derived dual-thumb price slider with
local drag state and URL commits on interaction completion. Search commits
after 400ms of inactivity, while category, duration, sorting, badge removal,
clear-all, and price reset apply immediately. The compact results toolbar shows
localized removable badges for every non-default search/filter/sort selection.

Featured and recently-added homepage sections still use honest generic browse
fallbacks because the current public domain model has no reliable featured flag
or publication timestamp. No metadata or SEO-01 behavior was added.

## 06C verification

- `pnpm format:check` — passed.
- `pnpm lint` — passed with three existing `@next/next/no-img-element`
  warnings outside this refinement.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 52 files and 374 tests.
- `pnpm build` — passed; `/search` and the `/footage` redirect are present.
- `pnpm check:agent-tooling` — passed.
- `git diff --check` — passed.

The remaining dependency is the comprehensive Public owner-review gate. The
catalog is still fixture-backed; genuine featured/recent semantics and the
database-backed public catalog remain deferred.

## 06D public layout and filter badge refinement

The Search-specific «پاک کردن همه» action was removed from the toolbar, desktop
sidebar, mobile filter Sheet, and empty-results state. Independent active-filter
badge removal and the price-range reset remain intact.

The Search route did not inherit a shared public route-group layout: unlike the
homepage and footage detail route, it rendered only `FootageExplorerView`.
`src/app/search/page.tsx` now composes the existing `PublicSiteHeader` and
`PublicSiteFooter` exactly once around the explorer. The root layout was not
changed, so RTL direction, Vazirmatn, theme tokens, and existing public routes
remain governed by the established composition.

Active-filter badges were enlarged modestly with consistent height, horizontal
padding, Persian-readable text sizing, clearer label/icon spacing, and 24px
remove controls. Hover, active, and focus-visible states remain semantic and
the toolbar keeps badges on the right and result count/filter access on the
left while allowing wrapping.

Focused tests cover the single public header/footer composition, complete
absence of the Search clear-all action, localized active badge text, badge
accessibility, and retained individual removal controls. Final verification is
recorded below.

## 06D verification

- `pnpm format:check` — passed.
- `pnpm lint` — passed with three existing `@next/next/no-img-element`
  warnings outside this refinement.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 54 files and 380 tests.
- `pnpm build` — passed; `/search` is present with the public layout and the
  `/footage` compatibility redirect remains present.
- `pnpm check:agent-tooling` — passed.
- `git diff --check` — passed.
- Browser smoke — passed for public chrome, localized active badges, and the
  mobile filter Sheet with sorting present once.

The task remains `READY_FOR_OWNER_REVIEW`; the broader Public review gate is
still open.

## 06E RTL price range slider fix

### Root cause

The document and storefront use `dir="rtl"`, but Base UI's slider direction
context defaults to LTR unless a `DirectionProvider` is supplied. The explorer
already maintained the correct logical value order `[minimum, maximum]` and the
URL contract already used `minPrice` and `maxPrice` correctly. Without the
provider, Base UI rendered and interpreted that logical array from left to
right, making the minimum thumb appear on the left and reversing the expected
pointer/keyboard relationship in the Persian UI.

### Fix and mapping

The existing shadcn/Base UI Slider now accepts its supported `direction` value,
and the Explorer price control passes `direction="rtl"` through a
`DirectionProvider`. Values remain `[minimum, maximum]` throughout the
component, local draft state, commit handler, parser, serializer, and URL:

- Right thumb: index 0, minimum/cheapest price, `minPrice`.
- Left thumb: index 1, maximum/most expensive price, `maxPrice`.

No CSS mirroring, arbitrary value swap, sidebar LTR override, or replacement
slider library was introduced. Existing localized numeric labels and active
price badges continue to read from the same logical values.

### Regression coverage

Added a focused Slider direction contract test asserting explicit RTL direction
and minimum/maximum thumb label order. Existing Explorer utility and URL tests
continue to cover clamping, crossing-range normalization, serialization, badge
formatting, and independent filter removal.

Browser verification on the mobile filter Sheet used actual pointer drags and
keyboard input: dragging the right thumb changed only `minPrice` from 220000 to
260000; dragging the left thumb changed only `maxPrice` from 450000 to 410000;
ArrowLeft on the minimum thumb increased it from 280000 to 285000. URL commits
occurred after interaction completion, and the active badge updated to match.
Refresh, Back, and Forward restored the corresponding URL values and localized
range badge. The available browser tooling exposed the mobile viewport; desktop
behavior was verified through the shared responsive implementation, SSR
markup, and production build, but no separate desktop pointer drag was
available in this environment.

## 06E verification

- `pnpm format:check` — passed.
- `pnpm lint` — passed with three existing `@next/next/no-img-element`
  warnings outside this fix.
- `pnpm typecheck` — passed.
- `pnpm test` — passed: 55 files and 381 tests.
- `pnpm build` — passed; `/search` remains present.
- `pnpm check:agent-tooling` — passed.
- `git diff --check` — passed.

This task remains `READY_FOR_OWNER_REVIEW`. Changes are intentionally
uncommitted and unpushed pending explicit owner approval.
