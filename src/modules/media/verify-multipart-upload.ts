import "server-only";

import { randomUUID } from "node:crypto";

import { createLiaraS3ObjectStorageFromEnv } from "@/modules/media/create-object-storage";
import { ObjectStorageError } from "@/modules/media/object-storage";

export type MultipartUploadProbeResult = {
  provider: "liara-s3";
  bucket: string;
  completedObjectKey: string;
  abortedObjectKey: string;
  completedSizeBytes: number;
  partCount: number;
};

/**
 * Safe live multipart probe against the configured Liara development bucket.
 * Uses a tiny payload (two small parts when permitted), completes one upload,
 * aborts a second unfinished upload, and deletes the temporary completed object.
 * Never logs credentials or signed URLs.
 */
export async function verifyMultipartUploadProbe(): Promise<MultipartUploadProbeResult> {
  const storage = createLiaraS3ObjectStorageFromEnv();
  const completedObjectKey = `vidora-multipart-probe/${randomUUID()}-complete.bin`;
  const abortedObjectKey = `vidora-multipart-probe/${randomUUID()}-abort.bin`;
  const partA = new Uint8Array(5 * 1024 * 1024).fill(1);
  const partB = new Uint8Array(1024).fill(2);
  let cleanedUp = false;
  let abortUploadId: string | null = null;

  try {
    const abortSession = await storage.createMultipartUpload({
      objectKey: abortedObjectKey,
      accessPolicy: "original",
      contentType: "application/octet-stream",
    });
    abortUploadId = abortSession.uploadId;

    const completeSession = await storage.createMultipartUpload({
      objectKey: completedObjectKey,
      accessPolicy: "original",
      contentType: "application/octet-stream",
    });

    const signedA = await storage.createUploadPartAccess({
      objectKey: completedObjectKey,
      uploadId: completeSession.uploadId,
      partNumber: 1,
      accessPolicy: "original",
    });
    const signedB = await storage.createUploadPartAccess({
      objectKey: completedObjectKey,
      uploadId: completeSession.uploadId,
      partNumber: 2,
      accessPolicy: "original",
    });

    const responseA = await fetch(signedA.url, {
      method: "PUT",
      body: partA,
    });
    const responseB = await fetch(signedB.url, {
      method: "PUT",
      body: partB,
    });

    if (!responseA.ok || !responseB.ok) {
      throw new ObjectStorageError({
        category: "provider",
        operation: "verifyMultipartUploadProbe.uploadParts",
        provider: storage.provider,
        bucket: storage.bucket,
        objectKey: completedObjectKey,
      });
    }

    const etagA = responseA.headers.get("etag");
    const etagB = responseB.headers.get("etag");

    if (etagA === null || etagB === null) {
      throw new ObjectStorageError({
        category: "provider",
        operation: "verifyMultipartUploadProbe.etag",
        provider: storage.provider,
        bucket: storage.bucket,
        objectKey: completedObjectKey,
      });
    }

    await storage.completeMultipartUpload({
      objectKey: completedObjectKey,
      uploadId: completeSession.uploadId,
      parts: [
        { partNumber: 1, etag: etagA },
        { partNumber: 2, etag: etagB },
      ],
    });

    const metadata = await storage.headObject({
      objectKey: completedObjectKey,
    });

    if (metadata === null) {
      throw new ObjectStorageError({
        category: "not_found",
        operation: "verifyMultipartUploadProbe.headObject",
        provider: storage.provider,
        bucket: storage.bucket,
        objectKey: completedObjectKey,
      });
    }

    await storage.abortMultipartUpload({
      objectKey: abortedObjectKey,
      uploadId: abortUploadId,
    });
    abortUploadId = null;

    await storage.deleteObject({ objectKey: completedObjectKey });
    cleanedUp = true;

    return {
      provider: storage.provider,
      bucket: storage.bucket,
      completedObjectKey,
      abortedObjectKey,
      completedSizeBytes:
        metadata.sizeBytes ?? partA.byteLength + partB.byteLength,
      partCount: 2,
    };
  } finally {
    if (abortUploadId !== null) {
      try {
        await storage.abortMultipartUpload({
          objectKey: abortedObjectKey,
          uploadId: abortUploadId,
        });
      } catch {
        // Best-effort abort cleanup.
      }
    }

    if (!cleanedUp) {
      try {
        await storage.deleteObject({ objectKey: completedObjectKey });
      } catch {
        // Best-effort object cleanup.
      }
    }
  }
}
