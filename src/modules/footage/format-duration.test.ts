import { describe, expect, it } from "vitest";

import { formatDuration } from "@/modules/footage/format-duration";

describe("formatDuration", () => {
  it("formats seconds as Persian mm:ss", () => {
    expect(formatDuration(24)).toBe("۰۰:۲۴");
    expect(formatDuration(125)).toBe("۰۲:۰۵");
  });

  it("handles missing and invalid durations safely", () => {
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(-1)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
  });
});
