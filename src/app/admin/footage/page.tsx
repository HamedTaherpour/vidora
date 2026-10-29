import { prisma } from "@/lib/db/client";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";
import {
  AdminAccessDeniedView,
  AdminFootageCatalogView,
} from "@/modules/footage/admin/catalog/admin-footage-catalog-view";
import { handleAdminFootageCatalogList } from "@/modules/footage/admin/catalog/handle-admin-footage-catalog-list";
import { createPrismaAdminFootageCatalogStore } from "@/modules/footage/admin/catalog/prisma-admin-footage-catalog-store";

export const dynamic = "force-dynamic";

type AdminFootagePageProps = {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
  }>;
};

/**
 * Admin catalog list.
 * Authorization and listing run server-side through the footage module.
 */
export default async function AdminFootagePage({
  searchParams,
}: AdminFootagePageProps) {
  const admin = await resolveCurrentAdmin();
  const params = await searchParams;
  const result = await handleAdminFootageCatalogList({
    admin,
    searchParams: params,
    store: createPrismaAdminFootageCatalogStore(prisma),
  });

  if (result.status === "denied") {
    return <AdminAccessDeniedView />;
  }

  return (
    <main>
      <AdminFootageCatalogView catalog={result.catalog} />
    </main>
  );
}
