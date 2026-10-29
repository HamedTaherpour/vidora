import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
  type AdminAuthorizationContext,
  type RequiredAdmin,
} from "@/modules/auth/authorization/authorization";
import {
  allowedBrowserAuthOrigins,
  isAllowedBrowserAuthOrigin,
} from "@/modules/auth/browser/browser-auth-origin";
import {
  abortAdminMediaUpload,
  completeAdminMediaUpload,
  initiateAdminMediaUpload,
  signAdminMediaUploadPart,
} from "@/modules/media/uploads/admin-media-upload";
import {
  AdminMediaUploadValidationError,
  FootageNotFoundForUploadError,
  PreviewAlreadyReadyError,
  UploadCompletionFailedError,
  UploadSessionNotActiveError,
  UploadSessionNotFoundError,
} from "@/modules/media/uploads/admin-media-upload-errors";
import {
  completeAdminMediaUploadInputSchema,
  initiateAdminMediaUploadInputSchema,
  signAdminMediaUploadPartInputSchema,
} from "@/modules/media/uploads/admin-media-upload-input";
import type { AdminMediaUploadStore } from "@/modules/media/uploads/admin-media-upload-store";
import type { ObjectStorage } from "@/modules/media/storage/object-storage";

export type AdminMediaUploadPublicResult =
  | {
      status: "ok";
      upload: {
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
    }
  | {
      status: "ok";
      part: {
        uploadId: string;
        partNumber: number;
        url: string;
        method: "PUT";
        expiresAt: string;
        objectKey: string;
      };
    }
  | {
      status: "ok";
      completed: {
        footageFileId: string;
        objectKey: string;
        sizeBytes: number;
        uploadStatus: "READY";
      };
    }
  | {
      status: "ok";
      aborted: {
        footageFileId: string;
        uploadStatus: "ABORTED";
      };
    }
  | { status: "denied" }
  | { status: "rejected" }
  | { status: "invalid_input" }
  | { status: "footage_not_found" }
  | { status: "preview_already_ready" }
  | { status: "upload_not_found" }
  | { status: "upload_not_active" }
  | { status: "upload_completion_failed" };

type AssertAdminMediaUploadOriginParams = {
  request: Request;
  appOrigin: string | undefined;
  nodeEnv: string | undefined;
};

type HandleAdminInitiateMediaUploadParams = {
  admin: AdminAuthorizationContext;
  body: unknown;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
};

type HandleAdminSignMediaUploadPartParams = {
  admin: AdminAuthorizationContext;
  uploadId: string;
  body: unknown;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
};

type HandleAdminCompleteMediaUploadParams =
  HandleAdminSignMediaUploadPartParams;

type HandleAdminAbortMediaUploadParams = Omit<
  HandleAdminSignMediaUploadPartParams,
  "body"
>;

function requireAdminOrDenied(
  admin: AdminAuthorizationContext,
): RequiredAdmin | null {
  try {
    return requireAuthenticatedAdmin(admin);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return null;
    }

    throw error;
  }
}

function mapApplicationError(error: unknown): AdminMediaUploadPublicResult {
  if (error instanceof AdminMediaUploadValidationError) {
    return { status: "invalid_input" };
  }

  if (error instanceof FootageNotFoundForUploadError) {
    return { status: "footage_not_found" };
  }

  if (error instanceof PreviewAlreadyReadyError) {
    return { status: "preview_already_ready" };
  }

  if (error instanceof UploadSessionNotFoundError) {
    return { status: "upload_not_found" };
  }

  if (error instanceof UploadSessionNotActiveError) {
    return { status: "upload_not_active" };
  }

  if (error instanceof UploadCompletionFailedError) {
    return { status: "upload_completion_failed" };
  }

  throw error;
}

export function adminMediaUploadResponse(
  result: AdminMediaUploadPublicResult,
): Response {
  const status =
    result.status === "ok"
      ? 200
      : result.status === "denied" || result.status === "rejected"
        ? 403
        : result.status === "footage_not_found" ||
            result.status === "upload_not_found"
          ? 404
          : result.status === "preview_already_ready" ||
              result.status === "upload_not_active"
            ? 409
            : 400;

  return Response.json(result, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Cookie-authenticated Admin media upload mutations use the same Origin
 * allowlist as OTP verification. SameSite=Lax alone is not sufficient.
 */
export function assertAdminMediaUploadOrigin({
  request,
  appOrigin,
  nodeEnv,
}: AssertAdminMediaUploadOriginParams): boolean {
  return isAllowedBrowserAuthOrigin({
    originHeader: request.headers.get("origin"),
    allowedOrigins: allowedBrowserAuthOrigins(appOrigin, nodeEnv),
  });
}

function rejectBrowserObjectKey(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    Object.prototype.hasOwnProperty.call(body, "objectKey")
  );
}

export async function handleAdminInitiateMediaUpload({
  admin,
  body,
  store,
  storage,
}: HandleAdminInitiateMediaUploadParams): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (rejectBrowserObjectKey(body)) {
    return { status: "invalid_input" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  const parsed = initiateAdminMediaUploadInputSchema.safeParse(body);

  if (!parsed.success) {
    return { status: "invalid_input" };
  }

  try {
    const upload = await initiateAdminMediaUpload({
      input: parsed.data,
      store,
      storage,
    });

    return { status: "ok", upload };
  } catch (error) {
    return mapApplicationError(error);
  }
}

export async function handleAdminSignMediaUploadPart({
  admin,
  uploadId,
  body,
  store,
  storage,
}: HandleAdminSignMediaUploadPartParams): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "objectKey") ||
    Object.prototype.hasOwnProperty.call(body, "providerUploadId") ||
    Object.prototype.hasOwnProperty.call(body, "uploadId")
  ) {
    return { status: "invalid_input" };
  }

  const parsed = signAdminMediaUploadPartInputSchema.safeParse({
    uploadId,
    partNumber: "partNumber" in body ? body.partNumber : undefined,
  });

  if (!parsed.success) {
    return { status: "invalid_input" };
  }

  try {
    const signed = await signAdminMediaUploadPart({
      input: parsed.data,
      store,
      storage,
    });

    return {
      status: "ok",
      part: {
        uploadId: signed.uploadId,
        partNumber: signed.partNumber,
        url: signed.access.url,
        method: "PUT",
        expiresAt: signed.access.expiresAt.toISOString(),
        objectKey: signed.access.objectKey,
      },
    };
  } catch (error) {
    return mapApplicationError(error);
  }
}

export async function handleAdminCompleteMediaUpload({
  admin,
  uploadId,
  body,
  store,
  storage,
}: HandleAdminCompleteMediaUploadParams): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  const parsed = completeAdminMediaUploadInputSchema.safeParse({
    uploadId,
    parts: "parts" in body ? body.parts : undefined,
  });

  if (!parsed.success) {
    return { status: "invalid_input" };
  }

  try {
    const completed = await completeAdminMediaUpload({
      input: parsed.data,
      store,
      storage,
    });

    return { status: "ok", completed };
  } catch (error) {
    return mapApplicationError(error);
  }
}

export async function handleAdminAbortMediaUpload({
  admin,
  uploadId,
  store,
  storage,
}: HandleAdminAbortMediaUploadParams): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  try {
    const aborted = await abortAdminMediaUpload({
      input: { uploadId },
      store,
      storage,
    });

    return { status: "ok", aborted };
  } catch (error) {
    return mapApplicationError(error);
  }
}
