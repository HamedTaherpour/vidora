import "server-only";

import { randomUUID } from "node:crypto";

import { createLiaraS3ObjectStorageFromEnv } from "@/modules/media/storage/create-object-storage";
import { ObjectStorageError } from "@/modules/media/storage/object-storage";

export type ObjectStorageConnectivityResult = {
  provider: "liara-s3";
  bucket: string;
  objectKey: string;
  sizeBytes: number;
};

/**
 * Safe live check against the configured Liara bucket.
 * Writes a dedicated temporary object, confirms it with headObject, then deletes it.
 * Does not touch unrelated objects. Never logs credentials or signed URLs.
 */
export async function verifyObjectStorageConnectivity(): Promise<ObjectStorageConnectivityResult> {
  const storage = createLiaraS3ObjectStorageFromEnv();
  const objectKey = `vidora-storage-connectivity/${randomUUID()}.txt`;
  const body = new TextEncoder().encode("vidora-storage-connectivity");
  let cleanedUp = false;

  try {
    await storage.putObjectBytes({
      objectKey,
      body,
      contentType: "text/plain; charset=utf-8",
    });

    const metadata = await storage.headObject({ objectKey });

    if (metadata === null) {
      throw new ObjectStorageError({
        category: "not_found",
        operation: "verifyObjectStorageConnectivity",
        provider: storage.provider,
        bucket: storage.bucket,
        objectKey,
      });
    }

    await storage.deleteObject({ objectKey });
    cleanedUp = true;

    return {
      provider: storage.provider,
      bucket: storage.bucket,
      objectKey,
      sizeBytes: metadata.sizeBytes ?? body.byteLength,
    };
  } finally {
    if (!cleanedUp) {
      try {
        await storage.deleteObject({ objectKey });
      } catch {
        // Best-effort cleanup after a failed connectivity check.
      }
    }
  }
}
