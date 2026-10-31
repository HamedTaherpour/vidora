/**
 * Converts a playback position into a bounded percentage.
 *
 * Invalid, missing, or non-positive durations return zero.
 *
 * @param currentTime - Current playback position in seconds.
 * @param duration - Total media duration in seconds.
 * @returns Playback progress between 0 and 100.
 */
export function calculatePreviewProgress(
  currentTime: number,
  duration: number,
): number {
  if (
    !Number.isFinite(currentTime) ||
    duration <= 0 ||
    !Number.isFinite(duration)
  ) {
    return 0;
  }

  const progress = (currentTime / duration) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Determines whether a pointer moved farther than the cancellation threshold.
 *
 * @param start - Pointer coordinates when the gesture began.
 * @param current - Current pointer coordinates.
 * @param threshold - Maximum allowed movement in pixels.
 * @returns Whether the Euclidean distance exceeds the threshold.
 */
export function hasPointerMovedBeyondThreshold(
  start: { x: number; y: number },
  current: { x: number; y: number },
  threshold: number,
): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) > threshold;
}
