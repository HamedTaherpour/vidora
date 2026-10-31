import { describe, expect, it } from "vitest";

import { loadAdminFootageCatalogMock } from "@/modules/ui-mock/fixtures/admin-footage";
import {
  loadCustomerSessionMock,
  loadLibraryMock,
} from "@/modules/ui-mock/fixtures/customer-presentations";
import {
  loadPublicFootageMock,
  publicFootageFixtures,
} from "@/modules/ui-mock/fixtures/public-footage";

describe("UI mock fixtures", () => {
  it("returns deterministic public fixture data", () => {
    expect(loadPublicFootageMock("populated")).toEqual(
      loadPublicFootageMock("populated"),
    );
    expect(loadPublicFootageMock("populated").data).toHaveLength(
      publicFootageFixtures.length,
    );
  });

  it("keeps public category fixtures ordered and complete", () => {
    expect(publicFootageFixtures.map((item) => item.category.slug)).toEqual([
      "nature",
      "urban",
      "travel",
      "technology",
      "business",
      "sports",
      "food",
      "lifestyle",
    ]);
    expect(
      new Set(publicFootageFixtures.map((item) => item.category.slug)).size,
    ).toBe(8);
  });

  it("keeps protected media fields out of public fixtures", () => {
    const serialized = JSON.stringify(loadPublicFootageMock("populated"));

    expect(serialized).not.toContain("objectKey");
    expect(serialized).not.toContain("storage");
    expect(serialized).not.toContain("credential");
    expect(serialized).not.toContain("original");
  });

  it("keeps Admin-only draft data out of the public fixture", () => {
    const publicData = JSON.stringify(loadPublicFootageMock("populated"));
    const adminData = loadAdminFootageCatalogMock("populated");

    expect(publicData).not.toContain("پیش‌نویس");
    expect(adminData.data?.items.some((item) => item.status === "DRAFT")).toBe(
      true,
    );
  });

  it("exposes every explicit scenario without production fallback", () => {
    expect(loadPublicFootageMock("empty")).toMatchObject({
      status: "empty",
      data: [],
    });
    expect(loadCustomerSessionMock("loading")).toEqual({
      scenario: "loading",
      status: "loading",
      data: null,
    });
    expect(loadLibraryMock("error")).toMatchObject({
      scenario: "error",
      status: "error",
      data: null,
    });
  });

  it("does not mutate shared fixture constants", () => {
    const first = loadPublicFootageMock("populated");

    if (first.data !== null && first.status === "ready") {
      first.data[0]!.titleFa = "تغییر آزمایشی";
    }

    expect(loadPublicFootageMock("populated").data?.[0]?.titleFa).toBe(
      publicFootageFixtures[0]?.titleFa,
    );
  });
});
