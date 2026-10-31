import type { Metadata } from "next";

import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { prepareSearch } from "@/modules/footage/public/search/prepare-search";
import { SearchView } from "@/modules/footage/public/search/search-view/search-view";

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
  const { categories, priceBounds, query, result } = prepareSearch(params);

  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={categories} />
      <SearchView
        query={query}
        categories={categories}
        priceBounds={priceBounds}
        footage={result.items}
        filteredCount={result.filteredCount}
        totalPages={result.totalPages}
      />
      <PublicSiteFooter />
    </div>
  );
}
