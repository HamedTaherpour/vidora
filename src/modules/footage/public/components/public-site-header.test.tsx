import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";

describe("PublicSiteHeader", () => {
  it("renders the sticky public navigation with a readable glass surface", () => {
    const html = renderToStaticMarkup(<PublicSiteHeader />);

    expect(html).toContain('data-slot="public-site-header"');
    expect(html).toContain("data-sticky-header");
    expect(html).toContain('href="/#catalog-heading"');
    expect(html).toContain('href="/session"');
  });
});
