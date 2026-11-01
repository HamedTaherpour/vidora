import { Field, FieldLabel } from "@/components/ui/field";
import { AppSelect } from "@/components/app/app-select/app-select";

import { SEARCH_SORTS, type SearchSort } from "../search";
import { searchSortLabels } from "../search-filters/search-filters.constants";
import type { SearchSortFieldProps } from "./sort-field.types";

export function SearchSortField(props: SearchSortFieldProps) {
  const { query, id, icon, onChange } = props;

  function handleChange(value: string | null) {
    if (value && SEARCH_SORTS.includes(value as SearchSort)) {
      onChange(value as SearchSort);
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}مرتب‌سازی</FieldLabel>
      <AppSelect
        name="sort"
        id={id}
        value={query.sort}
        onValueChange={handleChange}
        options={Object.entries(searchSortLabels).map(([value, label]) => ({
          value,
          label,
        }))}
        className="w-full"
      />
    </Field>
  );
}
