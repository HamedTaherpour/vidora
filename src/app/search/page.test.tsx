import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace,
  }),
}));

import SearchPage from "./page";

describe("SearchPage public layout", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("composes one public header and footer without a Search clear-all action", async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ q: "طبیعت" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html.match(/data-slot="public-site-header"/g)).toHaveLength(1);
    expect(html.match(/<footer/g)).toHaveLength(1);
    expect(html).toContain('aria-label="فیلترهای فعال"');
    expect(html).toContain("حذف جست‌وجو: طبیعت");
    expect(html).not.toContain("پاک کردن همه");
  });

  it("keeps individual active-filter removal controls accessible", async () => {
    const page = await SearchPage({
      searchParams: Promise.resolve({ category: "nature", sort: "price-desc" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('aria-label="حذف دسته‌بندی: طبیعت"');
    expect(html).toContain('aria-label="حذف مرتب‌سازی: گران‌ترین"');
    expect(html).toContain("min-h-9");
  });
});
