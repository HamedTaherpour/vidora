import { notFound } from "next/navigation";

import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import {
  preparePublicFootageCategories,
  preparePublicFootageDetail,
} from "@/modules/footage/public/detail/prepare-public-footage-detail";
import { PurchaseJourneyPage } from "@/modules/footage/public/purchase-journey/purchase-journey-page";
import {
  purchaseJourneyStates,
  type PurchaseJourneyState,
} from "@/modules/footage/public/purchase-journey/purchase-journey.types";

export const dynamic = "force-dynamic";

type PurchasePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ state?: string; customer?: string }>;
};

function selectState(value: string | undefined): PurchaseJourneyState {
  return value && (purchaseJourneyStates as readonly string[]).includes(value)
    ? (value as PurchaseJourneyState)
    : "review";
}

export default async function PurchasePage(props: PurchasePageProps) {
  const [{ slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  const footage = preparePublicFootageDetail(decodeURIComponent(slug), "ready");
  if (!footage || footage.cover.status !== "ready") notFound();

  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={preparePublicFootageCategories()} />
      <main className="container-storefront py-8 md:py-12">
        <PurchaseJourneyPage
          footage={footage}
          initialState={selectState(searchParams.state)}
          authenticated={searchParams.customer === "authenticated"}
        />
      </main>
      <PublicSiteFooter />
    </div>
  );
}
