import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ActiveFilterBadges } from "./active-filter-badges";

const categories = [{ slug: "nature", nameFa: "طبیعت", count: 3 }];
const baseQuery = {
  query: "",
  category: "",
  minPrice: undefined,
  maxPrice: undefined,
  duration: "all" as const,
  sort: "relevance" as const,
  page: 1,
};

describe("ActiveFilterBadges", () => {
  it("renders a compact empty summary when no filters are selected", () => {
    const html = renderToStaticMarkup(
      <ActiveFilterBadges
        query={baseQuery}
        categories={categories}
        onRemove={vi.fn()}
      />,
    );

    expect(html).toContain("فیلتر فعالی وجود ندارد");
    expect(html).not.toContain("حذف");
  });

  it("keeps removable badges for selected filters", () => {
    const html = renderToStaticMarkup(
      <ActiveFilterBadges
        query={{ ...baseQuery, query: "کوهستان", category: "nature" }}
        categories={categories}
        onRemove={vi.fn()}
      />,
    );

    expect(html).toContain("کوهستان");
    expect(html).toContain("طبیعت");
    expect(html).toContain("حذف کوهستان");
  });
});
