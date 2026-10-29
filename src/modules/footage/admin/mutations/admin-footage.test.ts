import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  CategoryNotFoundError,
  FootageNotFoundError,
  FootageCoverNotReadyError,
  FootagePreviewNotReadyError,
  FootageSlugConflictError,
  TagNotFoundError,
} from "@/modules/footage/admin/mutations/admin-footage-errors";
import {
  createDraftFootageInputSchema,
  FOOTAGE_SLUG_MAX_LENGTH,
  FOOTAGE_TITLE_FA_MAX_LENGTH,
  updateFootageMetadataInputSchema,
} from "@/modules/footage/admin/mutations/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin/mutations/admin-footage-store";
import { createDraftFootage } from "@/modules/footage/admin/mutations/create-draft-footage";
import {
  adminFootageMutationResponse,
  handleAdminCreateDraftFootage,
  handleAdminPublishFootage,
  handleAdminUnpublishFootage,
  handleAdminUpdateFootageMetadata,
} from "@/modules/footage/admin/mutations/handle-admin-footage-mutation";
import { publishFootage } from "@/modules/footage/admin/mutations/publish-footage";
import { unpublishFootage } from "@/modules/footage/admin/mutations/unpublish-footage";
import { updateFootageMetadata } from "@/modules/footage/admin/mutations/update-footage-metadata";

const NOW = new Date("2026-10-05T12:00:00.000Z");
const ADMIN = {
  status: "authenticated" as const,
  adminId: "admin-1",
  phone: "+989121234567",
  expiresAt: NOW,
};
const ANONYMOUS = { status: "anonymous" as const };

const CATEGORY_A = "11111111-1111-4111-8111-111111111111";
const CATEGORY_B = "22222222-2222-4222-8222-222222222222";
const TAG_A = "33333333-3333-4333-8333-333333333333";
const TAG_B = "44444444-4444-4444-8444-444444444444";
const TAG_C = "55555555-5555-4555-8555-555555555555";
const UNKNOWN_CATEGORY = "66666666-6666-4666-8666-666666666666";
const UNKNOWN_TAG = "77777777-7777-4777-8777-777777777777";

function validCreateBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    titleFa: "فووتیج آزمایشی",
    slug: "test-footage",
    descriptionFa: "توضیح آزمایشی",
    priceToman: 120_000,
    categoryId: CATEGORY_A,
    tagIds: [],
    ...overrides,
  };
}

