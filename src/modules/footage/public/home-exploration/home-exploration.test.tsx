import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { preparePublicHomeCatalog } from "@/modules/footage/public/catalog/prepare-public-home";
import { loadPublicFootageMock } from "@/modules/ui-mock/fixtures/public-footage";
import { HomeExploration } from "./home-exploration";

describe("promoted Balanced homepage composition", () => {
  const catalog = preparePublicHomeCatalog("populated", {});

  it("renders the approved hero and all Balanced sections", () => {
    const html = renderToStaticMarkup(
      <HomeExploration
        variant="balanced"
        footage={catalog.footage}
        categories={catalog.categories}
      />,
    );

    expect(html).toContain('data-variant="balanced"');
    expect(html).toContain('data-hero-variant="search-first"');
    expect(html).toContain('data-background-variant="gradient"');
    expect(html).toContain('id="homepage-categories"');
    expect(html).toContain('id="footage-listing"');
    expect(html).toContain('id="balanced-featured"');
    expect(html).toContain('id="homepage-recent"');
    expect(html).toContain("homepage-blog-heading");
    expect(html).toContain("پرواز پرندگان بر فراز کوهستان");
    expect(html).not.toContain("noindex / preview");
  });

  it("keeps fixture state messaging and fixture boundaries", () => {
    const unavailable = loadPublicFootageMock("unavailable");
    const html = renderToStaticMarkup(
      <HomeExploration
        variant="balanced"
        footage={unavailable.data ?? []}
        categories={catalog.categories}
        scenario="unavailable"
        messageFa={
          "messageFa" in unavailable ? unavailable.messageFa : undefined
        }
      />,
    );

    expect(html).toContain("فوتیج‌ها فعلاً در دسترس نیستند");
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signedUrl");
  });
});
