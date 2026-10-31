import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FootageDetailPage } from "./footage-detail-preview-page";
import { preparePublicFootageDetail } from "../prepare-public-footage-detail";

const slug = "پرواز-پرندگان-بر-فراز-کوهستان";

describe("FootageDetailPage", () => {
  it("renders the approved Commerce structure with public-safe fixture data", () => {
    const footage = preparePublicFootageDetail(slug);
    expect(footage).not.toBeNull();

    const html = renderToStaticMarkup(<FootageDetailPage footage={footage!} />);

    expect(html).toContain("پرواز پرندگان بر فراز کوهستان");
    expect(html).toContain("controls");
    expect(html).toContain("خرید تکی فوتیج");
    expect(html).toContain("ورود و ادامه خرید");
    expect(html).toContain("وضعیت حساب نامشخص");
    expect(html).not.toContain("objectKey");
    expect(html).not.toContain("signedUrl");
  });

  it("renders an actionable fallback when the preview is unavailable", () => {
    const footage = preparePublicFootageDetail(slug, "unavailable");
    const html = renderToStaticMarkup(<FootageDetailPage footage={footage!} />);

    expect(html).toContain("پیش‌نمایش فعلاً آماده پخش نیست");
    expect(html).not.toContain("<video");
    expect(html).toContain("این پیش‌نمایش فقط رابط کاربری است");
  });

  it("returns null for an invalid slug", () => {
    expect(preparePublicFootageDetail("فوتیج-ناموجود")).toBeNull();
  });
});
