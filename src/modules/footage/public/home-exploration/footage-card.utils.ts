import { formatToman } from "@/lib/utils";

export function formatFootageCardPrice(
  priceToman: number,
  developmentOnly: boolean,
): string {
  const price = formatToman(priceToman);
  return developmentOnly ? `نمونهٔ توسعه · ${price}` : price;
}

export function getFootagePreviewProgress(
  currentTime: number,
  duration: number,
): number {
  if (
    !Number.isFinite(currentTime) ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return 0;
  }
  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

export function shouldShowFootagePreviewPlayIcon(
  videoUrl: string | null | undefined,
  previewing: boolean,
): boolean {
  return Boolean(videoUrl) && !previewing;
}

export function shouldShowFootagePreviewProgress(
  videoUrl: string | null | undefined,
  previewing: boolean,
): boolean {
  return Boolean(videoUrl) && previewing;
}

export function shouldCommitFootagePreviewStart(
  requestId: number,
  currentRequestId: number,
  started: boolean,
): boolean {
  return started && requestId === currentRequestId;
}

export async function startFootagePreview(
  video: HTMLVideoElement,
): Promise<boolean> {
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  if (video.readyState === 0) video.load();

  try {
    await video.play();
    return true;
  } catch {
    return false;
  }
}

export function stopFootagePreview(video: HTMLVideoElement): void {
  video.pause();
  try {
    video.currentTime = 0;
  } catch {
    // A media element can reject seeking before metadata has loaded.
  }
}
