import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { parseAdminFootageCatalogQuery } from "@/modules/footage/admin-footage-catalog-input";
import type {
  AdminFootageCatalogRow,
  AdminFootageCatalogStore,
} from "@/modules/footage/admin-footage-catalog-store";
import { AdminFootageCatalogView } from "@/modules/footage/admin-footage-catalog-view";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import { handleAdminFootageCatalogList } from "@/modules/footage/handle-admin-footage-catalog-list";
import { listAdminFootageCatalog } from "@/modules/footage/list-admin-footage-catalog";
import { loadAdminFootageEdit } from "@/modules/footage/load-admin-footage-edit";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";

const NOW = new Date("2026-10-07T12:00:00.000Z");
const ADMIN = {
  status: "authenticated" as const,
  adminId: "admin-1",
  phone: "+989121234567",
  expiresAt: NOW,
};
const ANONYMOUS = { status: "anonymous" as const };

const CATEGORY_A = {
  id: "11111111-1111-4111-8111-111111111111",
  nameFa: "طبیعت",
};
const CATEGORY_B = {
  id: "22222222-2222-4222-8222-222222222222",
  nameFa: "شهر",
};

function row(
  overrides: Partial<AdminFootageCatalogRow> &
    Pick<AdminFootageCatalogRow, "id" | "titleFa" | "slug" | "status">,
): AdminFootageCatalogRow {
  return {
    priceToman: 120_000,
    updatedAt: NOW,
    category: CATEGORY_A,
    ...overrides,
  };
}

function createMemoryCatalogStore(
  rows: AdminFootageCatalogRow[],
): AdminFootageCatalogStore {
  function matches(filterQ: string, item: AdminFootageCatalogRow): boolean {
    if (filterQ.length === 0) {
      return true;
    }

    const needle = filterQ.toLowerCase();
    return (
      item.titleFa.toLowerCase().includes(needle) ||
      item.slug.toLowerCase().includes(needle)
    );
  }

  function sortedFiltered(filterQ: string): AdminFootageCatalogRow[] {
    return [...rows]
      .filter((item) => matches(filterQ, item))
      .sort((a, b) => {
        const byUpdated = b.updatedAt.getTime() - a.updatedAt.getTime();
        if (byUpdated !== 0) {
          return byUpdated;
        }

        return b.id < a.id ? -1 : b.id > a.id ? 1 : 0;
      });
  }

  return {
    async countFootage(filter) {
      return sortedFiltered(filter.q).length;
    },

    async findFootagePage(query) {
      const start = (query.page - 1) * query.pageSize;
      return sortedFiltered(query.q).slice(start, start + query.pageSize);
    },
  };
}

describe("parseAdminFootageCatalogQuery", () => {
  it("trims search input and treats empty search as the full list", () => {
    expect(parseAdminFootageCatalogQuery({ q: "  ", page: "1" })).toEqual({
      q: "",
      page: 1,
    });
    expect(parseAdminFootageCatalogQuery({ q: "  جنگل  " }).q).toBe("جنگل");
  });

  it("falls back invalid page values to page 1", () => {
    expect(parseAdminFootageCatalogQuery({ page: "0" }).page).toBe(1);
    expect(parseAdminFootageCatalogQuery({ page: "-2" }).page).toBe(1);
    expect(parseAdminFootageCatalogQuery({ page: "abc" }).page).toBe(1);
    expect(parseAdminFootageCatalogQuery({}).page).toBe(1);
  });
});

