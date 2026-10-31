# VIDORA-PUB-FOOTAGE-EXPLORER-06A — Discovery Page Design Exploration

Status: `READY_FOR_REVIEW` — production promotion complete

This began as a fixture-backed design exploration for the Public Footage
Explorer. The approved Classic Sidebar is now the production `/footage` route;
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

- Hero search: `/footage?q=خیابان+بارانی+تهران`
- Category link: `/footage?category=nature`
- Featured footage: deferred until explicit featured metadata exists.
- Recently added: deferred until explicit publication-date metadata exists.

Homepage search, category, and general footage links now use the production
route. Featured and recently-added collection semantics remain deferred because
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

Production promotion to `/footage` is complete for this task. The broader
Public review gate and any future database-backed catalog integration remain
separate approvals.

## Production route

The temporary Classic, Modern, and Minimal preview routes were removed after
production verification. The production Classic route keeps the shared parser,
discovery engine, fixtures, card, URL state, pagination, empty state, and
responsive behavior. On mobile the filter sidebar becomes an accessible shadcn
Sheet with an active-filter count and explicit apply/clear/close actions. On
desktop it is a right-side sticky, scrollable panel; results remain on the left
in RTL reading order.

## Selected direction

Classic Sidebar is selected because its explicit grouping and comfortable
spacing make the filter model easiest to scan in Persian RTL. Its final
refinements keep sorting discoverable beside the other controls without adding
another toolbar control.
