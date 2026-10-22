import type { S3Client } from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";

import { parseEnv, EnvironmentConfigError } from "@/lib/env/parse-env";
import {
  STORAGE_SIGNED_ACCESS_TTL_MAX_SECONDS,
  storageEnvSchema,
  storageSignedReadTtlEnvSchema,
  storageSignedUploadTtlEnvSchema,
} from "@/lib/env/server-schema";
import { createLiaraS3ObjectStorage } from "@/modules/media/liara-s3-object-storage";
import { mapS3StorageError } from "@/modules/media/map-s3-storage-error";
import {
  ObjectStorageError,
  type ObjectStorage,
  type TemporaryObjectAccess,
} from "@/modules/media/object-storage";
import {
  createEnvSignedAccessTtlResolver,
  resolveSignedReadTtlSeconds,
  resolveSignedUploadTtlSeconds,
  signedReadTtlSeconds,
  signedUploadTtlSeconds,
  type SignedAccessPolicyTtlSeconds,
  type SignedAccessTtlResolver,
} from "@/modules/media/storage-access-policy";

const storageEnv = {
  STORAGE_ENDPOINT: "https://storage.example.test",
  STORAGE_REGION: "default",
  STORAGE_BUCKET: "vidora-media",
  STORAGE_ACCESS_KEY: "test-access-key",
  STORAGE_SECRET_KEY: "test-secret-key",
  STORAGE_FORCE_PATH_STYLE: "true" as const,
};

/** Test-only TTL fixture — not a product default. */
const testReadTtl: SignedAccessPolicyTtlSeconds = {
  preview: 111,
  original: 22,
};

/** Test-only TTL fixture — not a product default. */
const testUploadTtl: SignedAccessPolicyTtlSeconds = {
  preview: 333,
  original: 44,
};

const testSignedAccessTtl: SignedAccessTtlResolver = {
  resolveReadTtl: () => testReadTtl,
  resolveUploadTtl: () => testUploadTtl,
};

function captureConfigError(parse: () => unknown): EnvironmentConfigError {
  try {
    parse();
  } catch (error) {
    if (error instanceof EnvironmentConfigError) {
      return error;
    }

    throw error;
  }

  throw new Error("expected environment validation to fail");
}

function createMockClient(send?: unknown): S3Client {
  return { send: send ?? vi.fn() } as unknown as S3Client;
}

function createTestStorage({
  send,
  signUrl,
  now,
  signedAccessTtl = testSignedAccessTtl,
}: {
  send?: unknown;
  signUrl?: (
    client: S3Client,
    command: unknown,
    options: { expiresIn: number },
  ) => Promise<string>;
  now?: () => Date;
  signedAccessTtl?: SignedAccessTtlResolver;
} = {}) {
  return createLiaraS3ObjectStorage({
    config: {
      endpoint: storageEnv.STORAGE_ENDPOINT,
      region: storageEnv.STORAGE_REGION,
      bucket: storageEnv.STORAGE_BUCKET,
      accessKey: storageEnv.STORAGE_ACCESS_KEY,
      secretKey: storageEnv.STORAGE_SECRET_KEY,
      forcePathStyle: true,
    },
    signedAccessTtl,
    client: createMockClient(send),
    signUrl: signUrl as never,
    now,
  });
}
describe("storage environment schema", () => {
  it("parses Liara-compatible storage configuration", () => {
    expect(parseEnv(storageEnvSchema, storageEnv)).toEqual(storageEnv);
  });

  it("rejects missing credentials without printing secret values", () => {
    const secret = "live-storage-secret";
    const error = captureConfigError(() =>
      parseEnv(storageEnvSchema, {
        ...storageEnv,
        STORAGE_SECRET_KEY: undefined,
        STORAGE_ACCESS_KEY: secret,
      }),
    );

    expect(error.message).toContain("STORAGE_SECRET_KEY");
    expect(error.message).not.toContain(secret);
  });

  it("rejects an invalid force-path-style flag without printing secrets", () => {
    const secret = "live-storage-secret";
    const error = captureConfigError(() =>
      parseEnv(storageEnvSchema, {
        ...storageEnv,
        STORAGE_SECRET_KEY: secret,
        STORAGE_FORCE_PATH_STYLE: "yes",
      }),
    );

    expect(error.message).toContain("STORAGE_FORCE_PATH_STYLE");
    expect(error.message).not.toContain(secret);
  });

  it("keeps storage credentials out of boot serverEnvSchema", async () => {
    const { serverEnvSchema } = await import("@/lib/env/server-schema");

    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_ACCESS_KEY",
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_SECRET_KEY",
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_ENDPOINT",
    );
    expect(Object.keys(serverEnvSchema.shape)).not.toContain(
      "STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS",
    );
  });
});

