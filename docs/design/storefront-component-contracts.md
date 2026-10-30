# Vidora Storefront Component Contracts

Status: READY_FOR_REVIEW contract for UI-02. This document preserves the
behavioral, data, media, accessibility, and RTL boundary for the first reusable
Persian-first storefront components. Its visual suggestions and any appearance
derived from the existing implementation are not approved targets: the
product-owner decision recorded in `UI-DESIGN-01` requires a Pexels-inspired
MVP presentation rebuild. UI tasks may inspect this contract for behavior and
constraints, then apply the approved new visual direction without changing its
product/security responsibilities. This document does not implement components,
routes, queries, commerce, or media infrastructure.

## Shared conventions

- The storefront is Persian-first with document `lang="fa"` and `dir="rtl"`.
- Components use semantic design tokens from [`foundations.md`](foundations.md), logical CSS properties, and `container-storefront` at route composition boundaries.
- Server Components are the default. Client Components are limited to browser interaction, local state, and media APIs.
- `Footage` is a published product. Public DTOs and application queries belong to the Footage/catalog module; components must not import Prisma, storage credentials, payment infrastructure, or raw persistence types.
- The public detail URL is `/footage/[slug]`. The server resolves the slug to the internal UUID. The existing preview delivery route remains UUID-based: `/api/footage/[id]/preview` and `/api/footage/[id]/preview?mode=download`.
- Every published Footage has a manually supplied primary cover image. The cover is presentation media for the catalog and detail surfaces; it is not a generated thumbnail and is separate from the watermarked preview.
- Props below are illustrative contracts, not production source files. Names may be refined during implementation without changing the behavior defined here.
- Callback props, where present, notify the owning application boundary about a user action; they do not perform persistence, payment, authorization, or provider work inside the component.

## 1. FootageCard

### Purpose

Present one published Footage summary in a catalog grid and provide a clear path to its public detail page.

### Responsibility

- Render the Persian title, category, optional approved metadata, and integer-Toman price.
- Render the approved primary cover image in the card's media region. The card must not extract a thumbnail from video or assume that the preview supplies the cover.
- Provide one clear navigation target for the Footage detail page.
- Represent loading and unavailable-preview states.
- Keep card geometry stable across responsive grid columns.

### Non-responsibilities

- No catalog query, filtering, sorting, pagination, or slug resolution.
- No favorites, ratings, discounts, inventory, cart, or purchase orchestration.
- No original-file access or authorization decision.
- No automatic playback, hover autoplay, poster-generation service, video-frame extraction, or media prefetch for every card.

### Semantic structure

Use an `article` for the card, with a preview region, heading, metadata group, and price/action area. The title is the primary link to `/footage/[slug]`. Avoid nested interactive elements: the preview play control and title/link must not be placed inside another link. If the whole card is clickable, use one semantic link wrapper and keep preview playback as a non-nested sibling interaction, or use a non-clickable card with a distinct title link.

### Data requirements

Required: `id`, `slug`, `titleFa`, `priceToman`, `category`, a publication-safe primary cover, and publication-safe preview availability. Optional: tags or other metadata explicitly approved by the listing query. The DTO must not contain object keys, private URLs, or original-file data. The cover field's exact URL/delivery shape is an implementation contract to be defined by the media/public catalog work.

### Proposed TypeScript props

```ts
type FootageCardProps = {
  footage: {
    id: string;
    slug: string;
    titleFa: string;
    priceToman: number;
    category: { slug: string; nameFa: string };
    cover: { status: "ready"; src: string; altFa: string };
    preview: { status: "ready" | "unavailable" };
    metadata?: {
      durationSeconds?: number;
      width?: number;
      height?: number;
      fps?: string;
    };
  };
  onPreviewRequested?: (footageId: string) => void;
};
```

### State model

The server supplies `preview.status`. The client interaction, if a card-level player is included, is a small local union: `idle | loading | playing | paused | error`. `unavailable` is not a playback error; it is an intentional unavailable presentation. There is no shared autoplay or global playback state.

### Interaction behavior

Playback begins only after an explicit keyboard- or pointer-initiated action. A card must not play on page load, hover, focus, or viewport entry. Show the primary cover as the card media. If the cover cannot be delivered at runtime, show a deliberate safe fallback with title/category context; do not substitute an extracted video frame. The detail link remains usable when cover or preview delivery fails.

### Responsive behavior

The parent owns the responsive grid. The card fills its grid cell, preserves a consistent media aspect ratio chosen by the implementation contract, and lets title/metadata wrap without causing horizontal overflow. No breakpoint-specific business behavior is introduced.

### RTL and mixed-direction behavior

