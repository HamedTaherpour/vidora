import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CustomerLoginForm } from "./customer-login-form";

describe("CustomerLoginForm", () => {
  it("renders the approved minimal form without public branding or navigation", () => {
    const html = renderToStaticMarkup(
      <CustomerLoginForm returnTo="/footage/morning-mountains" />,
    );

    expect(html).toContain('data-slot="minimal-customer-login"');
    expect(html).toContain("با شماره موبایل ادامه دهید");
    expect(html).toContain('id="customer-phone"');
    expect(html).not.toContain('data-slot="public-site-header"');
    expect(html).not.toContain("logo-with-text.png");
    expect(html).not.toContain("انتخاب گونه طراحی");
    expect(html).not.toContain("برندمحور");
    expect(html).not.toContain("ادیتوریال");
  });
});
