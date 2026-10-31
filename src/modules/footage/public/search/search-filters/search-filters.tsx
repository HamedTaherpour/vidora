import { SearchCategoryField } from "../category-field/category-field";
import { SearchDurationField } from "../duration-field/duration-field";
import { SearchPriceFields } from "../price-fields/price-fields";
import type { SearchFiltersProps } from "./search-filters.types";
import { SearchField } from "../search-field/search-field";
import { SearchSortField } from "../sort-field/sort-field";

export function SearchFilters(props: SearchFiltersProps) {
  const {
    query,
    categories,
    priceBounds,
    priceValue,
    idPrefix,
    onSubmit,
    className,
    ...handlers
  } = props;

  return (
    <form className={className} onSubmit={onSubmit}>
      <SearchField
        query={query.query}
        id={`${idPrefix}-search`}
        onChange={handlers.onSearchChange}
      />
      <SearchCategoryField
        query={query}
        categories={categories}
        id={`${idPrefix}-category`}
        onChange={handlers.onCategoryChange}
      />
      <SearchPriceFields
        query={query}
        priceBounds={priceBounds}
        value={priceValue}
        id={`${idPrefix}-price-range`}
        onChange={handlers.onPriceChange}
        onCommit={handlers.onPriceCommit}
        onReset={handlers.onPriceReset}
      />
      <SearchDurationField
        query={query}
        id={`${idPrefix}-duration`}
        onChange={handlers.onDurationChange}
      />
      <SearchSortField
        query={query}
        id={`${idPrefix}-sort`}
        onChange={handlers.onSortChange}
      />
    </form>
  );
}