Use logical spacing and alignment. Persian title and category text follow RTL. Price is a numeric/money value and may be isolated with `dir="ltr"` where needed for predictable digit grouping, while the تومان label follows the Persian presentation. Slugs and URLs are isolated as LTR only when displayed.

### Accessibility

Use a real link for navigation and a real button for playback. Give the preview action an explicit Persian accessible name, expose loading/error state with an appropriate status or alert, preserve visible focus, and never rely on hover alone. The card must remain usable with keyboard navigation and reduced-motion preferences.

### Suggested shadcn primitives

`Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Button`, and `Skeleton` where their installed Base UI versions fit. These are composition suggestions only; no primitive is installed by UI-02.

### Testing expectations

Verify title navigation, no autoplay on render/hover, explicit keyboard playback, unavailable-preview presentation, loading/error recovery, stable accessible names, and that private original data is not accepted as card input. Visual review should cover RTL grid wrapping and narrow screens.

### Dependencies and implementation blockers

Requires a future public catalog query/DTO and a public Footage detail route/query. The manual cover source is approved, but its persistence and delivery contract are missing. Preview delivery exists, but its route currently requires the resolved UUID.

`onPreviewRequested` is optional because the current card implementation is a non-playing preview placeholder. If a later card variant adds playback, it must use the callback only to request that explicit interaction; it must not establish a shared player or autoplay policy.

## 2. SearchBar

### Purpose

Submit a catalog text search through a shareable, server-rendered URL.

### Responsibility

- Own the text input until GET submission.
- Trim and normalize the submitted query at the documented boundary.
- Preserve compatible catalog parameters when submitting or clearing.
- Provide an explicit clear action and keyboard submission.

### Non-responsibilities

No autocomplete, suggestions, search history, live/debounced search, relevance ranking, catalog query execution, or result rendering.

### Semantic structure

Use a GET `<form>` containing a labelled text input and submit button. A clear button is a separate button inside or adjacent to the form and must not submit an unintended query. The route owns parsing and canonical URL construction.

### Data requirements

The initial value comes from the URL-owned `q` parameter. The component does not receive raw Prisma rows or search results.

### Proposed TypeScript props

```ts
type SearchBarProps = {
  value?: string;
  action: string;
  preserveParams?: Record<string, string | string[] | undefined>;
  labels?: { input: string; submit: string; clear: string };
};
```

### State model

The rendered value is the current URL query. While editing, the input has local draft state. Submission is a GET navigation; there is no client cache or asynchronous search state. Empty or whitespace-only input removes `q` from the URL.

### Interaction behavior

Submit on Enter or the submit button. Trim leading/trailing whitespace. The server owns the final normalization, length limits, and validation. Clear removes only `q` and preserves compatible category, repeated tag, sort, and future pagination parameters.

### Responsive behavior

The form may become full-width on narrow screens and align with surrounding controls on larger screens. It must not require a horizontal toolbar that overflows on mobile.

### RTL and mixed-direction behavior

Use Persian labels and `text-start`. User text may contain Persian and Latin terms; do not force the input value into RTL-only content. The field follows document RTL while preserving mixed-script readability. URLs and parameter values are transport details, not visible labels.

### Accessibility

Use a visible or visually hidden Persian label, a real input, a real submit button, and an independently labelled clear button. Preserve focus after normal browser navigation where the framework permits; do not use placeholder text as the only label.

### Suggested shadcn primitives

`Input`, `Button`, and `Field`/`FieldGroup` if those Base UI primitives are added for the form. No primitive installation is part of UI-02.

### Testing expectations

Test GET submission, trimming, empty-query removal, clear behavior, preservation of compatible parameters, Enter submission, Persian accessible labels, and mixed Persian/Latin input. Server query parsing must be tested separately from the component.

The canonical server-rendered form does not require a React `onSubmit` callback: the browser GET submission is the interaction contract. A client wrapper may observe submit/clear events only when that observation does not replace URL ownership or server normalization.

### Dependencies and implementation blockers

The public catalog route, query implementation, and server-side search normalization are missing. No autocomplete dependency is approved or required.

## 3. FilterControls

### Purpose

Represent server-supplied approved catalog filter controls as URL-backed state.

### Responsibility

- Render only filter groups and options supplied by the server-side catalog boundary.
- Support the selection mode declared by each supplied group, including single- and multi-select where approved.
- Apply or reset filters while preserving the active search query.
- Provide equivalent semantics in desktop and mobile presentations.
- Submit only validated, canonical URL state.

### Non-responsibilities

