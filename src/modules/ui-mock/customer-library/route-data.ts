import {
  customerPurchaseDetailFixture,
  loadCustomerLibraryMock,
} from "./fixtures";
import {
  isCustomerFileState,
  isCustomerLibraryScenario,
  safeCustomerLibraryValue,
} from "./customer-library-utils";
import type {
  CustomerFileState,
  CustomerLibraryScenario,
  CustomerLibraryScreen,
} from "./types";

export type CustomerLibrarySearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function customerLibraryHref(
  screen: CustomerLibraryScreen,
  scenario: CustomerLibraryScenario = "populated",
  purchaseReference = customerPurchaseDetailFixture.purchaseReference,
) {
  if (screen === "library") return `/library?scenario=${scenario}`;
  if (screen === "detail") {
    return `/library/${purchaseReference}?scenario=${scenario}`;
  }
  return `/library/${purchaseReference}/invoice?scenario=${scenario}`;
}

export async function loadCustomerLibraryRouteData(
  searchParams: CustomerLibrarySearchParams,
  screen: CustomerLibraryScreen,
  purchaseReference = customerPurchaseDetailFixture.purchaseReference,
) {
  const params = await searchParams;
  const scenario = safeCustomerLibraryValue(
    first(params.scenario),
    "populated",
    isCustomerLibraryScenario,
  );
  const fileState = safeCustomerLibraryValue(
    first(params.fileState),
    "available",
    isCustomerFileState,
  );
  const libraryResult = loadCustomerLibraryMock(scenario);
  const items =
    libraryResult.status === "ready" || libraryResult.status === "empty"
      ? libraryResult.data
      : [];
  const detail = resolveDetail(fileState, purchaseReference);

  return { screen, scenario, items, detail, fileState };
}

function resolveDetail(
  fileState: CustomerFileState,
  purchaseReference: string,
) {
  if (
    fileState === "not-found" ||
    fileState === "access-denied" ||
    purchaseReference !== customerPurchaseDetailFixture.purchaseReference
  ) {
    return null;
  }
  if (fileState === "unavailable") {
    return {
      ...customerPurchaseDetailFixture,
      files: customerPurchaseDetailFixture.files.map((file) => ({
        ...file,
        state: "unavailable" as const,
      })),
    };
  }
  return customerPurchaseDetailFixture;
}
