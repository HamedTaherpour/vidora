export const COVER_WIDTH = 1280;
export const COVER_HEIGHT = 720;
export const COVER_MAX_BYTES = 2 * 1024 * 1024;
export const COVER_SOURCE_MAX_BYTES = 20 * 1024 * 1024;
export const COVER_OUTPUT_MIME_TYPE = "image/jpeg" as const;
export const COVER_OUTPUT_EXTENSION = ".jpg" as const;

export const COVER_SOURCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isSupportedCoverSourceMimeType(
  value: string,
): value is (typeof COVER_SOURCE_MIME_TYPES)[number] {
  return (COVER_SOURCE_MIME_TYPES as readonly string[]).includes(value);
}

export function isCoverOutputSize(width: number, height: number): boolean {
  return width === COVER_WIDTH && height === COVER_HEIGHT;
}