The component does not decide whether category, tags, resolution, available quality, orientation, frame rate, duration, price, or sorting are available. It must not add a control for a capability that the catalog query has not explicitly supplied. It does not query the catalog or implement pagination; pagination may own a reserved parameter later, but FilterControls must preserve it rather than mutate it.

### URL-state contract

The catalog query owns parameter names, allowed values, normalization, and encoding. FilterControls receives normalized values and option metadata from that boundary and serializes only the groups it was given. Repeated values may be represented as repeated URL parameters when the owning query contract chooses that encoding. Unknown, duplicate, invalid, or disallowed values are rejected or normalized server-side; the UI must not treat client state as authoritative.

### Semantic structure

Use a fieldset/legend for related options. Each supplied group uses its declared selection semantics. Apply and reset are explicit actions. Mobile may use a Sheet or Drawer, but it must expose the same controls and labels as desktop.

### Data requirements

The server supplies approved options using Persian display names and durable values. Current URL values are parsed server-side and passed as normalized initial state. No raw database objects are passed to a client island.

### Proposed TypeScript props

```ts
type FilterControlsProps = {
  action: string;
  groups: Array<{
    key: string;
    labelFa: string;
    selection: "single" | "multiple";
    options: Array<{ value: string; labelFa: string; disabled?: boolean }>;
  }>;
  value: Record<string, string | string[] | undefined>;
  preserveParams?: Record<string, string | string[] | undefined>;
  onApply?: (value: Record<string, string | string[] | undefined>) => void;
  onReset?: () => void;
};
```

### State model

The URL is the durable source of truth. Desktop and mobile controls may have local draft selections while an Apply surface is open, but both variants must produce the same canonical URL. Reset removes the supplied filter selections while retaining unrelated parameters only where the route contract requires it. Search and pagination ownership remain with their owning boundaries; the component must not assume a page policy.

### Interaction behavior

Apply produces a GET URL. Reset is explicit. Filter changes must not create conflicting owners with SearchBar or pagination. The server resolves values and applies publication-safe query rules; invalid URL state must not broaden access to drafts or private media.

### Responsive behavior

Desktop may show an inline filter panel. Mobile may expose the same controls in a Sheet/Drawer with an accessible title and Apply/Reset actions. Do not maintain separate desktop/mobile business state or allow one variant to submit a different encoding.

### RTL and mixed-direction behavior

Labels and option names are Persian and RTL. Slugs and URL values are technical LTR data and should not be visibly exposed unless isolated with `dir="ltr"`. Use logical layout properties and avoid physical left/right assumptions.

### Accessibility

Use real fieldset/legend semantics, labelled controls, keyboard-operable disclosure, visible focus, and an accessible title for any Sheet/Drawer. Convey selected state without color alone. Do not make a clickable `div` act as a checkbox or select.

### Suggested shadcn primitives

`FieldSet`/`FieldLegend`, `Select` or `RadioGroup` for category/sort, `Checkbox` for tags, `Button`, and `Sheet` or `Drawer` for mobile. The Base UI composition rules require controls to use their proper groups; no primitives are installed by this task.

### Testing expectations

Test each selection mode supplied by the catalog boundary, Apply/Reset preservation of route-owned parameters, desktop/mobile state equivalence, invalid-value normalization, unavailable options, and keyboard/accessibility behavior. Query-level tests belong to the catalog boundary and must verify the actual approved filters and deterministic ordering it supports; this component contract does not prescribe a backend capability.

### Dependencies and implementation blockers

Public filter options, public catalog query parsing, search/filter query implementation, and pagination ownership are missing. The database contains technical metadata, but this contract does not decide which fields become public controls.

## 4. VideoPreview / Player

### Purpose

Play the public watermarked preview and expose an explicit preview download action.

### Responsibility

- Use the existing preview route contract.
- Expose user-initiated playback with native accessible controls by default.
- Represent loading, ready, playing, paused, error, and unavailable states.
- Allow an explicit preview download when a published READY preview exists.
- Keep surrounding controls and status text RTL-safe without mirroring video pixels.

### Non-responsibilities

No DRM, transcoding, custom streaming service, automatic poster/cover generation, video-frame extraction, original-file delivery, permanent storage URL exposure, or entitlement authorization. The component must not infer purchase access from preview state.

### Existing public delivery contract

The player receives a resolved internal UUID and uses:

- Stream: `/api/footage/[id]/preview`
- Download: `/api/footage/[id]/preview?mode=download`

The route returns short-lived signed access only for a published Footage with a READY PREVIEW. It never exposes object keys or private ORIGINAL URLs. A route response of unavailable/error must become a safe user-facing state, not a raw exception.

### Card versus detail behavior

