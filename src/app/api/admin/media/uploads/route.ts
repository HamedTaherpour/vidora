import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import {
  adminMediaUploadResponse,
  assertAdminMediaUploadOrigin,
  handleAdminInitiateMediaUpload,
} from "@/modules/media/uploads/handle-admin-media-upload";
import { createObjectStorage } from "@/modules/media/storage/create-object-storage";
import { createPrismaAdminMediaUploadStore } from "@/modules/media/uploads/prisma-admin-media-upload-store";

export const dynamic = "force-dynamic";

/**
 * Admin multipart upload initiation.
 * Large file bytes never enter this process.
 */
export async function POST(request: Request): Promise<Response> {
  if (
    !assertAdminMediaUploadOrigin({
      request,
      appOrigin: process.env.APP_ORIGIN,
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    return adminMediaUploadResponse({ status: "rejected" });
  }

  const admin = await resolveCurrentAdmin();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return adminMediaUploadResponse(
      admin.status === "authenticated"
        ? { status: "invalid_input" }
        : { status: "denied" },
    );
  }

  const result = await handleAdminInitiateMediaUpload({
    admin,
    body,
    store: createPrismaAdminMediaUploadStore(prisma),
    storage: createObjectStorage(),
  });

  return adminMediaUploadResponse(result);
}