function createMemoryStore(): AdminFootageStore & {
  footageById: Map<string, AdminFootageRecord>;
  categories: Set<string>;
  tags: Set<string>;
  previewStatusByFootage: Map<
    string,
    "INITIATED" | "READY" | "FAILED" | "ABORTED"
  >;
  coverByFootage: Set<string>;
} {
  const footageById = new Map<string, AdminFootageRecord>();
  const categories = new Set<string>([CATEGORY_A, CATEGORY_B]);
  const tags = new Set<string>([TAG_A, TAG_B, TAG_C]);
  const previewStatusByFootage = new Map<
    string,
    "INITIATED" | "READY" | "FAILED" | "ABORTED"
  >();
  const coverByFootage = new Set<string>();
  let clock = NOW.getTime();

  function nextTimestamp(): Date {
    clock += 1000;
    return new Date(clock);
  }

  const store: AdminFootageStore & {
    footageById: Map<string, AdminFootageRecord>;
    categories: Set<string>;
    tags: Set<string>;
    previewStatusByFootage: Map<
      string,
      "INITIATED" | "READY" | "FAILED" | "ABORTED"
    >;
    coverByFootage: Set<string>;
  } = {
    footageById,
    categories,
    tags,
    previewStatusByFootage,
    coverByFootage,

    async categoryExists(categoryId) {
      return categories.has(categoryId);
    },

    async hasReadyPreview(footageId) {
      return previewStatusByFootage.get(footageId) === "READY";
    },

    async hasReadyCover(footageId) {
      return coverByFootage.has(footageId);
    },

    async findExistingTagIds(tagIds) {
      return tagIds.filter((tagId) => tags.has(tagId));
    },

    async createDraft(data) {
      for (const row of footageById.values()) {
        if (row.slug === data.slug) {
          throw new FootageSlugConflictError();
        }
      }

      if (!categories.has(data.categoryId)) {
        throw new CategoryNotFoundError();
      }

      for (const tagId of data.tagIds) {
        if (!tags.has(tagId)) {
          throw new TagNotFoundError();
        }
      }

      const createdAt = nextTimestamp();
      const record: AdminFootageRecord = {
        id: randomUUID(),
        titleFa: data.titleFa,
        slug: data.slug,
        descriptionFa: data.descriptionFa,
        priceToman: data.priceToman,
        status: "DRAFT",
        categoryId: data.categoryId,
        tagIds: [...data.tagIds],
        publishedAt: null,
        createdAt,
        updatedAt: createdAt,
      };

      footageById.set(record.id, record);
      return { ...record, tagIds: [...record.tagIds] };
    },

    async findById(footageId) {
      const row = footageById.get(footageId);
      return row ? { ...row, tagIds: [...row.tagIds] } : null;
    },

    async updateMetadata(data) {
      const existing = footageById.get(data.footageId);

      if (!existing) {
        throw new FootageNotFoundError();
      }

      for (const row of footageById.values()) {
        if (row.id !== data.footageId && row.slug === data.slug) {
          throw new FootageSlugConflictError();
        }
      }

      if (!categories.has(data.categoryId)) {
        throw new CategoryNotFoundError();
      }

      for (const tagId of data.tagIds) {
        if (!tags.has(tagId)) {
          throw new TagNotFoundError();
        }
      }

      const updated: AdminFootageRecord = {
        ...existing,
        titleFa: data.titleFa,
        slug: data.slug,
        descriptionFa: data.descriptionFa,
        priceToman: data.priceToman,
        categoryId: data.categoryId,
        tagIds: [...data.tagIds],
        updatedAt: nextTimestamp(),
      };

      footageById.set(data.footageId, updated);
      return { ...updated, tagIds: [...updated.tagIds] };
    },

    async setPublished(data) {
      const existing = footageById.get(data.footageId);

      if (!existing) {
        throw new FootageNotFoundError();
      }

      const updated: AdminFootageRecord = {
        ...existing,
        status: "PUBLISHED",
        publishedAt: data.publishedAt,
        updatedAt: nextTimestamp(),
      };

      footageById.set(data.footageId, updated);
      return { ...updated, tagIds: [...updated.tagIds] };
    },

    async setDraft(footageId) {
      const existing = footageById.get(footageId);

      if (!existing) {
        throw new FootageNotFoundError();
      }

      const updated: AdminFootageRecord = {
        ...existing,
        status: "DRAFT",
        publishedAt: null,
        updatedAt: nextTimestamp(),
      };

      footageById.set(footageId, updated);
      return { ...updated, tagIds: [...updated.tagIds] };
    },
  };

  return store;
}

function markPreviewReady(
  store: ReturnType<typeof createMemoryStore>,
  footageId: string,
): void {
  store.previewStatusByFootage.set(footageId, "READY");
  store.coverByFootage.add(footageId);
}

function setPreviewStatus(
  store: ReturnType<typeof createMemoryStore>,
  footageId: string,
  status: "INITIATED" | "READY" | "FAILED" | "ABORTED",
): void {
  store.previewStatusByFootage.set(footageId, status);
}

