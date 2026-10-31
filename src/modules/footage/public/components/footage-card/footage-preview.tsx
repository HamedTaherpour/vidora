"use client";

import { Play } from "lucide-react";

import type { FootagePreviewProps } from "./footage-card.types";
import { useFootagePreview } from "./use-footage-preview";

export function FootagePreview(props: FootagePreviewProps) {
  const { footage } = props;
  const previewLabel =
    footage.preview.status === "ready"
      ? "پیش‌نمایش آماده است"
      : "پیش‌نمایش در دسترس نیست";
  const canPreview =
    footage.preview.status === "ready" && Boolean(footage.preview.videoUrl);
  const {
    previewing,
    previewPlaying,
    progress,
    videoRef,
    handleContextMenu,
    handlePointerCancel,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleTimeUpdate,
    handleVideoError,
    handleVideoPause,
    handleVideoPlay,
  } = useFootagePreview({ canPreview });

  return (
    <div
      className="relative aspect-video overflow-hidden bg-muted"
      role="group"
      aria-label={`${footage.titleFa} — ${footage.category.nameFa} — ${previewLabel}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={handleContextMenu}
    >
      {previewing && footage.preview.videoUrl ? (
        <video
          ref={videoRef}
          data-preview-video
          src={footage.preview.videoUrl}
          muted
          playsInline
          loop
          preload="none"
          className="h-full w-full object-cover"
          aria-label={`پیش‌نمایش ویدئویی ${footage.titleFa}`}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onTimeUpdate={handleTimeUpdate}
        />
      ) : footage.cover.status === "ready" ? (
        <>
          <img
            src={footage.cover.src}
            alt={footage.cover.altFa}
            className="h-full w-full object-cover"
          />
          {canPreview && <PreviewPlayIndicator />}
        </>
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center gap-2 bg-muted px-6 text-center text-muted-foreground">
          <span className="text-sm font-medium">تصویر جلد در دسترس نیست</span>
          <span className="text-xs leading-5">{footage.category.nameFa}</span>
          {canPreview && <PreviewPlayIndicator />}
        </div>
      )}
      {previewPlaying && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-muted dir-ltr border-y"
          aria-hidden="true"
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PreviewPlayIndicator() {
  return (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-foreground/75 text-background">
        <Play className="ms-0.5 size-5 fill-current" />
      </span>
    </span>
  );
}
