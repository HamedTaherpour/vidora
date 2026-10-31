import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { PublicHomePage } from "@/modules/footage/public/components/public-home-page";
import { TextHighlight } from "@/modules/footage/public/components/text-highlight";
import {
  createHomepageCategoryUrl,
  createHomepageClearUrl,
  createHomepageSearchUrl,
  createHomepageSearchControlsKey,
  createHomepageUrl,
} from "@/modules/footage/public/components/homepage-search-controls";
import { loadPublicFootageMock } from "@/modules/ui-mock/fixtures/public-footage";

describe("PublicHomePage", () => {
  it("renders the Persian shell and public footage links", () => {
    const result = loadPublicFootageMock("populated");
    const html = renderToStaticMarkup(
      <PublicHomePage
        footage={result.data ?? []}
        scenario={result.scenario}
        query=""
        category=""
        categories={[{ value: "nature", labelFa: "طبیعت" }]}
      />,
    );

    expect(html).toContain("پرواز پرندگان بر فراز کوهستان");
    expect(html).toContain('href="/footage/پرواز-پرندگان-بر-فراز-کوهستان"');
    expect(html).toContain('href="/session"');
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signedUrl");
    expect(html).toContain('aria-label="جست‌وجو و فیلتر فوتیج"');
    expect(html).toContain('id="homepage-search"');
    expect(html).toContain("جست‌وجو");
    expect(html).toContain('data-slot="hero-copy"');
    expect(html).toContain('data-slot="hero-atmosphere"');
    expect(html).toContain('data-slot="homepage-hero-frame"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("data-sticky-header");
    expect(html).toMatch(/logo-with-text\.png/);
    expect(html).not.toMatch(/hero-brand-mark/);
    const atmosphereHtml = html.match(
      /<div aria-hidden="true" data-slot="hero-atmosphere"[\s\S]*?<\/div><header/,
    )?.[0];
    expect(atmosphereHtml).toBeDefined();
    expect(atmosphereHtml).not.toContain("<svg");
    expect(atmosphereHtml).not.toContain("linear-gradient");
    expect(atmosphereHtml).toContain("bg-foreground");
    expect(html).not.toContain("hero-background.webp");
    expect(html).toContain('href="#footage-listing"');
    expect(html).toContain('href="#homepage-categories"');
    expect(html).toContain('id="footage-listing"');
    expect(html).toContain('id="homepage-categories"');
    expect(html).not.toContain('aria-label="پاک کردن جست‌وجو و فیلترها"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("فوتیج‌های");
    expect(html).not.toContain("تصویر متفاوت");
    expect(html).toContain(
      "مجموعه‌ای از ویدئوهای استوک باکیفیت برای ساختن داستانی که توی ذهنته.",
    );
  });

  it("renders arbitrary RTL child content in the reusable text highlight", () => {
    const html = renderToStaticMarkup(
      <TextHighlight>
        <strong>تأکید چندکلمه‌ای</strong>
      </TextHighlight>,
    );

    expect(html).toContain('dir="auto"');
    expect(html).toContain("<strong>تأکید چندکلمه‌ای</strong>");
  });

  it("shows clear when an applied query or category is present", () => {
    const result = loadPublicFootageMock("populated");
    const queryHtml = renderToStaticMarkup(
      <PublicHomePage
        footage={result.data ?? []}
        scenario={result.scenario}
        query="بارانی"
        category=""
        categories={[{ value: "urban", labelFa: "شهری" }]}
      />,
    );
    const categoryHtml = renderToStaticMarkup(
      <PublicHomePage
        footage={result.data ?? []}
        scenario={result.scenario}
        query=""
        category="urban"
        categories={[{ value: "urban", labelFa: "شهری" }]}
      />,
    );

    expect(queryHtml).toContain('aria-label="پاک کردن جست‌وجو و فیلترها"');
    expect(categoryHtml).toContain('aria-label="پاک کردن جست‌وجو و فیلترها"');

    const categoryIndex = categoryHtml.indexOf('data-control="category"');
    const inputIndex = categoryHtml.indexOf('data-control="search-input"');
    const clearIndex = categoryHtml.indexOf('data-control="clear"');
    const submitIndex = categoryHtml.indexOf('data-control="submit"');

    expect(categoryIndex).toBeLessThan(inputIndex);
    expect(inputIndex).toBeLessThan(clearIndex);
    expect(clearIndex).toBeLessThan(submitIndex);
  });

  it.each([
    ["empty", "هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد"],
    ["loading", "در حال بارگذاری فوتیج‌ها"],
    ["error", "نمایش فوتیج‌ها ممکن نیست"],
    ["unavailable", "فوتیج‌ها فعلاً در دسترس نیستند"],
  ] as const)("renders the %s fixture state", (scenario, text) => {
    const result = loadPublicFootageMock(scenario);
    const html = renderToStaticMarkup(
      <PublicHomePage
        footage={result.data ?? []}
        scenario={result.scenario}
        query=""
        category=""
        categories={[{ value: "nature", labelFa: "طبیعت" }]}
        messageFa={"messageFa" in result ? result.messageFa : undefined}
      />,
    );

    expect(html).toContain(text);
    expect(html.match(/<h1\b/g)).toHaveLength(1);

    if (scenario === "unavailable") {
      expect(html).toContain("تصویر جلد در دسترس نیست");
      expect(html).toContain("حرکت آرام دوربین در خیابان‌های بارانی تهران");
    }
  });

  it("preserves applied URL state while building homepage navigation", () => {
    expect(createHomepageSearchControlsKey("قدیمی", "populated")).not.toBe(
      createHomepageSearchControlsKey("", "populated"),
    );
    expect(
      createHomepageUrl({
        query: " بارانی ",
        category: "urban",
        scenario: "populated",
      }),
    ).toBe(
      "/?q=%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C&category=urban&scenario=populated",
    );
    expect(
      createHomepageUrl({ query: "", category: "", scenario: "populated" }),
    ).toBe("/?scenario=populated");

    expect(
      createHomepageSearchUrl({
        draftQuery: " بارانی ",
        category: "urban",
        scenario: "populated",
      }),
    ).toBe(
      "/?q=%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C&category=urban&scenario=populated",
    );
    expect(
      createHomepageCategoryUrl({
        query: "بارانی",
        category: "nature",
        scenario: "populated",
      }),
    ).toBe(
      "/?q=%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C&category=nature&scenario=populated",
    );
    expect(createHomepageClearUrl("populated")).toBe("/?scenario=populated");
  });
});