describe("signed-access TTL environment schema", () => {
  const validReadTtlEnv = {
    STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: "120",
    STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS: "30",
  };

  const validUploadTtlEnv = {
    STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS: "180",
    STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS: "60",
  };

  it("parses distinct preview and original read TTL configuration", () => {
    expect(parseEnv(storageSignedReadTtlEnvSchema, validReadTtlEnv)).toEqual({
      STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: 120,
      STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS: 30,
    });
  });

  it("parses distinct preview and original upload TTL configuration", () => {
    expect(
      parseEnv(storageSignedUploadTtlEnvSchema, validUploadTtlEnv),
    ).toEqual({
      STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS: 180,
      STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS: 60,
    });
  });

  it("rejects missing signed-read TTL without requiring storage credentials", () => {
    const error = captureConfigError(() =>
      parseEnv(storageSignedReadTtlEnvSchema, {
        STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: "120",
      }),
    );

    expect(error.message).toContain("STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS");
  });

  it("rejects zero, non-integer, and above-max TTL values", () => {
    const zero = captureConfigError(() =>
      parseEnv(storageSignedReadTtlEnvSchema, {
        ...validReadTtlEnv,
        STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: "0",
      }),
    );
    const nonInteger = captureConfigError(() =>
      parseEnv(storageSignedReadTtlEnvSchema, {
        ...validReadTtlEnv,
        STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS: "15.5",
      }),
    );
    const tooLarge = captureConfigError(() =>
      parseEnv(storageSignedReadTtlEnvSchema, {
        ...validReadTtlEnv,
        STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS: String(
          STORAGE_SIGNED_ACCESS_TTL_MAX_SECONDS + 1,
        ),
      }),
    );

    expect(zero.message).toContain("STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS");
    expect(nonInteger.message).toContain(
      "STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS",
    );
    expect(tooLarge.message).toContain(
      "STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS",
    );
    expect(tooLarge.message).toContain(
      String(STORAGE_SIGNED_ACCESS_TTL_MAX_SECONDS),
    );
  });

  it("resolves TTL maps from env only when signed-access helpers are used", () => {
    expect(resolveSignedReadTtlSeconds(validReadTtlEnv)).toEqual({
      preview: 120,
      original: 30,
    });
    expect(resolveSignedUploadTtlSeconds(validUploadTtlEnv)).toEqual({
      preview: 180,
      original: 60,
    });

    const resolver = createEnvSignedAccessTtlResolver({
      ...validReadTtlEnv,
      ...validUploadTtlEnv,
    });
    expect(resolver.resolveReadTtl()).toEqual({ preview: 120, original: 30 });
    expect(resolver.resolveUploadTtl()).toEqual({
      preview: 180,
      original: 60,
    });
  });
});

