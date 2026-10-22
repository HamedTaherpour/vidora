import { describe, expect, it, vi } from "vitest";

import {
  abortAdminMediaUpload,
  completeAdminMediaUpload,
  initiateAdminMediaUpload,
  isUsableFootageFile,
  signAdminMediaUploadPart,
} from "@/modules/media/admin-media-upload";
import {
  AdminMediaUploadValidationError,
  PreviewAlreadyReadyError,
  UploadCompletionFailedError,
  UploadSessionNotActiveError,
  UploadSessionNotFoundError,
} from "@/modules/media/admin-media-upload-errors";
import type {
  AdminMediaUploadRecord,
  AdminMediaUploadStore,
} from "@/modules/media/admin-media-upload-store";
import {
  assertAdminMediaUploadOrigin,
  handleAdminAbortMediaUpload,
  handleAdminCompleteMediaUpload,
  handleAdminInitiateMediaUpload,
  handleAdminSignMediaUploadPart,
} from "@/modules/media/handle-admin-media-upload";
import { LOCAL_DEVELOPMENT_ORIGIN } from "@/modules/auth/browser-auth-origin";
import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import {
  assertDirectStorageUrl,
  uploadFilePartsDirectly,
} from "@/modules/media/browser-multipart-upload";
import { generateFootageObjectKey } from "@/modules/media/generate-footage-object-key";
import type {
  ObjectStorage,
  StorageObjectMetadata,
  TemporaryObjectAccess,
} from "@/modules/media/object-storage";
import { ObjectStorageError } from "@/modules/media/object-storage";
import {
  expectedMultipartPartCount,
  MAX_FOOTAGE_UPLOAD_BYTES,
  MULTIPART_PART_SIZE_BYTES,
} from "@/modules/media/upload-limits";

const FOOTAGE_ID = "11111111-1111-4111-8111-111111111111";
const UPLOAD_ID = "22222222-2222-4222-8222-222222222222";
const PROVIDER_UPLOAD_ID = "provider-upload-abc";

function authenticatedAdmin(): ResolvedAdmin {
  return {
    status: "authenticated",
    adminId: "admin-1",
    phone: "+989121234567",
    expiresAt: new Date("2026-12-01T00:00:00.000Z"),
  };
}

function anonymousAdmin(): ResolvedAdmin {
  return { status: "anonymous" };
}

function makeRecord(
  overrides: Partial<AdminMediaUploadRecord> = {},
): AdminMediaUploadRecord {
  return {
    id: UPLOAD_ID,
    footageId: FOOTAGE_ID,
    kind: "ORIGINAL",
    label: "1080p",
    objectKey: `footage/${FOOTAGE_ID}/originals/file.mp4`,
    sizeBytes: BigInt(MULTIPART_PART_SIZE_BYTES + 100),
    mimeType: "video/mp4",
    uploadStatus: "INITIATED",
    providerUploadId: PROVIDER_UPLOAD_ID,
    createdAt: new Date("2026-10-07T00:00:00.000Z"),
    updatedAt: new Date("2026-10-07T00:00:00.000Z"),
    ...overrides,
  };
}

