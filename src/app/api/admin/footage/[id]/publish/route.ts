import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import {
  adminFootageMutationResponse,
  handleAdminPublishFootage,
} from "@/modules/footage/admin/mutations/handle-admin-footage-mutation";
import { createPrismaAdminFootageStore } from "@/modules/footage/admin/mutations/prisma-admin-footage-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Admin publish Footage.
 * Sets status PUBLISHED and publishedAt when not already published.
 * Repeated publish keeps the existing publishedAt.
 */
export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: footageId } = await context.params;
  const admin = await resolveCurrentAdmin();
  const result = await handleAdminPublishFootage({
    admin,
    footageId,
    store: createPrismaAdminFootageStore(prisma),
  });

  return adminFootageMutationResponse(result);
}
