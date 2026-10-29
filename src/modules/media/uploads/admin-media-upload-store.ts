export type FootageFileUploadStatus =
  "INITIATED" | "READY" | "FAILED" | "ABORTED";

export type FootageFileKind = "PREVIEW" | "ORIGINAL";

export type AdminMediaUploadRecord = {
  id: string;
  footageId: string;
  kind: FootageFileKind;
  label: string;
  objectKey: string;
  sizeBytes: bigint;
  mimeType: string;
  uploadStatus: FootageFileUploadStatus;
  providerUploadId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInitiatedUploadPersistence = {
  footageId: string;
  kind: FootageFileKind;
  label: string;
  objectKey: string;
  sizeBytes: bigint;
  mimeType: string;
  providerUploadId: string;
};

export type RestartInitiatedUploadPersistence = {
  id: string;
  label: string;
  objectKey: string;
  sizeBytes: bigint;
  mimeType: string;
  providerUploadId: string;
};

export type MarkReadyParams = {
  id: string;
  sizeBytes: bigint;
};

/**
 * Persistence boundary for Admin direct-upload lifecycle.
 * Keeps Prisma out of application orchestration tests via fakes.
 */
export type AdminMediaUploadStore = {
  footageExists(footageId: string): Promise<boolean>;
  findPreviewForFootage(
    footageId: string,
  ): Promise<AdminMediaUploadRecord | null>;
  findById(id: string): Promise<AdminMediaUploadRecord | null>;
  createInitiatedUpload(
    data: CreateInitiatedUploadPersistence,
  ): Promise<AdminMediaUploadRecord>;
  restartInitiatedUpload(
    data: RestartInitiatedUploadPersistence,
  ): Promise<AdminMediaUploadRecord>;
  /**
   * Conditionally set READY only from INITIATED or FAILED.
   * Returns null when the row is already READY/ABORTED or missing so callers
   * can resolve races without overwriting an abort.
   */
  markReady(params: MarkReadyParams): Promise<AdminMediaUploadRecord | null>;
  markFailed(id: string): Promise<AdminMediaUploadRecord>;
  /**
   * Conditionally set ABORTED only when the row is not already READY.
   * Returns null when the row is READY or missing.
   */
  markAborted(id: string): Promise<AdminMediaUploadRecord | null>;
};
