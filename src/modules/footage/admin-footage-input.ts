import { z } from "zod";

/** Matches `Footage.titleFa` `varchar(200)`. */
export const FOOTAGE_TITLE_FA_MAX_LENGTH = 200;

/** Matches `Footage.slug` `varchar(120)`. */
export const FOOTAGE_SLUG_MAX_LENGTH = 120;

/**
 * Editable Admin Footage metadata for create and update.
 * Does not accept publication state. Create always starts as DRAFT.
 * `tagIds` is the complete desired Tag set; duplicates are removed.
 */
export const adminFootageMetadataSchema = z.object({
  titleFa: z.string().trim().min(1).max(FOOTAGE_TITLE_FA_MAX_LENGTH),
  slug: z.string().trim().min(1).max(FOOTAGE_SLUG_MAX_LENGTH),
  descriptionFa: z.string().trim().min(1),
  priceToman: z.number().int().nonnegative(),
  categoryId: z.uuid(),
  tagIds: z
    .array(z.uuid())
    .default([])
    .transform((tagIds) => [...new Set(tagIds)]),
});

export const createDraftFootageInputSchema = adminFootageMetadataSchema;

export const updateFootageMetadataInputSchema = adminFootageMetadataSchema;

export const footageIdSchema = z.uuid();

export type AdminFootageMetadataInput = z.infer<
  typeof adminFootageMetadataSchema
>;

export type CreateDraftFootageInput = AdminFootageMetadataInput;

export type UpdateFootageMetadataFields = AdminFootageMetadataInput;
