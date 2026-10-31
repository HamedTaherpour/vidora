"use client";

import { Building2, Cpu, Layers, Leaf, Plane, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { HomepageSearchControlsProps } from "./homepage-search-controls.types";
import {
  createHomepageCategoryUrl,
  createHomepageClearUrl,
  createHomepageSearchUrl,
  hasHomepageClearableState,
} from "./homepage-search-controls.utils";

export {
  createHomepageCategoryUrl,
  createHomepageClearUrl,
  createHomepageSearchControlsKey,
  createHomepageSearchUrl,
  createHomepageUrl,
  hasHomepageClearableState,
} from "./homepage-search-controls.utils";

const suggestedCategoryIcons = [Leaf, Building2, Plane, Cpu] as const;

export function HomepageSearchControls(props: HomepageSearchControlsProps) {
  const { query, category, categories, scenario } = props;
  const router = useRouter();
  const [draftQuery, setDraftQuery] = useState(query);

  const hasClearableState = hasHomepageClearableState({
    query,
    category,
    draftQuery,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(createHomepageSearchUrl({ draftQuery, category, scenario }));
  }

  function handleCategoryChange(value: string) {
    router.push(
      createHomepageCategoryUrl({ query, category: value, scenario }),
    );
  }

  function handleClear() {
    setDraftQuery("");
    router.push(createHomepageClearUrl(scenario));
  }

  function handleSuggestedCategoryClick(value: string, isActive: boolean) {
    handleCategoryChange(isActive ? "" : value);
  }

  const suggestedCategories = categories.slice(0, 4);

  return (
    <Card className="w-full lg:w-4xl mx-auto block p-0">
      <CardContent className="px-3">
        <form
          action="/"
          method="get"
          onSubmit={handleSubmit}
          className="grid w-full pt-3 grid-cols-[auto_auto_minmax(0,1fr)] gap-2 sm:flex sm:items-center"
          aria-label="جست‌وجو و فیلتر فوتیج"
        >
          <label className="order-4 col-span-full flex items-center gap-2 px-3 pt-2 text-sm font-medium sm:order-none sm:col-span-auto sm:pt-0">
            <span className="sr-only">دسته‌بندی فوتیج</span>
            <Select
              value={category || "all"}
              onValueChange={(value) =>
                handleCategoryChange(
                  value === null || value === "all" ? "" : value,
                )
              }
            >
              <SelectTrigger
                data-control="category"
                aria-label="دسته‌بندی فوتیج"
                className="h-9 min-w-32 border-0 bg-transparent shadow-none"
              >
                <SelectValue placeholder="همه دسته‌بندی‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                  {categories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.labelFa}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <Separator
            orientation="vertical"
            aria-hidden="true"
            className="order-5 hidden h-8 sm:order-none sm:block my-auto"
          />
          <Input
            id="homepage-search"
            data-control="search-input"
            name="q"
            type="search"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="مثلاً: خیابان بارانی تهران"
            aria-label="جست‌وجوی فوتیج"
            className="order-1 h-11 min-w-0 w-full border-0 bg-transparent px-3 shadow-none sm:order-none"
          />
          {hasClearableState && (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              data-control="clear"
              aria-label="پاک کردن جست‌وجو و فیلترها"
              onClick={handleClear}
              className="order-2 sm:order-none"
            >
              <X aria-hidden="true" />
            </Button>
          )}
          <Button
            type="submit"
            data-control="submit"
            size="lg"
            className="order-3 gap-2 px-5 sm:order-none h-10"
          >
            <Search aria-hidden="true" data-icon="inline-start" />
            جست‌وجو
          </Button>
        </form>
        <section
          aria-labelledby="suggested-categories-heading"
          id="homepage-categories"
          className="mt-3 scroll-mt-20 flex flex-col gap-3 border-t border-border/70 py-3"
          data-slot="suggested-categories"
        >
          <div className="flex flex-row gap-x-2 items-center">
            <Layers className="size-8 text-accent bg-accent-foreground/10 rounded-full p-1.5" />
            <h2
              id="suggested-categories-heading"
              className="text-sm font-bold text-muted-foreground text-right"
            >
              دسته‌بندی‌های پیشنهادی
            </h2>
          </div>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border bg-muted px-1.5 py-1.5 sm:grid-cols-4">
            {suggestedCategories.map((option, index) => {
              const Icon = suggestedCategoryIcons[index];
              const isActive = category === option.value;

              return (
                <li key={option.value}>
                  <Button
                    type="button"
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    data-control="suggested-category"
                    data-category={option.value}
                    aria-pressed={isActive}
                    aria-label={`دسته‌بندی ${option.labelFa}`}
                    onClick={() =>
                      handleSuggestedCategoryClick(option.value, isActive)
                    }
                    className="gap-2.5 w-full"
                  >
                    <Icon aria-hidden="true" data-icon="inline-start" />
                    {option.labelFa}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
