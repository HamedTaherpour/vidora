"use client";

import { AlertTriangle, Download, Film } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FootageVideoPreviewProps } from "./footage-detail.types";

export function FootageVideoPreview(props: FootageVideoPreviewProps) {
  const { footage } = props;
  const [failed, setFailed] = useState(false);
  const ready = footage.preview.status === "ready" && footage.preview.videoUrl;

  return (
    <figure className="overflow-hidden rounded-surface border-line border-border bg-card shadow-surface">
      <div className="relative aspect-video bg-muted">
        {ready && !failed ? (
          <video
            className="size-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={
              footage.cover.status === "ready" ? footage.cover.src : undefined
            }
            src={footage.preview.videoUrl}
            aria-label={`پیش‌نمایش ${footage.titleFa}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-brand">
              {failed ? (
                <AlertTriangle aria-hidden="true" />
              ) : (
                <Film aria-hidden="true" />
              )}
            </span>
            <p className="font-semibold">
              {failed ? "پخش پیش‌نمایش ممکن نیست" : "پیش‌نمایش در دسترس نیست"}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {failed
                ? "لطفاً دوباره تلاش کنید یا مشخصات فوتیج را بررسی کنید."
                : "این فوتیج فعلاً پیش‌نمایش عمومی ندارد."}
            </p>
          </div>
        )}
      </div>
      {ready && !failed && (
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
          <p className="text-sm text-muted-foreground">
            پیش‌نمایش عمومی دارای واترمارک است.
          </p>
          <a href={`${footage.preview.videoUrl}?mode=download`} download>
            <Button variant="secondary" size="sm">
              <Download aria-hidden="true" /> دریافت پیش‌نمایش
            </Button>
          </a>
        </figcaption>
      )}
    </figure>
  );
}
