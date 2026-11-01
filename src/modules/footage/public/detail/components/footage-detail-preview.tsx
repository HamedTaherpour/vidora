import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { FootageDetailPreviewProps } from "./footage-detail-preview.types";

export function FootageDetailPreview(props: FootageDetailPreviewProps) {
  const { footage } = props;

  if (footage.preview.status !== "ready" || !footage.preview.videoUrl) {
    return (
      <Alert
        aria-label="وضعیت پیش‌نمایش"
        className="aspect-video justify-center bg-muted/60"
      >
        <AlertTitle>پیش‌نمایش فعلاً آماده پخش نیست</AlertTitle>
        <AlertDescription>
          تصویر و اطلاعات فوتیج در دسترس است؛ آماده‌شدن پیش‌نمایش را بعداً بررسی
          کنید.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <figure className="flex flex-col gap-3">
      <video
        controls
        preload="metadata"
        poster={
          footage.cover.status === "ready" ? footage.cover.src : undefined
        }
        className="aspect-video w-full rounded-xl bg-muted object-cover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`پیش‌نمایش ویدئویی ${footage.titleFa}`}
      >
        <source src={footage.preview.videoUrl} type="video/mp4" />
        مرورگر شما امکان پخش این پیش‌نمایش را ندارد.
      </video>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-muted-foreground">
        <span>
          پیش‌نمایش عمومی دارای واترمارک است و فقط برای بررسی قبل از خرید نمایش
          داده می‌شود.
        </span>
        <Button
          render={<a href={footage.preview.videoUrl} download />}
          nativeButton={false}
          variant="outline"
          size="sm"
        >
          <Download data-icon="inline-start" aria-hidden="true" />
          دانلود پیش‌نمایش
        </Button>
      </figcaption>
    </figure>
  );
}
