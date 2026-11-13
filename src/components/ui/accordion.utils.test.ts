import { describe, expect, it } from "vitest";
import { toggleAccordionOpenIds } from "./accordion.utils";

describe("toggleAccordionOpenIds", () => {
  it("closes the previous item when opening another in single mode", () => {
    expect(toggleAccordionOpenIds(["access"], "links")).toEqual(["links"]);
  });

  it("allows the current item to collapse", () => {
    expect(toggleAccordionOpenIds(["access"], "access")).toEqual([]);
  });

  it("keeps multiple items only when explicitly enabled", () => {
    expect(toggleAccordionOpenIds(["access"], "links", true)).toEqual([
      "access",
      "links",
    ]);
  });
});
