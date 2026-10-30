import type { AdminFootagePreviewSummary } from "@/modules/media/previews/admin-footage-preview-store";
import type { FootagePublicationStatus } from "@/modules/footage/footage-publication-status";

export type AdminFootagePreviewSectionProps = {
  footageId: string;
  status: FootagePublicationStatus;
  preview: AdminFootagePreviewSummary;
};
