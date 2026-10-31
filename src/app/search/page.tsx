import type { Metadata } from "next";

import { FootageExplorerView } from "@/modules/footage/public/explorer/footage-explorer-view";
import { preparePublicFootageExplorer } from "@/modules/footage/public/explorer/prepare-public-footage-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "جست‌وجوی فوتیج | ویدورا",
  description: "جست‌وجو و فیلتر فوتیج‌های حرفه‌ای ویدورا.",
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams;
  const { categories, priceBounds, query, result } =
    preparePublicFootageExplorer(params);

  return (
    <FootageExplorerView
      variant="classic"
      query={query}
      categories={categories}
      priceBounds={priceBounds}
      footage={result.items}
      filteredCount={result.filteredCount}
      totalPages={result.totalPages}
    />
  );
}
