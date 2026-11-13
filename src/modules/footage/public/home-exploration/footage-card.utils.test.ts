import { describe, expect, it } from "vitest";
import {
  formatFootageCardPrice,
  getFootagePreviewProgress,
  shouldShowFootagePreviewPlayIcon,
  shouldShowFootagePreviewProgress,
  shouldCommitFootagePreviewStart,
  startFootagePreview,
  stopFootagePreview,
} from "./footage-card.utils";

describe("footage card media helpers", () => {
  it("shows the play affordance only for a preview that is not playing", () => {
    expect(shouldShowFootagePreviewPlayIcon("/preview.mp4", false)).toBe(true);
    expect(shouldShowFootagePreviewPlayIcon("/preview.mp4", true)).toBe(false);
    expect(shouldShowFootagePreviewPlayIcon(undefined, false)).toBe(false);
  });

  it("shows progress only while a playable preview is playing", () => {
    expect(shouldShowFootagePreviewProgress("/preview.mp4", true)).toBe(true);
    expect(shouldShowFootagePreviewProgress("/preview.mp4", false)).toBe(false);
    expect(shouldShowFootagePreviewProgress(undefined, true)).toBe(false);
  });
  it("formats visible real and development prices without hiding the amount", () => {
    expect(formatFootageCardPrice(450_000, false)).toBe("۴۵۰٬۰۰۰ تومان");
    expect(formatFootageCardPrice(450_000, true)).toBe(
      "نمونهٔ توسعه · ۴۵۰٬۰۰۰ تومان",
    );
  });

  it("calculates progress from actual media time", () => {
    expect(getFootagePreviewProgress(12, 48)).toBe(25);
    expect(getFootagePreviewProgress(60, 48)).toBe(100);
    expect(getFootagePreviewProgress(1, 0)).toBe(0);
  });

  it("starts muted playback and handles autoplay rejection", async () => {
    const video = {
      muted: false,
      playsInline: false,
      preload: "none",
      readyState: 0,
      load: () => undefined,
      play: async () => undefined,
    } as unknown as HTMLVideoElement;
    expect(await startFootagePreview(video)).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);

    const rejected = {
      ...video,
      play: async () => {
        throw new Error("autoplay blocked");
      },
    } as unknown as HTMLVideoElement;
    expect(await startFootagePreview(rejected)).toBe(false);
  });

  it("stops and resets the preview on pointer leave", () => {
    let paused = false;
    const video = {
      pause: () => {
        paused = true;
      },
      currentTime: 12,
    } as unknown as HTMLVideoElement;
    stopFootagePreview(video);
    expect(paused).toBe(true);
    expect(video.currentTime).toBe(0);
  });

  it("does not commit a preview start after a newer pointer request", () => {
    expect(shouldCommitFootagePreviewStart(1, 2, true)).toBe(false);
    expect(shouldCommitFootagePreviewStart(2, 2, true)).toBe(true);
    expect(shouldCommitFootagePreviewStart(2, 2, false)).toBe(false);
  });
});
