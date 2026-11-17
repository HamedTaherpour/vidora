"use client";

import { Film, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  getFootagePreviewProgress,
  shouldCommitFootagePreviewStart,
  shouldShowFootagePreviewPlayIcon,
  shouldShowFootagePreviewProgress,
  startFootagePreview,
  stopFootagePreview,
} from "./footage-media-preview.utils";
import type { FootageMediaPreviewProps } from "./footage-media-preview.types";

/** Owns the shared cover, hover-preview, progress, and media cleanup behavior. */
export function FootageMediaPreview(props: FootageMediaPreviewProps) {
  const { cover, previewUrl, mode = "hover" } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRequestRef = useRef(0);
  const [canHover, setCanHover] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewError, setPreviewError] = useState(false);

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

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) stopFootagePreview(video);
    };
  }, []);

  const handlePointerEnter = () => {
    if (mode === "controls") return;
    const video = videoRef.current;
    if (!video || !previewUrl || !canHover || reducedMotion) return;
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
    if (mode === "controls") return;
    const video = videoRef.current;
    if (!video) return;
    previewRequestRef.current += 1;
    stopFootagePreview(video);
    setPreviewing(false);
    setProgress(0);
  };

  return (
    <div
      className="relative aspect-video overflow-hidden bg-muted"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {cover.status === "ready" && !previewError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.src}
          alt={cover.altFa}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <div
          className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground"
          aria-label={cover.altFa}
        >
          <Film aria-hidden="true" className="size-8" />
          <span className="sr-only">{cover.altFa}</span>
        </div>
      )}
      {previewError ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-muted p-6 text-center">
          <Film aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="font-semibold">پخش پیش‌نمایش ممکن نیست</p>
          <p className="text-sm text-muted-foreground">
            لطفاً بعداً دوباره تلاش کنید.
          </p>
        </div>
      ) : null}
      {previewUrl && !previewError && (
        <video
          ref={videoRef}
          src={previewUrl}
          muted={mode !== "controls"}
          controls={mode === "controls"}
          playsInline
          preload={mode === "controls" ? "metadata" : "none"}
          aria-label={mode === "controls" ? "پیش‌نمایش ویدئویی" : undefined}
          className={`absolute inset-0 z-10 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${mode === "controls" ? "opacity-100" : `${previewing ? "opacity-100" : "opacity-0"} pointer-events-none`}`}
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
            setPreviewError(true);
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
      {mode === "hover" &&
        shouldShowFootagePreviewPlayIcon(previewUrl, previewing) && (
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
      {mode === "hover" &&
        shouldShowFootagePreviewProgress(previewUrl, previewing) && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1 bg-background/45"
          >
            <span
              className="block h-full bg-brand transition-[width] duration-100 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </span>
        )}
    </div>
  );
}
