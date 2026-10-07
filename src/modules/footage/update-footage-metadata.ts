import {
  CategoryNotFoundError,
  FootageNotFoundError,
  TagNotFoundError,
} from "@/modules/footage/admin-footage-errors";
import type { UpdateFootageMetadataFields } from "@/modules/footage/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";

export type UpdateFootageMetadataParams = {
  footageId: string;
  input: UpdateFootageMetadataFields;
  store: AdminFootageStore;
};

/**
 * Replace Footage metadata and the complete Tag set.
 * Does not change publication status. Published Footage may be edited in place.
 */
export async function updateFootageMetadata({
  footageId,
  input,
  store,
}: UpdateFootageMetadataParams): Promise<AdminFootageRecord> {
  const existing = await store.findById(footageId);

  if (!existing) {
    throw new FootageNotFoundError();
  }

  const tagIds = input.tagIds;

  if (!(await store.categoryExists(input.categoryId))) {
    throw new CategoryNotFoundError();
  }

  if (tagIds.length > 0) {
    const existingTagIds = await store.findExistingTagIds(tagIds);

    if (existingTagIds.length !== tagIds.length) {
      throw new TagNotFoundError();
    }
  }

  return store.updateMetadata({
    footageId,
    titleFa: input.titleFa,
    slug: input.slug,
    descriptionFa: input.descriptionFa,
    priceToman: input.priceToman,
    categoryId: input.categoryId,
    tagIds,
  });
}
