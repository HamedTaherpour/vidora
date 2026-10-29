import { prisma } from "@/lib/db/client";
import { listPublishedFootage } from "@/modules/footage/public/catalog/list-published-footage";
import { PublicFootageListView } from "@/modules/footage/public/components/footage-list/public-footage-list-view";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const footage = await listPublishedFootage({
    store: createPrismaPublicFootageCatalogStore(prisma),
  });

  return (
    <main>
      <PublicFootageListView footage={footage} />
    </main>
  );
}
