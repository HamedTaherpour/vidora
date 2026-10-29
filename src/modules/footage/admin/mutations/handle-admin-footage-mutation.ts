import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
  type AdminAuthorizationContext,
  type RequiredAdmin,
} from "@/modules/auth/authorization/authorization";
import {
  AdminFootageValidationError,
  CategoryNotFoundError,
  FootageNotFoundError,
  FootageNotReadyToPublishError,
  FootagePreviewNotReadyError,
  FootageCoverNotReadyError,
  FootageSlugConflictError,
  TagNotFoundError,
} from "@/modules/footage/admin/mutations/admin-footage-errors";
import {
  createDraftFootageInputSchema,
  footageIdSchema,
  updateFootageMetadataInputSchema,
} from "@/modules/footage/admin/mutations/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin/mutations/admin-footage-store";
import type { FootagePublicationStatus } from "@/modules/footage/footage-publication-status";
import { createDraftFootage } from "@/modules/footage/admin/mutations/create-draft-footage";
import { publishFootage } from "@/modules/footage/admin/mutations/publish-footage";
import { unpublishFootage } from "@/modules/footage/admin/mutations/unpublish-footage";
import { updateFootageMetadata } from "@/modules/footage/admin/mutations/update-footage-metadata";

export type AdminFootagePublicRecord = {
  id: string;
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  status: FootagePublicationStatus;
  categoryId: string;
  tagIds: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminFootageMutationResult =
  | { status: "ok"; footage: AdminFootagePublicRecord }
  | { status: "denied" }
  | { status: "invalid_input" }
  | { status: "footage_slug_conflict" }
  | { status: "category_not_found" }
  | { status: "tag_not_found" }
  | { status: "footage_not_found" }
  | { status: "footage_not_ready_to_publish" }
  | { status: "footage_preview_not_ready" }
  | { status: "footage_cover_not_ready" };

function toPublicFootage(
  footage: AdminFootageRecord,
): AdminFootagePublicRecord {
  return {
    id: footage.id,
    titleFa: footage.titleFa,
    slug: footage.slug,
    descriptionFa: footage.descriptionFa,
    priceToman: footage.priceToman,
    status: footage.status,
    categoryId: footage.categoryId,
    tagIds: footage.tagIds,
    publishedAt: footage.publishedAt?.toISOString() ?? null,
    createdAt: footage.createdAt.toISOString(),
    updatedAt: footage.updatedAt.toISOString(),
  };
}

function requireAdminOrDenied(
  admin: AdminAuthorizationContext,
): RequiredAdmin | null {
  try {
    return requireAuthenticatedAdmin(admin);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return null;
    }

    throw error;
  }
}

function mapApplicationError(error: unknown): AdminFootageMutationResult {
  if (error instanceof AdminFootageValidationError) {
    return { status: "invalid_input" };
  }

  if (error instanceof FootageSlugConflictError) {
    return { status: "footage_slug_conflict" };
  }

  if (error instanceof CategoryNotFoundError) {
    return { status: "category_not_found" };
  }

  if (error instanceof TagNotFoundError) {
    return { status: "tag_not_found" };
  }

  if (error instanceof FootageNotFoundError) {
    return { status: "footage_not_found" };
  }

  if (error instanceof FootageNotReadyToPublishError) {
    return { status: "footage_not_ready_to_publish" };
  }

  if (error instanceof FootagePreviewNotReadyError) {
    return { status: "footage_preview_not_ready" };
  }

  if (error instanceof FootageCoverNotReadyError) {
    return { status: "footage_cover_not_ready" };
  }

  throw error;
}

async function runAuthorizedMutation({
  admin,
  run,
}: {
  admin: AdminAuthorizationContext;
  run: () => Promise<AdminFootageRecord>;
}): Promise<AdminFootageMutationResult> {
  if (!requireAdminOrDenied(admin)) {
    return { status: "denied" };
  }

  try {
    const footage = await run();
    return { status: "ok", footage: toPublicFootage(footage) };
  } catch (error) {
    return mapApplicationError(error);
  }
}

export type HandleAdminCreateDraftFootageParams = {
  admin: AdminAuthorizationContext;
  body: unknown;
  store: AdminFootageStore;
};

/**
 * Admin-gated create-draft boundary.
 * A customer or anonymous session resolves as denied Admin and cannot create.
 */
