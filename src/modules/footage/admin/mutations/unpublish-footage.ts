import { FootageNotFoundError } from "@/modules/footage/admin/mutations/admin-footage-errors";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin/mutations/admin-footage-store";

export type UnpublishFootageParams = {
  footageId: string;
  store: AdminFootageStore;
};

/**
 * Return Footage to DRAFT with `publishedAt` null.
 * Does not delete Footage, Category relations, or Tags.
 *
 * Idempotent when already DRAFT with null `publishedAt`.
 */
export async function unpublishFootage({
  footageId,
  store,
}: UnpublishFootageParams): Promise<AdminFootageRecord> {
  const footage = await store.findById(footageId);

  if (!footage) {
    throw new FootageNotFoundError();
  }

  if (footage.status === "DRAFT" && footage.publishedAt === null) {
    return footage;
  }

  return store.setDraft(footageId);
}
