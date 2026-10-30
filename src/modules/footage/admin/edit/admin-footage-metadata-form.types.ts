import type { AdminClassificationOption } from "./load-admin-footage-edit";
import type { AdminFootageRecord } from "@/modules/footage/admin/mutations/admin-footage-store";

export type AdminFootageMetadataFormProps = {
  footage: AdminFootageRecord;
  categories: AdminClassificationOption[];
  tags: AdminClassificationOption[];
};
