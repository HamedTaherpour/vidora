"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import {
  FOOTAGE_PREVIEW_HOVER_DELAY_MS,
  FOOTAGE_PREVIEW_LONG_PRESS_DELAY_MS,
  FOOTAGE_PREVIEW_MOVEMENT_THRESHOLD_PX,
} from "./footage-card.constants";
import {
  calculatePreviewProgress,
  hasPointerMovedBeyondThreshold,
} from "./footage-card.utils";

type UseFootagePreviewOptions = {
  canPreview: boolean;
};

type PreviewController = () => void;

const previewControllers = new Set<PreviewController>();

/**
 * Owns delayed preview activation, media lifecycle, and gesture cancellation.
 *
 * Each mounted hook registers a stop controller so activating one preview
 * returns every other mounted preview to its idle state.
 */
export function useFootagePreview({ canPreview }: UseFootagePreviewOptions) {
  const [previewing, setPreviewing] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrame = useRef<number | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopPreviewRef = useRef<PreviewController>(() => undefined);
  const controllerRef = useRef<PreviewController>(() =>
    stopPreviewRef.current(),
  );

  function clearPreviewTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function stopPreview() {
    clearPreviewTimer();
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    setPreviewing(false);
    setPreviewPlaying(false);
    setProgress(0);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  function startPreview() {
    if (
      !canPreview ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    previewControllers.forEach((stopOtherPreview) => {
      if (stopOtherPreview !== controllerRef.current) stopOtherPreview();
    });

    setPreviewing(true);
    animationFrame.current = requestAnimationFrame(() => {
      animationFrame.current = null;
      void videoRef.current?.play().catch(stopPreview);
    });
  }

  function schedulePreview(delay: number) {
    if (
      !canPreview ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    clearPreviewTimer();
    timer.current = setTimeout(startPreview, delay);
  }

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      schedulePreview(FOOTAGE_PREVIEW_HOVER_DELAY_MS);
    }
  }

  function handlePointerLeave() {
    stopPreview();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      startPoint.current = { x: event.clientX, y: event.clientY };
      schedulePreview(FOOTAGE_PREVIEW_LONG_PRESS_DELAY_MS);
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const point = startPoint.current;
    if (
      point &&
      hasPointerMovedBeyondThreshold(
        point,
        { x: event.clientX, y: event.clientY },
        FOOTAGE_PREVIEW_MOVEMENT_THRESHOLD_PX,
      )
    ) {
      startPoint.current = null;
      stopPreview();
    }
  }

  function handlePointerUp() {
    startPoint.current = null;
    stopPreview();
  }

  function handlePointerCancel() {
    startPoint.current = null;
    stopPreview();
  }

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (previewing) event.preventDefault();
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const { currentTime, duration } = event.currentTarget;
    setProgress(calculatePreviewProgress(currentTime, duration));
  }

  function handleVideoPlay() {
    setPreviewPlaying(true);
  }

  function handleVideoPause() {
    setPreviewPlaying(false);
  }

  function handleVideoError() {
    stopPreview();
  }

  useEffect(() => {
    stopPreviewRef.current = stopPreview;
  });

  useEffect(() => {
    const controller = controllerRef.current;
    previewControllers.add(controller);

    return () => {
      previewControllers.delete(controller);
      stopPreviewRef.current();
    };
  }, []);

  return {
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
  };
}
