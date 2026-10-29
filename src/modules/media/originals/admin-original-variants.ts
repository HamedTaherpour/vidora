import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
  type AdminAuthorizationContext,
  type RequiredAdmin,
} from "@/modules/auth/authorization/authorization";
import { footageIdSchema } from "@/modules/footage/footage-id";
import type { FootageFileUploadStatus } from "@/modules/media/uploads/admin-media-upload-store";
import { z } from "zod";

export const originalVariantIdSchema = z.uuid();

export const updateOriginalVariantInputSchema = z
  .object({ label: z.string().trim().min(1).max(120) })
  .strict();

export type AdminOriginalVariant = {
  id: string;
  footageId: string;
  label: string;
  sizeBytes: number;
  mimeType: string;
  uploadStatus: FootageFileUploadStatus;
  width: number | null;
  height: number | null;
  fps: string | null;
  codec: string | null;
  createdAt: Date;
};

export type AdminOriginalVariantStore = {
  listForFootage: (footageId: string) => Promise<AdminOriginalVariant[]>;
  updateLabel: (
    data: UpdateAdminOriginalVariantLabelParams,
  ) => Promise<AdminOriginalVariant | null>;
};

type UpdateAdminOriginalVariantLabelParams = {
  footageId: string;
  variantId: string;
  label: string;
};

type HandleAdminUpdateOriginalVariantLabelParams = {
  admin: AdminAuthorizationContext;
  footageId: string;
  variantId: string;
  body: unknown;
  store: AdminOriginalVariantStore;
};

export type AdminOriginalVariantUpdateResult =
  | { status: "ok"; variant: AdminOriginalVariant }
  | { status: "denied" }
  | { status: "invalid_input" }
  | { status: "variant_not_found" };

function requireAdminOrDenied(
  admin: AdminAuthorizationContext,
): RequiredAdmin | null {
  try {
    return requireAuthenticatedAdmin(admin);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) return null;
    throw error;
  }
}

export async function handleAdminUpdateOriginalVariantLabel({
  admin,
  footageId,
  variantId,
  body,
  store,
}: HandleAdminUpdateOriginalVariantLabelParams): Promise<AdminOriginalVariantUpdateResult> {
  const footageParsed = footageIdSchema.safeParse(footageId);
  const variantParsed = originalVariantIdSchema.safeParse(variantId);
  const bodyParsed = updateOriginalVariantInputSchema.safeParse(body);

  if (!footageParsed.success || !variantParsed.success || !bodyParsed.success) {
    return requireAdminOrDenied(admin) === null
      ? { status: "denied" }
      : { status: "invalid_input" };
  }

  if (requireAdminOrDenied(admin) === null) return { status: "denied" };

  const variant = await store.updateLabel({
    footageId: footageParsed.data,
    variantId: variantParsed.data,
    label: bodyParsed.data.label,
  });

  return variant === null
    ? { status: "variant_not_found" }
    : { status: "ok", variant };
}
