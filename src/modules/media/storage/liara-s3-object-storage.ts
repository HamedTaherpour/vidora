import "server-only";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { mapS3StorageError } from "@/modules/media/storage/map-s3-storage-error";
import type {
  ObjectStorage,
  StorageObjectMetadata,
  TemporaryObjectAccess,
} from "@/modules/media/storage/object-storage";
import { ObjectStorageError } from "@/modules/media/storage/object-storage";
import {
  createEnvSignedAccessTtlResolver,
  signedReadTtlSeconds,
  signedUploadTtlSeconds,
  type SignedAccessTtlResolver,
} from "@/modules/media/storage/storage-access-policy";
import { MULTIPART_MAX_PART_NUMBER } from "@/modules/media/uploads/upload-limits";

const PROVIDER = "liara-s3" as const;
const MAX_OBJECT_KEY_LENGTH = 1024;

export type LiaraS3StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  forcePathStyle: boolean;
};

type SignableCommand = GetObjectCommand | PutObjectCommand | UploadPartCommand;

type SignUrl = (
  client: S3Client,
  command: SignableCommand,
  options: { expiresIn: number },
) => Promise<string>;

export type PutObjectBytesParams = {
  objectKey: string;
  body: Uint8Array;
  contentType: string;
};

const defaultSignUrl: SignUrl = (client, command, options) =>
  getSignedUrl(client, command as never, options);

type LiaraS3ObjectStorageDeps = {
  config: LiaraS3StorageConfig;
  /**
   * Resolves preview/original TTLs when signed access is created.
   * Defaults to validated env vars; not required for head/delete/connectivity.
   */
  signedAccessTtl?: SignedAccessTtlResolver;
  client?: S3Client;
  signUrl?: SignUrl;
  now?: () => Date;
};

export type LiaraS3ObjectStorage = ObjectStorage & {
  /**
   * Small server-side put for prepared cover images and connectivity checks.
   * Large Admin video uploads use signed direct-to-storage access (MEDIA-03).
   */
  putObjectBytes(params: PutObjectBytesParams): Promise<void>;
};

function assertObjectKey(objectKey: string, bucket: string): string {
  const trimmed = objectKey.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_OBJECT_KEY_LENGTH) {
    throw new ObjectStorageError({
      category: "invalid_request",
      operation: "validateObjectKey",
      provider: PROVIDER,
      bucket,
      objectKey,
    });
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..")
  ) {
    throw new ObjectStorageError({
      category: "invalid_request",
      operation: "validateObjectKey",
      provider: PROVIDER,
      bucket,
      objectKey,
    });
  }

  return trimmed;
}

function assertPartNumber(partNumber: number, bucket: string): number {
  if (
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > MULTIPART_MAX_PART_NUMBER
  ) {
    throw new ObjectStorageError({
      category: "invalid_request",
      operation: "validatePartNumber",
      provider: PROVIDER,
      bucket,
    });
  }

  return partNumber;
}

function createS3Client(config: LiaraS3StorageConfig): S3Client {
  const clientConfig: S3ClientConfig = {
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  };

  return new S3Client(clientConfig);
}

function toMetadata(
  objectKey: string,
  output: {
    ContentLength?: number;
    ContentType?: string;
    ETag?: string;
  },
): StorageObjectMetadata {
  return {
    objectKey,
    sizeBytes:
      typeof output.ContentLength === "number" ? output.ContentLength : null,
    contentType: output.ContentType ?? null,
    etag: output.ETag ?? null,
  };
}

/**
 * Liara S3-compatible adapter.
 * Accepts injected config so callers never pass AWS SDK types across the
 * application boundary. Prefer `createObjectStorage()` from server code.
 */