describe("Admin Footage input validation", () => {
  it("accepts valid metadata and defaults tagIds to an empty set", () => {
    const parsed = createDraftFootageInputSchema.parse({
      titleFa: "  عنوان  ",
      slug: "  my-slug  ",
      descriptionFa: "  توضیح  ",
      priceToman: 0,
      categoryId: CATEGORY_A,
    });

    expect(parsed).toEqual({
      titleFa: "عنوان",
      slug: "my-slug",
      descriptionFa: "توضیح",
      priceToman: 0,
      categoryId: CATEGORY_A,
      tagIds: [],
    });
  });

  it("deduplicates tagIds", () => {
    const parsed = createDraftFootageInputSchema.parse(
      validCreateBody({ tagIds: [TAG_A, TAG_A, TAG_B] }),
    );

    expect(parsed.tagIds).toEqual([TAG_A, TAG_B]);
  });

  it("rejects empty title, float price, and oversized slug", () => {
    expect(
      createDraftFootageInputSchema.safeParse(
        validCreateBody({ titleFa: "   " }),
      ).success,
    ).toBe(false);

    expect(
      createDraftFootageInputSchema.safeParse(
        validCreateBody({ priceToman: 12.5 }),
      ).success,
    ).toBe(false);

    expect(
      createDraftFootageInputSchema.safeParse(
        validCreateBody({ slug: "s".repeat(FOOTAGE_SLUG_MAX_LENGTH + 1) }),
      ).success,
    ).toBe(false);

    expect(
      updateFootageMetadataInputSchema.safeParse(
        validCreateBody({
          titleFa: "t".repeat(FOOTAGE_TITLE_FA_MAX_LENGTH + 1),
        }),
      ).success,
    ).toBe(false);
  });
});

describe("createDraftFootage", () => {
  it("creates a DRAFT with publishedAt null", async () => {
    const store = createMemoryStore();
    const footage = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });

    expect(footage.status).toBe("DRAFT");
    expect(footage.publishedAt).toBeNull();
    expect(footage.priceToman).toBe(120_000);
    expect(footage.tagIds).toEqual([]);
  });

  it("persists multiple tags and ignores duplicate tag IDs", async () => {
    const store = createMemoryStore();
    const footage = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ tagIds: [TAG_A, TAG_B, TAG_A] }),
      ),
      store,
    });

    expect(footage.tagIds).toEqual([TAG_A, TAG_B]);
  });

  it("rejects missing Category and unknown Tag", async () => {
    const store = createMemoryStore();

    await expect(
      createDraftFootage({
        input: createDraftFootageInputSchema.parse(
          validCreateBody({ categoryId: UNKNOWN_CATEGORY }),
        ),
        store,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    await expect(
      createDraftFootage({
        input: createDraftFootageInputSchema.parse(
          validCreateBody({ tagIds: [TAG_A, UNKNOWN_TAG] }),
        ),
        store,
      }),
    ).rejects.toBeInstanceOf(TagNotFoundError);

    expect(store.footageById.size).toBe(0);
  });

  it("rejects duplicate slug", async () => {
    const store = createMemoryStore();
    const input = createDraftFootageInputSchema.parse(validCreateBody());

    await createDraftFootage({ input, store });

    await expect(createDraftFootage({ input, store })).rejects.toBeInstanceOf(
      FootageSlugConflictError,
    );
  });
});

describe("updateFootageMetadata", () => {
  it("updates metadata, price, Category, and replaces Tags", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ tagIds: [TAG_A] }),
      ),
      store,
    });
    const updated = await updateFootageMetadata({
      footageId: created.id,
      input: updateFootageMetadataInputSchema.parse(
        validCreateBody({
          titleFa: "عنوان جدید",
          slug: "new-slug",
          descriptionFa: "توضیح جدید",
          priceToman: 250_000,
          categoryId: CATEGORY_B,
          tagIds: [TAG_B, TAG_C],
        }),
      ),
      store,
    });

    expect(updated.titleFa).toBe("عنوان جدید");
    expect(updated.slug).toBe("new-slug");
    expect(updated.priceToman).toBe(250_000);
    expect(Number.isInteger(updated.priceToman)).toBe(true);
    expect(updated.categoryId).toBe(CATEGORY_B);
    expect(updated.tagIds).toEqual([TAG_B, TAG_C]);
    expect(updated.status).toBe("DRAFT");
  });

  it("rejects invalid Category/Tag without partial relationship changes", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ tagIds: [TAG_A, TAG_B] }),
      ),
      store,
    });
    await expect(
      updateFootageMetadata({
        footageId: created.id,
        input: updateFootageMetadataInputSchema.parse(
          validCreateBody({
            categoryId: UNKNOWN_CATEGORY,
            tagIds: [TAG_C],
          }),
        ),
        store,
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    await expect(
      updateFootageMetadata({
        footageId: created.id,
        input: updateFootageMetadataInputSchema.parse(
          validCreateBody({ tagIds: [TAG_C, UNKNOWN_TAG] }),
        ),
        store,
      }),
    ).rejects.toBeInstanceOf(TagNotFoundError);

    const unchanged = await store.findById(created.id);
    expect(unchanged?.categoryId).toBe(CATEGORY_A);
    expect(unchanged?.tagIds).toEqual([TAG_A, TAG_B]);
  });

  it("rejects duplicate slug on update", async () => {
    const store = createMemoryStore();
    await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ slug: "taken-slug" }),
      ),
      store,
    });
    const other = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ slug: "other-slug" }),
      ),
      store,
    });

    await expect(
      updateFootageMetadata({
        footageId: other.id,
        input: updateFootageMetadataInputSchema.parse(
          validCreateBody({ slug: "taken-slug" }),
        ),
        store,
      }),
    ).rejects.toBeInstanceOf(FootageSlugConflictError);
  });
});

