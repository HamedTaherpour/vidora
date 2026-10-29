import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import {
  adminFootageMutationResponse,
  handleAdminUpdateFootageMetadata,
} from "@/modules/footage/admin/mutations/handle-admin-footage-mutation";
import { createPrismaAdminFootageStore } from "@/modules/footage/admin/mutations/prisma-admin-footage-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Admin update Footage metadata and replace Tag relationships.
 * Does not change publication status.
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: footageId } = await context.params;
  const admin = await resolveCurrentAdmin();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return adminFootageMutationResponse(
      admin.status === "authenticated"
        ? { status: "invalid_input" }
        : { status: "denied" },
    );
  }

  const result = await handleAdminUpdateFootageMetadata({
    admin,
    footageId,
    body,
    store: createPrismaAdminFootageStore(prisma),
  });

  return adminFootageMutationResponse(result);
}
