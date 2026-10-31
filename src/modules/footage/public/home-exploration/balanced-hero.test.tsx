import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { preparePublicHomeCatalog } from "@/modules/footage/public/catalog/prepare-public-home";
import { BalancedHero } from "./balanced-hero";

describe("BalancedHero", () => {
  const catalog = preparePublicHomeCatalog("populated", {});

  it("renders the approved Search First hero with Refined Gradient", () => {
    const html = renderToStaticMarkup(
      <BalancedHero
        footage={catalog.footage}
        categories={catalog.categories}
      />,
    );

    expect(html).toContain('data-hero-variant="search-first"');
    expect(html).toContain('data-background-variant="gradient"');
    expect(html).toContain("چیزی که در قاب می‌خواهی، پیدا کن");
    expect(html).toContain('aria-label="جست‌وجو و فیلتر فوتیج"');
    expect(html).toContain("homepage-search");
  });

  it("preserves URL-owned search state and fixture detail links", () => {
    const html = renderToStaticMarkup(
      <BalancedHero
        footage={catalog.footage}
        categories={catalog.categories}
        query="بارانی"
        category="urban"
        scenarioParam="populated"
      />,
    );

    expect(html).toContain('value="بارانی"');
    expect(html).toContain('data-control="category"');
    expect(html).toContain("نمایی از کوهستان و آسمان صبحگاهی");
    expect(html).toContain('href="/footage/پرواز-پرندگان-بر-فراز-کوهستان"');
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signedUrl");
  });
});
