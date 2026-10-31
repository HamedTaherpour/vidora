// @vitest-environment jsdom
/* eslint-disable react-hooks/refs -- the harness intentionally forwards the hook contract to DOM events. */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFootagePreview } from "./use-footage-preview";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function Harness({ canPreview = true }: { canPreview?: boolean }) {
  const preview = useFootagePreview({ canPreview });

  return (
    <div
      data-preview-surface
      data-state={preview.previewing ? "previewing" : "idle"}
      onPointerEnter={preview.handlePointerEnter}
      onPointerLeave={preview.handlePointerLeave}
      onPointerDown={preview.handlePointerDown}
      onPointerMove={preview.handlePointerMove}
      onPointerUp={preview.handlePointerUp}
      onPointerCancel={preview.handlePointerCancel}
    >
      {preview.previewing && (
        <video
          ref={preview.videoRef}
          data-preview-video
          onError={preview.handleVideoError}
          onPlay={preview.handleVideoPlay}
          onPause={preview.handleVideoPause}
          onTimeUpdate={preview.handleTimeUpdate}
        />
      )}
      <span
        data-playing={preview.previewPlaying}
        data-progress={preview.progress}
      />
    </div>
  );
}

function pointerEvent(
  type: string,
  pointerType: "mouse" | "touch",
  x = 0,
  y = 0,
) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    clientX: { value: x },
    clientY: { value: y },
  });
  return event;
}

describe("useFootagePreview", () => {
  let container!: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", vi.fn());
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("requestAnimationFrame", vi.fn());
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(
      () => undefined,
    );
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
      () => undefined,
    );
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function render(count = 1) {
    root = createRoot(container);
    act(() => {
      root!.render(
        <>
          {Array.from({ length: count }, (_, index) => (
            <Harness key={index} />
          ))}
        </>,
      );
    });
  }

  function surface(index = 0) {
    return container.querySelectorAll<HTMLElement>("[data-preview-surface]")[
      index
    ];
  }

  function dispatch(target: EventTarget, event: Event) {
    act(() => target.dispatchEvent(event));
  }

  it("activates after hover delay and cancels when the pointer leaves", () => {
    render();
    dispatch(surface(), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(299));
    expect(container.querySelector("video")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector("video")).not.toBeNull();

    dispatch(surface(), pointerEvent("pointerout", "mouse"));
    expect(container.querySelector("video")).toBeNull();

    dispatch(surface(), pointerEvent("pointerover", "mouse"));
    dispatch(surface(), pointerEvent("pointerout", "mouse"));
    act(() => vi.advanceTimersByTime(300));
    expect(container.querySelector("video")).toBeNull();
  });

  it("supports touch long press but cancels on movement, release, or cancel", () => {
    render();
    dispatch(surface(), pointerEvent("pointerdown", "touch", 10, 10));
    act(() => vi.advanceTimersByTime(479));
    expect(container.querySelector("video")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector("video")).not.toBeNull();
    dispatch(surface(), pointerEvent("pointerup", "touch"));
    expect(container.querySelector("video")).toBeNull();

    dispatch(surface(), pointerEvent("pointerdown", "touch", 10, 10));
    dispatch(surface(), pointerEvent("pointermove", "touch", 25, 10));
    act(() => vi.advanceTimersByTime(480));
    expect(container.querySelector("video")).toBeNull();

    dispatch(surface(), pointerEvent("pointerdown", "touch", 10, 10));
    dispatch(surface(), pointerEvent("pointercancel", "touch"));
    act(() => vi.advanceTimersByTime(480));
    expect(container.querySelector("video")).toBeNull();
  });

  it("respects reduced motion and handles playback failure", () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    render();
    dispatch(surface(), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(480));
    expect(container.querySelector("video")).toBeNull();

    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    dispatch(surface(), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(300));
    const video = container.querySelector<HTMLVideoElement>("video")!;
    dispatch(video, new Event("error", { bubbles: true }));
    expect(container.querySelector("video")).toBeNull();
    expect(surface().dataset.state).toBe("idle");
  });

  it("updates and resets progress and cleans up media on stop", () => {
    render();
    dispatch(surface(), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(300));
    const video = container.querySelector<HTMLVideoElement>("video")!;
    Object.defineProperties(video, {
      currentTime: { configurable: true, value: 5, writable: true },
      duration: { configurable: true, value: 20 },
    });
    dispatch(video, new Event("play", { bubbles: true }));
    dispatch(video, new Event("timeupdate", { bubbles: true }));
    expect(
      container.querySelector("[data-progress]")?.getAttribute("data-progress"),
    ).toBe("25");

    Object.defineProperty(video, "duration", {
      configurable: true,
      value: NaN,
    });
    dispatch(video, new Event("timeupdate", { bubbles: true }));
    expect(
      container.querySelector("[data-progress]")?.getAttribute("data-progress"),
    ).toBe("0");
    dispatch(surface(), pointerEvent("pointerout", "mouse"));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(video.currentTime).toBe(0);
    expect(surface().dataset.state).toBe("idle");
  });

  it("keeps only one preview active and clears timers on unmount", () => {
    render(2);
    dispatch(surface(0), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(300));
    dispatch(surface(1), pointerEvent("pointerover", "mouse"));
    act(() => vi.advanceTimersByTime(300));
    expect(container.querySelectorAll("video")).toHaveLength(1);
    expect(surface(0).dataset.state).toBe("idle");
    expect(surface(1).dataset.state).toBe("previewing");

    act(() => root!.unmount());
    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });
});
