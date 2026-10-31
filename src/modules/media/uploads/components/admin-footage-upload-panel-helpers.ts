/** API statuses returned while initiating, signing, or completing an upload. */
export type UploadApiErrorStatus =
  | "denied"
  | "rejected"
  | "invalid_input"
  | "footage_not_found"
  | "preview_already_ready"
  | "upload_not_found"
  | "upload_not_active"
  | "upload_completion_failed";

/** Normalized failure reasons used to select an upload error message. */
export type UploadFailureReason =
  UploadApiErrorStatus | "invalid_response" | "unknown";

/** Supported upload payload kinds accepted by the admin upload workflow. */
export type UploadKind = "PREVIEW" | "ORIGINAL";

/** Converts an untrusted upload-kind value into a supported upload kind. */
export function parseUploadKind(value: string): UploadKind | null {
  return value === "PREVIEW" || value === "ORIGINAL" ? value : null;
}

/** Error carrying the safe customer-facing message for an upload-panel failure. */
export class UploadPanelError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "UploadPanelError";
    this.userMessage = userMessage;
  }
}

type InitiateUpload = {
  uploadId: string;
  footageFileId: string;
  objectKey: string;
  kind: UploadKind;
  label: string;
  sizeBytes: number;
  mimeType: string;
  partSizeBytes: number;
  partCount: number;
  maxUploadBytes: number;
};

type SignedPart = {
  uploadId: string;
  partNumber: number;
  url: string;
  method: "PUT";
  expiresAt: string;
  objectKey: string;
};

type CompletedUpload = {
  footageFileId: string;
  objectKey: string;
  sizeBytes: number;
  uploadStatus: "READY";
};

/** Structured response returned after validating an upload-initiation payload. */
export type InitiateUploadResponse =
  | {
      status: "ok";
      upload: InitiateUpload;
    }
  | { status: UploadFailureReason };

/** Structured response returned after validating a signed-part payload. */
export type SignPartResponse =
  | {
      status: "ok";
      part: SignedPart;
    }
  | { status: UploadFailureReason };

/** Structured response returned after validating an upload-completion payload. */
export type CompleteUploadResponse =
  | {
      status: "ok";
      completed: CompletedUpload;
    }
  | { status: UploadFailureReason };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isUploadApiErrorStatus(value: unknown): value is UploadApiErrorStatus {
  return (
    value === "denied" ||
    value === "rejected" ||
    value === "invalid_input" ||
    value === "footage_not_found" ||
    value === "preview_already_ready" ||
    value === "upload_not_found" ||
    value === "upload_not_active" ||
    value === "upload_completion_failed"
  );
}

function responseStatus(value: unknown): UploadFailureReason | "ok" {
  if (!isRecord(value) || typeof value.status !== "string") {
    return "invalid_response";
  }

  if (value.status === "ok") {
    return "ok";
  }

  return isUploadApiErrorStatus(value.status)
    ? value.status
    : "invalid_response";
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}

function isInitiateUpload(value: unknown): value is InitiateUpload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.uploadId) &&
    isNonEmptyString(value.footageFileId) &&
    isNonEmptyString(value.objectKey) &&
    (value.kind === "PREVIEW" || value.kind === "ORIGINAL") &&
    isNonEmptyString(value.label) &&
    isPositiveInteger(value.sizeBytes) &&
    isNonEmptyString(value.mimeType) &&
    isPositiveInteger(value.partSizeBytes) &&
    isPositiveInteger(value.partCount) &&
    isPositiveInteger(value.maxUploadBytes)
  );
}

function isSignedPart(value: unknown): value is SignedPart {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.uploadId) &&
    isPositiveInteger(value.partNumber) &&
    isHttpUrl(value.url) &&
    value.method === "PUT" &&
    isNonEmptyString(value.expiresAt) &&
    isNonEmptyString(value.objectKey)
  );
}

function isCompletedUpload(value: unknown): value is CompletedUpload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.footageFileId) &&
    isNonEmptyString(value.objectKey) &&
    isPositiveInteger(value.sizeBytes) &&
    value.uploadStatus === "READY"
  );
}

/** Validates an unknown response at the upload-initiation boundary. */
export function parseInitiateUploadResponse(
  value: unknown,
): InitiateUploadResponse {
  const status = responseStatus(value);

  if (status !== "ok") {
    return { status };
  }

  if (!isRecord(value) || !isInitiateUpload(value.upload)) {
    return { status: "invalid_response" };
  }

  return { status, upload: value.upload };
}

/** Validates an unknown response at the multipart-part signing boundary. */
export function parseSignPartResponse(value: unknown): SignPartResponse {
  const status = responseStatus(value);

  if (status !== "ok") {
    return { status };
  }

  if (!isRecord(value) || !isSignedPart(value.part)) {
    return { status: "invalid_response" };
  }

  return { status, part: value.part };
}

/** Validates an unknown response at the upload-completion boundary. */
export function parseCompleteUploadResponse(
  value: unknown,
): CompleteUploadResponse {
  const status = responseStatus(value);

  if (status !== "ok") {
    return { status };
  }

  if (!isRecord(value) || !isCompletedUpload(value.completed)) {
    return { status: "invalid_response" };
  }

  return { status, completed: value.completed };
}

/** Maps a normalized upload failure and phase to a customer-facing message. */
export function uploadFailureMessage(
  reason: UploadFailureReason,
  phase: "initiate" | "sign" | "complete" | "upload",
): string {
  switch (reason) {
    case "denied":
      return "دسترسی برای آپلود مجاز نیست.";
    case "rejected":
      return "درخواست آپلود رد شد. صفحه را تازه‌سازی کنید و دوباره تلاش کنید.";
    case "invalid_input":
      return "اطلاعات آپلود معتبر نیست.";
    case "footage_not_found":
      return "فوتیج پیدا نشد.";
    case "preview_already_ready":
      return "پیش‌نمایش این فوتیج قبلاً آماده شده است.";
    case "upload_not_found":
      return "نشست آپلود پیدا نشد. دوباره تلاش کنید.";
    case "upload_not_active":
      return "نشست آپلود دیگر فعال نیست. دوباره تلاش کنید.";
    case "upload_completion_failed":
      return "تکمیل آپلود انجام نشد. دوباره تلاش کنید.";
    case "invalid_response":
      return "پاسخ نامعتبر از سرور دریافت شد. دوباره تلاش کنید.";
    case "unknown":
      return "آپلود متوقف شد. دوباره تلاش کنید.";
    default:
      break;
  }

  switch (phase) {
    case "initiate":
      return "شروع آپلود انجام نشد. دوباره تلاش کنید.";
    case "sign":
      return "دسترسی آپلود بخش فایل دریافت نشد. دوباره تلاش کنید.";
    case "complete":
      return "تکمیل آپلود انجام نشد. دوباره تلاش کنید.";
    case "upload":
      return "آپلود متوقف شد. دوباره تلاش کنید.";
  }
}
