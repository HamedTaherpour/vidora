"use client";

import { Download, FileVideo, LockKeyhole } from "lucide-react";

import { FootageMediaPreview } from "@/components/footage-media-preview/footage-media-preview";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { fa } from "@/lib/utils";
import type {
  CustomerLibraryDetailValueProps,
  CustomerLibraryDetailsDialogProps,
} from "./customer-library-details-dialog.types";

/** Presents safe purchased-footage details without creating protected download links. */
export function CustomerLibraryDetailsDialog({
  open,
  onOpenChange,
  preview,
}: CustomerLibraryDetailsDialogProps) {
  const { item, qualityVariants } = preview;
  const previewUrl =
    item.preview.status === "ready" ? item.preview.videoUrl : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={item.titleFa}
      description="جزئیات فوتیج خریداری‌شده و کیفیت‌های موجود"
      className="max-w-5xl"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="space-y-3">
          <FootageMediaPreview
            cover={item.cover}
            previewUrl={previewUrl}
            mode="controls"
          />
          <p className="text-sm text-muted-foreground">
            پیش‌نمایش عمومی دارای واترمارک است و فایل اصلی را نمایش نمی‌دهد.
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid gap-3 rounded-control border border-border bg-muted p-4 sm:grid-cols-2 lg:grid-cols-1">
            <DetailValue
              label="مدت"
              value={
                item.durationSeconds
                  ? `${fa(item.durationSeconds)} ثانیه`
                  : "مشخص نشده"
              }
            />
            <DetailValue label="دسته‌بندی" value={item.category.nameFa} />
          </div>

          <section
            aria-labelledby="library-quality-options"
            className="space-y-3"
          >
            <div>
              <h3 id="library-quality-options" className="font-semibold">
                کیفیت‌های قابل دریافت
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                این ردیف‌ها در پیش‌نمایش توسعه نمایشی‌اند و دسترسی خرید را تأیید
                نمی‌کنند.
              </p>
            </div>
            {qualityVariants.length ? (
              <ul className="space-y-2">
                {qualityVariants.map((quality) => (
                  <li
                    key={quality}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-card p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileVideo
                        aria-hidden="true"
                        className="size-4 shrink-0 text-brand"
                      />
                      <div>
                        <p dir="ltr" className="font-semibold text-start">
                          {quality}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          مشخصات فایل ثبت نشده است
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled
                      title="دانلود پس از اتصال دسترسی واقعی فعال می‌شود"
                    >
                      <Download aria-hidden="true" />
                      دانلود
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-control border border-border p-3 text-sm text-muted-foreground">
                کیفیت قابل دریافتی برای این فوتیج ثبت نشده است.
              </p>
            )}
          </section>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            لینک دانلود موقت، پس از اتصال مجاز سمت سرور، هر بار تازه صادر می‌شود
            و ۶۰ دقیقه اعتبار دارد.
          </p>
        </div>
      </div>
    </Dialog>
  );
}

function DetailValue({ label, value }: CustomerLibraryDetailValueProps) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
