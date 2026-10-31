import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { preparePublicFootageDetail } from "../detail/prepare-public-footage-detail";
import { purchaseJourneyStates } from "./purchase-journey.types";
import { PurchaseJourneyPage } from "./purchase-journey-page";

const footage = preparePublicFootageDetail("پرواز-پرندگان-بر-فراز-کوهستان")!;

describe("final Commerce purchase journey", () => {
  it("renders the recovered Commerce composition as the only purchase design", () => {
    const html = renderToStaticMarkup(
      <PurchaseJourneyPage
        footage={footage}
        initialState="verification-pending"
        authenticated
      />,
    );

    expect(html).toContain("خرید فوتیج");
    expect(html).toContain("۴۵۰٬۰۰۰ تومان");
    expect(html).toContain("بررسی سفارش");
    expect(html).toContain("مبلغ پرداخت");
    expect(html).toContain("کیفیت‌های قابل ارائه");
    expect(html).toContain("انتظار فاکتور رسمی");
    expect(html).toContain(
      "lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]",
    );
    expect(html).not.toContain("bg-foreground");
    expect(html).not.toContain("ادامه انتخاب");
    expect(html).not.toContain("تنوع ساختار");
    expect(html).not.toContain("مینیمال");
    expect(html).not.toContain("ادیتوریال");
    expect(html).not.toContain("/preview/purchase");
    expect(html).not.toContain("orderId");
    expect(html).not.toContain("signedUrl");
  });

  it("preserves provider-return and verified-success distinction", () => {
    const returned = renderToStaticMarkup(
      <PurchaseJourneyPage
        footage={footage}
        initialState="returned"
        authenticated
      />,
    );
    const success = renderToStaticMarkup(
      <PurchaseJourneyPage
        footage={footage}
        initialState="success"
        authenticated
      />,
    );

    expect(returned).toContain("هنوز تأیید نشده");
    expect(returned).not.toContain("موفقیت تأییدشده");
    expect(success).toContain("موفقیت تأییدشده (fixture)");
    expect(success).toContain("سفارش واقعی");
  });

  it("renders every approved fixture payment state", () => {
    for (const state of purchaseJourneyStates) {
      const html = renderToStaticMarkup(
        <PurchaseJourneyPage
          footage={footage}
          initialState={state}
          authenticated
        />,
      );

      expect(html).toContain("پرداخت شبیه‌سازی‌شده");
      expect(html).toContain("۴۵۰٬۰۰۰ تومان");
    }
  });

  it("preserves the safe login handoff when authentication is required", () => {
    const html = renderToStaticMarkup(
      <PurchaseJourneyPage
        footage={footage}
        initialState="review"
        authenticated={false}
      />,
    );

    expect(html).toContain("برای ادامه وارد شوید");
    expect(html).toContain("/login?returnTo=");
    expect(html).toContain("purchase%2F");
    expect(html).toContain("customer%3Dauthenticated");
  });
});
