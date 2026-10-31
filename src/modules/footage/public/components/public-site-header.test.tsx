import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  createPublicCategoryHref,
  PublicSiteHeader,
} from "@/modules/footage/public/components/public-site-header";

describe("PublicSiteHeader", () => {
  const categories = [
    { value: "nature", labelFa: "طبیعت" },
    { value: "urban", labelFa: "شهری" },
  ];

  it("renders the sticky public navigation and real destinations", () => {
    const html = renderToStaticMarkup(
      <PublicSiteHeader categories={categories} />,
    );

    expect(html).toContain('data-slot="public-site-header"');
    expect(html).toContain("data-sticky-header");
    expect(html).toContain("دسته‌بندی‌ها");
    expect(html).toContain('href="/footage"');
    expect(html).toContain('href="/login"');
    expect(html).toContain("ورود به حساب");
    expect(html).toContain('aria-label="باز کردن منوی ناوبری"');

    const navigationIndex = html.indexOf('data-slot="navigation-menu"');
    const loginIndex = html.indexOf('href="/login"');
    expect(navigationIndex).toBeGreaterThan(-1);
    expect(navigationIndex).toBeLessThan(loginIndex);
  });

  it("builds real homepage category destinations", () => {
    expect(createPublicCategoryHref("طبیعت")).toBe(
      "/footage?category=%D8%B7%D8%A8%DB%8C%D8%B9%D8%AA",
    );
  });
});
