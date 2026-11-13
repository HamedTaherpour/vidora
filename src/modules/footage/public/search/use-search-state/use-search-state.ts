import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";

import {
  getSearchActiveFilterCount,
  mergeSearchQuery,
  serializeSearchQuery,
  type SearchQuery,
} from "../search";
import { getSearchSliderValues } from "../search.utils";
import type { UseSearchStateParams } from "./use-search-state.types";

/** Owns Search draft state, URL synchronization, debounce, and filter actions. */
export function useSearchState({ query, priceBounds }: UseSearchStateParams) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(query.query);
  const [priceDraft, setPriceDraft] = useState<[number, number]>(() =>
    getSearchSliderValues(query, priceBounds),
  );
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRevisionRef = useRef(0);
  const latestQueryRef = useRef(query);
  const pendingQueryRef = useRef<string | null>(null);
  const activeFilterCount = getSearchActiveFilterCount(query);

  useEffect(() => {
    const serializedQuery = serializeSearchQuery(query);
    if (
      pendingQueryRef.current !== null &&
      pendingQueryRef.current !== serializedQuery
    ) {
      return;
    }
    latestQueryRef.current = query;
    pendingQueryRef.current = null;
    setSearchDraft(query.query);
    setPriceDraft(getSearchSliderValues(query, priceBounds));
  }, [priceBounds, query]);

  useEffect(() => {
    const handlePopState = () => {
      pendingQueryRef.current = null;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function cancelPendingSearch() {
    searchRevisionRef.current += 1;
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }

  const replaceDiscoveryState = useCallback(
    (overrides: Partial<SearchQuery>) => {
      cancelPendingSearch();
      const nextQuery = mergeSearchQuery(
        { ...latestQueryRef.current, query: searchDraft },
        overrides,
      );
      const next = serializeSearchQuery(nextQuery);
      const current = serializeSearchQuery(query);
      if (next !== current) {
        latestQueryRef.current = nextQuery;
        pendingQueryRef.current = next;
        startTransition(() => router.replace(next ? `?${next}` : "?"));
      }
    },
    [query, router, searchDraft, startTransition],
  );

  useEffect(() => {
    if (searchDraft === query.query) return;
    const revision = searchRevisionRef.current;
    searchTimerRef.current = setTimeout(() => {
      if (revision !== searchRevisionRef.current) return;
      replaceDiscoveryState({ query: searchDraft });
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query, replaceDiscoveryState, searchDraft]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    replaceDiscoveryState({});
  }

  function handlePriceCommit(value: [number, number]) {
    replaceDiscoveryState({
      minPrice: value[0] <= priceBounds.min ? undefined : value[0],
      maxPrice: value[1] >= priceBounds.max ? undefined : value[1],
    });
  }

  function handlePriceReset() {
    setPriceDraft([priceBounds.min, priceBounds.max]);
    replaceDiscoveryState({ minPrice: undefined, maxPrice: undefined });
  }

  function handleRemoveFilter(filter: keyof SearchQuery) {
    if (filter === "minPrice" || filter === "maxPrice")
      return handlePriceReset();
    if (filter === "query") {
      setSearchDraft("");
      return replaceDiscoveryState({ query: "" });
    }
    if (filter === "category") return replaceDiscoveryState({ category: "" });
    if (filter === "duration")
      return replaceDiscoveryState({ duration: "all" });
    if (filter === "sort") replaceDiscoveryState({ sort: "relevance" });
  }

  return {
    activeFilterCount,
    handleFilterSubmit,
    handlePriceCommit,
    handlePriceReset,
    handleRemoveFilter,
    mobileFiltersOpen,
    isPending,
    priceDraft,
    replaceDiscoveryState,
    searchDraft,
    setMobileFiltersOpen,
    setPriceDraft,
    setSearchDraft,
  };
}