Card preview is optional, minimal, and never automatic; it should avoid loading media until the user explicitly requests it. The detail-page player is the primary preview surface and may render the native video element with controls once the user starts interaction. Neither surface autoplays on page load or hover.

### Semantic structure

Use a `video` element with native controls, a labelled surrounding figure/region, a status area, and a real download link or button that targets the approved route. Do not replace native video controls with an unapproved custom player.

### Data requirements

Required: resolved Footage UUID, primary cover presentation data, preview availability, and a route-safe stream URL. Optional: MIME type and prepared audio as part of the preview response/DTO. The original-file list is not an input. The player must not derive cover data from a video frame.

### Proposed TypeScript props

```ts
type VideoPreviewProps = {
  footageId: string;
  preview: { status: "ready" | "unavailable"; mimeType?: string };
  titleFa: string;
  variant: "card" | "detail";
  downloadLabel?: string;
  onPlaybackStateChange?: (
    state: "loading" | "ready" | "playing" | "paused" | "error",
  ) => void;
};
```

### State model

`unavailable | loading | ready | playing | paused | error`. `ready` means the player can be interacted with; it does not mean an original file is authorized. Browser/native media events own transient playback state. Error messages must be safe and actionable.

### Interaction behavior

Start only on explicit user action. Use native controls by default. Download is explicit and uses the `mode=download` route. On mobile, respect browser playback restrictions and do not assume autoplay, inline playback, or a hover device. Prepared audio may play as part of the approved preview; no separate audio control is required unless a later design contract adds one.

### Responsive behavior

The media surface scales within its parent without horizontal overflow. Detail pages may give it the primary responsive column; cards use a compact stable ratio. Exact ratio is a local media-format constraint, not a new brand token.

### RTL and mixed-direction behavior

Controls and surrounding labels follow RTL. The video pixels are never mirrored. URLs/UUIDs are not displayed; if a technical error identifier is shown to support staff, isolate it as LTR and do not expose storage details.

### Accessibility

Provide an accessible name/title, native controls, keyboard operation, visible focus for download/action controls, and a safe error/unavailable message. Do not use video as the only way to understand the Footage. Respect reduced motion and captions only when a prepared caption asset is actually available; do not invent one.

### Suggested shadcn primitives

`Button`, `Alert`, `Skeleton`, and `Card` for surrounding UI. The media element itself remains native HTML. No custom player primitive or streaming dependency is approved.

### Testing expectations

Test route URL construction for stream/download, explicit playback behavior, unavailable/error states, keyboard access, no autoplay, mobile-safe controls, and absence of original URLs/object keys from props or rendered markup. Existing public preview route tests remain the server-side authorization/delivery evidence.

### Dependencies and implementation blockers

Public preview delivery exists. A public Footage detail query/route is missing, and poster generation is intentionally missing. Entitlement-protected original downloads are also missing and are outside this contract.

## 5. Price / BuyNow Area

### Purpose

Present the authoritative integer-Toman price and expose the boundary that starts the single-Footage Buy Now flow.

### Responsibility

- Display integer Toman using the existing `formatTomanDisplay` formatter.
- Reflect anonymous, authenticated, and unknown session states.
- Provide pending, disabled, success, and error UI for the action boundary.
- For anonymous users, direct to the existing customer OTP authentication flow with a safe internal continuation destination preserving the intended Footage.
- Keep server-authoritative price and commerce decisions outside the component.

### Non-responsibilities

No price acceptance from the browser, order creation, payment initiation/verification, entitlement, invoice generation, payment-provider integration, or original download authorization. Do not invent a purchase endpoint.

### Semantic structure

Use a labelled price region and a real button or link for Buy Now. The action should be adjacent to, but semantically distinct from, the price. Errors use an accessible alert/status region. The route/page owns the server-derived price and session state.

### Data requirements

Required: integer `priceToman`, Footage slug/UUID as needed by the approved continuation boundary, and session state. The price must come from a server-side Footage query and must never be trusted from a submitted hidden field.

### Proposed TypeScript props

```ts
type BuyNowAreaProps = {
  footage: { id: string; slug: string; priceToman: number };
  session: "anonymous" | "authenticated" | "unknown";
  authenticationHref?: string;
  onBuyNow?: (footageId: string) => void;
};
```

`authenticationHref`, when supplied for an anonymous customer, must already be a validated internal path or be constructed by the owning server boundary. The component must not accept an arbitrary external URL. `onBuyNow` is used only at the approved authenticated commerce boundary; it does not create an order or claim payment success.

### State model

