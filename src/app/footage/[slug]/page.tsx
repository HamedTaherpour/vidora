import { notFound } from "next/navigation";

import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { FootageDetailPage } from "@/modules/footage/public/detail/components/footage-detail-preview-page";
import {
  preparePublicFootageCategories,
  preparePublicFootageDetail,
} from "@/modules/footage/public/detail/prepare-public-footage-detail";

export const dynamic = "force-dynamic";

type FootagePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ scenario?: string }>;
};

export default async function FootagePage(props: FootagePageProps) {
  const [{ slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const decodedSlug = decodeURIComponent(slug);
  const footage = preparePublicFootageDetail(
    decodedSlug,
    searchParams.scenario === "unavailable" ? "unavailable" : "ready",
  );
  if (!footage) notFound();

  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={preparePublicFootageCategories()} />
      <main className="container-storefront py-10 md:py-16">
        <FootageDetailPage footage={footage} />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
