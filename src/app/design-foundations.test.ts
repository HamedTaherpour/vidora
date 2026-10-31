import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(
  new URL("./globals.css", import.meta.url),
  "utf8",
);
const layoutSource = readFileSync(
  new URL("./layout.tsx", import.meta.url),
  "utf8",
);
const componentsConfig = readFileSync(
  new URL("../../components.json", import.meta.url),
  "utf8",
);
const foundations = readFileSync(
  new URL("../../docs/design/foundations.md", import.meta.url),
  "utf8",
);

function cssBlock(selector: string) {
  const match = globalsCss.match(
    new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`),
  );
  expect(match, `Expected ${selector} CSS block`).not.toBeNull();
  return match?.[1] ?? "";
}

function cssTokens(block: string) {
  return new Set(
    [...block.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((match) => match[1]),
  );
}

describe("approved design foundations", () => {
  it("preserves the approved light and dark semantic tokens", () => {
    const approvedTokens = [
      "--background: oklch(1 0 0)",
      "--foreground: oklch(0.145 0 0)",
      "--primary: oklch(0.525 0.223 3.958)",
      "--primary-foreground: oklch(0.971 0.014 343.198)",
      "--muted: oklch(0.97 0 0)",
      "--border: oklch(0.922 0 0)",
      "--radius: 0.625rem",
      "--background: oklch(0.145 0 0)",
      "--primary: oklch(0.459 0.187 3.815)",
      "--muted: oklch(0.269 0 0)",
      "--sidebar-primary: oklch(0.656 0.241 354.308)",
    ];

    for (const token of approvedTokens) {
      expect(globalsCss).toContain(token);
    }
  });

  it("keeps the theme token structure syntactically complete and consistent", () => {
    const rootTokens = cssTokens(cssBlock(":root"));
    const darkTokens = cssTokens(cssBlock("\\.dark"));
    const themeTokens = cssTokens(cssBlock("@theme inline"));
    const semanticTokens = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "border",
      "input",
      "ring",
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ];

    for (const token of semanticTokens) {
      expect(rootTokens).toContain(`--${token}`);
      expect(darkTokens).toContain(`--${token}`);
      expect(themeTokens).toContain(`--color-${token}`);
    }

    expect(rootTokens).toContain("--radius");
    expect(themeTokens).toContain("--radius-lg");
    expect(globalsCss).not.toMatch(/--[\w-]+\s*:\s*;|--[\w-]+\s*:\s*$/m);
    expect((globalsCss.match(/\{/g) ?? []).length).toBe(
      (globalsCss.match(/\}/g) ?? []).length,
    );
  });

  it("defines the Persian root and preserves the approved shadcn configuration", () => {
    expect(layoutSource).toContain('lang="fa"');
    expect(layoutSource).toContain('dir="rtl"');
    expect(layoutSource).toContain("next/font/local");
    expect(JSON.parse(componentsConfig)).toMatchObject({
      style: "base-nova",
      iconLibrary: "lucide",
      rtl: true,
    });
  });

  it("exposes semantic typography and container utilities", () => {
    expect(globalsCss).not.toContain("text-ui-");
    expect(foundations).toContain("text-xs leading-5");
    expect(foundations).toContain("text-sm leading-6");
    expect(globalsCss).toContain("@utility container-storefront");
    expect(globalsCss).toContain("@utility container-admin");
    expect(globalsCss).toContain("max-width: 80rem");
    expect(globalsCss).toContain("max-width: 90rem");
  });
});
