/**
 * Provider-neutral object-storage boundary for media binaries.
 * Business modules depend on this contract, not on AWS SDK or Liara types.
 * Signed access results are temporary and must never be persisted.
 */

export type ObjectStorageProviderName = "liara-s3";

/**
 * Application-level access policy for a media object.
 * Distinct from FootageFileKind persistence, but aligned with PREVIEW/ORIGINAL.
 */
export type ObjectAccessPolicy = "cover" | "preview" | "original";

export type ObjectStorageErrorCategory =
  "not_found" | "access_denied" | "network" | "invalid_request" | "provider";

type ObjectStorageErrorParams = {
  category: ObjectStorageErrorCategory;
  operation: string;
  provider: ObjectStorageProviderName;
  bucket: string;
  objectKey?: string | null;
};

export class ObjectStorageError extends Error {
  readonly category: ObjectStorageErrorCategory;

  readonly operation: string;

  readonly provider: ObjectStorageProviderName;

  readonly bucket: string;

  readonly objectKey: string | null;

  constructor({
    category,
    operation,
    provider,
    bucket,
    objectKey = null,
  }: ObjectStorageErrorParams) {
    super("Object storage operation failed.");
    this.name = "ObjectStorageError";
    this.category = category;
    this.operation = operation;
    this.provider = provider;
    this.bucket = bucket;
    this.objectKey = objectKey;
  }
}

export type StorageObjectMetadata = {
  objectKey: string;
  sizeBytes: number | null;
  contentType: string | null;
  etag: string | null;
};

/**
 * Temporary signed access. Callers must not persist `url` in PostgreSQL or
 * treat it as entitlement.
 */
export type TemporaryObjectAccess = {
  url: string;
  method: "GET" | "PUT";
  expiresAt: Date;
  accessPolicy: ObjectAccessPolicy;
  objectKey: string;
};

export type CreateUploadAccessParams = {
  objectKey: string;
  accessPolicy: ObjectAccessPolicy;
  contentType: string;
};

export type CreateReadAccessParams = {
  objectKey: string;
  accessPolicy: ObjectAccessPolicy;
  responseContentType?: string;
  responseContentDisposition?: "inline" | "attachment";
};

export type HeadObjectParams = {
  objectKey: string;
};

export type DeleteObjectParams = {
  objectKey: string;
};

export type CreateMultipartUploadParams = {
  objectKey: string;
  accessPolicy: ObjectAccessPolicy;
  contentType: string;
};

export type MultipartUploadSession = {
  objectKey: string;
  uploadId: string;
  accessPolicy: ObjectAccessPolicy;
};

export type CreateUploadPartAccessParams = {
  objectKey: string;
  uploadId: string;
  partNumber: number;
  accessPolicy: ObjectAccessPolicy;
};

export type CompletedMultipartPart = {
  partNumber: number;
  etag: string;
};

export type CompleteMultipartUploadParams = {
  objectKey: string;
  uploadId: string;
  parts: CompletedMultipartPart[];
};

export type AbortMultipartUploadParams = {
  objectKey: string;
  uploadId: string;
};

/**
 * Narrow storage operations needed for media integration and Admin
 * direct multipart upload. Not a generic storage SDK.
 */
export type ObjectStorage = {
  readonly provider: ObjectStorageProviderName;
  /** Configured bucket name. Safe for diagnostics; not a secret. */
  readonly bucket: string;
  putObjectBytes?(params: {
    objectKey: string;
    body: Uint8Array;
    contentType: string;
  }): Promise<void>;
  createUploadAccess(
    params: CreateUploadAccessParams,
  ): Promise<TemporaryObjectAccess>;
  createReadAccess(
    params: CreateReadAccessParams,
  ): Promise<TemporaryObjectAccess>;
  headObject(params: HeadObjectParams): Promise<StorageObjectMetadata | null>;
  /**
   * Operational delete for connectivity cleanup and similar explicit ops.
   * Not an approved media-retention or automatic cleanup policy.
   */
  deleteObject(params: DeleteObjectParams): Promise<void>;
  createMultipartUpload(
    params: CreateMultipartUploadParams,
  ): Promise<MultipartUploadSession>;
  createUploadPartAccess(
    params: CreateUploadPartAccessParams,
  ): Promise<TemporaryObjectAccess>;
  completeMultipartUpload(
    params: CompleteMultipartUploadParams,
  ): Promise<StorageObjectMetadata>;
  abortMultipartUpload(params: AbortMultipartUploadParams): Promise<void>;
};
