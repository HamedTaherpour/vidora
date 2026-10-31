import { describe, expect, it } from "vitest";

import {
  calculatePreviewProgress,
  hasPointerMovedBeyondThreshold,
} from "./footage-card.utils";

describe("footage preview utilities", () => {
  it("calculates bounded playback progress", () => {
    expect(calculatePreviewProgress(5, 20)).toBe(25);
    expect(calculatePreviewProgress(-1, 20)).toBe(0);
    expect(calculatePreviewProgress(30, 20)).toBe(100);
  });

  it("returns zero for invalid playback durations", () => {
    expect(calculatePreviewProgress(5, 0)).toBe(0);
    expect(calculatePreviewProgress(5, Number.NaN)).toBe(0);
    expect(calculatePreviewProgress(Number.NaN, 20)).toBe(0);
  });

  it("detects pointer movement beyond the configured threshold", () => {
    const start = { x: 10, y: 10 };

    expect(hasPointerMovedBeyondThreshold(start, { x: 16, y: 18 }, 10)).toBe(
      false,
    );
    expect(hasPointerMovedBeyondThreshold(start, { x: 17, y: 18 }, 10)).toBe(
      true,
    );
  });
});