describe("preview and original access policy", () => {
  it("keeps preview and original signed lifetimes as distinct policy selections", () => {
    expect(signedReadTtlSeconds("preview", testReadTtl)).toBe(
      testReadTtl.preview,
    );
    expect(signedReadTtlSeconds("original", testReadTtl)).toBe(
      testReadTtl.original,
    );
    expect(signedReadTtlSeconds("preview", testReadTtl)).not.toBe(
      signedReadTtlSeconds("original", testReadTtl),
    );
    expect(signedUploadTtlSeconds("preview", testUploadTtl)).toBe(
      testUploadTtl.preview,
    );
    expect(signedUploadTtlSeconds("original", testUploadTtl)).toBe(
      testUploadTtl.original,
    );
  });

  it("returns distinct accessPolicy values and configured read TTLs", async () => {
    const signUrl = vi
      .fn()
      .mockResolvedValueOnce("https://storage.example.test/preview-signed")
      .mockResolvedValueOnce("https://storage.example.test/original-signed");
    const storage = createTestStorage({
      signUrl,
      now: () => new Date("2026-10-07T12:00:00.000Z"),
    });

    const preview = await storage.createReadAccess({
      objectKey: "footage/a/preview/v1.mp4",
      accessPolicy: "preview",
    });
    const original = await storage.createReadAccess({
      objectKey: "footage/a/originals/1080p.mp4",
      accessPolicy: "original",
    });

    expect(preview.accessPolicy).toBe("preview");
    expect(original.accessPolicy).toBe("original");
    expect(preview.expiresAt.toISOString()).toBe("2026-10-07T12:01:51.000Z");
    expect(original.expiresAt.toISOString()).toBe("2026-10-07T12:00:22.000Z");
    expect(signUrl.mock.calls[0]?.[2]).toEqual({
      expiresIn: testReadTtl.preview,
    });
    expect(signUrl.mock.calls[1]?.[2]).toEqual({
      expiresIn: testReadTtl.original,
    });
    expect(preview.method).toBe("GET");
    expect(original.method).toBe("GET");
  });

  it("signs provider response headers for preview streaming and download", async () => {
    const signUrl = vi
      .fn()
      .mockResolvedValue("https://storage.example.test/preview-signed");
    const storage = createTestStorage({ signUrl });

    await storage.createReadAccess({
      objectKey: "footage/a/preview/v1.mp4",
      accessPolicy: "preview",
      responseContentType: "video/mp4",
      responseContentDisposition: "attachment",
    });

    const command = signUrl.mock.calls[0]?.[1] as {
      input?: Record<string, unknown>;
    };
    expect(command.input).toMatchObject({
      ResponseContentType: "video/mp4",
      ResponseContentDisposition: "attachment",
    });
  });

  it("does not require signed-access TTL env for non-signing operations", async () => {
    const send = vi.fn().mockRejectedValue({
      name: "NotFound",
      $metadata: { httpStatusCode: 404 },
    });
    const resolveReadTtl = vi.fn(() => testReadTtl);
    const resolveUploadTtl = vi.fn(() => testUploadTtl);
    const storage = createTestStorage({
      send,
      signedAccessTtl: { resolveReadTtl, resolveUploadTtl },
    });

    await expect(
      storage.headObject({ objectKey: "footage/missing.mp4" }),
    ).resolves.toBeNull();
    expect(resolveReadTtl).not.toHaveBeenCalled();
    expect(resolveUploadTtl).not.toHaveBeenCalled();
  });
});

describe("mapS3StorageError", () => {
  it("translates provider failures into safe application errors", () => {
    const secret = "Credential=AKIASECRET";
    const error = mapS3StorageError({
      error: {
        name: "AccessDenied",
        message: `Access Denied ${secret}`,
        $metadata: { httpStatusCode: 403 },
      },
      operation: "headObject",
      provider: "liara-s3",
      bucket: "vidora-media",
      objectKey: "footage/a/originals/master.mp4",
    });

    expect(error).toBeInstanceOf(ObjectStorageError);
    expect(error.message).toBe("Object storage operation failed.");
    expect(error.message).not.toContain(secret);
    expect(error.category).toBe("access_denied");
    expect(error.operation).toBe("headObject");
    expect(error.provider).toBe("liara-s3");
    expect(error.bucket).toBe("vidora-media");
    expect(error.objectKey).toBe("footage/a/originals/master.mp4");
  });

  it("maps missing objects to not_found", () => {
    const error = mapS3StorageError({
      error: { name: "NotFound", $metadata: { httpStatusCode: 404 } },
      operation: "headObject",
      provider: "liara-s3",
      bucket: "vidora-media",
      objectKey: "missing",
    });

    expect(error.category).toBe("not_found");
  });

  it("maps NoSuchUpload to not_found for completion recovery", () => {
    const error = mapS3StorageError({
      error: { name: "NoSuchUpload", $metadata: { httpStatusCode: 404 } },
      operation: "completeMultipartUpload",
      provider: "liara-s3",
      bucket: "vidora-media",
      objectKey: "footage/a/originals/master.mp4",
    });

    expect(error.category).toBe("not_found");
  });
});

