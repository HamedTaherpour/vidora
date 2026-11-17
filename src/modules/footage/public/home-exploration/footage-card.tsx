"use client";

import Link from "next/link";
import { FootageMediaPreview } from "@/components/footage-media-preview/footage-media-preview";
import { fa } from "@/lib/utils";
import type { FootageCardProps } from "./footage-card.types";
import { formatFootageCardPrice } from "./footage-card.utils";

export function FootageCard(props: FootageCardProps) {
  const { item, developmentOnly = false } = props;

  return (
    <article className="overflow-hidden rounded-surface border-line border-border bg-card shadow-surface">
      <Link
        href={`/footage/${item.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
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
          <span className="absolute inset-s-3 top-3 rounded-control bg-background/75 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
            {item.category.nameFa}
          </span>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {item.titleFa}
          </h3>
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              {item.durationSeconds
                ? `${fa(item.durationSeconds)} ثانیه`
                : "مدت مشخص نشده"}
            </span>
            <span className="font-medium text-brand">
              {formatFootageCardPrice(item.priceToman, developmentOnly)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
