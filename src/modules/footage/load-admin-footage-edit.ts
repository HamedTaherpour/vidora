import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
} from "@/modules/auth/authorization";
import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import { footageIdSchema } from "@/modules/footage/admin-footage-input";
import type {
  AdminFootageRecord,
  AdminFootageStore,
} from "@/modules/footage/admin-footage-store";
import type {
  AdminFootagePreviewStore,
  AdminFootagePreviewSummary,
} from "@/modules/media/admin-footage-preview-store";

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
  categories: AdminClassificationOption[];
  tags: AdminClassificationOption[];
};

export type AdminFootageEditLoadResult =
  | { status: "ok"; data: AdminFootageEditPageData }
  | { status: "denied" }
  | { status: "invalid_input" }
  | { status: "footage_not_found" };

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
}: {
  admin: ResolvedAdmin;
  footageId: string;
  store: AdminFootageStore;
  optionsStore: AdminFootageEditOptionsStore;
  previewStore?: AdminFootagePreviewStore;
}): Promise<AdminFootageEditLoadResult> {
  try {
    requireAuthenticatedAdmin(admin);
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

  return {
    status: "ok",
    data: {
      footage,
      preview,
      categories,
      tags,
    },
  };
}
