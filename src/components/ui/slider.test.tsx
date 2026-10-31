import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Slider } from "./slider";

describe("Slider direction contract", () => {
  it("preserves logical minimum/maximum thumb order in RTL", () => {
    const html = renderToStaticMarkup(
      <Slider
        direction="rtl"
        value={[220000, 450000]}
        min={220000}
        max={450000}
        getAriaLabel={(index) => (index === 0 ? "حداقل قیمت" : "حداکثر قیمت")}
      />,
    );

    expect(html).toContain('data-direction="rtl"');
    expect(html.indexOf('aria-label="حداقل قیمت"')).toBeLessThan(
      html.indexOf('aria-label="حداکثر قیمت"'),
    );
  });
});
