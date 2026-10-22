import {
  CategoryNotFoundError,
  FootageNotFoundError,
  FootageNotReadyToPublishError,
  FootagePreviewNotReadyError,
} from "@/modules/footage/admin-footage-errors";
import {
  FOOTAGE_SLUG_MAX_LENGTH,
  FOOTAGE_TITLE_FA_MAX_LENGTH,
} from "@/modules/footage/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";

export type PublishFootageParams = {
  footageId: string;
  store: AdminFootageStore;
  now?: Date;
};

function isReadyToPublish(footage: AdminFootageRecord): boolean {
  const titleFa = footage.titleFa.trim();
  const slug = footage.slug.trim();
  const descriptionFa = footage.descriptionFa.trim();

  if (titleFa.length === 0 || titleFa.length > FOOTAGE_TITLE_FA_MAX_LENGTH) {
    return false;
  }

  if (slug.length === 0 || slug.length > FOOTAGE_SLUG_MAX_LENGTH) {
    return false;
  }

  if (descriptionFa.length === 0) {
    return false;
  }

  if (
    !Number.isInteger(footage.priceToman) ||
    footage.priceToman < 0 ||
    !Number.isSafeInteger(footage.priceToman)
  ) {
    return false;
  }

  return true;
}

/**
 * Publish a Footage that already satisfies the currently available catalog
 * invariants. Tags are optional. Media is not required in CAT-03.
 *
 * Idempotent when already PUBLISHED with a non-null `publishedAt`:
 * returns the existing row and does not reset `publishedAt`.
 */
export async function publishFootage({
  footageId,
  store,
  now = new Date(),
}: PublishFootageParams): Promise<AdminFootageRecord> {
  const footage = await store.findById(footageId);

  if (!footage) {
    throw new FootageNotFoundError();
  }

  if (footage.status === "PUBLISHED" && footage.publishedAt !== null) {
    return footage;
  }

  if (!isReadyToPublish(footage)) {
    throw new FootageNotReadyToPublishError();
  }

  if (!(await store.hasReadyPreview(footageId))) {
    throw new FootagePreviewNotReadyError();
  }

  if (!(await store.categoryExists(footage.categoryId))) {
    throw new CategoryNotFoundError();
  }

  return store.setPublished({
    footageId,
    publishedAt: now,
  });
}
