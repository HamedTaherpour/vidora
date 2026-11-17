import { describe, expect, it } from "vitest";

import {
  getFootagePreviewProgress,
  shouldCommitFootagePreviewStart,
  shouldShowFootagePreviewPlayIcon,
  shouldShowFootagePreviewProgress,
  startFootagePreview,
  stopFootagePreview,
} from "./footage-media-preview.utils";

describe("footage media preview helpers", () => {
  it("shows play and progress only for an available preview", () => {
    expect(shouldShowFootagePreviewPlayIcon("/preview.mp4", false)).toBe(true);
    expect(shouldShowFootagePreviewPlayIcon(undefined, false)).toBe(false);
    expect(shouldShowFootagePreviewProgress("/preview.mp4", true)).toBe(true);
    expect(shouldShowFootagePreviewProgress(undefined, true)).toBe(false);
  });

  it("calculates bounded progress from media time", () => {
    expect(getFootagePreviewProgress(12, 48)).toBe(25);
    expect(getFootagePreviewProgress(60, 48)).toBe(100);
    expect(getFootagePreviewProgress(1, 0)).toBe(0);
  });

  it("handles playback rejection and pointer-leave reset", async () => {
    let paused = false;
    const video = {
      muted: false,
      playsInline: false,
      preload: "none",
      readyState: 0,
      load: () => undefined,
      play: async () => undefined,
      pause: () => {
        paused = true;
      },
      currentTime: 12,
    } as unknown as HTMLVideoElement;

    expect(await startFootagePreview(video)).toBe(true);
    expect(video.muted).toBe(true);
    stopFootagePreview(video);
    expect(paused).toBe(true);
    expect(video.currentTime).toBe(0);

    const rejected = {
      ...video,
      play: async () => {
        throw new Error("autoplay blocked");
      },
    } as unknown as HTMLVideoElement;
    expect(await startFootagePreview(rejected)).toBe(false);
  });

  it("does not commit a stale preview request", () => {
    expect(shouldCommitFootagePreviewStart(1, 2, true)).toBe(false);
    expect(shouldCommitFootagePreviewStart(2, 2, true)).toBe(true);
    expect(shouldCommitFootagePreviewStart(2, 2, false)).toBe(false);
  });
});
