import {
  AdminAuthorizationError,
  requireAdminPageAccess,
  type AdminAuthorizationContext,
} from "@/modules/auth/authorization/authorization";
import { footageIdSchema } from "@/modules/footage/admin/mutations/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin/mutations/admin-footage-store";
import type {
  AdminFootagePreviewStore,
  AdminFootagePreviewSummary,
} from "@/modules/media/previews/admin-footage-preview-store";
import type {
  AdminOriginalVariant,
  AdminOriginalVariantStore,
} from "@/modules/media/originals/admin-original-variants";

export type AdminClassificationOption = {
  id: string;
  nameFa: string;
};

export type AdminFootageEditOptionsStore = {
  listCategories: () => Promise<AdminClassificationOption[]>;
  listTags: () => Promise<AdminClassificationOption[]>;
};

export type AdminFootageEditPageData = {
  footage: AdminFootageRecord;
  preview: AdminFootagePreviewSummary;
  originalVariants: AdminOriginalVariant[];
  categories: AdminClassificationOption[];
  tags: AdminClassificationOption[];
};

export type AdminFootageEditLoadResult =
  | { status: "ok"; data: AdminFootageEditPageData }
  | { status: "denied" }
  | { status: "invalid_input" }
  | { status: "footage_not_found" };

export type LoadAdminFootageEditParams = {
  admin: AdminAuthorizationContext;
  footageId: string;
  store: AdminFootageStore;
  optionsStore: AdminFootageEditOptionsStore;
  previewStore?: AdminFootagePreviewStore;
  originalVariantStore?: AdminOriginalVariantStore;
};

/**
 * Admin-gated loader for the minimal Footage edit surface.
 * Reuses CAT-03 persistence `findById`; does not invent mutation rules.
 */
export async function loadAdminFootageEdit({
  admin,
  footageId,
  store,
  optionsStore,
  previewStore,
  originalVariantStore,
}: LoadAdminFootageEditParams): Promise<AdminFootageEditLoadResult> {
  try {
    requireAdminPageAccess(admin);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return { status: "denied" };
    }

    throw error;
  }

  const idParsed = footageIdSchema.safeParse(footageId);

  if (!idParsed.success) {
    return { status: "invalid_input" };
  }

  const footage = await store.findById(idParsed.data);

  if (!footage) {
    return { status: "footage_not_found" };
  }

  const [categories, tags] = await Promise.all([
    optionsStore.listCategories(),
    optionsStore.listTags(),
  ]);

  const preview = previewStore
    ? await previewStore.findPreviewSummary(idParsed.data)
    : {
        exists: false,
        uploadStatus: null,
        isReady: false,
        mimeType: null,
      };

  const originalVariants = originalVariantStore
    ? await originalVariantStore.listForFootage(idParsed.data)
    : [];

  return {
    status: "ok",
    data: {
      footage,
      preview,
      originalVariants,
      categories,
      tags,
    },
  };
}
