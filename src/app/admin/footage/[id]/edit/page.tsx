import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/resolve-current-admin";
import { AdminAccessDeniedView } from "@/modules/footage/admin-footage-catalog-view";
import { AdminFootageEditView } from "@/modules/footage/admin-footage-edit-view";
import { loadAdminFootageEdit } from "@/modules/footage/load-admin-footage-edit";
import { createPrismaAdminFootageEditOptionsStore } from "@/modules/footage/prisma-admin-footage-edit-options-store";
import { createPrismaAdminFootageStore } from "@/modules/footage/prisma-admin-footage-store";
import { createPrismaAdminFootagePreviewStore } from "@/modules/media/admin-footage-preview-store";
import { createPrismaAdminOriginalVariantStore } from "@/modules/media/prisma-admin-original-variants";

export const dynamic = "force-dynamic";

type AdminFootageEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string | string[];
    error?: string | string[];
    variantSaved?: string | string[];
    variantError?: string | string[];
  }>;
};

/**
 * Minimal Admin Footage edit surface.
 * Mutations reuse CAT-03 application handlers via the server action.
 */
export default async function AdminFootageEditPage({
  params,
  searchParams,
}: AdminFootageEditPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const admin = await resolveCurrentAdmin();
  const result = await loadAdminFootageEdit({
    admin,
    footageId: id,
    store: createPrismaAdminFootageStore(prisma),
    optionsStore: createPrismaAdminFootageEditOptionsStore(prisma),
    previewStore: createPrismaAdminFootagePreviewStore(prisma),
    originalVariantStore: createPrismaAdminOriginalVariantStore(prisma),
  });

  if (result.status === "denied") {
    return <AdminAccessDeniedView />;
  }

  if (
    result.status === "invalid_input" ||
    result.status === "footage_not_found"
  ) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-xl font-semibold">فوتیج یافت نشد</h1>
        <p className="mt-2 text-sm">
          <a href="/admin/footage" className="underline">
            بازگشت به فهرست
          </a>
        </p>
      </main>
    );
  }

  const savedRaw = Array.isArray(query.saved) ? query.saved[0] : query.saved;
  const errorRaw = Array.isArray(query.error) ? query.error[0] : query.error;
  const variantSavedRaw = Array.isArray(query.variantSaved)
    ? query.variantSaved[0]
    : query.variantSaved;
  const variantErrorRaw = Array.isArray(query.variantError)
    ? query.variantError[0]
    : query.variantError;

  return (
    <main>
      <AdminFootageEditView
        footage={result.data.footage}
        preview={result.data.preview}
        originalVariants={result.data.originalVariants}
        categories={result.data.categories}
        tags={result.data.tags}
        saved={savedRaw === "1"}
        error={errorRaw ?? null}
        variantSaved={variantSavedRaw === "1"}
        variantError={variantErrorRaw ?? null}
      />
    </main>
  );
}
