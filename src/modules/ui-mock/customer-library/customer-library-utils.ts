import type {
  CustomerLibraryScenario,
  CustomerLibraryScreen,
  CustomerFileState,
} from "./types";

export function isCustomerLibraryScreen(
  value: string | undefined,
): value is CustomerLibraryScreen {
  return value === "library" || value === "detail" || value === "invoice";
}

export function isCustomerLibraryScenario(
  value: string | undefined,
): value is CustomerLibraryScenario {
  return (
    value === "populated" ||
    value === "one-purchase" ||
    value === "empty" ||
    value === "loading" ||
    value === "error" ||
    value === "unauthenticated"
  );
}

export function isCustomerFileState(
  value: string | undefined,
): value is CustomerFileState {
  return (
    value === "available" ||
    value === "unavailable" ||
    value === "access-denied" ||
    value === "not-found"
  );
}

export function safeCustomerLibraryValue<T extends string>(
  value: string | undefined,
  fallback: T,
  isValid: (candidate: string | undefined) => candidate is T,
): T {
  return isValid(value) ? value : fallback;
}
