import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/resolve-current-admin";
import { createObjectStorage } from "@/modules/media/create-object-storage";
import {
  adminMediaUploadResponse,
  assertAdminMediaUploadOrigin,
  handleAdminAbortMediaUpload,
} from "@/modules/media/handle-admin-media-upload";
import { createPrismaAdminMediaUploadStore } from "@/modules/media/prisma-admin-media-upload-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Abort an unfinished Admin multipart upload.
 */
export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (
    !assertAdminMediaUploadOrigin({
      request,
      appOrigin: process.env.APP_ORIGIN,
      nodeEnv: process.env.NODE_ENV,
    })
  ) {
    return adminMediaUploadResponse({ status: "rejected" });
  }

  const { id } = await context.params;
  const admin = await resolveCurrentAdmin();

  const result = await handleAdminAbortMediaUpload({
    admin,
    uploadId: id,
    store: createPrismaAdminMediaUploadStore(prisma),
    storage: createObjectStorage(),
  });

  return adminMediaUploadResponse(result);
}
