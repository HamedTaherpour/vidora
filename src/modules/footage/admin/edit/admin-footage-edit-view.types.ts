import type { AdminFootageRecord } from "@/modules/footage/admin/mutations/admin-footage-store";
import type { AdminClassificationOption } from "@/modules/footage/admin/edit/load-admin-footage-edit";
import type { AdminFootagePreviewSummary } from "@/modules/media/previews/admin-footage-preview-store";
import type { AdminOriginalVariant } from "@/modules/media/originals/admin-original-variants";

export type AdminFootageEditViewProps = {
  footage: AdminFootageRecord;
  preview: AdminFootagePreviewSummary;
  categories: AdminClassificationOption[];
  tags: AdminClassificationOption[];
  originalVariants: AdminOriginalVariant[];
  saved?: boolean;
  error?: string | null;
  variantSaved?: boolean;
  variantError?: string | null;
};
