/**
 * Server-side Admin footage upload size ceiling.
 * Product expectation is approximately 2 GB; this is the explicit integer limit.
 * Unit: binary gibibytes (GiB). 2 GiB = 2 × 1024³ = 2_147_483_648 bytes.
 */
export const MAX_FOOTAGE_UPLOAD_BYTES = 2_147_483_648;

/**
 * Fixed multipart part size for Admin direct uploads.
 *
 * Rationale:
 * - S3 requires every part except the last to be at least 5 MiB;
 * - 16 MiB keeps a 2 GiB object at exactly 128 parts (well under the 10_000 limit);
 * - practical for browser `Blob.slice` memory/network behavior;
 * - allows retrying a single failed part without restarting the whole file.
 *
 * Not user-configurable in V1 UI.
 */
export const MULTIPART_PART_SIZE_BYTES = 16 * 1024 * 1024;

/** S3 multipart part numbers are 1-based and at most 10_000. */
export const MULTIPART_MAX_PART_NUMBER = 10_000;

export function expectedMultipartPartCount(sizeBytes: number): number {
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1) {
    throw new RangeError("sizeBytes must be a positive integer.");
  }

  return Math.ceil(sizeBytes / MULTIPART_PART_SIZE_BYTES);
}
