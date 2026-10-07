import {
  CategoryNotFoundError,
  TagNotFoundError,
} from "@/modules/footage/admin-footage-errors";
import type { CreateDraftFootageInput } from "@/modules/footage/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";

export type CreateDraftFootageParams = {
  input: CreateDraftFootageInput;
  store: AdminFootageStore;
};

/**
 * Create a draft Footage with optional Tags.
 * Always persists DRAFT with `publishedAt` null. Never trusts client publication state.
 */
export async function createDraftFootage({
  input,
  store,
}: CreateDraftFootageParams): Promise<AdminFootageRecord> {
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

  return store.createDraft({
    titleFa: input.titleFa,
    slug: input.slug,
    descriptionFa: input.descriptionFa,
    priceToman: input.priceToman,
    categoryId: input.categoryId,
    tagIds,
  });
}