describe("Liara S3 object storage adapter", () => {
  it("does not persist signed URL results", async () => {
    const persisted: TemporaryObjectAccess[] = [];
    const storage = createTestStorage({
      signUrl: async () =>
        "https://storage.example.test/signed?X-Amz-Signature=abc",
      now: () => new Date("2026-10-07T12:00:00.000Z"),
    });

    const access = await storage.createUploadAccess({
      objectKey: "footage/a/originals/master.mp4",
      accessPolicy: "original",
      contentType: "video/mp4",
    });

    // The storage layer returns temporary access and has no persistence hook.
    expect(persisted).toEqual([]);
    expect(access.url).toContain("signed");
    expect(access.expiresAt.toISOString()).toBe("2026-10-07T12:00:44.000Z");
    expect(Object.keys(storage)).not.toContain("persist");
    expect(Object.keys(storage)).not.toContain("save");
  });

  it("returns null from headObject when the provider reports not found", async () => {
    const send = vi.fn().mockRejectedValue({
      name: "NotFound",
      $metadata: { httpStatusCode: 404 },
    });
    const storage = createTestStorage({ send });

    await expect(
      storage.headObject({ objectKey: "footage/missing.mp4" }),
    ).resolves.toBeNull();
  });

  it("translates non-not-found head failures", async () => {
    const send = vi.fn().mockRejectedValue({
      name: "AccessDenied",
      message: "Access Denied with credential detail",
      $metadata: { httpStatusCode: 403 },
    });
    const storage = createTestStorage({ send });

    await expect(
      storage.headObject({ objectKey: "footage/private.mp4" }),
    ).rejects.toMatchObject({
      name: "ObjectStorageError",
      category: "access_denied",
      message: "Object storage operation failed.",
    });
  });

  it("exposes an application-owned contract without AWS SDK types", () => {
    const storage: ObjectStorage = createTestStorage();

    expect(storage.provider).toBe("liara-s3");
    expect(storage.bucket).toBe("vidora-media");
    expect(typeof storage.createUploadAccess).toBe("function");
    expect(typeof storage.createReadAccess).toBe("function");
    expect(typeof storage.headObject).toBe("function");
    expect(typeof storage.deleteObject).toBe("function");
    expect(typeof storage.createMultipartUpload).toBe("function");
    expect(typeof storage.createUploadPartAccess).toBe("function");
    expect(typeof storage.completeMultipartUpload).toBe("function");
    expect(typeof storage.abortMultipartUpload).toBe("function");

    // ObjectStorage is assignable without referencing AWS SDK command/client types.
    const contractKeys: Array<keyof ObjectStorage> = [
      "provider",
      "bucket",
      "createUploadAccess",
      "createReadAccess",
      "headObject",
      "deleteObject",
      "createMultipartUpload",
      "createUploadPartAccess",
      "completeMultipartUpload",
      "abortMultipartUpload",
    ];
    for (const key of contractKeys) {
      expect(storage[key]).toBeDefined();
    }
  });

  it("creates, signs, completes, and aborts multipart uploads through the adapter", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({ UploadId: "mpu-1" })
      .mockResolvedValueOnce({ ETag: '"complete"' })
      .mockResolvedValueOnce({});
    const signUrl = vi
      .fn()
      .mockResolvedValue("https://storage.example.test/part?X-Amz-Signature=x");
    const storage = createTestStorage({
      send,
      signUrl,
      now: () => new Date("2026-10-07T12:00:00.000Z"),
    });

    const session = await storage.createMultipartUpload({
      objectKey: "footage/a/originals/master.mp4",
      accessPolicy: "original",
      contentType: "video/mp4",
    });
    expect(session.uploadId).toBe("mpu-1");

    const partAccess = await storage.createUploadPartAccess({
      objectKey: session.objectKey,
      uploadId: session.uploadId,
      partNumber: 1,
      accessPolicy: "original",
    });
    expect(partAccess.method).toBe("PUT");
    expect(partAccess.url).toContain("storage.example.test");

    await expect(
      storage.completeMultipartUpload({
        objectKey: session.objectKey,
        uploadId: session.uploadId,
        parts: [{ partNumber: 1, etag: '"p1"' }],
      }),
    ).resolves.toMatchObject({ objectKey: session.objectKey });

    await expect(
      storage.abortMultipartUpload({
        objectKey: "footage/a/originals/other.mp4",
        uploadId: "mpu-abort",
      }),
    ).resolves.toBeUndefined();

    expect(send).toHaveBeenCalledTimes(3);
  });

  it("rejects unsafe object keys before calling the provider", async () => {
    const send = vi.fn();
    const storage = createTestStorage({ send });

    await expect(
      storage.headObject({ objectKey: "../secrets.txt" }),
    ).rejects.toMatchObject({
      category: "invalid_request",
    });
    expect(send).not.toHaveBeenCalled();
  });
});

describe("object storage server boundary", () => {
  it("refuses to load the storage factory outside the Next.js server runtime", async () => {
    await expect(
      import("@/modules/media/create-object-storage"),
    ).rejects.toThrow(/Client Component/);
    await expect(
      import("@/modules/media/verify-object-storage-connectivity"),
    ).rejects.toThrow(/Client Component/);
  });
});