export function createLiaraS3ObjectStorage({
  config,
  signedAccessTtl = createEnvSignedAccessTtlResolver(),
  client = createS3Client(config),
  signUrl = defaultSignUrl,
  now = () => new Date(),
}: LiaraS3ObjectStorageDeps): LiaraS3ObjectStorage {
  const bucket = config.bucket;

  async function createUploadAccess({
    objectKey,
    accessPolicy,
    contentType,
  }: Parameters<
    ObjectStorage["createUploadAccess"]
  >[0]): Promise<TemporaryObjectAccess> {
    const key = assertObjectKey(objectKey, bucket);
    const expiresIn = signedUploadTtlSeconds(
      accessPolicy,
      signedAccessTtl.resolveUploadTtl(),
    );

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });
      const url = await signUrl(client, command, { expiresIn });

      return {
        url,
        method: "PUT",
        expiresAt: new Date(now().getTime() + expiresIn * 1000),
        accessPolicy,
        objectKey: key,
      };
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "createUploadAccess",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function createReadAccess({
    objectKey,
    accessPolicy,
    responseContentType,
    responseContentDisposition,
  }: Parameters<
    ObjectStorage["createReadAccess"]
  >[0]): Promise<TemporaryObjectAccess> {
    const key = assertObjectKey(objectKey, bucket);
    const expiresIn = signedReadTtlSeconds(
      accessPolicy,
      signedAccessTtl.resolveReadTtl(),
    );

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentType: responseContentType,
        ResponseContentDisposition: responseContentDisposition,
      });
      const url = await signUrl(client, command, { expiresIn });

      return {
        url,
        method: "GET",
        expiresAt: new Date(now().getTime() + expiresIn * 1000),
        accessPolicy,
        objectKey: key,
      };
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "createReadAccess",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function headObject({
    objectKey,
  }: Parameters<
    ObjectStorage["headObject"]
  >[0]): Promise<StorageObjectMetadata | null> {
    const key = assertObjectKey(objectKey, bucket);

    try {
      const output = await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      return toMetadata(key, output);
    } catch (error) {
      const mapped = mapS3StorageError({
        error,
        operation: "headObject",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });

      if (mapped.category === "not_found") {
        return null;
      }

      throw mapped;
    }
  }

  async function deleteObject({
    objectKey,
  }: Parameters<ObjectStorage["deleteObject"]>[0]): Promise<void> {
    const key = assertObjectKey(objectKey, bucket);

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "deleteObject",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function putObjectBytes({
    objectKey,
    body,
    contentType,
  }: PutObjectBytesParams): Promise<void> {
    const key = assertObjectKey(objectKey, bucket);

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "putObjectBytes",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function createMultipartUpload({
    objectKey,
    accessPolicy,
    contentType,
  }: Parameters<ObjectStorage["createMultipartUpload"]>[0]) {
    const key = assertObjectKey(objectKey, bucket);

    try {
      const output = await client.send(
        new CreateMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
        }),
      );

      if (output.UploadId === undefined || output.UploadId.length === 0) {
        throw new ObjectStorageError({
          category: "provider",
          operation: "createMultipartUpload",
          provider: PROVIDER,
          bucket,
          objectKey: key,
        });
      }

      return {
        objectKey: key,
        uploadId: output.UploadId,
        accessPolicy,
      };
    } catch (error) {
      if (error instanceof ObjectStorageError) {
        throw error;
      }

      throw mapS3StorageError({
        error,
        operation: "createMultipartUpload",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function createUploadPartAccess({
    objectKey,
    uploadId,
    partNumber,
    accessPolicy,
  }: Parameters<
    ObjectStorage["createUploadPartAccess"]
  >[0]): Promise<TemporaryObjectAccess> {
    const key = assertObjectKey(objectKey, bucket);
    const part = assertPartNumber(partNumber, bucket);
    const expiresIn = signedUploadTtlSeconds(
      accessPolicy,
      signedAccessTtl.resolveUploadTtl(),
    );

    if (uploadId.trim().length === 0) {
      throw new ObjectStorageError({
        category: "invalid_request",
        operation: "createUploadPartAccess",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }

    try {
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: part,
      });
      const url = await signUrl(client, command, { expiresIn });

      return {
        url,
        method: "PUT",
        expiresAt: new Date(now().getTime() + expiresIn * 1000),
        accessPolicy,
        objectKey: key,
      };
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "createUploadPartAccess",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function completeMultipartUpload({
    objectKey,
    uploadId,
    parts,
  }: Parameters<
    ObjectStorage["completeMultipartUpload"]
  >[0]): Promise<StorageObjectMetadata> {
    const key = assertObjectKey(objectKey, bucket);

    if (uploadId.trim().length === 0 || parts.length === 0) {
      throw new ObjectStorageError({
        category: "invalid_request",
        operation: "completeMultipartUpload",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }

    try {
      const output = await client.send(
        new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: parts.map((part) => ({
              PartNumber: part.partNumber,
              ETag: part.etag,
            })),
          },
        }),
      );

      return toMetadata(key, {
        ETag: output.ETag,
      });
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "completeMultipartUpload",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  async function abortMultipartUpload({
    objectKey,
    uploadId,
  }: Parameters<ObjectStorage["abortMultipartUpload"]>[0]): Promise<void> {
    const key = assertObjectKey(objectKey, bucket);

    if (uploadId.trim().length === 0) {
      throw new ObjectStorageError({
        category: "invalid_request",
        operation: "abortMultipartUpload",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }

    try {
      await client.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
        }),
      );
    } catch (error) {
      throw mapS3StorageError({
        error,
        operation: "abortMultipartUpload",
        provider: PROVIDER,
        bucket,
        objectKey: key,
      });
    }
  }

  return {
    provider: PROVIDER,
    bucket,
    createUploadAccess,
    createReadAccess,
    headObject,
    deleteObject,
    putObjectBytes,
    createMultipartUpload,
    createUploadPartAccess,
    completeMultipartUpload,
    abortMultipartUpload,
  };
}
