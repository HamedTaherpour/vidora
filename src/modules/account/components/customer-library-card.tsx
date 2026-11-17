"use client";

import { BadgeCheck } from "lucide-react";
import { useState } from "react";

import { FootageMediaPreview } from "@/components/footage-media-preview/footage-media-preview";
import { fa } from "@/lib/utils";
import { CustomerLibraryDetailsDialog } from "./customer-library-details-dialog/customer-library-details-dialog";
import type { CustomerLibraryCardProps } from "./customer-library-card.types";

/** Presents a development library item without public purchase actions or pricing. */
export function CustomerLibraryCard({ preview }: CustomerLibraryCardProps) {
  const { item, qualityVariants } = preview;
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-surface border-line border-border bg-card shadow-surface">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-haspopup="dialog"
        aria-label={`مشاهده جزئیات ${item.titleFa}`}
      >
        <div className="relative">
          <FootageMediaPreview
            cover={item.cover}
            previewUrl={
              item.preview.status === "ready"
                ? item.preview.videoUrl
                : undefined
            }
          />
          <span className="absolute inset-s-3 top-3 inline-flex items-center gap-1 rounded-control bg-background/80 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
            <BadgeCheck aria-hidden="true" className="size-3.5 text-brand" />
            نمونهٔ توسعه
          </span>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold text-foreground">
              {item.titleFa}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              دسترسی نمایشی در کتابخانهٔ شما
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-control bg-secondary px-2 py-1">
              {item.durationSeconds
                ? `${fa(item.durationSeconds)} ثانیه`
                : "مدت مشخص نشده"}
            </span>
            {qualityVariants.map((quality) => (
              <span
                key={quality}
                dir="ltr"
                className="rounded-control border-line border-border px-2 py-1"
              >
                {quality}
              </span>
            ))}
          </div>
        </div>
      </button>
      <CustomerLibraryDetailsDialog
        open={open}
        onOpenChange={setOpen}
        preview={preview}
      />
    </article>
  );
}
