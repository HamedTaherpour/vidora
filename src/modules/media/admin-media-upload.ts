import {
  AdminMediaUploadValidationError,
  FootageNotFoundForUploadError,
  PreviewAlreadyReadyError,
  UploadCompletionFailedError,
  UploadSessionNotActiveError,
  UploadSessionNotFoundError,
} from "@/modules/media/admin-media-upload-errors";
import {
  abortAdminMediaUploadInputSchema,
  completeAdminMediaUploadInputSchema,
  initiateAdminMediaUploadInputSchema,
  signAdminMediaUploadPartInputSchema,
  type AbortAdminMediaUploadInput,
  type CompleteAdminMediaUploadInput,
  type InitiateAdminMediaUploadInput,
  type SignAdminMediaUploadPartInput,
} from "@/modules/media/admin-media-upload-input";
import type {
  AdminMediaUploadRecord,
  AdminMediaUploadStore,
} from "@/modules/media/admin-media-upload-store";
import { generateFootageObjectKey } from "@/modules/media/generate-footage-object-key";
import {
  ObjectStorageError,
  type CompletedMultipartPart,
  type ObjectAccessPolicy,
  type ObjectStorage,
  type TemporaryObjectAccess,
} from "@/modules/media/object-storage";
import {
  expectedMultipartPartCount,
  MAX_FOOTAGE_UPLOAD_BYTES,
  MULTIPART_PART_SIZE_BYTES,
} from "@/modules/media/upload-limits";

export type InitiateAdminMediaUploadResult = {
  uploadId: string;
  footageFileId: string;
  objectKey: string;
  kind: "PREVIEW" | "ORIGINAL";
  label: string;
  sizeBytes: number;
  mimeType: string;
  partSizeBytes: number;
  partCount: number;
  maxUploadBytes: number;
};

export type SignAdminMediaUploadPartResult = {
  uploadId: string;
  partNumber: number;
  access: TemporaryObjectAccess;
};

export type CompleteAdminMediaUploadResult = {
  footageFileId: string;
  objectKey: string;
  sizeBytes: number;
  uploadStatus: "READY";
};

export type AbortAdminMediaUploadResult = {
  footageFileId: string;
  uploadStatus: "ABORTED";
};

function accessPolicyForKind(kind: "PREVIEW" | "ORIGINAL"): ObjectAccessPolicy {
  return kind === "PREVIEW" ? "preview" : "original";
}

function previewLabel(label: string | undefined): string {
  return label ?? "Preview";
}

function assertSizeWithinLimit(sizeBytes: number): void {
  if (sizeBytes > MAX_FOOTAGE_UPLOAD_BYTES) {
    throw new AdminMediaUploadValidationError(
      `Upload exceeds the 2 GiB maximum (${MAX_FOOTAGE_UPLOAD_BYTES} bytes).`,
    );
  }
}

function expectedPartsForRecord(record: AdminMediaUploadRecord): number {
  const size = Number(record.sizeBytes);
  return expectedMultipartPartCount(size);
}

/**
 * Client ETags are untrusted inputs forwarded to CompleteMultipartUpload.
 * Reject empty/control characters; never treat ETag as proof of object size.
 */
