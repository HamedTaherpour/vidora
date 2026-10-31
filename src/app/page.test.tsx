import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import Home from "./page";

describe("production homepage route", () => {
  it("renders the approved Balanced composition with URL-owned filters", async () => {
    const page = await Home({
      searchParams: Promise.resolve({
        q: "بارانی",
        category: "urban",
        scenario: "populated",
      }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-variant="balanced"');
    expect(html).toContain('data-hero-variant="search-first"');
    expect(html).toContain('data-background-variant="gradient"');
    expect(html).toContain('value="بارانی"');
    expect(html).toContain('id="homepage-categories"');
    expect(html).toContain('id="footage-listing"');
    expect(html).toContain('id="homepage-recent"');
    expect(html).toContain("homepage-blog-heading");
    expect(html).not.toContain("noindex / preview");
    expect(html).not.toContain("data-hero-atmosphere");
  });
});
