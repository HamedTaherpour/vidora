import { HomeBenefits } from "./home-benefits";
import { HomeCategoryDiscovery } from "./home-category-discovery";
import { HomeFaq } from "./home-faq";
import { homeFaqItems } from "./home-page.constants";
import { HomeFooter } from "./home-footer";
import { HomeGallery } from "./home-gallery";
import { HomeHeader } from "./home-header";
import { HomeHero } from "./home-hero";
import { HomeSeoContent } from "./home-seo-content";
import type { HomePageProps } from "./home-page.types";

export function HomePage(props: HomePageProps) {
  const { footage, categories, page, totalPages, dataError, fixtureMode } =
    props;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HomeHeader
        categories={categories}
        className="border-b border-border/70 bg-background/90 backdrop-blur-sm"
      />
      <HomeHero />
      <HomeGallery
        footage={footage}
        page={page}
        totalPages={totalPages}
        dataError={dataError}
        fixtureMode={fixtureMode}
      />
      <HomeCategoryDiscovery
        categories={categories}
        fixtureMode={fixtureMode}
      />
      <HomeBenefits />
      <HomeFaq
        items={homeFaqItems.map((item, index) => ({
          id: `faq-${index + 1}`,
          title: item.question,
          content: item.answer,
        }))}
      />
      <HomeSeoContent />
      <HomeFooter categories={categories} />
    </main>
  );
}
