import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names for the UI foundation", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });
});
