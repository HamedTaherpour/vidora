import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export function HomeSearchForm() {
  return (
    <form
      action="/search"
      method="get"
      className="flex flex-col gap-3 rounded-surface border-line border-border bg-card/90 p-3 shadow-surface sm:flex-row"
    >
      <label htmlFor="hero-search" className="sr-only">
        جست‌وجوی فوتیج
      </label>
      <SearchInput
        id="hero-search"
        name="q"
        placeholder="مثلاً تهران در شب، طبیعت، موج…"
        aria-label="جست‌وجوی فوتیج"
      />
      <Button type="submit" size="lg" className="min-h-12">
        <span>جست‌وجو</span>
        <ArrowLeft aria-hidden="true" />
      </Button>
    </form>
  );
}