describe("listAdminFootageCatalog", () => {
  const draft = row({
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    titleFa: "جنگل مه آلود",
    slug: "foggy-forest",
    status: "DRAFT",
    updatedAt: new Date("2026-10-07T10:00:00.000Z"),
    category: CATEGORY_A,
  });
  const published = row({
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    titleFa: "خیابان شب",
    slug: "night-street",
    status: "PUBLISHED",
    updatedAt: new Date("2026-10-07T11:00:00.000Z"),
    category: CATEGORY_B,
    priceToman: 250_000,
  });
  const older = row({
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    titleFa: "ساحل آرام",
    slug: "calm-beach",
    status: "DRAFT",
    updatedAt: new Date("2026-10-07T09:00:00.000Z"),
    category: CATEGORY_A,
  });

  it("includes DRAFT and PUBLISHED rows with Category identity", async () => {
    const result = await listAdminFootageCatalog({
      store: createMemoryCatalogStore([draft, published, older]),
      q: "",
      page: 1,
    });

    expect(result.items.map((item) => item.status).sort()).toEqual([
      "DRAFT",
      "DRAFT",
      "PUBLISHED",
    ]);
    expect(result.items.map((item) => item.category.nameFa)).toEqual([
      "شهر",
      "طبیعت",
      "طبیعت",
    ]);
  });

  it("uses deterministic updatedAt DESC then id DESC pagination", async () => {
    const sameTimeA = row({
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      titleFa: "A",
      slug: "a",
      status: "DRAFT",
      updatedAt: NOW,
    });
    const sameTimeB = row({
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      titleFa: "B",
      slug: "b",
      status: "PUBLISHED",
      updatedAt: NOW,
    });

    const result = await listAdminFootageCatalog({
      store: createMemoryCatalogStore([sameTimeA, sameTimeB, older]),
      q: "",
      page: 1,
      pageSize: 2,
    });

    expect(result.items.map((item) => item.id)).toEqual([
      sameTimeB.id,
      sameTimeA.id,
    ]);
    expect(result.totalPages).toBe(2);
  });

  it("searches by title and by slug", async () => {
    const store = createMemoryCatalogStore([draft, published, older]);

    const byTitle = await listAdminFootageCatalog({
      store,
      q: "جنگل",
      page: 1,
    });
    expect(byTitle.items.map((item) => item.slug)).toEqual(["foggy-forest"]);

    const bySlug = await listAdminFootageCatalog({
      store,
      q: "night-street",
      page: 1,
    });
    expect(bySlug.items.map((item) => item.titleFa)).toEqual(["خیابان شب"]);
  });

  it("treats empty search like the normal list", async () => {
    const store = createMemoryCatalogStore([draft, published]);
    const empty = await listAdminFootageCatalog({ store, q: "", page: 1 });
    const spaced = await listAdminFootageCatalog({
      store,
      q: parseAdminFootageCatalogQuery({ q: "   " }).q,
      page: 1,
    });

    expect(empty.items).toHaveLength(2);
    expect(spaced.items).toHaveLength(2);
  });

  it("handles empty catalog, empty search results, and page boundaries safely", async () => {
    const empty = await listAdminFootageCatalog({
      store: createMemoryCatalogStore([]),
      q: "",
      page: 1,
    });
    expect(empty.emptyReason).toBe("no_footage");

    const noResults = await listAdminFootageCatalog({
      store: createMemoryCatalogStore([draft]),
      q: "missing",
      page: 1,
    });
    expect(noResults.emptyReason).toBe("no_search_results");

    const outOfRange = await listAdminFootageCatalog({
      store: createMemoryCatalogStore([draft]),
      q: "",
      page: 9,
      pageSize: 50,
    });
    expect(outOfRange.emptyReason).toBe("page_out_of_range");
    expect(outOfRange.items).toEqual([]);
    expect(outOfRange.totalCount).toBe(1);
  });
});

describe("handleAdminFootageCatalogList authorization", () => {
  const store = createMemoryCatalogStore([
    row({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      titleFa: "نمونه",
      slug: "sample",
      status: "DRAFT",
    }),
  ]);

  it("denies anonymous access", async () => {
    await expect(
      handleAdminFootageCatalogList({
        admin: ANONYMOUS,
        searchParams: {},
        store,
      }),
    ).resolves.toEqual({ status: "denied" });
  });

  it("denies Customer sessions because they do not resolve as Admin", async () => {
    // A customer session cookie is ignored by resolveCurrentAdmin → anonymous.
    await expect(
      handleAdminFootageCatalogList({
        admin: ANONYMOUS,
        searchParams: {},
        store,
      }),
    ).resolves.toEqual({ status: "denied" });
  });

  it("allows Admin access", async () => {
    const result = await handleAdminFootageCatalogList({
      admin: ADMIN,
      searchParams: {},
      store,
    });

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.catalog.items).toHaveLength(1);
    }
  });
});

