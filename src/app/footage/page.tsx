import type { Metadata } from "next";

import { serializeFootageExplorerQuery } from "@/modules/footage/public/explorer/footage-explorer";
import { FootageExplorerView } from "@/modules/footage/public/explorer/footage-explorer-view";
import { preparePublicFootageExplorer } from "@/modules/footage/public/explorer/prepare-public-footage-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "کشف فوتیج | ویدورا",
  description: "جست‌وجو و فیلتر فوتیج‌های حرفه‌ای ویدورا.",
};

type FootageExplorerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FootageExplorerPage({
  searchParams,
}: FootageExplorerPageProps) {
  const params = await searchParams;
  const { categories, query, result } = preparePublicFootageExplorer(params);

  return (
    <FootageExplorerView
      key={serializeFootageExplorerQuery(query)}
      variant="classic"
      query={query}
      categories={categories}
      footage={result.items}
      filteredCount={result.filteredCount}
      totalPages={result.totalPages}
    />
  );
}