describe("publishFootage and unpublishFootage", () => {
  it("rejects publication when no stored cover exists", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });
    store.previewStatusByFootage.set(created.id, "READY");

    await expect(
      publishFootage({ footageId: created.id, store }),
    ).rejects.toBeInstanceOf(FootageCoverNotReadyError);
  });

  it.each(["INITIATED", "FAILED", "ABORTED"] as const)(
    "rejects publication when preview status is %s",
    async (status) => {
      const store = createMemoryStore();
      const created = await createDraftFootage({
        input: createDraftFootageInputSchema.parse(validCreateBody()),
        store,
      });
      setPreviewStatus(store, created.id, status);

      await expect(
        publishFootage({ footageId: created.id, store }),
      ).rejects.toBeInstanceOf(FootagePreviewNotReadyError);
    },
  );

  it("rejects publication when no preview exists", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });

    await expect(
      publishFootage({ footageId: created.id, store }),
    ).rejects.toBeInstanceOf(FootagePreviewNotReadyError);
  });

  it("publishes a valid draft, sets publishedAt, and does not require Tags", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });
    markPreviewReady(store, created.id);
    const publishedAt = new Date("2026-10-05T15:00:00.000Z");

    const published = await publishFootage({
      footageId: created.id,
      store,
      now: publishedAt,
    });

    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt?.toISOString()).toBe(
      publishedAt.toISOString(),
    );
    expect(published.tagIds).toEqual([]);
  });

  it("keeps publishedAt on repeated publish", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });
    markPreviewReady(store, created.id);
    const firstAt = new Date("2026-10-05T15:00:00.000Z");
    const secondAt = new Date("2026-10-05T16:00:00.000Z");

    await publishFootage({ footageId: created.id, store, now: firstAt });
    const again = await publishFootage({
      footageId: created.id,
      store,
      now: secondAt,
    });

    expect(again.status).toBe("PUBLISHED");
    expect(again.publishedAt?.toISOString()).toBe(firstAt.toISOString());
  });

  it("unpublishes to DRAFT with null publishedAt and keeps relationships", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(
        validCreateBody({ tagIds: [TAG_A, TAG_B] }),
      ),
      store,
    });
    markPreviewReady(store, created.id);
    await publishFootage({
      footageId: created.id,
      store,
      now: new Date("2026-10-05T15:00:00.000Z"),
    });

    const unpublished = await unpublishFootage({
      footageId: created.id,
      store,
    });

    expect(unpublished.status).toBe("DRAFT");
    expect(unpublished.publishedAt).toBeNull();
    expect(unpublished.tagIds).toEqual([TAG_A, TAG_B]);
    expect(unpublished.categoryId).toBe(CATEGORY_A);
  });

  it("repeated unpublish is safe", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });

    const first = await unpublishFootage({ footageId: created.id, store });
    const second = await unpublishFootage({ footageId: created.id, store });

    expect(first.status).toBe("DRAFT");
    expect(second.status).toBe("DRAFT");
    expect(second.publishedAt).toBeNull();
  });

  it("does not unpublish merely because metadata changes on a published item", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });
    markPreviewReady(store, created.id);
    const publishedAt = new Date("2026-10-05T15:00:00.000Z");
    await publishFootage({ footageId: created.id, store, now: publishedAt });

    const updated = await updateFootageMetadata({
      footageId: created.id,
      input: updateFootageMetadataInputSchema.parse(
        validCreateBody({ titleFa: "عنوان منتشرشده ویرایش‌شده" }),
      ),
      store,
    });

    expect(updated.status).toBe("PUBLISHED");
    expect(updated.publishedAt?.toISOString()).toBe(publishedAt.toISOString());
  });
});