function assertUntrustedPartEtag(etag: string): string {
  const trimmed = etag.trim();

  if (
    trimmed.length === 0 ||
    trimmed.length > 255 ||
    /[\s\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw new AdminMediaUploadValidationError(
      "Completed part ETag is invalid.",
    );
  }

  return trimmed;
}

function normalizeCompletedParts(
  parts: CompletedMultipartPart[],
  expectedCount: number,
): CompletedMultipartPart[] {
  const byNumber = new Map<number, string>();

  for (const part of parts) {
    if (part.partNumber < 1 || part.partNumber > expectedCount) {
      throw new AdminMediaUploadValidationError(
        "Completed part number is outside the expected range.",
      );
    }

    if (byNumber.has(part.partNumber)) {
      throw new AdminMediaUploadValidationError(
        "Completed parts contain a duplicate part number.",
      );
    }

    byNumber.set(part.partNumber, assertUntrustedPartEtag(part.etag));
  }

  if (byNumber.size !== expectedCount) {
    throw new AdminMediaUploadValidationError(
      "Completed parts must include every expected part number exactly once.",
    );
  }

  return Array.from({ length: expectedCount }, (_, index) => {
    const partNumber = index + 1;
    return {
      partNumber,
      etag: byNumber.get(partNumber)!,
    };
  });
}

type ObjectSizeCheck =
  | { status: "match"; sizeBytes: number }
  | { status: "missing" }
  | { status: "mismatch" };

async function checkCompletedObjectSize({
  storage,
  objectKey,
  expectedSizeBytes,
}: {
  storage: ObjectStorage;
  objectKey: string;
  expectedSizeBytes: number;
}): Promise<ObjectSizeCheck> {
  const metadata = await storage.headObject({ objectKey });

  if (metadata === null || metadata.sizeBytes === null) {
    return { status: "missing" };
  }

  if (metadata.sizeBytes !== expectedSizeBytes) {
    return { status: "mismatch" };
  }

  return { status: "match", sizeBytes: metadata.sizeBytes };
}

async function markReadyAfterVerifiedSize({
  store,
  uploadId,
  sizeBytes,
}: {
  store: AdminMediaUploadStore;
  uploadId: string;
  sizeBytes: number;
}): Promise<CompleteAdminMediaUploadResult> {
  const ready = await store.markReady({
    id: uploadId,
    sizeBytes: BigInt(sizeBytes),
  });

  if (ready !== null) {
    return {
      footageFileId: ready.id,
      objectKey: ready.objectKey,
      sizeBytes: Number(ready.sizeBytes),
      uploadStatus: "READY",
    };
  }

  const current = await store.findById(uploadId);

  if (current?.uploadStatus === "READY") {
    return {
      footageFileId: current.id,
      objectKey: current.objectKey,
      sizeBytes: Number(current.sizeBytes),
      uploadStatus: "READY",
    };
  }

  throw new UploadSessionNotActiveError();
}

async function requireActiveUpload(
  store: AdminMediaUploadStore,
  uploadId: string,
): Promise<AdminMediaUploadRecord> {
  const record = await store.findById(uploadId);

  if (record === null) {
    throw new UploadSessionNotFoundError();
  }

  if (record.uploadStatus !== "INITIATED" || record.providerUploadId === null) {
    throw new UploadSessionNotActiveError();
  }

  return record;
}

/**
 * Start an Admin-authorized multipart upload for an existing Footage.
 * Creates or restarts a FootageFile row in INITIATED state. READY previews
 * cannot be replaced (product replacement policy is unresolved).
 */
export async function initiateAdminMediaUpload({
  input,
  store,
  storage,
  createObjectKey = generateFootageObjectKey,
}: {
  input: InitiateAdminMediaUploadInput;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
  createObjectKey?: typeof generateFootageObjectKey;
}): Promise<InitiateAdminMediaUploadResult> {
  const parsed = initiateAdminMediaUploadInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminMediaUploadValidationError();
  }

  const data = parsed.data;
  assertSizeWithinLimit(data.sizeBytes);

  const footageExists = await store.footageExists(data.footageId);

  if (!footageExists) {
    throw new FootageNotFoundForUploadError();
  }

  const label =
    data.kind === "ORIGINAL" ? data.label! : previewLabel(data.label);
  const objectKey = createObjectKey({
    footageId: data.footageId,
    kind: data.kind,
    fileName: data.fileName,
  });
  const accessPolicy = accessPolicyForKind(data.kind);

  let record: AdminMediaUploadRecord;

  if (data.kind === "PREVIEW") {
    const existing = await store.findPreviewForFootage(data.footageId);

    if (existing?.uploadStatus === "READY") {
      throw new PreviewAlreadyReadyError();
    }

    if (existing !== null) {
      if (
        existing.uploadStatus === "INITIATED" &&
        existing.providerUploadId !== null
      ) {
        try {
          await storage.abortMultipartUpload({
            objectKey: existing.objectKey,
            uploadId: existing.providerUploadId,
          });
        } catch {
          // Best-effort abort of the previous unfinished multipart session.
        }
      }

      const multipart = await storage.createMultipartUpload({
        objectKey,
        accessPolicy,
        contentType: data.mimeType,
      });

      record = await store.restartInitiatedUpload({
        id: existing.id,
        label,
        objectKey,
        sizeBytes: BigInt(data.sizeBytes),
        mimeType: data.mimeType,
        providerUploadId: multipart.uploadId,
      });
    } else {
      const multipart = await storage.createMultipartUpload({
        objectKey,
        accessPolicy,
        contentType: data.mimeType,
      });

      record = await store.createInitiatedUpload({
        footageId: data.footageId,
        kind: "PREVIEW",
        label,
        objectKey,
        sizeBytes: BigInt(data.sizeBytes),
        mimeType: data.mimeType,
        providerUploadId: multipart.uploadId,
      });
    }
  } else {
    const multipart = await storage.createMultipartUpload({
      objectKey,
      accessPolicy,
      contentType: data.mimeType,
    });

    record = await store.createInitiatedUpload({
      footageId: data.footageId,
      kind: "ORIGINAL",
      label,
      objectKey,
      sizeBytes: BigInt(data.sizeBytes),
      mimeType: data.mimeType,
      providerUploadId: multipart.uploadId,
    });
  }

  const sizeBytes = Number(record.sizeBytes);

  return {
    uploadId: record.id,
    footageFileId: record.id,
    objectKey: record.objectKey,
    kind: record.kind,
    label: record.label,
    sizeBytes,
    mimeType: record.mimeType,
    partSizeBytes: MULTIPART_PART_SIZE_BYTES,
    partCount: expectedMultipartPartCount(sizeBytes),
    maxUploadBytes: MAX_FOOTAGE_UPLOAD_BYTES,
  };
}

