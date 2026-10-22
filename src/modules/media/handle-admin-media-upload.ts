import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
  type RequiredAdmin,
} from "@/modules/auth/authorization";
import {
  allowedBrowserAuthOrigins,
  isAllowedBrowserAuthOrigin,
} from "@/modules/auth/browser-auth-origin";
import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import {
  abortAdminMediaUpload,
  completeAdminMediaUpload,
  initiateAdminMediaUpload,
  signAdminMediaUploadPart,
} from "@/modules/media/admin-media-upload";
import {
  AdminMediaUploadValidationError,
  FootageNotFoundForUploadError,
  PreviewAlreadyReadyError,
  UploadCompletionFailedError,
  UploadSessionNotActiveError,
  UploadSessionNotFoundError,
} from "@/modules/media/admin-media-upload-errors";
import type { AdminMediaUploadStore } from "@/modules/media/admin-media-upload-store";
import type { ObjectStorage } from "@/modules/media/object-storage";

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

function requireAdminOrDenied(admin: ResolvedAdmin): RequiredAdmin | null {
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
}: {
  request: Request;
  appOrigin: string | undefined;
  nodeEnv: string | undefined;
}): boolean {
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
}: {
  admin: ResolvedAdmin;
  body: unknown;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (rejectBrowserObjectKey(body)) {
    return { status: "invalid_input" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  try {
    const upload = await initiateAdminMediaUpload({
      input: body as never,
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
}: {
  admin: ResolvedAdmin;
  uploadId: string;
  body: unknown;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  const payload = body as Record<string, unknown>;

  if (
    Object.prototype.hasOwnProperty.call(payload, "objectKey") ||
    Object.prototype.hasOwnProperty.call(payload, "providerUploadId") ||
    Object.prototype.hasOwnProperty.call(payload, "uploadId")
  ) {
    return { status: "invalid_input" };
  }

  try {
    const signed = await signAdminMediaUploadPart({
      input: {
        uploadId,
        partNumber: payload.partNumber as never,
      },
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
}: {
  admin: ResolvedAdmin;
  uploadId: string;
  body: unknown;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<AdminMediaUploadPublicResult> {
  if (requireAdminOrDenied(admin) === null) {
    return { status: "denied" };
  }

  if (typeof body !== "object" || body === null) {
    return { status: "invalid_input" };
  }

  const payload = body as Record<string, unknown>;

  try {
    const completed = await completeAdminMediaUpload({
      input: {
        uploadId,
        parts: payload.parts as never,
      },
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
}: {
  admin: ResolvedAdmin;
  uploadId: string;
  store: AdminMediaUploadStore;
  storage: ObjectStorage;
}): Promise<AdminMediaUploadPublicResult> {
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
