import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import {
  adminFootageMutationResponse,
  handleAdminCreateDraftFootage,
} from "@/modules/footage/admin/mutations/handle-admin-footage-mutation";
import { createPrismaAdminFootageStore } from "@/modules/footage/admin/mutations/prisma-admin-footage-store";

export const dynamic = "force-dynamic";

/**
 * Admin create-draft Footage.
 * Always creates DRAFT with `publishedAt` null.
 */
export async function POST(request: Request): Promise<Response> {
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

  const result = await handleAdminCreateDraftFootage({
    admin,
    body,
    store: createPrismaAdminFootageStore(prisma),
  });

  return adminFootageMutationResponse(result);
}
