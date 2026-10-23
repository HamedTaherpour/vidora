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

describe("approved design foundations", () => {
  it("preserves the approved light and dark semantic tokens", () => {
    const approvedTokens = [
      "--background: oklch(1 0 0)",
      "--foreground: oklch(0.148 0.004 228.8)",
      "--primary: oklch(0.508 0.118 165.612)",
      "--primary-foreground: oklch(0.979 0.021 166.113)",
      "--muted: oklch(0.963 0.002 197.1)",
      "--border: oklch(0.925 0.005 214.3)",
      "--radius: 0.45rem",
      "--background: oklch(0.148 0.004 228.8)",
      "--primary: oklch(0.432 0.095 166.913)",
      "--muted: oklch(0.275 0.011 216.9)",
      "--sidebar-primary: oklch(0.696 0.17 162.48)",
    ];

    for (const token of approvedTokens) {
      expect(globalsCss).toContain(token);
    }
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
    expect(globalsCss).toContain("@utility text-ui-small");
    expect(globalsCss).toContain("@utility text-ui-body");
    expect(globalsCss).toContain("@utility text-ui-h1");
    expect(globalsCss).toContain("@utility container-storefront");
    expect(globalsCss).toContain("@utility container-admin");
    expect(globalsCss).toContain("max-width: 80rem");
    expect(globalsCss).toContain("max-width: 90rem");
  });
});
