# VIDORA-HOMEPAGE-DESIGN-01 — Homepage Design Audit

Date: 2026-10-31
Scope: Existing fixture-backed public homepage at `/`, including the public
header, hero, search/category controls, footage gallery/cards, pagination, and
the populated, empty, loading, error, and unavailable fixture states.

This audit originally recorded a read-only review. The focused refinement task
`VIDORA-HOMEPAGE-REFINE-01` subsequently addressed the three findings below.
The audit does not review Admin pages, session pages, backend catalog queries,
or the Commerce detail composition except where homepage card links enter that
route.

## Recon and coverage

Stack and conventions inspected: Next.js App Router, React Server/Client
Components, Tailwind CSS v4, base-nova/Base UI shadcn primitives, semantic
tokens, Persian `fa`/RTL, and local Vazirmatn. Canonical project and design
documents inspected: `AGENTS.md`, `docs/PROJECT.md`, `docs/ROADMAP.md`,
`docs/design/foundations.md`, `docs/design/storefront-component-contracts.md`,
`instructions/components.md`, and `instructions/frontend-implementation.md`.

| Domain        | Evidence inspected                                                                                                           | Result                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility | Homepage landmarks, form controls, card links, pagination, focus classes, reduced-motion hook behavior, and focused UI tests | Not reviewed: `.agents/skills/better-accessibility/SKILL.md` is unavailable. Accessibility observations are limited to contract evidence and rendered semantics. |
| Layout        | Hero, search/category composition, gallery grid, pagination, sticky header, RTL/logical layout classes                       | 1 high, 1 medium finding                                                                                                                                         |
| Writing       | Hero copy, search labels, empty/loading/error/unavailable states, card labels                                                | No actionable writing finding                                                                                                                                    |
| Typography    | Vazirmatn foundation, hero scale/weight, body measures, mixed Persian/LTR values                                             | 1 medium finding                                                                                                                                                 |
| Color         | Semantic tokens, hero background, primary/accent controls, muted states                                                      | Not verified: rendered contrast pairs were not measured; no contrast finding is claimed.                                                                         |
| UI polish     | Hover/touch preview lifecycle, reduced-motion branch, focus styling, media fallback, surface composition                     | No actionable UI-polish finding from source review; animation-panel replay was not verified.                                                                     |

## Findings

| Severity | Domain     | Location                                                                                                                                         | Before                                                                                                                       | After                                                                                                                 | Why                                                                                                                                           |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| HIGH     | Layout     | `src/modules/footage/public/components/homepage-search-controls.tsx:164-185` and `src/components/ui/button.tsx:8`                                | Suggested categories used `grid-cols-4`, while the Button base class uses `whitespace-nowrap`.                               | Changed the suggestion grid to `grid-cols-2 sm:grid-cols-4`, preserving every label and the existing button behavior. | Resolved: narrow screens now provide two wider tracks, so Persian labels remain inside their hit areas without horizontal overflow.           |
| MEDIUM   | Layout     | `src/modules/footage/public/components/homepage-search-controls.tsx:149-152` and `src/modules/footage/public/components/public-home-page.tsx:53` | The Hero link targeted `#homepage-categories`, but that target had no `scroll-mt-*` compensation while the header is sticky. | Added `scroll-mt-20` to the existing `homepage-categories` section.                                                   | Resolved: anchor navigation retains the same URL and target while reserving the established sticky-header offset.                             |
| MEDIUM   | Typography | `src/modules/footage/public/components/public-home-page.tsx:34` and `docs/design/foundations.md:103-115`                                         | The hero H1 used `font-extrabold` while the documented foundation specifies approved weights through 700.                    | Changed the H1 to `font-bold`; retained `md:text-5xl` as part of the approved existing hero composition.              | Resolved: the H1 now uses an approved weight without changing wording, family, hierarchy, or the product-owner-approved responsive hero size. |

## Optional improvements, not defects

- Consider making the suggested-category icon explicitly decorative with
  `aria-hidden="true"` after the unavailable accessibility skill or a manual
  accessibility review confirms the intended semantics.
- The existing raw `<img>` usage in the card preview is already tracked by the
  roadmap’s unresolved image-delivery policy and was not changed or reclassified
  here.

## Verification

Refinement verification:

- Source inspection confirms the three finding changes above and no changes to
  search URL construction, category filtering, gallery pagination, preview
  interactions, or backend contracts.
- Focused homepage tests pass, including the existing category-label and URL
  behavior assertions.
- `git diff --check` passes for the focused changes.
- Browser viewport checks were run where the available browser tooling allowed;
  exact 320px, 360px, 768px, and 1280px viewport sizing was not exposed by the
  available surface, so those exact visual dimensions remain not verified.

Original audit evidence:

Passed:

- Source inspection of all homepage states and focused component tests.
- Browser inspection of the populated homepage at the available in-app browser
  surface; header, hero, search, category controls, gallery semantics, and
  pagination were present.
- Homepage card link inspection showed a detail URL for each card; the selected
  card links to `/footage/[slug]`. The detail route was also verified directly
  with the fixture-backed Commerce page.

Not verified:

- Exact 360px, 768px, 1280px, and 1920px viewport matrix; the available browser
  surface did not expose a viewport override.
- 320px and 200% zoom stress checks.
- RTL mirror comparison at each viewport.
- Measured rendered contrast pairs.
- Browser animation-panel replay at reduced speed.
- Full accessibility review because the requested skill is unavailable.

Verdict after `VIDORA-HOMEPAGE-REFINE-01`: The three audited findings are
resolved in source. Exact viewport-matrix rendering and 200% zoom remain
unverified because the available browser surface does not expose viewport
overrides. Ready for review.