export async function handleAdminCreateDraftFootage({
  admin,
  body,
  store,
}: HandleAdminCreateDraftFootageParams): Promise<AdminFootageMutationResult> {
  const parsed = createDraftFootageInputSchema.safeParse(body);

  if (!parsed.success) {
    if (!requireAdminOrDenied(admin)) {
      return { status: "denied" };
    }

    return { status: "invalid_input" };
  }

  return runAuthorizedMutation({
    admin,
    run: () => createDraftFootage({ input: parsed.data, store }),
  });
}

export type HandleAdminUpdateFootageMetadataParams = {
  admin: AdminAuthorizationContext;
  footageId: string;
  body: unknown;
  store: AdminFootageStore;
};

/**
 * Admin-gated metadata update boundary.
 * Path `footageId` is authoritative; body carries editable metadata only.
 */
export async function handleAdminUpdateFootageMetadata({
  admin,
  footageId,
  body,
  store,
}: HandleAdminUpdateFootageMetadataParams): Promise<AdminFootageMutationResult> {
  const idParsed = footageIdSchema.safeParse(footageId);
  const bodyParsed = updateFootageMetadataInputSchema.safeParse(body);

  if (!idParsed.success || !bodyParsed.success) {
    if (!requireAdminOrDenied(admin)) {
      return { status: "denied" };
    }

    return { status: "invalid_input" };
  }

  return runAuthorizedMutation({
    admin,
    run: () =>
      updateFootageMetadata({
        footageId: idParsed.data,
        input: bodyParsed.data,
        store,
      }),
  });
}

export type HandleAdminPublishFootageParams = {
  admin: AdminAuthorizationContext;
  footageId: string;
  store: AdminFootageStore;
  now?: Date;
};

export async function handleAdminPublishFootage({
  admin,
  footageId,
  store,
  now,
}: HandleAdminPublishFootageParams): Promise<AdminFootageMutationResult> {
  const idParsed = footageIdSchema.safeParse(footageId);

  if (!idParsed.success) {
    if (!requireAdminOrDenied(admin)) {
      return { status: "denied" };
    }

    return { status: "invalid_input" };
  }

  return runAuthorizedMutation({
    admin,
    run: () =>
      publishFootage({
        footageId: idParsed.data,
        store,
        now,
      }),
  });
}

export type HandleAdminUnpublishFootageParams = {
  admin: AdminAuthorizationContext;
  footageId: string;
  store: AdminFootageStore;
};

export async function handleAdminUnpublishFootage({
  admin,
  footageId,
  store,
}: HandleAdminUnpublishFootageParams): Promise<AdminFootageMutationResult> {
  const idParsed = footageIdSchema.safeParse(footageId);

  if (!idParsed.success) {
    if (!requireAdminOrDenied(admin)) {
      return { status: "denied" };
    }

    return { status: "invalid_input" };
  }

  return runAuthorizedMutation({
    admin,
    run: () =>
      unpublishFootage({
        footageId: idParsed.data,
        store,
      }),
  });
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Map Admin Footage mutation results to safe HTTP responses.
 * Never includes Prisma errors, SQLSTATE, constraint names, or stacks.
 */
export function adminFootageMutationResponse(
  result: AdminFootageMutationResult,
): Response {
  switch (result.status) {
    case "ok":
      return Response.json(result, { status: 200, headers: NO_STORE });
    case "denied":
      return Response.json(
        { status: "denied" },
        { status: 401, headers: NO_STORE },
      );
    case "invalid_input":
      return Response.json(
        { status: "invalid_input" },
        { status: 400, headers: NO_STORE },
      );
    case "footage_slug_conflict":
      return Response.json(
        { status: "footage_slug_conflict" },
        { status: 409, headers: NO_STORE },
      );
    case "category_not_found":
      return Response.json(
        { status: "category_not_found" },
        { status: 400, headers: NO_STORE },
      );
    case "tag_not_found":
      return Response.json(
        { status: "tag_not_found" },
        { status: 400, headers: NO_STORE },
      );
    case "footage_not_found":
      return Response.json(
        { status: "footage_not_found" },
        { status: 404, headers: NO_STORE },
      );
    case "footage_not_ready_to_publish":
      return Response.json(
        { status: "footage_not_ready_to_publish" },
        { status: 400, headers: NO_STORE },
      );
    case "footage_preview_not_ready":
      return Response.json(
        { status: "footage_preview_not_ready" },
        { status: 400, headers: NO_STORE },
      );
    case "footage_cover_not_ready":
      return Response.json(
        { status: "footage_cover_not_ready" },
        { status: 400, headers: NO_STORE },
      );
  }
}
