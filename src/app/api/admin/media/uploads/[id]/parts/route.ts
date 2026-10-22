import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/resolve-current-admin";
import { createObjectStorage } from "@/modules/media/create-object-storage";
import {
  adminMediaUploadResponse,
  assertAdminMediaUploadOrigin,
  handleAdminSignMediaUploadPart,
} from "@/modules/media/handle-admin-media-upload";
import { createPrismaAdminMediaUploadStore } from "@/modules/media/prisma-admin-media-upload-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Sign one UploadPart URL for a persisted Admin upload session.
 * The browser PUTs the part bytes directly to object storage.
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

  const result = await handleAdminSignMediaUploadPart({
    admin,
    uploadId: id,
    body,
    store: createPrismaAdminMediaUploadStore(prisma),
    storage: createObjectStorage(),
  });

  return adminMediaUploadResponse(result);
}