function createMemoryStore(
  initial: AdminMediaUploadRecord[] = [],
): AdminMediaUploadStore & { rows: AdminMediaUploadRecord[] } {
  const rows = [...initial];

  return {
    rows,
    async footageExists(footageId) {
      return footageId === FOOTAGE_ID;
    },
    async findPreviewForFootage(footageId) {
      return (
        rows.find(
          (row) => row.footageId === footageId && row.kind === "PREVIEW",
        ) ?? null
      );
    },
    async findById(id) {
      return rows.find((row) => row.id === id) ?? null;
    },
    async createInitiatedUpload(data) {
      const row = makeRecord({
        id: crypto.randomUUID(),
        ...data,
        uploadStatus: "INITIATED",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      rows.push(row);
      return row;
    },
    async restartInitiatedUpload(data) {
      const index = rows.findIndex((row) => row.id === data.id);
      const current = rows[index]!;
      const next = {
        ...current,
        label: data.label,
        objectKey: data.objectKey,
        sizeBytes: data.sizeBytes,
        mimeType: data.mimeType,
        providerUploadId: data.providerUploadId,
        uploadStatus: "INITIATED" as const,
        updatedAt: new Date(),
      };
      rows[index] = next;
      return next;
    },
    async markReady({ id, sizeBytes }) {
      const index = rows.findIndex((row) => row.id === id);
      const current = rows[index];
      if (
        current === undefined ||
        (current.uploadStatus !== "INITIATED" &&
          current.uploadStatus !== "FAILED")
      ) {
        return null;
      }
      const next = {
        ...current,
        sizeBytes,
        uploadStatus: "READY" as const,
        providerUploadId: null,
        updatedAt: new Date(),
      };
      rows[index] = next;
      return next;
    },
    async markFailed(id) {
      const index = rows.findIndex((row) => row.id === id);
      const current = rows[index]!;
      const next = {
        ...current,
        uploadStatus: "FAILED" as const,
        updatedAt: new Date(),
      };
      rows[index] = next;
      return next;
    },
    async markAborted(id) {
      const index = rows.findIndex((row) => row.id === id);
      const current = rows[index];
      if (current === undefined || current.uploadStatus === "READY") {
        return null;
      }
      const next = {
        ...current,
        uploadStatus: "ABORTED" as const,
        providerUploadId: null,
        updatedAt: new Date(),
      };
      rows[index] = next;
      return next;
    },
  };
}

function createFakeStorage(
  overrides: Partial<ObjectStorage> = {},
): ObjectStorage {
  let multipartCompleted = false;
  const objectKey = `footage/${FOOTAGE_ID}/originals/file.mp4`;
  const completedMetadata = (): StorageObjectMetadata => ({
    objectKey,
    sizeBytes: MULTIPART_PART_SIZE_BYTES + 100,
    contentType: "video/mp4",
    etag: '"done"',
  });

  return {
    provider: "liara-s3",
    bucket: "test-bucket",
    createUploadAccess: vi.fn(),
    createReadAccess: vi.fn(),
    headObject: vi.fn(async (): Promise<StorageObjectMetadata | null> =>
      multipartCompleted ? completedMetadata() : null,
    ),
    deleteObject: vi.fn(),
    createMultipartUpload: vi.fn(async ({ objectKey: key, accessPolicy }) => ({
      objectKey: key,
      uploadId: PROVIDER_UPLOAD_ID,
      accessPolicy,
    })),
    createUploadPartAccess: vi.fn(
      async ({
        objectKey: key,
        accessPolicy,
      }): Promise<TemporaryObjectAccess> => ({
        url: "https://storage.example.test/signed-part",
        method: "PUT",
        expiresAt: new Date("2026-10-07T12:05:00.000Z"),
        accessPolicy,
        objectKey: key,
      }),
    ),
    completeMultipartUpload: vi.fn(async ({ objectKey: key }) => {
      multipartCompleted = true;
      return {
        objectKey: key,
        sizeBytes: null,
        contentType: null,
        etag: '"complete"',
      };
    }),
    abortMultipartUpload: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("upload limits", () => {
  it("documents the 2 GiB ceiling and 16 MiB part size", () => {
    expect(MAX_FOOTAGE_UPLOAD_BYTES).toBe(2_147_483_648);
    expect(MULTIPART_PART_SIZE_BYTES).toBe(16 * 1024 * 1024);
    expect(expectedMultipartPartCount(MAX_FOOTAGE_UPLOAD_BYTES)).toBe(128);
  });
});

describe("generateFootageObjectKey", () => {
  it("builds a server-controlled predictable namespace", () => {
    expect(
      generateFootageObjectKey({
        footageId: FOOTAGE_ID,
        kind: "PREVIEW",
        fileName: "clip.MP4",
        createId: () => "fixed-id",
      }),
    ).toBe(`footage/${FOOTAGE_ID}/preview/fixed-id.mp4`);

    expect(
      generateFootageObjectKey({
        footageId: FOOTAGE_ID,
        kind: "ORIGINAL",
        fileName: "../evil.mp4",
        createId: () => "safe-id",
      }),
    ).toBe(`footage/${FOOTAGE_ID}/originals/safe-id.mp4`);
  });
});

describe("initiateAdminMediaUpload", () => {
  it("rejects uploads larger than 2 GiB before multipart initiation", async () => {
    const storage = createFakeStorage();
    const store = createMemoryStore();

    await expect(
      initiateAdminMediaUpload({
        input: {
          footageId: FOOTAGE_ID,
          kind: "ORIGINAL",
          label: "Master",
          sizeBytes: MAX_FOOTAGE_UPLOAD_BYTES + 1,
          mimeType: "video/mp4",
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    expect(storage.createMultipartUpload).not.toHaveBeenCalled();
  });

  it("requires ORIGINAL label and generates a server object key", async () => {
    const storage = createFakeStorage();
    const store = createMemoryStore();

    await expect(
      initiateAdminMediaUpload({
        input: {
          footageId: FOOTAGE_ID,
          kind: "ORIGINAL",
          sizeBytes: 1000,
          mimeType: "video/mp4",
        } as never,
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    const result = await initiateAdminMediaUpload({
      input: {
        footageId: FOOTAGE_ID,
        kind: "ORIGINAL",
        label: "4K",
        sizeBytes: 1000,
        mimeType: "video/mp4",
        fileName: "clip.mp4",
      },
      store,
      storage,
      createObjectKey: () => `footage/${FOOTAGE_ID}/originals/server.mp4`,
    });

    expect(result.objectKey).toBe(`footage/${FOOTAGE_ID}/originals/server.mp4`);
    expect(result.partSizeBytes).toBe(MULTIPART_PART_SIZE_BYTES);
    expect(store.rows).toHaveLength(1);
    expect(isUsableFootageFile(store.rows[0]!)).toBe(false);
  });

  it("preserves the one-preview invariant and rejects ready preview replacement", async () => {
    const storage = createFakeStorage();
    const store = createMemoryStore([
      makeRecord({
        kind: "PREVIEW",
        label: "Preview",
        uploadStatus: "READY",
        providerUploadId: null,
        objectKey: `footage/${FOOTAGE_ID}/preview/ready.mp4`,
      }),
    ]);

    await expect(
      initiateAdminMediaUpload({
        input: {
          footageId: FOOTAGE_ID,
          kind: "PREVIEW",
          sizeBytes: 1000,
          mimeType: "video/mp4",
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(PreviewAlreadyReadyError);
  });

  it("reuses a non-ready preview row instead of creating a second preview", async () => {
    const storage = createFakeStorage();
    const existing = makeRecord({
      kind: "PREVIEW",
      label: "Preview",
      uploadStatus: "ABORTED",
      providerUploadId: null,
      objectKey: `footage/${FOOTAGE_ID}/preview/old.mp4`,
    });
    const store = createMemoryStore([existing]);

    const result = await initiateAdminMediaUpload({
      input: {
        footageId: FOOTAGE_ID,
        kind: "PREVIEW",
        sizeBytes: 2000,
        mimeType: "video/mp4",
      },
      store,
      storage,
      createObjectKey: () => `footage/${FOOTAGE_ID}/preview/new.mp4`,
    });

    expect(result.uploadId).toBe(existing.id);
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]!.objectKey).toBe(
      `footage/${FOOTAGE_ID}/preview/new.mp4`,
    );
    expect(store.rows[0]!.uploadStatus).toBe("INITIATED");
  });
});

describe("signAdminMediaUploadPart", () => {
  it("signs only for a persisted active session and expected part numbers", async () => {
    const record = makeRecord();
    const store = createMemoryStore([record]);
    const storage = createFakeStorage();

    const signed = await signAdminMediaUploadPart({
      input: { uploadId: UPLOAD_ID, partNumber: 1 },
      store,
      storage,
    });

    expect(signed.access.url).toContain("storage.example.test");
    expect(storage.createUploadPartAccess).toHaveBeenCalledWith({
      objectKey: record.objectKey,
      uploadId: PROVIDER_UPLOAD_ID,
      partNumber: 1,
      accessPolicy: "original",
    });

    await expect(
      signAdminMediaUploadPart({
        input: { uploadId: UPLOAD_ID, partNumber: 99 },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    await expect(
      signAdminMediaUploadPart({
        input: {
          uploadId: "33333333-3333-4333-8333-333333333333",
          partNumber: 1,
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadSessionNotFoundError);
  });
});

describe("completeAdminMediaUpload", () => {
  const validParts = [
    { partNumber: 1, etag: '"a"' },
    { partNumber: 2, etag: '"b"' },
  ];

  it("marks READY only after provider completion and size confirmation", async () => {
    const record = makeRecord();
    const store = createMemoryStore([record]);
    const storage = createFakeStorage();

    const first = await completeAdminMediaUpload({
      input: { uploadId: UPLOAD_ID, parts: validParts },
      store,
      storage,
    });

    expect(first.uploadStatus).toBe("READY");
    expect(store.rows[0]!.providerUploadId).toBeNull();
    expect(isUsableFootageFile(store.rows[0]!)).toBe(true);

    const second = await completeAdminMediaUpload({
      input: { uploadId: UPLOAD_ID, parts: validParts },
      store,
      storage,
    });

    expect(second.footageFileId).toBe(UPLOAD_ID);
    expect(store.rows).toHaveLength(1);
    // First attempt heads before Complete (miss), then again after Complete.
    expect(storage.completeMultipartUpload).toHaveBeenCalledTimes(1);
  });

  it("rejects missing, duplicate, unexpected, or invalid part submissions", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage();

    await expect(
      completeAdminMediaUpload({
        input: {
          uploadId: UPLOAD_ID,
          parts: [{ partNumber: 1, etag: '"a"' }],
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    await expect(
      completeAdminMediaUpload({
        input: {
          uploadId: UPLOAD_ID,
          parts: [
            { partNumber: 1, etag: '"a"' },
            { partNumber: 1, etag: '"b"' },
          ],
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    await expect(
      completeAdminMediaUpload({
        input: {
          uploadId: UPLOAD_ID,
          parts: [
            { partNumber: 1, etag: '"a"' },
            { partNumber: 3, etag: '"b"' },
          ],
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    await expect(
      completeAdminMediaUpload({
        input: {
          uploadId: UPLOAD_ID,
          parts: [
            { partNumber: 1, etag: '"a"' },
            { partNumber: 2, etag: "bad\netag" },
          ],
        },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(AdminMediaUploadValidationError);

    expect(storage.completeMultipartUpload).not.toHaveBeenCalled();
    expect(store.rows[0]!.uploadStatus).toBe("INITIATED");
  });

  it("normalizes unordered parts before calling the provider", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage();

    await completeAdminMediaUpload({
      input: {
        uploadId: UPLOAD_ID,
        parts: [
          { partNumber: 2, etag: '"b"' },
          { partNumber: 1, etag: '"a"' },
        ],
      },
      store,
      storage,
    });

    expect(storage.completeMultipartUpload).toHaveBeenCalledWith({
      objectKey: store.rows[0]!.objectKey,
      uploadId: PROVIDER_UPLOAD_ID,
      parts: [
        { partNumber: 1, etag: '"a"' },
        { partNumber: 2, etag: '"b"' },
      ],
    });
  });

  it("keeps the session non-ready when size confirmation fails", async () => {
    const record = makeRecord();
    const store = createMemoryStore([record]);
    const storage = createFakeStorage({
      headObject: vi.fn().mockResolvedValueOnce(null).mockResolvedValue({
        objectKey: record.objectKey,
        sizeBytes: 1,
        contentType: "video/mp4",
        etag: '"x"',
      }),
    });

    await expect(
      completeAdminMediaUpload({
        input: { uploadId: UPLOAD_ID, parts: validParts },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadCompletionFailedError);

    expect(store.rows[0]!.uploadStatus).toBe("FAILED");
    expect(isUsableFootageFile(store.rows[0]!)).toBe(false);
  });

  it("recovers when provider completion already succeeded but READY was not persisted", async () => {
    const record = makeRecord();
    const store = createMemoryStore([record]);
    const storage = createFakeStorage({
      completeMultipartUpload: vi.fn(async () => {
        throw new ObjectStorageError({
          category: "not_found",
          operation: "completeMultipartUpload",
          provider: "liara-s3",
          bucket: "test-bucket",
          objectKey: record.objectKey,
        });
      }),
      headObject: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValue({
          objectKey: record.objectKey,
          sizeBytes: MULTIPART_PART_SIZE_BYTES + 100,
          contentType: "video/mp4",
          etag: '"done"',
        }),
    });

    const result = await completeAdminMediaUpload({
      input: { uploadId: UPLOAD_ID, parts: validParts },
      store,
      storage,
    });

    expect(result.uploadStatus).toBe("READY");
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]!.uploadStatus).toBe("READY");
    expect(isUsableFootageFile(store.rows[0]!)).toBe(true);
  });

  it("recovers a FAILED row when HeadObject already matches the authorized size", async () => {
    const record = makeRecord({ uploadStatus: "FAILED" });
    const store = createMemoryStore([record]);
    const storage = createFakeStorage({
      headObject: vi.fn(async () => ({
        objectKey: record.objectKey,
        sizeBytes: MULTIPART_PART_SIZE_BYTES + 100,
        contentType: "video/mp4",
        etag: '"done"',
      })),
    });

    const result = await completeAdminMediaUpload({
      input: { uploadId: UPLOAD_ID, parts: validParts },
      store,
      storage,
    });

    expect(result.uploadStatus).toBe("READY");
    expect(storage.completeMultipartUpload).not.toHaveBeenCalled();
    expect(store.rows).toHaveLength(1);
  });

  it("preserves INITIATED for retryable provider completion failures", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage({
      headObject: vi.fn(async () => null),
      completeMultipartUpload: vi.fn(async () => {
        throw new ObjectStorageError({
          category: "invalid_request",
          operation: "completeMultipartUpload",
          provider: "liara-s3",
          bucket: "test-bucket",
          objectKey: `footage/${FOOTAGE_ID}/originals/file.mp4`,
        });
      }),
    });

    await expect(
      completeAdminMediaUpload({
        input: { uploadId: UPLOAD_ID, parts: validParts },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadCompletionFailedError);

    expect(store.rows[0]!.uploadStatus).toBe("INITIATED");
    expect(store.rows[0]!.providerUploadId).toBe(PROVIDER_UPLOAD_ID);
  });

  it("does not overwrite ABORTED when markReady loses a concurrent abort race", async () => {
    const record = makeRecord();
    const store = createMemoryStore([record]);
    const storage = createFakeStorage({
      headObject: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockImplementation(async () => {
          store.rows[0] = {
            ...store.rows[0]!,
            uploadStatus: "ABORTED",
            providerUploadId: null,
          };
          return {
            objectKey: record.objectKey,
            sizeBytes: MULTIPART_PART_SIZE_BYTES + 100,
            contentType: "video/mp4",
            etag: '"done"',
          };
        }),
    });

    await expect(
      completeAdminMediaUpload({
        input: { uploadId: UPLOAD_ID, parts: validParts },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadSessionNotActiveError);

    expect(store.rows[0]!.uploadStatus).toBe("ABORTED");
    expect(isUsableFootageFile(store.rows[0]!)).toBe(false);
  });
});

describe("abortAdminMediaUpload", () => {
  it("aborts unfinished uploads without marking READY", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage();

    const result = await abortAdminMediaUpload({
      input: { uploadId: UPLOAD_ID },
      store,
      storage,
    });

    expect(result.uploadStatus).toBe("ABORTED");
    expect(store.rows[0]!.uploadStatus).toBe("ABORTED");
    expect(storage.abortMultipartUpload).toHaveBeenCalledWith({
      objectKey: store.rows[0]!.objectKey,
      uploadId: PROVIDER_UPLOAD_ID,
    });

    await expect(
      abortAdminMediaUpload({
        input: { uploadId: UPLOAD_ID },
        store: createMemoryStore([
          makeRecord({ uploadStatus: "READY", providerUploadId: null }),
        ]),
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadSessionNotActiveError);
  });
});

describe("Admin media upload authorization and origin protection", () => {
  it("denies anonymous and customer callers for all control operations", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage();

    await expect(
      handleAdminInitiateMediaUpload({
        admin: anonymousAdmin(),
        body: {
          footageId: FOOTAGE_ID,
          kind: "ORIGINAL",
          label: "1080p",
          sizeBytes: 1000,
          mimeType: "video/mp4",
        },
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "denied" });

    await expect(
      handleAdminSignMediaUploadPart({
        admin: anonymousAdmin(),
        uploadId: UPLOAD_ID,
        body: { partNumber: 1 },
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "denied" });

    await expect(
      handleAdminCompleteMediaUpload({
        admin: anonymousAdmin(),
        uploadId: UPLOAD_ID,
        body: { parts: [{ partNumber: 1, etag: '"a"' }] },
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "denied" });

    await expect(
      handleAdminAbortMediaUpload({
        admin: anonymousAdmin(),
        uploadId: UPLOAD_ID,
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "denied" });
  });

  it("allows Admin initiate and rejects browser-supplied objectKey", async () => {
    const store = createMemoryStore();
    const storage = createFakeStorage();

    const allowed = await handleAdminInitiateMediaUpload({
      admin: authenticatedAdmin(),
      body: {
        footageId: FOOTAGE_ID,
        kind: "ORIGINAL",
        label: "Master",
        sizeBytes: 1000,
        mimeType: "video/mp4",
      },
      store,
      storage,
    });

    expect(allowed.status).toBe("ok");

    const rejectedKey = await handleAdminInitiateMediaUpload({
      admin: authenticatedAdmin(),
      body: {
        footageId: FOOTAGE_ID,
        kind: "ORIGINAL",
        label: "Master",
        sizeBytes: 1000,
        mimeType: "video/mp4",
        objectKey: "attacker/key",
      },
      store,
      storage,
    });

    expect(rejectedKey).toEqual({ status: "invalid_input" });
  });

  it("rejects cross-session signing payloads and missing Origin", () => {
    expect(
      assertAdminMediaUploadOrigin({
        request: new Request("http://localhost:3000/api/admin/media/uploads", {
          method: "POST",
          headers: { origin: LOCAL_DEVELOPMENT_ORIGIN },
        }),
        appOrigin: undefined,
        nodeEnv: "development",
      }),
    ).toBe(true);

    expect(
      assertAdminMediaUploadOrigin({
        request: new Request("http://localhost:3000/api/admin/media/uploads", {
          method: "POST",
        }),
        appOrigin: undefined,
        nodeEnv: "development",
      }),
    ).toBe(false);
  });

  it("rejects arbitrary provider uploadId or objectKey on sign requests", async () => {
    const store = createMemoryStore([makeRecord()]);
    const storage = createFakeStorage();

    await expect(
      handleAdminSignMediaUploadPart({
        admin: authenticatedAdmin(),
        uploadId: UPLOAD_ID,
        body: {
          partNumber: 1,
          objectKey: "attacker/key",
        },
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "invalid_input" });

    await expect(
      handleAdminSignMediaUploadPart({
        admin: authenticatedAdmin(),
        uploadId: UPLOAD_ID,
        body: {
          partNumber: 1,
          providerUploadId: "other-upload",
        },
        store,
        storage,
      }),
    ).resolves.toEqual({ status: "invalid_input" });
  });
});

describe("browser multipart upload helper", () => {
  it("slices the file, targets storage URLs, and retries a failed part", async () => {
    const bytes = new Uint8Array(MULTIPART_PART_SIZE_BYTES + 10).fill(7);
    const file = new File([bytes], "clip.mp4", { type: "video/mp4" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 500, headers: { etag: '"fail"' } }),
      )
      .mockResolvedValueOnce(
        new Response(null, { status: 200, headers: { etag: '"part-1"' } }),
      )
      .mockResolvedValueOnce(
        new Response(null, { status: 200, headers: { etag: '"part-2"' } }),
      );

    vi.stubGlobal("fetch", fetchMock);

    try {
      const parts = await uploadFilePartsDirectly({
        file,
        partSizeBytes: MULTIPART_PART_SIZE_BYTES,
        partCount: 2,
        maxPartAttempts: 2,
        signPart: async (partNumber) => ({
          url: `https://storage.example.test/part-${partNumber}`,
          method: "PUT",
        }),
      });

      expect(parts).toEqual([
        { partNumber: 1, etag: '"part-1"' },
        { partNumber: 2, etag: '"part-2"' },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
        "storage.example.test",
      );
      expect(() =>
        assertDirectStorageUrl(
          "https://storage.example.test/part",
          "http://localhost:3000",
        ),
      ).not.toThrow();
      expect(() =>
        assertDirectStorageUrl(
          "http://localhost:3000/api/admin/media/uploads/x/parts",
          "http://localhost:3000",
        ),
      ).toThrow(/object storage/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
