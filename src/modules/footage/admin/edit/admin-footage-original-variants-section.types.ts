import type { AdminOriginalVariant } from "@/modules/media/originals/admin-original-variants";

export type AdminFootageOriginalVariantsSectionProps = {
  footageId: string;
  originalVariants: AdminOriginalVariant[];
  saved?: boolean;
  error?: string | null;
};
