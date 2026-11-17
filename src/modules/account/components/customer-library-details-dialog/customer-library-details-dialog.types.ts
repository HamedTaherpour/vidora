import type { CustomerLibraryPreviewItem } from "../../customer-library-preview.types";

export type CustomerLibraryDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: CustomerLibraryPreviewItem;
};

export type CustomerLibraryDetailValueProps = {
  label: string;
  value: string;
};
