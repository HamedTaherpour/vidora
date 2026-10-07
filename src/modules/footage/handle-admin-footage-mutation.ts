import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
  type RequiredAdmin,
} from "@/modules/auth/authorization";
import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import {
  AdminFootageValidationError,
  CategoryNotFoundError,
  FootageNotFoundError,
  FootageNotReadyToPublishError,
  FootageSlugConflictError,
  TagNotFoundError,
} from "@/modules/footage/admin-footage-errors";
import {
  createDraftFootageInputSchema,
  footageIdSchema,
  updateFootageMetadataInputSchema,
} from "@/modules/footage/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";
import { createDraftFootage } from "@/modules/footage/create-draft-footage";
import { publishFootage } from "@/modules/footage/publish-footage";
import { unpublishFootage } from "@/modules/footage/unpublish-footage";
import { updateFootageMetadata } from "@/modules/footage/update-footage-metadata";

export type AdminFootagePublicRecord = {
  id: string;
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  status: "DRAFT" | "PUBLISHED";
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
  | { status: "footage_not_ready_to_publish" };

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

function requireAdminOrDenied(admin: ResolvedAdmin): RequiredAdmin | null {
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

  throw error;
}

async function runAuthorizedMutation({
  admin,
  run,
}: {
  admin: ResolvedAdmin;
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

/**
 * Admin-gated create-draft boundary.
 * A customer or anonymous session resolves as denied Admin and cannot create.
 */
export async function handleAdminCreateDraftFootage({
  admin,
  body,
  store,
}: {
  admin: ResolvedAdmin;
  body: unknown;
  store: AdminFootageStore;
}): Promise<AdminFootageMutationResult> {
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

/**
 * Admin-gated metadata update boundary.
 * Path `footageId` is authoritative; body carries editable metadata only.
 */
export async function handleAdminUpdateFootageMetadata({
  admin,
  footageId,
  body,
  store,
}: {
  admin: ResolvedAdmin;
  footageId: string;
  body: unknown;
  store: AdminFootageStore;
}): Promise<AdminFootageMutationResult> {
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

export async function handleAdminPublishFootage({
  admin,
  footageId,
  store,
  now,
}: {
  admin: ResolvedAdmin;
  footageId: string;
  store: AdminFootageStore;
  now?: Date;
}): Promise<AdminFootageMutationResult> {
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

export async function handleAdminUnpublishFootage({
  admin,
  footageId,
  store,
}: {
  admin: ResolvedAdmin;
  footageId: string;
  store: AdminFootageStore;
}): Promise<AdminFootageMutationResult> {
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
  }
}