/**
 * Sign one UploadPart request for a persisted Admin upload session.
 * Does not accept arbitrary object keys or provider upload IDs from the client.
 */
export async function signAdminMediaUploadPart({
  input,
  store,
  storage,
}: {
  input: SignAdminMediaUploadPartInput;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<SignAdminMediaUploadPartResult> {
  const parsed = signAdminMediaUploadPartInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminMediaUploadValidationError();
  }

  const record = await requireActiveUpload(store, parsed.data.uploadId);
  const expectedCount = expectedPartsForRecord(record);

  if (parsed.data.partNumber > expectedCount) {
    throw new AdminMediaUploadValidationError(
      "Part number is outside the expected range for this upload.",
    );
  }

  const access = await storage.createUploadPartAccess({
    objectKey: record.objectKey,
    uploadId: record.providerUploadId!,
    partNumber: parsed.data.partNumber,
    accessPolicy: accessPolicyForKind(record.kind),
  });

  return {
    uploadId: record.id,
    partNumber: parsed.data.partNumber,
    access,
  };
}

/**
 * Complete a multipart upload only after provider completion and HeadObject
 * size confirmation. Idempotent when already READY. Recovers when provider
 * completion already succeeded but the prior READY update was lost.
 */
export async function completeAdminMediaUpload({
  input,
  store,
  storage,
}: {
  input: CompleteAdminMediaUploadInput;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<CompleteAdminMediaUploadResult> {
  const parsed = completeAdminMediaUploadInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminMediaUploadValidationError();
  }

  const existing = await store.findById(parsed.data.uploadId);

  if (existing === null) {
    throw new UploadSessionNotFoundError();
  }

  if (existing.uploadStatus === "READY") {
    return {
      footageFileId: existing.id,
      objectKey: existing.objectKey,
      sizeBytes: Number(existing.sizeBytes),
      uploadStatus: "READY",
    };
  }

  if (
    existing.uploadStatus === "ABORTED" ||
    (existing.uploadStatus !== "INITIATED" &&
      existing.uploadStatus !== "FAILED")
  ) {
    throw new UploadSessionNotActiveError();
  }

  const expectedCount = expectedPartsForRecord(existing);
  const parts = normalizeCompletedParts(parsed.data.parts, expectedCount);
  const expectedSize = Number(existing.sizeBytes);

  const confirmReady =
    async (): Promise<CompleteAdminMediaUploadResult | null> => {
      const check = await checkCompletedObjectSize({
        storage,
        objectKey: existing.objectKey,
        expectedSizeBytes: expectedSize,
      });

      if (check.status === "match") {
        return markReadyAfterVerifiedSize({
          store,
          uploadId: existing.id,
          sizeBytes: check.sizeBytes,
        });
      }

      if (check.status === "mismatch") {
        await store.markFailed(existing.id);
        throw new UploadCompletionFailedError();
      }

      return null;
    };

  // Provider may already have assembled the object (lost response / DB write fail).
  const recoveredBeforeComplete = await confirmReady();
  if (recoveredBeforeComplete !== null) {
    return recoveredBeforeComplete;
  }

  if (existing.providerUploadId === null) {
    await store.markFailed(existing.id);
    throw new UploadCompletionFailedError();
  }

  try {
    await storage.completeMultipartUpload({
      objectKey: existing.objectKey,
      uploadId: existing.providerUploadId,
      parts,
    });
  } catch (error) {
    if (
      error instanceof UploadCompletionFailedError ||
      error instanceof AdminMediaUploadValidationError ||
      error instanceof UploadSessionNotActiveError
    ) {
      throw error;
    }

    // Complete may fail with NoSuchUpload after a prior successful Complete.
    const recoveredAfterCompleteError = await confirmReady();
    if (recoveredAfterCompleteError !== null) {
      return recoveredAfterCompleteError;
    }

    // Keep INITIATED/FAILED for retryable part/ETag/provider failures.
    // Mark FAILED only when the multipart session is gone and no object exists.
    if (error instanceof ObjectStorageError && error.category === "not_found") {
      await store.markFailed(existing.id);
    }

    throw new UploadCompletionFailedError();
  }

  const confirmed = await confirmReady();
  if (confirmed !== null) {
    return confirmed;
  }

  await store.markFailed(existing.id);
  throw new UploadCompletionFailedError();
}

/**
 * Abort an unfinished Admin multipart upload. Does not mark READY and does
 * not delete unrelated storage objects.
 */
export async function abortAdminMediaUpload({
  input,
  store,
  storage,
}: {
  input: AbortAdminMediaUploadInput;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<AbortAdminMediaUploadResult> {
  const parsed = abortAdminMediaUploadInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminMediaUploadValidationError();
  }

  const record = await store.findById(parsed.data.uploadId);

  if (record === null) {
    throw new UploadSessionNotFoundError();
  }

  if (record.uploadStatus === "READY") {
    throw new UploadSessionNotActiveError();
  }

  if (record.uploadStatus === "ABORTED") {
    return {
      footageFileId: record.id,
      uploadStatus: "ABORTED",
    };
  }

  if (record.providerUploadId !== null) {
    try {
      await storage.abortMultipartUpload({
        objectKey: record.objectKey,
        uploadId: record.providerUploadId,
      });
    } catch {
      // Persist ABORTED even if the provider abort races with expiry/cleanup.
    }
  }

  const aborted = await store.markAborted(record.id);

  if (aborted === null) {
    const current = await store.findById(record.id);

    if (current?.uploadStatus === "READY") {
      throw new UploadSessionNotActiveError();
    }

    if (current?.uploadStatus === "ABORTED") {
      return {
        footageFileId: current.id,
        uploadStatus: "ABORTED",
      };
    }

    throw new UploadSessionNotActiveError();
  }

  return {
    footageFileId: aborted.id,
    uploadStatus: "ABORTED",
  };
}

export function isUsableFootageFile(
  record: Pick<AdminMediaUploadRecord, "uploadStatus">,
): boolean {
  return record.uploadStatus === "READY";
}
