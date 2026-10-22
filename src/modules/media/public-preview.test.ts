import { describe, expect, it, vi } from "vitest";

import {
  createPublicPreviewAccess,
  PreviewNotAvailableError,
  type PublicPreviewStore,
} from "@/modules/media/public-preview";
import type {
  ObjectStorage,
  TemporaryObjectAccess,
} from "@/modules/media/object-storage";

const FOOTAGE_ID = "11111111-1111-4111-8111-111111111111";

function createStorage(): ObjectStorage {
  const access: TemporaryObjectAccess = {
    url: "https://storage.example.test/signed-preview",
    method: "GET",
    expiresAt: new Date("2026-10-22T10:05:00.000Z"),
    accessPolicy: "preview",
    objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
  };

  return {
    provider: "liara-s3",
    bucket: "private-bucket",
    createUploadAccess: vi.fn(),
    createReadAccess: vi.fn().mockResolvedValue(access),
    headObject: vi.fn(),
    deleteObject: vi.fn(),
    createMultipartUpload: vi.fn(),
    createUploadPartAccess: vi.fn(),
    completeMultipartUpload: vi.fn(),
    abortMultipartUpload: vi.fn(),
  };
}

function createStore(
  preview: Awaited<ReturnType<PublicPreviewStore["findPublishedReadyPreview"]>>,
): PublicPreviewStore {
  return { findPublishedReadyPreview: vi.fn().mockResolvedValue(preview) };
}

describe("public preview access", () => {
  it("signs only a published ready preview with the preview policy", async () => {
    const storage = createStorage();
    const access = await createPublicPreviewAccess({
      footageId: FOOTAGE_ID,
      store: createStore({
        footageId: FOOTAGE_ID,
        objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
        mimeType: "video/mp4",
      }),
      storage,
    });

    expect(access.url).toBe("https://storage.example.test/signed-preview");
    expect(access.mimeType).toBe("video/mp4");
    expect(storage.createReadAccess).toHaveBeenCalledWith({
      objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
      accessPolicy: "preview",
      responseContentType: "video/mp4",
      responseContentDisposition: "inline",
    });
  });

  it("requests attachment delivery for an explicit download", async () => {
    const storage = createStorage();

    await createPublicPreviewAccess({
      footageId: FOOTAGE_ID,
      store: createStore({
        footageId: FOOTAGE_ID,
        objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
        mimeType: "video/mp4",
      }),
      storage,
      mode: "download",
    });

    expect(storage.createReadAccess).toHaveBeenCalledWith({
      objectKey: `footage/${FOOTAGE_ID}/preview/file.mp4`,
      accessPolicy: "preview",
      responseContentType: "video/mp4",
      responseContentDisposition: "attachment",
    });
  });

  it("does not sign access when the published ready preview is missing", async () => {
    const storage = createStorage();

    await expect(
      createPublicPreviewAccess({
        footageId: FOOTAGE_ID,
        store: createStore(null),
        storage,
      }),
    ).rejects.toBeInstanceOf(PreviewNotAvailableError);

    expect(storage.createReadAccess).not.toHaveBeenCalled();
  });
});
