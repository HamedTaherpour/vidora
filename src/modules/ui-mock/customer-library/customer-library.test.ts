import { describe, expect, it } from "vitest";
import {
  customerInvoiceFixture,
  customerLibraryFixtures,
  customerPurchaseDetailFixture,
  loadCustomerLibraryMock,
} from "./fixtures";
import {
  isCustomerFileState,
  isCustomerLibraryScenario,
  isCustomerLibraryScreen,
  safeCustomerLibraryValue,
} from "./customer-library-utils";
import {
  customerLibraryHref,
  loadCustomerLibraryRouteData,
} from "./route-data";

describe("customer library preview fixtures", () => {
  it("accepts the final library screens", () => {
    expect(isCustomerLibraryScreen("library")).toBe(true);
    expect(isCustomerLibraryScreen("detail")).toBe(true);
    expect(isCustomerLibraryScreen("invoice")).toBe(true);
  });

  it("keeps fixture state selection explicit and deterministic", () => {
    expect(loadCustomerLibraryMock("populated").data).toHaveLength(3);
    expect(loadCustomerLibraryMock("one-purchase").data).toHaveLength(1);
    expect(loadCustomerLibraryMock("empty")).toMatchObject({
      status: "empty",
      data: [],
    });
    expect(loadCustomerLibraryMock("loading")).toMatchObject({
      status: "loading",
      data: null,
    });
    expect(loadCustomerLibraryMock("error")).toMatchObject({
      status: "error",
      data: null,
    });
    expect(loadCustomerLibraryMock("unauthenticated")).toMatchObject({
      status: "unavailable",
      data: null,
    });
  });

  it("falls back safely for malformed preview query values", () => {
    expect(
      safeCustomerLibraryValue(
        "unknown",
        "populated",
        isCustomerLibraryScenario,
      ),
    ).toBe("populated");
    expect(
      safeCustomerLibraryValue(
        "access-denied",
        "available",
        isCustomerFileState,
      ),
    ).toBe("access-denied");
    expect(isCustomerLibraryScenario("unauthenticated")).toBe(true);
  });

  it("contains no private file access data and keeps invoice totals consistent", () => {
    const serialized = JSON.stringify({
      customerLibraryFixtures,
      customerPurchaseDetailFixture,
      customerInvoiceFixture,
    });
    expect(serialized).not.toContain("objectKey");
    expect(serialized).not.toContain("signedUrl");
    expect(serialized).not.toContain("storage");
    expect(serialized).not.toContain("originalUrl");
    expect(customerInvoiceFixture.amountToman).toBe(
      customerPurchaseDetailFixture.priceToman,
    );
    expect(
      customerPurchaseDetailFixture.files.every((file) => !("url" in file)),
    ).toBe(true);
  });

  it("keeps final route navigation internal and purchase-scoped", async () => {
    expect(customerLibraryHref("library", "populated")).toBe(
      "/library?scenario=populated",
    );
    expect(customerLibraryHref("invoice", "populated")).toBe(
      "/library/PUR-2026-00041/invoice?scenario=populated",
    );

    const missingPurchase = await loadCustomerLibraryRouteData(
      Promise.resolve({ scenario: "populated" }),
      "detail",
      "PUR-unknown",
    );
    expect(missingPurchase.detail).toBeNull();
  });
});
