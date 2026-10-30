import { AdminFootageMetadataForm } from "./admin-footage-metadata-form";
import { AdminFootageOriginalVariantsSection } from "./admin-footage-original-variants-section";
import { AdminFootagePreviewSection } from "./admin-footage-preview-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminFootageUploadPanel } from "@/modules/media/uploads/components/admin-footage-upload-panel";
import { AdminFootageCoverPanel } from "@/modules/media/covers/components/admin-footage-cover-panel";
import type { AdminFootageEditViewProps } from "./admin-footage-edit-view.types";

/**
 * Minimal operational Admin Footage editor.
 * CAT-03 metadata fields plus the MEDIA-03 direct-upload panel.
 */
export function AdminFootageEditView(props: AdminFootageEditViewProps) {
  const {
    footage,
    preview,
    categories,
    tags,
    originalVariants,
    saved = false,
    error = null,
    variantSaved = false,
    variantError = null,
  } = props;
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
      <header className="flex flex-col gap-2">
        <p>
          <a href="/admin/footage" className="text-sm underline">
            بازگشت به فهرست
          </a>
        </p>
        <h1 className="text-2xl font-semibold">ویرایش فوتیج</h1>
        <p className="text-sm text-muted-foreground">
          وضعیت انتشار:{" "}
          {footage.status === "PUBLISHED" ? "منتشر شده" : "پیش‌نویس"}
          <span className="sr-only"> ({footage.status})</span>
        </p>
      </header>

      {saved ? <p role="status">تغییرات ذخیره شد.</p> : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>ذخیره انجام نشد ({error}).</AlertDescription>
        </Alert>
      ) : null}

      <AdminFootageMetadataForm
        footage={footage}
        categories={categories}
        tags={tags}
      />

      <AdminFootageCoverPanel footageId={footage.id} />

      <AdminFootageUploadPanel footageId={footage.id} />

      <AdminFootageOriginalVariantsSection
        footageId={footage.id}
        originalVariants={originalVariants}
        saved={variantSaved}
        error={variantError}
      />

      <AdminFootagePreviewSection
        footageId={footage.id}
        status={footage.status}
        preview={preview}
      />
    </div>
  );
}
