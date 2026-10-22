export type FootagePublicationStatus = "DRAFT" | "PUBLISHED";

export type AdminFootageRecord = {
  id: string;
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  status: FootagePublicationStatus;
  categoryId: string;
  tagIds: string[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDraftFootagePersistence = {
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  categoryId: string;
  tagIds: readonly string[];
};

export type UpdateFootageMetadataPersistence = {
  footageId: string;
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  categoryId: string;
  tagIds: readonly string[];
};

export type PublishFootagePersistence = {
  footageId: string;
  publishedAt: Date;
};

/**
 * Persistence boundary for Admin Footage mutations.
 * Implementations must keep Footage metadata and Tag relationships atomic
 * where both change together. Unique slug and FK constraints remain authoritative.
 */
export type AdminFootageStore = {
  categoryExists: (categoryId: string) => Promise<boolean>;
  hasReadyPreview: (footageId: string) => Promise<boolean>;
  findExistingTagIds: (tagIds: readonly string[]) => Promise<string[]>;
  createDraft: (
    data: CreateDraftFootagePersistence,
  ) => Promise<AdminFootageRecord>;
  findById: (footageId: string) => Promise<AdminFootageRecord | null>;
  updateMetadata: (
    data: UpdateFootageMetadataPersistence,
  ) => Promise<AdminFootageRecord>;
  setPublished: (
    data: PublishFootagePersistence,
  ) => Promise<AdminFootageRecord>;
  setDraft: (footageId: string) => Promise<AdminFootageRecord>;
};
