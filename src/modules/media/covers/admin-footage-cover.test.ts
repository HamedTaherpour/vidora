import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  FootageCoverStorageError,
  InvalidFootageCoverError,
  saveAdminFootageCover,
} from "@/modules/media/covers/admin-footage-cover";
import type { AdminFootageCoverStore } from "@/modules/media/covers/admin-footage-cover-store";
import { COVER_HEIGHT, COVER_WIDTH } from "@/modules/media/covers/cover-policy";
import type { ObjectStorage } from "@/modules/media/storage/object-storage";
import sharp from "sharp";

const FOOTAGE_ID = "11111111-1111-4111-8111-111111111111";

async function validCover(): Promise<Uint8Array> {
  return new Uint8Array(
    await sharp({
      create: {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        channels: 3,
        background: { r: 30, g: 80, b: 120 },
      },
    })
      .jpeg({ quality: 80 })
      .toBuffer(),
  );
}

function createStorage(overrides: Partial<ObjectStorage> = {}): ObjectStorage {
  return {
    provider: "liara-s3",
    bucket: "bucket",
    putObjectBytes: vi.fn().mockResolvedValue(undefined),
    createUploadAccess: vi.fn(),
    createReadAccess: vi.fn(),
    headObject: vi.fn(),
    deleteObject: vi.fn(),
    createMultipartUpload: vi.fn(),
    createUploadPartAccess: vi.fn(),
    completeMultipartUpload: vi.fn(),
    abortMultipartUpload: vi.fn(),
    ...overrides,
  };
}

function createStore(): AdminFootageCoverStore {
  return {
    findByFootageId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockImplementation(async (data) => ({
      id: "cover-1",
      footageId: data.footageId,
      objectKey: data.objectKey,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      width: data.width,
      height: data.height,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  };
}

describe("saveAdminFootageCover", () => {
  it("validates the cropped JPEG dimensions and stores it", async () => {
    const store = createStore();
    const result = await saveAdminFootageCover({
      footageId: FOOTAGE_ID,
      bytes: await validCover(),
      store,
      storage: createStorage(),
      createObjectKey: () => "cover-id",
    });

    expect(result.objectKey).toBe(`footage/${FOOTAGE_ID}/cover/cover-id.jpg`);
    expect(result.width).toBe(COVER_WIDTH);
    expect(result.height).toBe(COVER_HEIGHT);
    expect(store.save).toHaveBeenCalledOnce();
  });

  it("rejects non-JPEG or non-16:9 output before storage", async () => {
    const store = createStore();
    const storage = createStorage();
    const bytes = new Uint8Array(
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: "red",
        },
      })
        .png()
        .toBuffer(),
    );

    await expect(
      saveAdminFootageCover({
        footageId: FOOTAGE_ID,
        bytes,
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(InvalidFootageCoverError);
    expect(storage.putObjectBytes).not.toHaveBeenCalled();
    expect(store.save).not.toHaveBeenCalled();
  });

  it("leaves the existing active cover untouched when storage fails", async () => {
    const store = createStore();
    const storage = createStorage({
      putObjectBytes: vi.fn().mockRejectedValue(new Error("provider down")),
    });

    await expect(
      saveAdminFootageCover({
        footageId: FOOTAGE_ID,
        bytes: await validCover(),
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(FootageCoverStorageError);
    expect(store.save).not.toHaveBeenCalled();
  });
});
