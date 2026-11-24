"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/ui/search-input";
import {
  createCustomerLibrarySearchHref,
  getCustomerLibrarySearchQuery,
} from "../customer-library-search";

/** Keeps the library-owned search focused on the customer's purchased footage. */
export function CustomerLibrarySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = getCustomerLibrarySearchQuery(searchParams.get("q") ?? "");

  function submit(nextValue: string) {
    router.push(createCustomerLibrarySearchHref(nextValue));
  }

  return (
    <div className="w-full lg:max-w-md">
      <label htmlFor="customer-library-search" className="sr-only">
        جست‌وجو در کتابخانهٔ من
      </label>
      <SearchInput
        key={query}
        id="customer-library-search"
        aria-label="جست‌وجو در کتابخانهٔ من"
        placeholder="جست‌وجو در کتابخانهٔ من"
        defaultValue={query}
        onSearch={submit}
        debounce={500}
      />
      <p className="sr-only" aria-live="polite">
        {query ? `جست‌وجوی «${query}» در کتابخانهٔ من` : ""}
      </p>
    </div>
  );
}
