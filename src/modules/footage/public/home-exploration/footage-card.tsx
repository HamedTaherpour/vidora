"use client";

import Link from "next/link";
import { Film, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fa } from "@/lib/utils";
import type { FootageCardProps } from "./footage-card.types";
import {
  formatFootageCardPrice,
  getFootagePreviewProgress,
  shouldShowFootagePreviewPlayIcon,
  shouldShowFootagePreviewProgress,
  shouldCommitFootagePreviewStart,
  startFootagePreview,
  stopFootagePreview,
} from "./footage-card.utils";

export function FootageCard(props: FootageCardProps) {
  const { item, developmentOnly = false } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewRequestRef = useRef(0);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanHover(hoverQuery.matches);
      setReducedMotion(motionQuery.matches);
    };
    sync();
    hoverQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      hoverQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  const handlePointerEnter = () => {
    const video = videoRef.current;
    if (!video || !item.preview.videoUrl || !canHover || reducedMotion) return;
    const requestId = ++previewRequestRef.current;
    setProgress(0);
    void startFootagePreview(video).then((started) => {
      if (
        shouldCommitFootagePreviewStart(
          requestId,
          previewRequestRef.current,
          started,
        )
      ) {
        setPreviewing(true);
      }
    });
  };

  const handlePointerLeave = () => {
    const video = videoRef.current;
    if (!video) return;
    previewRequestRef.current += 1;
    stopFootagePreview(video);
    setPreviewing(false);
    setProgress(0);
  };

  return (
    <article
      className="overflow-hidden rounded-surface border-line border-border bg-card shadow-surface"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Link
        href={`/footage/${item.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          {item.cover.status === "ready" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover.src}
              alt={item.cover.altFa}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <div
              className="home-footage-poster flex size-full flex-col justify-between p-4"
              aria-label="پوستر نمایشی فوتیج"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-brand">
                <Film aria-hidden="true" className="size-5" />
              </span>
              <span className="max-w-[16rem] text-lg font-semibold text-foreground">
                {item.titleFa}
              </span>
            </div>
          )}
          {item.preview.videoUrl && (
            <video
              ref={videoRef}
              src={item.preview.videoUrl}
              muted
              playsInline
              preload="none"
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-10 size-full object-cover transition-opacity duration-300 ${previewing ? "opacity-100" : "opacity-0"}`}
              onTimeUpdate={(event) =>
                setProgress(
                  getFootagePreviewProgress(
                    event.currentTarget.currentTime,
                    event.currentTarget.duration,
                  ),
                )
              }
              onLoadedMetadata={(event) =>
                setProgress(
                  getFootagePreviewProgress(
                    event.currentTarget.currentTime,
                    event.currentTarget.duration,
                  ),
                )
              }
              onError={() => {
                setPreviewing(false);
                setProgress(0);
              }}
              onEnded={() => {
                const video = videoRef.current;
                if (!video) return;
                stopFootagePreview(video);
                setPreviewing(false);
                setProgress(0);
              }}
            />
          )}
          {shouldShowFootagePreviewPlayIcon(
            item.preview.videoUrl,
            previewing,
          ) && (
            <span className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-foreground/15 bg-background/85 text-foreground shadow-overlay backdrop-blur-sm">
                <Play
                  aria-hidden="true"
                  className="ms-0.5 size-4"
                  fill="currentColor"
                />
              </span>
            </span>
          )}
          {shouldShowFootagePreviewProgress(
            item.preview.videoUrl,
            previewing,
          ) && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1 bg-background/45"
            >
              <span
                className="block h-full bg-brand transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </span>
          )}
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
