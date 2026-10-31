import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import { PublicFootageListView } from "@/modules/footage/public/components/footage-list/public-footage-list-view";

const footage = {
  id: "footage-1",
  slug: "nature-1",
  titleFa: "نمایش طبیعت",
  priceToman: 120_000,
  category: { slug: "nature", nameFa: "طبیعت" },
  cover: {
    status: "ready" as const,
    src: "/api/footage/footage-1/cover",
    altFa: "نمایش طبیعت",
  },
  preview: { status: "ready" as const },
};

describe("FootageCard", () => {
  it("renders an accessible Persian card without private media data or autoplay", () => {
    const html = renderToStaticMarkup(<FootageCard footage={footage} />);

    expect(html).toContain("نمایش طبیعت");
    expect(html).toContain("طبیعت");
    expect(html).toContain("تومان");
    expect(html).toContain('href="/footage/nature-1"');
    expect(html).toContain("پیش‌نمایش آماده است");
    expect(html).toContain('<span dir="ltr">۱۲۰٬۰۰۰</span>');
    expect(html).toContain("<span>تومان</span>");
    expect(html).toContain(
      'aria-label="نمایش طبیعت — طبیعت — پیش‌نمایش آماده است"',
    );
    expect(html).not.toContain('<p class="mt-auto font-medium" dir="ltr">');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<video");
    expect(html).not.toContain("autoplay");
    expect(html).toContain('src="/api/footage/footage-1/cover"');
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signed");
    expect(html).toContain("<article");
  });

  it("renders the deliberate unavailable-preview fallback", () => {
    const html = renderToStaticMarkup(
      <FootageCard
        footage={{ ...footage, preview: { status: "unavailable" } }}
      />,
    );

    expect(html).toContain("پیش‌نمایش در دسترس نیست");
    expect(html).toContain("نمایش طبیعت");
    expect(html).toContain("طبیعت");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<video");
  });

  it("renders a safe 16:9 fallback when the cover is unavailable", () => {
    const html = renderToStaticMarkup(
      <FootageCard
        footage={{
          ...footage,
          cover: {
            status: "unavailable",
            altFa: "تصویر جلد در دسترس نیست",
          },
        }}
      />,
    );

    expect(html).toContain("تصویر جلد در دسترس نیست");
    expect(html).toContain("aspect-video");
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signed");
    expect(html).not.toContain("<img");
  });
});

describe("PublicFootageListView", () => {
  it("renders the empty state", () => {
    const html = renderToStaticMarkup(<PublicFootageListView footage={[]} />);

    expect(html).toContain("هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد");
    expect(html).toContain('role="status"');
  });

  it("distinguishes a filtered no-match state from an empty catalog", () => {
    const html = renderToStaticMarkup(
      <PublicFootageListView footage={[]} query="وجود ندارد" />,
    );

    expect(html).toContain("با این جست‌وجو یا دسته‌بندی فوتیجی پیدا نشد");
    expect(html).not.toContain("هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد");
  });

  it("renders a responsive listing grid", () => {
    const html = renderToStaticMarkup(
      <PublicFootageListView footage={[footage]} />,
    );

    expect(html).toContain("container-storefront");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("xl:grid-cols-4");
  });
});
