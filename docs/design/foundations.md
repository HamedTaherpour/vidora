# Vidora Design Foundations

## Approved direction

Vidora uses a professional marketplace visual direction for a Persian-first video-footage storefront and its operational Admin area. V1 is light-only in product behavior. The approved dark tokens remain defined for future use, but no theme switcher is implemented.

The design system uses Tailwind CSS v4, the existing `base-nova` shadcn style, Base UI primitives, and Lucide icons. Do not apply a shadcn preset or introduce another component library.

## Color tokens

The following values are authoritative and must not be changed without a product-owner design decision.

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

The interface language is Persian (`fa`) and uses Vazirmatn for both Storefront and Admin. Vazirmatn is loaded locally through the official `vazirmatn` package, with only the approved weights: 400, 500, 600, and 700. The package is distributed under the SIL Open Font License 1.1. There is no runtime Google Fonts dependency.

| Role  | Size | Line height | Utility         |
| ----- | ---: | ----------: | --------------- |
| Small | 12px |        20px | `text-ui-small` |
| Body  | 14px |        24px | `text-ui-body`  |
| H1    | 32px |        44px | `text-ui-h1`    |
| H2    | 24px |        36px | `text-ui-h2`    |
| H3    | 20px |        32px | `text-ui-h3`    |

These roles are available for new UI. Existing screens should not be redesigned solely to force the scale onto unrelated work.

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

Storefront composition uses `container-storefront` and is optimized for Persian discovery and purchase flows. Admin composition uses `container-admin` and remains operationally focused. Neither area is redesigned by the foundation task.

Design tokens are the default contract. A component may use a local value only when the value is required by an external format, media ratio, browser behavior, or an approved component contract. Such exceptions should remain local and be documented when they affect the visual system. Do not alter token values, add a theme switcher, apply presets, or add a second theming system without an approved design decision.
