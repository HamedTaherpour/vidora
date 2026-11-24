import { describe, expect, it } from "vitest";

import {
  createCustomerLibraryDetailHref,
  filterCustomerLibraryItems,
  getCustomerLibraryStateCopy,
} from "./customer-library";
import { publicFootageDevelopmentFixtures } from "@/modules/footage/public/catalog/public-footage-development-fixtures";

describe("customer library data states", () => {
  it("keeps confirmed empty data distinct from an unavailable source", () => {
    const empty = getCustomerLibraryStateCopy("empty");
    const unavailable = getCustomerLibraryStateCopy("unavailable");

    expect(empty.title).toContain("هنوز");
    expect(unavailable.title).toContain("در دسترس نیست");
    expect(empty.description).not.toContain("ساختگی");
    expect(unavailable.description).toContain("ساختگی");
  });

  it("provides a deliberate error state", () => {
    const error = getCustomerLibraryStateCopy("error");

    expect(error.title).toContain("ممکن نیست");
    expect(error.description).toContain("دوباره تلاش");
  });

  it("filters the library collection with Persian text and resets to all items", () => {
    const matching = filterCustomerLibraryItems(
      publicFootageDevelopmentFixtures,
      "  کوهستان  ",
    );

    expect(matching).toHaveLength(1);
    expect(matching[0].titleFa).toContain("کوهستان");
    expect(
      filterCustomerLibraryItems(
        publicFootageDevelopmentFixtures,
        "وجود ندارد",
      ),
    ).toHaveLength(0);
    expect(
      filterCustomerLibraryItems(publicFootageDevelopmentFixtures, ""),
    ).toHaveLength(publicFootageDevelopmentFixtures.length);
  });

  it("keeps detail navigation under the canonical customer library", () => {
    expect(createCustomerLibraryDetailHref("development-library-1")).toBe(
      "/dashboard/library/development-library-1",
    );
  });
});
