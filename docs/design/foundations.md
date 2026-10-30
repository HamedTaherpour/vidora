# Vidora Design Foundations

## Visual-direction status

The visual direction and token values below are historical implementation
context, not the approved target appearance. `UI-DESIGN-01` in
[`../ROADMAP.md`](../ROADMAP.md) must establish and receive approval for the
new MVP direction before Public or Admin UI work begins. Existing UI may be
inspected for behavior, data contracts, and security boundaries only; it must
not dictate the rebuilt appearance.

The technical constraints in this document remain applicable unless explicitly
superseded by approved design preparation: Persian-first `fa`/RTL, local
Vazirmatn delivery, semantic tokens, logical CSS properties, the configured
shadcn/Base UI stack, small client boundaries, accessibility, and no speculative
component-library or theme-system changes. V1 remains light-only unless a later
product decision changes that behavior.

The design system uses Tailwind CSS v4, the existing `base-nova` shadcn style, Base UI primitives, and Lucide icons. Do not apply a shadcn preset or introduce another component library.

## Color tokens

The following historical values remain the current implementation baseline. They
must not be treated as the visual target or changed during a page task; any
replacement is decided once, in approved `UI-DESIGN-01`, then applied by the
bounded rebuild tasks.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.148 0.004 228.8);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.148 0.004 228.8);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.148 0.004 228.8);
  --primary: oklch(0.508 0.118 165.612);
  --primary-foreground: oklch(0.979 0.021 166.113);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.963 0.002 197.1);
  --muted-foreground: oklch(0.56 0.021 213.5);
  --accent: oklch(0.963 0.002 197.1);
  --accent-foreground: oklch(0.218 0.008 223.9);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.925 0.005 214.3);
  --input: oklch(0.925 0.005 214.3);
  --ring: oklch(0.723 0.014 214.4);
  --chart-1: oklch(0.879 0.169 91.605);
  --chart-2: oklch(0.769 0.188 70.08);
  --chart-3: oklch(0.666 0.179 58.318);
  --chart-4: oklch(0.555 0.163 48.998);
  --chart-5: oklch(0.473 0.137 46.201);
  --radius: 0.45rem;
  --sidebar: oklch(0.987 0.002 197.1);
  --sidebar-foreground: oklch(0.148 0.004 228.8);
  --sidebar-primary: oklch(0.596 0.145 163.225);
  --sidebar-primary-foreground: oklch(0.979 0.021 166.113);
  --sidebar-accent: oklch(0.963 0.002 197.1);
  --sidebar-accent-foreground: oklch(0.218 0.008 223.9);
  --sidebar-border: oklch(0.925 0.005 214.3);
  --sidebar-ring: oklch(0.723 0.014 214.4);
}

.dark {
  --background: oklch(0.148 0.004 228.8);
  --foreground: oklch(0.987 0.002 197.1);
  --card: oklch(0.218 0.008 223.9);
  --card-foreground: oklch(0.987 0.002 197.1);
  --popover: oklch(0.218 0.008 223.9);
  --popover-foreground: oklch(0.987 0.002 197.1);
  --primary: oklch(0.432 0.095 166.913);
  --primary-foreground: oklch(0.979 0.021 166.113);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.275 0.011 216.9);
  --muted-foreground: oklch(0.723 0.014 214.4);
  --accent: oklch(0.275 0.011 216.9);
  --accent-foreground: oklch(0.987 0.002 197.1);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.56 0.021 213.5);
  --chart-1: oklch(0.879 0.169 91.605);
  --chart-2: oklch(0.769 0.188 70.08);
  --chart-3: oklch(0.666 0.179 58.318);
  --chart-4: oklch(0.555 0.163 48.998);
  --chart-5: oklch(0.473 0.137 46.201);
  --sidebar: oklch(0.218 0.008 223.9);
  --sidebar-foreground: oklch(0.987 0.002 197.1);
  --sidebar-primary: oklch(0.696 0.17 162.48);
  --sidebar-primary-foreground: oklch(0.262 0.051 172.552);
  --sidebar-accent: oklch(0.275 0.011 216.9);
  --sidebar-accent-foreground: oklch(0.987 0.002 197.1);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.56 0.021 213.5);
}
```

Use the semantic utilities (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, and their related tokens) instead of hardcoded brand colors in components.

## Typography

The interface language is Persian (`fa`) and uses Vazirmatn for both Storefront and Admin. The local asset `src/assets/fonts/Vazirmatn[wght].woff2` is copied from the official `vazirmatn` 33.0.3 distribution and supports weights 100–900, including the approved weights 400, 500, 600, and 700. The accompanying `src/assets/fonts/OFL.txt` preserves the SIL Open Font License 1.1 notice. There is no runtime Google Fonts or CDN dependency.

| Role  | Size | Line height | Utility         |
| ----- | ---: | ----------: | --------------- |
| Small | 12px |        20px | `text-ui-small` |
| Body  | 14px |        24px | `text-ui-body`  |
| H1    | 32px |        44px | `text-ui-h1`    |
| H2    | 24px |        36px | `text-ui-h2`    |
| H3    | 20px |        32px | `text-ui-h3`    |

These roles remain available as implementation context. The approved rebuild
direction will determine whether they remain the visual scale for new UI.

## Spacing, radius, and breakpoints

Use the standard Tailwind spacing scale and standard Tailwind breakpoints. The base radius is `0.45rem`, exposed through the shadcn-compatible `--radius-*` semantic mappings in `globals.css`.

## Containers

Use the reusable logical-direction utilities rather than copying widths into components:

- `container-storefront`: maximum width 1280px (`80rem`);
- `container-admin`: maximum width 1440px (`90rem`);
- horizontal gutter: 16px on mobile and 24px from the `md` breakpoint upward.

Both utilities use `margin-inline: auto` and `padding-inline`, so they remain correct in RTL and LTR contexts.

## RTL and LTR rules

The document root is `lang="fa"` and `dir="rtl"`. Admin inherits the root direction; its former nested RTL wrapper is intentionally removed to avoid conflicting direction ownership. Use logical properties and utilities (`margin-inline`, `padding-inline`, `text-start`, `text-end`) for layout.

Technical content that must remain LTR—such as slugs, URLs, file names, IDs, code, and numeric provider references—must be isolated with `dir="ltr"` at the smallest appropriate element.

## shadcn and component conventions

`components.json` preserves `base-nova`, Base UI, Tailwind v4, CSS variables, and Lucide. RTL generation is enabled. Use official shadcn primitives only when a real UI requirement needs them; do not populate `src/components/ui/` speculatively. Business behavior remains in its owning module, not in shared primitives.

## Composition and governance

Storefront composition uses `container-storefront`; Admin composition uses
`container-admin`. The new direction must retain their RTL-safe intent or make
an explicitly approved, scoped replacement. This historical foundation does not
approve the current Storefront or Admin visual presentation.

Design tokens are the default contract. A component may use a local value only when the value is required by an external format, media ratio, browser behavior, or an approved component contract. Such exceptions should remain local and be documented when they affect the visual system. Do not alter token values, add a theme switcher, apply presets, or add a second theming system without an approved design decision.