Session state is `anonymous | authenticated | unknown`. Action state is `idle | pending | success | error | disabled`. Unknown session disables or defers the action until the server resolves the state; it must not guess that the customer is authenticated. Success means only that the approved action boundary completed; it must not claim verified payment or entitlement unless a future commerce contract explicitly defines that response.

### Interaction behavior

Anonymous Buy Now follows the `authenticationHref` supplied by the owning route when that boundary exists; this contract does not invent a session route or continuation parameter. Authenticated behavior invokes only the supplied `onBuyNow` boundary. Neither path automatically initiates payment or creates an order inside the component. Pending disables duplicate activation. Server errors are rendered safely and do not expose provider details.

### Responsive behavior

Keep price and action readable in a narrow detail layout; the action may become full-width on mobile and remain compact beside the price on larger screens. Do not let long Persian/Latin titles or localized numerals overflow.

### RTL and mixed-direction behavior

Price presentation follows Persian UI conventions, using the existing formatter and isolating numeric content when necessary. The تومان label remains understandable in RTL. Technical IDs, slugs, and internal continuation values are not visibly rendered; if exposed for support, isolate them LTR.

### Accessibility

Use a real button/link, an explicit Persian accessible name, disabled semantics during pending/unknown states, visible focus, and an alert/status region for expected failures. Do not communicate financial success optimistically.

### Suggested shadcn primitives

`Button`, `Card`, `Badge` for optional status, `Alert`, and `Spinner` composed with a disabled button for pending state. No purchase-specific primitive is approved.

### Testing expectations

Test exact integer-Toman formatting, anonymous OTP redirect and safe internal continuation, authenticated/unknown session rendering, pending duplicate-click prevention, safe error handling, and that client-submitted price cannot define the server price. Commerce/payment/entitlement tests belong to their owning modules and future tasks.

### Dependencies and implementation blockers

The existing formatter and customer OTP/session modules exist, but a customer-facing authenticated purchase continuation boundary is not yet implemented. Public Footage detail data exists only as an Admin surface; public detail query is missing. Commerce purchase orchestration, payment verification, entitlement, and invoice flows are missing and intentionally not implemented here.

## Unresolved product and integration decisions

- The final public filter set and its URL parameter schema remain owned by the catalog/search tasks; this contract does not choose categories, tags, technical metadata, price, or sort capabilities.
- The primary cover is persisted in `FootageCover`, delivered through `/api/footage/[id]/cover`, and must be present for published catalog DTOs. Cover replacement is Admin-only and does not remove the active cover until a validated replacement is stored.
- The customer OTP continuation UX and the authenticated Buy Now action boundary are not yet implemented; no route or payment API is assumed here.
- Access to files added to a Footage after an earlier purchase remains unresolved and is outside these storefront contracts.
- Final legal/tax invoice fields remain unresolved and are outside this UI contract.

## Architecture and readiness matrix

| Capability                               | Current status                                  | Contract consequence                                                                                         |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Public catalog query/API                 | Missing                                         | FootageCard, SearchBar, and FilterControls await a server-owned public query/DTO.                            |
| Public Footage detail query              | Missing                                         | Detail composition and Buy Now data await slug resolution and a public-safe DTO.                             |
| Search/filter query implementation       | Missing                                         | URL schema is defined, but server validation/query behavior must be implemented in catalog work.             |
| Primary manual cover                     | Existing                                        | Published DTOs and FootageCard/detail receive `/api/footage/[id]/cover`; no automatic extraction is allowed. |
| Public preview delivery                  | Existing                                        | Use the UUID preview route and `mode=download`; only published READY previews qualify.                       |
| Customer authentication                  | Existing                                        | Anonymous Buy Now may hand off to customer OTP; continuation implementation is outside UI-02.                |
| Commerce/purchase orchestration          | Missing                                         | Buy Now stops at an approved future commerce boundary; no endpoint is invented.                              |
| Entitlement-protected original downloads | Missing                                         | Original files remain outside storefront contracts and must not be exposed by these components.              |
| shadcn primitives                        | Available as project capability, none installed | Add only the primitives needed by a later implementation; do not populate `src/components/ui/` during UI-02. |

## Ownership summary

- `src/components/ui/`: shared shadcn/Base UI primitives only.
- Domain storefront components: Footage/catalog-owned presentation and small client islands, with no Prisma or provider imports.
- Public Footage DTOs and queries: server-side Footage/catalog application boundary.
- Route-level composition and URL parsing: public App Router pages and catalog query parsing; URL ownership remains explicit.
- Commerce orchestration: purchase/payment/entitlement/invoice modules; the Price/BuyNow area only starts or redirects to that boundary.

No component contract in this document authorizes a new route, API, schema, dependency, media service, or commerce behavior.
