export const UI_MOCK_SCENARIOS = [
  "populated",
  "empty",
  "loading",
  "error",
  "unavailable",
] as const;

export type UiMockScenario = (typeof UI_MOCK_SCENARIOS)[number];

export type UiMockResult<T> =
  | { scenario: "populated"; status: "ready"; data: T }
  | { scenario: "empty"; status: "empty"; data: T }
  | { scenario: "loading"; status: "loading"; data: null }
  | { scenario: "error"; status: "error"; data: null; messageFa: string }
  | {
      scenario: "unavailable";
      status: "unavailable";
      data: T | null;
      messageFa: string;
    };

export type UiMockFixtureSet<T> = {
  populated: T;
  empty: T;
  unavailable?: T | null;
  errorMessageFa?: string;
};

/**
 * Selects an explicitly requested fixture state. There is no environment or
 * request-based fallback, so production code cannot silently opt into mocks.
 */
export function selectUiMockScenario<T>(
  scenario: UiMockScenario,
  fixtures: UiMockFixtureSet<T>,
): UiMockResult<T> {
  if (scenario === "populated") {
    return {
      scenario,
      status: "ready",
      data: cloneFixture(fixtures.populated),
    };
  }

  if (scenario === "empty") {
    return { scenario, status: "empty", data: cloneFixture(fixtures.empty) };
  }

  if (scenario === "loading") {
    return { scenario, status: "loading", data: null };
  }

  if (scenario === "error") {
    return {
      scenario,
      status: "error",
      data: null,
      messageFa:
        fixtures.errorMessageFa ?? "بارگذاری اطلاعات با مشکل روبه‌رو شد.",
    };
  }

  return {
    scenario,
    status: "unavailable",
    data:
      fixtures.unavailable === undefined || fixtures.unavailable === null
        ? null
        : cloneFixture(fixtures.unavailable),
    messageFa: "این بخش فعلاً در دسترس نیست.",
  };
}

export function cloneFixture<T>(fixture: T): T {
  return structuredClone(fixture);
}