describe("loadAdminFootageEdit authorization", () => {
  const footageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const footage: AdminFootageRecord = {
    id: footageId,
    titleFa: "نمونه",
    slug: "sample",
    descriptionFa: "توضیح",
    priceToman: 1000,
    status: "DRAFT",
    categoryId: CATEGORY_A.id,
    tagIds: [],
    publishedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
  const store: AdminFootageStore = {
    async categoryExists() {
      return true;
    },
    async findExistingTagIds() {
      return [];
    },
    async createDraft() {
      throw new Error("unused");
    },
    async findById(id) {
      return id === footageId ? footage : null;
    },
    async updateMetadata() {
      throw new Error("unused");
    },
    async setPublished() {
      throw new Error("unused");
    },
    async setDraft() {
      throw new Error("unused");
    },
  };
  const optionsStore = {
    async listCategories() {
      return [CATEGORY_A];
    },
    async listTags() {
      return [];
    },
  };

  it("denies anonymous and non-Admin callers", async () => {
    await expect(
      loadAdminFootageEdit({
        admin: ANONYMOUS,
        footageId,
        store,
        optionsStore,
      }),
    ).resolves.toEqual({ status: "denied" });
  });

  it("allows Admin to load Footage for editing", async () => {
    const result = await loadAdminFootageEdit({
      admin: ADMIN,
      footageId,
      store,
      optionsStore,
    });

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.footage.id).toBe(footageId);
    }
  });
});

describe("AdminFootageCatalogView", () => {
  it("shows DRAFT/PUBLISHED state and Edit links by Footage id", () => {
    const html = renderToStaticMarkup(
      <AdminFootageCatalogView
        catalog={{
          items: [
            row({
              id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
              titleFa: "پیش‌نویس نمونه",
              slug: "draft-sample",
              status: "DRAFT",
            }),
            row({
              id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
              titleFa: "منتشرشده نمونه",
              slug: "published-sample",
              status: "PUBLISHED",
              category: CATEGORY_B,
            }),
          ],
          q: "",
          page: 1,
          pageSize: 50,
          totalCount: 2,
          totalPages: 1,
          emptyReason: null,
        }}
      />,
    );

    expect(html).toContain("پیش‌نویس");
    expect(html).toContain("منتشر شده");
    expect(html).toContain("DRAFT");
    expect(html).toContain("PUBLISHED");
    expect(html).toContain(
      'href="/admin/footage/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/edit"',
    );
    expect(html).toContain(
      'href="/admin/footage/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/edit"',
    );
  });

  it("renders empty list and empty search states clearly", () => {
    const emptyList = renderToStaticMarkup(
      <AdminFootageCatalogView
        catalog={{
          items: [],
          q: "",
          page: 1,
          pageSize: 50,
          totalCount: 0,
          totalPages: 0,
          emptyReason: "no_footage",
        }}
      />,
    );
    expect(emptyList).toContain("هنوز فوتیجی ثبت نشده است");

    const emptySearch = renderToStaticMarkup(
      <AdminFootageCatalogView
        catalog={{
          items: [],
          q: "هیچ",
          page: 1,
          pageSize: 50,
          totalCount: 0,
          totalPages: 0,
          emptyReason: "no_search_results",
        }}
      />,
    );
    expect(emptySearch).toContain("نتیجه‌ای برای این جستجو یافت نشد");
  });
});

describe("formatTomanDisplay", () => {
  it("formats integer Toman without Rial conversion", () => {
    expect(formatTomanDisplay(120_000)).toContain("تومان");
    expect(formatTomanDisplay(120_000)).not.toContain("ریال");
  });
});