describe("Admin Footage authorization boundary", () => {
  it("allows Admin create and denies anonymous and non-admin callers", async () => {
    const store = createMemoryStore();
    const body = validCreateBody({ slug: "admin-create" });

    const allowed = await handleAdminCreateDraftFootage({
      admin: ADMIN,
      body,
      store,
    });
    expect(allowed.status).toBe("ok");
    if (allowed.status === "ok") {
      expect(allowed.footage.status).toBe("DRAFT");
      expect(allowed.footage.publishedAt).toBeNull();
    }

    const anonymous = await handleAdminCreateDraftFootage({
      admin: ANONYMOUS,
      body: validCreateBody({ slug: "anon-create" }),
      store,
    });
    expect(anonymous).toEqual({ status: "denied" });

    // A customer session is not an Admin session; resolveCurrentAdmin yields anonymous.
    expect(store.footageById.size).toBe(1);
  });

  it("denies anonymous publish and unpublish", async () => {
    const store = createMemoryStore();
    const created = await createDraftFootage({
      input: createDraftFootageInputSchema.parse(validCreateBody()),
      store,
    });

    await expect(
      handleAdminPublishFootage({
        admin: ANONYMOUS,
        footageId: created.id,
        store,
      }),
    ).resolves.toEqual({ status: "denied" });

    await expect(
      handleAdminUnpublishFootage({
        admin: ANONYMOUS,
        footageId: created.id,
        store,
      }),
    ).resolves.toEqual({ status: "denied" });

    const row = await store.findById(created.id);
    expect(row?.status).toBe("DRAFT");
  });

  it("allows Admin update/publish/unpublish and maps safe HTTP responses", async () => {
    const store = createMemoryStore();
    const created = await handleAdminCreateDraftFootage({
      admin: ADMIN,
      body: validCreateBody({ slug: "http-map" }),
      store,
    });
    expect(created.status).toBe("ok");
    if (created.status !== "ok") {
      throw new Error("expected create ok");
    }

    const updated = await handleAdminUpdateFootageMetadata({
      admin: ADMIN,
      footageId: created.footage.id,
      body: validCreateBody({
        slug: "http-map",
        priceToman: 99_000,
        tagIds: [TAG_A],
      }),
      store,
    });
    expect(updated.status).toBe("ok");

    markPreviewReady(store, created.footage.id);

    const published = await handleAdminPublishFootage({
      admin: ADMIN,
      footageId: created.footage.id,
      store,
      now: new Date("2026-10-05T18:00:00.000Z"),
    });
    expect(published.status).toBe("ok");

    const unpublished = await handleAdminUnpublishFootage({
      admin: ADMIN,
      footageId: created.footage.id,
      store,
    });
    expect(unpublished.status).toBe("ok");

    const deniedResponse = adminFootageMutationResponse({ status: "denied" });
    expect(deniedResponse.status).toBe(401);

    const conflictResponse = adminFootageMutationResponse({
      status: "footage_slug_conflict",
    });
    expect(conflictResponse.status).toBe(409);
  });

  it("does not create PUBLISHED Footage from create input fields", async () => {
    const store = createMemoryStore();
    const result = await handleAdminCreateDraftFootage({
      admin: ADMIN,
      body: {
        ...validCreateBody({ slug: "no-direct-publish" }),
        status: "PUBLISHED",
        publishedAt: "2026-10-05T18:00:00.000Z",
      },
      store,
    });

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.footage.status).toBe("DRAFT");
      expect(result.footage.publishedAt).toBeNull();
    }
  });
});
