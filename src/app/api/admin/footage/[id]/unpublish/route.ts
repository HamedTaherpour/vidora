import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/resolve-current-admin";
import {
  adminFootageMutationResponse,
  handleAdminUnpublishFootage,
} from "@/modules/footage/handle-admin-footage-mutation";
import { createPrismaAdminFootageStore } from "@/modules/footage/prisma-admin-footage-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Admin unpublish Footage.
 * Sets status DRAFT and publishedAt null. Idempotent for already-draft rows.
 */
export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: footageId } = await context.params;
  const admin = await resolveCurrentAdmin();
  const result = await handleAdminUnpublishFootage({
    admin,
    footageId,
    store: createPrismaAdminFootageStore(prisma),
  });

  return adminFootageMutationResponse(result);
}
