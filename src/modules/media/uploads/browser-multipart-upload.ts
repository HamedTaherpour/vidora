/**
 * Browser-side multipart helpers for Admin direct-to-storage upload.
 * Safe for Client Components: no credentials, no server imports.
 */

export type BrowserCompletedPart = {
  partNumber: number;
  etag: string;
};

export type SignPartResponse = {
  url: string;
  method: "PUT";
};

export type BrowserMultipartUploadParams = {
  file: File;
  partSizeBytes: number;
  partCount: number;
  signPart: (partNumber: number) => Promise<SignPartResponse>;
  onProgress?: (progress: {
    uploadedBytes: number;
    totalBytes: number;
    completedParts: number;
    partCount: number;
  }) => void;
  maxPartAttempts?: number;
};

function requireEtag(response: Response, partNumber: number): string {
  const etag = response.headers.get("etag") ?? response.headers.get("ETag");

  if (etag === null || etag.trim().length === 0) {
    throw new Error(`Missing ETag for uploaded part ${partNumber}.`);
  }

  return etag;
}

async function putPartWithRetry({
  url,
  body,
  partNumber,
  maxPartAttempts,
}: {
  url: string;
  body: Blob;
  partNumber: number;
  maxPartAttempts: number;
}): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxPartAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "PUT",
        body,
      });

      if (!response.ok) {
        throw new Error(
          `Part ${partNumber} upload failed with HTTP ${response.status}.`,
        );
      }

      return requireEtag(response, partNumber);
    } catch (error) {
      lastError = error;

      if (attempt === maxPartAttempts) {
        break;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Part ${partNumber} upload failed.`);
}

/**
 * Slice the file and PUT each part directly to object storage using
 * short-lived signed URLs. Failed parts retry up to `maxPartAttempts`.
 */
export async function uploadFilePartsDirectly({
  file,
  partSizeBytes,
  partCount,
  signPart,
  onProgress,
  maxPartAttempts = 3,
}: BrowserMultipartUploadParams): Promise<BrowserCompletedPart[]> {
  const parts: BrowserCompletedPart[] = [];
  let uploadedBytes = 0;

  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    const start = (partNumber - 1) * partSizeBytes;
    const end = Math.min(start + partSizeBytes, file.size);
    const blob = file.slice(start, end);
    const signed = await signPart(partNumber);

    if (signed.method !== "PUT") {
      throw new Error("Signed part access must use PUT.");
    }

    // Direct to object storage — never through a Next.js body endpoint.
    const etag = await putPartWithRetry({
      url: signed.url,
      body: blob,
      partNumber,
      maxPartAttempts,
    });

    parts.push({ partNumber, etag });
    uploadedBytes += blob.size;
    onProgress?.({
      uploadedBytes,
      totalBytes: file.size,
      completedParts: parts.length,
      partCount,
    });
  }

  return parts;
}

export function assertDirectStorageUrl(url: string, appOrigin: string): void {
  const target = new URL(url);
  const app = new URL(appOrigin);

  if (
    (target.protocol !== "http:" && target.protocol !== "https:") ||
    target.hostname.length === 0 ||
    target.username.length > 0 ||
    target.password.length > 0
  ) {
    throw new Error("Signed part URL must be a valid object-storage URL.");
  }

  if (target.origin === app.origin) {
    throw new Error(
      "Signed part URL must target object storage, not the application origin.",
    );
  }
}
