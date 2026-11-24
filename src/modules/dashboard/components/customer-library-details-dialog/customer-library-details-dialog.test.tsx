import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { publicFootageDevelopmentFixtures } from "@/modules/footage/public/catalog/public-footage-development-fixtures";
import { CustomerLibraryDetailsDialog } from "./customer-library-details-dialog";

const preview = {
  reference: "development-library-1",
  item: publicFootageDevelopmentFixtures[0],
  qualityVariants: ["1080p", "4K"],
} as const;

describe("customer library details dialog", () => {
  it("renders representative qualities without creating download links", () => {
    const markup = renderToStaticMarkup(
      <CustomerLibraryDetailsDialog
        open
        onOpenChange={() => undefined}
        preview={preview}
      />,
    );

    expect(markup).toContain("پرواز آرام بر فراز کوهستان");
    expect(markup).toContain("1080p");
    expect(markup).toContain("4K");
    expect(markup).toContain("مشخصات فایل ثبت نشده است");
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("download=");
    expect(markup).not.toContain("storage");
  });

  it("renders an honest empty-quality state", () => {
    const markup = renderToStaticMarkup(
      <CustomerLibraryDetailsDialog
        open
        onOpenChange={() => undefined}
        preview={{ ...preview, qualityVariants: [] }}
      />,
    );

    expect(markup).toContain("کیفیت قابل دریافتی برای این فوتیج ثبت نشده است");
    expect(markup).not.toContain("دانلود پس از اتصال دسترسی واقعی فعال می‌شود");
  });
});
